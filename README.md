# Crown of Emeraldia: 16-Bit Pixel Art Platformer

A complete, playable 2D side-scrolling pixel art platformer inspired by classic 16-bit console platformers, featuring original pixel art sprites, responsive 60Hz fixed-timestep platforming physics, power-ups, synthesized Web Audio chiptune music, and 10 themed Kingdoms (50 playable stages + 10 multi-phase boss battles) across both **Web (React + Vite)** and **Mobile (Expo SDK 58 / React Native + Google AdMob)**.

## Features

- **Responsive 60Hz Fixed-Timestep Platforming Physics**: Horizontal acceleration, ground and air friction, walking vs. sprinting speeds, variable jump height, Charged Super Jump (`BIG` / `FIRE` forms), Raccoon flight & tail spin attack, coyote time, and jump input buffering.
- **Original 16-Bit Pixel Art (`896×608` Native `28×19` Tile Viewport)**: Procedurally rendered pixel art tiles cached via `tileSpriteCache`, multi-layer parallax backgrounds, animated Ranger Pip hero states, and animated enemies (`image-rendering: pixelated`).
- **Four Classic Power-Ups & Charged Super Jump**:
  1. **Growth Mushroom (`BIG`)**: Increases Ranger Pip's size, enables Charged Super Jump, allows breaking brick blocks from below, and absorbs one hit of damage.
  2. **Solar Fire Flower (`FIRE`)**: Grants bouncing fireball projectiles (`Shift` / `X` / `J` or on-screen `🔥` button) and Charged Super Jump.
  3. **Raccoon Feather (`RACCOON`)**: Grants sprint-jump flight, slow-falling glide, and 360° tail whip attack.
  4. **Invincibility Star**: Grants temporary rainbow invulnerability that defeats enemies on contact.
- **10 Complete Worlds (50 Playable Stages)**:
  - **World 1: Emeraldia Kingdom** (`Stage 1-1: Green Hills`, `Stage 1-2: Mushroom Forest`, `Stage 1-3: Underground Caverns`, `Stage 1-4: Castle Approach`, `Stage 1-5: Final Castle`)
  - **World 2: Sapphire Ocean** (`Stage 2-1: Coral Shallows`, `Stage 2-2: Kelp Forest Trench`, `Stage 2-3: Sunken Galleon Reef`, `Stage 2-4: Abyssal Whirlpool`, `Stage 2-5: Tidal Citadel`)
  - **World 3: Sunscorch Desert** (`Stage 3-1: Dune Dash` to `Stage 3-5: Sunken Pyramid`)
  - **World 4: Frostfall Kingdom** (`Stage 4-1: Snowbound Trails` to `Stage 4-5: Frostfang Castle`)
  - **World 5: Inferno Kingdom** (`Stage 5-1: Ashen Outskirts` to `Stage 5-5: Inferno Citadel`)
  - **World 6: Celestia Kingdom** (`Stage 6-1: Cloudtop Meadows` to `Stage 6-5: Celestial Palace`)
  - **World 7: Chronos Realm** (`Stage 7-1: Gearworks Valley` to `Stage 7-5: Chronos Citadel`)
  - **World 8: Shadowveil Kingdom** (`Stage 8-1: Haunted Woods` to `Stage 8-5: Shadowveil Castle`)
  - **World 9: Crystal Caverns** (`Stage 9-1: Crystal Entrance` to `Stage 9-5: Heart of the Crystal`)
  - **World 10: Ancient Ruins** (`Stage 10-1: Overgrown Ruins` to `Stage 10-5: Throne of the Ancients`)
- **Clean, Consistent UI/UX, Unified Modals & `'Stage'` Terminology Standard**:
  - **Stage Select Cards**: Compact, symmetrical 5-card row featuring `STAGE X-Y` + status icon in the card header, clean prefix-free stage title (`formatCleanStageTitle`, with no redundant `1-1:` / `8-1:` / `Level X:` prefixes, no `Boss Fight` tags, and no subtitle clutter), and a vertical stacked icon-only stats column (`🏆` Top Score above `🪙` Coins) formatted with `formatCompactNumber()` (`10.5K`, `1.2M`).
  - **Unified Stage Outcome Modals (`StageOutcomeModal`)**: 100% `font-pixel` typography across all headers, stats, and buttons—featuring `STAGE X-Y CLEARED!` for normal stages (no truncated stage titles), `<Crown />` + `BOSS DEFEATED!` + `WORLD X SAVED!` for boss stages, and clean `GAME OVER` / `TIME UP!` headers (no long subtitle descriptions), paired with a 2-column side-by-side stats row (`<Trophy />` stacked above score on the left, `<GoldCoinIcon />` stacked above coins on the right, formatted via `formatCompactNumber()`).
  - **100% `'Stage'` Terminology**: Unified `'Stage'` labels across the Top Gameplay HUD (`Stage X-Y`), Stage Select (`STAGE X-Y`), Pause Menu (`STAGE X-Y`, `Stage Select`), Stage Outcome Modal (`Next Stage ➔`, `Stage Select`), and Settings.
- **Stage Countdown Timers & Respawn vs. Revive Rules**:
  - **All Non-Boss Stages** (Normal / Standard stages, including Secret Room, Golden Key, and Underwater stages): `90 seconds` (`1:30` / $1\frac{1}{2}$ minutes).
  - **Boss Stages (Stage X-5 of every World — Scales by `+15s` every 2 Worlds with Boss HP)**:
    - **World 1–2 (`3` Hits)**: `90 seconds` (`1:30`)
    - **World 3–4 (`5` Hits)**: `105 seconds` (`1:45`)
    - **World 5–6 (`7` Hits)**: `120 seconds` (`2:00`)
    - **World 7–8 (`9` Hits)**: `135 seconds` (`2:15`)
    - **World 9–10 (`11` Hits)**: `150 seconds` (`2:30`)
  - **Respawn Preserves Timer**: Respawning while hearts remain (`lives > 0`) preserves the player's current remaining countdown time (`initEntitiesFromLevel(false, false)`). Full hearts (`3`) and full stage time are reset only on a verified **Rewarded Ad Revive** or full stage restart.
- **Strict Rewarded Ad Validation (`ca-app-pub-3940256099942544/5224354917`)**:
  - **"Watch Ad & Revive" Protection**: Uses the official Google AdMob Rewarded Test ID (`ca-app-pub-3940256099942544/5224354917`) across both Web and Native builds. Player revival (3 lives + full stage timer) triggers **only** when a real Rewarded Ad actually opens on screen and completes (`AdEventType.OPENED` + `RewardedAdEventType.EARNED_REWARD` on Native, or `beforeAd` + `adViewed` on Web).
  - **Never Revive Without Ad**: If no ad opens on screen, an ad fails to load, the user is offline, or an ad blocker is active, the player is **never** revived without an ad and an in-game alert (`"Ad unavailable. Please check your connection or disable ad blocker to revive!"`) is shown inside the Game Over / Time Up modal.
- **Web Audio API Chiptune Synthesizer**: Custom sound effects and looping background tracks with mute and master volume controls.
- **Startup & Home Re-Entry Splash Sequence**: Displays the official Pixel-Art Sky & Crown Splash Screen (`/splash.png` on Web, `assets/splash-icon.png` on Native) on every cold launch as well as when re-opening the app on the Home Screen (`TITLE_MENU`) after minimizing/backgrounding or exiting via the Android Back button.
- **100% Safe, Non-Destructive Persistent Progression (`mergeSaveProgress`)**: Automatically saves and non-destructively merges unlocked stages, high scores, best coins, total coins, and audio preferences across `localStorage` and native `AsyncStorage` (`crown_of_emeraldia_save_v1` & `crown_of_emeraldia_save_v2`) so player progress is never reset, cleared, or overwritten during startup, splash transitions, or background/foreground resume.

## Project & Stage Architecture

Worlds and stages are modularized so new worlds and stages can be added easily without touching core engine logic:
- `src/game/level_builder.ts`: Shared helper functions for placing ground ranges, stairs, pipes, hazards, and coins.
- `src/game/world_1/` through `src/game/world_10/`: Individual `level_1.ts` through `level_5.ts` stage definitions and `index.ts` world exports.
- `src/game/levels.ts`: Central world and stage registry (`WORLDS` and `LEVELS`).
- `react-native-game/`: Standalone Expo SDK 58 / React Native mobile edition with Google AdMob Banner & Rewarded Ads (`see react-native-game/README.md`).

## Running Locally (Web)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open your browser to `http://localhost:3000`.

