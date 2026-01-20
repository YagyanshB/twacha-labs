-- Migration: Update scan limits to allow unlimited free scans
-- Changes free tier from 5 scans to unlimited

BEGIN;

-- Update the check_scan_allowance function to allow unlimited scans
CREATE OR REPLACE FUNCTION public.check_scan_allowance(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  current_used INT;
  reset_date DATE;
  is_premium BOOLEAN;
BEGIN
  SELECT
    COALESCE(monthly_scans_used, 0),
    COALESCE(scans_reset_date, CURRENT_DATE),
    COALESCE(is_premium, false)
  INTO current_used, reset_date, is_premium
  FROM public.profiles
  WHERE id = p_user_id;

  -- Reset if it's a new month
  IF reset_date < DATE_TRUNC('month', CURRENT_DATE) THEN
    UPDATE public.profiles
    SET monthly_scans_used = 0,
        scans_reset_date = CURRENT_DATE
    WHERE id = p_user_id;
    current_used := 0;
  END IF;

  -- Return unlimited scans for all users (999999 limit)
  SELECT json_build_object(
    'scans_used', current_used,
    'scans_remaining', 999999 - current_used,
    'is_premium', is_premium,
    'can_scan', true,  -- Always allow scans
    'limit', 999999    -- Essentially unlimited
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add missing columns if not present
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS total_scans INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0;

-- Function to update profile stats after scan (total scans, streak, etc.)
CREATE OR REPLACE FUNCTION public.update_profile_stats_after_scan()
RETURNS TRIGGER AS $$
DECLARE
  days_since_last_scan INT;
BEGIN
  -- Only run for completed scans
  IF NEW.status = 'completed' THEN
    -- Calculate days since last scan
    SELECT
      COALESCE(EXTRACT(DAY FROM (NEW.created_at - MAX(created_at))), 0)
    INTO days_since_last_scan
    FROM scans
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND status = 'completed';

    -- Update profile with new scan stats
    UPDATE profiles
    SET
      total_scans = COALESCE(total_scans, 0) + 1,
      current_streak = CASE
        WHEN days_since_last_scan <= 1 THEN COALESCE(current_streak, 0) + 1
        ELSE 1
      END
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto-updating profile stats
DROP TRIGGER IF EXISTS update_profile_stats_trigger ON scans;
CREATE TRIGGER update_profile_stats_trigger
  AFTER INSERT ON scans
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_stats_after_scan();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_scan_allowance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_scan_count(UUID) TO authenticated;

COMMIT;
