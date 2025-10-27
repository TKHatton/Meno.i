-- HOTFIX: Critical RLS Policy Fixes for Account Deletion Feature
-- Run this script in your Supabase SQL Editor to fix breaking issues
-- Date: 2025-10-27
-- Issue: Missing DELETE policy on deletion_confirmations and blocking policies on contact_submissions

-- =====================================================
-- FIX 1: Add missing DELETE RLS policy for deletion_confirmations
-- =====================================================

-- Check if policy exists and drop it if needed (for idempotency)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'deletion_confirmations'
        AND policyname = 'Service role can delete deletion confirmations'
    ) THEN
        DROP POLICY "Service role can delete deletion confirmations" ON public.deletion_confirmations;
    END IF;
END $$;

-- Create the DELETE policy
CREATE POLICY "Service role can delete deletion confirmations"
  ON public.deletion_confirmations
  FOR DELETE
  USING (true);

COMMENT ON POLICY "Service role can delete deletion confirmations" ON public.deletion_confirmations
IS 'Allows service role (backend) to delete confirmation codes during cleanup and account deletion';

-- =====================================================
-- FIX 2: Update contact_submissions RLS policies
-- =====================================================

-- Fix the SELECT policy
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'contact_submissions'
        AND policyname = 'Service role can view contact submissions'
    ) THEN
        DROP POLICY "Service role can view contact submissions" ON public.contact_submissions;
    END IF;
END $$;

CREATE POLICY "Service role can view contact submissions"
    ON public.contact_submissions FOR SELECT
    USING (true);  -- Changed from false to true

COMMENT ON POLICY "Service role can view contact submissions" ON public.contact_submissions
IS 'Allows service role (backend) to view all contact submissions for admin purposes';

-- Fix the UPDATE policy
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'contact_submissions'
        AND policyname = 'Service role can update contact submissions'
    ) THEN
        DROP POLICY "Service role can update contact submissions" ON public.contact_submissions;
    END IF;
END $$;

CREATE POLICY "Service role can update contact submissions"
    ON public.contact_submissions FOR UPDATE
    USING (true);  -- Changed from false to true

COMMENT ON POLICY "Service role can update contact submissions" ON public.contact_submissions
IS 'Allows service role (backend) to update contact submissions (e.g., mark as resolved)';

-- Add the missing DELETE policy
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'contact_submissions'
        AND policyname = 'Service role can delete contact submissions'
    ) THEN
        DROP POLICY "Service role can delete contact submissions" ON public.contact_submissions;
    END IF;
END $$;

CREATE POLICY "Service role can delete contact submissions"
    ON public.contact_submissions FOR DELETE
    USING (true);  -- Service role (backend) can delete all

COMMENT ON POLICY "Service role can delete contact submissions" ON public.contact_submissions
IS 'Allows service role (backend) to delete contact submissions';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify deletion_confirmations policies
SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    qual as using_expression,
    with_check
FROM pg_policies
WHERE tablename = 'deletion_confirmations'
ORDER BY cmd;

-- Verify contact_submissions policies
SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    qual as using_expression,
    with_check
FROM pg_policies
WHERE tablename = 'contact_submissions'
ORDER BY cmd;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Hotfix applied successfully!';
    RAISE NOTICE '📋 Review the policy verification output above to confirm changes.';
END $$;
