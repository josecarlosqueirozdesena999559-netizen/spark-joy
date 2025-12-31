import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

interface DenunciaStats {
  total: number;
  denunciaram: number;
  percentual: number;
}

export const useDenunciaStats = () => {
  const queryClient = useQueryClient();

  // Buscar estatísticas globais
  const { data: stats, isLoading } = useQuery({
    queryKey: ['denuncia-stats'],
    queryFn: async (): Promise<DenunciaStats> => {
      const { count: total, error: totalError } = await supabase
        .from('denuncia_stats')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      const { count: denunciaram, error: denunciaramError } = await supabase
        .from('denuncia_stats')
        .select('*', { count: 'exact', head: true })
        .eq('denunciou', true);

      if (denunciaramError) throw denunciaramError;

      const totalCount = total || 0;
      const denunciaramCount = denunciaram || 0;
      const percentual = totalCount > 0 ? Math.round((denunciaramCount / totalCount) * 100) : 0;

      return {
        total: totalCount,
        denunciaram: denunciaramCount,
        percentual,
      };
    },
  });

  // Configurar Realtime para atualizar automaticamente
  useEffect(() => {
    const channel = supabase
      .channel('denuncia-stats-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'denuncia_stats',
        },
        () => {
          // Invalidar e refetch quando houver novo insert
          queryClient.invalidateQueries({ queryKey: ['denuncia-stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { stats, isLoading };
};

export const useQuestionnaireStatus = () => {
  const { user } = useAuth();

  const { data: hasAnswered, isLoading } = useQuery({
    queryKey: ['questionnaire-status', user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_onboarding')
        .select('questionnaire_answered')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching questionnaire status:', error);
        return false;
      }

      return data?.questionnaire_answered || false;
    },
    enabled: !!user,
  });

  return { hasAnswered: hasAnswered || false, isLoading };
};

export const useSubmitQuestionnaire = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { tipoAgressao: string; denunciou: boolean }) => {
      // 1. Inserir estatística anônima
      const { error: statsError } = await supabase.from('denuncia_stats').insert({
        tipo_agressao: data.tipoAgressao,
        denunciou: data.denunciou,
      });

      if (statsError) throw statsError;

      // 2. Marcar que a usuária respondeu (se logada)
      if (user) {
        // Primeiro, verificar se existe registro de onboarding
        const { data: existing } = await supabase
          .from('user_onboarding')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existing) {
          // Atualizar registro existente
          const { error: updateError } = await supabase
            .from('user_onboarding')
            .update({ questionnaire_answered: true })
            .eq('user_id', user.id);

          if (updateError) throw updateError;
        } else {
          // Criar novo registro
          const { error: insertError } = await supabase.from('user_onboarding').insert({
            user_id: user.id,
            questionnaire_answered: true,
            feed_onboarding_seen: false,
          });

          if (insertError) throw insertError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['denuncia-stats'] });
      queryClient.invalidateQueries({ queryKey: ['questionnaire-status'] });
    },
  });
};
