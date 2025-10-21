## Project Context

**Project:** MenoAI (Meno.I)  
**Goal:** Emotional intelligence companion for menopause support  
**Stack:**
- Frontend → Next.js 14 + TailwindCSS (Netlify)
- Backend → Node.js + Express + TypeScript (Render)
- Database → Supabase (Postgres + Auth + RLS)
- Auth → Supabase Auth (email + Google)
- AI → OpenAI GPT-4 API
- Monitoring → PostHog + Sentry

---

## Your Objectives

### 1. Repository Audit & Correction
Inspect the repository for:
- Correct linking between **frontend**, **backend**, and **shared** folders.
- Proper package.json references and TypeScript path resolutions.
- Valid `.env` file handling:
  - Frontend must only use `NEXT_PUBLIC_` prefixed variables.
  - Backend must load sensitive keys via `dotenv/config`.
  - Shared package should never contain secrets.

If mismatches or missing references exist, fix them safely and clearly explain what was changed.

---

### 2. Supabase Alignment
Generate and/or update the database schema and Supabase logic so that it exactly matches this structure and can be pasted directly into the **Supabase SQL Editor** to create the database properly.

Your generated output should include:
- A **complete and copy-pasteable SQL script** (ready to run in Supabase)
- All **RLS policies**
- **Index creation statements**
- **Trigger functions** for anonymization and conversation timestamp updates
- Any **fixes for table name mismatches** (e.g., capitalization or typos)

Use this reference schema as the source of truth:

- Tables:  
  - `conversations`  
  - `messages`  
  - `safety_logs`
- Relationships:  
  - `messages.conversation_id → conversations.id`  
  - `conversations.user_id → auth.users.id`  
- RLS:
  - Users can only read/write their own conversations and messages
  - Safety logs are readable only by the user and writable by the service role
- Functions:  
  - `update_conversation_timestamp()`
  - `anonymize_expired_conversations()`

Be sure to include all column definitions, comments, and example policies for immediate use.

---

### 3. Backend Integration
Confirm that the backend (`packages/backend`) correctly:
- Connects to Supabase via service role key
- Includes proper TypeScript typings for Supabase responses
- Handles:
  - `createConversation`
  - `addMessage`
  - `getUserConversations`
  - `logSafetyEvent`
- Updates `/src/services/db.ts` or equivalent to reflect the latest schema.
- Ensures local `.env` and deployment configs (`render.yaml`) point to Supabase variables.

---

### 4. Documentation Output
When finished, generate:
- ✅ Updated `docs/SUPABASE_SCHEMA.sql` (full schema)
- ✅ A clear “Setup Guide for Supabase” (e.g., `docs/SUPABASE_SETUP.md`)
  - Step-by-step SQL execution order
  - Where to paste code in Supabase
  - How to verify RLS and tables exist
- ✅ Summary of any file changes made during this update
- ✅ Confirmation that backend/frontend connections work locally

---

### 5. Deliverables
After completion, provide:
1. A full commit summary
2. A clear “Testing Checklist” for verifying Supabase integration (from both frontend and backend)
3. Next-step suggestions (e.g., for Phase 3: conversation history, safety dashboard, streaming messages)

**Commit message to use:**

---

### Important
Do not remove working code — migrate and extend safely.  
Explain every new or changed file clearly.  
Confirm that all SQL statements execute successfully in Supabase without errors before committing them.
