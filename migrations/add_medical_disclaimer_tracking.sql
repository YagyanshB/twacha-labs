-- Add medical disclaimer acceptance tracking to profiles table
-- This is CRITICAL for legal protection

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS medical_disclaimer_accepted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS medical_disclaimer_date TIMESTAMPTZ;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_medical_disclaimer 
ON public.profiles(medical_disclaimer_accepted, medical_disclaimer_date);

-- Add comment explaining these fields
COMMENT ON COLUMN public.profiles.medical_disclaimer_accepted IS 'Whether user has accepted the medical disclaimer and liability waiver';
COMMENT ON COLUMN public.profiles.medical_disclaimer_date IS 'Timestamp when user accepted the medical disclaimer';
