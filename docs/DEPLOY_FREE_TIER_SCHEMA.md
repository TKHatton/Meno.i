# Deploy Free Tier Database Schema to Supabase

**Estimated Time:** 5-10 minutes

---

## Prerequisites

- ✅ Supabase project created
- ✅ Access to Supabase Dashboard
- ✅ `FREE_TIER_SCHEMA.sql` file ready

---

## Step-by-Step Deployment

### Step 1: Access Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project (or create a new one if needed)
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"** button

### Step 2: Copy the SQL Schema

1. Open the file: `/workspaces/Meno.i/docs/FREE_TIER_SCHEMA.sql`
2. Copy the **entire contents** of the file
3. Paste it into the Supabase SQL Editor

### Step 3: Run the SQL

1. Click the **"Run"** button (or press `Ctrl/Cmd + Enter`)
2. Wait for execution to complete (~10-30 seconds)
3. Look for success message at the bottom

**Expected Output:**
```
Success. No rows returned
```

### Step 4: Verify Tables Were Created

Run this verification query in a **new query**:

```sql
-- Check all new tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user_profiles', 'symptom_logs', 'journal_entries', 'contact_submissions')
ORDER BY table_name;
```

**Expected Result:** 4 rows
```
contact_submissions
journal_entries
symptom_logs
user_profiles
```

### Step 5: Verify RLS Policies

Run this query to check Row Level Security is enabled:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('user_profiles', 'symptom_logs', 'journal_entries', 'contact_submissions')
ORDER BY tablename;
```

**Expected Result:** All tables should show `rowsecurity = true`

### Step 6: Verify Indexes

Run this query to check indexes were created:

```sql
-- Check indexes exist
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('user_profiles', 'symptom_logs', 'journal_entries', 'contact_submissions')
ORDER BY tablename, indexname;
```

**Expected Result:** Multiple indexes per table

### Step 7: Verify Triggers

Run this query to check triggers were created:

```sql
-- Check triggers exist
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN ('user_profiles', 'symptom_logs', 'journal_entries')
ORDER BY event_object_table;
```

**Expected Result:** 3 triggers (one for each table except contact_submissions)

---

## Verification Checklist

After running the schema, verify:

- [ ] **4 tables created** (user_profiles, symptom_logs, journal_entries, contact_submissions)
- [ ] **RLS enabled** on all 4 tables
- [ ] **Indexes created** (at least 1 per table)
- [ ] **Triggers created** (3 total for auto-updating timestamps)
- [ ] **No errors** in SQL execution

---

## Common Issues & Solutions

### Issue 1: "relation already exists"

**Cause:** Tables were already created in a previous run

**Solution:**
- This is OK! The schema uses `CREATE TABLE IF NOT EXISTS`
- Tables won't be recreated if they already exist
- RLS policies might show "already exists" warnings - this is fine

### Issue 2: "permission denied"

**Cause:** Not using a privileged role

**Solution:**
- Make sure you're logged into Supabase Dashboard as the project owner
- The SQL Editor should automatically use the correct role

### Issue 3: "syntax error"

**Cause:** Incomplete SQL paste or corrupted file

**Solution:**
- Re-copy the ENTIRE `FREE_TIER_SCHEMA.sql` file
- Make sure to get all ~350 lines
- Paste into a fresh query window

---

## Test Data (Optional)

After schema deployment, you can insert test data to verify everything works.

**Important:** Replace `'YOUR_USER_ID'` with your actual user ID from `auth.users`:

```sql
-- Get your user ID first
SELECT id, email FROM auth.users LIMIT 5;
```

Then insert test data:

```sql
-- Test symptom log
INSERT INTO symptom_logs (user_id, log_date, symptoms, energy_level, notes)
VALUES (
  'YOUR_USER_ID',
  CURRENT_DATE,
  '{"hot_flashes": 4, "anxiety": 3, "sleep_issues": 5}'::jsonb,
  3,
  'Test symptom log - having a rough day with hot flashes.'
);

-- Test journal entry
INSERT INTO journal_entries (user_id, entry_date, content, mood_rating)
VALUES (
  'YOUR_USER_ID',
  CURRENT_DATE,
  'Test journal entry - Today was challenging but I''m learning to be kind to myself.',
  2
);

-- Test profile update
INSERT INTO user_profiles (id, display_name, menopause_stage, primary_concerns, onboarding_completed)
VALUES (
  'YOUR_USER_ID',
  'Test User',
  'perimenopause',
  ARRAY['hot_flashes', 'sleep_issues'],
  true
)
ON CONFLICT (id) DO UPDATE
SET
  menopause_stage = EXCLUDED.menopause_stage,
  primary_concerns = EXCLUDED.primary_concerns,
  onboarding_completed = EXCLUDED.onboarding_completed;
```

**Verify test data:**

```sql
-- Check your symptom logs
SELECT * FROM symptom_logs WHERE user_id = 'YOUR_USER_ID';

-- Check your journal entries
SELECT * FROM journal_entries WHERE user_id = 'YOUR_USER_ID';

-- Check your profile
SELECT * FROM user_profiles WHERE id = 'YOUR_USER_ID';
```

---

## Next Steps After Deployment

Once the schema is deployed:

1. ✅ **Start the backend server** to test API endpoints
2. ✅ **Test API endpoints** with Postman/Insomnia
3. ✅ **Move to Phase 2** (Onboarding Flow - Frontend)

---

## Rollback (If Needed)

If something goes wrong and you need to start over:

```sql
-- WARNING: This deletes all data!
DROP TABLE IF EXISTS contact_submissions CASCADE;
DROP TABLE IF EXISTS journal_entries CASCADE;
DROP TABLE IF EXISTS symptom_logs CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
```

Then re-run the `FREE_TIER_SCHEMA.sql` file.

---

## Support

If you encounter issues:

1. Check the **Supabase Dashboard → Database → Logs** for errors
2. Verify your Supabase project is active (not paused)
3. Check that you have storage space available
4. Review the verification queries above

---

**🎉 Once complete, you'll have:**
- 4 new tables with proper structure
- Row Level Security protecting all data
- Indexes for fast queries
- Triggers for auto-updating timestamps
- Ready to accept API requests from the backend

**Next: Test the backend API endpoints!**
