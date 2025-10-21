# Supabase Setup Guide for MenoAI

This guide walks you through setting up the Supabase database for MenoAI, including authentication, database tables, Row Level Security (RLS), and backend/frontend configuration.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Create Supabase Project](#create-supabase-project)
3. [Run Database Schema](#run-database-schema)
4. [Verify Setup](#verify-setup)
5. [Configure Backend](#configure-backend)
6. [Configure Frontend](#configure-frontend)
7. [Set Up Cron Job](#set-up-cron-job)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- A Supabase account (free tier is sufficient for development)
- Node.js 18+ installed
- Git repository cloned locally

---

## Create Supabase Project

1. **Go to Supabase Dashboard**
   - Visit [https://supabase.com](https://supabase.com)
   - Sign in or create a free account

2. **Create New Project**
   - Click "New Project"
   - Choose your organization
   - Fill in project details:
     - **Name**: `menoai` (or your preferred name)
     - **Database Password**: Generate a strong password (save this!)
     - **Region**: Choose closest to your users
     - **Pricing Plan**: Free tier is fine for development

3. **Wait for Project Setup**
   - It takes 1-2 minutes to provision your database
   - You'll see a "Setting up project..." message

---

## Run Database Schema

### Step 1: Open SQL Editor

1. In your Supabase dashboard, navigate to:
   ```
   SQL Editor (left sidebar) → New Query
   ```

2. Copy the entire contents of `/docs/SUPABASE_SCHEMA.sql`

3. Paste into the SQL Editor

4. Click **RUN** (or press Cmd/Ctrl + Enter)

### Step 2: Verify Execution

You should see:
```
Success. No rows returned
```

This is normal! The schema creates tables, indexes, policies, functions, triggers, and views.

### What This Creates

The schema sets up:

- **3 Tables**:
  - `conversations` - User conversation sessions
  - `messages` - Individual messages within conversations
  - `safety_logs` - Safety escalation events

- **Row Level Security (RLS)**:
  - Users can only access their own data
  - Backend service role can bypass RLS for admin operations

- **Automated Functions**:
  - `update_conversation_timestamp()` - Auto-updates when messages added
  - `anonymize_expired_conversations()` - GDPR-compliant data retention

- **Indexes**:
  - Optimized for common queries (user conversations, safety monitoring)

- **Helper Views**:
  - `active_conversations_summary` - Dashboard queries
  - `safety_monitoring_summary` - Safety analytics

---

## Verify Setup

### Check Tables Exist

Run this in the SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('conversations', 'messages', 'safety_logs');
```

**Expected output**: 3 rows showing the table names

### Check RLS Is Enabled

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('conversations', 'messages', 'safety_logs');
```

**Expected output**: All tables should have `rowsecurity = true`

### Check Policies Exist

```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('conversations', 'messages', 'safety_logs')
ORDER BY tablename, policyname;
```

**Expected output**: Should show ~11 policies

### Check Triggers Exist

```sql
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

**Expected output**: Should show the `update_conversation_on_message` trigger

---

## Configure Backend

### Step 1: Get Supabase Credentials

In your Supabase Dashboard:

1. Go to **Settings** → **API**

2. Copy the following:
   - **Project URL** (e.g., `https://abcdefghij.supabase.co`)
   - **Service Role Key** (secret key - starts with `eyJhbGci...`)
     - ⚠️ **IMPORTANT**: This is a secret key! Never commit it to Git or expose it client-side

### Step 2: Configure Environment Variables

1. Navigate to your backend folder:
   ```bash
   cd packages/backend
   ```

2. Create/update `.env` file:
   ```bash
   # Backend Environment Variables
   SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...YOUR_SERVICE_ROLE_KEY
   OPENAI_API_KEY=sk-...YOUR_OPENAI_KEY
   PORT=4000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

3. Replace `YOUR_PROJECT_ID` and `YOUR_SERVICE_ROLE_KEY` with your actual values

### Step 3: Test Backend Connection

```bash
npm run dev
```

You should see:
```
✅ MenoAI Backend running on http://0.0.0.0:4000
```

And **NOT** see:
```
⚠️  Supabase credentials not configured
```

---

## Configure Frontend

### Step 1: Get Public Credentials

In your Supabase Dashboard:

1. Go to **Settings** → **API**

2. Copy the following:
   - **Project URL** (same as backend)
   - **Anon Public Key** (starts with `eyJhbGci...`)
     - ✅ This is safe to expose client-side

### Step 2: Configure Environment Variables

1. Navigate to your frontend folder:
   ```bash
   cd packages/frontend
   ```

2. Create/update `.env.local` file:
   ```bash
   # Frontend Environment Variables
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...YOUR_ANON_KEY

   # Backend API URL (for local development)
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

3. Replace with your actual values

### Step 3: Test Frontend Connection

```bash
npm run dev
```

Visit `http://localhost:3000` and check the browser console. You should **NOT** see:
```
⚠️  Supabase credentials not configured
```

---

## Set Up Cron Job

Supabase can automatically run the anonymization function daily for GDPR compliance.

### Option 1: Using Supabase Dashboard

1. Go to **Database** → **Cron Jobs** (if available in your plan)

2. Create a new cron job:
   - **Name**: `anonymize-conversations`
   - **Schedule**: `0 2 * * *` (daily at 2 AM UTC)
   - **SQL**: `SELECT anonymize_expired_conversations();`

### Option 2: Using SQL (Requires pg_cron Extension)

Run this in the SQL Editor:

```sql
SELECT cron.schedule(
    'anonymize-conversations',
    '0 2 * * *',
    'SELECT anonymize_expired_conversations()'
);
```

**Note**: The `pg_cron` extension may not be available on the free tier. You can also run this manually or via a backend scheduled task.

### Option 3: Manual Execution (Testing)

To test the anonymization function:

```sql
SELECT anonymize_expired_conversations();
```

This will archive conversations older than 30 days and redact their content.

---

## Testing

### Test 1: Create a Test User

1. In Supabase Dashboard, go to **Authentication** → **Users**

2. Click **Add User** → **Create New User**
   - Email: `test@example.com`
   - Password: `TestPassword123!`
   - Auto Confirm User: ✅ (check this)

3. Click **Create User**

4. **Copy the User ID** (UUID format, e.g., `550e8400-e29b-41d4-a716-446655440000`)

### Test 2: Test RLS Policies

Run this in the SQL Editor to simulate authenticated queries:

```sql
-- Test as the test user (replace USER_ID with actual UUID)
SET request.jwt.claims.sub = 'YOUR_USER_ID_HERE';

-- Create a test conversation
INSERT INTO conversations (user_id)
VALUES ('YOUR_USER_ID_HERE')
RETURNING *;

-- Verify you can read your own conversation
SELECT * FROM conversations WHERE user_id = 'YOUR_USER_ID_HERE';

-- Clean up test data
DELETE FROM conversations WHERE user_id = 'YOUR_USER_ID_HERE';
```

### Test 3: Test Backend API

With both backend and frontend running:

```bash
# Terminal 1 - Backend
cd packages/backend
npm run dev

# Terminal 2 - Frontend
cd packages/frontend
npm run dev
```

Test the chat endpoint:

```bash
curl -X POST http://localhost:4000/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, I am feeling anxious about my symptoms",
    "userId": "YOUR_USER_ID_HERE"
  }'
```

**Expected**: JSON response with AI message and conversation ID

### Test 4: Test Frontend Integration

1. Open `http://localhost:3000` in your browser

2. Open browser DevTools (F12) → Console

3. Try the chat interface (if implemented)

4. Check that messages are saved to Supabase:
   - Go to Supabase Dashboard → **Table Editor** → `conversations`
   - You should see your conversation

---

## Troubleshooting

### Issue: "relation 'auth.users' does not exist"

**Cause**: Trying to reference auth.users before Supabase Auth is enabled

**Solution**: Supabase Auth is automatically enabled. Ensure you're running the schema in the correct project.

### Issue: Backend shows "Supabase not configured"

**Cause**: Environment variables not loaded

**Solution**:
1. Verify `.env` file exists in `packages/backend/`
2. Verify it contains `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
3. Restart the backend server

### Issue: RLS policies block all queries

**Cause**: Queries not authenticated properly

**Solution**:
- Frontend queries: Ensure user is logged in via Supabase Auth
- Backend queries: Ensure using `supabaseAdmin` (service role) client
- The service role key bypasses RLS for admin operations

### Issue: "duplicate key value violates unique constraint"

**Cause**: Running the schema multiple times

**Solution**:
- The schema uses `CREATE TABLE IF NOT EXISTS`, so it's safe to re-run
- For policies, drop existing ones first:
  ```sql
  DROP POLICY IF EXISTS "policy_name" ON table_name;
  ```

### Issue: Foreign key constraint violation

**Cause**: Trying to create conversations for non-existent users

**Solution**:
- Ensure the `user_id` corresponds to an actual user in `auth.users`
- Create users via Supabase Auth (email signup, Google OAuth, etc.)

---

## Next Steps

After successful setup:

1. ✅ **Enable Authentication Providers**
   - Go to **Authentication** → **Providers**
   - Enable Email and/or Google OAuth

2. ✅ **Set Up Email Templates** (Optional)
   - Go to **Authentication** → **Email Templates**
   - Customize confirmation and password reset emails

3. ✅ **Configure Storage** (Future Phase)
   - For user profile pictures or attachments
   - Go to **Storage** → Create buckets

4. ✅ **Set Up Monitoring** (Future Phase)
   - Consider PostHog or Sentry for error tracking
   - Use the `safety_monitoring_summary` view for safety analytics

5. ✅ **Deploy to Production**
   - Update environment variables in Netlify (frontend) and Render (backend)
   - Use production Supabase credentials (create a separate production project)

---

## Database Schema Reference

### Tables

| Table | Purpose |
|-------|---------|
| `conversations` | Groups messages into sessions, linked to auth.users |
| `messages` | Individual user/AI messages with emotion/intent/need tags |
| `safety_logs` | Logs safety escalation events for monitoring |

### Key Relationships

```
auth.users (managed by Supabase Auth)
    ↓
conversations (user_id references auth.users.id)
    ↓
messages (conversation_id references conversations.id)
    ↓
safety_logs (message_id references messages.id)
```

### Important Notes

- **No custom users table**: We use Supabase Auth's built-in `auth.users`
- **RLS enforced**: Users can only access their own data
- **Service role bypasses RLS**: Backend can perform admin operations
- **GDPR-compliant**: 30-day retention with automatic anonymization
- **Cascading deletes**: Deleting a conversation deletes all its messages

---

## Support

If you encounter issues:

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review the [MenoAI PRD.md](/docs/PRD.md) for architecture details
3. Check Supabase Dashboard → **Logs** for database errors
4. Review backend logs for API errors

---

**Setup Complete!** 🎉

Your Supabase database is now configured and ready for MenoAI.
