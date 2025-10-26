# MenoAI - Free Tier MVP Product Requirements Document

**Version:** 1.0 - Free Tier Only  
**Last Updated:** October 25, 2025  
**Status:** Ready for Development  
**Tech Stack:** Next.js 14, Supabase, TypeScript, Tailwind CSS

---

## Executive Summary

MenoAI Free Tier (MenoEssentials) is a focused, feature-complete menopause support application that provides core value to users at no cost. This MVP focuses on symptom tracking, journaling, and daily motivation to validate market fit before introducing paid tiers.

**Core Value Proposition:**
"Feel like you're going crazy? You're not. You're just in perimenopause."

---

## Product Vision (Free Tier)

### What We're Building

A free, accessible menopause support app that helps women:
- Track and understand their symptoms
- Process emotions through journaling
- Stay motivated with daily affirmations
- Feel less alone in their journey

### What We're NOT Building (Yet)

- ❌ AI chat coach (MenoPlus feature - future)
- ❌ Insights dashboard with AI analysis (MenoPlus - future)
- ❌ Payment/subscription system (deferred to Phase 2)
- ❌ Wearable device integration (MenoElite - future)
- ❌ Therapist content library (MenoElite - future)

---

## Target Users

**Primary Persona: Sarah**
- Age: 42-55
- Stage: Perimenopause or early menopause
- Pain Points:
  - Confused by symptoms
  - Feels alone and isolated
  - Dismissed by doctors
  - Overwhelmed by information online
- Tech Comfort: Moderate (uses iPhone/Android, social media)
- Willingness to Pay: Cautious - wants to try before buying

**User Journey:**
1. Discovers MenoAI through social media or search
2. Signs up for free (no credit card)
3. Tracks symptoms for 1-2 weeks
4. Finds value in patterns and journaling
5. Becomes engaged daily user
6. (Future) Upgrades to paid tier for AI coach

---

## Feature Scope: MenoEssentials (Free Tier)

### 1. User Authentication & Onboarding

#### 1.1 Sign Up / Sign In

**Authentication Methods:**
- ✅ Email + Password (already implemented)
- ✅ Google OAuth (already implemented)
- ⭐ **Apple Sign-In (NEW - needs implementation)**

**Apple Sign-In Requirements:**
- Must work seamlessly on iOS devices (iPhone, iPad)
- Must work on Safari (macOS)
- Should work on web browsers on Apple devices
- Follows Apple's Human Interface Guidelines
- Privacy-focused (optional email hiding)

**Technical Implementation Needed:**
```typescript
// Supabase Apple Provider Configuration
// 1. Set up Apple Developer Account
// 2. Create Service ID for "Sign in with Apple"
// 3. Configure redirect URIs in Apple Developer Console
// 4. Add Apple provider in Supabase Dashboard
// 5. Implement Apple sign-in button in UI

// Frontend Component
<button onClick={signInWithApple}>
  <AppleIcon /> Sign in with Apple
</button>

// Supabase Auth Call
const signInWithApple = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
};
```

**Sign-In UI:**
- Clean, minimal sign-in modal
- Three prominent buttons:
  - "Continue with Apple" (black Apple logo) ⭐ NEW
  - "Continue with Google" (existing)
  - "Continue with Email" (existing)
- No marketing text - just authentication
- Mobile-optimized (large touch targets)

**Session Management:**
- Remember user for 30 days
- Secure token storage
- Auto-refresh tokens
- Graceful logout

#### 1.2 Onboarding Flow (2 Steps)

**Step 1: Welcome & Basic Info**
```
Screen: Welcome

"Welcome to MenoAI! 👋"

"Let's personalize your experience"

What should we call you?
[Text input: First name]

[Continue]
```

**Step 2: Quick Survey**
```
Screen: About Your Journey

"Where are you in your menopause journey?"

○ Perimenopause (symptoms but still menstruating)
○ Menopause (12+ months without period)
○ Post-menopause
○ Not sure yet
○ I'm here to learn

"What's your main concern right now?"
(Select up to 2)

□ Hot flashes
□ Sleep issues
□ Mood swings / Anxiety
□ Brain fog / Memory
□ Energy / Fatigue
□ Relationship challenges
□ Understanding symptoms
□ Other: ____________

[Get Started]
```

**Post-Onboarding:**
- Save to user profile
- Redirect to dashboard
- Show brief product tour (optional skip)

**Database Schema:**
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  menopause_stage TEXT, -- perimenopause, menopause, postmenopause, unsure, learning
  primary_concerns TEXT[], -- array of concern strings
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

### 2. Daily Symptom Tracker

#### 2.1 Core Symptom List (15 Symptoms)

**Physical Symptoms (7):**
1. Hot flashes
2. Night sweats
3. Sleep issues
4. Headaches
5. Joint pain
6. Fatigue
7. Heart palpitations

**Emotional/Cognitive Symptoms (8):**
8. Mood swings
9. Anxiety
10. Irritability
11. Depression/Low mood
12. Brain fog
13. Memory issues
14. Crying spells
15. Feeling overwhelmed

**+ "Other" option** with free text field

#### 2.2 Daily Check-In Interface

**Layout:**
```
─────────────────────────────────────
Today's Check-In
Friday, October 25, 2024
─────────────────────────────────────

How are you feeling today?

Physical Symptoms:

□ Hot flashes          ○ ○ ○ ○ ○ (1-5)
□ Night sweats        ○ ○ ○ ○ ○
□ Sleep issues        ○ ○ ○ ○ ○
□ Headaches          ○ ○ ○ ○ ○
□ Joint pain         ○ ○ ○ ○ ○
□ Fatigue            ○ ○ ○ ○ ○
□ Heart palpitations ○ ○ ○ ○ ○

Emotional/Cognitive:

□ Mood swings        ○ ○ ○ ○ ○
□ Anxiety            ○ ○ ○ ○ ○
□ Irritability       ○ ○ ○ ○ ○
□ Depression         ○ ○ ○ ○ ○
□ Brain fog          ○ ○ ○ ○ ○
□ Memory issues      ○ ○ ○ ○ ○
□ Crying spells      ○ ○ ○ ○ ○
□ Overwhelmed        ○ ○ ○ ○ ○

□ Other: [text input]

Overall Energy Level Today:
○ ○ ○ ○ ○ (Very Low → Very High)

Notes (optional):
[Text area]

[Save Check-In]
─────────────────────────────────────
```

**UI/UX Requirements:**
- Checkbox unchecked = symptom not present (don't show severity)
- Checkbox checked = show 1-5 severity scale immediately
- Only checked symptoms are saved
- Energy level always visible (1-5 scale)
- Notes field expandable/collapsible
- Auto-save draft as user types (recover if they navigate away)
- Submit button enabled only if at least 1 symptom selected OR energy level set
- Success message after save: "✓ Check-in saved for October 25"

**Mobile Considerations:**
- Large touch targets (48px minimum)
- Severity circles at least 44px
- Vertical scrolling layout
- Sticky "Save" button at bottom
- Haptic feedback on selection (iOS)

#### 2.3 Symptom History View

**7-Day Summary View:**
```
─────────────────────────────────────
Your Last 7 Days

Week of Oct 19-25, 2024

          Mon Tue Wed Thu Fri Sat Sun
Hot flash  3   4   2   3   5   2   -
Sleep      4   5   3   4   4   3   2
Anxiety    3   3   4   2   3   -   -
Brain fog  2   3   4   3   3   2   -
Energy     2   2   3   3   4   4   5

[View Full History]
─────────────────────────────────────

Most Frequent Symptoms This Week:
🔥 Hot flashes (6 days)
😰 Anxiety (5 days)
😴 Sleep issues (7 days)

[Log Today's Symptoms]
─────────────────────────────────────
```

**Calendar View (Optional):**
- Monthly calendar
- Days with check-ins highlighted
- Tap day to see details
- Visual indicators for symptom severity (color intensity)

**Database Schema:**
```sql
CREATE TABLE symptom_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  symptoms JSONB NOT NULL, -- {symptom_name: severity, ...}
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, log_date) -- One log per day per user
);

-- Example JSONB structure for symptoms:
-- {
--   "hot_flashes": 4,
--   "anxiety": 3,
--   "sleep_issues": 5
-- }

-- Indexes for performance
CREATE INDEX idx_symptom_logs_user_date ON symptom_logs(user_id, log_date DESC);
CREATE INDEX idx_symptom_logs_date ON symptom_logs(log_date);

-- RLS Policies
ALTER TABLE symptom_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs"
  ON symptom_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
  ON symptom_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs"
  ON symptom_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs"
  ON symptom_logs FOR DELETE
  USING (auth.uid() = user_id);
```

#### 2.4 Analytics (Simple)

**Dashboard Widget:**
```
─────────────────────────────────────
Your Tracking Stats

This Month:
📊 15 days logged (50%)
🔥 Most common: Hot flashes (12 days)
😊 Avg energy level: 3.2/5
📝 4 journal entries

Keep it up! Consistent tracking helps you 
spot patterns.

[View Details]
─────────────────────────────────────
```

**Insights (Text-Based, No Complex Graphs):**
- Most frequent symptoms
- Average severity per symptom
- Days logged this week/month
- Energy level trends (up/down/stable)
- Encouraging messages based on consistency

---

### 3. Journal System

#### 3.1 Journal Entry Interface

**Create New Entry:**
```
─────────────────────────────────────
Journal Entry
Friday, October 25, 2024 - 2:47 PM
─────────────────────────────────────

How are you feeling today?

[Large text area - 500 char minimum]

─────────────────────────────────────
Need inspiration? Try these prompts:

- What's been on your mind today?
- What triggered your symptoms?
- What helped you feel better?
- What are you grateful for today?
- How did you take care of yourself?
─────────────────────────────────────

Mood: 
○ Struggling  ○ Okay  ○ Good  ○ Great

🔒 Private - Only you can see this

[Save Entry]  [Discard]
─────────────────────────────────────
```

**UI/UX Requirements:**
- Auto-save drafts every 30 seconds
- Character count indicator (optional)
- Prompts show as clickable chips - click to insert into text
- Mood selector optional (hidden by default, "Add mood?" link)
- Privacy icon prominent
- Confirmation before discarding
- Success message: "✓ Entry saved"

#### 3.2 Journal List View

**Chronological List:**
```
─────────────────────────────────────
Your Journal

[Search entries...] 🔍

─────────────────────────────────────

October 25, 2024 - 2:47 PM
I had a rough night with hot flashes again.
Couldn't sleep past 3am. Feeling exhausted...
                                      [Read]

October 24, 2024 - 9:15 PM
Today was actually a good day! My mood was
stable and I had more energy than usual...
                                      [Read]

October 22, 2024 - 7:30 AM
Woke up feeling anxious about the work
presentation. Brain fog is making it hard...
                                      [Read]

[Load More...]
─────────────────────────────────────
```

**Entry Detail View:**
```
─────────────────────────────────────
October 25, 2024 - 2:47 PM

I had a rough night with hot flashes again.
Couldn't sleep past 3am. Feeling exhausted 
and irritable. Snapped at my partner this 
morning over something small. I know it's 
the lack of sleep but I feel terrible about it.

Trying to remind myself this is temporary 
and I'm doing the best I can.

Mood: Struggling 😔

─────────────────────────────────────
[Edit]  [Delete]  [← Back]
─────────────────────────────────────
```

#### 3.3 Journal Features

**Core Functionality:**
- Create new entry
- Edit existing entry (within 24 hours)
- Delete entry (with confirmation)
- Search entries by keyword
- Filter by date range (optional)
- Export all entries as PDF (optional)

**Search:**
- Full-text search
- Highlights matching terms
- Results sorted by date (newest first)

**Database Schema:**
```sql
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  content TEXT NOT NULL,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 4), -- 1=struggling, 4=great
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Full-text search index
CREATE INDEX idx_journal_content_search ON journal_entries 
USING gin(to_tsvector('english', content));

-- Date index for sorting
CREATE INDEX idx_journal_user_date ON journal_entries(user_id, entry_date DESC);

-- RLS Policies
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entries"
  ON journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON journal_entries FOR DELETE
  USING (auth.uid() = user_id);
```

---

### 4. Daily Motivation System

#### 4.1 Daily Message

**Home Dashboard Card:**
```
─────────────────────────────────────
☀️ Today's Message

"You're not losing your mind. You're 
navigating a natural transition with 
incredible strength."

[← Previous]  [Next →]
─────────────────────────────────────
```

**Message Categories (Mix Throughout):**

**Affirmations (40%):**
- "You're not losing your mind. You're navigating a natural transition."
- "Your feelings are valid. Your experience matters."
- "This phase is temporary. You will feel like yourself again."
- "You're stronger than you know, even on the hard days."
- "Be patient with yourself. Healing isn't linear."

**Education (30%):**
- "75% of women experience hot flashes during perimenopause."
- "Brain fog is caused by fluctuating estrogen levels, not aging."
- "Sleep disruption often improves after menopause."
- "Mood swings are a normal part of hormonal changes."
- "Your symptoms are real, valid, and temporary."

**Tips (20%):**
- "Keep a small fan at your desk for hot flashes."
- "Layer your clothing for easy temperature control."
- "Try magnesium supplements for better sleep (check with doctor)."
- "Morning sunlight can help regulate sleep patterns."
- "Deep breathing can calm anxiety in 90 seconds."

**Encouragement (10%):**
- "You've logged symptoms 5 days this week. That's progress!"
- "Many women report feeling more confident after menopause."
- "You're part of a community of women supporting each other."
- "Every day you track is a step toward understanding your body."

**Implementation:**
```typescript
// Store as TypeScript array
const dailyMessages = [
  {
    id: 1,
    category: 'affirmation',
    text: "You're not losing your mind. You're navigating a natural transition."
  },
  // ... 50-100 messages
];

// Rotate based on: (user join date + current day) % messages.length
const getTodaysMessage = (userJoinDate: Date) => {
  const daysSinceJoin = Math.floor(
    (Date.now() - userJoinDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  return dailyMessages[daysSinceJoin % dailyMessages.length];
};
```

#### 4.2 Motivation Library (Optional)

**Browse All Messages:**
- Filter by category
- Favorite messages
- Share message (social media)

---

### 5. Dashboard (Home Screen)

#### 5.1 Dashboard Layout
```
─────────────────────────────────────
Welcome back, Sarah! ☀️
Friday, October 25, 2024
─────────────────────────────────────

[Daily Message Card]
☀️ Today's Message
"You're not losing your mind..."
[← Previous] [Next →]

─────────────────────────────────────

[Quick Actions]

□ Log Today's Symptoms
✓ Journal Entry (Completed)

─────────────────────────────────────

[This Week Summary]

📊 You've logged 5 of 7 days
📝 3 journal entries this week

🔥 Hot flashes: Decreased 15%
😊 Mood: Mostly stable
⚡ Energy: Improving

[View Details]

─────────────────────────────────────

[Quick Stats]

Member for: 14 days
Total check-ins: 12
Total journal entries: 8
Current streak: 3 days 🔥

─────────────────────────────────────

Navigation:
[Home] [Track] [Journal] [Profile]
─────────────────────────────────────
```

**UI Components:**
- Personalized greeting with user's name
- Current date prominently displayed
- Daily message card (rotates)
- Quick action buttons (large, colorful)
- Visual checkmarks for completed actions
- Simple stats with emoji indicators
- Bottom navigation bar (sticky on mobile)

#### 5.2 Navigation Structure

**Bottom Tab Bar (Mobile):**
- 🏠 Home (dashboard)
- 📊 Track (symptom tracker)
- 📝 Journal (journal entries)
- 👤 Profile (user settings)

**Desktop Header:**
- Logo (left)
- Navigation links (center): Home | Track | Journal
- Profile avatar + name (right)

---

### 6. User Profile & Settings

#### 6.1 Profile Page
```
─────────────────────────────────────
Profile
─────────────────────────────────────

[Avatar Circle]
Sarah M.
Member since October 11, 2024

[Edit Profile]

─────────────────────────────────────

Your Journey:
Perimenopause
Primary concerns: Hot flashes, Sleep issues

[Update Journey Info]

─────────────────────────────────────

Account:
Email: sarah@example.com ✓
Password: ••••••••  [Change]
Sign-in methods: 
  • Google ✓
  • Apple ✓

─────────────────────────────────────

Preferences:
□ Email me daily reminders to log symptoms
□ Email me weekly summary
□ Share my data for research (anonymous)

[Save Preferences]

─────────────────────────────────────

Data & Privacy:
[Export My Data]
[Delete My Account]

[Privacy Policy] [Terms of Service]

─────────────────────────────────────

[Sign Out]
─────────────────────────────────────
```

**Edit Profile Modal:**
- Change display name
- Upload profile photo (optional)
- Update menopause stage
- Update primary concerns

**Change Password Flow:**
- Requires current password
- New password (8+ characters)
- Confirmation
- Email notification on change

**Account Deletion:**
- Requires password confirmation
- Warning message: "This will delete all your data permanently"
- Checkbox: "I understand this cannot be undone"
- Final confirmation button
- Immediate deletion (no 30-day grace period for MVP)

---

### 7. Landing Page

#### 7.1 Hero Section
```
─────────────────────────────────────
[MenoAI Logo]                  [Sign In]
─────────────────────────────────────

Feel like you're going crazy?
You're not. You're just in 
perimenopause.

AI-powered menopause support with 
daily emotional tracking and coaching.

[Join Free Beta →]

[Right side: AI chat mockup + 
symptom tracker preview screenshot]

─────────────────────────────────────
```

**Design Requirements:**
- Large, bold headline (H1)
- Warm gradient background (soft pinks/purples)
- Primary CTA: "Join Free Beta" (prominent)
- Product screenshots on right (desktop) or below (mobile)
- Clean, minimal design
- Sans-serif font (Inter or Manrope)

#### 7.2 How MenoAI Helps (3 Features)
```
─────────────────────────────────────

How MenoAI Helps

[Icon]              [Icon]              [Icon]
Symptom Insight    Emotional Support    Daily Motivation

Log and track      Journal your         Get daily tips
your menopause     feelings and         and affirmations
journey            process emotions     to stay strong

─────────────────────────────────────
```

**Layout:**
- 3-column grid (desktop)
- Stacked cards (mobile)
- Icon + title + description per feature
- Simple, readable text

#### 7.3 Product Preview
```
─────────────────────────────────────

See MenoAI in Action

[Screenshot 1]    [Screenshot 2]    [Screenshot 3]
Symptom Tracker   Journal           Dashboard

─────────────────────────────────────
```

**Requirements:**
- Real screenshots from the app
- Mockup frames (iPhone/browser)
- Highlight key features
- Clean, professional presentation

#### 7.4 Testimonials (Placeholder)
```
─────────────────────────────────────

What Women Are Saying

[Avatar]
"MenoAI helped me realize I wasn't losing 
my mind. The tracking showed patterns I 
never noticed before."
— Sarah, 48, Teacher

[Avatar]
"Having a journal that's just for me has 
been so healing. I can finally process 
what I'm going through."
— Maria, 52, Executive

[Avatar]
"The daily affirmations keep me going on 
the hard days."
— Jane, 45, Designer

─────────────────────────────────────
```

**Implementation:**
- Start with realistic personas (can be placeholder)
- Replace with real testimonials after beta
- Avatar circles + quote + name/age/occupation
- Slider/carousel for mobile

#### 7.5 Call-to-Action
```
─────────────────────────────────────

Ready to Feel Like Yourself Again?

Join thousands of women tracking their 
menopause journey with MenoAI.

[Join Free Beta →]

No credit card required. 
Start tracking in under 2 minutes.

─────────────────────────────────────
```

#### 7.6 Footer
```
─────────────────────────────────────

MenoAI

Product              Company
- Features           • About
- How it Works       • Contact
- Free Beta          • Blog

Legal                Connect
- Privacy Policy     • LinkedIn
- Terms of Service   • TikTok
                     • Instagram

Newsletter:
Get AI tips for thriving in midlife
[Email]  [Subscribe]

© 2024 MenoAI. All rights reserved.

─────────────────────────────────────
```

---

### 8. Additional Pages

#### 8.1 About Page

**Content Needed:**
- Cheila's story (why she built MenoAI)
- Mission statement
- Statistics about menopause (87% inadequate care, etc.)
- Team section (can be just Cheila for now)
- Contact information

**Tone:**
- Personal and warm
- Authentic and vulnerable
- Empowering and hopeful

#### 8.2 Privacy Policy
- Already created ✓
- Update to mention Apple Sign-In
- Mention data storage (Supabase)
- GDPR compliance details

#### 8.3 Terms of Service
- Already created ✓
- Medical disclaimer
- Free service terms
- Account termination clauses

#### 8.4 Contact Page
```
─────────────────────────────────────

Get in Touch

We'd love to hear from you!

Name: [Input]
Email: [Input]
Message: [Text area]

[Send Message]

Or email us directly:
support@menoai.com

We typically respond within 24 hours.

─────────────────────────────────────
```

**Implementation:**
- Form submits to Supabase
- Email notification to support@menoai.com
- Success message after submission
- Form validation

**Database Schema:**
```sql
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new', -- new, replied, resolved
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Technical Requirements

### Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Radix UI or shadcn/ui (for accessible components)

**Backend:**
- Supabase (PostgreSQL database)
- Supabase Auth (email, Google, Apple)
- Supabase Storage (for profile photos)
- Supabase Realtime (optional for future features)

**Deployment:**
- Frontend: Vercel or Netlify
- Database: Supabase (managed)
- Domain: Custom domain (menoai.com or similar)

**Development Tools:**
- Git + GitHub
- ESLint + Prettier
- TypeScript strict mode
- Environment variables (.env.local)

### Authentication Setup

#### Email + Password
- Already implemented ✓
- Password requirements: 8+ characters
- Email verification (optional for MVP)
- Password reset flow

#### Google OAuth
- Already implemented ✓
- Supabase Google provider configured
- OAuth consent screen completed
- Redirect URIs set up

#### Apple Sign-In (NEW)

**Setup Steps:**

1. **Apple Developer Account:**
   - Enroll in Apple Developer Program ($99/year)
   - Create App ID for MenoAI
   - Enable "Sign in with Apple" capability

2. **Create Service ID:**
   - Go to Certificates, Identifiers & Profiles
   - Create new Service ID
   - Configure with domain and redirect URLs
   - Example: `app.menoai.com` → `https://app.menoai.com/auth/callback`

3. **Create Private Key:**
   - Generate private key for Sign in with Apple
   - Download .p8 key file (keep secure!)
   - Note the Key ID

4. **Configure Supabase:**
```typescript
   // In Supabase Dashboard > Authentication > Providers > Apple
   // Enable Apple provider
   // Add:
   // - Services ID (e.g., com.menoai.auth)
   // - Team ID (from Apple Developer)
   // - Key ID
   // - Private Key (contents of .p8 file)
```

5. **Frontend Implementation:**
```typescript
   // components/auth/SignInModal.tsx
   
   const signInWithApple = async () => {
     const { data, error } = await supabase.auth.signInWithOAuth({
       provider: 'apple',
       options: {
         redirectTo: `${window.location.origin}/auth/callback`,
         scopes: 'name email', // optional
       }
     });
     
     if (error) {
       console.error('Apple sign-in error:', error);
       // Show error message to user
     }
   };
   
   // Button component
   <button
     onClick={signInWithApple}
     className="apple-signin-button"
   >
     <AppleIcon />
     <span>Sign in with Apple</span>
   </button>
```

6. **Button Styling (Apple HIG):**
```css
   /* Must follow Apple's design guidelines */
   .apple-signin-button {
     background: #000;
     color: #fff;
     border-radius: 8px;
     padding: 12px 16px;
     font-weight: 600;
     display: flex;
     align-items: center;
     gap: 8px;
   }
   
   .apple-signin-button:hover {
     background: #333;
   }
```

7. **Handle Privacy Features:**
```typescript
   // Apple allows users to hide their email
   // Handle this in profile creation
   
   const handleAppleSignIn = async (session) => {
     const email = session.user.email || 
                   session.user.user_metadata?.email ||
                   'privaterelay@icloud.com'; // Apple's private relay
     
     // Create profile with email (may be hidden)
     await createUserProfile({
       user_id: session.user.id,
       email: email,
       display_name: session.user.user_metadata?.full_name || 'User'
     });
   };
```

**Apple Sign-In Testing:**
- Test on iPhone/iPad (Safari)
- Test on macOS (Safari)
- Test on other browsers (Chrome, Firefox)
- Test email hiding feature
- Test name prefill feature

**Acceptance Criteria:**
- ✓ Apple Sign-In button appears in sign-in modal
- ✓ Clicking button redirects to Apple auth
- ✓ User can authenticate with Apple ID
- ✓ Callback redirects to app correctly
- ✓ User profile created with Apple data
- ✓ Works on iOS devices (iPhone, iPad)
- ✓ Works on macOS (Safari)
- ✓ Follows Apple Human Interface Guidelines
- ✓ Privacy features (email hiding) handled gracefully

### Database Architecture

**Complete Schema:**

See individual feature sections above for table definitions.

**Key Tables:**
1. `user_profiles` - User information and onboarding data
2. `symptom_logs` - Daily symptom tracking
3. `journal_entries` - Journal entries
4. `contact_submissions` - Contact form submissions

**Indexes:**
- User ID indexes on all tables (for RLS)
- Date indexes for time-based queries
- Full-text search index on journal content

**Row Level Security (RLS):**
- All tables have RLS enabled
- Users can only access their own data
- Policies for SELECT, INSERT, UPDATE, DELETE
- No admin overrides in MVP (add later)

### Performance Requirements

**Page Load:**
- Initial load: < 2 seconds
- Subsequent pages: < 1 second
- API responses: < 500ms

**Mobile:**
- Works on iOS 14+
- Works on Android 10+
- Responsive breakpoints: 320px, 768px, 1024px
- Touch targets: 44px minimum

**Accessibility:**
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast ratios
- Focus indicators

### Security Requirements

**Authentication:**
- Secure token storage
- HTTPS only
- CSRF protection
- Rate limiting on auth endpoints

**Data Protection:**
- RLS on all tables
- No sensitive data in URLs
- Encrypted at rest (Supabase default)
- Encrypted in transit (HTTPS)

**Privacy:**
- GDPR compliant
- Data minimization
- User can export data
- User can delete account

---

## User Flows

### Flow 1: New User Sign-Up
```
1. User lands on homepage
2. Clicks "Join Free Beta"
3. Sees sign-in modal with 3 options:
   - Sign in with Apple (NEW)
   - Sign in with Google
   - Sign in with Email
4. User selects authentication method
5. Completes auth (varies by method)
6. Redirected to onboarding Step 1
7. Enters display name
8. Clicks "Continue"
9. Onboarding Step 2: Selects journey stage + concerns
10. Clicks "Get Started"
11. Profile created, redirected to dashboard
12. (Optional) Brief product tour shows
13. User sees dashboard with empty state
14. Prompted to "Log Today's Symptoms" or "Write Journal Entry"
```

### Flow 2: Daily Symptom Tracking
```
1. User opens app (already signed in)
2. Lands on dashboard
3. Clicks "Log Today's Symptoms"
4. Sees symptom tracker form
5. Checks relevant symptoms (e.g., Hot flashes, Anxiety)
6. For each checked symptom, sets severity (1-5)
7. Sets energy level (1-5)
8. Optionally adds notes
9. Clicks "Save Check-In"
10. Success message appears
11. Redirected to dashboard
12. Dashboard shows updated stats
```

### Flow 3: Journaling
```
1. User opens app
2. From dashboard, clicks "Write Journal Entry"
3. Sees journal entry form
4. Writes entry (free text)
5. Optionally clicks a prompt for inspiration
6. Optionally sets mood (1-4)
7. Clicks "Save Entry"
8. Success message appears
9. Entry added to journal list
10. Can view/edit/delete later
```

### Flow 4: Reviewing History
```
1. User opens app
2. Clicks "Track" tab (symptom history)
3. Sees 7-day summary of logged symptoms
4. Reviews patterns (e.g., "Hot flashes 6 days")
5. Clicks "View Full History"
6. Sees calendar view or detailed list
7. Can tap specific days to see details
8. Can export data (optional)
```

---

## Design System

### Colors

**Primary Palette:**
- Primary Pink: `#FF9B9B` (buttons, links)
- Primary Purple: `#C39BD3` (accents)
- Light Pink: `#FFE5E5` (backgrounds)
- Light Purple: `#F4ECF7` (backgrounds)

**Neutral Palette:**
- White: `#FFFFFF`
- Off-White: `#FAF9F7`
- Light Gray: `#F5F5F5`
- Medium Gray: `#9CA3AF`
- Dark Gray: `#374151`
- Black: `#111827`

**Semantic Colors:**
- Success: `#10B981` (green)
- Warning: `#F59E0B` (amber)
- Error: `#EF4444` (red)
- Info: `#3B82F6` (blue)

**Gradients:**
```css
/* Hero background */
background: linear-gradient(135deg, #FFE5E5 0%, #F4ECF7 100%);

/* Card hover */
background: linear-gradient(135deg, #FF9B9B 0%, #C39BD3 100%);
```

### Typography

**Font Family:**
- Primary: Inter or Manrope (sans-serif)
- Fallback: system-ui, -apple-system, sans-serif

**Font Sizes:**
```css
/* Headings */
h1: 2.5rem (40px) - Hero headlines
h2: 2rem (32px) - Section headers
h3: 1.5rem (24px) - Subsection headers
h4: 1.25rem (20px) - Card titles

/* Body */
body: 1rem (16px) - Main text
small: 0.875rem (14px) - Captions, metadata
xs: 0.75rem (12px) - Tiny labels

/* Line Heights */
headings: 1.2
body: 1.6
```

**Font Weights:**
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### Spacing

**Scale (Tailwind default):**
```
0: 0
1: 0.25rem (4px)
2: 0.5rem (8px)
3: 0.75rem (12px)
4: 1rem (16px)
5: 1.25rem (20px)
6: 1.5rem (24px)
8: 2rem (32px)
10: 2.5rem (40px)
12: 3rem (48px)
16: 4rem (64px)
20: 5rem (80px)
```

**Common Uses:**
- Button padding: `px-6 py-3` (24px x 12px)
- Card padding: `p-6` (24px)
- Section spacing: `py-16` (64px)
- Gap between elements: `gap-4` (16px)

### Components

**Buttons:**
```tsx
// Primary Button
<button className="
  bg-gradient-to-r from-pink-400 to-purple-400
  text-white font-semibold
  px-6 py-3 rounded-lg
  hover:from-pink-500 hover:to-purple-500
  transition-all duration-200
  shadow-md hover:shadow-lg
">
  Button Text
</button>

// Secondary Button
<button className="
  bg-white border-2 border-pink-400
  text-pink-400 font-semibold
  px-6 py-3 rounded-lg
  hover:bg-pink-50
  transition-all duration-200
">
  Button Text
</button>
```

**Cards:**
```tsx
<div className="
  bg-white rounded-xl shadow-md
  p-6 hover:shadow-lg
  transition-shadow duration-200
">
  Card Content
</div>
```

**Inputs:**
```tsx
<input className="
  w-full px-4 py-3
  border-2 border-gray-200 rounded-lg
  focus:border-pink-400 focus:ring-2 focus:ring-pink-100
  transition-all duration-200
  placeholder-gray-400
" />
```

### Icons

**Icon Library:**
- Lucide React (preferred) or Heroicons
- Size: 20px (small), 24px (medium), 32px (large)
- Stroke width: 2px

**Common Icons:**
- Home: `Home` or `House`
- Track: `Activity` or `BarChart3`
- Journal: `BookOpen` or `PenLine`
- Profile: `User` or `Settings`
- Menu: `Menu`
- Close: `X`
- Check: `Check`
- Arrow: `ArrowRight`
- Apple: Custom Apple logo SVG

---

## Content Requirements

### Copy Tone & Voice

**Principles:**
- Warm and empathetic (not clinical)
- Validating and normalizing (not dismissive)
- Hopeful and empowering (not patronizing)
- Clear and direct (not verbose)
- Personal and conversational (not corporate)

**Examples:**

**Good:**
- "You're not losing your mind. You're navigating a natural transition."
- "Your feelings are valid."
- "This is temporary."

**Bad:**
- "Perimenopause is a natural biological process affecting hormonal balance."
- "Don't worry, it will pass eventually."
- "Just stay positive!"

### Required Content

**Daily Messages:** 50-100 messages
- 40% affirmations
- 30% education
- 20% tips
- 10% encouragement

**Journal Prompts:** 20-30 prompts
- Open-ended questions
- Reflective prompts
- Gratitude prompts
- Processing prompts

**Symptom Descriptions:** 15 symptoms
- Brief 1-2 sentence description
- "What it feels like"
- Optional: "Why it happens"

**Landing Page:**
- Hero headline + subtext
- 3 feature descriptions (50 words each)
- 3 testimonials (placeholder OK)
- About page content (Cheila's story)
- Footer copy

---

## Success Metrics (Post-Launch)

### Engagement Metrics

**Daily Active Users (DAU):**
- Target: 60% of registered users active within 7 days
- Measure: Users who log symptoms or journal

**Retention:**
- 7-day retention: 50%+
- 30-day retention: 30%+
- 90-day retention: 20%+

**Feature Usage:**
- Symptom tracking: 70%+ of users log at least once
- Journaling: 40%+ of users create at least 1 entry
- Repeat usage: 50%+ return within 48 hours

### Quality Metrics

**Completion Rates:**
- Onboarding completion: 80%+
- Symptom log completion: 90%+
- Journal entry saves: 85%+

**Performance:**
- Page load time: < 2s (90th percentile)
- API response time: < 500ms
- Error rate: < 1%

**User Satisfaction:**
- Net Promoter Score (NPS): 40+
- User ratings (when available): 4.0+/5.0
- Support tickets: < 5 per 100 users/month

---

## Acceptance Criteria

### Definition of Done (DoD)

For each feature to be considered complete:

✅ **Functionality:**
- Feature works as described in PRD
- All user flows tested and working
- Edge cases handled (empty states, errors, etc.)
- Mobile-responsive on iOS and Android

✅ **Code Quality:**
- TypeScript with no type errors
- ESLint passes with no errors
- Code follows project conventions
- No console.log statements in production

✅ **Database:**
- Schema created and tested
- RLS policies implemented and tested
- Indexes created for performance
- Sample data works correctly

✅ **UI/UX:**
- Matches design system
- Accessible (keyboard nav, screen readers)
- Loading states implemented
- Success/error messages implemented
- Follows Apple HIG (for Apple Sign-In)

✅ **Testing:**
- Manual testing completed
- Tested on iOS (iPhone/iPad)
- Tested on Android
- Tested on desktop browsers
- No critical bugs

✅ **Documentation:**
- Code commented where necessary
- API routes documented
- Database schema documented
- Feature usage documented

---

## Launch Checklist

### Pre-Launch (Week Before)

- [ ] All features complete and tested
- [ ] Apple Sign-In fully configured and tested on iOS
- [ ] Database migrations run successfully
- [ ] Environment variables set correctly
- [ ] Analytics/monitoring set up
- [ ] Error tracking configured
- [ ] Domain configured and SSL working
- [ ] Privacy Policy and Terms updated
- [ ] Contact form working
- [ ] Email notifications working (if applicable)
- [ ] Beta testing with 5-10 users completed
- [ ] Critical bugs fixed
- [ ] Mobile apps tested on real devices
- [ ] Performance optimization done
- [ ] Backup strategy in place

### Launch Day

- [ ] Deploy to production
- [ ] Smoke test all critical flows
- [ ] Monitor error logs
- [ ] Monitor performance metrics
- [ ] Announce on social media
- [ ] Email existing waitlist (if any)
- [ ] Monitor user signups
- [ ] Be available for support

### Post-Launch (First Week)

- [ ] Monitor daily active users
- [ ] Monitor error rates
- [ ] Respond to user feedback
- [ ] Fix critical bugs immediately
- [ ] Track feature usage
- [ ] Collect user testimonials
- [ ] Plan first iteration based on feedback

---

## Future Enhancements (Post-MVP)

### Phase 2: Paid Tiers (After Free Tier Launch)

**MenoPlus (£19.99/mo):**
- AI emotional coach (already built)
- Insights dashboard with AI analysis
- Pattern recognition
- Personalized recommendations

**MenoElite (£49.99/mo):**
- Wearable device sync
- Therapist-created content library
- Priority support
- Advanced analytics

**Founding Member (£99 lifetime):**
- All Elite features forever
- Badge/status
- Early access to new features

### Phase 3: Community Features

- Discussion forums (moderated)
- Peer support matching
- Group challenges
- Expert Q&A sessions

### Phase 4: Corporate/B2B

- Team dashboards
- Corporate licenses
- HR integrations
- Educational resources for employers

---

## Risks & Mitigations

### Technical Risks

**Risk:** Apple Sign-In configuration issues
**Mitigation:** Follow Apple documentation exactly, test thoroughly on iOS devices, have fallback to email/Google

**Risk:** Database performance issues at scale
**Mitigation:** Proper indexing, RLS optimization, monitor query performance, upgrade Supabase plan if needed

**Risk:** Mobile browser compatibility
**Mitigation:** Test on real devices early, use Progressive Web App features, graceful degradation

### Product Risks

**Risk:** Users don't see value in free tier
**Mitigation:** Focus on core value (symptom tracking + journaling), gather feedback early, iterate quickly

**Risk:** Low retention after initial signup
**Mitigation:** Daily engagement hooks (motivation messages), streaks, progress tracking, email reminders

**Risk:** Users want AI coach immediately
**Mitigation:** Show clear upgrade path, preview AI features, collect feedback on willingness to pay

### Business Risks

**Risk:** Can't convert free users to paid
**Mitigation:** Build exceptional free tier, create clear value difference, test pricing, founding member offer

**Risk:** Market too small
**Mitigation:** 1.2B women in menopause globally, 87% report inadequate support, large addressable market

---

## Timeline Estimate

### With Claude Code (DIY)

**Week 1:**
- Days 1-2: Apple Sign-In setup and testing
- Days 3-5: Symptom tracker implementation
- Days 6-7: Journal system implementation

**Week 2:**
- Days 1-2: Dashboard and navigation
- Days 3-4: Daily motivation system
- Days 5-7: Landing page

**Week 3:**
- Days 1-3: Additional pages (About, Contact, etc.)
- Days 4-5: Testing and bug fixes
- Days 6-7: Polish and deployment

**Total: ~50-65 hours over 3 weeks**

### With Developer Building

**Week 1-2:**
- All features implemented
- Initial testing completed
- Apple Sign-In fully configured

**Week 3:**
- Landing page and content
- Final testing and polish
- Deployment

**Total: ~35-40 hours over 2 weeks**

---

## Appendix

### A. Symptom Severity Scale

**1 - Very Mild:**
- Barely noticeable
- Doesn't affect daily activities

**2 - Mild:**
- Noticeable but manageable
- Minor impact on activities

**3 - Moderate:**
- Clearly present
- Some impact on daily life

**4 - Severe:**
- Hard to ignore
- Significantly affects activities

**5 - Very Severe:**
- Overwhelming
- Prevents normal activities

### B. Mood Scale

**1 - Struggling:**
- Having a very hard time
- Feeling overwhelmed

**2 - Okay:**
- Getting by
- Some challenges

**3 - Good:**
- Feeling mostly positive
- Managing well

**4 - Great:**
- Feeling strong
- Having a good day

### C. Sample Daily Messages

See content requirements section for message examples.

### D. Journal Prompts

1. "What's been on your mind today?"
2. "What triggered your symptoms?"
3. "What helped you feel better?"
4. "What are you grateful for today?"
5. "How did you take care of yourself?"
6. "What did you learn about your body today?"
7. "What do you need right now?"
8. "What made you smile today?"
9. "What was challenging about today?"
10. "What do you want to remember about this moment?"

---

## Document Change Log

**v1.0 - October 25, 2025**
- Initial PRD created
- Free tier scope defined
- Apple Sign-In added to authentication requirements
- Complete feature specifications
- Database schemas defined
- Technical requirements documented

---

## Contacts

**Product Owner:** Cheila Gibbs
**Developer:** [Your Name]
**Support:** support@menoai.com

---

**End of PRD**