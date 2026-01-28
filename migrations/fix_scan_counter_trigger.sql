-- Fix Scan Counter Trigger
-- This ensures monthly_scans_used increments correctly when scans complete

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_scan_complete ON public.scans;
DROP FUNCTION IF EXISTS public.increment_scan_count();

-- Create the function to increment scan counts
CREATE OR REPLACE FUNCTION public.increment_scan_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment when a scan is completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.profiles
    SET
      monthly_scans_used = COALESCE(monthly_scans_used, 0) + 1,
      total_scans = COALESCE(total_scans, 0) + 1,
      last_scan_date = CURRENT_DATE
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_scan_complete
  AFTER INSERT OR UPDATE ON public.scans
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_scan_count();

-- Also create an RPC function for manual increments (fallback)
CREATE OR REPLACE FUNCTION public.increment_user_scan_count(user_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET
    monthly_scans_used = COALESCE(monthly_scans_used, 0) + 1,
    total_scans = COALESCE(total_scans, 0) + 1,
    last_scan_date = CURRENT_DATE
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
