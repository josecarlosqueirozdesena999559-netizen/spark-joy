-- Add location columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS latitude double precision,
ADD COLUMN IF NOT EXISTS longitude double precision,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text;

-- Create index for geolocation queries
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles (latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;