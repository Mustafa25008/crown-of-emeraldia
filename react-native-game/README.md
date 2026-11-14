# Crown of Emeraldia — Expo / React Native Mobile Edition (Expo SDK 58 + Google AdMob)

A complete, standalone **React Native (Expo SDK 58 / `58.0.25`, React `19.3.0`, React Native `0.88.1`)** mobile edition of **Crown of Emeraldia** featuring all 10 Worlds (50 levels), 16-bit pixel-art graphics, synthesized Web Audio chiptune soundtrack, 60Hz fixed-timestep physics, dynamic Portrait/Landscape orientation switching, native Android hardware/gesture Back Button navigation, `AsyncStorage` save persistence, **Google AdMob Banner & Rewarded Ads (`react-native-google-mobile-ads@17.4.0`)**, and Google Play Store icon & splash assets.

---

## 1. Directory Structure

```text
react-native-game/
├── App.tsx                           # Main Expo React Native host (60FPS WebView, AdMob Banner & Rewarded Ads, BackHandler, Orientation, AsyncStorage)
├── app.json                          # Base static Expo & AdMob Gradle configuration (App Icon, Adaptive Icon, Splash Screen, Orientation, AdMob IDs)
├── app.config.js                     # Dynamic Expo config reading EXPO_PUBLIC_ADMOB_* env vars into the react-native-google-mobile-ads plugin
├── .env                              # Local environment variables (configured with official Google AdMob test IDs)
├── .env.example                      # Template environment variables with official Google AdMob test IDs
├── eas.json                          # EAS Build profiles (development APK, preview APK, production Play Store AAB + AdMob env vars)
├── package.json                      # Pinned Expo SDK 58 (58.0.25) dependencies, expo-dev-client (58.0.20), and react-native-google-mobile-ads (17.4.0)
├── babel.config.js                   # Babel preset configuration for Expo
├── metro.config.js                   # Metro bundler configuration
├── tsconfig.json                     # TypeScript (6.0.3) configuration
├── assets/
│   ├── icon.png                      # High-resolution 1:1 App Icon (1024×1024 valid PNG)
│   ├── adaptive-icon.png             # Android Adaptive Icon Foreground (1024×1024 valid PNG)
│   ├── playstore-icon-512.png        # Google Play Console High-Res Icon (512×512 valid PNG)
│   ├── splash-icon.png               # Vertical 9:16 Splash Screen Artwork (1080×1920 valid PNG)
│   ├── favicon.png                   # Web Favicon
│   └── game-bundle.html              # Pre-compiled standalone offline HTML5 Canvas game bundle
├── scripts/
│   └── build-inline-bundle.mjs       # Compiles and inlines the latest web build into src/bundle/inlineGameHtml.ts
└── src/
    ├── ads/
    │   ├── admobConfig.ts            # Reads EXPO_PUBLIC_ADMOB_* environment variables with Google test ID fallbacks
    │   ├── AdBannerSlot.tsx          # Native Google AdMob Anchored Adaptive Banner for mobile menu screens (hidden in gameplay)
    │   ├── AdBannerSlot.web.tsx      # Web no-op fallback for AdBannerSlot
    │   ├── rewardedAdManager.ts      # Native Google AdMob Rewarded Ad manager for "Watch Ad & Revive"
    │   └── rewardedAdManager.web.ts  # Web no-op fallback for Rewarded Ad manager
    ├── bridge/
    │   └── nativeBridge.ts           # Bi-directional React Native <-> Game Engine bridge (Back button, Orientation, Save sync, Rewarded Ads)
    ├── bundle/
    │   └── inlineGameHtml.ts         # Auto-generated offline HTML5 Canvas bundle string for zero-latency startup
    └── game/                         # Complete cloned game engine, renderer, audio, storage, and Worlds 1–10 (50 levels)
```

---

## 2. Environment Configuration (`.env` & `.env.example`)

This project isolates its mobile environment variables inside `react-native-game/.env` (separate from the root web app). By default, both `.env` and `.env.example` are pre-configured with **official Google AdMob Test IDs**:

```env
# Android Google AdMob Test IDs
EXPO_PUBLIC_ADMOB_ANDROID_APP_ID=ca-app-pub-3940256099942544~3375010800
EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID=ca-app-pub-3940256099942544/6300978111
EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_ID=ca-app-pub-3940256099942544/5224354917

# iOS Google AdMob Test IDs
EXPO_PUBLIC_ADMOB_IOS_APP_ID=ca-app-pub-3940256099942544~1458002511
EXPO_PUBLIC_ADMOB_IOS_BANNER_ID=ca-app-pub-3940256099942544/2934735716
EXPO_PUBLIC_ADMOB_IOS_REWARDED_ID=ca-app-pub-3940256099942544/1712485313
```

- `app.config.js` automatically reads `EXPO_PUBLIC_ADMOB_ANDROID_APP_ID` and `EXPO_PUBLIC_ADMOB_IOS_APP_ID` and injects them into the `react-native-google-mobile-ads` native config plugin during prebuild/EAS build.
- `src/ads/admobConfig.ts` reads the Banner and Rewarded Ad Unit IDs at runtime.
- When preparing for production release on Google Play or the App Store, replace these test IDs in `react-native-game/.env` with your live AdMob App IDs and Ad Unit IDs.

---

## 3. How to Run the Project (Important: Custom Dev Client vs. Expo Go)

> **Why Standard Expo Go Cannot Run This App Directly:**
> Because this project integrates native Google Mobile Ads (`react-native-google-mobile-ads`), which includes custom native Android/iOS SDK binaries not bundled inside the standard **Expo Go** store app, **standard Expo Go cannot execute the native AdMob module directly**.
> To run and test the project on an Android device or emulator with real test ads, you must build and install a **Custom Expo Development Client (`expo-dev-client`)** using EAS Build (or local Android Studio prebuild).

### Step 1: Install Dependencies
```bash
cd react-native-game
npm install --legacy-peer-deps
```

### Step 2: Log in to EAS (Expo Application Services)
```bash
npx eas login
```
*(Enter your Expo account credentials. If you do not have an account, create a free one at [expo.dev](https://expo.dev)).*

### Step 3: Build the Development APK via EAS Cloud Build
Run the following command inside `react-native-game/` to build a custom Android Development Client APK in the cloud (configured via the `development` profile in `eas.json` with `"developmentClient": true` and `"distribution": "internal"`):

```bash
npx eas build --profile development --platform android
```

- When prompted to create or link an EAS project, confirm with **`Y`** and allow EAS to generate a temporary Android keystore.
- Once the cloud build finishes, EAS will provide a **download URL and QR code** for the `.apk` file.
- Download and install that development `.apk` onto your Android phone or drag-and-drop it onto your Android Emulator.

### Step 4: Start the Expo Development Server (`--dev-client`) & Connect
Once the custom Development Client APK is installed on your device, start the Metro server in **Dev Client mode**:

```bash
npx expo start --dev-client
```

- Open the installed **Crown of Emeraldia** development app on your Android device, or scan the QR code shown in the terminal, to connect to the bundler with full native Google AdMob support.

*(Optional Local Build Alternative: If you have the Android SDK / Xcode installed locally on your machine, you can also compile and launch the development build directly without EAS Cloud via `npx expo run:android` or `npx expo run:ios`.)*

---

## 4. Google AdMob Integration Details

### A. Bottom Menu Banner Ad (`src/ads/AdBannerSlot.tsx`)
- Renders an `ANCHORED_ADAPTIVE_BANNER` using `EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID` / `EXPO_PUBLIC_ADMOB_IOS_BANNER_ID` in the dedicated bottom slot across all mobile menu screens (`TITLE_MENU`, `WORLD_SELECT`, `LEVEL_SELECT`, `SETTINGS_HUB`, `SETTINGS`, `CONTROLS`).
- **Automatically hidden during active gameplay** (`PLAYING`, `PAUSED`, `LEVEL_COMPLETE`, `WORLD_VICTORY`, `GAME_OVER`, `TIME_OUT`) so it never obstructs the landscape gameplay canvas or side-margin touch controls.
- Uses `AdBannerSlot.web.tsx` as a clean no-op when running on Web.

### B. "Watch Ad to Revive" Rewarded Ad (`src/ads/rewardedAdManager.ts`)
- Preloads a Google AdMob `RewardedAd` on startup using `EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_ID` / `EXPO_PUBLIC_ADMOB_IOS_REWARDED_ID`.
- When the player runs out of lives (`GAME_OVER`) or time (`TIME_OUT`) and taps **"▶ Watch Ad & Revive"**, the game engine sends `{ type: 'SHOW_REWARDED_AD' }` over the React Native bridge.
- `App.tsx` displays the native fullscreen Rewarded Video Ad (`showRewardedReviveAd()`).
- Upon earning the reward (`RewardedAdEventType.EARNED_REWARD`) and closing the ad, `App.tsx` sends `REWARDED_AD_RESULT` (`rewarded: true`) back to the engine, immediately refilling **3 lives**, resetting the stage countdown timer, and resuming the level.

---

## 5. Syncing & Rebuilding the Standalone Game Bundle

Whenever you modify the core game or UI in the root project and want to update the offline bundle inside `react-native-game/`:

```bash
# 1. From the repository root, build the web assets:
npm run build

# 2. From inside react-native-game/, bundle into inlineGameHtml.ts & game-bundle.html:
cd react-native-game
npm run bundle:game
```

Verify TypeScript compilation inside `react-native-game/` at any time with:
```bash
cd react-native-game
npx tsc --noEmit
```

---

## 6. Native Mobile Features & Performance Architecture

- **Zero-Lag 60+ FPS Hardware-Accelerated Rendering**: `WebView` runs with `androidLayerType="hardware"`, `overScrollMode="never"`, `bounces={false}`, and `scrollEnabled={false}`, backed by the 60Hz fixed-timestep physics accumulator (`FIXED_DT = 1 / 60`) and offscreen `32×32` tile sprite cache.
- **Dynamic Auto-Orientation (`expo-screen-orientation`)**: Locks to `PORTRAIT_UP` on menus and switches to `LANDSCAPE` with hidden system bars during active gameplay.
- **Native Android Hardware & Gesture Back Button (`BackHandler`)**:
  - `PLAYING` $\rightarrow$ Pauses gameplay (`PAUSED`)
  - `PAUSED` $\rightarrow$ Resumes gameplay (`PLAYING`)
  - Stage Outcome Modals $\rightarrow$ Returns to `LEVEL_SELECT` (Portrait)
  - `SETTINGS` / `CONTROLS` $\rightarrow$ Returns to `SETTINGS_HUB`
  - `LEVEL_SELECT` $\rightarrow$ Returns to `WORLD_SELECT`
  - `WORLD_SELECT` / `SETTINGS_HUB` $\rightarrow$ Returns to `TITLE_MENU` (Home)
  - `TITLE_MENU` $\rightarrow$ Prompts `"Press Back again to exit Crown of Emeraldia"` toast before exiting.
- **Native `AsyncStorage` Save Persistence**: Automatically syncs and hydrates `crown_of_emeraldia_save_v2` via `@react-native-async-storage/async-storage`.

---

## 7. Building Production APK & Play Store AAB

### Build an Internal Testing Preview APK
```bash
cd react-native-game
npm run build:android-apk
```

### Build a Production Google Play Store App Bundle (`.aab`)
```bash
cd react-native-game
npm run build:android-aab
```
