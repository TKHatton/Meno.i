-- FIX: Secure search_path for SECURITY DEFINER Functions
-- Addresses Supabase warning: "Function has a role mutable search_path"
-- Date: 2025-10-27
--
-- This script adds secure search_path to all SECURITY DEFINER functions
-- to prevent potential search_path injection attacks

-- =====================================================
-- FIX: cleanup_expired_deletion_confirmations
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_expired_deletion_confirmations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM public.deletion_confirmations
  WHERE expires_at < NOW() OR used = TRUE;
END;
$$;

COMMENT ON FUNCTION cleanup_expired_deletion_confirmations
IS 'Cleans up expired/used deletion confirmation codes (search_path secured)';

-- =====================================================
-- FIX: Timestamp trigger functions
-- =====================================================

CREATE OR REPLACE FUNCTION update_user_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

COMMENT ON FUNCTION update_user_profile_timestamp
IS 'Automatically updates user_profiles.updated_at on UPDATE (search_path secured)';

CREATE OR REPLACE FUNCTION update_symptom_log_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

COMMENT ON FUNCTION update_symptom_log_timestamp
IS 'Automatically updates symptom_logs.updated_at on UPDATE (search_path secured)';

CREATE OR REPLACE FUNCTION update_journal_entry_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

COMMENT ON FUNCTION update_journal_entry_timestamp
IS 'Automatically updates journal_entries.updated_at on UPDATE (search_path secured)';

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify all functions have search_path set
SELECT
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    CASE
        WHEN p.proconfig IS NULL THEN '❌ No search_path set'
        ELSE '✅ search_path: ' || array_to_string(p.proconfig, ', ')
    END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prosecdef = true  -- SECURITY DEFINER
  AND p.proname IN (
      'cleanup_expired_deletion_confirmations',
      'update_user_profile_timestamp',
      'update_symptom_log_timestamp',
      'update_journal_entry_timestamp'
  )
ORDER BY p.proname;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Search path security fix applied successfully!';
    RAISE NOTICE '📋 Review the verification output above.';
    RAISE NOTICE '📋 All SECURITY DEFINER functions should show search_path is set.';
END $$;
