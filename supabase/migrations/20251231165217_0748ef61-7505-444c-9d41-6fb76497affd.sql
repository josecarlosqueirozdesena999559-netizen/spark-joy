-- Create user_penalties table
CREATE TABLE public.user_penalties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  penalty_level INTEGER NOT NULL CHECK (penalty_level >= 1 AND penalty_level <= 3),
  reason TEXT NOT NULL,
  report_id UUID REFERENCES public.reports(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_penalties ENABLE ROW LEVEL SECURITY;

-- Users can view their own penalties
CREATE POLICY "Users can view their own penalties"
ON public.user_penalties
FOR SELECT
USING (auth.uid() = user_id);

-- Add ai_analysis and ai_decision columns to reports
ALTER TABLE public.reports 
ADD COLUMN ai_analysis TEXT,
ADD COLUMN ai_decision TEXT,
ADD COLUMN processed_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster lookups
CREATE INDEX idx_user_penalties_user_id ON public.user_penalties(user_id);
CREATE INDEX idx_user_penalties_expires_at ON public.user_penalties(expires_at);