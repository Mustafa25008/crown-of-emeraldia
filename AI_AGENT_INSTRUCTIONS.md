# AI Agent Instructions: World & Level Architecture and Power-Up Randomization

This document defines the mandatory architectural standards, folder conventions, geometry clearance rules, and dynamic power-up randomization mechanics for **Crown of Emeraldia**. All AI agents creating or modifying future levels (`level_N.ts`) or worlds (`world_N/`) **must** strictly follow these instructions.

---

## 1. Project Folder Structure for Worlds & Levels

All worlds and levels must be organized modularly by world folder so new stages and worlds can be added cleanly without monolithic files:

```text
/src/game/
├── types.ts                  # Shared TypeScript interfaces, TileType enum, PowerState
├── level_builder.ts          # Shared grid helpers (createEmptyGrid, fillGroundRange, addPipe, addStairs, addCoinRow)
├── levels.ts                 # Master level registry combining all worlds
├── engine.ts                 # Core physics, collision, and randomized power-up/star engine
├── renderer.ts               # 16-bit pixel-art Canvas renderer
├── world_1/
│   ├── index.ts              # Exports WORLD_1_LEVELS array
│   ├── level_1.ts            # Stage 1-1 definition (buildLevel1)
│   ├── level_2.ts            # Stage 1-2 definition (buildLevel2)
│   ├── level_3.ts            # Stage 1-3 definition (buildLevel3)
│   ├── level_4.ts            # Stage 1-4 definition (buildLevel4)
│   └── level_5.ts            # Stage 1-5 boss stage definition (buildLevel5)
└── world_2/                  # Future worlds follow the exact same pattern
    ├── index.ts              # Exports WORLD_2_LEVELS array
    ├── level_1.ts            # Stage 2-1 definition
    └── ...
```

### Rules for Adding New Levels or Worlds:
1. **One File Per Level**: Every stage must live in its own file (`src/game/world_<W>/level_<L>.ts`) and export both `buildLevel<ID>(): LevelDefinition` and the built constant.
2. **Use `level_builder.ts` Helpers**: Always use `createEmptyGrid(cols)`, `fillGroundRange(grid, startCol, endCol)`, `addPipe(...)`, `addStairs(...)`, and `addCoinRow(...)` from `src/game/level_builder.ts`.
3. **Register in World Index**: Export all levels of a world from `src/game/world_<W>/index.ts` and register them in `src/game/levels.ts`.

---

## 2. Geometry, Vertical Clearance & Anti-Overlap Rules

When the player collects a **Growth Mushroom**, **Solar Fire Flower**, or **Raccoon Feather**, the character grows from `24×28px` (`SMALL`) to `26×44px` (`BIG` / `FIRE` / `RACCOON`), which is nearly `1.5` tiles tall (`TILE_SIZE = 32px`).

To prevent the grown character from getting stuck and to prevent visual overlaps:
1. **Minimum 3 to 4 Tiles (`96px–128px`) Vertical Clearance Under Floating Blocks**:
   - Standard ground top is at **row `16`**. Any floating Question Block or Brick row above standard ground must be placed at **row `12` or higher** (leaving rows `13`, `14`, and `15` completely empty = `96px` clearance).
   - If a floating Question Block is placed above an elevated `TileType.BRIDGE` or platform at row `R_floor`, the floating block above it **must** be placed at **`R_floor - 4` or higher** (e.g., bridge at row `13` $\rightarrow$ Question Block at row `9`; bridge at row `10` $\rightarrow$ Question Block at row `6`).
2. **Zero Coin & Block Overlap**:
   - Never place a `CoinDef` on the same `(row, col)` or within `1` tile of a `BRICK`, `QUESTION_*`, or `SOLID_STONE` tile.
   - When placing a coin row above floating blocks at row `R_block`, place the coins at **`R_block - 2` or higher** (at least `64px` above the blocks).
3. **Parallax Cloud Altitude**:
   - Background clouds in `renderer.ts` must stay in the upper sky band (`y: 18px–62px`) so they never overlap high platforms or floating Question Blocks.

---

## 3. Power-Up & Invincibility Star Randomization Rules

### A. Power-Up Items & Character States
The game features three core progression power-ups plus the Invincibility Star:
1. **Growth Mushroom (`MUSHROOM` $\rightarrow$ `PowerState: 'BIG'`)**: Grows character larger (`26×44px`), allows breaking `TileType.BRICK` blocks from below, and absorbs 1 hit of damage.
2. **Solar Fire Flower (`FIRE_FLOWER` $\rightarrow$ `PowerState: 'FIRE'`)**: Allows launching bouncing fireballs with `Shift` / `X` / `J` or the on-screen **FIRE** button.
3. **Raccoon Feather (`FEATHER` $\rightarrow$ `PowerState: 'RACCOON'`)**: Grants all 4 classic Raccoon abilities:
   - **Raccoon Transformation**: Pointed brown raccoon ears and a striped wagging tail.
   - **Flying and Gliding**: Jumping during a sprint run and holding/pressing **JUMP** allows the player to fly upward through the air until the Jump button is released.
   - **Tail Attack**: Pressing the **FIRE / ATTACK** button (`Shift` / `X` / `J` on PC or the on-screen **FIRE** button) triggers a 360° spinning tail whip (`tailSpinTimer`) that defeats nearby enemies, damages the vulnerable Boss, and breaks/activates adjacent Bricks and Question Blocks at waist height.
   - **Slow Falling**: Holding or tapping **JUMP** while descending in mid-air wags the raccoon tail to float and descend slowly (`95 px/s`).
4. **Invincibility Star (`STAR` $\rightarrow$ `isInvincibleStar: true`)**: Grants temporary rainbow invincibility for 10 seconds, defeating enemies on contact.

### B. Strict Block Placement Rules in Every Level File
1. **Never Place Power-Up Blocks Adjacent to Each Other**:
   - If a floating Question Block can give a power-up (`QUESTION_MUSHROOM`, `QUESTION_FIRE`, or `QUESTION_FEATHER`), the blocks next to it in the same formation **must** be `TileType.BRICK` or `TileType.QUESTION_COIN`.
   - Any two power-up candidate blocks in a level **must be separated by at least `12` columns** horizontally.
2. **Place Exactly 3 Spaced Power-Up Candidate Slots Per Level**:
   - Place **1 Early slot**, **1 Mid-level slot**, and **1 Late-level slot** in each level file.
   - Never place more than 3 power-up candidate blocks in a level.
3. **Place 2 Spaced Invincibility Star Candidate Slots (`TileType.QUESTION_STAR`) Per Level**:
   - Place **2 `TileType.QUESTION_STAR` blocks** at separate locations in each level (never adjacent to a power-up block).

### C. Engine Randomization & State-Aware Progression (`engine.ts`)
At the start of every level (`randomizeLevelPowerUpAndStarBlocks()` in `src/game/engine.ts`), the engine automatically enforces:
1. **Max 3 Power-Ups Per Level with Randomized Quota (`1`, `2`, or `3`)**:
   - The engine randomly activates **1, 2, or 3** of the level's spaced power-up slots for that run. Any unselected power-up slot is converted into `TileType.QUESTION_COIN`.
2. **Guaranteed Mushroom When `SMALL`**:
   - Whenever the player hits an active power-up block while in **`SMALL`** state—whether at the start of the level, after shrinking from taking a hit, or if they remain `SMALL` for the entire level—the block **always** spawns a **`MUSHROOM`**.
3. **Randomized Upgrades When Grown (`BIG`, `FIRE`, or `RACCOON`)**:
   - Once the player is grown (`BIG` or higher), `MUSHROOM` will not spawn. Instead, the engine uses the level's randomly rolled upgrade mode:
     - **`'ALL_THREE'` Mode**: Consecutive grown upgrade blocks alternate between `FIRE_FLOWER` and `FEATHER` so all three power-ups (`MUSHROOM` $\rightarrow$ `FIRE_FLOWER` $\rightarrow$ `FEATHER`) can appear once in that level.
     - **`'ONLY_FIRE_FLOWER'` Mode**: Grown upgrade blocks in that level only spawn `FIRE_FLOWER`.
     - **`'ONLY_FEATHER'` Mode**: Grown upgrade blocks in that level only spawn `FEATHER`.
4. **Damage Step-Down Flow**:
   - Taking 1 hit in `FIRE` or `RACCOON` steps the player down to `BIG`.
   - Taking 1 hit in `BIG` shrinks the player back to `SMALL` (which immediately causes subsequent active power-up blocks to spawn `MUSHROOM` again).
5. **Randomized Invincibility Stars (`0`, `1`, or `2` Per Level)**:
   - At level start, the engine randomly rolls **0, 1, or 2** active `QUESTION_STAR` blocks for that level and converts any remaining Star slots into `TileType.QUESTION_COIN`.

---

## 4. Controls Architecture (Desktop Keyboard + Mobile On-Screen Controller)

1. **Desktop Keyboard Controls** (must always remain active):
   - **Move Left / Right**: `A` / `D` or `ArrowLeft` / `ArrowRight`
   - **Down / Sit (When Grown)**: `S` or `ArrowDown` (makes grown character crouch/sit down to `28px` height and disables Left/Right walking while held)
   - **Jump / Raccoon Fly / Slow Fall**: `Space`, `W`, or `ArrowUp`
   - **Sprint / Fireball / Tail Attack**: `Shift`, `X`, or `J`
   - **Pause**: `Escape` or `P`
2. **On-Screen Controller** (`PlatformerEngine.setVirtualKey(code, pressed)`):
   - **Left Side**: Directional buttons (`LEFT` mapped to `ArrowLeft`, `RIGHT` mapped to `ArrowRight`, `DOWN` mapped to `ArrowDown` for sitting/crouching when grown, and mobile-only `UP` mapped to `ArrowUp` which performs the exact same jump/fly/slow-fall work as `JUMP`).
   - **Right Side**: Action buttons (`FIRE` mapped to `KeyX` for sprinting, shooting fireballs, and Raccoon tail spin attack; `JUMP` mapped to `Space` for jumping, Raccoon flight, and slow falling).
   - Both desktop keyboard listeners and on-screen touch/pointer buttons feed into the same engine input state simultaneously.
