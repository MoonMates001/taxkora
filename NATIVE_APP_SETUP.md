# TAXKORA Native Android App Setup Guide

This guide will help you build a native Android app for TAXKORA using Capacitor.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18 or later) - [Download](https://nodejs.org/)
2. **Android Studio** - [Download](https://developer.android.com/studio)
3. **Java JDK 17** - Usually bundled with Android Studio
4. **Git** - [Download](https://git-scm.com/)

## Step-by-Step Instructions

### 1. Export and Clone the Project

1. In Lovable, click the **"Export to GitHub"** button in project settings
2. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   cd YOUR_REPO_NAME
   ```

### 2. Install Dependencies

```bash
npm install
```

### 3. Add Android Platform

```bash
npx cap add android
```

### 4. Build the Web App

```bash
npm run build
```

### 5. Sync with Android

```bash
npx cap sync android
```

### 6. Open in Android Studio

```bash
npx cap open android
```

Or navigate to the `android` folder and open it in Android Studio manually.

### 7. Configure Android Studio

1. Wait for Gradle sync to complete
2. Go to **File → Project Structure → SDK Location**
3. Ensure Android SDK is properly configured
4. Set minimum SDK to API 22 (Android 5.1) or higher

### 8. Run on Device/Emulator

**Option A: Run on Emulator**
1. In Android Studio, go to **Tools → Device Manager**
2. Create a new Virtual Device (recommend Pixel 6 with API 33)
3. Click the green "Run" button

**Option B: Run on Physical Device**
1. Enable Developer Options on your Android phone
2. Enable USB Debugging
3. Connect via USB cable
4. Select your device and click Run

### 9. Build Release APK

For a release build:

```bash
# Generate release keystore (first time only)
keytool -genkey -v -keystore taxkora-release.keystore -alias taxkora -keyalg RSA -keysize 2048 -validity 10000

# Build release APK
cd android
./gradlew assembleRelease
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

## Hot Reload Development

The `capacitor.config.ts` is configured for live reload from Lovable's preview server. This means:

- You can make changes in Lovable
- The app will automatically reflect those changes
- No need to rebuild for development testing

### For Production Build

To build a standalone app that doesn't require internet:

1. Edit `capacitor.config.ts` and remove/comment the `server` block:
   ```typescript
   // server: {
   //   url: '...',
   //   cleartext: true
   // },
   ```

2. Rebuild:
   ```bash
   npm run build
   npx cap sync android
   ```

## App Icons & Splash Screen

### Updating App Icon

1. Replace icons in `android/app/src/main/res/mipmap-*` folders
2. Use [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/) to generate all sizes

### Updating Splash Screen

The splash screen is configured in `capacitor.config.ts` with TAXKORA's teal brand color (#0D9488).

## Troubleshooting

### Build Errors
- Run `npx cap sync android` after any package changes
- Ensure Android SDK Build Tools are installed

### White Screen on Launch
- Check that the server URL is accessible
- For production, ensure web assets are properly built

### Slow Performance
- Enable Release mode for testing
- Consider code splitting for faster load times

## Publishing to Play Store

1. Create a [Google Play Developer Account](https://play.google.com/console/)
2. Generate a signed APK or App Bundle
3. Create app listing with screenshots
4. Submit for review

## Support

For issues with:
- **Lovable Platform**: Contact Lovable support
- **Capacitor**: [Capacitor Documentation](https://capacitorjs.com/docs)
- **Android Studio**: [Android Developers](https://developer.android.com/)

---

**TAXKORA** - Nigeria's #1 Tax Calculator App
