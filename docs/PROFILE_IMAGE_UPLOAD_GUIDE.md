# Profile Image Upload Setup Guide

This guide explains how to set up profile image uploads for MenoAI using Supabase Storage.

## Overview

Users can now upload custom profile pictures that will be displayed instead of their Google OAuth avatar. Images are stored in Supabase Storage with proper access controls.

---

## Step 1: Create Storage Bucket in Supabase

### Option A: Using the Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/bxtsqrkcqgsdydiriqks/storage/buckets

2. **Create New Bucket**
   - Click **"New bucket"**
   - Bucket name: `avatars`
   - **Public bucket**: Toggle **ON** (so images can be viewed publicly)
   - Click **"Create bucket"**

3. **Verify Bucket Created**
   - You should see `avatars` in the list of buckets
   - Status should show as "Public"

### Option B: Using SQL

1. **Go to SQL Editor**
   - Visit: https://supabase.com/dashboard/project/bxtsqrkcqgsdydiriqks/sql/new

2. **Run the SQL**
   - Copy the contents of `docs/SUPABASE_STORAGE_SETUP.sql`
   - Paste into the SQL editor
   - Click **"Run"**

---

## Step 2: Configure Storage Policies

The SQL script creates these policies automatically:

- **Public Read**: Anyone can view avatar images (needed for displaying them)
- **Authenticated Upload**: Users can upload images to their own folder
- **User Update**: Users can update their own avatars
- **User Delete**: Users can delete their own avatars

### Verify Policies

1. Go to: Storage → Policies
2. You should see 4 policies for the `avatars` bucket:
   - Avatar images are publicly accessible
   - Users can upload their own avatar
   - Users can update their own avatar
   - Users can delete their own avatar

---

## Step 3: Test Image Upload

1. **Open your app**
   - Visit: https://studious-orbit-9vvxjj6wqwphpprj-3000.app.github.dev

2. **Sign in with Google**
   - You should see your Google profile picture

3. **Open Profile Editor**
   - Click your profile picture in the top right
   - Click "Edit Profile"

4. **Upload Custom Image**
   - Click the "Change Photo" button
   - Select an image file (PNG, JPG, etc.)
   - Max size: 2MB
   - You should see a loading spinner
   - When complete, you'll see "Image uploaded! Click Save Changes to update your profile."

5. **Save Your Profile**
   - Click "Save Changes"
   - The page will refresh
   - You should now see your custom profile picture everywhere

6. **Verify in Database**
   - Go to: Supabase Dashboard → Storage → avatars
   - You should see a folder with your user ID
   - Inside, you should see your uploaded image

---

## How It Works

### Upload Flow

1. User selects an image file
2. Frontend validates:
   - File type (must be an image)
   - File size (max 2MB)
3. Image is uploaded to Supabase Storage at path: `avatars/{user_id}/{timestamp}.{ext}`
4. Old avatar is deleted (if it exists and was uploaded by user)
5. Public URL is generated
6. URL is saved to `user_profiles.avatar_url`
7. Page refreshes to show new avatar

### Display Priority

Custom avatars take priority over Google OAuth avatars:

```
Avatar Display Priority:
1. Custom uploaded avatar (from user_profiles.avatar_url)
2. Google OAuth avatar (from user.user_metadata.avatar_url)
3. Initials fallback (if no image available)
```

### File Organization

Files are organized by user ID:
```
avatars/
  ├── {user-id-1}/
  │   └── 1234567890.jpg
  ├── {user-id-2}/
  │   └── 1234567891.png
  └── ...
```

This ensures:
- Users can only access their own folder
- Easy to find and delete user data
- No filename conflicts between users

---

## Security Features

### File Validation

- **Type Check**: Only image files allowed (image/*)
- **Size Limit**: Maximum 2MB per image
- **User Isolation**: Users can only upload to their own folder

### Row Level Security (RLS)

Storage policies ensure:
- Anyone can **read** avatars (public display)
- Only authenticated users can **upload** to their own folder
- Only the owner can **update** or **delete** their avatar

### Storage Structure

- Files are stored at: `avatars/{user_id}/{filename}`
- The `{user_id}` ensures users can't access other users' files
- RLS policies validate user_id matches auth.uid()

---

## Troubleshooting

### Error: "Failed to upload image"

**Possible Causes:**
1. Storage bucket doesn't exist
2. Storage policies not configured
3. File is too large (>2MB)
4. File is not an image

**Solutions:**
1. Verify bucket exists: Storage → Buckets → avatars
2. Run the storage setup SQL
3. Compress the image
4. Use PNG, JPG, or other image formats

### Error: "The resource already exists"

**Cause:** File with same name already exists

**Solution:**
- The app uses timestamps to prevent this
- If it happens, try again (new timestamp will be generated)

### Avatar doesn't update after upload

**Cause:** Browser cache or page didn't refresh

**Solution:**
- The app automatically refreshes after save
- If it doesn't work, manually refresh (Ctrl+R or Cmd+R)
- Clear browser cache

### Can't see uploaded images

**Cause:** Bucket is not public or policies missing

**Solution:**
1. Go to Storage → avatars
2. Click the settings icon
3. Ensure "Public bucket" is **ON**
4. Run the storage setup SQL to add policies

---

## Storage Limits

### Supabase Free Tier

- **Storage**: 1GB total
- **Transfer**: 2GB per month
- **File Size**: No specific limit (we enforce 2MB)

### Estimations

- Average avatar: ~200KB
- 1GB storage = ~5,000 avatars
- More than enough for development and small production

### Cleanup

To prevent storage bloat:
- Old avatars are automatically deleted when user uploads new one
- Consider implementing a cleanup script for deleted users

---

## Production Considerations

### Image Optimization

Consider adding:
- Image resizing (e.g., max 512x512px)
- Format conversion (convert to WebP)
- Compression before upload

### CDN

For better performance:
- Supabase Storage uses a CDN by default
- Images are cached globally
- No additional setup needed

### Backup

- Supabase handles backups automatically
- Consider exporting user data periodically
- Document recovery process

---

## Testing Checklist

- [ ] Storage bucket created (`avatars`)
- [ ] Bucket is public
- [ ] Storage policies configured (4 policies)
- [ ] Can upload image via profile modal
- [ ] Image appears immediately after upload
- [ ] Image persists after page refresh
- [ ] Image appears in all locations (header, home page, dropdown)
- [ ] Old image is deleted when new one is uploaded
- [ ] Image size validation works (>2MB rejected)
- [ ] Image type validation works (non-images rejected)
- [ ] Can revert to Google avatar by uploading new image

---

## Files Modified

### Created
- `docs/SUPABASE_STORAGE_SETUP.sql` - Storage bucket and policies
- `docs/PROFILE_IMAGE_UPLOAD_GUIDE.md` - This guide

### Updated
- `packages/frontend/src/components/profile/ProfileModal.tsx` - Image upload UI
- `packages/frontend/src/components/profile/ProfileDropdown.tsx` - Load custom avatar
- `packages/frontend/src/app/page.tsx` - Load custom avatar on home page

---

## Next Steps

After profile images are working:

1. ✅ Test with multiple users
2. ✅ Test edge cases (large files, invalid formats)
3. ✅ Monitor storage usage
4. Consider: Image compression before upload
5. Consider: Image cropping/editing UI
6. Consider: Remove avatar option (revert to Google)

---

**Setup Complete!** 🎉

Users can now upload custom profile pictures that will be displayed throughout the app!
