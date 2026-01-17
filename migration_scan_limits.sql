-- Migration: Add monthly scan limits for free tier users
-- Allows 5 free scans per month before requiring upgrade

BEGIN;

-- Add columns to profiles table for scan tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS monthly_scans_used INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS scans_reset_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Function to check and reset monthly scans
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
  
  SELECT json_build_object(
    'scans_used', current_used,
    'scans_remaining', GREATEST(0, 5 - current_used),
    'is_premium', is_premium,
    'can_scan', is_premium OR current_used < 5,
    'limit', 5
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment scan count after successful scan
-- This will be called when a scan is completed
CREATE OR REPLACE FUNCTION public.increment_scan_count(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles 
  SET monthly_scans_used = COALESCE(monthly_scans_used, 0) + 1
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_scan_allowance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_scan_count(UUID) TO authenticated;

COMMIT;
