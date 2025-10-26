-- =====================================================
-- MenoAI Database Fixes
-- =====================================================
-- This SQL fixes:
-- 1. User login issues caused by missing menopause_stage values
-- 2. SECURITY DEFINER warnings for views
--
-- Run this in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- FIX 1: Update menopause_stage CHECK constraint
-- =====================================================
-- The current constraint doesn't include the new "supporting_*" stages
-- for men supporting their partners, causing onboarding to fail

-- Drop the old CHECK constraint
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_menopause_stage_check;

-- Add the updated CHECK constraint with all stages including supporting_*
ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_menopause_stage_check
CHECK (menopause_stage IN (
    'perimenopause',
    'menopause',
    'postmenopause',
    'unsure',
    'learning',
    'supporting_perimenopause',
    'supporting_menopause',
    'supporting_postmenopause',
    'supporting_unsure'
) OR menopause_stage IS NULL);

COMMENT ON CONSTRAINT user_profiles_menopause_stage_check ON user_profiles IS
'Validates menopause stage: woman stages (perimenopause, menopause, postmenopause, unsure, learning) or man stages (supporting_*)';

-- =====================================================
-- FIX 2: Recreate views without SECURITY DEFINER
-- =====================================================
-- These views were flagged by Supabase for having SECURITY DEFINER
-- We recreate them without it since they're just aggregation views

-- Drop existing views
DROP VIEW IF EXISTS active_conversations_summary;
DROP VIEW IF EXISTS safety_monitoring_summary;

-- Recreate active_conversations_summary WITHOUT SECURITY DEFINER
CREATE VIEW active_conversations_summary AS
SELECT
    c.id,
    c.user_id,
    c.created_at,
    c.updated_at,
    c.retention_expires_at,
    COUNT(m.id) as message_count,
    MAX(m.created_at) as last_message_at
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
WHERE c.archived = FALSE
GROUP BY c.id, c.user_id, c.created_at, c.updated_at, c.retention_expires_at
ORDER BY c.updated_at DESC;

COMMENT ON VIEW active_conversations_summary IS 'Summary view of active conversations with message counts (no SECURITY DEFINER)';

-- Enable RLS on the view to respect user permissions
ALTER VIEW active_conversations_summary SET (security_invoker = true);

-- Recreate safety_monitoring_summary WITHOUT SECURITY DEFINER
CREATE VIEW safety_monitoring_summary AS
SELECT
    DATE(sl.created_at) as log_date,
    COUNT(*) as total_events,
    COUNT(DISTINCT sl.user_id) as unique_users,
    sl.escalation_action,
    COUNT(*) FILTER (WHERE m.safety_level = 'high') as high_risk_count,
    COUNT(*) FILTER (WHERE m.safety_level = 'medium') as medium_risk_count
FROM safety_logs sl
LEFT JOIN messages m ON sl.message_id = m.id
WHERE sl.created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(sl.created_at), sl.escalation_action
ORDER BY log_date DESC;

COMMENT ON VIEW safety_monitoring_summary IS 'Daily summary of safety events for monitoring dashboard (no SECURITY DEFINER)';

-- Enable RLS on the view to respect user permissions
ALTER VIEW safety_monitoring_summary SET (security_invoker = true);

-- =====================================================
-- FIX 3: Add RLS policies for views (if needed)
-- =====================================================
-- Since we're using security_invoker=true, the views will respect
-- the RLS policies of the underlying tables

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify the constraint is updated
-- SELECT pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conname = 'user_profiles_menopause_stage_check';

-- Verify views exist without SECURITY DEFINER
-- SELECT schemaname, viewname, viewowner
-- FROM pg_views
-- WHERE viewname IN ('active_conversations_summary', 'safety_monitoring_summary');

-- Check view options
-- SELECT schemaname, viewname, definition
-- FROM pg_views
-- WHERE viewname IN ('active_conversations_summary', 'safety_monitoring_summary');

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
--
-- After running this migration:
-- 1. Users can now select any menopause stage including supporting_* stages
-- 2. Views no longer trigger SECURITY DEFINER warnings
-- 3. Views properly respect RLS policies of underlying tables
--
-- Test by:
-- 1. Having your client sign up with Google or email
-- 2. Complete onboarding with "Supporting my partner" option
-- 3. Verify profile is created with supporting_* stage
-- 4. Check Supabase dashboard for any remaining warnings
--
-- =====================================================
