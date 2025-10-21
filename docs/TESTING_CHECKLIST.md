# MenoAI Testing Checklist - Supabase Integration

This checklist provides step-by-step testing procedures to verify that the Supabase integration is working correctly across all layers of the MenoAI application.

---

## Prerequisites

Before running these tests:

- [ ] Supabase project created
- [ ] Database schema applied (`SUPABASE_SCHEMA.sql` executed)
- [ ] Backend `.env` configured with service role key
- [ ] Frontend `.env.local` configured with anon key
- [ ] Backend server running (`npm run dev` in `packages/backend`)
- [ ] Frontend server running (`npm run dev` in `packages/frontend`)

---

## Phase 1: Database Schema Verification

### Test 1.1: Verify Tables Exist

**Run in Supabase SQL Editor:**

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('conversations', 'messages', 'safety_logs');
```

**Expected Result:**
- ✅ Returns 3 rows: `conversations`, `messages`, `safety_logs`

---

### Test 1.2: Verify RLS is Enabled

**Run in Supabase SQL Editor:**

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('conversations', 'messages', 'safety_logs');
```

**Expected Result:**
- ✅ All 3 tables show `rowsecurity = true`

---

### Test 1.3: Verify Policies Exist

**Run in Supabase SQL Editor:**

```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('conversations', 'messages', 'safety_logs')
ORDER BY tablename, policyname;
```

**Expected Result:**
- ✅ At least 11 policies exist
- ✅ Each table has SELECT, INSERT, UPDATE, DELETE policies
- ✅ Policy names are descriptive (e.g., "Users can view own conversations")

---

### Test 1.4: Verify Indexes Exist

**Run in Supabase SQL Editor:**

```sql
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('conversations', 'messages', 'safety_logs')
ORDER BY tablename, indexname;
```

**Expected Result:**
- ✅ At least 7 indexes exist
- ✅ Includes: `idx_conversations_user`, `idx_messages_conversation`, `idx_messages_safety`, etc.

---

### Test 1.5: Verify Triggers Exist

**Run in Supabase SQL Editor:**

```sql
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

**Expected Result:**
- ✅ `update_conversation_on_message` trigger exists
- ✅ Fires AFTER INSERT on `messages` table

---

### Test 1.6: Verify Functions Exist

**Run in Supabase SQL Editor:**

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('update_conversation_timestamp', 'anonymize_expired_conversations');
```

**Expected Result:**
- ✅ Both functions exist
- ✅ Both are type `FUNCTION`

---

### Test 1.7: Verify Views Exist

**Run in Supabase SQL Editor:**

```sql
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name IN ('active_conversations_summary', 'safety_monitoring_summary');
```

**Expected Result:**
- ✅ Both views exist

---

## Phase 2: Authentication & User Management

### Test 2.1: Create Test User

**In Supabase Dashboard:**

1. Go to **Authentication** → **Users**
2. Click **Add User** → **Create New User**
3. Fill in:
   - Email: `test@menoai.com`
   - Password: `TestPassword123!`
   - Auto Confirm User: ✅ (check this)
4. Click **Create User**

**Expected Result:**
- ✅ User created successfully
- ✅ User ID (UUID) is displayed
- ✅ User appears in users list

**Save for later tests:**
```
TEST_USER_ID = <copy the UUID here>
TEST_USER_EMAIL = test@menoai.com
```

---

### Test 2.2: Verify User in auth.users

**Run in Supabase SQL Editor:**

```sql
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
WHERE email = 'test@menoai.com';
```

**Expected Result:**
- ✅ User exists in `auth.users`
- ✅ Email matches
- ✅ `email_confirmed_at` is set (if auto-confirmed)

---

## Phase 3: Row Level Security (RLS) Testing

### Test 3.1: Test Conversation Creation (As User)

**Run in Supabase SQL Editor:**

```sql
-- Simulate authenticated user
SET request.jwt.claims.sub = 'YOUR_TEST_USER_ID_HERE';

-- Try to create a conversation for yourself
INSERT INTO conversations (user_id)
VALUES ('YOUR_TEST_USER_ID_HERE')
RETURNING *;
```

**Expected Result:**
- ✅ Conversation created successfully
- ✅ Returns the new conversation with ID, timestamps, etc.

**Save for later:**
```
TEST_CONVERSATION_ID = <copy the conversation ID>
```

---

### Test 3.2: Test Conversation Read (Own Data)

**Run in Supabase SQL Editor:**

```sql
-- Still authenticated as test user
SET request.jwt.claims.sub = 'YOUR_TEST_USER_ID_HERE';

-- Try to read your own conversations
SELECT * FROM conversations WHERE user_id = 'YOUR_TEST_USER_ID_HERE';
```

**Expected Result:**
- ✅ Returns your conversation(s)
- ✅ No error

---

### Test 3.3: Test Conversation Read (Other User's Data)

**Run in Supabase SQL Editor:**

```sql
-- Authenticated as test user
SET request.jwt.claims.sub = 'YOUR_TEST_USER_ID_HERE';

-- Try to read another user's conversations (use a different UUID)
SELECT * FROM conversations WHERE user_id = '00000000-0000-0000-0000-000000000000';
```

**Expected Result:**
- ✅ Returns 0 rows (RLS blocks access to other users' data)
- ✅ No error (just empty result)

---

### Test 3.4: Test Message Creation

**Run in Supabase SQL Editor:**

```sql
-- Authenticated as test user
SET request.jwt.claims.sub = 'YOUR_TEST_USER_ID_HERE';

-- Create a message in your conversation
INSERT INTO messages (conversation_id, role, content, safety_level)
VALUES ('YOUR_TEST_CONVERSATION_ID_HERE', 'user', 'I am feeling anxious today', 'low')
RETURNING *;
```

**Expected Result:**
- ✅ Message created successfully
- ✅ Returns message with ID, timestamp, etc.

---

### Test 3.5: Test Conversation Timestamp Update (Trigger)

**Run in Supabase SQL Editor:**

```sql
-- Check if conversation updated_at changed after adding message
SELECT id, created_at, updated_at
FROM conversations
WHERE id = 'YOUR_TEST_CONVERSATION_ID_HERE';
```

**Expected Result:**
- ✅ `updated_at` is more recent than `created_at`
- ✅ Confirms the trigger fired

---

### Test 3.6: Clean Up Test Data

**Run in Supabase SQL Editor:**

```sql
-- Delete test conversation (cascade will delete messages)
DELETE FROM conversations WHERE user_id = 'YOUR_TEST_USER_ID_HERE';
```

**Expected Result:**
- ✅ Conversation deleted
- ✅ Messages also deleted (cascade)

---

## Phase 4: Backend API Testing

### Test 4.1: Health Check

**Run in terminal:**

```bash
curl http://localhost:4000/api/health
```

**Expected Result:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-21T..."
}
```

---

### Test 4.2: Send Message (No Auth)

**Run in terminal:**

```bash
curl -X POST http://localhost:4000/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, I am feeling anxious about my symptoms"
  }'
```

**Expected Result:**
- ✅ Status 200
- ✅ JSON response with:
  - `response.full_response` (AI response text)
  - `conversationId` (temporary ID like `conv_1234567890`)
  - `safetyTriggered` (boolean)

---

### Test 4.3: Send Message (With User ID)

**Run in terminal:**

```bash
curl -X POST http://localhost:4000/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I am having trouble sleeping due to night sweats",
    "userId": "YOUR_TEST_USER_ID_HERE"
  }'
```

**Expected Result:**
- ✅ Status 200
- ✅ Response includes `conversationId` (real UUID from database)
- ✅ Response includes AI message

**Verify in Supabase Dashboard:**
1. Go to **Table Editor** → `conversations`
2. Should see a new conversation for your test user
3. Go to **Table Editor** → `messages`
4. Should see 2 messages (user message + AI response)

---

### Test 4.4: Get Conversation History

**First, get the conversation ID from Test 4.3, then:**

```bash
curl http://localhost:4000/api/chat/history/YOUR_CONVERSATION_ID_HERE
```

**Expected Result:**
- ✅ Status 200
- ✅ JSON with:
  - `conversationId`
  - `messages` array (2 messages: user + AI)

---

### Test 4.5: Get User Conversations

**Run in terminal:**

```bash
curl http://localhost:4000/api/chat/conversations/YOUR_TEST_USER_ID_HERE
```

**Expected Result:**
- ✅ Status 200
- ✅ JSON with:
  - `conversations` array
  - At least 1 conversation from Test 4.3

---

### Test 4.6: Safety Trigger Detection

**Run in terminal:**

```bash
curl -X POST http://localhost:4000/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I feel like I want to hurt myself",
    "userId": "YOUR_TEST_USER_ID_HERE"
  }'
```

**Expected Result:**
- ✅ Status 200
- ✅ `safetyTriggered: true`
- ✅ Response includes crisis resources

**Verify in Supabase Dashboard:**
1. Go to **Table Editor** → `safety_logs`
2. Should see a new entry with trigger phrase
3. `escalation_action` should be `resources_shown`

---

### Test 4.7: Delete Conversation

**Run in terminal:**

```bash
curl -X DELETE http://localhost:4000/api/chat/conversation/YOUR_CONVERSATION_ID_HERE \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_TEST_USER_ID_HERE"
  }'
```

**Expected Result:**
- ✅ Status 200
- ✅ `{ "success": true }`

**Verify in Supabase:**
- ✅ Conversation deleted from `conversations` table
- ✅ Messages deleted from `messages` table (cascade)

---

## Phase 5: Frontend Integration Testing

### Test 5.1: Frontend Loads Without Errors

**Steps:**
1. Open `http://localhost:3000` in browser
2. Open DevTools (F12) → Console

**Expected Result:**
- ✅ No Supabase configuration warnings
- ✅ No error messages
- ✅ Page loads correctly

---

### Test 5.2: Supabase Client Initialized

**Run in browser console:**

```javascript
// Check if Supabase is accessible (if exposed globally for debugging)
console.log(typeof window);
```

**Expected Result:**
- ✅ No errors about missing Supabase credentials

---

### Test 5.3: User Signup (If Auth Implemented)

**Steps:**
1. Navigate to signup page
2. Enter email: `newuser@menoai.com`
3. Enter password: `TestPassword123!`
4. Submit form

**Expected Result:**
- ✅ User created in Supabase Auth
- ✅ Redirected to dashboard/chat
- ✅ User session established

**Verify in Supabase Dashboard:**
- Go to **Authentication** → **Users**
- New user should appear

---

### Test 5.4: User Login (If Auth Implemented)

**Steps:**
1. Navigate to login page
2. Enter email: `test@menoai.com`
3. Enter password: `TestPassword123!`
4. Submit form

**Expected Result:**
- ✅ User authenticated
- ✅ Session token stored
- ✅ Redirected to chat interface

---

### Test 5.5: Send Message via Frontend

**Steps:**
1. Log in as test user
2. Navigate to chat interface
3. Type message: "I'm having hot flashes"
4. Send message

**Expected Result:**
- ✅ Message appears in chat UI
- ✅ AI response appears after ~2-3 seconds
- ✅ No errors in console

**Verify in Supabase:**
- Messages saved to database
- Conversation updated

---

## Phase 6: Data Retention Testing

### Test 6.1: Manual Anonymization Function

**Run in Supabase SQL Editor:**

```sql
-- Create a test conversation with expired retention date
INSERT INTO conversations (user_id, created_at, retention_expires_at)
VALUES (
  'YOUR_TEST_USER_ID_HERE',
  NOW() - INTERVAL '31 days',
  NOW() - INTERVAL '1 day'
)
RETURNING *;

-- Add a message to it
INSERT INTO messages (conversation_id, role, content)
VALUES (
  'CONVERSATION_ID_FROM_ABOVE',
  'user',
  'This is test content that should be redacted'
);

-- Run anonymization
SELECT anonymize_expired_conversations();

-- Check if conversation archived
SELECT id, archived FROM conversations WHERE id = 'CONVERSATION_ID_FROM_ABOVE';

-- Check if message redacted
SELECT content FROM messages WHERE conversation_id = 'CONVERSATION_ID_FROM_ABOVE';
```

**Expected Result:**
- ✅ Conversation `archived = true`
- ✅ Message content = `[REDACTED - Retention period expired]`
- ✅ Function returns success notice

---

## Phase 7: Performance Testing

### Test 7.1: Query Performance (Small Dataset)

**Run in Supabase SQL Editor:**

```sql
EXPLAIN ANALYZE
SELECT c.*, COUNT(m.id) as message_count
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
WHERE c.user_id = 'YOUR_TEST_USER_ID_HERE'
GROUP BY c.id
ORDER BY c.updated_at DESC;
```

**Expected Result:**
- ✅ Query completes in < 50ms
- ✅ Uses index scan (not sequential scan)

---

### Test 7.2: Safety Log Query Performance

**Run in Supabase SQL Editor:**

```sql
EXPLAIN ANALYZE
SELECT * FROM safety_logs
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

**Expected Result:**
- ✅ Uses index: `idx_safety_logs_created`
- ✅ Query completes quickly

---

## Test Results Summary

Use this table to track your testing progress:

| Phase | Test | Status | Notes |
|-------|------|--------|-------|
| 1.1 | Tables exist | ⬜ | |
| 1.2 | RLS enabled | ⬜ | |
| 1.3 | Policies exist | ⬜ | |
| 1.4 | Indexes exist | ⬜ | |
| 1.5 | Triggers exist | ⬜ | |
| 1.6 | Functions exist | ⬜ | |
| 1.7 | Views exist | ⬜ | |
| 2.1 | Create test user | ⬜ | |
| 2.2 | User in auth.users | ⬜ | |
| 3.1 | Create conversation | ⬜ | |
| 3.2 | Read own data | ⬜ | |
| 3.3 | RLS blocks others | ⬜ | |
| 3.4 | Create message | ⬜ | |
| 3.5 | Trigger updates timestamp | ⬜ | |
| 3.6 | Cascade delete | ⬜ | |
| 4.1 | Health check | ⬜ | |
| 4.2 | Send message (no auth) | ⬜ | |
| 4.3 | Send message (with user) | ⬜ | |
| 4.4 | Get history | ⬜ | |
| 4.5 | Get conversations | ⬜ | |
| 4.6 | Safety trigger | ⬜ | |
| 4.7 | Delete conversation | ⬜ | |
| 5.1 | Frontend loads | ⬜ | |
| 5.2 | Supabase client init | ⬜ | |
| 5.3 | User signup | ⬜ | |
| 5.4 | User login | ⬜ | |
| 5.5 | Send via frontend | ⬜ | |
| 6.1 | Anonymization works | ⬜ | |
| 7.1 | Query performance | ⬜ | |
| 7.2 | Safety query perf | ⬜ | |

---

## Common Issues & Solutions

### Issue: "relation 'auth.users' does not exist"

**Cause**: Supabase Auth not enabled or schema applied to wrong database

**Solution**: Verify you're in the correct Supabase project

---

### Issue: RLS blocks all queries (even service role)

**Cause**: Using anon key instead of service role key in backend

**Solution**: Verify `SUPABASE_SERVICE_ROLE_KEY` in backend `.env`

---

### Issue: Trigger not firing

**Cause**: Trigger may have been dropped or not created

**Solution**: Re-run trigger creation SQL:
```sql
DROP TRIGGER IF EXISTS update_conversation_on_message ON messages;
CREATE TRIGGER update_conversation_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();
```

---

### Issue: Frontend can't connect to backend

**Cause**: CORS or URL misconfiguration

**Solution**:
- Verify `FRONTEND_URL` in backend `.env`
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Restart both servers

---

## Next Steps After Testing

Once all tests pass:

1. ✅ **Deploy to staging/production**
2. ✅ **Set up monitoring** (PostHog, Sentry)
3. ✅ **Configure cron job** for anonymization
4. ✅ **Enable authentication providers** (Google OAuth)
5. ✅ **Implement Phase 3 features** per PRD

---

## Test Completion Sign-Off

**Tester Name**: _________________

**Date**: _________________

**All Tests Passed**: ⬜ Yes / ⬜ No

**Notes**:
```
_________________________________________
_________________________________________
_________________________________________
```

---

**End of Testing Checklist**
