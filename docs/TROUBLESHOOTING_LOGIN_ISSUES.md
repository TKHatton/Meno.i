# Troubleshooting Login & Supabase Issues

## Issues Identified

### 1. **Login Failure for Email & Google OAuth**
**Root Cause**: The `user_profiles` table has a CHECK constraint on `menopause_stage` that doesn't include the new "supporting_*" stages for men supporting their partners.

**Symptoms**:
- Users cannot complete onboarding after selecting "Supporting my partner"
- Database constraint violation error during profile creation
- Login appears to work but user gets stuck or redirected

**Impact**: Prevents men from completing onboarding and using the platform.

### 2. **Supabase SECURITY DEFINER Warnings**
**Root Cause**: Two views (`active_conversations_summary` and `safety_monitoring_summary`) were created with SECURITY DEFINER property, which can be a security concern.

**Symptoms**:
- Warnings in Supabase Dashboard about SECURITY DEFINER
- Views run with creator's permissions instead of querying user's permissions

**Impact**: Security warning (not blocking functionality but should be fixed for best practices).

---

## How to Fix These Issues

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard at https://supabase.com/dashboard
2. Select your MenoAI project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Migration SQL

1. Open the file `/workspaces/Meno.i/docs/FIX_AUTH_AND_VIEWS.sql`
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)

**What this does**:
- ✅ Updates the `menopause_stage` CHECK constraint to include all new stages:
  - `supporting_perimenopause`
  - `supporting_menopause`
  - `supporting_postmenopause`
  - `supporting_unsure`
- ✅ Recreates the two views without SECURITY DEFINER
- ✅ Sets views to use `security_invoker = true` for proper RLS enforcement

### Step 3: Verify the Fixes

Run these verification queries in the SQL Editor:

```sql
-- 1. Check that the constraint is updated
SELECT pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'user_profiles_menopause_stage_check';

-- 2. Verify views exist and don't have SECURITY DEFINER
SELECT schemaname, viewname, viewowner
FROM pg_views
WHERE viewname IN ('active_conversations_summary', 'safety_monitoring_summary');

-- 3. Check for any remaining warnings in Supabase Dashboard
-- Go to: Database → Advisors
```

**Expected Results**:
- Constraint definition should show all menopause stages including `supporting_*`
- Both views should be listed
- No more SECURITY DEFINER warnings in Database Advisors

---

## Testing Login After Fix

### Test Email Login

1. Open your deployed app (or http://localhost:3000)
2. Try logging in with the client's email
3. Complete onboarding:
   - Select "Supporting my partner"
   - Choose a menopause stage
   - Select primary concerns
   - Click "Get Started"
4. Should redirect to dashboard successfully

### Test Google OAuth Login

1. Open your deployed app in an incognito/private window
2. Click "Continue with Google"
3. Authorize with Google account
4. Complete onboarding with "Supporting my partner" option
5. Should redirect to dashboard successfully

---

## Additional Checks

### 1. Verify Environment Variables

**Frontend** (`packages/frontend/.env.local`):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_API_URL=http://localhost:4000  # or your deployed backend URL
```

**Backend** (`packages/backend/.env`):
```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
OPENAI_API_KEY=sk-...
PORT=4000
```

To get your Supabase keys:
1. Go to Supabase Dashboard → Project Settings → API
2. Copy `URL` → use for `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL`
3. Copy `anon public` key → use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy `service_role` key → use for `SUPABASE_SERVICE_ROLE_KEY`

### 2. Check Google OAuth Configuration

1. Go to Supabase Dashboard → Authentication → Providers
2. Find **Google** provider
3. Verify it's **Enabled**
4. Check that **Authorized redirect URLs** includes your domain(s):
   - `https://your-project-id.supabase.co/auth/v1/callback`
   - Your production URL callback (if deployed)

### 3. Check Email Provider Configuration

1. Go to Supabase Dashboard → Authentication → Providers
2. Find **Email** provider
3. Verify it's **Enabled**
4. Check **Email templates** are configured (optional but recommended)

---

## Common Issues & Solutions

### Issue: "Email not confirmed"
**Solution**:
- Check Supabase → Authentication → Settings → Email Auth
- Enable "Confirm email" if you want email verification
- Or disable it for testing: Uncheck "Enable email confirmations"

### Issue: "Invalid login credentials"
**Solution**:
- Password might be incorrect
- Account might not exist yet
- Try "Sign Up" instead of "Sign In"

### Issue: "Profile creation failed"
**Solution**:
- This was likely the constraint issue - should be fixed by the migration
- Check browser console for specific error messages
- Check Supabase Dashboard → Logs for database errors

### Issue: Google OAuth redirect not working
**Solution**:
- Verify redirect URL in `AuthProvider.tsx` line 79 matches your domain
- Check Google Cloud Console OAuth settings
- Ensure authorized redirect URIs include Supabase callback URL

---

## Getting Help

If issues persist after running the migration:

1. **Check Supabase Logs**:
   - Dashboard → Logs → Database Logs
   - Look for constraint violations or permission errors

2. **Check Browser Console**:
   - Open DevTools (F12)
   - Check Console tab for JavaScript errors
   - Check Network tab for failed API requests

3. **Check Backend Logs**:
   - If running locally: check terminal where backend is running
   - If deployed: check your hosting platform's logs (Render, Railway, etc.)

4. **Export Error Details**:
   - Copy any error messages
   - Take screenshots of the issue
   - Note the exact steps to reproduce

---

## Summary

The migration fixes:
- ✅ Login/signup with "Supporting my partner" option
- ✅ Onboarding completion for men
- ✅ SECURITY DEFINER warnings in Supabase
- ✅ Proper RLS enforcement on views

After running the migration, users should be able to:
- Sign up with email or Google
- Complete onboarding with any menopause stage (woman or man/supporting)
- Access all features of the platform
