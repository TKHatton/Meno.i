# Authentication Troubleshooting Guide

## Common 400 Error from Supabase Auth

### What Does a 400 Error Mean?

A 400 (Bad Request) error from Supabase's auth endpoint typically means:

1. **Invalid credentials** - Wrong email or password
2. **User doesn't exist** - Trying to sign in before creating an account
3. **Email not confirmed** - Email verification required but not completed
4. **Invalid email format** - Email address is malformed

---

## How to Fix: Step-by-Step

### For Users Trying to Sign In

**If you're getting "Invalid login credentials":**

1. **First time user?** You need to **Sign Up** first
   - Click "Sign Up" instead of "Sign In"
   - Enter your email and password (minimum 6 characters)
   - Check your email for a confirmation link
   - Click the confirmation link
   - Then return to the app and **Sign In**

2. **Already have an account?**
   - Double-check your email address for typos
   - Make sure Caps Lock is off when entering password
   - Try resetting your password if you forgot it

3. **Just signed up?**
   - Check your email inbox for the confirmation email
   - Look in spam/junk folder if you don't see it
   - Click the confirmation link in the email
   - Then try signing in again

### For Users Trying to Sign Up

**If you're getting "User already registered":**
- This email is already in use
- Try **Sign In** instead of Sign Up
- If you forgot your password, use the password reset option

---

## Quick Checklist for Admins

### 1. Verify Supabase Auth is Enabled

Go to Supabase Dashboard → Authentication → Providers:

- ✅ **Email** provider should be **Enabled**
- ✅ **Google** provider should be **Enabled** (if using OAuth)

### 2. Check Email Confirmation Settings

Go to Supabase Dashboard → Authentication → Settings → Email Auth:

**Option A: Require Email Confirmation (Recommended for Production)**
- ✅ "Enable email confirmations" is checked
- Users MUST click the link in their email before signing in
- More secure, prevents spam accounts

**Option B: Skip Email Confirmation (Easier for Testing)**
- ❌ "Enable email confirmations" is unchecked
- Users can sign in immediately after signup
- Faster for testing, but less secure

### 3. Check Email Templates (Optional but Recommended)

Go to Supabase Dashboard → Authentication → Email Templates:

- Customize the confirmation email template
- Customize the password reset email template
- Add your branding and messaging

### 4. Verify Redirect URLs

Go to Supabase Dashboard → Authentication → URL Configuration:

- Add your production domain to **Site URL**
- Add redirect URLs to **Redirect URLs** list
  - Example: `https://yourdomain.com/onboarding`
  - Example: `https://yourdomain.com/dashboard`

### 5. Check Rate Limiting

If users are getting errors after multiple attempts:
- Supabase has rate limiting to prevent abuse
- Wait 15-30 minutes before trying again
- Or check: Dashboard → Authentication → Rate Limits

---

## Testing Authentication Flow

### Test Email Signup Flow

1. Open app in incognito/private window
2. Click "Sign Up"
3. Enter: `test+signup@example.com` and password `test1234`
4. Submit form
5. Check email inbox for confirmation
6. Click confirmation link
7. Return to app and sign in with same credentials
8. Should successfully reach dashboard

### Test Email Sign In Flow

1. Use an existing account or create one first
2. Click "Sign In"
3. Enter correct email and password
4. Should successfully sign in and redirect to dashboard

### Test Google OAuth Flow

1. Click "Continue with Google"
2. Select Google account
3. Authorize the app
4. Should redirect back to app
5. Complete onboarding if first time
6. Should reach dashboard

---

## Common Issues and Solutions

### Issue: "Invalid login credentials" but I know my password is correct

**Possible Causes:**
- Account doesn't exist yet (need to sign up first)
- Email not confirmed (check your email)
- Password was changed and you're using an old password

**Solution:**
1. Try signing up - if you get "User already registered", the account exists
2. Check your email for confirmation link if you just signed up
3. Try password reset if you think the password might be wrong

### Issue: Not receiving confirmation emails

**Possible Causes:**
- Email in spam/junk folder
- Email provider blocking Supabase emails
- Typo in email address
- Supabase email service issue

**Solution:**
1. Check spam/junk folder
2. Add `noreply@supabase.io` to contacts
3. Try a different email provider (Gmail, Outlook)
4. For admins: Disable email confirmation temporarily for testing

### Issue: "Email rate limit exceeded"

**Cause:**
- Too many signup/signin attempts
- Supabase anti-abuse protection

**Solution:**
- Wait 15-30 minutes before trying again
- For admins: Check rate limits in Supabase dashboard
- Use a different email address for testing

### Issue: Google OAuth not working

**Possible Causes:**
- Google provider not enabled in Supabase
- Redirect URL not configured
- Google Cloud Console OAuth not set up correctly

**Solution:**
1. Check Supabase → Authentication → Providers → Google is enabled
2. Verify Google OAuth credentials are correct
3. Check authorized redirect URIs in Google Cloud Console
4. Ensure `https://your-project-id.supabase.co/auth/v1/callback` is added

---

## Improved Error Messages

The app now shows more helpful error messages:

**Before:**
```
Invalid login credentials
```

**After:**
```
Invalid email or password. Please try again or sign up if you don't have an account yet.
```

**Other helpful messages:**
- "Please check your email and click the confirmation link before signing in."
- "This email is already registered. Please sign in instead."
- "Success! Check your email to confirm your account, then sign in."

---

## For Developers

### Enable Better Logging

In `AuthProvider.tsx` and `SignInModal.tsx`, errors are now logged to console:

```typescript
console.error('Auth error:', err);
```

**To debug:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try signing in
4. Look for any error messages
5. Check Network tab for the actual API response from Supabase

### Check Supabase Logs

1. Go to Supabase Dashboard → Logs
2. Select "Auth Logs"
3. Look for failed authentication attempts
4. Check the error messages for details

### Test with Different Environments

**Local Development:**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Production:**
- Ensure environment variables are set in your hosting platform
- Verify the Supabase project is using production settings
- Check that redirect URLs include your production domain

---

## Summary

**Most common cause of 400 errors:**
- User trying to **sign in** before **signing up**

**Solution:**
- Use "Sign Up" first to create an account
- Confirm email if required
- Then use "Sign In" to access the app

**If still having issues:**
- Check Supabase Dashboard for auth configuration
- Review email confirmation settings
- Check browser console for detailed error messages
- Contact support with specific error details
