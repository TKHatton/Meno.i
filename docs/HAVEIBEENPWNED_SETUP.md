# Enable HaveIBeenPwned in New Supabase UI

The Supabase UI has changed! Here's how to find and enable the HaveIBeenPwned password check in the latest version.

---

## Finding the Setting (Multiple Possible Locations)

### Option 1: Project Settings → Authentication

1. Click the **gear icon** (⚙️) in the bottom-left sidebar
2. Or click **"Project Settings"** if visible in sidebar
3. Click **"Authentication"** in the settings menu
4. Look for a section called:
   - "Security and Protection"
   - "Password Protection"
   - "Password Policies"
5. Find the toggle for:
   - "Breach password protection"
   - "Password breach detection (HaveIBeenPwned)"
   - "Check passwords against HaveIBeenPwned"
6. **Toggle it ON**
7. Click **"Save"** or **"Update"**

### Option 2: Authentication → Policies/Configuration

1. Click **"Authentication"** in the left sidebar
2. Look for tabs at the top:
   - "Users"
   - "Policies"
   - "Configuration"
   - "Email Templates"
3. Click **"Policies"** or **"Configuration"**
4. Scroll down to find password-related settings
5. Look for **"Password breach detection"**
6. **Toggle it ON**
7. Click **"Save"**

### Option 3: Database → Extensions

1. Click **"Database"** in the left sidebar
2. Click **"Extensions"** tab
3. Look for `pgsodium` or security-related extensions
4. Check if there's a password breach detection setting
5. Enable if found

---

## Can't Find It? Alternative Methods

### Method A: Check Supabase Version

The feature might not be available in older Supabase versions. Check:
- Dashboard footer for version number
- Look for a "What's New" or "Updates" section
- Consider upgrading your Supabase project if on an old version

### Method B: Use SQL to Check Current Setting

Run this in SQL Editor to see if it's already enabled:

```sql
-- Check current auth configuration
SELECT * FROM pg_settings WHERE name LIKE '%password%';
```

### Method C: Contact Supabase Support

If you can't find the setting:
1. Go to Supabase Dashboard
2. Look for "Support" or "Help" in the top-right
3. Ask: "Where do I enable HaveIBeenPwned password breach detection?"
4. They'll point you to the right location in your UI version

---

## What Does It Look Like?

The setting typically appears as:

**Toggle Switch:**
```
[x] Enable password breach detection (HaveIBeenPwned)
    Prevent users from using passwords exposed in data breaches
```

**Or as a checkbox:**
```
☑ Check passwords against HaveIBeenPwned database
  Improves security by rejecting compromised passwords
```

---

## After Enabling

**Test it works:**
1. Try creating a test account
2. Use a common breached password like: `password123`
3. You should get an error: "Password has been found in a data breach"
4. If you see this error, it's working! ✅

**If you don't see the error:**
- The setting might not be in effect yet (wait 5 minutes)
- Check if the toggle is actually saved (refresh the page)
- Try a different breached password like: `qwerty123456`

---

## Still Can't Find It?

**Take these steps:**

1. **Screenshot your UI**
   - Take a screenshot of your Authentication menu
   - Take a screenshot of your Project Settings
   - Share with me or Supabase support

2. **Check Documentation**
   - Go to https://supabase.com/docs
   - Search for "password breach detection" or "HaveIBeenPwned"
   - Follow the latest instructions

3. **It might be enabled by default**
   - Run the test above (try password `password123`)
   - If it's rejected, it's already enabled!
   - The warning might be outdated

---

## Why This Warning Matters

**Low Priority if:**
- Your app is in early development
- You don't have many users yet
- You're focused on other features

**High Priority if:**
- You're launching to production
- You have real users with real data
- You're concerned about security compliance

**Bottom line:** It's a nice-to-have security feature, not a critical blocker. Focus on the 6 SQL warnings first (which are more important).

---

## Summary

1. ✅ **First priority**: Run the SQL migration to fix the 6 function warnings
2. ⏳ **Second priority**: Find and enable HaveIBeenPwned when you have time
3. ℹ️ If you can't find it, it's okay - focus on the SQL fixes

The SQL fixes are more critical for security!
