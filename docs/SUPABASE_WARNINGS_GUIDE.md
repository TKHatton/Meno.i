# Supabase Security Warnings - Complete Fix Guide

## Overview

You have **7 warnings** in Supabase that need to be addressed:
- **6 warnings**: Function security issues (fixed with SQL)
- **1 warning**: Auth security setting (fixed in dashboard)

---

## Summary of All Warnings

### Functions with Mutable Search Path (6 warnings)

These functions are vulnerable to search path injection attacks because they don't explicitly set their search_path:

1. ✅ `public.update_conversation_timestamp`
2. ✅ `public.update_journal_entry_timestamp`
3. ✅ `public.anonymize_expired_conversations`
4. ✅ `public.create_user_profile`
5. ✅ `public.update_user_profile_timestamp`
6. ✅ `public.update_symptom_log_timestamp`

**Fix**: Add `SET search_path = ''` to each function

### Auth Security Setting (1 warning)

7. ⚠️ **HaveIBeenPwned password check not enabled**

**Fix**: Enable in Supabase Dashboard → Authentication → Settings

---

## How to Fix All Warnings

### Step 1: Run SQL Migration (Fixes 6/7 Warnings)

1. Go to **Supabase Dashboard**
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `/workspaces/Meno.i/docs/FIX_SUPABASE_WARNINGS.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

**What this does:**
- Recreates all 6 functions with `SET search_path = ''`
- Uses fully qualified table names (e.g., `public.conversations`)
- Recreates triggers to ensure they're linked to updated functions
- Secures functions against search path injection attacks

**Expected Output:**
```
Success. No rows returned
```

### Step 2: Enable HaveIBeenPwned (Fixes 1/7 Warnings)

1. Go to **Supabase Dashboard**
2. Navigate to **Authentication** → **Settings**
3. Scroll down to the **"Security and Protection"** section
4. Find **"Password breach detection (HaveIBeenPwned)"**
5. **Toggle it ON** (should turn blue/green)
6. Click **Save** at the bottom of the page

**What this does:**
- Checks user passwords against the HaveIBeenPwned database
- Prevents users from using passwords exposed in data breaches
- Significantly improves account security
- No impact on existing users, only applies to new signups/password changes

---

## Verification

### Verify SQL Fixes (6 functions)

Run this query in SQL Editor to check that search_path is set:

```sql
SELECT
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    CASE
        WHEN p.proconfig IS NULL THEN 'NOT SET ❌'
        WHEN p.proconfig::text LIKE '%search_path%' THEN 'SET ✅'
        ELSE 'NOT SET ❌'
    END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'update_conversation_timestamp',
    'update_journal_entry_timestamp',
    'anonymize_expired_conversations',
    'create_user_profile',
    'update_user_profile_timestamp',
    'update_symptom_log_timestamp'
);
```

**Expected Result:**
All 6 functions should show `SET ✅` in the `search_path_status` column.

### Verify Auth Setting

1. Go to **Supabase Dashboard** → **Database** → **Advisors**
2. Check if the "Auth - HaveIBeenPwned" warning is gone
3. Or try creating a test account with password `password123` - should be rejected

---

## What is Search Path Injection?

**The Problem:**
Functions without a set search_path can be tricked into using malicious tables/functions from a different schema. An attacker could create their own schema with malicious tables that match the function's queries.

**Example Attack:**
```sql
-- Attacker creates malicious schema
CREATE SCHEMA evil;
CREATE TABLE evil.conversations (...); -- malicious table

-- When function runs without search_path set,
-- it might use evil.conversations instead of public.conversations
```

**The Fix:**
Setting `search_path = ''` forces functions to use fully qualified names like `public.conversations`, preventing the attack.

---

## What is HaveIBeenPwned?

**HaveIBeenPwned** is a database of passwords that have been exposed in data breaches.

**Why enable it:**
- Prevents users from using compromised passwords
- Reduces risk of credential stuffing attacks
- Industry best practice for password security
- Free and privacy-preserving (uses k-anonymity)

**How it works:**
1. User tries to set password: `MyPassword123`
2. Supabase hashes the password
3. Sends first 5 characters of hash to HaveIBeenPwned API
4. Receives list of all breached password hashes starting with those 5 chars
5. Checks if user's full hash is in the list
6. Rejects password if it's been breached

**Privacy:**
- Your actual password is never sent to HaveIBeenPwned
- Only a partial hash is sent
- HaveIBeenPwned cannot determine what password was checked

---

## Impact on Your Application

### After Running SQL Migration:

✅ **No breaking changes**
- All triggers continue to work normally
- Timestamps still update automatically
- User profiles still auto-create on signup
- Conversation archiving still runs on schedule

✅ **Improved security**
- Functions are protected from injection attacks
- Follows PostgreSQL security best practices
- Passes Supabase security advisors

### After Enabling HaveIBeenPwned:

✅ **For existing users:**
- No change - they can continue using their current passwords
- Only affects new signups and password changes

✅ **For new users:**
- Cannot use passwords like: `password`, `123456`, `qwerty`, etc.
- Must choose a password not in breach databases
- Better account security from day one

⚠️ **User experience:**
- If a user tries to use a breached password, they'll see:
  ```
  Password has been found in a data breach. Please choose a different password.
  ```
- They'll need to pick a different password

---

## Troubleshooting

### Issue: SQL migration fails with "function does not exist"

**Solution:**
This is fine - it means the function wasn't created yet. The migration will create it with the correct settings.

### Issue: SQL migration fails with "trigger already exists"

**Solution:**
Run this first to drop existing triggers:
```sql
DROP TRIGGER IF EXISTS update_conversation_on_message ON messages;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_user_profile_timestamp_trigger ON user_profiles;
DROP TRIGGER IF EXISTS update_symptom_log_timestamp_trigger ON symptom_logs;
DROP TRIGGER IF EXISTS update_journal_entry_timestamp_trigger ON journal_entries;
```

Then run the full migration again.

### Issue: HaveIBeenPwned toggle is greyed out

**Solution:**
- Make sure you have owner/admin permissions on the Supabase project
- Try refreshing the page
- Check if you're on a free tier (should still work, but verify)

### Issue: Warnings still show after fixes

**Solution:**
- Wait 5-10 minutes for Supabase to re-scan
- Refresh the Advisors page
- Check that the SQL migration completed successfully
- Verify the Auth setting was saved (check it's still enabled)

---

## Best Practices Going Forward

### When Creating New Functions:

Always include `SET search_path = ''`:

```sql
CREATE OR REPLACE FUNCTION my_new_function()
RETURNS void AS $$
BEGIN
    -- Use fully qualified table names
    UPDATE public.my_table SET updated_at = NOW();
END;
$$ LANGUAGE plpgsql
SET search_path = '';  -- ← Add this!
```

### When Modifying Existing Functions:

1. Check if they have `SET search_path = ''`
2. Use fully qualified names: `public.table_name`
3. Run verification query after deployment

---

## Summary Checklist

- [ ] Run SQL migration from `FIX_SUPABASE_WARNINGS.sql`
- [ ] Verify all 6 functions have search_path set
- [ ] Enable HaveIBeenPwned in Auth Settings
- [ ] Save Auth Settings
- [ ] Wait 5-10 minutes for Supabase to re-scan
- [ ] Check Database → Advisors for remaining warnings
- [ ] Test that app still works (timestamps update, profiles create, etc.)

---

## Files Reference

- **SQL Migration**: `/workspaces/Meno.i/docs/FIX_SUPABASE_WARNINGS.sql`
- **This Guide**: `/workspaces/Meno.i/docs/SUPABASE_WARNINGS_GUIDE.md`

After completing both steps, you should have **0 warnings** in Supabase Advisors! 🎉
