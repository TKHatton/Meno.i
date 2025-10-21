# MenoAI Production Deployment Guide

**Complete step-by-step guide for deploying MenoAI to Netlify (frontend) and Render (backend)**

---

## Prerequisites

- [x] GitHub repo pushed and up to date
- [x] Netlify account (free tier works)
- [x] Render account (free tier works)
- [x] Supabase project configured with production data
- [x] OpenAI API key
- [x] Google OAuth credentials configured

---

## Part 1: Backend Deployment (Render)

### 1.1 Create New Web Service on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `menoai-backend` (or your choice)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `packages/backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (or paid for production)

### 1.2 Configure Environment Variables

Add these in Render dashboard → Environment tab:

```bash
# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# OpenAI
OPENAI_API_KEY=sk-your-openai-key-here

# Server Config
PORT=4000
NODE_ENV=production
HOST=0.0.0.0

# Frontend URL (you'll update this after Netlify deployment)
FRONTEND_URL=https://your-app-name.netlify.app

# Admin Access
ALLOWED_ADMIN_EMAILS=admin@example.com,your-email@example.com

# Error Tracking (Optional - get from sentry.io)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### 1.3 Deploy Backend

1. Click **"Create Web Service"**
2. Wait for build to complete (~2-3 minutes)
3. Copy your backend URL: `https://menoai-backend.onrender.com`

### 1.4 Test Backend Health

```bash
curl https://menoai-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "menoai-backend",
  "timestamp": "2025-10-21T...",
  "uptime": 123.456
}
```

---

## Part 2: Frontend Deployment (Netlify)

### 2.1 Create New Site on Netlify

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub and select your repo
4. Configure build settings:
   - **Base directory**: `/` (root)
   - **Build command**: `cd packages/frontend && npm install && npm run build`
   - **Publish directory**: `packages/frontend/.next`
   - **Branch**: `main`

### 2.2 Configure Environment Variables

Add these in Netlify dashboard → Site settings → Environment variables:

```bash
# Supabase (Use ANON key, NOT service role!)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Backend API URL (from Render)
NEXT_PUBLIC_API_URL=https://menoai-backend.onrender.com

# Analytics (Optional - get from posthog.com)
NEXT_PUBLIC_POSTHOG_KEY=phc_your_posthog_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Error Tracking (Optional - get from sentry.io)
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### 2.3 Deploy Frontend

1. Click **"Deploy site"**
2. Wait for build (~3-5 minutes)
3. Copy your site URL: `https://your-app-name.netlify.app`
4. (Optional) Configure custom domain in Netlify settings

---

## Part 3: Post-Deployment Configuration

### 3.1 Update Backend CORS

**File**: `packages/backend/src/index.ts:29`

Add your Netlify URL to allowed origins:

```typescript
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'https://studious-orbit-9vvxjj6wqwphpprj-3000.app.github.dev',
  'https://your-app-name.netlify.app', // ← Add this
];
```

**Then**:
1. Commit and push to GitHub
2. Render will auto-redeploy (or click "Manual Deploy")

### 3.2 Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Click your OAuth 2.0 Client ID
4. Add to **Authorized JavaScript origins**:
   ```
   https://your-app-name.netlify.app
   ```
5. Add to **Authorized redirect URIs**:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
6. Click **Save**

### 3.3 Update Supabase Site URL

1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Update **Site URL**: `https://your-app-name.netlify.app`
4. Add to **Redirect URLs**:
   ```
   https://your-app-name.netlify.app/chat
   https://your-app-name.netlify.app
   ```

### 3.4 Update Backend Environment Variable

In Render dashboard:
1. Go to Environment tab
2. Update `FRONTEND_URL=https://your-app-name.netlify.app`
3. Save (will trigger redeploy)

---

## Part 4: Verification Checklist

After deployment, test these features:

### ✅ Authentication
- [ ] Visit your Netlify URL
- [ ] Click "Sign in with Google"
- [ ] Verify successful login
- [ ] Check that you're redirected to `/chat`
- [ ] Verify user avatar appears in header

### ✅ Chat Functionality
- [ ] Type a message and send
- [ ] Verify AI response appears
- [ ] Check streaming works (or non-streaming)
- [ ] Verify messages persist after refresh

### ✅ Voice Features
- [ ] Click microphone button
- [ ] Allow microphone permissions
- [ ] Speak a message
- [ ] Verify transcription appears in real-time
- [ ] Send voice-transcribed message
- [ ] Hover over AI response
- [ ] Click speaker button
- [ ] Verify voice playback works

### ✅ Profile Management
- [ ] Click profile dropdown in header
- [ ] Click "Edit Profile"
- [ ] Upload a profile picture
- [ ] Update display name
- [ ] Save changes
- [ ] Verify avatar updates everywhere

### ✅ Safety Features
- [ ] Send a message with crisis keywords (e.g., "I want to hurt myself")
- [ ] Verify safety resources appear
- [ ] Check admin dashboard works (if configured)

### ✅ History
- [ ] Click "Chat History" in profile dropdown
- [ ] Verify past conversations load
- [ ] Click on a conversation
- [ ] Verify all messages display correctly

### ✅ Performance
- [ ] Test on mobile device (Chrome/Safari)
- [ ] Verify responsive design
- [ ] Check voice features on mobile
- [ ] Test loading speed (< 3 seconds)

---

## Part 5: Monitoring & Maintenance

### Enable Error Tracking (Sentry)

1. Sign up at https://sentry.io
2. Create two projects:
   - **React** project for frontend
   - **Node.js** project for backend
3. Copy DSN keys and add to environment variables
4. Errors will auto-report to Sentry dashboard

### Enable Analytics (PostHog)

1. Sign up at https://posthog.com
2. Create a project
3. Copy API key and add to `NEXT_PUBLIC_POSTHOG_KEY`
4. Analytics will track:
   - Page views
   - Sign-ins
   - Messages sent (no content!)
   - Safety triggers
   - Conversation actions

### Database Backups (Supabase)

1. Supabase automatically backs up database
2. Enable Point-in-Time Recovery (paid plans)
3. Or set up manual backup script:
   ```bash
   pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
   ```

### Cost Monitoring

**Estimated Monthly Costs** (for ~1000 users, 10k messages/month):

| Service | Free Tier | Expected Cost |
|---------|-----------|---------------|
| Netlify | 100GB bandwidth | $0 (within free tier) |
| Render | 750 hours/month | $0 (free tier) or $7/month (paid) |
| Supabase | 500MB DB, 1GB storage | $0 or $25/month (Pro) |
| OpenAI API | Pay-per-use | $20-50/month (gpt-3.5-turbo) |
| Sentry | 5k errors/month | $0 (free tier) |
| PostHog | 1M events/month | $0 (free tier) |
| **Total** | | **$20-82/month** |

**OpenAI Cost Calculator**:
- Average message: ~500 tokens (input + output)
- 10,000 messages/month × 0.5k tokens = 5M tokens
- Cost: 5M tokens × $0.002/1k = **~$10/month** (gpt-3.5-turbo)
- With gpt-4: **~$100/month**

### Set Up Alerts

**Render**:
- Enable "Health Check Path": `/api/health`
- Email notifications for failures

**Netlify**:
- Enable "Deploy notifications"
- Email on failed builds

**Supabase**:
- Enable database usage alerts (80% capacity)

---

## Part 6: Rollback Plan

If deployment fails or issues arise:

### Quick Rollback (Netlify)

1. Go to Netlify dashboard → Deploys
2. Find last working deploy
3. Click **"Publish deploy"**
4. Site reverts in ~30 seconds

### Quick Rollback (Render)

1. Go to Render dashboard → Events
2. Find last successful deploy
3. Click **"Redeploy"** (or revert commit in GitHub)

### Database Rollback (Supabase)

1. Go to Supabase dashboard
2. Database → Backups (paid plans)
3. Restore to previous point in time

### Full Rollback Procedure

```bash
# 1. Revert last commit
git revert HEAD
git push origin main

# 2. Both services auto-redeploy
# Netlify: ~2 minutes
# Render: ~3 minutes

# 3. Verify health
curl https://menoai-backend.onrender.com/api/health
curl https://your-app-name.netlify.app
```

---

## Part 7: Troubleshooting Common Issues

### Issue: "Failed to fetch" errors in frontend

**Cause**: CORS not configured correctly or backend URL wrong

**Fix**:
1. Check `NEXT_PUBLIC_API_URL` in Netlify env vars
2. Verify backend CORS includes your Netlify URL (see 3.1)
3. Check backend is healthy: `curl https://your-backend-url/api/health`

### Issue: "Authentication error" or redirect to localhost

**Cause**: Supabase Site URL or OAuth redirects incorrect

**Fix**:
1. Update Supabase Site URL (see 3.3)
2. Update Google OAuth authorized origins (see 3.2)
3. Clear browser cookies and try again

### Issue: Voice features not working

**Cause**: Microphone blocked by browser or permissions policy

**Fix**:
1. Verify `netlify.toml` allows microphone (should NOT block)
2. Check browser permissions (click lock icon in address bar)
3. Test in Chrome/Safari (Firefox doesn't support speech recognition)
4. Verify HTTPS (required for microphone access)

### Issue: Images not loading (avatars)

**Cause**: Supabase Storage bucket not public or CORS issue

**Fix**:
1. Go to Supabase Storage
2. Select `avatars` bucket
3. Enable "Public bucket"
4. Add CORS policy for your Netlify URL

### Issue: Backend "503 Service Unavailable" on Render free tier

**Cause**: Free tier spins down after 15 minutes of inactivity

**Fix**:
1. Wait 30-60 seconds for cold start
2. Upgrade to paid plan ($7/month) for always-on
3. Or use Render cron job to ping health endpoint every 10 minutes

### Issue: Build fails on Netlify

**Cause**: Missing dependencies or TypeScript errors

**Fix**:
1. Check build logs in Netlify dashboard
2. Test build locally: `npm run build`
3. Verify all dependencies in `package.json`
4. Check for TypeScript errors: `npm run type-check`

---

## Part 8: Optional Enhancements

### Custom Domain

**Netlify**:
1. Go to Domain settings
2. Add custom domain (e.g., `app.yoursite.com`)
3. Update DNS records (provided by Netlify)
4. Enable HTTPS (automatic)
5. Update all OAuth redirects and CORS

**Render**:
1. Add custom domain in Render settings
2. Point DNS CNAME to Render
3. SSL auto-configured

### Staging Environment

1. Create separate Render web service: `menoai-backend-staging`
2. Create separate Netlify site from `develop` branch
3. Use separate Supabase project for staging
4. Test all changes in staging before production

### CI/CD with GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Test Build

on:
  pull_request:
    branches: [main]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd packages/frontend && npm install && npm run build

  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd packages/backend && npm install && npm run build
```

---

## Part 9: Security Hardening

### Before Launch Checklist

- [ ] All secrets in environment variables (not in code)
- [ ] `.env` files in `.gitignore`
- [ ] Supabase RLS policies tested
- [ ] Admin routes secured (improve auth in `packages/backend/src/routes/admin.ts`)
- [ ] Rate limiting implemented (see Priority 3)
- [ ] CORS restricted to known origins only
- [ ] Sentry configured to filter sensitive data
- [ ] Google OAuth callback verified
- [ ] No console.logs with sensitive data in production

### Recommended Next Steps

1. **Add rate limiting** to prevent API abuse
2. **Implement proper admin authentication** (current query param is insecure)
3. **Add Privacy Policy and Terms of Service** (legal requirement)
4. **Set up monitoring dashboards** (Sentry + PostHog)
5. **Create data export feature** (GDPR requirement)
6. **Add CAPTCHA** to signup (prevent bot abuse)
7. **Implement IP-based rate limiting** (additional security)

---

## Support & Resources

- **Netlify Docs**: https://docs.netlify.com
- **Render Docs**: https://render.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Web Speech API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

---

## 🎉 You're Live!

Once all checks pass, your MenoAI app is ready for users.

**Production URLs**:
- Frontend: `https://your-app-name.netlify.app`
- Backend: `https://menoai-backend.onrender.com`
- Admin Dashboard: `https://your-app-name.netlify.app/admin/safety?email=your-admin-email`

**Next: Share with beta users and collect feedback!**
