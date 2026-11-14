# Crown of Emeraldia — Expo / React Native Mobile Edition (Expo SDK 58)

A complete, standalone **React Native (Expo SDK 58 / `~58.0.25`, React `19.3.0`, React Native `0.88.1`)** mobile edition of **Crown of Emeraldia** featuring all 10 Worlds (50 levels), 16-bit pixel-art graphics, synthesized Web Audio chiptune soundtrack, 60Hz fixed-timestep physics, dynamic Portrait/Landscape orientation switching, native Android hardware/gesture Back Button navigation, `AsyncStorage` save persistence, and Google Play Store icon & splash assets.

---

## 1. Directory Structure

```text
react-native-game/
├── App.tsx                           # Main Expo React Native host (Hardware-accelerated 60FPS WebView, BackHandler, Orientation, AsyncStorage)
├── app.json                          # Expo configuration (App Icon, Adaptive Icon, Splash Screen, Orientation & Permissions)
├── eas.json                          # EAS Build profiles (development, preview APK, production Play Store AAB)
├── package.json                      # Expo SDK 58 (~58.0.25) dependencies and build scripts
├── babel.config.js                   # Babel preset configuration for Expo
├── metro.config.js                   # Metro bundler configuration
├── tsconfig.json                     # TypeScript (~6.0.3) configuration
├── assets/
│   ├── icon.png                      # High-resolution 1:1 App Icon (1024×1024)
│   ├── adaptive-icon.png             # Android Adaptive Icon Foreground (1024×1024)
│   ├── playstore-icon-512.png        # Google Play Console High-Res Icon (512×512)
│   ├── splash-icon.png               # Vertical 9:16 Splash Screen Artwork
│   ├── favicon.png                   # Web Favicon
│   └── game-bundle.html              # Pre-compiled standalone offline HTML5 Canvas game bundle
├── scripts/
│   └── build-inline-bundle.mjs       # Compiles and inlines the latest web build into src/bundle/inlineGameHtml.ts
└── src/
    ├── bridge/
    │   └── nativeBridge.ts           # Bi-directional React Native <-> Game Engine bridge (Back button, Orientation, Save sync)
    ├── bundle/
    │   └── inlineGameHtml.ts         # Auto-generated offline HTML5 Canvas bundle string for zero-latency startup
    └── game/                         # Complete cloned game engine, renderer, audio, storage, and Worlds 1–10 (50 levels)
```

---

## 2. Quick Start (Running in Expo SDK 58)

### Prerequisites
- **Node.js** `>= 18`
- **Expo CLI** (included via `npx expo`)
- **Expo Go (SDK 58)** app on your Android/iOS device, or **Android Studio Emulator** / **Xcode Simulator**

### Step 1: Install & Verify Expo SDK 58 Dependencies
```bash
cd react-native-game
npm install --legacy-peer-deps
npx expo install expo@latest
npx expo install --fix
```

### Step 2: Start the Expo Development Server
```bash
npx expo start
```
- Press **`a`** to open on an Android Emulator or connected Android device.
- Press **`i`** to open on an iOS Simulator.
- Or scan the **QR Code** in the terminal using the **Expo Go** app on your phone.

---

## 3. Syncing & Rebuilding the Standalone Game Bundle

Whenever you make changes to the core web platformer in the root project and want to update the offline bundle inside `react-native-game/`:

```bash
# From the repository root:
npm run build

# Then from inside react-native-game/:
cd react-native-game
npm run bundle:game
```

This script compiles the latest Vite production assets and writes both:
- `react-native-game/assets/game-bundle.html`
- `react-native-game/src/bundle/inlineGameHtml.ts`

Because the entire game is inlined into `INLINE_GAME_HTML`, the Expo app runs **100% offline with zero network latency** at a locked 60 FPS.

---

## 4. Native Mobile Features & Performance Architecture

### A. Zero-Lag 60+ FPS Hardware-Accelerated Rendering
- **Hardware Layer Acceleration**: `WebView` runs with `androidLayerType="hardware"`, `overScrollMode="never"`, `bounces={false}`, and `scrollEnabled={false}`.
- **60Hz Fixed-Timestep Engine**: `PlatformerEngine` (`src/game/engine.ts`) uses a deterministic `1 / 60` (`FIXED_DT`) physics accumulator so gameplay runs at identical real-time speed on 60Hz, 90Hz, and 120Hz displays.
- **Offscreen Tile Sprite Cache**: `drawTile()` (`src/game/renderer.ts`) caches rendered `32×32` pixel tiles offscreen and blits via `ctx.drawImage()`.
- **Ref-Based Hardware Thumbstick**: The left-margin virtual joystick updates its knob position via `translate3d(x, y, 0)` on a direct DOM ref (`joystickKnobRef`) with zero React re-renders during pointer movement.

### B. Dynamic Auto-Orientation (`expo-screen-orientation`)
- **Portrait Mode on Menus**: Automatically locks to `ScreenOrientation.OrientationLock.PORTRAIT_UP` on the **Home Screen (`TITLE_MENU`)**, **Select World (`WORLD_SELECT`)**, **Level Select (`LEVEL_SELECT`)**, and **Settings (`SETTINGS_HUB`, `SETTINGS`, `CONTROLS`)**.
- **Landscape Mode in Gameplay**: Automatically switches to `ScreenOrientation.OrientationLock.LANDSCAPE` with hidden Android navigation/status bars when entering any level (`PLAYING`, `PAUSED`, or stage outcome modals) so the left/right side-margin touch controllers sit cleanly outside the `896×608` gameplay canvas.

### C. Native Android Hardware & Gesture Back Button (`BackHandler`)
Pressing the Android hardware/software Back button navigates smoothly through the screen hierarchy instead of abruptly closing the app:

| Current Screen (`GameState`) | Android Back Button Action |
| :--- | :--- |
| **`PLAYING`** (Active Level) | Pauses gameplay (`PAUSED`), freezes the level timer, and pauses audio |
| **`PAUSED`** (Pause Modal) | Resumes gameplay (`PLAYING`) and unpauses audio |
| **`LEVEL_COMPLETE` / `WORLD_VICTORY` / `GAME_OVER` / `TIME_OUT`** | Returns to **Level Select (`LEVEL_SELECT`)** and unlocks to Portrait |
| **`SETTINGS` (Audio) / `CONTROLS` (Help)** | Returns to **Settings Hub (`SETTINGS_HUB`)** |
| **`LEVEL_SELECT`** | Returns to **Select World (`WORLD_SELECT`)** |
| **`WORLD_SELECT` / `SETTINGS_HUB`** | Returns to **Home Screen (`TITLE_MENU`)** |
| **`TITLE_MENU`** (Root Home Screen) | Shows `"Press Back again to exit Crown of Emeraldia"` toast; second press within 2s exits the app |

### D. Native `AsyncStorage` Save Persistence
- Every time the player completes a level, collects coins, or updates audio settings, the game posts `SAVE_PROGRESS_SYNC` over the React Native bridge.
- `App.tsx` persists the save payload in `@react-native-async-storage/async-storage` (`crown_of_emeraldia_save_v2`) and hydrates it automatically on app launch.

---

## 5. Building for Google Play Store (APK & AAB)

### Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

### Build an Internal Testing APK
```bash
cd react-native-game
npm run build:android-apk
```

### Build a Production Google Play Store App Bundle (`.aab`)
```bash
cd react-native-game
npm run build:android-aab
```

### Play Store Assets Included
- **App Icon (`assets/icon.png` & `assets/adaptive-icon.png`)**: High-resolution 1:1 square icon featuring the golden Crown of Emeraldia and emerald jewel over a 16-bit question block and hills.
- **Play Console 512×512 Icon (`assets/playstore-icon-512.png`)**: Ready to upload directly to the Google Play Console Store Listing.
- **Splash Screen (`assets/splash-icon.png`)**: High-resolution 9:16 vertical pixel-art splash screen configured via `expo-splash-screen`.
