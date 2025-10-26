-- =====================================================
-- Fix Supabase Security Warnings
-- =====================================================
-- This SQL fixes security warnings from Supabase Advisors
-- Run this in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- FIX 1: Function Search Path Mutable
-- =====================================================
-- All functions need search_path set to prevent injection attacks
-- Setting search_path = '' ensures functions only use fully qualified names

-- Fix: update_conversation_timestamp
DROP FUNCTION IF EXISTS update_conversation_timestamp();
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '';

COMMENT ON FUNCTION update_conversation_timestamp IS 'Automatically updates conversation timestamp when messages are added (search_path secured)';

-- Fix: anonymize_expired_conversations
DROP FUNCTION IF EXISTS anonymize_expired_conversations();
CREATE OR REPLACE FUNCTION anonymize_expired_conversations()
RETURNS void AS $$
BEGIN
    -- Archive expired conversations
    UPDATE public.conversations
    SET archived = TRUE
    WHERE retention_expires_at < NOW()
      AND NOT archived;

    -- Redact content from messages in archived conversations
    UPDATE public.messages
    SET content = '[REDACTED - Retention period expired]'
    WHERE conversation_id IN (
        SELECT id FROM public.conversations WHERE archived = TRUE
    )
    AND content != '[REDACTED - Retention period expired]';

    RAISE NOTICE 'Anonymization complete. Archived % conversations.',
        (SELECT COUNT(*) FROM public.conversations WHERE archived = TRUE);
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '';

COMMENT ON FUNCTION anonymize_expired_conversations IS 'Anonymizes data after 30-day retention period for GDPR compliance (search_path secured)';

-- Fix: create_user_profile
DROP FUNCTION IF EXISTS create_user_profile();
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '';

COMMENT ON FUNCTION create_user_profile IS 'Automatically creates user profile on signup with OAuth data (search_path secured)';

-- Fix: update_user_profile_timestamp
DROP FUNCTION IF EXISTS update_user_profile_timestamp();
CREATE OR REPLACE FUNCTION update_user_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

COMMENT ON FUNCTION update_user_profile_timestamp IS 'Automatically updates user_profiles.updated_at on UPDATE (search_path secured)';

-- Fix: update_symptom_log_timestamp
DROP FUNCTION IF EXISTS update_symptom_log_timestamp();
CREATE OR REPLACE FUNCTION update_symptom_log_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

COMMENT ON FUNCTION update_symptom_log_timestamp IS 'Automatically updates symptom_logs.updated_at on UPDATE (search_path secured)';

-- Fix: update_journal_entry_timestamp
DROP FUNCTION IF EXISTS update_journal_entry_timestamp();
CREATE OR REPLACE FUNCTION update_journal_entry_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

COMMENT ON FUNCTION update_journal_entry_timestamp IS 'Automatically updates journal_entries.updated_at on UPDATE (search_path secured)';

-- =====================================================
-- RECREATE TRIGGERS (if needed)
-- =====================================================
-- The triggers should still work, but recreating them ensures they're linked to the updated functions

-- Trigger: update_conversation_on_message
DROP TRIGGER IF EXISTS update_conversation_on_message ON messages;
CREATE TRIGGER update_conversation_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();

-- Trigger: on_auth_user_created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();

-- Trigger: update_user_profile_timestamp_trigger
DROP TRIGGER IF EXISTS update_user_profile_timestamp_trigger ON user_profiles;
CREATE TRIGGER update_user_profile_timestamp_trigger
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profile_timestamp();

-- Trigger: update_symptom_log_timestamp_trigger
DROP TRIGGER IF EXISTS update_symptom_log_timestamp_trigger ON symptom_logs;
CREATE TRIGGER update_symptom_log_timestamp_trigger
    BEFORE UPDATE ON symptom_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_symptom_log_timestamp();

-- Trigger: update_journal_entry_timestamp_trigger
DROP TRIGGER IF EXISTS update_journal_entry_timestamp_trigger ON journal_entries;
CREATE TRIGGER update_journal_entry_timestamp_trigger
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_journal_entry_timestamp();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check that functions have search_path set
-- SELECT
--     p.proname as function_name,
--     pg_get_function_identity_arguments(p.oid) as arguments,
--     p.proconfig as config
-- FROM pg_proc p
-- JOIN pg_namespace n ON p.pronamespace = n.oid
-- WHERE n.nspname = 'public'
-- AND p.proname IN (
--     'update_conversation_timestamp',
--     'anonymize_expired_conversations',
--     'create_user_profile',
--     'update_user_profile_timestamp',
--     'update_symptom_log_timestamp',
--     'update_journal_entry_timestamp'
-- );

-- Expected: proconfig should show '{search_path=}' for each function

-- =====================================================
-- ALL WARNINGS SUMMARY
-- =====================================================
--
-- ✅ Fixed by this SQL migration (6 warnings):
-- 1. public.update_conversation_timestamp - search_path set
-- 2. public.update_journal_entry_timestamp - search_path set
-- 3. public.anonymize_expired_conversations - search_path set
-- 4. public.create_user_profile - search_path set
-- 5. public.update_user_profile_timestamp - search_path set
-- 6. public.update_symptom_log_timestamp - search_path set
--
-- ⚠️  Requires manual action in Supabase Dashboard (1 warning):
-- 7. Auth - Enable HaveIBeenPwned password check
--
--    TO FIX WARNING #7:
--    1. Go to Supabase Dashboard
--    2. Navigate to: Authentication → Settings
--    3. Scroll to "Security and Protection" section
--    4. Find "Password breach detection (HaveIBeenPwned)"
--    5. Toggle it ON
--    6. Click "Save"
--
--    This prevents users from using passwords that have been
--    exposed in data breaches, significantly improving security.
--
-- =====================================================
