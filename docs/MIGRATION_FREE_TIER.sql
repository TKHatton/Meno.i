-- =====================================================
-- MenoAI Free Tier Migration Script
-- =====================================================
-- This script safely upgrades an EXISTING database
-- It will NOT drop or recreate existing tables
--
-- Safe to run multiple times (idempotent)
-- =====================================================

-- =====================================================
-- 1. UPGRADE EXISTING user_profiles TABLE
-- =====================================================

-- Add new columns to user_profiles if they don't exist
DO $$
BEGIN
    -- Add menopause_stage column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_profiles' AND column_name = 'menopause_stage'
    ) THEN
        ALTER TABLE user_profiles
        ADD COLUMN menopause_stage TEXT CHECK (menopause_stage IN (
            'perimenopause',
            'menopause',
            'postmenopause',
            'unsure',
            'learning',
            NULL
        ));
        RAISE NOTICE 'Added column: menopause_stage';
    ELSE
        RAISE NOTICE 'Column menopause_stage already exists';
    END IF;

    -- Add primary_concerns column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_profiles' AND column_name = 'primary_concerns'
    ) THEN
        ALTER TABLE user_profiles
        ADD COLUMN primary_concerns TEXT[];
        RAISE NOTICE 'Added column: primary_concerns';
    ELSE
        RAISE NOTICE 'Column primary_concerns already exists';
    END IF;

    -- Add onboarding_completed column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_profiles' AND column_name = 'onboarding_completed'
    ) THEN
        ALTER TABLE user_profiles
        ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added column: onboarding_completed';
    ELSE
        RAISE NOTICE 'Column onboarding_completed already exists';
    END IF;
END $$;

COMMENT ON COLUMN user_profiles.menopause_stage IS 'User''s self-reported menopause stage';
COMMENT ON COLUMN user_profiles.primary_concerns IS 'Array of primary concerns (max 2): hot_flashes, sleep_issues, mood_swings, brain_fog, etc.';
COMMENT ON COLUMN user_profiles.onboarding_completed IS 'Whether user has completed the 2-step onboarding flow';

-- =====================================================
-- 2. CREATE NEW TABLES (symptom_logs, journal_entries, contact_submissions)
-- =====================================================

-- Create symptom_logs table
CREATE TABLE IF NOT EXISTS symptom_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    symptoms JSONB NOT NULL DEFAULT '{}',
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, log_date)
);

COMMENT ON TABLE symptom_logs IS 'Daily symptom tracking logs';
COMMENT ON COLUMN symptom_logs.log_date IS 'Date of symptom log (one per user per day)';
COMMENT ON COLUMN symptom_logs.symptoms IS 'JSONB object: {"hot_flashes": 4, "anxiety": 3, "sleep_issues": 5}';
COMMENT ON COLUMN symptom_logs.energy_level IS 'Overall energy level 1-5 (1=very low, 5=very high)';

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    content TEXT NOT NULL CHECK (length(content) >= 1),
    mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE journal_entries IS 'User journal entries';
COMMENT ON COLUMN journal_entries.entry_date IS 'Date of journal entry';
COMMENT ON COLUMN journal_entries.content IS 'Journal entry text content';
COMMENT ON COLUMN journal_entries.mood_rating IS 'Mood scale: 1=struggling, 2=okay, 3=good, 4=great';

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (length(name) >= 1),
    email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    message TEXT NOT NULL CHECK (length(message) >= 10),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'replied', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE contact_submissions IS 'Contact form submissions';
COMMENT ON COLUMN contact_submissions.status IS 'Submission status: new, replied, resolved';

-- =====================================================
-- 3. CREATE INDEXES (IF NOT EXISTS)
-- =====================================================

-- Symptom logs indexes
CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_date
    ON symptom_logs(user_id, log_date DESC);

CREATE INDEX IF NOT EXISTS idx_symptom_logs_date
    ON symptom_logs(log_date DESC);

-- Journal entries indexes
CREATE INDEX IF NOT EXISTS idx_journal_user_date
    ON journal_entries(user_id, entry_date DESC);

CREATE INDEX IF NOT EXISTS idx_journal_created
    ON journal_entries(created_at DESC);

-- Full-text search index for journal content
CREATE INDEX IF NOT EXISTS idx_journal_content_search
    ON journal_entries
    USING gin(to_tsvector('english', content));

-- Contact submissions indexes
CREATE INDEX IF NOT EXISTS idx_contact_created
    ON contact_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_status
    ON contact_submissions(status, created_at DESC);

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables (safe to run multiple times)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE RLS POLICIES (IF NOT EXISTS)
-- =====================================================

-- User Profiles Policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile"
            ON user_profiles FOR SELECT
            USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile"
            ON user_profiles FOR INSERT
            WITH CHECK (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile"
            ON user_profiles FOR UPDATE
            USING (auth.uid() = id);
    END IF;
END $$;

-- Symptom Logs Policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'symptom_logs' AND policyname = 'Users can view own symptom logs'
    ) THEN
        CREATE POLICY "Users can view own symptom logs"
            ON symptom_logs FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'symptom_logs' AND policyname = 'Users can insert own symptom logs'
    ) THEN
        CREATE POLICY "Users can insert own symptom logs"
            ON symptom_logs FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'symptom_logs' AND policyname = 'Users can update own symptom logs'
    ) THEN
        CREATE POLICY "Users can update own symptom logs"
            ON symptom_logs FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'symptom_logs' AND policyname = 'Users can delete own symptom logs'
    ) THEN
        CREATE POLICY "Users can delete own symptom logs"
            ON symptom_logs FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Journal Entries Policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'journal_entries' AND policyname = 'Users can view own journal entries'
    ) THEN
        CREATE POLICY "Users can view own journal entries"
            ON journal_entries FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'journal_entries' AND policyname = 'Users can insert own journal entries'
    ) THEN
        CREATE POLICY "Users can insert own journal entries"
            ON journal_entries FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'journal_entries' AND policyname = 'Users can update own journal entries'
    ) THEN
        CREATE POLICY "Users can update own journal entries"
            ON journal_entries FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'journal_entries' AND policyname = 'Users can delete own journal entries'
    ) THEN
        CREATE POLICY "Users can delete own journal entries"
            ON journal_entries FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Contact Submissions Policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'contact_submissions' AND policyname = 'Anyone can submit contact form'
    ) THEN
        CREATE POLICY "Anyone can submit contact form"
            ON contact_submissions FOR INSERT
            WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'contact_submissions' AND policyname = 'Service role can view contact submissions'
    ) THEN
        CREATE POLICY "Service role can view contact submissions"
            ON contact_submissions FOR SELECT
            USING (false);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'contact_submissions' AND policyname = 'Service role can update contact submissions'
    ) THEN
        CREATE POLICY "Service role can update contact submissions"
            ON contact_submissions FOR UPDATE
            USING (false);
    END IF;
END $$;

-- =====================================================
-- 6. CREATE FUNCTIONS FOR AUTOMATED TASKS
-- =====================================================

-- Function to update user_profiles.updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update symptom_logs.updated_at timestamp
CREATE OR REPLACE FUNCTION update_symptom_log_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update journal_entries.updated_at timestamp
CREATE OR REPLACE FUNCTION update_journal_entry_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. CREATE TRIGGERS
-- =====================================================

-- Trigger for user_profiles (check if exists first)
DROP TRIGGER IF EXISTS update_user_profile_timestamp_trigger ON user_profiles;
CREATE TRIGGER update_user_profile_timestamp_trigger
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profile_timestamp();

-- Trigger for symptom_logs
DROP TRIGGER IF EXISTS update_symptom_log_timestamp_trigger ON symptom_logs;
CREATE TRIGGER update_symptom_log_timestamp_trigger
    BEFORE UPDATE ON symptom_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_symptom_log_timestamp();

-- Trigger for journal_entries
DROP TRIGGER IF EXISTS update_journal_entry_timestamp_trigger ON journal_entries;
CREATE TRIGGER update_journal_entry_timestamp_trigger
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_journal_entry_timestamp();

-- =====================================================
-- 8. VERIFICATION
-- =====================================================

-- Check that all tables exist
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('user_profiles', 'symptom_logs', 'journal_entries', 'contact_submissions');

    IF table_count = 4 THEN
        RAISE NOTICE '✅ All 4 tables exist';
    ELSE
        RAISE WARNING '⚠️ Only % of 4 tables exist', table_count;
    END IF;
END $$;

-- Check that user_profiles has all required columns
DO $$
DECLARE
    column_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns
    WHERE table_name = 'user_profiles'
    AND column_name IN ('menopause_stage', 'primary_concerns', 'onboarding_completed');

    IF column_count = 3 THEN
        RAISE NOTICE '✅ user_profiles has all 3 new columns';
    ELSE
        RAISE WARNING '⚠️ user_profiles only has % of 3 new columns', column_count;
    END IF;
END $$;

-- Check RLS is enabled
DO $$
DECLARE
    rls_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO rls_count
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('user_profiles', 'symptom_logs', 'journal_entries', 'contact_submissions')
    AND rowsecurity = true;

    IF rls_count = 4 THEN
        RAISE NOTICE '✅ RLS enabled on all 4 tables';
    ELSE
        RAISE WARNING '⚠️ RLS only enabled on % of 4 tables', rls_count;
    END IF;
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 =====================================================';
    RAISE NOTICE '🎉 FREE TIER MIGRATION COMPLETE!';
    RAISE NOTICE '🎉 =====================================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ user_profiles table upgraded with onboarding columns';
    RAISE NOTICE '✅ symptom_logs table created';
    RAISE NOTICE '✅ journal_entries table created';
    RAISE NOTICE '✅ contact_submissions table created';
    RAISE NOTICE '✅ RLS policies applied';
    RAISE NOTICE '✅ Indexes created';
    RAISE NOTICE '✅ Triggers created';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run verification queries (see below)';
    RAISE NOTICE '2. Test API endpoints';
    RAISE NOTICE '3. Start building frontend!';
    RAISE NOTICE '';
END $$;
