# Free Tier Database Upgrade Guide

**For existing Supabase databases with user_profiles table**

---

## ✅ What This Migration Does

This migration script will **safely upgrade** your existing database:

1. **Adds 3 new columns** to your existing `user_profiles` table:
   - `menopause_stage` - User's menopause stage
   - `primary_concerns` - Array of up to 2 primary concerns
   - `onboarding_completed` - Boolean flag for onboarding completion

2. **Creates 3 new tables**:
   - `symptom_logs` - Daily symptom tracking
   - `journal_entries` - User journal entries
   - `contact_submissions` - Contact form submissions

3. **Sets up security**: RLS policies, indexes, triggers

---

## 🚀 Quick Start (5 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** → **"New query"**

### Step 2: Run the Migration

1. Open file: `/workspaces/Meno.i/docs/MIGRATION_FREE_TIER.sql`
2. **Copy the entire file** (all ~400 lines)
3. **Paste** into Supabase SQL Editor
4. Click **"Run"** (or Ctrl/Cmd + Enter)

### Step 3: Check the Output

You should see messages like:
```
NOTICE: Added column: menopause_stage
NOTICE: Added column: primary_concerns
NOTICE: Added column: onboarding_completed
NOTICE: ✅ All 4 tables exist
NOTICE: ✅ user_profiles has all 3 new columns
NOTICE: ✅ RLS enabled on all 4 tables
NOTICE: 🎉 FREE TIER MIGRATION COMPLETE!
```

---

## ✅ Verify Migration Success

Run this query to verify everything worked:

```sql
-- Check all tables and columns exist
SELECT
    'user_profiles' as table_name,
    EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_profiles' AND column_name = 'menopause_stage'
    ) as has_menopause_stage,
    EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_profiles' AND column_name = 'primary_concerns'
    ) as has_primary_concerns,
    EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_profiles' AND column_name = 'onboarding_completed'
    ) as has_onboarding_completed
UNION ALL
SELECT
    table_name,
    true as col1,
    true as col2,
    true as col3
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('symptom_logs', 'journal_entries', 'contact_submissions');
```

**Expected Result:** All tables should show `true` for all columns.

---

## 🧪 Test with Sample Data (Optional)

Insert test data to verify everything works:

```sql
-- Get your user ID
SELECT id, email FROM auth.users LIMIT 1;
```

Then (replace `YOUR_USER_ID`):

```sql
-- Test updating profile with onboarding data
UPDATE user_profiles
SET
    menopause_stage = 'perimenopause',
    primary_concerns = ARRAY['hot_flashes', 'sleep_issues'],
    onboarding_completed = true
WHERE id = 'YOUR_USER_ID';

-- Test creating a symptom log
INSERT INTO symptom_logs (user_id, log_date, symptoms, energy_level, notes)
VALUES (
    'YOUR_USER_ID',
    CURRENT_DATE,
    '{"hot_flashes": 4, "anxiety": 3}'::jsonb,
    3,
    'Test entry'
);

-- Test creating a journal entry
INSERT INTO journal_entries (user_id, entry_date, content, mood_rating)
VALUES (
    'YOUR_USER_ID',
    CURRENT_DATE,
    'Test journal entry - feeling good today!',
    3
);

-- Verify the data
SELECT * FROM user_profiles WHERE id = 'YOUR_USER_ID';
SELECT * FROM symptom_logs WHERE user_id = 'YOUR_USER_ID';
SELECT * FROM journal_entries WHERE user_id = 'YOUR_USER_ID';
```

---

## ⚠️ Important Notes

### Safe to Run Multiple Times
- This migration is **idempotent** (safe to run multiple times)
- It will NOT recreate existing tables or columns
- It will only ADD missing pieces

### No Data Loss
- **Your existing data is safe!**
- The script only ADDS columns, never DROPS them
- Existing `user_profiles` data remains untouched

### What If Something Goes Wrong?
The script checks everything before making changes:
- If a column exists, it skips creating it
- If a table exists, it skips creating it
- If a policy exists, it skips creating it

---

## 🎯 After Migration: Test the Backend

Now you can test your backend API endpoints:

```bash
# Start the backend
npm run dev:backend

# In another terminal, test an endpoint
curl http://localhost:4000/api/health
```

**Test the new endpoints:**

```bash
# Get user profile
curl http://localhost:4000/api/profile/YOUR_USER_ID

# Create symptom log
curl -X POST http://localhost:4000/api/symptoms/log \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "YOUR_USER_ID",
    "log_date": "2025-10-25",
    "symptoms": {"hot_flashes": 4, "anxiety": 3},
    "energy_level": 3,
    "notes": "Test day"
  }'

# Get symptom history
curl http://localhost:4000/api/symptoms/history/YOUR_USER_ID?days=7
```

---

## 📊 What Changed in Your Database

### Before Migration:
```
user_profiles (existing table)
├── id
├── full_name
├── display_name
├── bio
├── avatar_url
├── created_at
└── updated_at
```

### After Migration:
```
user_profiles (upgraded table)
├── id
├── full_name
├── display_name
├── bio
├── avatar_url
├── menopause_stage ⬅️ NEW
├── primary_concerns ⬅️ NEW
├── onboarding_completed ⬅️ NEW
├── created_at
└── updated_at

symptom_logs (new table)
├── id
├── user_id
├── log_date
├── symptoms (JSONB)
├── energy_level
├── notes
├── created_at
└── updated_at

journal_entries (new table)
├── id
├── user_id
├── entry_date
├── content
├── mood_rating
├── created_at
└── updated_at

contact_submissions (new table)
├── id
├── name
├── email
├── message
├── status
└── created_at
```

---

## 🎉 Success!

Once the migration completes successfully, you're ready to:

1. ✅ **Test the backend API** (all endpoints should work)
2. ✅ **Move to Phase 2**: Build the Onboarding Flow (frontend)
3. ✅ **Start tracking symptoms and journaling!**

---

## Need Help?

If you encounter errors:

1. **Check the error message** in the SQL Editor output
2. **Verify your Supabase project is active** (not paused)
3. **Run the verification query** above to see what's missing
4. **Share the error message** and I'll help troubleshoot

---

**Next Step:** Test the backend API endpoints to ensure everything works!
