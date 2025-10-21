-- =====================================================
-- MenoAI Database Schema for Supabase (PostgreSQL)
-- =====================================================
-- Run this in your Supabase SQL editor to create all tables
-- and set up Row Level Security (RLS) policies
--
-- IMPORTANT: This schema uses Supabase's built-in auth.users table
-- for user management. We do not create a custom users table.
--
-- =====================================================

-- =====================================================
-- 1. TABLES
-- =====================================================

-- Conversations table
-- Links to auth.users (managed by Supabase Auth)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    archived BOOLEAN DEFAULT FALSE,
    retention_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

COMMENT ON TABLE conversations IS 'Groups messages into conversation sessions';
COMMENT ON COLUMN conversations.user_id IS 'References auth.users - managed by Supabase Auth';
COMMENT ON COLUMN conversations.retention_expires_at IS 'Auto-calculated 30 days from creation for GDPR compliance';

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'ai')),
    content TEXT NOT NULL,
    emotion_tag VARCHAR(50),
    intent_tag VARCHAR(50),
    need_tag VARCHAR(50),
    safety_level VARCHAR(10) DEFAULT 'low' CHECK (safety_level IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE messages IS 'Stores individual messages in conversations';
COMMENT ON COLUMN messages.emotion_tag IS 'Detected emotion (e.g., anxiety, sadness, anger)';
COMMENT ON COLUMN messages.intent_tag IS 'User intent (e.g., seeking_validation, venting)';
COMMENT ON COLUMN messages.need_tag IS 'Identified need per NVC (e.g., connection, understanding)';
COMMENT ON COLUMN messages.safety_level IS 'Risk assessment level for safety monitoring';

-- Safety logs table
CREATE TABLE IF NOT EXISTS safety_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    trigger_phrase TEXT,
    escalation_action VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE safety_logs IS 'Logs safety escalation events for monitoring and compliance';
COMMENT ON COLUMN safety_logs.escalation_action IS 'Action taken (e.g., resources_shown, flagged_for_review)';

-- =====================================================
-- 2. INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for finding user's conversations
CREATE INDEX IF NOT EXISTS idx_conversations_user
    ON conversations(user_id)
    WHERE NOT archived;

-- Index for finding expired conversations
CREATE INDEX IF NOT EXISTS idx_conversations_expires
    ON conversations(retention_expires_at)
    WHERE NOT archived;

-- Index for finding messages in a conversation
CREATE INDEX IF NOT EXISTS idx_messages_conversation
    ON messages(conversation_id);

-- Index for safety monitoring queries
CREATE INDEX IF NOT EXISTS idx_messages_safety
    ON messages(safety_level, created_at DESC)
    WHERE safety_level IN ('medium', 'high');

-- Index for chronological message retrieval
CREATE INDEX IF NOT EXISTS idx_messages_created
    ON messages(created_at DESC);

-- Index for safety log queries
CREATE INDEX IF NOT EXISTS idx_safety_logs_created
    ON safety_logs(created_at DESC);

-- Index for safety logs by user
CREATE INDEX IF NOT EXISTS idx_safety_logs_user
    ON safety_logs(user_id, created_at DESC)
    WHERE user_id IS NOT NULL;

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Conversations Policies
-- =====================================================

-- Users can view their own conversations
CREATE POLICY "Users can view own conversations"
    ON conversations FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create conversations for themselves
CREATE POLICY "Users can create own conversations"
    ON conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own conversations
CREATE POLICY "Users can update own conversations"
    ON conversations FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own conversations
CREATE POLICY "Users can delete own conversations"
    ON conversations FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- Messages Policies
-- =====================================================

-- Users can view messages in their own conversations
CREATE POLICY "Users can view messages in own conversations"
    ON messages FOR SELECT
    USING (
        conversation_id IN (
            SELECT id FROM conversations WHERE user_id = auth.uid()
        )
    );

-- Users can insert messages in their own conversations
CREATE POLICY "Users can insert messages in own conversations"
    ON messages FOR INSERT
    WITH CHECK (
        conversation_id IN (
            SELECT id FROM conversations WHERE user_id = auth.uid()
        )
    );

-- Users can update messages in their own conversations
CREATE POLICY "Users can update messages in own conversations"
    ON messages FOR UPDATE
    USING (
        conversation_id IN (
            SELECT id FROM conversations WHERE user_id = auth.uid()
        )
    );

-- Users can delete messages in their own conversations
CREATE POLICY "Users can delete messages in own conversations"
    ON messages FOR DELETE
    USING (
        conversation_id IN (
            SELECT id FROM conversations WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- Safety Logs Policies
-- =====================================================

-- Users can view their own safety logs
CREATE POLICY "Users can view own safety logs"
    ON safety_logs FOR SELECT
    USING (auth.uid() = user_id);

-- Service role can insert safety logs (backend only)
-- Note: The backend uses service role key, which bypasses RLS
-- This policy is for documentation purposes
CREATE POLICY "Service role can insert safety logs"
    ON safety_logs FOR INSERT
    WITH CHECK (true);  -- Backend service role bypasses RLS

-- =====================================================
-- 4. FUNCTIONS FOR AUTOMATED TASKS
-- =====================================================

-- Function to update conversation timestamp when message is added
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_conversation_timestamp IS 'Automatically updates conversation timestamp when messages are added';

-- Function to anonymize expired conversations (GDPR compliance)
CREATE OR REPLACE FUNCTION anonymize_expired_conversations()
RETURNS void AS $$
BEGIN
    -- Archive expired conversations
    UPDATE conversations
    SET archived = TRUE
    WHERE retention_expires_at < NOW()
      AND NOT archived;

    -- Redact content from messages in archived conversations
    UPDATE messages
    SET content = '[REDACTED - Retention period expired]'
    WHERE conversation_id IN (
        SELECT id FROM conversations WHERE archived = TRUE
    )
    AND content != '[REDACTED - Retention period expired]';

    RAISE NOTICE 'Anonymization complete. Archived % conversations.',
        (SELECT COUNT(*) FROM conversations WHERE archived = TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION anonymize_expired_conversations IS 'Anonymizes data after 30-day retention period for GDPR compliance';

-- =====================================================
-- 5. TRIGGERS
-- =====================================================

-- Trigger to auto-update conversation timestamp when message is added
DROP TRIGGER IF EXISTS update_conversation_on_message ON messages;
CREATE TRIGGER update_conversation_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();

-- =====================================================
-- 6. SCHEDULED JOBS (Configure in Supabase Dashboard)
-- =====================================================

-- Run anonymization daily at 2 AM UTC
-- Configure this via Supabase Dashboard → Database → Cron Jobs
-- Or run this SQL to set up the cron job:
--
-- SELECT cron.schedule(
--     'anonymize-conversations',
--     '0 2 * * *',
--     'SELECT anonymize_expired_conversations()'
-- );

-- =====================================================
-- 7. HELPER VIEWS (OPTIONAL)
-- =====================================================

-- View for active conversations with message counts
CREATE OR REPLACE VIEW active_conversations_summary AS
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

COMMENT ON VIEW active_conversations_summary IS 'Summary view of active conversations with message counts';

-- View for safety monitoring
CREATE OR REPLACE VIEW safety_monitoring_summary AS
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

COMMENT ON VIEW safety_monitoring_summary IS 'Daily summary of safety events for monitoring dashboard';

-- =====================================================
-- 8. VERIFICATION QUERIES
-- =====================================================

-- Run these queries after setup to verify everything is working:

-- Check all tables exist
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN ('conversations', 'messages', 'safety_logs');

-- Check RLS is enabled
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- AND tablename IN ('conversations', 'messages', 'safety_logs');

-- Check policies exist
-- SELECT schemaname, tablename, policyname
-- FROM pg_policies
-- WHERE tablename IN ('conversations', 'messages', 'safety_logs');

-- Check indexes exist
-- SELECT indexname, tablename
-- FROM pg_indexes
-- WHERE schemaname = 'public'
-- AND tablename IN ('conversations', 'messages', 'safety_logs');

-- Check triggers exist
-- SELECT trigger_name, event_object_table, action_timing, event_manipulation
-- FROM information_schema.triggers
-- WHERE trigger_schema = 'public';

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
--
-- Next steps:
-- 1. Verify all tables, policies, and triggers are created
-- 2. Set up the cron job for anonymization (see section 6)
-- 3. Test RLS policies with a test user account
-- 4. Configure your backend with SUPABASE_SERVICE_ROLE_KEY
-- 5. Configure your frontend with NEXT_PUBLIC_SUPABASE_ANON_KEY
--
-- =====================================================
