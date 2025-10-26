# Installing Meno.i - Progressive Web App

The Meno.i app is available as a Progressive Web App (PWA) that can be installed on your mobile device for a native app-like experience.

**App URL:** https://menoi.netlify.app

---

## iOS Installation (iPhone/iPad)

Follow these steps to install Meno.i on your iOS device:

1. **Open Safari** on your iPhone or iPad
2. Navigate to **https://menoi.netlify.app**
3. Tap the **Share button** (square with arrow pointing up) at the bottom of the screen
4. Scroll down and tap **"Add to Home Screen"**
5. Edit the name if desired (default: "Meno.i")
6. Tap **"Add"** in the top-right corner

### What You Get on iOS

Once installed, the Meno.i app will:
- Appear on your home screen with its app icon
- Run in standalone mode (no Safari browser UI)
- Provide a full-screen app experience
- Display a black status bar for a native app-like feel
- Include proper padding around the iPhone notch
- Work offline with cached content (future feature)

**iOS Requirements:** iOS 12 or later

---

## Android Installation

You can install Meno.i on Android using either of these methods:

### Method 1: Automatic Prompt (Recommended)

1. **Open Chrome** on your Android device
2. Navigate to **https://menoi.netlify.app**
3. Wait for the **"Install app"** banner to appear at the bottom of the screen
4. Tap **"Install"** or **"Add to Home Screen"**
5. Follow the prompts to confirm the installation

### Method 2: Manual Installation

1. **Open Chrome** on your Android device
2. Navigate to **https://menoi.netlify.app**
3. Tap the **three-dot menu** (⋮) in the top-right corner
4. Select **"Add to Home Screen"** or **"Install app"**
5. Confirm the installation

### What You Get on Android

Once installed, the Meno.i app will:
- Appear in your app drawer and home screen
- Run in standalone mode (no browser chrome)
- Display a splash screen on launch
- Provide a native app-like experience
- Support all PWA features including notifications (when implemented)

**Android Requirements:** Android 8 or later

---

## Features Available After Installation

Once installed on either platform, you'll have access to:

- **Voice Input:** Hold-to-speak functionality for hands-free messaging
- **Text-to-Speech:** Listen to AI responses
- **Dark Mode:** Automatic system-based or manual toggle
- **Accessibility:** Font size controls, high contrast mode, reduced motion
- **Privacy-Focused:** GDPR compliant, encrypted data, 30-day retention
- **Offline Support:** (Coming soon) View cached conversations when offline

---

## Alternative: Use in Browser

If you prefer not to install the app, you can use Meno.i directly in your browser:

1. Visit **https://menoi.netlify.app** in any modern browser
2. All features are available without installation
3. Works on Chrome, Safari, Edge, and other modern browsers

**Note:** Some features like standalone mode and splash screens are only available when installed as a PWA.

---

## Troubleshooting

### iOS Issues

**Problem:** "Add to Home Screen" option not showing
- **Solution:** Make sure you're using Safari (not Chrome or other browsers). The option only appears in Safari on iOS.

**Problem:** App doesn't open in standalone mode
- **Solution:** Delete the app icon and reinstall following the steps above.

### Android Issues

**Problem:** Install banner doesn't appear
- **Solution:** Use Method 2 (Manual Installation) via the Chrome menu.

**Problem:** App not appearing in app drawer
- **Solution:** Check your home screen first. If not there, try reinstalling.

### General Issues

**Problem:** Voice input not working
- **Solution:** Grant microphone permissions when prompted. Go to Settings > Safari/Chrome > Microphone and allow access for menoi.netlify.app.

**Problem:** Dark mode not working
- **Solution:** Check the Accessibility menu (settings icon) and ensure dark mode is enabled or set to "System".

---

## Uninstalling the App

### iOS
1. Press and hold the Meno.i app icon on your home screen
2. Tap "Remove App"
3. Select "Delete App"
4. Confirm deletion

### Android
1. Press and hold the Meno.i app icon
2. Tap "Uninstall" or drag to "Uninstall" at the top of the screen
3. Confirm uninstallation

---

## Privacy & Data

- **Data Storage:** All conversation data is stored securely in Supabase (encrypted at rest and in transit)
- **Retention:** Conversations are automatically deleted after 30 days
- **Your Control:** You can delete conversations at any time from the History page
- **GDPR Compliant:** Full data portability and right to erasure

For more details, see the [Privacy Policy](https://menoi.netlify.app/privacy).

---

## Support

If you encounter any issues during installation or use:

1. Check the [Technical Documentation](TECHNICAL_DOCUMENTATION.md) for detailed information
2. Review the [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) for infrastructure details
3. Report issues via the GitHub repository

---

## System Requirements

### Minimum Requirements
- **iOS:** 12.0 or later
- **Android:** 8.0 (Oreo) or later
- **Browser:** Chrome 80+, Safari 12+, Edge 80+

### Recommended
- **iOS:** 15.0 or later
- **Android:** 11.0 or later
- **Network:** Stable internet connection (Wi-Fi or 4G/5G)
- **Storage:** 50 MB free space

---

**Last Updated:** October 2025
**Version:** 1.0
