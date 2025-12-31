-- Create vault_items table for storing encrypted evidence
CREATE TABLE public.vault_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('photo', 'video', 'text')),
  encrypted_content TEXT, -- For text messages (encrypted)
  encrypted_file_path TEXT, -- For encrypted files in storage
  file_name TEXT,
  file_size INTEGER,
  notes TEXT, -- Additional encrypted notes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Only the owner can access their vault items
CREATE POLICY "Users can view their own vault items" 
ON public.vault_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vault items" 
ON public.vault_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vault items" 
ON public.vault_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vault items" 
ON public.vault_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_vault_items_updated_at
BEFORE UPDATE ON public.vault_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create private storage bucket for encrypted vault files
INSERT INTO storage.buckets (id, name, public) VALUES ('vault-files', 'vault-files', false);

-- Storage policies for vault files
CREATE POLICY "Users can view their own vault files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'vault-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own vault files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'vault-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own vault files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'vault-files' AND auth.uid()::text = (storage.foldername(name))[1]);