# Free Tier API Testing Guide

This guide shows you how to test all the new Free Tier API endpoints automatically.

---

## Quick Start (3 steps)

### Step 1: Get Your User ID

Run this query in **Supabase SQL Editor**:

```sql
SELECT id, email FROM auth.users LIMIT 5;
```

Copy one of the `id` values (it looks like: `12345678-1234-1234-1234-123456789abc`)

---

### Step 2: Start the Backend

Open a terminal and run:

```bash
npm run dev:backend
```

Wait for it to show:
```
✅ MenoAI Backend running on http://0.0.0.0:4000
```

**Keep this terminal open!**

---

### Step 3: Run the Test Script

In a **new terminal**, run:

```bash
node test-free-tier-api.js YOUR_USER_ID_HERE
```

**Example:**
```bash
node test-free-tier-api.js 12345678-1234-1234-1234-123456789abc
```

---

## What the Test Script Does

The script will automatically test **all 18 endpoints**:

### Profile Endpoints (4 tests)
- ✅ GET /api/profile/:userId
- ✅ POST /api/profile/:userId (create with onboarding data)
- ✅ PUT /api/profile/:userId (update)
- ✅ Verify profile updates

### Symptom Tracking Endpoints (6 tests)
- ✅ POST /api/symptoms/log (create for today)
- ✅ POST /api/symptoms/log (create for yesterday)
- ✅ GET /api/symptoms/history/:userId
- ✅ GET /api/symptoms/date/:userId/:date
- ✅ GET /api/symptoms/stats/:userId
- ✅ DELETE /api/symptoms/:logId

### Journal Endpoints (8 tests)
- ✅ POST /api/journal/entries (create for today)
- ✅ POST /api/journal/entries (create for yesterday)
- ✅ GET /api/journal/entries/:userId (list)
- ✅ GET /api/journal/entry/:entryId (single)
- ✅ PUT /api/journal/entry/:entryId (update)
- ✅ GET /api/journal/search/:userId (search)
- ✅ GET /api/journal/stats/:userId (statistics)
- ✅ DELETE /api/journal/entry/:entryId

---

## Expected Output

You should see colorful output like:

```
🧪 Free Tier API Endpoint Tests
================================
ℹ️  Testing API: http://localhost:4000
ℹ️  User ID: 12345678-1234-1234-1234-123456789abc

ℹ️  Checking if backend is running...
✅ Backend is running!

============================================================
Testing Profile Endpoints
============================================================
ℹ️  Test 1: GET /api/profile/:userId
✅ GET profile successful

ℹ️  Test 2: POST /api/profile/:userId (create/update with onboarding data)
✅ POST profile successful - onboarding data saved

...

============================================================
Test Summary
============================================================
✅ All tests completed!
```

---

## Troubleshooting

### Error: "Backend is not running!"

**Solution:** Start the backend first:
```bash
npm run dev:backend
```

### Error: "USER_ID is required"

**Solution:** You forgot to provide the user ID. Run:
```bash
node test-free-tier-api.js YOUR_USER_ID_HERE
```

### Error: "Database not configured"

**Solution:** Make sure your `.env` file has Supabase credentials:
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Error: "Failed to create journal entry"

**Solution:** Make sure you ran the migration script first! See `UPGRADE_GUIDE.md`

---

## After Testing

Once all tests pass (all ✅), you're ready to:

1. ✅ **Move to Phase 2** - Build the Onboarding Flow (frontend)
2. ✅ **Start implementing** the Free Tier features
3. ✅ **Deploy to production** when ready

---

## Cleanup Test Data (Optional)

The test script creates some test data. To clean it up, run this in Supabase:

```sql
-- Delete test symptom logs
DELETE FROM symptom_logs WHERE user_id = 'YOUR_USER_ID' AND notes LIKE '%Test%';

-- Delete test journal entries
DELETE FROM journal_entries WHERE user_id = 'YOUR_USER_ID' AND content LIKE '%test%';

-- Reset profile if needed
UPDATE user_profiles
SET menopause_stage = NULL, primary_concerns = NULL, onboarding_completed = FALSE
WHERE id = 'YOUR_USER_ID';
```

---

## Next Steps

After successful testing:

1. Review `GAP_ANALYSIS.md` for the implementation plan
2. Move to **Phase 2: Onboarding Flow**
3. Start building the frontend components

**Phase 1 is complete! 🎉**
