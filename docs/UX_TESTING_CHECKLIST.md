# UX Testing Checklist - User Profiles & Authentication

Use this checklist to verify all user profile and authentication features are polished and stable.

---

## 🔐 Google OAuth Authentication

### Sign In Flow

- [ ] **Home Page - Sign In Button**
  - [ ] "Sign In" button is visible and clearly labeled
  - [ ] Button has proper hover state
  - [ ] Clicking opens the sign-in modal

- [ ] **Sign In Modal**
  - [ ] Modal appears smoothly (no flicker)
  - [ ] Modal is centered on screen
  - [ ] Close button (×) works properly
  - [ ] Can close modal by clicking outside
  - [ ] Google button is visible with Google logo
  - [ ] Google button has proper hover state
  - [ ] Email/password fields are also visible

- [ ] **Google Sign-In Process**
  - [ ] Clicking Google button redirects to Google login
  - [ ] Can successfully sign in with Google account
  - [ ] After signing in, redirected to `/chat` page
  - [ ] No console errors during the process
  - [ ] Loading states are smooth (no broken UI)

- [ ] **After Successful Sign-In**
  - [ ] Profile picture appears in chat header
  - [ ] Name displays correctly (not "undefined" or blank)
  - [ ] Email displays correctly
  - [ ] If you go back to home page, shows "Welcome back" message
  - [ ] Google avatar appears (if no custom avatar uploaded)

### Sign Out Flow

- [ ] **Sign Out Process**
  - [ ] Can sign out from profile dropdown menu
  - [ ] After sign out, redirected to home page
  - [ ] Sign out button changes to "Sign In" button
  - [ ] Profile data is cleared from UI
  - [ ] Can sign back in successfully

---

## 👤 User Profile Display

### Profile Avatar

- [ ] **Avatar Display Quality**
  - [ ] Avatar is circular (not stretched or pixelated)
  - [ ] Avatar has proper size in all locations
  - [ ] Avatar has subtle border/ring (looks polished)
  - [ ] If no avatar, initials show correctly
  - [ ] Initials are readable with good color contrast
  - [ ] Avatar loads quickly (no long delays)

- [ ] **Avatar Locations**
  - [ ] Shows in chat header (top right)
  - [ ] Shows in profile dropdown menu (larger size)
  - [ ] Shows in profile editor modal
  - [ ] Shows on home page (when signed in)
  - [ ] All locations show the SAME avatar consistently

### Profile Dropdown Menu

- [ ] **Dropdown Interaction**
  - [ ] Clicking avatar opens dropdown
  - [ ] Dropdown appears smoothly (no jump or flicker)
  - [ ] Dropdown is properly positioned (doesn't go off screen)
  - [ ] Clicking outside closes dropdown
  - [ ] Can open and close multiple times smoothly

- [ ] **Dropdown Content**
  - [ ] Shows larger avatar at top
  - [ ] Shows full name (or email if no name)
  - [ ] Shows email address (if name is shown)
  - [ ] "Edit Profile" option is visible
  - [ ] "Chat History" option is visible
  - [ ] "Sign Out" option is visible in red
  - [ ] All menu items have proper hover states

- [ ] **Dropdown Actions**
  - [ ] "Edit Profile" opens profile modal
  - [ ] "Chat History" navigates to /history
  - [ ] "Sign Out" signs user out
  - [ ] Dropdown closes after selecting an option

---

## ✏️ Profile Editing

### Profile Modal

- [ ] **Modal Appearance**
  - [ ] Modal opens smoothly from dropdown
  - [ ] Modal is centered and properly sized
  - [ ] Modal doesn't look broken on different screen sizes
  - [ ] Close button (×) works
  - [ ] Can't interact with page behind modal (proper overlay)
  - [ ] Clicking outside modal closes it

- [ ] **Profile Data Loading**
  - [ ] Existing profile data loads correctly
  - [ ] Full name pre-fills if it exists
  - [ ] Display name pre-fills if it exists
  - [ ] Bio pre-fills if it exists
  - [ ] Current avatar shows in preview
  - [ ] Loading spinner shows briefly (if loading)

### Profile Form

- [ ] **Form Fields**
  - [ ] All fields are clearly labeled
  - [ ] Placeholder text is helpful
  - [ ] Can type in all fields smoothly
  - [ ] Character counter shows for bio (X/500)
  - [ ] Character limit enforced for bio (can't type past 500)
  - [ ] Form is keyboard-accessible (can tab through fields)

- [ ] **Form Validation**
  - [ ] Can save with empty fields (they're optional)
  - [ ] Display name defaults to full name if empty
  - [ ] No weird errors for normal input

### Image Upload

- [ ] **Upload Button**
  - [ ] "Change Photo" button is visible and clear
  - [ ] Button has camera icon
  - [ ] Button has proper hover state
  - [ ] Clicking opens file picker

- [ ] **File Selection**
  - [ ] Can select PNG files
  - [ ] Can select JPG files
  - [ ] Can select other image formats (GIF, WebP, etc.)
  - [ ] File picker shows only images (image/* filter works)

- [ ] **Upload Process**
  - [ ] Loading spinner appears over avatar while uploading
  - [ ] Upload completes in reasonable time (<5 seconds for 1MB)
  - [ ] Success message appears: "Image uploaded! Click Save Changes..."
  - [ ] New image preview appears immediately
  - [ ] No console errors during upload

- [ ] **Upload Validation**
  - [ ] Files over 2MB are rejected with clear error
  - [ ] Non-image files are rejected with clear error
  - [ ] Error messages are clear and helpful
  - [ ] Can retry upload after error

- [ ] **Save Process**
  - [ ] "Save Changes" button is visible and clear
  - [ ] Button disabled while saving (prevents double-click)
  - [ ] Button shows "Saving..." text while saving
  - [ ] Success message appears: "Profile updated successfully!"
  - [ ] Modal closes after save (with 1.5s delay)
  - [ ] Page refreshes to show new avatar everywhere

---

## 🎨 Visual Polish

### Responsiveness

- [ ] **Desktop (1920x1080)**
  - [ ] All elements properly sized
  - [ ] Text is readable
  - [ ] No overflow or cutoff content
  - [ ] Avatars look good

- [ ] **Laptop (1366x768)**
  - [ ] Layout adapts properly
  - [ ] Modal fits on screen
  - [ ] Dropdown positioned correctly

- [ ] **Tablet (768x1024)**
  - [ ] Mobile-friendly layout
  - [ ] Buttons are tappable
  - [ ] Modal is scrollable if needed

- [ ] **Mobile (375x667)**
  - [ ] Works on small screens
  - [ ] Touch-friendly targets
  - [ ] No horizontal scroll

### Color & Contrast

- [ ] **Text Readability**
  - [ ] All text is readable (good contrast)
  - [ ] Labels are clear and visible
  - [ ] Error messages are clearly red
  - [ ] Success messages are clearly green

- [ ] **Visual Hierarchy**
  - [ ] Primary actions stand out (e.g., "Save Changes")
  - [ ] Secondary actions are subtle (e.g., "Cancel")
  - [ ] Destructive actions are red (e.g., "Sign Out")

### Animations & Transitions

- [ ] **Smooth Interactions**
  - [ ] Modal opens/closes smoothly
  - [ ] Dropdown opens/closes smoothly
  - [ ] Hover states transition smoothly
  - [ ] No jarring jumps or flickers
  - [ ] Loading spinners are smooth
  - [ ] Page transitions are smooth

---

## 🐛 Edge Cases & Error Handling

### Authentication Edge Cases

- [ ] **Multiple Sessions**
  - [ ] Can sign out from one tab
  - [ ] Other tabs update correctly
  - [ ] Can sign in after signing out

- [ ] **Network Issues**
  - [ ] Handles slow internet gracefully
  - [ ] Shows loading states appropriately
  - [ ] Error messages if auth fails

### Profile Edge Cases

- [ ] **Name Variations**
  - [ ] Works with single name (e.g., "Madonna")
  - [ ] Works with long names (30+ characters)
  - [ ] Works with special characters (é, ñ, 中文)
  - [ ] Works with emojis (🙂)

- [ ] **Avatar Edge Cases**
  - [ ] User with no Google avatar shows initials
  - [ ] User with Google avatar shows Google picture
  - [ ] User with custom avatar shows custom picture
  - [ ] Custom avatar overrides Google avatar
  - [ ] Broken image URLs show fallback (initials)

- [ ] **Upload Edge Cases**
  - [ ] Upload very small image (1KB)
  - [ ] Upload image close to 2MB limit
  - [ ] Upload exactly 2MB image (should work)
  - [ ] Upload 2.1MB image (should fail with clear error)
  - [ ] Try uploading PDF (should fail)
  - [ ] Cancel file picker (should not error)
  - [ ] Upload same image twice (should work)

### Form Edge Cases

- [ ] **Empty States**
  - [ ] New user with no profile data
  - [ ] User who deleted all profile data
  - [ ] Saving empty form doesn't break

- [ ] **Long Text**
  - [ ] Bio with 500 characters displays correctly
  - [ ] Bio wraps properly in modal
  - [ ] Very long name doesn't break layout

---

## ⚡ Performance

### Load Times

- [ ] **Initial Page Load**
  - [ ] Home page loads in <2 seconds
  - [ ] Chat page loads in <3 seconds
  - [ ] No long white screen

- [ ] **Profile Actions**
  - [ ] Opening dropdown is instant (<100ms)
  - [ ] Opening profile modal is instant (<200ms)
  - [ ] Saving profile completes in <2 seconds
  - [ ] Uploading 500KB image completes in <3 seconds

### Optimization

- [ ] **No Memory Leaks**
  - [ ] Open/close dropdown 20 times (should stay fast)
  - [ ] Open/close modal 20 times (should stay fast)
  - [ ] Upload 5 images in a row (should stay fast)

- [ ] **Console Errors**
  - [ ] No errors in console during normal use
  - [ ] No warnings about missing keys or props
  - [ ] No 404 errors for images or resources

---

## 🌐 Browser Compatibility

Test on at least 2 different browsers:

- [ ] **Chrome/Edge** (Chromium)
  - [ ] All features work
  - [ ] UI looks correct

- [ ] **Firefox**
  - [ ] All features work
  - [ ] UI looks correct

- [ ] **Safari** (if available)
  - [ ] All features work
  - [ ] UI looks correct

---

## 🧪 Regression Testing

After any code changes, verify:

- [ ] **Core Flow Still Works**
  - [ ] Can sign in with Google
  - [ ] Profile displays correctly
  - [ ] Can edit profile
  - [ ] Can upload image
  - [ ] Can save changes
  - [ ] Can sign out

---

## 📋 Final Polish Checklist

- [ ] **No Placeholder Text**
  - [ ] No "TODO" or "placeholder" text visible
  - [ ] All labels are meaningful
  - [ ] All buttons have clear text

- [ ] **No Debug Code**
  - [ ] No console.log statements visible to user
  - [ ] No debug alerts or popups

- [ ] **Consistent Styling**
  - [ ] All buttons have same style/size
  - [ ] All modals have same style
  - [ ] Colors are consistent
  - [ ] Fonts are consistent

- [ ] **Professional Feel**
  - [ ] Everything feels intentional
  - [ ] No rough edges or bugs
  - [ ] Smooth, polished interactions
  - [ ] User feels confident using it

---

## 🎯 How to Use This Checklist

1. **Go through each section systematically**
2. **Check off items as you test them**
3. **Note any issues you find**
4. **Fix issues before moving to next section**
5. **Retest after fixes**

## 🚨 Red Flags (Fix Immediately)

If you encounter these, stop and fix them:

- Console errors during normal use
- Data not saving to database
- Images not uploading
- UI completely broken on mobile
- Can't sign in or sign out
- Modal can't be closed
- Page crashes or freezes

---

## ✅ When You're Done

If you've checked off everything:

- ✅ UX is polished and stable
- ✅ Ready to move to next features
- ✅ Confident to show to users

---

**Happy Testing!** 🚀
