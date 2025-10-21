# Google OAuth Setup Guide

This guide will walk you through setting up Google OAuth authentication for MenoAI.

## Prerequisites

- A Google account
- Supabase project already created (see SUPABASE_SETUP.md)
- Frontend and backend configured with Supabase credentials

---

## Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit [https://console.cloud.google.com](https://console.cloud.google.com)
   - Sign in with your Google account

2. **Create a New Project** (or use existing)
   - Click the project dropdown at the top
   - Click "New Project"
   - Project Name: `MenoAI` (or your preferred name)
   - Click "Create"
   - Wait for the project to be created (takes ~30 seconds)
   - Select your new project from the dropdown

---

## Step 2: Configure OAuth Consent Screen

1. **Navigate to OAuth Consent Screen**
   - In the left sidebar, go to: **APIs & Services** → **OAuth consent screen**

2. **Choose User Type**
   - Select **External** (unless you have a Google Workspace)
   - Click **Create**

3. **Configure App Information**
   - **App name**: `MenoAI` (or your app name)
   - **User support email**: Your email address
   - **App logo**: (Optional - can add later)
   - **Application home page**: `http://localhost:3000` (for development)
   - **Authorized domains**: (Leave blank for now - add your production domain later)
   - **Developer contact email**: Your email address
   - Click **Save and Continue**

4. **Scopes**
   - Click **Add or Remove Scopes**
   - Select these scopes:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - Click **Update**
   - Click **Save and Continue**

5. **Test Users** (Only needed in development mode)
   - Click **Add Users**
   - Add your email address and any test users
   - Click **Add**
   - Click **Save and Continue**

6. **Summary**
   - Review and click **Back to Dashboard**

---

## Step 3: Create OAuth Credentials

1. **Navigate to Credentials**
   - In the left sidebar: **APIs & Services** → **Credentials**

2. **Create OAuth Client ID**
   - Click **+ Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `MenoAI Web Client`

3. **Configure Redirect URIs**

   You need to get your Supabase callback URL first:

   - Go to your [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to **Authentication** → **Providers**
   - Find the **Google** provider section
   - Copy the **Callback URL** (it looks like: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`)

   Back in Google Cloud Console:

   - Under **Authorized JavaScript origins**, click **+ Add URI**:
     - `http://localhost:3000` (for local development)
     - Add your production URL when ready (e.g., `https://yourdomain.com`)

   - Under **Authorized redirect URIs**, click **+ Add URI**:
     - Paste your Supabase callback URL: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`

   - Click **Create**

4. **Save Your Credentials**
   - A modal will appear with your **Client ID** and **Client Secret**
   - **⚠️ IMPORTANT**: Copy both of these - you'll need them in the next step!
   - Click **OK**

---

## Step 4: Configure Google OAuth in Supabase

1. **Go to Supabase Dashboard**
   - Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Enable Google Provider**
   - Navigate to: **Authentication** → **Providers**
   - Find **Google** in the list
   - Toggle it to **Enabled**

3. **Configure Google OAuth**
   - **Client ID**: Paste the Client ID from Google Cloud Console
   - **Client Secret**: Paste the Client Secret from Google Cloud Console
   - **Redirect URL**: This should already be filled in (the callback URL)
   - Click **Save**

---

## Step 5: Test Google Login

### Start Your Development Servers

```bash
# Terminal 1 - Backend
cd packages/backend
npm run dev

# Terminal 2 - Frontend
cd packages/frontend
npm run dev
```

### Test the Flow

1. **Open the App**
   - Visit [http://localhost:3000](http://localhost:3000)

2. **Click "Sign In"**
   - The sign-in modal should appear

3. **Click "Google" Button**
   - You'll be redirected to Google's login page
   - Sign in with your Google account
   - If in development mode, you may see a warning that the app is not verified - click "Continue"
   - Approve the permissions (email and profile)

4. **Verify Success**
   - You should be redirected back to `/chat`
   - Check the top-right corner - you should see your email or profile info
   - Open browser DevTools (F12) → Console
   - You should see no authentication errors

5. **Check Database**
   - Go to Supabase Dashboard → **Authentication** → **Users**
   - You should see your Google user in the list
   - The `provider` column should show `google`

---

## Troubleshooting

### Issue: "Error 400: redirect_uri_mismatch"

**Cause**: The redirect URI doesn't match what's configured in Google Cloud Console

**Solution**:
1. Go to Google Cloud Console → Credentials → Your OAuth Client
2. Verify the redirect URI exactly matches your Supabase callback URL
3. Common mistakes:
   - Missing `https://`
   - Wrong project ID
   - Extra spaces or characters
4. Save changes and wait 5 minutes for propagation

### Issue: "This app isn't verified" warning

**Cause**: Normal for development apps not yet published

**Solution**:
- This is expected during development
- Click "Advanced" → "Go to MenoAI (unsafe)"
- To remove this:
  1. Complete OAuth verification process with Google
  2. Or set your app to "Production" mode (requires verification)

### Issue: User redirected but not logged in

**Cause**: Session not persisting or CORS issue

**Solution**:
1. Check browser console for errors
2. Verify Supabase credentials are correct in `.env.local`
3. Clear browser cookies and try again
4. Check Network tab for failed auth requests

### Issue: "Invalid client_id" error

**Cause**: Wrong Client ID copied or Supabase not configured

**Solution**:
1. Verify you copied the entire Client ID (no spaces)
2. Verify it's saved in Supabase → Authentication → Providers → Google
3. Try creating new OAuth credentials and start fresh

---

## Production Setup

When deploying to production:

1. **Update Google Cloud Console**
   - Add your production domain to Authorized JavaScript origins:
     - `https://yourdomain.com`
   - Keep the same Supabase callback URL

2. **Update OAuth Consent Screen**
   - Add your production domain to Authorized domains
   - Consider publishing the app (removes "unverified" warning)

3. **Test in Production**
   - Test the entire flow on your production URL
   - Verify users are created in Supabase

---

## Security Best Practices

- ✅ Never commit your Google Client Secret to Git
- ✅ Use separate Google Cloud projects for development and production
- ✅ Regularly rotate your Client Secret
- ✅ Only request the minimum scopes you need (email, profile)
- ✅ Monitor Supabase Auth logs for suspicious activity
- ✅ Set up CORS properly to prevent unauthorized domains

---

## Testing Checklist

- [ ] Google login button appears in sign-in modal
- [ ] Clicking button redirects to Google login page
- [ ] Can sign in with Google account
- [ ] Redirected back to `/chat` after auth
- [ ] User appears in Supabase → Authentication → Users
- [ ] User email displays correctly in UI
- [ ] Can sign out and sign back in
- [ ] No console errors during the flow

---

## Next Steps

After Google OAuth is working:

1. ✅ Test with multiple Google accounts
2. ✅ Test sign-out and sign-in again
3. ✅ Verify chat history persists across sessions
4. ✅ Add error handling for auth failures
5. ✅ Consider adding more OAuth providers (GitHub, etc.)

---

**Setup Complete!** 🎉

Your Google OAuth login should now be working. Users can sign in with their Google accounts!
