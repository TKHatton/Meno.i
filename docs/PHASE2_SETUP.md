# Phase 2 Implementation Guide

This guide walks you through setting up OpenAI and Supabase to unlock the full functionality of MenoAI.

---

## What's Been Implemented

✅ **OpenAI Integration**
- Real GPT-4 responses with 4-step framework
- Automatic fallback to mock responses if API key not configured
- Conversation context support (last 3 turns)
- Emotion and need detection

✅ **Supabase Database**
- Full CRUD operations for messages and conversations
- Safety event logging
- 30-day retention support
- User conversation management

✅ **Authentication**
- Email/password sign-up and sign-in
- Google OAuth support
- Guest mode (no auth required)
- Auth provider context across frontend

✅ **Backend Integration**
- Database persistence for all messages
- Conversation history retrieval
- Safety event logging
- Optional auth middleware

---

## Setup Instructions

### Step 1: Get OpenAI API Key

1. Go to https://platform.openai.com/
2. Create an account or sign in
3. Navigate to **API Keys** in the left sidebar
4. Click **Create new secret key**
5. Copy the key (starts with `sk-`)

### Step 2: Create Supabase Project

1. Go to https://supabase.com
2. Click **Start your project**
3. Create a new organization (if needed)
4. Click **New Project**
5. Fill in:
   - **Name:** menoai (or your choice)
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to your users (UK/EU for this project)
6. Click **Create new project** (takes ~2 minutes)

### Step 3: Set Up Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire contents of `/docs/SUPABASE_SCHEMA.sql` from this repository
4. Paste into the SQL editor
5. Click **Run** (bottom right)
6. Verify: Go to **Table Editor** and you should see:
   - users
   - conversations
   - messages
   - safety_logs

### Step 4: Configure Supabase Auth

1. In Supabase, go to **Authentication** → **Providers**
2. **Enable Email provider:**
   - Toggle **Enable Email provider** to ON
   - Enable **Confirm email** (recommended for production)
   - Save

3. **Enable Google OAuth (optional):**
   - Click on **Google** provider
   - Toggle to **Enabled**
   - In Google Cloud Console:
     - Go to https://console.cloud.google.com
     - Create a new project or select existing
     - Enable Google+ API
     - Go to **Credentials** → **Create Credentials** → **OAuth Client ID**
     - Application type: **Web application**
     - Authorized redirect URIs: Copy from Supabase (shown in the Google provider settings)
   - Copy **Client ID** and **Client Secret** to Supabase
   - Save

### Step 5: Get Supabase API Keys

1. In Supabase, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://abcdefghij.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`) - Keep this secret!

### Step 6: Configure Backend Environment

1. Navigate to backend directory:
   ```bash
   cd packages/backend
   ```

2. Copy environment template:
   ```bash
   cp ../../.env.example .env
   ```

3. Edit `.env` and add your keys:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key
   OPENAI_API_KEY=sk-your-openai-key-here
   PORT=4000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

### Step 7: Configure Frontend Environment

1. Navigate to frontend directory:
   ```bash
   cd packages/frontend
   ```

2. Create `.env.local`:
   ```bash
   touch .env.local
   ```

3. Add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

### Step 8: Rebuild and Restart

1. Navigate to root directory:
   ```bash
   cd ../..
   ```

2. Rebuild shared package:
   ```bash
   cd packages/shared && npm run build && cd ../..
   ```

3. Restart both servers:
   ```bash
   npm run dev
   ```

4. You should see:
   ```
   ✅ MenoAI Backend running on http://localhost:4000
   📝 Environment: development
   🔗 Frontend URL: http://localhost:3000
   ```

---

## Testing Phase 2 Features

### Test 1: OpenAI Integration

1. Open http://localhost:3000
2. Click **Start Chatting**
3. Send a message: "I'm feeling overwhelmed by hot flashes"
4. Verify you get a GPT-4 response (not mock data)
5. Check backend console - should show OpenAI API call logs

**Expected behavior:**
- Response is unique and contextual (not from the 3 mock responses)
- Response follows 4-step framework
- Backend logs show OpenAI API call

### Test 2: User Authentication

1. On homepage, click **Sign In**
2. Click **Sign Up** at bottom of modal
3. Enter email and password
4. Click **Sign Up**
5. Check your email for confirmation (if enabled in Supabase)
6. After confirming, sign in with your credentials

**Expected behavior:**
- Modal shows success message
- Email confirmation sent (if enabled)
- After sign-in, homepage shows "Welcome back, your@email.com"

### Test 3: Google OAuth (if configured)

1. Click **Sign In** on homepage
2. Click **Google** button
3. Complete Google sign-in flow
4. Should redirect back to chat interface

**Expected behavior:**
- Google OAuth popup appears
- After auth, redirected to /chat
- Signed in as Google user

### Test 4: Database Persistence

1. Sign in to your account
2. Go to chat interface
3. Send a message
4. Check Supabase:
   - Go to **Table Editor** → **conversations**
   - You should see a new conversation row
   - Go to **messages** table
   - You should see both user and AI messages

**Expected behavior:**
- Conversation created with your user_id
- Messages saved with correct role, content, emotion_tag
- Safety level recorded

### Test 5: Conversation History

1. Send multiple messages in a conversation
2. Reload the page
3. Open browser dev tools → Network tab
4. Send another message
5. Check the conversation context in backend logs

**Expected behavior:**
- Previous messages maintained in context
- AI references earlier parts of conversation
- Backend logs show conversation history being loaded

### Test 6: Safety Detection + Logging

1. Send a high-risk message: "I can't handle this anymore"
2. Safety modal should appear
3. Check Supabase **safety_logs** table

**Expected behavior:**
- Modal appears with crisis resources
- Safety log created with trigger_phrase
- Message marked with safety_level='high'

### Test 7: Guest Mode (No Auth)

1. Sign out (or use incognito window)
2. Go to chat without signing in
3. Send a message

**Expected behavior:**
- Can still chat without account
- Messages NOT saved to database
- Temporary conversation ID used
- Mock responses OR OpenAI responses (depending on config)

---

## Troubleshooting

### OpenAI API Errors

**Error:** `Invalid API key`
- Check your `.env` file in `packages/backend`
- Ensure key starts with `sk-`
- Verify no extra spaces or quotes

**Error:** `Rate limit exceeded`
- OpenAI free tier has limits
- Upgrade to paid plan or wait for reset

**Error:** `Model not found`
- Ensure you have access to `gpt-4`
- Try changing to `gpt-3.5-turbo` in `ai.ts` line 186

### Supabase Connection Errors

**Error:** `Invalid API key`
- Check `SUPABASE_URL` and keys in `.env` files
- Ensure frontend uses `NEXT_PUBLIC_` prefix
- Verify keys are copied correctly (they're long!)

**Error:** `Row Level Security policy violation`
- Check that RLS policies were created (see schema)
- Verify user is authenticated when accessing protected data
- Review policies in Supabase **Authentication** → **Policies**

**Error:** `relation "messages" does not exist`
- Schema not run successfully
- Go back to Step 3 and run the SQL schema again
- Check SQL Editor for errors

### Authentication Errors

**Error:** `Email not confirmed`
- Check your email for confirmation link
- Or disable email confirmation in Supabase Auth settings
- In Supabase: **Authentication** → **Providers** → **Email** → Uncheck "Confirm email"

**Error:** `Google OAuth redirect mismatch`
- Verify redirect URI in Google Cloud Console matches Supabase
- Check that Google provider is enabled in Supabase
- Ensure `NEXT_PUBLIC_SUPABASE_URL` is correct

**Error:** `User undefined in ChatInterface`
- Check that AuthProvider wraps your app in `layout.tsx`
- Verify Supabase client is configured correctly
- Check browser console for auth errors

---

## Verification Checklist

Use this checklist to ensure Phase 2 is fully working:

- [ ] Backend starts without Supabase/OpenAI warnings
- [ ] Frontend loads without console errors
- [ ] Can sign up with email/password
- [ ] Can sign in with existing account
- [ ] Google OAuth works (if configured)
- [ ] Messages get real GPT-4 responses (not mock)
- [ ] Messages persist to Supabase when authenticated
- [ ] Can view conversation history in Supabase Table Editor
- [ ] Safety triggers log to `safety_logs` table
- [ ] Guest mode works without authentication
- [ ] Backend logs show OpenAI API calls
- [ ] Backend logs show database saves

---

## Cost Estimates

### OpenAI API (GPT-4)
- **Input:** ~$0.03 per 1K tokens
- **Output:** ~$0.06 per 1K tokens
- **Average message cost:** ~$0.01-0.02
- **100 messages/day:** ~$1-2/day

### Supabase
- **Free tier:** Up to 500MB database, 50,000 monthly active users
- **Paid tier:** $25/month for more resources
- **Phase 2 usage:** Free tier is sufficient

### Total Estimated Monthly Cost
- **Development:** ~$30-60/month (mostly OpenAI)
- **MVP with 10 users:** ~$50-100/month
- **100 active users:** ~$200-400/month

---

## Next Steps After Phase 2

Once Phase 2 is working:

1. **Deploy to Production**
   - Follow deployment guide in main README
   - Set environment variables in Netlify and Render dashboards

2. **Phase 3: Enhanced Safety**
   - Implement admin dashboard for safety logs
   - Add sentiment analysis
   - Set up alerts for high-risk conversations

3. **Phase 4: Advanced Features**
   - Streaming responses (SSE)
   - Pattern recognition (recurring topics)
   - Weekly summary emails

---

## Support

If you encounter issues not covered here:

1. Check backend console logs for errors
2. Check browser console for frontend errors
3. Review Supabase logs: **Logs** → **API Logs**
4. Verify all environment variables are set correctly
5. Ensure all dependencies are installed (`npm run install:all`)

---

**Ready to test?** Start with Test 1 (OpenAI) to verify the core functionality! 🚀
