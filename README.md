# Crown of Emeraldia: 16-Bit Pixel Art Platformer

A complete, playable 2D side-scrolling pixel art platformer inspired by classic 16-bit console platformers, featuring original pixel art sprites, responsive platforming physics, power-ups, synthesized chiptune music, and a multi-phase castle boss fight.

## Features

- **Responsive Platforming Physics**: Horizontal acceleration, ground and air friction, walking vs. sprinting speeds, variable jump height (hold Jump longer to leap higher), coyote time, and jump input buffering.
- **Original 16-Bit Pixel Art**: Procedurally rendered pixel art tiles, multi-layer parallax backgrounds, animated Ranger Pip hero states, and animated enemies (`image-rendering: pixelated`).
- **Three Classic Power-Ups**:
  1. **Growth Mushroom**: Increases Ranger Pip's size, allows breaking brick blocks from below, and absorbs one hit of damage.
  2. **Solar Fire Flower**: Grants fireball projectiles (`Shift` or `X`) that bounce along terrain and defeat enemies.
  3. **Invincibility Star**: Grants temporary rainbow invulnerability that defeats enemies on contact.
- **Five Complete Playable Levels (World 1: Emeraldia Kingdom)**:
  - **Level 1: Green Hills**: Introduces movement, coins, brick and question blocks, pipes, and basic enemies.
  - **Level 2: Mushroom Forest**: Adds wider gaps, moving platforms, swooping bats, and a hidden treetop canopy bonus area.
  - **Level 3: Underground Caverns**: Darker subterranean crystal cave with ceiling stalactites, spike hazards, narrow ledges, and a hidden ceiling vault.
  - **Level 4: Castle Approach**: Combines moving platforms, lava trenches, rotating fire bars, armored knights, and a late-stage checkpoint.
  - **Level 5: Final Castle & Boss Fight**: Full castle gauntlet leading to the throne room battle against **Ironclad King Dredge** (5 HP, flame breath volleys, charge attacks, jump slams, and vulnerable counterattack windows).
- **Web Audio API Chiptune Synthesizer**: Custom sound effects and looping background tracks with mute and master volume controls.
- **Persistent Progression**: Automatically saves unlocked levels, stage high scores, and audio preferences in `localStorage`.

## Project & Level Architecture

Levels and worlds are modularized so new worlds and levels can be added easily without touching core engine logic:
- `src/game/level_builder.ts`: Shared helper functions for placing ground ranges, stairs, pipes, and coins.
- `src/game/world_1/`:
  - `level_1.ts`: Green Hills
  - `level_2.ts`: Mushroom Forest
  - `level_3.ts`: Underground Caverns
  - `level_4.ts`: Castle Approach
  - `level_5.ts`: Final Castle & Boss Fight
  - `index.ts`: World 1 definition, grouping, and exports.
- `src/game/levels.ts`: Central world and level registry (`WORLDS` and `LEVELS`). To add future worlds (e.g. `world_2/`), create the folder with individual `level_*.ts` files and register it in `levels.ts`.

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open your desktop browser to `http://localhost:3000`.
