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

## Android 15 Edge-to-Edge Compliance (SDK 35)

Starting with Android 15, apps targeting SDK 35 display edge-to-edge by default. The Capacitor config already includes `edgeToEdgeEnforcement: true` for forward compatibility.

### Required Steps

1. **Handle system bar insets** in your CSS:
   ```css
   /* Add safe area padding for edge-to-edge displays */
   body {
     padding-top: env(safe-area-inset-top);
     padding-bottom: env(safe-area-inset-bottom);
     padding-left: env(safe-area-inset-left);
     padding-right: env(safe-area-inset-right);
   }
   ```

2. **In Android Studio**, update `styles.xml` to use `enableEdgeToEdge()`:
   ```xml
   <!-- android/app/src/main/res/values/styles.xml -->
   <style name="AppTheme" parent="Theme.AppCompat.Light.NoActionBar">
     <item name="android:windowOptOutEdgeToEdgeEnforcement">false</item>
   </style>
   ```

3. **Migrate deprecated APIs**: If using `WindowInsetsController` or `setSystemBarsBehavior()`, replace with the `WindowInsetsCompat` API from AndroidX.

4. **Test thoroughly** on Android 15 emulator (API 35) to verify content doesn't overlap with status bar, navigation bar, or camera cutouts.

### Quick Verification

```bash
# Run on Android 15 emulator
npx cap run android --target=emulator-5554
```

Check that:
- Content doesn't hide behind the status bar
- Bottom navigation doesn't overlap with gesture bar
- Landscape mode handles cutouts correctly

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

### Edge-to-Edge Issues (Android 15)
- Ensure `env(safe-area-inset-*)` CSS is applied
- Check that no fixed-position elements overlap system bars
- Test on both gesture navigation and 3-button navigation

## Publishing to Play Store

1. Create a [Google Play Developer Account](https://play.google.com/console/)
2. Generate a signed APK or App Bundle
3. Create app listing with screenshots
4. Submit for review
5. **Important**: Target SDK 35 or higher for new submissions

## Support

For issues with:
- **Lovable Platform**: Contact Lovable support
- **Capacitor**: [Capacitor Documentation](https://capacitorjs.com/docs)
- **Android Studio**: [Android Developers](https://developer.android.com/)

---

**TAXKORA** - Global Tax Compliance Platform for 50+ Countries
