# Meno.i - Quick Deployment Guide

**5-minute deployment to Netlify** 🚀

---

## Before You Start

Have these ready:
- [ ] GitHub repository with latest code pushed
- [ ] Supabase project URL and anon key
- [ ] OpenAI API key
- [ ] Netlify account (free tier works!)

---

## Step 1: Prepare Environment Variables

Copy these - you'll need them in Netlify:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_API_URL=your-backend-url (or leave blank if deploying later)
```

**Where to find:**
- Supabase: [Dashboard](https://app.supabase.com) → Your Project → Settings → API
- OpenAI: [API Keys](https://platform.openai.com/api-keys)

---

## Step 2: Deploy to Netlify (2 minutes)

1. Go to [Netlify](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** → Select **Meno.i** repository
4. Netlify will auto-detect settings from `netlify.toml` ✅
5. Click **"Deploy site"**

---

## Step 3: Add Environment Variables (1 minute)

While build is running:

1. Go to **Site settings** → **Environment variables**
2. Click **"Add a variable"**
3. Add these three:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL` (can leave blank for now)
4. Click **"Save"**
5. Trigger **"Redeploy"** if build already finished

---

## Step 4: Configure Supabase (2 minutes)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Your Project → **Authentication** → **URL Configuration**
3. Add your Netlify URL:
   - **Site URL**: `https://your-site-name.netlify.app`
   - **Redirect URLs**: `https://your-site-name.netlify.app/**`
4. Scroll to **Auth Providers** → **Google**
5. Verify redirect URI includes: `https://[your-project].supabase.co/auth/v1/callback`

---

## Step 5: Update Google OAuth (1 minute)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client
4. **Authorized redirect URIs** → Add:
   - `https://[your-project].supabase.co/auth/v1/callback`
   - `https://your-site-name.netlify.app/auth/callback`
5. Save

---

## Step 6: Test Your Deployment ✅

Visit your site and test:
- [ ] Homepage loads
- [ ] Sign in with Google works
- [ ] Can send and receive messages
- [ ] Voice input works (microphone button)
- [ ] Text-to-speech works (speaker button)
- [ ] Dark mode toggle works
- [ ] Mobile view looks good

---

## Common Issues & Fixes

### Build Failed
- Check build logs in Netlify
- Verify `netlify.toml` exists in repo root
- Ensure all dependencies in `package.json`

### Sign-in Not Working
- Verify Supabase URL/key in Netlify env vars
- Check Supabase redirect URLs match your Netlify domain
- Confirm Google OAuth redirect URIs are correct

### API Errors
- If no backend deployed yet, set `NEXT_PUBLIC_API_URL` to empty
- Check browser console for error details
- Verify Supabase connection

---

## What's Next?

### Optional Improvements:
1. **Custom Domain**: Netlify → Domain settings → Add custom domain
2. **Deploy Backend**: See full guide in `NETLIFY_DEPLOYMENT.md`
3. **Enable Analytics**: Netlify → Analytics → Enable ($9/mo)
4. **Add Error Tracking**: Setup Sentry for error monitoring

### Recommended:
- Test on mobile devices
- Share with beta testers
- Monitor Netlify build logs
- Check OpenAI API usage

---

## Your Meno.i URLs

After deployment, save these:

- **Live Site**: `https://your-site-name.netlify.app`
- **Admin Panel**: `https://app.netlify.com/sites/your-site-name`
- **Supabase**: `https://app.supabase.com/project/your-project`
- **Build Logs**: Netlify → Deploys → Latest deploy

---

## Need More Help?

- **Full Guide**: See `docs/NETLIFY_DEPLOYMENT.md`
- **Netlify Docs**: https://docs.netlify.com
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment

---

**Estimated Time: 5-10 minutes** ⏱️

**You're ready to launch Meno.i!** 🎉

Remember: Your `netlify.toml` file is already configured, so Netlify will handle most settings automatically!
