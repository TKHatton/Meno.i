-- =====================================================
-- MenoAI Database Schema for Supabase (PostgreSQL)
-- =====================================================
-- Run this in your Supabase SQL editor to create all tables
-- and set up Row Level Security (RLS) policies

-- =====================================================
-- 1. TABLES
-- =====================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    auth_provider VARCHAR(50) CHECK (auth_provider IN ('email', 'google')),
    created_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP DEFAULT NOW(),
    anonymized BOOLEAN DEFAULT FALSE
);

COMMENT ON TABLE users IS 'Stores user account information';
COMMENT ON COLUMN users.anonymized IS 'Flag set to true after 30-day retention period';

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    archived BOOLEAN DEFAULT FALSE,
    retention_expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days')
);

COMMENT ON TABLE conversations IS 'Groups messages into conversation sessions';
COMMENT ON COLUMN conversations.retention_expires_at IS 'Auto-calculated 30 days from creation';

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'ai')),
    content TEXT NOT NULL,
    emotion_tag VARCHAR(50),
    intent_tag VARCHAR(50),
    need_tag VARCHAR(50),
    safety_level VARCHAR(10) DEFAULT 'low' CHECK (safety_level IN ('low', 'medium', 'high')),
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE messages IS 'Stores individual messages in conversations';
COMMENT ON COLUMN messages.emotion_tag IS 'Detected emotion (e.g., anxiety, sadness, anger)';
COMMENT ON COLUMN messages.intent_tag IS 'User intent (e.g., seeking_validation, venting)';
COMMENT ON COLUMN messages.need_tag IS 'Identified need per NVC (e.g., connection, understanding)';

-- Safety logs table
CREATE TABLE IF NOT EXISTS safety_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    trigger_phrase TEXT,
    escalation_action VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE safety_logs IS 'Logs safety escalation events for monitoring';

-- =====================================================
-- 2. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_conversations_user
    ON conversations(user_id);

CREATE INDEX IF NOT EXISTS idx_conversations_expires
    ON conversations(retention_expires_at)
    WHERE NOT archived;

CREATE INDEX IF NOT EXISTS idx_messages_conversation
    ON messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_messages_safety
    ON messages(safety_level)
    WHERE safety_level IN ('medium', 'high');

CREATE INDEX IF NOT EXISTS idx_messages_created
    ON messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_safety_logs_created
    ON safety_logs(created_at DESC);

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Conversations policies
CREATE POLICY "Users can view own conversations"
    ON conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
    ON conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
    ON conversations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
    ON conversations FOR DELETE
    USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages in own conversations"
    ON messages FOR SELECT
    USING (
        conversation_id IN (
            SELECT id FROM conversations WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages in own conversations"
    ON messages FOR INSERT
    WITH CHECK (
        conversation_id IN (
            SELECT id FROM conversations WHERE user_id = auth.uid()
        )
    );

-- Safety logs policies (read-only for users, write via backend service role)
CREATE POLICY "Users can view own safety logs"
    ON safety_logs FOR SELECT
    USING (auth.uid() = user_id);

-- =====================================================
-- 4. FUNCTIONS FOR AUTOMATED TASKS
-- =====================================================

-- Function to anonymize expired conversations
CREATE OR REPLACE FUNCTION anonymize_expired_conversations()
RETURNS void AS $$
BEGIN
    -- Mark users as anonymized if all their conversations have expired
    UPDATE users
    SET anonymized = TRUE
    WHERE id IN (
        SELECT DISTINCT user_id
        FROM conversations
        WHERE retention_expires_at < NOW()
        AND NOT archived
    );

    -- Archive expired conversations
    UPDATE conversations
    SET archived = TRUE
    WHERE retention_expires_at < NOW()
    AND NOT archived;

    -- Remove personally identifiable content from archived messages
    UPDATE messages
    SET content = '[REDACTED - Retention period expired]'
    WHERE conversation_id IN (
        SELECT id FROM conversations WHERE archived = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION anonymize_expired_conversations IS 'Anonymizes data after 30-day retention period (GDPR compliance)';

-- Function to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update conversation timestamp when message is added
CREATE TRIGGER update_conversation_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();

-- =====================================================
-- 5. SCHEDULED JOBS (Configure in Supabase Dashboard)
-- =====================================================

-- Run anonymization daily at 2 AM UTC
-- Configure this via Supabase Dashboard → Database → Cron Jobs:
-- SELECT cron.schedule('anonymize-conversations', '0 2 * * *', 'SELECT anonymize_expired_conversations()');

-- =====================================================
-- 6. SAMPLE QUERIES FOR TESTING
-- =====================================================

-- View all conversations with message count
-- SELECT
--     c.id,
--     c.created_at,
--     c.retention_expires_at,
--     c.archived,
--     COUNT(m.id) as message_count
-- FROM conversations c
-- LEFT JOIN messages m ON c.id = m.conversation_id
-- GROUP BY c.id
-- ORDER BY c.created_at DESC;

-- View safety escalations in last 7 days
-- SELECT
--     sl.created_at,
--     sl.trigger_phrase,
--     sl.escalation_action,
--     m.content as original_message
-- FROM safety_logs sl
-- JOIN messages m ON sl.message_id = m.id
-- WHERE sl.created_at > NOW() - INTERVAL '7 days'
-- ORDER BY sl.created_at DESC;

-- Count messages by emotion tag
-- SELECT
--     emotion_tag,
--     COUNT(*) as count
-- FROM messages
-- WHERE emotion_tag IS NOT NULL
-- GROUP BY emotion_tag
-- ORDER BY count DESC;
