# Meno.i - Netlify Deployment Checklist

Complete guide for deploying Meno.i to Netlify with zero downtime.

---

## Pre-Deployment Checklist

### 1. Environment Variables Setup

Create a `.env.production` file or prepare these variables for Netlify:

```bash
# Frontend Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=your_backend_url (e.g., https://api.menoi.app)

# Backend Environment Variables (if deploying backend separately)
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://your-netlify-domain.netlify.app
```

**Where to find these:**
- Supabase credentials: [Supabase Dashboard](https://app.supabase.com) → Your Project → Settings → API
- OpenAI API Key: [OpenAI Platform](https://platform.openai.com/api-keys)

---

### 2. Verify Build Configuration

**Check `packages/frontend/package.json`:**
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "dev": "next dev"
  }
}
```

**Check `packages/frontend/next.config.js`:**
- Ensure production optimizations are enabled
- Verify image domains are configured
- Check API proxy settings

---

### 3. Update Supabase Settings

#### a. Add Production URLs to Supabase
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project → Authentication → URL Configuration
3. Add your Netlify URLs:
   - **Site URL**: `https://your-app-name.netlify.app`
   - **Redirect URLs**:
     - `https://your-app-name.netlify.app/chat`
     - `https://your-app-name.netlify.app/**` (wildcard)

#### b. Configure Google OAuth for Production
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services → Credentials
3. Edit your OAuth 2.0 Client
4. Add authorized redirect URIs:
   - `https://your-supabase-project.supabase.co/auth/v1/callback`
   - `https://your-app-name.netlify.app/auth/callback`

---

### 4. Update Application Metadata

**Check `packages/frontend/src/app/layout.tsx`:**
```typescript
export const metadata: Metadata = {
  title: 'Meno.i - Your Compassionate Menopause Companion',
  description: 'Emotional intelligence support for women navigating perimenopause and menopause',
  // Add these for better SEO:
  keywords: 'menopause, perimenopause, emotional support, AI companion',
  openGraph: {
    title: 'Meno.i - Your Compassionate Menopause Companion',
    description: 'Emotional intelligence support for women navigating perimenopause and menopause',
    url: 'https://your-app-name.netlify.app',
    siteName: 'Meno.i',
    images: ['/images/logo.jpeg'],
  },
}
```

---

## Netlify Deployment Steps

### Option A: Deploy via GitHub (Recommended)

#### Step 1: Push to GitHub
```bash
# From your project root
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

#### Step 2: Connect to Netlify
1. Go to [Netlify](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authorize Netlify
4. Select your **Meno.i** repository

#### Step 3: Configure Build Settings
```
Build command: cd packages/frontend && npm install && npm run build
Publish directory: packages/frontend/.next
```

**Advanced settings:**
- **Base directory**: Leave empty (or set to `packages/frontend` if issues)
- **Functions directory**: Leave empty (unless using Netlify functions)

#### Step 4: Add Environment Variables
In Netlify dashboard → Site settings → Environment variables:

Add each variable from your `.env.production` file:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL`

**Important:** Use the exact names with `NEXT_PUBLIC_` prefix!

#### Step 5: Deploy
1. Click **"Deploy site"**
2. Wait for build to complete (usually 2-5 minutes)
3. Check build logs for errors

---

### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# From packages/frontend directory
cd packages/frontend

# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod

# Follow prompts to create new site or link existing one
```

---

## Post-Deployment Checklist

### 1. Verify Core Functionality

Visit your deployed site and test:

- [ ] **Homepage loads** - Logo, welcome text, buttons visible
- [ ] **Sign In modal opens** when clicking "Sign In"
- [ ] **Google OAuth works** - Can sign in with Google
- [ ] **Email/password auth works** - Can create account and sign in
- [ ] **Chat interface loads** - Can access /chat page
- [ ] **Send messages** - Can send and receive AI responses
- [ ] **Streaming mode works** - Toggle streaming and send message
- [ ] **Voice input works** - Microphone button functional (Chrome/Edge only)
- [ ] **Text-to-speech works** - Speaker button on AI messages works
- [ ] **Accessibility menu** - Settings icon in header opens menu
- [ ] **Dark mode toggle** - Can switch between light/dark/auto
- [ ] **Font size adjustments** - Can change text size
- [ ] **Profile features** - Can view/edit profile
- [ ] **Sign out works** - Can successfully sign out

---

### 2. Check Browser Compatibility

Test on:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

### 3. Performance Checks

Use [PageSpeed Insights](https://pagespeed.web.dev/):
- [ ] Score > 90 on Performance
- [ ] Score > 90 on Accessibility
- [ ] Score > 90 on Best Practices
- [ ] Score > 90 on SEO

**Common optimizations:**
- Enable Next.js image optimization
- Add caching headers in `next.config.js`
- Minimize JavaScript bundle size

---

### 4. SEO & Metadata Verification

Check with [Meta Tags](https://metatags.io/):
- [ ] Title displays correctly
- [ ] Description shows properly
- [ ] Open Graph image loads
- [ ] Favicon appears

---

### 5. Security Checks

- [ ] All API keys are in environment variables (not hardcoded)
- [ ] Supabase Row Level Security (RLS) is enabled
- [ ] CORS is configured correctly on backend
- [ ] HTTPS is enforced (Netlify does this automatically)
- [ ] No sensitive data in client-side code

---

## Backend Deployment (Separate)

Your backend (`packages/backend`) needs to be deployed separately. Options:

### Option 1: Railway (Recommended)
1. Go to [Railway](https://railway.app)
2. Create new project from GitHub
3. Select backend directory
4. Add environment variables
5. Deploy

### Option 2: Render
1. Go to [Render](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Set build command: `cd packages/backend && npm install && npm start`
5. Add environment variables

### Option 3: Heroku
```bash
# From packages/backend
heroku create menoi-api
heroku config:set OPENAI_API_KEY=your_key
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_key
git subtree push --prefix packages/backend heroku main
```

**After backend deployment:**
1. Update `NEXT_PUBLIC_API_URL` in Netlify to point to your backend URL
2. Update `CORS_ORIGIN` in backend to allow your Netlify domain
3. Redeploy frontend

---

## Custom Domain Setup (Optional)

### Purchase Domain
Recommended registrars:
- Namecheap
- Google Domains
- Cloudflare

Suggested domains:
- `menoi.app`
- `meno.ai`
- `getmenoi.com`

### Configure in Netlify
1. Netlify Dashboard → Domain settings → Add custom domain
2. Enter your domain (e.g., `menoi.app`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (up to 48 hours, usually <1 hour)
5. Enable HTTPS (automatic with Let's Encrypt)

### Update URLs
After domain is active:
1. Update Supabase redirect URLs
2. Update Google OAuth redirect URLs
3. Update `NEXT_PUBLIC_API_URL` if needed
4. Redeploy

---

## Monitoring & Analytics

### Enable Netlify Analytics (Optional)
- Netlify Dashboard → Analytics → Enable
- $9/month for server-side analytics
- No cookie banners needed (GDPR compliant)

### Setup Error Tracking
Consider adding Sentry (mentioned in your code but commented out):

1. Create account at [Sentry.io](https://sentry.io)
2. Uncomment Sentry in your code
3. Add `NEXT_PUBLIC_SENTRY_DSN` to Netlify env vars
4. Redeploy

---

## Troubleshooting Common Issues

### Build Fails
**Error: "Module not found"**
```bash
# Solution: Ensure all dependencies are in package.json
cd packages/frontend
npm install
```

**Error: "Environment variable not found"**
- Check Netlify environment variables are set correctly
- Ensure they start with `NEXT_PUBLIC_` for client-side access

### Sign-In Not Working
1. Verify Supabase URL is correct in Netlify env vars
2. Check Supabase redirect URLs include your Netlify domain
3. Check Google OAuth redirect URIs include Supabase callback

### API Calls Failing
1. Verify backend is deployed and running
2. Check `NEXT_PUBLIC_API_URL` points to correct backend
3. Verify CORS is configured on backend
4. Check network tab in browser DevTools for errors

### Dark Mode Not Working
1. Check `tailwind.config.ts` has `darkMode: 'class'`
2. Verify `AccessibilityProvider` is in layout
3. Clear browser cache and hard refresh

---

## Rollback Procedure

If something goes wrong:

### Via Netlify Dashboard
1. Go to Deploys
2. Find previous working deploy
3. Click "Publish deploy"

### Via Git
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Netlify will auto-deploy the reverted version
```

---

## Maintenance Checklist

### Weekly
- [ ] Check error logs in Netlify
- [ ] Monitor OpenAI API usage
- [ ] Review Supabase database size

### Monthly
- [ ] Update dependencies: `npm update`
- [ ] Review and optimize bundle size
- [ ] Check performance metrics
- [ ] Review user feedback

### Quarterly
- [ ] Update Next.js to latest version
- [ ] Audit accessibility compliance
- [ ] Security audit
- [ ] Backup Supabase database

---

## Support Resources

- **Netlify Docs**: https://docs.netlify.com
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Supabase Docs**: https://supabase.com/docs
- **Your Project Docs**: See `/docs` folder

---

## Final Pre-Launch Checklist

Before announcing Meno.i to the world:

- [ ] All features tested on production
- [ ] Google OAuth works in production
- [ ] Custom domain configured (if applicable)
- [ ] Error tracking enabled
- [ ] Analytics enabled
- [ ] Privacy Policy accessible (see `/privacy`)
- [ ] Terms of Service accessible (see `/terms`)
- [ ] Logo and branding consistent
- [ ] Loading states look good
- [ ] Error messages are user-friendly
- [ ] Mobile experience is smooth
- [ ] Accessibility features work (dark mode, font size, etc.)
- [ ] Backup plan ready if issues arise

---

## Congratulations!

Your Meno.i app is now live! 🎉

**Share your deployment:**
- Test with friends/family first
- Gather feedback
- Iterate based on real usage
- Consider launching on Product Hunt or similar platforms

**Monitor closely for the first 48 hours:**
- Watch for errors in Netlify logs
- Check Supabase for database issues
- Monitor OpenAI API usage
- Be ready to rollback if needed

Good luck with your launch! 🚀
