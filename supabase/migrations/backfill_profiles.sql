-- Backfill profiles for existing users who don't have profiles yet
-- This fixes the issue where auth triggers were disabled and users were created without profiles

INSERT INTO profiles (
  id,
  email,
  full_name,
  monthly_scans_used,
  total_scans,
  is_premium,
  onboarding_completed,
  created_at,
  updated_at
)
SELECT
  au.id,
  au.email,
  au.raw_user_meta_data->>'full_name' as full_name,
  0 as monthly_scans_used,
  0 as total_scans,
  false as is_premium,
  false as onboarding_completed,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Log the results
DO $$
DECLARE
  row_count INTEGER;
BEGIN
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE 'Created % profile(s) for existing users without profiles', row_count;
END $$;
