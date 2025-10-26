# MenoAI - Comprehensive Testing Guide

**Phase 3 - Journal System Testing**
**Date:** October 26, 2025

This guide will help you systematically test all features to ensure the journal system and related functionality are working correctly.

---

## 🚀 Quick Start

### Prerequisites
- ✅ Frontend running on port 3000
- ✅ Backend running on port 4000
- ✅ Supabase database configured
- ✅ Test user account created

---

## 📋 Testing Checklist

### 1. Authentication & Onboarding

#### Test 1.1: Email Authentication
- [ ] Sign up with a new email/password
- [ ] Verify email confirmation (if required)
- [ ] Sign out
- [ ] Sign in with the same credentials
- [ ] Verify you're redirected to onboarding (first time)

#### Test 1.2: Google OAuth
- [ ] Click "Sign in with Google"
- [ ] Complete Google authentication flow
- [ ] Verify redirect back to app
- [ ] Check user is authenticated
- [ ] Verify onboarding redirect (first time)

#### Test 1.3: Onboarding Flow
- [ ] Complete Step 1: Personal info (name, age)
- [ ] Complete Step 2: Menopause stage selection
- [ ] Complete Step 3: Initial symptoms selection
- [ ] Complete Step 4: Motivation/goals
- [ ] Verify profile saved to Supabase `profiles` table
- [ ] Verify redirect to chat/dashboard after completion
- [ ] Sign out and back in - should NOT see onboarding again

**Expected Database Tables:**
- `auth.users` - User authentication record
- `profiles` - User profile data with onboarding info

---

### 2. Symptom Tracking

#### Test 2.1: Add Symptoms
- [ ] Navigate to symptom tracking page
- [ ] Add a new symptom (e.g., "Hot flashes")
- [ ] Set severity level (1-5)
- [ ] Add optional notes
- [ ] Save the symptom
- [ ] Verify it appears in the symptoms list

#### Test 2.2: Edit Symptoms
- [ ] Click edit on an existing symptom
- [ ] Change severity level
- [ ] Update notes
- [ ] Save changes
- [ ] Verify updates are reflected

#### Test 2.3: Delete Symptoms
- [ ] Click delete on a symptom
- [ ] Confirm deletion
- [ ] Verify symptom is removed from list

#### Test 2.4: Symptom History
- [ ] Add multiple symptoms over different dates
- [ ] View symptom history/timeline
- [ ] Verify chronological ordering
- [ ] Check date filters work correctly

**Expected Database Tables:**
- `symptoms` - Symptom tracking records

**API Endpoints to Verify:**
```bash
# Get symptoms for user
curl http://localhost:4000/api/symptoms/entries/{userId}?limit=10

# Create symptom
curl -X POST http://localhost:4000/api/symptoms/entries \
  -H "Content-Type: application/json" \
  -d '{"user_id":"UUID","symptom_date":"2025-10-26","symptom_name":"Hot flashes","severity":4,"notes":"Woke up 3 times"}'
```

---

### 3. Journal System (MAIN FOCUS)

#### Test 3.1: Create Journal Entry
- [ ] Navigate to `/journal` page
- [ ] Click "New Entry" tab
- [ ] See writing prompts displayed
- [ ] Click a writing prompt (should insert into text area)
- [ ] Write journal content (at least 50 characters)
- [ ] Select a mood rating (1-4)
- [ ] Click "Save Entry"
- [ ] Verify success message
- [ ] Check entry appears in "My Entries" tab

#### Test 3.2: View Journal Entries
- [ ] Go to "My Entries" tab
- [ ] See list of all entries
- [ ] Verify entries show:
  - Date
  - Mood emoji and label
  - Content preview
  - Edit/Delete buttons
- [ ] Verify entries are in reverse chronological order (newest first)
- [ ] Test pagination (if you have 20+ entries)

#### Test 3.3: Edit Journal Entry
- [ ] Click "Edit" on an entry in "My Entries"
- [ ] Verify it switches to "New Entry" tab
- [ ] Verify existing content is loaded
- [ ] Modify the content
- [ ] Change mood rating
- [ ] Click "Save"
- [ ] Return to "My Entries"
- [ ] Verify changes are saved

#### Test 3.4: Delete Journal Entry
- [ ] Click "Delete" on an entry
- [ ] Confirm deletion dialog
- [ ] Verify entry is removed from list
- [ ] Check database to ensure it's deleted

#### Test 3.5: Journal Search
- [ ] Create entries with distinct keywords
- [ ] Use search functionality
- [ ] Search for specific words (e.g., "doctor", "sleep")
- [ ] Verify only matching entries appear
- [ ] Test search with no results
- [ ] Clear search and verify all entries return

#### Test 3.6: Journal Statistics
- [ ] Go to "Stats" tab
- [ ] Verify the following stats display correctly:
  - Total number of entries
  - Entries this week
  - Entries this month
  - Average mood rating
  - Current writing streak (consecutive days)
  - Mood distribution chart (if implemented)
- [ ] Add a new entry and refresh stats
- [ ] Verify stats update correctly

#### Test 3.7: Mood Tracking
- [ ] Create entries with different moods:
  - 1 (Struggling) - should show 😔 red
  - 2 (Okay) - should show 😐 yellow
  - 3 (Good) - should show 🙂 blue
  - 4 (Great) - should show 😊 green
- [ ] Verify mood colors and emojis display correctly
- [ ] Check average mood calculation in stats

#### Test 3.8: Edge Cases
- [ ] Try to save empty journal entry (should show error)
- [ ] Try extremely long content (10,000+ characters)
- [ ] Try special characters and emojis in content
- [ ] Create multiple entries on the same day
- [ ] Create entry with mood but no additional notes

**Expected Database Tables:**
- `journal_entries` - All journal entries

**API Endpoints to Verify:**
```bash
# Get your user ID first (from Supabase dashboard or browser console)
USER_ID="your-user-id-here"

# Create journal entry
curl -X POST http://localhost:4000/api/journal/entries \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "'$USER_ID'",
    "entry_date": "2025-10-26",
    "content": "Today was a good day. I felt more energized than usual.",
    "mood_rating": 3
  }'

# Get all entries
curl "http://localhost:4000/api/journal/entries/$USER_ID?limit=10"

# Get stats
curl "http://localhost:4000/api/journal/stats/$USER_ID"

# Search entries
curl "http://localhost:4000/api/journal/search/$USER_ID?q=energized&limit=10"
```

---

### 4. Chat Functionality

#### Test 4.1: Send Messages
- [ ] Navigate to `/chat` page
- [ ] Type a message in the input
- [ ] Click send or press Enter
- [ ] Verify message appears in chat
- [ ] Verify AI response is generated
- [ ] Check message styling (user vs AI bubbles)

#### Test 4.2: Conversation Persistence
- [ ] Send several messages in a conversation
- [ ] Refresh the page
- [ ] Verify conversation history persists
- [ ] Sign out and back in
- [ ] Check if conversations are maintained

#### Test 4.3: Multiple Conversations
- [ ] Start a new conversation
- [ ] Send messages
- [ ] Navigate to conversation history
- [ ] Verify multiple conversations are listed
- [ ] Click on different conversations
- [ ] Verify correct messages load

**Expected Database Tables:**
- `conversations` - Conversation sessions
- `messages` - Individual chat messages

---

### 5. Data Persistence & Relationships

#### Test 5.1: Database Relationships
Open Supabase Dashboard and verify:
- [ ] `profiles.user_id` links to `auth.users.id`
- [ ] `journal_entries.user_id` links to `auth.users.id`
- [ ] `symptoms.user_id` links to `auth.users.id`
- [ ] `conversations.user_id` links to `auth.users.id`
- [ ] `messages.conversation_id` links to `conversations.id`

#### Test 5.2: Row Level Security (RLS)
- [ ] Create entries as User A
- [ ] Try to access User A's data as User B (should fail)
- [ ] Verify each user only sees their own:
  - Journal entries
  - Symptoms
  - Conversations
  - Profile data

#### Test 5.3: Data Integrity
- [ ] Create journal entry
- [ ] Check `created_at` timestamp is set
- [ ] Update entry
- [ ] Check `updated_at` timestamp changed
- [ ] Verify dates are in correct format (YYYY-MM-DD)
- [ ] Verify mood ratings are constrained (1-4 only)

---

### 6. Error Handling

#### Test 6.1: Network Errors
- [ ] Stop the backend server
- [ ] Try to create a journal entry
- [ ] Verify graceful error message (not a crash)
- [ ] Restart backend
- [ ] Verify app recovers

#### Test 6.2: Validation Errors
- [ ] Try to submit empty journal entry (should show error)
- [ ] Try invalid mood rating (e.g., 0 or 5)
- [ ] Try to access non-existent entry ID
- [ ] Verify appropriate error messages display

#### Test 6.3: Authentication Errors
- [ ] Clear browser cookies/local storage
- [ ] Try to access protected pages
- [ ] Verify redirect to login
- [ ] Try invalid credentials
- [ ] Verify error message

---

### 7. Mobile Responsiveness

#### Test 7.1: Different Screen Sizes
Test on:
- [ ] iPhone SE (375px)
- [ ] iPhone 12/13 (390px)
- [ ] iPad (768px)
- [ ] Desktop (1920px)

Check:
- [ ] Text is readable at all sizes
- [ ] Buttons are tappable (min 44x44px)
- [ ] Forms don't overflow
- [ ] Navigation works on mobile
- [ ] Modal dialogs display correctly

#### Test 7.2: Touch Interactions
- [ ] Tap buttons (not double-tap required)
- [ ] Scroll through journal entries
- [ ] Use date pickers on mobile
- [ ] Test form inputs (keyboard doesn't hide content)

---

### 8. Performance Testing

#### Test 8.1: Large Data Sets
- [ ] Create 50+ journal entries
- [ ] Load "My Entries" page
- [ ] Verify load time is acceptable (< 2 seconds)
- [ ] Test pagination/infinite scroll
- [ ] Check stats calculation performance

#### Test 8.2: API Response Times
Monitor these endpoints:
- [ ] `/api/journal/entries` - should respond < 500ms
- [ ] `/api/journal/stats` - should respond < 1s
- [ ] `/api/symptoms/entries` - should respond < 500ms
- [ ] `/api/chat/send` - should respond < 3s (AI call)

---

## 🧪 Automated Test Script

Run the automated test script to verify API functionality:

```bash
# 1. Get your user ID from Supabase Dashboard
# Go to: Authentication > Users > Copy UUID

# 2. Update the test script
nano test-journal-system.js
# Replace 'YOUR_USER_ID_HERE' with your actual user ID

# 3. Run the test
node test-journal-system.js
```

Expected output:
```
✅ Entry created successfully!
✅ Found X entries
✅ Entry fetched successfully!
✅ Entry updated successfully!
✅ Search found X matching entries
✅ Stats fetched successfully!
✅ Entry deleted successfully!

🎉 All tests passed successfully!
```

---

## 🔍 Database Verification Queries

Run these in Supabase SQL Editor to verify data:

```sql
-- Check all tables have data
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'journal_entries', COUNT(*) FROM journal_entries
UNION ALL
SELECT 'symptoms', COUNT(*) FROM symptoms
UNION ALL
SELECT 'conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'messages', COUNT(*) FROM messages;

-- Verify journal entries with moods
SELECT
  user_id,
  entry_date,
  mood_rating,
  LENGTH(content) as content_length,
  created_at
FROM journal_entries
ORDER BY created_at DESC
LIMIT 10;

-- Check average mood per user
SELECT
  user_id,
  COUNT(*) as total_entries,
  AVG(mood_rating) as avg_mood,
  MIN(entry_date) as first_entry,
  MAX(entry_date) as latest_entry
FROM journal_entries
GROUP BY user_id;

-- Verify symptoms tracking
SELECT
  user_id,
  symptom_date,
  symptom_name,
  severity,
  created_at
FROM symptoms
ORDER BY symptom_date DESC
LIMIT 10;

-- Check RLS policies are active
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public';
```

---

## ✅ Final Verification Checklist

Before considering Phase 3 complete, verify:

### Core Functionality
- [ ] All CRUD operations work for journal entries
- [ ] All CRUD operations work for symptoms
- [ ] Mood tracking works correctly
- [ ] Stats calculate accurately
- [ ] Search returns correct results
- [ ] Onboarding flow completes successfully

### Data Integrity
- [ ] All entries save to database
- [ ] Timestamps are accurate
- [ ] Foreign keys are valid
- [ ] RLS policies protect user data
- [ ] No orphaned records

### User Experience
- [ ] Pages load quickly (< 2s)
- [ ] Error messages are helpful
- [ ] Success feedback is clear
- [ ] Forms are intuitive
- [ ] Navigation is smooth

### Mobile & Accessibility
- [ ] Works on mobile devices
- [ ] Touch targets are adequate
- [ ] Text is readable
- [ ] Keyboard navigation works

### Error Handling
- [ ] Graceful degradation on network errors
- [ ] Validation prevents bad data
- [ ] User is never stuck on error
- [ ] Helpful error messages

---

## 🐛 Common Issues & Solutions

### Issue: "Database not configured"
**Solution:** Check `.env` file has correct Supabase credentials

### Issue: "User not found"
**Solution:** Complete onboarding flow to create profile

### Issue: RLS policy denies access
**Solution:** Verify user_id matches authenticated user

### Issue: CORS errors
**Solution:** Check backend allows frontend origin in cors config

### Issue: Stats show 0 even with entries
**Solution:** Check date formats are YYYY-MM-DD, verify timezone handling

---

## 📊 Expected Results Summary

After completing all tests, you should see:

**Supabase Tables:**
- `profiles`: 1+ records (your test users)
- `journal_entries`: Multiple records with moods
- `symptoms`: Multiple symptom tracking records
- `conversations`: Chat conversations
- `messages`: Chat message history

**Frontend Pages Working:**
- `/` - Landing page
- `/chat` - Chat interface
- `/journal` - Journal system with 3 tabs
- `/track` - Symptom tracking (if implemented)
- `/onboarding` - Onboarding flow

**Backend Endpoints Responding:**
- All `/api/journal/*` endpoints
- All `/api/symptoms/*` endpoints
- All `/api/chat/*` endpoints
- `/api/health` - Health check

---

## 🎉 Success Criteria

Phase 3 is complete when:
1. ✅ All manual tests pass
2. ✅ Automated test script runs successfully
3. ✅ Database verification queries show expected data
4. ✅ No critical bugs found
5. ✅ Mobile experience is smooth
6. ✅ Error handling is robust

---

**Happy Testing! 🚀**

If you encounter any issues, check:
1. Browser console for errors
2. Backend logs for API errors
3. Supabase logs for database errors
4. Network tab for failed requests
