-- Add consent tracking to profiles table
-- Run this in Supabase SQL Editor

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS medical_consent_accepted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS medical_consent_date TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.medical_consent_accepted IS 'Whether user has accepted medical disclaimer';
COMMENT ON COLUMN public.profiles.medical_consent_date IS 'Timestamp when user accepted medical disclaimer';
