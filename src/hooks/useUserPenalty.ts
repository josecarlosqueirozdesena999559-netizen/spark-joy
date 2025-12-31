import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Penalty {
  id: string;
  penalty_level: number;
  reason: string;
  expires_at: string | null;
  created_at: string;
}

export function useUserPenalty(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-penalty', userId],
    queryFn: async (): Promise<Penalty | null> => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('user_penalties')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching penalty:', error);
        return null;
      }

      if (!data) return null;

      // Check if penalty is still active
      if (data.penalty_level === 3) {
        // Level 3 is permanent
        return data as Penalty;
      }

      if (data.expires_at) {
        const expiresAt = new Date(data.expires_at);
        if (expiresAt > new Date()) {
          return data as Penalty;
        }
      }

      return null;
    },
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
  });
}
