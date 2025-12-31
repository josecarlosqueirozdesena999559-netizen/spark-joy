-- Tabela global anônima para estatísticas de denúncia
CREATE TABLE public.denuncia_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_agressao TEXT NOT NULL,
  denunciou BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS: Qualquer usuária autenticada pode inserir (anonimamente)
ALTER TABLE public.denuncia_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert stats"
ON public.denuncia_stats
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Todos podem ver as estatísticas agregadas (leitura pública para contagem)
CREATE POLICY "Anyone can read stats for aggregation"
ON public.denuncia_stats
FOR SELECT
TO authenticated
USING (true);

-- Adicionar campo no user_onboarding para rastrear se respondeu o questionário
ALTER TABLE public.user_onboarding 
ADD COLUMN IF NOT EXISTS questionnaire_answered BOOLEAN NOT NULL DEFAULT false;

-- Habilitar realtime para a tabela de stats
ALTER PUBLICATION supabase_realtime ADD TABLE public.denuncia_stats;