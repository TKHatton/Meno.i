-- =====================================================
-- MenoAI Free Tier Database Schema Additions
-- =====================================================
-- Run this in your Supabase SQL editor to add Free Tier tables
--
-- This extends the existing schema (SUPABASE_SCHEMA.sql) with:
-- - User profiles with onboarding data
-- - Symptom tracking
-- - Journal entries
-- - Contact form submissions
--
-- =====================================================

-- =====================================================
-- 1. USER PROFILES TABLE
-- =====================================================

-- Create user_profiles table if it doesn't exist
-- Links to auth.users (managed by Supabase Auth)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    -- Free Tier onboarding fields
    menopause_stage TEXT CHECK (menopause_stage IN (
        'perimenopause',
        'menopause',
        'postmenopause',
        'unsure',
        'learning',
        NULL
    )),
    primary_concerns TEXT[],  -- Array of concern strings
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE user_profiles IS 'Extended user information and onboarding data';
COMMENT ON COLUMN user_profiles.menopause_stage IS 'User''s self-reported menopause stage';
COMMENT ON COLUMN user_profiles.primary_concerns IS 'Array of primary concerns (max 2): hot_flashes, sleep_issues, mood_swings, brain_fog, etc.';
COMMENT ON COLUMN user_profiles.onboarding_completed IS 'Whether user has completed the 2-step onboarding flow';

-- =====================================================
-- 2. SYMPTOM LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS symptom_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    symptoms JSONB NOT NULL DEFAULT '{}',  -- {symptom_name: severity, ...}
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, log_date)  -- One log per day per user
);

COMMENT ON TABLE symptom_logs IS 'Daily symptom tracking logs';
COMMENT ON COLUMN symptom_logs.log_date IS 'Date of symptom log (one per user per day)';
COMMENT ON COLUMN symptom_logs.symptoms IS 'JSONB object: {"hot_flashes": 4, "anxiety": 3, "sleep_issues": 5}';
COMMENT ON COLUMN symptom_logs.energy_level IS 'Overall energy level 1-5 (1=very low, 5=very high)';
COMMENT ON COLUMN symptom_logs.notes IS 'Optional notes about the day';

-- Example symptoms JSONB structure:
-- {
--   "hot_flashes": 4,
--   "night_sweats": 3,
--   "sleep_issues": 5,
--   "anxiety": 3,
--   "brain_fog": 2
-- }

-- =====================================================
-- 3. JOURNAL ENTRIES TABLE
-- =====================================================

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

-- =====================================================
-- 4. CONTACT SUBMISSIONS TABLE
-- =====================================================

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
-- 5. INDEXES FOR PERFORMANCE
-- =====================================================

-- User profiles (already has PK index on id)

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

-- Contact submissions index
CREATE INDEX IF NOT EXISTS idx_contact_created
    ON contact_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_status
    ON contact_submissions(status, created_at DESC);

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- User Profiles Policies
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Users cannot delete their profile (must delete auth account)
-- No DELETE policy intentionally

-- =====================================================
-- Symptom Logs Policies
-- =====================================================

-- Users can view their own symptom logs
CREATE POLICY "Users can view own symptom logs"
    ON symptom_logs FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own symptom logs
CREATE POLICY "Users can insert own symptom logs"
    ON symptom_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own symptom logs
CREATE POLICY "Users can update own symptom logs"
    ON symptom_logs FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own symptom logs
CREATE POLICY "Users can delete own symptom logs"
    ON symptom_logs FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- Journal Entries Policies
-- =====================================================

-- Users can view their own journal entries
CREATE POLICY "Users can view own journal entries"
    ON journal_entries FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own journal entries
CREATE POLICY "Users can insert own journal entries"
    ON journal_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own journal entries
CREATE POLICY "Users can update own journal entries"
    ON journal_entries FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own journal entries
CREATE POLICY "Users can delete own journal entries"
    ON journal_entries FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- Contact Submissions Policies
-- =====================================================

-- Anyone can insert contact submissions (even unauthenticated)
CREATE POLICY "Anyone can submit contact form"
    ON contact_submissions FOR INSERT
    WITH CHECK (true);

-- Only service role can view/update contact submissions
-- (These policies are for documentation - service role bypasses RLS)
CREATE POLICY "Service role can view contact submissions"
    ON contact_submissions FOR SELECT
    USING (false);  -- Regular users cannot view

CREATE POLICY "Service role can update contact submissions"
    ON contact_submissions FOR UPDATE
    USING (false);  -- Regular users cannot update

-- =====================================================
-- 7. FUNCTIONS FOR AUTOMATED TASKS
-- =====================================================

-- Function to update user_profiles.updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_user_profile_timestamp IS 'Automatically updates user_profiles.updated_at on UPDATE';

-- Function to update symptom_logs.updated_at timestamp
CREATE OR REPLACE FUNCTION update_symptom_log_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_symptom_log_timestamp IS 'Automatically updates symptom_logs.updated_at on UPDATE';

-- Function to update journal_entries.updated_at timestamp
CREATE OR REPLACE FUNCTION update_journal_entry_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_journal_entry_timestamp IS 'Automatically updates journal_entries.updated_at on UPDATE';

-- =====================================================
-- 8. TRIGGERS
-- =====================================================

-- Trigger to auto-update user_profiles timestamp
DROP TRIGGER IF EXISTS update_user_profile_timestamp_trigger ON user_profiles;
CREATE TRIGGER update_user_profile_timestamp_trigger
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profile_timestamp();

-- Trigger to auto-update symptom_logs timestamp
DROP TRIGGER IF EXISTS update_symptom_log_timestamp_trigger ON symptom_logs;
CREATE TRIGGER update_symptom_log_timestamp_trigger
    BEFORE UPDATE ON symptom_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_symptom_log_timestamp();

-- Trigger to auto-update journal_entries timestamp
DROP TRIGGER IF EXISTS update_journal_entry_timestamp_trigger ON journal_entries;
CREATE TRIGGER update_journal_entry_timestamp_trigger
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_journal_entry_timestamp();

-- =====================================================
-- 9. HELPER VIEWS (OPTIONAL)
-- =====================================================

-- View for user symptom tracking summary
CREATE OR REPLACE VIEW user_symptom_summary AS
SELECT
    sl.user_id,
    COUNT(DISTINCT sl.log_date) as total_days_logged,
    MAX(sl.log_date) as last_log_date,
    MIN(sl.log_date) as first_log_date,
    AVG(sl.energy_level) as avg_energy_level,
    COUNT(*) FILTER (WHERE sl.log_date >= CURRENT_DATE - INTERVAL '7 days') as logs_last_7_days,
    COUNT(*) FILTER (WHERE sl.log_date >= CURRENT_DATE - INTERVAL '30 days') as logs_last_30_days
FROM symptom_logs sl
GROUP BY sl.user_id;

COMMENT ON VIEW user_symptom_summary IS 'Summary statistics for user symptom tracking';

-- View for user journal summary
CREATE OR REPLACE VIEW user_journal_summary AS
SELECT
    je.user_id,
    COUNT(*) as total_entries,
    MAX(je.entry_date) as last_entry_date,
    MIN(je.entry_date) as first_entry_date,
    AVG(je.mood_rating) as avg_mood_rating,
    COUNT(*) FILTER (WHERE je.entry_date >= CURRENT_DATE - INTERVAL '7 days') as entries_last_7_days,
    COUNT(*) FILTER (WHERE je.entry_date >= CURRENT_DATE - INTERVAL '30 days') as entries_last_30_days
FROM journal_entries je
GROUP BY je.user_id;

COMMENT ON VIEW user_journal_summary IS 'Summary statistics for user journaling';

-- =====================================================
-- 10. SAMPLE DATA FOR TESTING (OPTIONAL)
-- =====================================================

-- Uncomment to insert sample data for testing
-- NOTE: Replace 'YOUR_USER_ID' with an actual user ID from auth.users

-- Sample symptom log
-- INSERT INTO symptom_logs (user_id, log_date, symptoms, energy_level, notes)
-- VALUES (
--     'YOUR_USER_ID',
--     CURRENT_DATE,
--     '{"hot_flashes": 4, "anxiety": 3, "sleep_issues": 5}',
--     3,
--     'Had a rough night with hot flashes. Feeling tired.'
-- );

-- Sample journal entry
-- INSERT INTO journal_entries (user_id, entry_date, content, mood_rating)
-- VALUES (
--     'YOUR_USER_ID',
--     CURRENT_DATE,
--     'Today was challenging. I woke up at 3am with night sweats and couldn''t fall back asleep. Feeling frustrated and exhausted. Trying to remind myself this is temporary.',
--     2
-- );

-- =====================================================
-- 11. VERIFICATION QUERIES
-- =====================================================

-- Run these queries after setup to verify everything is working:

-- Check all new tables exist
-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN ('user_profiles', 'symptom_logs', 'journal_entries', 'contact_submissions');

-- Check RLS is enabled
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- AND tablename IN ('user_profiles', 'symptom_logs', 'journal_entries', 'contact_submissions');

-- Check policies exist
-- SELECT tablename, policyname, cmd
-- FROM pg_policies
-- WHERE tablename IN ('user_profiles', 'symptom_logs', 'journal_entries', 'contact_submissions')
-- ORDER BY tablename, policyname;

-- Check indexes exist
-- SELECT indexname, tablename
-- FROM pg_indexes
-- WHERE schemaname = 'public'
-- AND tablename IN ('user_profiles', 'symptom_logs', 'journal_entries', 'contact_submissions')
-- ORDER BY tablename;

-- Check triggers exist
-- SELECT trigger_name, event_object_table, action_timing, event_manipulation
-- FROM information_schema.triggers
-- WHERE trigger_schema = 'public'
-- AND event_object_table IN ('user_profiles', 'symptom_logs', 'journal_entries')
-- ORDER BY event_object_table;

-- Check full-text search index works
-- SELECT * FROM journal_entries
-- WHERE to_tsvector('english', content) @@ to_tsquery('english', 'anxious & sleep');

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
--
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Verify all tables, policies, and triggers are created
-- 3. Test RLS policies with a test user account
-- 4. Update your backend to use these new tables
-- 5. Update your frontend to interact with the new endpoints
--
-- =====================================================
