-- Add push_token column to profiles table for storing FCM/APNs tokens
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS push_token text;