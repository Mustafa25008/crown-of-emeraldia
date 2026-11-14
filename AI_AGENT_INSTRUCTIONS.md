# AI Agent Instructions: World & Level Architecture and Power-Up Randomization

This document defines the mandatory architectural standards, folder conventions, geometry clearance rules, and dynamic power-up randomization mechanics for **Crown of Emeraldia**. All AI agents creating or modifying future levels (`level_N.ts`) or worlds (`world_N/`) **must** strictly follow these instructions.

---

## 1. Project Folder Structure for Worlds & Levels (Worlds 1 to 10)

All 10 worlds (50 levels total) are organized modularly by world folder so stages and worlds can be maintained cleanly without monolithic files:

```text
/src/game/
├── types.ts                  # Shared TypeScript interfaces, TileType enum, PowerState
├── level_builder.ts          # Shared grid helpers (createEmptyGrid, fillGroundRange, addPipe, addStairs, addCoinRow, etc.)
├── levels.ts                 # Master level registry combining all 10 worlds (ALL_WORLDS, LEVELS)
├── engine.ts                 # Core physics, collision, boss AI, secret rooms, and randomized power-up/star engine
├── renderer.ts               # 16-bit pixel-art Canvas renderer for all 10 world themes and bosses
├── world_1/                  # World 1: Emerald Kingdom (Grassland, Cavern, Sky Bridge, Fortress & Castle Stages 1-1 to 1-5)
│   ├── index.ts              # Exports WORLD_1 and WORLD_1_LEVELS array (Levels 1-5)
│   ├── level_1.ts            # Stage 1-1 definition (Emerald Meadows)
│   ├── level_2.ts            # Stage 1-2 definition (Crystal Caverns)
│   ├── level_3.ts            # Stage 1-3 definition (Canopy Sky-Bridge)
│   ├── level_4.ts            # Stage 1-4 definition (Ironstone Keep)
│   └── level_5.ts            # Stage 1-5 boss stage definition (Obsidian Throne & Boss Fight)
├── world_2/                  # World 2: Coral Abyss (Underwater Stages 2-1 to 2-4 + Boss Stage 2-5)
│   ├── index.ts              # Exports WORLD_2 and WORLD_2_LEVELS array (Levels 6-10)
│   ├── level_1.ts            # Stage 2-1 definition (Coral Shallows - Underwater)
│   ├── level_2.ts            # Stage 2-2 definition (Kelp Forest Trench - Underwater)
│   ├── level_3.ts            # Stage 2-3 definition (Sunken Galleon Reef - Underwater)
│   ├── level_4.ts            # Stage 2-4 definition (Abyssal Whirlpool - Underwater)
│   └── level_5.ts            # Stage 2-5 boss stage definition (Tidal Citadel & Boss Fight)
├── world_3/                  # World 3: Sunscorch Desert (Desert & Pyramid Stages 3-1 to 3-5)
│   ├── index.ts              # Exports WORLD_3 and WORLD_3_LEVELS array (Levels 11-15)
│   ├── level_1.ts            # Stage 3-1 definition (Dune Dash)
│   ├── level_2.ts            # Stage 3-2 definition (Shifting Sands - Quicksand & Crumble Blocks)
│   ├── level_3.ts            # Stage 3-3 definition (Temple of Echoes - Pyramid Temple)
│   ├── level_4.ts            # Stage 3-4 definition (The Sandstorm - Wind & Sandstorm Overlay)
│   └── level_5.ts            # Stage 3-5 boss stage definition (Sunken Pyramid & Solkar Boss Fight)
├── world_4/                  # World 4: Frostfall Kingdom (Snow, Ice Cavern & Frost Castle Stages 4-1 to 4-5)
│   ├── index.ts              # Exports WORLD_4 and WORLD_4_LEVELS array (Levels 16-20)
│   ├── level_1.ts            # Stage 4-1 definition (Snowbound Trails)
│   ├── level_2.ts            # Stage 4-2 definition (Slippery Slopes - Reduced Friction & Stepped Glaciers)
│   ├── level_3.ts            # Stage 4-3 definition (Frozen Depths - Ice Cavern, Icicles & Freezing Water)
│   ├── level_4.ts            # Stage 4-4 definition (Blizzard Pass - Blizzard Wind & Exposed Ice Ledges)
│   └── level_5.ts            # Stage 4-5 boss stage definition (Frostfang Castle & Glacior Boss Fight)
├── world_5/                  # World 5: Inferno Kingdom (Volcano, Molten Cavern & Inferno Citadel Stages 5-1 to 5-5)
│   ├── index.ts              # Exports WORLD_5 and WORLD_5_LEVELS array (Levels 21-25)
│   ├── level_1.ts            # Stage 5-1 definition (Ashen Outskirts - Ash Ground, Burning Rocks & Lava Pools)
│   ├── level_2.ts            # Stage 5-2 definition (Molten Caverns - Flowing Lava, Falling Rocks & Magma Crumble)
│   ├── level_3.ts            # Stage 5-3 definition (Firefall Cliffs - Erupting Lava Geysers & Falling Debris)
│   ├── level_4.ts            # Stage 5-4 definition (The Burning Fortress - Fire Traps, Lava Chambers & Rotating Bars)
│   └── level_5.ts            # Stage 5-5 boss stage definition (Inferno Citadel & Ignarok Boss Fight)
├── world_6/                  # World 6: Celestia Kingdom (Floating Sky Islands, Sky Temple & Celestial Palace Stages 6-1 to 6-5)
│   ├── index.ts              # Exports WORLD_6 and WORLD_6_LEVELS array (Levels 26-30)
│   ├── level_1.ts            # Stage 6-1 definition (Cloudtop Meadows - Cloud Platforms & Bounce Clouds)
│   ├── level_2.ts            # Stage 6-2 definition (Windrunner Heights - Updrafts, Sky Wind & Moving Clouds)
│   ├── level_3.ts            # Stage 6-3 definition (Sky Temple Ruins - Disappearing Clouds & Rotating Traps)
│   ├── level_4.ts            # Stage 6-4 definition (Starlight Ascent - Storm Lightning & High-Altitude Bridges)
│   └── level_5.ts            # Stage 6-5 boss stage definition (Celestial Palace & Zephyros Boss Fight)
├── world_7/                  # World 7: Chronos Realm (Clockwork Valley, Factory, Clock Tower, Rift & Citadel Stages 7-1 to 7-5)
│   ├── index.ts              # Exports WORLD_7 and WORLD_7_LEVELS array (Levels 31-35)
│   ├── level_1.ts            # Stage 7-1 definition (Gearworks Valley - Conveyors, Rotating Gears & Moving Platforms)
│   ├── level_2.ts            # Stage 7-2 definition (The Forgotten Factory - Crushers, Steam Vents & Secret Room #1)
│   ├── level_3.ts            # Stage 7-3 definition (Pendulum Passage - Swinging Pendulums & Timed Platforms)
│   ├── level_4.ts            # Stage 7-4 definition (The Lost Dimension - Temporal Rifts, Golden Key & Secret Room #2)
│   └── level_5.ts            # Stage 7-5 boss stage definition (Chronos Citadel & Chronok Boss Fight)
├── world_8/                  # World 8: Shadowveil Kingdom (Dark Fantasy Stages 8-1 to 8-5)
│   ├── index.ts              # Exports WORLD_8 and WORLD_8_LEVELS array (Levels 36-40)
│   ├── level_1.ts            # Stage 8-1 definition (Haunted Woods - Cursed Thorns, Fog & Ghost Enemies)
│   ├── level_2.ts            # Stage 8-2 definition (Forgotten Graveyard - Crumbling Crypts, Swamp Pits & Secret Room)
│   ├── level_3.ts            # Stage 8-3 definition (Phantom Manor - Moving Furniture, Teleporters & Disappearing Floors)
│   ├── level_4.ts            # Stage 8-4 definition (Cursed Moonlight - Moonlight Wind, Teleporters & Golden Key Door)
│   └── level_5.ts            # Stage 8-5 boss stage definition (Shadowveil Castle & Nocthar Boss Fight)
├── world_9/                  # World 9: Crystal Caverns (Crystal Fantasy Stages 9-1 to 9-5)
│   ├── index.ts              # Exports WORLD_9 and WORLD_9_LEVELS array (Levels 41-45)
│   ├── level_1.ts            # Stage 9-1 definition (Crystal Entrance - Glowing Crystal Spires & Shimmering Bridges)
│   ├── level_2.ts            # Stage 9-2 definition (Shimmering Mines - Minecart Conveyors, Falling Shards & Secret Room)
│   ├── level_3.ts            # Stage 9-3 definition (Luminous Lake - Underground Crystal Lake & Fragile Prism Bridges)
│   ├── level_4.ts            # Stage 9-4 definition (The Crystal Labyrinth - Energy Beams, Teleporters & Golden Key)
│   └── level_5.ts            # Stage 9-5 boss stage definition (Heart of the Crystal & Crystalis Boss Fight)
└── world_10/                 # World 10: Ancient Ruins (Final World - Jungle Ruins & Golden Temple Stages 10-1 to 10-5)
    ├── index.ts              # Exports WORLD_10 and WORLD_10_LEVELS array (Levels 46-50)
    ├── level_1.ts            # Stage 10-1 definition (Overgrown Ruins - Jungle Vines, Mossy Pillars & Crumbling Stone)
    ├── level_2.ts            # Stage 10-2 definition (Sunken Courtyard - Quicksand Basins, Crushers & Secret Relic Room)
    ├── level_3.ts            # Stage 10-3 definition (Hall of Trials - Swinging Blades, Flame Jets & Timed Bridges)
    ├── level_4.ts            # Stage 10-4 definition (The Sacred Ascent - Solar Beams, Updrafts, Tremors & Golden Key)
    └── level_5.ts            # Stage 10-5 boss stage definition (Throne of the Ancients & Aethelgard Final Boss Fight)
```

### Rules for All 10 Worlds & Adding/Updating Levels:
1. **One File Per Level**: Every stage must live in its own file (`src/game/world_<W>/level_<L>.ts`) and export both `buildWorld<W>Level<L>(): LevelDefinition` and the built constant (`WORLD_<W>_LEVEL_<L>`).
2. **Use `level_builder.ts` Helpers**: Always use `createEmptyGrid(cols)`, `fillGroundRange(...)`, `fillIceGroundRange(...)`, `fillCloudGroundRange(...)`, `fillClockworkGroundRange(...)`, `addPipe(...)`, `addStairs(...)`, `addCoinRow(...)`, `addQuicksandPit(...)`, `addCrumbleBridge(...)`, `addFragileIceBridge(...)`, `addFreezingWaterPit(...)`, `addLavaPit(...)`, `addMagmaCrumbleBridge(...)`, `addCloudPlatform(...)`, `addBounceCloudBridge(...)`, `addDisappearingCloudBridge(...)`, `addConveyorBelt(...)`, and `addTimedExperimentBridge(...)` from `src/game/level_builder.ts`.
3. **Register in World Index**: Export all levels of a world from `src/game/world_<W>/index.ts` and register them in `src/game/levels.ts`.
4. **World 1: Emerald Kingdom (`theme: 'GRASSLAND' | 'CAVERN' | 'SKY_BRIDGE' | 'FORTRESS' | 'CASTLE'`)**:
   - Classic fantasy platforming across Emerald Meadows (1-1), Crystal Caverns (1-2), Canopy Sky-Bridge (1-3), Ironstone Keep (1-4), and Obsidian Throne (1-5) featuring **Malakor, the Obsidian Tyrant**.
5. **World 2: Coral Abyss (`isUnderwater: true`, `theme: 'UNDERWATER'`, `musicTrack: 'UNDERWATER'`)**:
   - Stages 2-1 through 2-4 use underwater swimming physics (`isUnderwater: true`, `vy = -255` swim strokes, buoyant gravity `480 px/s²`), while Stage 2-5 (`Tidal Citadel`) is a non-underwater Castle Boss stage against the Abyssal Leviathan Lord.
6. **World 3: Sunscorch Desert (`theme: 'DESERT' | 'PYRAMID'`, `musicTrack: 'DESERT' | 'BOSS'`)**:
   - Features Quicksand (`TileType.QUICKSAND_TOP`, `TileType.QUICKSAND_DEEP`), Collapsing Sandstone (`TileType.CRUMBLE_BLOCK`), Solid Cactus hazards (`TileType.CACTUS`), Sandstorm & Wind (`hasSandstorm: true`, `windForce`), and Stage 3-5 Boss **Solkar, the Sand Titan**.
7. **World 4: Frostfall Kingdom (`theme: 'SNOW' | 'ICE_CAVERN' | 'FROST_CASTLE'`, `musicTrack: 'SNOW' | 'CAVERN' | 'CASTLE_BOSS'`)**:
   - Features Slippery Ice surfaces (`TileType.ICE_GROUND`), Fragile Ice platforms (`TileType.FRAGILE_ICE`), Solid Icicle hazards (`TileType.ICICLE`), Sub-Zero Freezing Water (`TileType.FREEZING_WATER_TOP`, `TileType.FREEZING_WATER_DEEP`), Blizzard winds (`hasBlizzard: true`), and Stage 4-5 Boss **Glacior, the Frost Monarch**.
8. **World 5: Inferno Kingdom (`theme: 'VOLCANO' | 'MOLTEN_CAVERN' | 'INFERNO_CASTLE'`, `musicTrack: 'VOLCANO' | 'CAVERN' | 'FORTRESS' | 'CASTLE_BOSS'`)**:
   - Features Burning Rocks (`TileType.BURNING_ROCK`), Collapsing Magma Ledges (`TileType.MAGMA_CRUMBLE`), Erupting Lava Geysers (`lavaGeysers`), Rising Lava (`hasRisingLava: true`), Falling Volcanic Debris (`hasFallingRocks: true`), and Stage 5-5 Boss **Ignarok, the Molten Colossus**.
9. **World 6: Celestia Kingdom (`theme: 'SKY_ISLAND' | 'CLOUD_WIND' | 'SKY_TEMPLE' | 'STORM_SKY' | 'CELESTIAL_PALACE'`, `musicTrack: 'SKY_ISLAND' | 'SKY_TEMPLE' | 'STORM_SKY' | 'CELESTIAL_BOSS'`)**:
   - Features Cloud Platforms (`TileType.CLOUD_PLATFORM`), Bounce Clouds (`TileType.BOUNCE_CLOUD`), Disappearing Clouds (`TileType.DISAPPEARING_CLOUD`), Vertical Updrafts (`updrafts`), Moving Platforms (`movingPlatforms`), Storm Lightning (`hasStormLightning: true`), and Stage 6-5 Boss **Zephyros, the Sky Sovereign**.
10. **World 7: Chronos Realm (`theme: 'CLOCKWORK_VALLEY' | 'FACTORY' | 'CLOCK_TOWER' | 'CHRONO_RIFT' | 'CHRONOS_CITADEL'`, `musicTrack: 'CLOCKWORK' | 'FACTORY' | 'CLOCK_TOWER' | 'CHRONO_BOSS'`)**:
    - Features Conveyor Belts (`TileType.CONVEYOR_LEFT`, `TileType.CONVEYOR_RIGHT`), Timed Clockwork Bridges (`TileType.TIMED_BLOCK`), Rotating Gear Hazards (`TileType.GEAR_HAZARD`), Industrial Crushers (`crusherPistons`), Steam Vents (`steamVents`), Swinging Pendulums (`swingingPendulums`), Secret Hidden Rooms (`secretRoom` in 7-2 & 7-4), Golden Key & Locked Exit Door (`requiresKey: true`, `keyPos` in 7-4), and Stage 7-5 Boss **Chronok, the Time Warden**.
11. **World 8: Shadowveil Kingdom (`theme: 'HAUNTED_WOODS' | 'GRAVEYARD' | 'PHANTOM_MANOR' | 'CURSED_MOONLIGHT' | 'SHADOWVEIL_CASTLE'`, `musicTrack: 'SHADOWVEIL' | 'MANOR' | 'SHADOW_BOSS'`)**:
    - Features Haunted Fog (`hasHauntedFog: true`), Cursed Thorns, Disappearing Phantom Floors, Moving Manor Furniture (`movingPlatforms`), Shadow Teleporters (`teleporters`), Hidden Crypt Secret Room (8-2), Golden Key & Locked Exit Gate (8-4), and Stage 8-5 Boss **Nocthar, the Shadow King** (who teleports between arena pillars and unleashes dark shadow orbs).
12. **World 9: Crystal Caverns (`theme: 'CRYSTAL_ENTRANCE' | 'SHIMMERING_MINES' | 'LUMINOUS_LAKE' | 'CRYSTAL_LABYRINTH' | 'HEART_OF_CRYSTAL'`, `musicTrack: 'CRYSTAL' | 'CRYSTAL_DEPTHS' | 'CRYSTAL_BOSS'`)**:
    - Features Crystal Spires (`TileType.CRYSTAL_SPIRE` solid hazard), Fragile Prismatic Bridges, Minecart Conveyors, Falling Crystal Shards, Periodic Crystal Laser Beams (`crystalLasers`), Teleporter Pads (`teleporters`), Secret Gem Vault (9-2), Golden Key & Locked Crystal Gate (9-4), and Stage 9-5 Boss **Crystalis, the Crystal Guardian** (who fires refracting prism bursts and summons crystal lasers).
13. **World 10: Ancient Ruins (`theme: 'OVERGROWN_RUINS' | 'SUNKEN_COURTYARD' | 'HALL_OF_TRIALS' | 'SACRED_ASCENT' | 'THRONE_OF_THE_ANCIENTS'`, `musicTrack: 'ANCIENT_RUINS' | 'ANCIENT_TEMPLE' | 'FINAL_BOSS'`)**:
    - Final World combining Overgrown Jungle Ruins, Sunken Quicksand Courtyards, Stone Crushers (`crusherPistons`), Swinging Temple Blades (`swingingPendulums`), Ancient Flame Jets (`steamVents`), Solar Laser Beams (`crystalLasers`), Thermal Updrafts (`updrafts`), Secret Relic Sanctuary (10-2), Sacred Golden Key (10-4), and Stage 10-5 Final Boss **Aethelgard, the Ancient Colossus**.

---

## 2. Geometry, Flagpole Ground Alignment, Vertical Clearance & Anti-Overlap Rules

When the player collects a **Growth Mushroom**, **Solar Fire Flower**, or **Raccoon Feather**, the character grows from `24×28px` (`SMALL`) to `26×44px` (`BIG` / `FIRE` / `RACCOON`), which is nearly `1.5` tiles tall (`TILE_SIZE = 32px`).

To prevent the grown character from getting stuck and to prevent visual misalignments or overlaps:
1. **Goal Flagpole Ground Alignment (`goalY: 6 * 32` vs Locked Door `goalY: 13 * 32`)**:
   - Standard solid ground top is at **row `16`** (`y = 16 * 32 = 512px`).
   - In `renderer.ts` (`drawGoalFlagpole`), the level-end flagpole is `10` tiles tall (`poleHeight = 10 * 32 = 320px`) with its stone base block drawn at `goalY + 9 * 32` (`rows 6..15`).
   - Therefore, for every standard flagpole stage and boss stage where the ground top is row `16`, **`goalY` MUST be set to `6 * 32` (`192px`)** so the flagpole base rests flush on top of the row `16` ground (and never sinks underground).
   - For stages with a Locked Exit Door (`requiresKey: true`, such as 7-4, 8-4, 9-4, and 10-4), `drawLockedGoalDoor` renders a `3`-tile-tall (`96px`) archway, so **`goalY` MUST be set to `13 * 32` (`416px`)** so the bottom of the door sits flush on row `16`.
   - The final victory staircase (`addStairs(grid, startCol, height)`) before a flagpole should end 2 to 3 columns before `goalX` (e.g., `addStairs(grid, 151, 6)` covers columns `151..156` before `goalX: 159 * 32`).
2. **Player & Ground Enemy Spawn Alignment**:
   - Standard `playerStart` on row `16` ground must be `{ x: 3 * 32, y: 14 * 32 }` (or `{ x: 3 * 32, y: 12 * 32 }` in underwater stages).
   - Ground-patrolling enemies (`SLIME`, `BEETLE`, `KNIGHT`) placed on row `16` ground must use `y: 15 * 32`.
   - Rotating `FIRE_BAR` hazards must be centered on a solid pivot block (`grid[row][col] = TileType.SOLID_STONE` with `x: col * 32 + 16, y: row * 32 + 16`).
   - `teleporters` pads (`fromRow` / `toRow`) must specify the exact solid tile row of the ground or platform they rest on (`fromRow: 16` for standard ground, or `toRow: R_platform` for a platform at row `R_platform`), as the engine/renderer positions the pad on the top surface of that row.
3. **Minimum 3 to 4 Tiles (`96px–128px`) Vertical Clearance Under Floating Blocks**:
   - Standard ground top is at **row `16`**. Any floating Question Block or Brick row above standard ground must be placed at **row `12` or higher** (leaving rows `13`, `14`, and `15` completely empty = `96px` clearance).
   - If a floating Question Block is placed above an elevated `TileType.BRIDGE` or platform at row `R_floor`, the floating block above it **must** be placed at **`R_floor - 4` or higher** (e.g., bridge at row `13` $\rightarrow$ Question Block at row `9`; platform at row `9` $\rightarrow$ Question Block at row `5`).
4. **Minimum 3 to 4 Tiles (`96px–128px`) Top Headroom Above Every Question Block**:
   - Stationary power-ups like `FIRE_FLOWER` spawn on top of the Question Block (`R_block - 1`), and the grown character is `44px` tall (`~1.4` tiles).
   - Therefore, every Question Block (`QUESTION_*`) **must** have at least **3 to 4 full empty tiles (`96px–128px`) of open space above it** (`R_block - 1`, `R_block - 2`, and `R_block - 3` must be `TileType.EMPTY` across `c - 1 .. c + 1`).
   - In underground or castle levels with a ceiling at row `0` (or stalactites at row `1`), never place a Question Block higher than **row `5`**, and never place ceiling stalactites (`grid[1][c]`) within 4 columns of an elevated platform or Question Block.
5. **Zero Coin & Block Overlap**:
   - Never place a `CoinDef` on the same `(row, col)` or within `1` tile of a `BRICK`, `QUESTION_*`, or `SOLID_STONE` tile.
   - When placing a coin row above floating blocks at row `R_block`, place the coins at **`R_block - 2` or higher** (at least `64px` above the blocks).
6. **Parallax Cloud Altitude**:
   - Background clouds in `renderer.ts` must stay in the upper sky band (`y: 18px–62px`) so they never overlap high platforms or floating Question Blocks.
7. **Solid Spike & Theme Hazards (`TileType.SPIKE`, `CACTUS`, `ICICLE`, `BURNING_ROCK`, `GEAR_HAZARD`, `CRYSTAL_SPIRE`)**:
   - All solid hazard tiles (`isSolidTile` and `isHazardContactTile`) block player movement while applying contact damage (`damagePlayer()`) and reflect ground enemies (`SLIME`, `BEETLE`, `KNIGHT`, or moving shells) horizontally just like hitting a solid wall.
   - Whenever a row of solid hazards is placed on the ground across multiple columns, always provide a reachable jump path or `TileType.BRIDGE` (at most `4` tiles above the ground, e.g. row `12`) so the player can jump over the hazard formation.
8. **Bumped Brick & Power-Up Item (Mushroom) Collision Interaction**:
   - When a solid block or brick is bumped from below (`this.bumpedTiles` with vertical displacement `offsetY`), its physical hitbox is shifted vertically by `offsetY` (`getTileHitbox(col, row)` in `src/game/engine.ts`).
   - When a brick moves upward (`carryPowerUpsOnBumpedTile`), any Mushroom or power-up item standing on or in contact with its top surface is carried/pushed upward with the brick so it never clips into the bumped tile, and settles naturally back down under gravity as the brick returns to its original position.
   - If a Mushroom is beside a brick rather than on top of it, horizontal collision and direction reversal (`item.vx = -item.vx`) occur only when their actual hitboxes (including any active `offsetY`) overlap.

---

## 3. Power-Up, Charged Super Jump & Invincibility Star Rules

### A. Power-Up Items, Charged Super Jump & Character States
The game features three core progression power-ups, the Charged Super Jump ability, and the Invincibility Star:
1. **Growth Mushroom (`MUSHROOM` $\rightarrow$ `PowerState: 'BIG'`)**: Grows character larger (`26×44px`), allows breaking `TileType.BRICK` blocks from below, enables **Charged Super Jump**, and absorbs 1 hit of damage.
2. **Solar Fire Flower (`FIRE_FLOWER` $\rightarrow$ `PowerState: 'FIRE'`)**: Allows launching bouncing fireballs with `Shift` / `X` / `J` or the on-screen **FIRE** button, and enables **Charged Super Jump**.
3. **Raccoon Feather (`FEATHER` $\rightarrow$ `PowerState: 'RACCOON'`)**: Grants all 4 classic Raccoon abilities:
   - **Raccoon Transformation**: Pointed brown raccoon ears and a striped wagging tail.
   - **Flying and Gliding**: Jumping during a sprint run and holding/pressing **JUMP** allows the player to fly upward through the air until the Jump button is released.
   - **Tail Attack**: Pressing the **FIRE / ATTACK** button (`Shift` / `X` / `J` on PC or the on-screen **FIRE** button) triggers a 360° spinning tail whip (`tailSpinTimer`) that defeats nearby enemies, damages the vulnerable Boss, and breaks/activates adjacent Bricks and Question Blocks at waist height.
   - **Slow Falling**: Holding or tapping **JUMP** while descending in mid-air wags the raccoon tail to float and descend slowly (`95 px/s`).
4. **Charged Super Jump (Eligible in `BIG` and `FIRE` forms only; not available in `SMALL` or `RACCOON`)**:
   - **Activation**: Press and hold **Down** (`S`, `ArrowDown`, or on-screen Down button) while grounded in `BIG` or `FIRE` form for `1.5` seconds.
   - **Ready State**: Once charged, the character blinks (`superJumpChargeTimer` up to `2.5s`) while Down remains held. Pressing **Jump** triggers a high-velocity Super Jump (`vy = -665`) and immediately consumes the charge. Releasing Down before jumping cancels the charge.
5. **Invincibility Star (`STAR` $\rightarrow$ `isInvincibleStar: true`)**: Grants temporary rainbow invincibility for 10 seconds, defeating enemies on contact.

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

## 4. Controls Architecture (Desktop Keyboard Rule + Mobile Side-Margin Touch Controllers + Dynamic Auto-Orientation)

1. **Desktop / PC Screen Rule (Permanent Instruction — Strictly Keyboard Only)**:
   - **Completely hide all on-screen touch controllers on Desktop / PC viewports** (`!isMobileTouch` check in `src/App.tsx` combined with `@media (hover: hover) and (pointer: fine) { .mobile-touch-controls { display: none !important; } }` in `src/index.css`).
   - No on-screen buttons may ever render on desktop/PC screens. PC players play exclusively using keyboard keys:
     - **Move Left / Right**: `A` / `D` or `ArrowLeft` / `ArrowRight`
     - **Down / Duck / Sit (When Grown) & Charged Super Jump (Hold 1.5s in BIG/FIRE)**: `S` or `ArrowDown`
     - **Jump / Raccoon Fly / Slow Fall / Enter Secret Pipe or Exit**: `Space`, `W`, or `ArrowUp`
     - **Sprint / Fireball / Tail Attack**: `Shift`, `X`, or `J`
     - **Pause**: `Escape` or `P`

2. **Mobile Touch Controller Redesign, Geometry, Location & Function (`src/App.tsx`, `PlatformerEngine.setVirtualKey`)**:
   - **Zero Canvas Overlap Rule**: Never render a bottom-bar controller or any touch buttons inside/overlapping the `<canvas>` container.
   - **Native Unstretched Canvas & Header Width (`896×608`, `28×19` tiles at `32×32px`)**:
     - `CANVAS_WIDTH` in `src/game/engine.ts` is `896` (`28` tiles × `32px`) and `CANVAS_HEIGHT` is `608` (`19` tiles × `32px`), paired with `aspect-[896/608]` on the canvas wrapper in `src/App.tsx`.
     - Because `896` is an exact multiple of `TILE_SIZE = 32`, this widens both the gameplay viewport and the Top Header Bar by `+96px` (`+3` native tiles, `1.5` tiles on each side) **with zero stretching or distortion of the internal pixel art graphics/sprites**.
     - On **Desktop / PC**, the centered column uses `max-w-[920px]` and `maxWidth: calc((100dvh - 52px) * (896 / 608))` for a clean, balanced retro arcade presentation.
     - On **Mobile Landscape** (`isMobileTouch && gameState === 'PLAYING'`), the gameplay area renders a 3-column horizontal flex layout:
       `[Left Empty Side Margin Virtual Joystick]  [Center Header + 896×608 Gameplay Canvas]  [Right Empty Side Margin Action Buttons]`
       with `maxWidth: min(calc(100vw - 264px), calc((100dvh - 46px) * (896 / 608)))` and `maxHeight: calc(100dvh - 46px)` on the center column. This provides ample horizontal width for the Top Header Bar (so Audio and Pause buttons never overflow or clip) while guaranteeing `128px–144px` of dedicated empty side margin on both the left and right edges outside the `<canvas>`.
   - **Non-Blocking Side Margins (`self-end pointer-events-none`)**:
     - Both the Left and Right side margin containers must use `self-end pointer-events-none` (with `pointer-events-auto` applied only to the interactive Joystick ring and the individual Fire/Jump buttons) so the upper side margins never cover or intercept clicks/touches on the Top Header Bar's Audio and Pause buttons.
   - **Left Empty Side Margin — Clean Virtual Joystick / Thumbstick (`w-[128px] sm:w-[144px]` outside the left edge of the canvas)**:
     - Do **not** render separate individual arrow button boxes (`<`, `>`, `↓`), arrow icons inside the ring, or multiple non-absolute flex sibling circles that overlap.
     - Instead, render a clean, two-part **Virtual Joystick / Thumbstick** anchored in the bottom-left empty margin:
       1. **Outer Base Ring**: A fixed, semi-transparent circular base ring (`w-[116px] h-[116px] sm:w-[128px] sm:h-[128px] rounded-full bg-slate-900/70 border-2 border-white/25 flex items-center justify-center pointer-events-auto`).
       2. **Centered Inner Knob / Handle (`joystickKnobRef`)**: A single sleek circular thumbstick handle (`w-14 h-14 sm:w-16 sm:h-16 rounded-full`) centered inside the outer ring that moves smoothly via hardware-accelerated `translate3d(x, y, 0)` (caching `getBoundingClientRect()` once on `onPointerDown` via `cacheJoystickBounds` so `onPointerMove` has zero layout reads) when touched or dragged **Left (`ArrowLeft`)**, **Right (`ArrowRight`)**, or **Down (`ArrowDown`)** (for ducking/sitting when large, entering secret warp pipes, and holding 1.5s to charge Super Jump), and springs smoothly back to center `(0, 0)` on release.
   - **Right Empty Side Margin — Separated Action Buttons in 100% Transparent Container (`w-[128px] sm:w-[144px]` outside the right edge of the canvas)**:
     - **100% Transparent Container Rule**: The right-side action buttons container must be **100% transparent** (`bg-transparent flex items-end justify-center gap-3 sm:gap-3.5`) with **no** visible background box, dark panel, or outer box border, so the two circular arcade buttons float naturally in the right margin.
     - Keep the ergonomic diagonal layout for the right thumb:
       - **Fire (`🔥`, `Flame` icon, lower/backward button `w-14 h-14 sm:w-16 sm:h-16 pointer-events-auto`)**: Mapped to `KeyX` — holds to sprint, launches bouncing fireballs in `FIRE` form, and triggers the 360° spinning tail whip in `RACCOON` form.
       - **Jump (`↑`, `ArrowUp` icon, higher/forward elevated button `w-15 h-15 sm:w-[66px] sm:h-[66px] -translate-y-3.5 pointer-events-auto`)**: Mapped to `Space` — jumps (variable height based on hold), swims upward in underwater stages, flies/glides and slow-falls in `RACCOON` form, and executes Charged Super Jumps.
   - **Performance Rule for Touch Controls**: Style the thumbstick and buttons using GPU-friendly translucent gradients, inset specular borders, and direct ref-based `translate3d` knob transforms without `backdrop-blur` over animated canvas layers so mobile frame rates stay locked at 60 FPS.

3. **Mobile Dynamic Auto-Orientation & 60Hz Fixed-Timestep Performance (`src/App.tsx`, `src/game/engine.ts`, `src/game/renderer.ts`)**:
   - **Never** render a forced `"Landscape Orientation Required / Please Rotate Your Device"` warning modal or overlay.
   - **Portrait Navigation & Menus**: Keep all navigation, the Title Menu, Settings, Level Select, and the **Select World** screen strictly in **Portrait mode** on mobile devices (`unlockMobileToPortrait()` guarded by `isLandscapeLockedRef` in `src/App.tsx`, and `"orientation": "portrait"` in `/public/manifest.json`).
   - **Automatic Landscape on Level Start**: Whenever a mobile user starts or enters any active gameplay level (`startLevel` / `gameState === 'PLAYING'`), programmatically request a landscape orientation lock (`lockMobileLandscape()` using `screen.orientation.lock('landscape')` and fullscreen landscape handling) so the device automatically flips to landscape and displays the left/right side-margin touch controllers cleanly outside the canvas.
   - **Automatic Portrait on Level Exit**: When the user exits gameplay (clicks `"Level Select"`, `"Home"`, or returns from a level via `navigateToMenu`), automatically release the landscape lock (`screen.orientation.lock('portrait')` / `screen.orientation.unlock()` and `document.exitFullscreen()`) to return the app seamlessly to **Portrait mode**.
   - **Lag-Free 60Hz Fixed-Timestep Engine & Tile Sprite Cache**:
     - `PlatformerEngine.start()` must always run a fixed `1 / 60` (`FIXED_DT`) physics accumulator (clamping orientation-rotation frame gaps and stepping up to 4 times per render frame) so gameplay always runs at 100% real-time speed on 30Hz, 60Hz, 90Hz, and 120Hz mobile screens without slow-motion.
     - `drawTile()` in `src/game/renderer.ts` must cache rendered `32×32` tiles in `tileSpriteCache` and blit via `ctx.drawImage` to maintain smooth 60 FPS rendering on mobile GPUs.

---

## 5. Top Header Bar, Level Countdown Timer, Unified Modal System & Pause State Manager

1. **Top Header Bar (`src/App.tsx`)**:
   - **Solid Dark Background & Single-Row Layout**: Always keep the header bar solid and dark (`relative z-30 pointer-events-auto bg-slate-900 border border-slate-800 whitespace-nowrap overflow-hidden`) so telemetry remains crisp and readable over moving game elements and the **Pause** button is 100% clickable/tappable on both Desktop and Mobile (`type="button"`, `onPointerDown={(e) => e.stopPropagation()}`, `touch-manipulation`). Never make the header bar transparent.
   - **Strict Modal Hiding Rule**: The Top Header Bar (and Boss Health Bar Banner) must **only** be rendered when `gameState === 'PLAYING'`. Whenever any modal (`PAUSED`, `LEVEL_COMPLETE`, `WORLD_VICTORY`, `GAME_OVER`, or `TIME_OUT`) is active, the main game header must be completely hidden so it never overlaps or shows through the modal background.
   - **Left-Side Telemetry Order (Strictly 4 Items)**:
     1. **Score**: `<Trophy />` icon + 6-digit zero-padded score (`000000`).
     2. **Coins**: Custom `<GoldCoinIcon />` SVG gold coin emblem + coin count (`×00`).
     3. **Level Countdown Timer**: Placed **directly next to Coins and before Health Hearts**, using the clock/timer icon (`<Coins />` from `lucide-react`) + `MM:SS` countdown (`pulsing red` when `≤ 30s`).
     4. **Health Hearts**:
        - **Desktop / PC (`!isMobileTouch`)**: Rendered as multiple individual `<Heart />` icons (up to 5 hearts, plus `×{hud.lives}` if `> 5`).
        - **Mobile Landscape Only (`isMobileTouch`)**: Replaced with a single heart icon and count (`♥ x3`, i.e., `<Heart />` + `x{hud.lives}`).
   - **Right-Side Controls**:
     1. **Level Indicator**: Formatted as `"World x-y"` (e.g., `World 1-1`) on both Desktop/PC and Mobile Landscape.
     2. **Action Button (Pause Only — No Audio Button in Header)**:
        - **Desktop / PC (`!isMobileTouch`)**: `<Pause />` icon + `"Pause"` label.
        - **Mobile Landscape Only (`isMobileTouch`)**: Minimal `<Pause />` icon button only (no `"Pause"` text).
   - **Removed / Forbidden Header Elements**:
     - Do **not** render an Audio/Sound toggle button in the Top Header Bar on either Mobile or Desktop/PC (Audio controls live exclusively in the **Settings Menu**).
     - Do **not** display raw power status text (such as `"POWER: SMALL"` or `"POWER: BIG"`) in the header.
     - Do **not** include a standalone Restart button in the header (Restart is available inside the Pause menu modal).
     - Do **not** place the countdown timer on the right side of the header.

2. **Level Countdown Timer & Reset Rules (`src/game/engine.ts`)**:
   - **Balanced Stage Duration (`getInitialLevelTime()`)**:
     - Standard stages: `180` seconds (`3:00`).
     - Secret Room / Key / Underwater stages (`hiddenRoom`, `requiresKey`, or `isUnderwater`): `210` seconds (`3:30`).
     - Boss stages (`hasBoss`): `240` seconds (`4:00`).
   - **Automatic Reset**: The timer automatically resets to full stage time whenever a level starts, restarts, progresses to a new level, respawns, or revives via rewarded ad.
   - **Timeout Handling**: If `timeRemaining` reaches `0` before reaching the goal, gameplay immediately stops (`isPaused = true`), stage music stops, the timeout chime plays, and `onTimeOut` transitions `gameState` to `'TIME_OUT'` (`"TIME UP!"` header).

3. **Unified Reusable Modal System (`StageOutcomeModal` in `src/App.tsx`) — Consistent Mobile Fit Across All 50 Levels**:
   - **Single Reusable Component**: All stage completion and failure states (`'stage_cleared'`, `'game_over'`, and `'time_out'`) across all 10 worlds (50 levels, including normal stages and `WORLD_VICTORY` boss stages) must render through the single `StageOutcomeModal` component.
   - **Consistent Mobile Landscape Sizing (`isMobileTouch` Prop)**:
     - Because mobile landscape viewports have widths `>= 640px`, never rely on Tailwind `sm:` breakpoints alone for modal card sizing (which would enlarge the modal to desktop dimensions in mobile landscape).
     - Instead, branch explicitly on `isMobileTouch` (`max-w-[300px] p-2.5 space-y-2` on mobile vs `max-w-md p-5 space-y-3.5` on desktop), use `overflow-hidden` on the modal overlay, render an inline `<Crown />` icon on mobile `isWorldVictory` modals, and apply `truncate` to stage/world titles and subtitles so every level across Worlds 1–10 fits the mobile screen with zero scrolling and identical compact dimensions.
     - Keep the center gameplay column's `maxWidth` (`isMobileTouch ? 'min(calc(100vw - 264px), calc((100dvh - 46px) * (896 / 608)))' : 'calc((100dvh - 52px) * (896 / 608))'`) consistent across `PLAYING`, `PAUSED`, and all outcome modal states so the canvas container never jumps in size when a modal opens.
   - **Stats Summary Box (Strictly Score & Coins Only)**:
     - The modal stats card must display **only 2 columns: `SCORE` and `COINS`**.
     - Do **not** display `TIME LEFT` on success or `STATUS` (`0s LEFT` / `0 LIVES`) on failure/timeout inside the modal.
   - **Mandatory 2-Row Button Layout across All Variants**:
     - **Row 1 (Primary, full-width)**:
       - `"Next Level ➔"` (for `'stage_cleared'`)
       - `"▶ Watch Ad & Revive"` (for `'game_over'` and `'time_out'`, triggering the rewarded video ad flow to refill 3 lives, reset the level countdown timer, and resume the stage).
       - **Clicked / Loading State (`isWatchingAd === true`)**: Whenever `"▶ Watch Ad & Revive"` is clicked, the button must display **only a spinning loading icon (`<Loader2 className="w-4 h-4 animate-spin shrink-0" />`) and `"Loading..."`** (never show long descriptive text like `"Playing Rewarded Ad... (Refilling 3 Lives)"`). This hook (`handleWatchAdAndRevive`) is ready for plugging in real AdMob Rewarded Ad Unit IDs (`window.AdMob` / `window.AndroidAdMob`) while falling back cleanly during testing.
     - **Row 2 (Secondary Grid - 2 buttons side-by-side)**:
       - `"Replay"` (for `'stage_cleared'`) or `"Try Again"` (for `'game_over'` / `'time_out'`) | `"Level Select"`.

4. **Pause State Manager (`src/App.tsx` & `src/game/audio.ts`)**:
   - When the game is paused (`gameState === 'PAUSED'`):
     - Immediately freeze the level countdown timer (`engineRef.current.setPaused(true)`).
     - Automatically suspend/mute all active Web Audio sound effects and background chiptune music (`soundManager.pauseAllAudio()`).
     - Hide the main game header bar while showing the Pause modal.
     - Render only the clean navigation buttons (`Resume Game`, `Restart`, `Level Select`, `Home Screen`) inside the Pause modal using `isMobileTouch`-aware compact sizing (`max-w-[280px] p-2.5 space-y-2` on mobile, `max-w-sm p-5 space-y-3.5` on desktop) and `overflow-hidden` (no Audio/Music/SFX buttons in the Pause modal and no vertical scrollbar on mobile).
     - Do **not** display the countdown timer inside the Pause modal.
   - When resuming (`gameState === 'PLAYING'`), unfreeze the engine (`setPaused(false)`) and resume audio (`soundManager.resumeAudio()`).

5. **Unified Non-Gameplay Menu Shell (`TITLE_MENU`, `WORLD_SELECT`, `LEVEL_SELECT`, `SETTINGS_HUB`, `SETTINGS`, `CONTROLS` in `src/App.tsx`) — Locked Viewport, Standardized Container Dimensions, Exact Gameplay Background & Ad Banner Placeholder**:
   - **Unified Screen Sizing & Locked Viewport Consistency (`isPrimaryMenuScreen`)**:
     - Define `isPrimaryMenuScreen = gameState === 'TITLE_MENU' || gameState === 'WORLD_SELECT' || gameState === 'LEVEL_SELECT' || gameState === 'SETTINGS_HUB' || gameState === 'SETTINGS' || gameState === 'CONTROLS'`.
     - Enforce `h-[100dvh] max-h-[100dvh] overflow-hidden` on the root wrapper and `flex-1 min-h-0 w-full p-2 sm:px-4 sm:py-6 overflow-hidden` on `<main>` across all non-gameplay menu screens (`TITLE_MENU`, `WORLD_SELECT`, `LEVEL_SELECT`, `SETTINGS_HUB`, `SETTINGS`, and `CONTROLS`).
     - Render all of these screens inside a **single shared outer container** (`w-full h-full max-w-4xl sm:max-h-[640px] flex flex-col justify-between overflow-hidden`) and a **single shared inner screen frame** (`relative flex-1 min-h-0 w-full rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl flex flex-col justify-between bg-slate-950`) with a **single persistent `<GameplayEnvironmentBackdrop />` instance**.
     - This guarantees **zero shifting, jumping, or resizing** of the main container or background when navigating between **Home** $\leftrightarrow$ **World Select** $\leftrightarrow$ **Level Select** $\leftrightarrow$ **Settings Hub (`SETTINGS_HUB`)** $\leftrightarrow$ **Audio Settings (`SETTINGS`)** $\leftrightarrow$ **Controls & Help (`CONTROLS`)** on both Desktop and Mobile.
     - Directly below the shared screen frame on mobile portrait (`sm:hidden`), maintain the consistent `50px` **Ad Banner Placeholder** (`#mobile-home-ad-banner-slot`, `data-ad-slot="HOME_BOTTOM_BANNER"`, `mt-1.5 w-full h-[50px] sm:hidden shrink-0 rounded-xl bg-slate-900/75 border border-slate-800/90 flex items-center justify-center px-3 shadow-inner` with label `"Ad Banner Space"`):
       - **Instructions for Replacing Placeholder with Real Ads (AdMob / AdSense ID)**: Locate `#mobile-home-ad-banner-slot` (`data-ad-slot="HOME_BOTTOM_BANNER"`) in `src/App.tsx` and either mount the web `<ins className="adsbygoogle" data-ad-client="ca-pub-..." data-ad-slot="..." />` tag inside this `50px` container or invoke the native mobile AdMob bridge (`window.AdMob?.showBannerAd?.({ adUnitId: 'ca-app-pub-.../...', position: 'BOTTOM_CENTER' })`) while keeping the `h-[50px] shrink-0` layout footprint intact so the main screen frame never shifts or overlaps the footer legal links.
   - **Exact Active Gameplay Background (`GameplayEnvironmentBackdrop` in `src/App.tsx`) — Locked Ground Floor & Zero Sky Overflow / Tiling**:
     - The **Home Screen (`TITLE_MENU`)**, **Select World Screen (`WORLD_SELECT`)**, **Level Selection Screen (`LEVEL_SELECT` across all worlds)**, and **Settings Screens (`SETTINGS_HUB`, `SETTINGS`, `CONTROLS`)** share the persistent `<GameplayEnvironmentBackdrop />` background layer (`absolute inset-0 w-full h-full block pixelated pointer-events-none select-none z-0`) inside the unified screen frame (`bg-slate-950`, never a sky-blue container background that could show below the ground).
     - `GameplayEnvironmentBackdrop` uses the **exact same rendering functions, assets, colors, and tiles** as active gameplay (`drawParallaxBackground(ctx, 'HILLS', 0, Math.max(CANVAS_WIDTH, canvasW), canvasH, 0)` and `drawTile(ctx, ..., 'HILLS', 0)` from `src/game/renderer.ts`):
       1. `'HILLS'` sky gradient (`#38bdf8` $\rightarrow$ `#7dd3fc` $\rightarrow$ `#bae6fd`), pixel clouds (`drawPixelCloud`), stepped 16-bit pixel hills (`drawPixelHill`), and pixel bushes (`drawPixelBush`). Passing `Math.max(CANVAS_WIDTH, canvasW)` as the parallax span width prevents clouds and hills from wrapping/repeating awkwardly on narrower mobile viewports.
       2. Exact `32×32` ground tiles sealed flush at the very bottom 3 rows (`ctx.fillRect(0, groundTopRow * TILE, canvasW, canvasH - groundTopRow * TILE)` with `#78350f` followed by `TileType.GROUND_TOP` at `row = 16` and `TileType.GROUND_DEEP` at `row = 17` and `row = 18` across `0 .. cols`) so blue sky never appears below the ground level.
       3. Exact floating `[TileType.BRICK, TileType.QUESTION_COIN, TileType.BRICK]` block formation on the left side (`row = 12`, 4 tiles above the ground).
       4. Exact 2×2 Green Warp Pipe (`TileType.PIPE_TOP_L`, `TileType.PIPE_TOP_R`, `TileType.PIPE_BODY_L`, `TileType.PIPE_BODY_R`) on the right side sitting flush on the `row = 16` ground.
     - It dynamically computes `cols = Math.max(11, Math.ceil((canvasH * aspect) / TILE))` from the container aspect ratio at `rows = 19` (`canvasH = 608`) via `ResizeObserver` so `32×32` tiles and sprites are never stretched or distorted on either Mobile Portrait or Desktop viewports, while keeping `"TOP SCORE"` on the top-left corner and `"COINS"` on the top-right corner opposite each other on the Home Screen.
   - **Clean, Compact Glassmorphic Title Card, Top Status Badges & Ground Bar**:
     - The top status strip container on the Home Screen must remain **100% transparent/invisible** (`bg-transparent border-0 shadow-none`) with the glassmorphic `"TOP SCORE"` badge on the top-left and `"COINS"` badge on the top-right (`bg-slate-950/55 backdrop-blur-md border border-white/30 rounded-xl shadow-lg font-pixel text-white`).
     - The central signboard title card (`bg-slate-950/55 backdrop-blur-md border-2 border-amber-400/85 rounded-2xl px-4 py-2.5 sm:px-8 sm:py-4 md:px-10 md:py-5 max-w-[300px] sm:max-w-lg`) must display **only** the main title `"CROWN OF EMERALDIA"` in `font-pixel`.
     - Do **not** render the `"16-BIT EDITION"` line or `<Crown />` icon inside the title card (on either mobile or desktop).
     - Do **not** render the `"Super Kingdom Platformer Adventure"` subtitle inside the title card.
     - Do **not** render the `"STAGE PROGRESS: X / 50 COMPLETED"` text line in the bottom ground bar on either mobile or desktop.
   - **Balanced Glassmorphic Home Screen Action Stack (`PLAY`, `STORE`, `SETTINGS`), Pixel Typography & Button Sound Feedback**:
     - Render the 3 balanced vertical buttons (`w-full max-w-[210px] sm:max-w-[260px]`) using sleek glassmorphic styling and `font-pixel` typography:
       - **PLAY**: `bg-emerald-500/65 hover:bg-emerald-500/80 backdrop-blur-md border-2 border-emerald-300/80 text-white font-pixel`
       - **STORE** (`<ShoppingBag />`): `bg-slate-950/55 hover:bg-slate-900/65 backdrop-blur-md border-2 border-white/25 hover:border-emerald-400/75 text-white font-pixel`
       - **SETTINGS** (`<Settings />`): `bg-slate-950/55 hover:bg-slate-900/65 backdrop-blur-md border-2 border-white/25 hover:border-amber-400/75 text-white font-pixel`
     - All three buttons (**PLAY**, **STORE**, and **SETTINGS**) must trigger `soundManager.playCoin()` when clicked on both mobile and desktop.
     - Clicking **STORE** triggers a glassmorphic in-game Toast notification at the top of the Home Screen displaying **"Store — Coming Soon!"** in `font-pixel`.
   - **Static Legal Pages (`/public/privacy-policy.html` & `/public/terms.html`) & Home Screen Footer Legal Links**:
     - Maintain the two responsive, dark-retro static HTML legal pages in `/public/privacy-policy.html` (Privacy Policy covering `localStorage` score/coins/progress, device info, and Google AdMob ads) and `/public/terms.html` (Terms of Service).
     - In the bottom ground strip of the Home Screen (`TITLE_MENU`), right above the `#mobile-home-ad-banner-slot` placeholder, render a **100% transparent** footer container (`bg-transparent border-0 shadow-none`, `style={{ backgroundColor: 'transparent' }}`) with clickable `"Privacy Policy"` and `"Terms of Service"` links (`href="#"`, styled in `font-pixel` to match the consistent pixel typography across the game without cluttering the UI).

6. **Select World (`WORLD_SELECT`), Level Selection (`LEVEL_SELECT`), and Settings Screens (`SETTINGS_HUB`, `SETTINGS`, `CONTROLS`) — Transparent Top Header Bar, Glassmorphic Cards & Buttons, Repositioned Section Titles, Horizontal World Carousel & 16-Bit Pixel Typography (`src/App.tsx`, `src/index.css`, `src/game/world_<W>/index.ts`)**:
   - **Completely Transparent / Invisible Top Header Bar & Matching Dark Glassmorphic Header Buttons/Cards**:
     - Across **all** screens (`TITLE_MENU`, `WORLD_SELECT`, `LEVEL_SELECT`, `SETTINGS_HUB`, `SETTINGS`, and `CONTROLS`), the top header bar container itself must be **100% transparent/invisible** (`bg-transparent border-0 shadow-none`).
     - All navigation buttons inside the header (`HOME`, `WORLDS`, `BACK`) must use the **exact same dark glassmorphic background and border** as the World/Level cards and the Home Screen `STORE`/`SETTINGS` buttons (`bg-slate-950/55 hover:bg-slate-900/65 backdrop-blur-md border-2 border-white/25 rounded-xl shadow-md`, never a light `bg-white/15` background) while keeping their exact positions and dimensions untouched.
     - On the **Select World (`WORLD_SELECT`)** screen, render **only** the `HOME` button on the top-left of the transparent header — **never** render an extra score badge/card on the top-right of the Select World header.
     - Apply sleek glassmorphic frosted-glass styling (`bg-slate-950/55 hover:bg-slate-900/65 backdrop-blur-md border-2` with translucent borders) to all cards and panels across `TITLE_MENU`, `WORLD_SELECT`, `LEVEL_SELECT`, `SETTINGS_HUB`, `SETTINGS`, and `CONTROLS`.
   - **Repositioned Prominent Section Titles (Extracted Below Header)**:
     - Do **not** place `"SELECT WORLD"` (or the matching screen titles `"WORLD X: ..."`, `"SETTINGS"`, `"AUDIO SETTINGS"`, `"CONTROLS & HELP"`) inside the top navigation header bar.
     - Instead, extract the section title out of the top header and render it cleanly **right below the header and directly above the cards/content stack** inside a centered glassmorphic signboard pill (`px-5 py-2 sm:px-7 sm:py-2.5 rounded-2xl bg-slate-950/55 backdrop-blur-md border-2 border-amber-400/85 shadow-xl`).
   - **Horizontal Scrolling World Carousel & Zero Visible Scrollbars (`no-scrollbar`)**:
     - Render the 10 World cards on `WORLD_SELECT` inside a smooth horizontal scrolling carousel (`flex-1 min-h-0 w-full flex flex-row items-center gap-4 sm:gap-5 overflow-x-auto overflow-y-hidden no-scrollbar snap-x snap-mandatory touch-pan-x`) with touch swipe, mouse-wheel horizontal scrolling (`onWheel`), and pointer drag scrolling (`worldCarouselDragRef`).
     - Ensure **no scrollbars** (neither horizontal nor vertical) are ever visible on the screen by applying `.no-scrollbar` (`scrollbar-width: none; -ms-overflow-style: none; ::-webkit-scrollbar { display: none; }`).
   - **Vertical 4-Line World Card Stack (`Number -> Name -> Stages -> Score`) & Consistent `font-pixel` Typography**:
     - Every `WORLD_<W>` definition must set `name` strictly to the clean `[Kingdom / Region Name]` (e.g., `'Emeraldia Kingdom'`, `'Sapphire Ocean'`, `'Sunscorch Desert'`, `'Shadowveil Kingdom'`) without any `'WORLD X'` duplicate or `'World X:'` prefix.
     - Apply the retro 16-bit pixel font (`font-pixel`) consistently across all text, buttons, titles, and card elements on `TITLE_MENU`, `WORLD_SELECT`, and matching navigation screens.
     - Every world card (`shrink-0 w-[210px] sm:w-[236px] min-h-[205px] sm:min-h-[230px] snap-center`) must strictly follow this vertical stack hierarchy:
       1. **Number**: `WORLD X` (`font-pixel text-sm sm:text-base` in the matching world theme color).
       2. **Name**: `[KINGDOM / REGION NAME]` (`font-pixel text-[10px] sm:text-xs text-white`).
       3. **Stages**: `X/5 STAGES` (`font-pixel text-[9px] sm:text-[10px]` in the matching world theme color).
       4. **Score**: `SCORE: ...` (`font-pixel text-[9px] sm:text-[10px] text-amber-200`).

7. **Boss Health Scaling Formula (`getBossMaxHpForWorld` in `src/game/engine.ts`)**:
   - All boss stages (`hasBoss: true`) must dynamically compute boss hit points (`hp` and `maxHp`) from the active `worldNumber` using the progressive stepping formula:
     $$\text{maxHp} = 3 + \left\lfloor \frac{\text{worldNumber} - 1}{2} \right\rfloor \times 2$$
   - **Mandatory Hit Progression Table**:
     - **World 1–2**: `3` hits
     - **World 3–4**: `5` hits
     - **World 5–6**: `7` hits
     - **World 7–8**: `9` hits
     - **World 9–10**: `11` hits
     - **Future Worlds > 10**: Continue adding `+2` hits after every 2 worlds (e.g., World 11–12 = `13` hits, World 13–14 = `15` hits).
   - Multi-phase boss escalation thresholds (`bossEnraged` at $\le 65\%$ HP, `bossOverdrive` at $\le 35\%$ HP) and the Boss Health Bar UI (`HP: hp/maxHp`) must always scale dynamically from `boss.maxHp`.

8. **Adding Future Worlds & Levels**:
   - Whenever new worlds (`world_11/`, `world_12/`, etc.) or levels are added in the future, strictly preserve all rules in this file:
     - Modular `src/game/world_<W>/level_<L>.ts` structure, clean `name` (no `"World X:"` prefix), and registration in `src/game/levels.ts`.
     - Ground alignment (`goalY: 6 * 32` for standard/boss flagpoles on row `16` ground; `goalY: 13 * 32` for locked doors with `requiresKey: true`).
     - Minimum 3–4 tiles vertical clearance under/above Question Blocks and power-up randomization rules.
     - Progressive Boss Health Scaling Formula (`getBossMaxHpForWorld(worldNumber)`).
     - Desktop/PC Keyboard-Only Rule (never show touch controllers on desktop) and Mobile Landscape Side-Margin Touch Controllers (Left two-part Virtual Joystick / Thumbstick and Right separated Action Buttons `🔥`, `↑` in a 100% transparent container placed in the left/right empty side margins outside the gameplay canvas).
     - Mobile Dynamic Auto-Orientation (`lockMobileLandscape()` when entering any level, `unlockMobileToPortrait()` when exiting to menus/World Select, with zero forced rotation warning modals).
     - Unified Locked Primary Screen Shell (`isPrimaryMenuScreen`: `TITLE_MENU`, `WORLD_SELECT`, `LEVEL_SELECT`, `SETTINGS_HUB`, `SETTINGS`, and `CONTROLS` sharing the exact same locked `100dvh` / `max-w-4xl` container and persistent `<GameplayEnvironmentBackdrop />`), 100% transparent/invisible top header bar containers across all screens (with no score badge in the `WORLD_SELECT` header), matching dark glassmorphic header buttons (`bg-slate-950/55 hover:bg-slate-900/65 backdrop-blur-md border-2 border-white/25`), glassmorphic cards/buttons and Home Screen elements with repositioned section titles below the header, scrollbar-free horizontal World Select carousel (`no-scrollbar`) with vertical 4-item card stack (`Number -> Name -> Stages -> Score`) in `font-pixel`, exact Top Header Bar layout during active gameplay, button sound rules, 100% transparent footer legal links (`Privacy Policy` & `Terms of Service` with `/public/privacy-policy.html` and `/public/terms.html`), Mobile Portrait Ad Banner Placeholder (`#mobile-home-ad-banner-slot`), Level Countdown Timer rules, Pause State Manager, and Unified `StageOutcomeModal` (`isMobileTouch` compact sizing across all levels, `SCORE` and `COINS` only, with `<Loader2 />` + `"Loading..."` when `"▶ Watch Ad & Revive"` is clicked).

---

## 9. Expo / React Native Mobile Migration & Google AdMob Integration (`react-native-game/` — Expo SDK 58)

The complete web platformer is cloned and packaged into a standalone **Expo SDK 58 (`58.0.25`) / React Native `0.88.1` / React `19.3.0`** mobile project inside `/react-native-game/` with native **Google AdMob (`react-native-google-mobile-ads@17.4.0`)** Banner and Rewarded Ads (full usage instructions in `/react-native-game/README.md`). Future AI agents modifying either the web game or the mobile app must adhere to these rules:

1. **Project Directory, Locked SDK 58 Versions & Structure (`/react-native-game/`)**:
   - **Locked Expo SDK 58 Stack (`react-native-game/package.json`)**:
     - `expo`: `58.0.25`, `expo-dev-client`: `58.0.20`
     - `react`: `19.3.0`, `react-dom`: `19.3.0`, `react-native`: `0.88.1`
     - `react-native-google-mobile-ads`: `17.4.0` (**CRITICAL for Gradle / AGP 8+ & RN 0.88.1 New Architecture**: Never downgrade to `14.x` or `15.x`, which lack `namespace = "io.invertase.googlemobileads"`, use deprecated Groovy space-assignment in `build.gradle`, and fail during the EAS `Run gradlew` step on React Native `0.88.1` / `compileSdk 36`).
     - `react-native-safe-area-context`: `5.11.1`
     - `react-native-webview`: `14.0.1`
     - `@react-native-async-storage/async-storage`: `2.2.0`
     - `expo-screen-orientation`: `58.0.4`, `expo-navigation-bar`: `58.0.4`, `expo-splash-screen`: `58.0.14`, `expo-status-bar`: `58.0.5`, `expo-asset`: `58.0.21`, `expo-constants`: `58.0.16`, `typescript`: `6.0.3`
   - **Environment Configuration (`react-native-game/.env`, `react-native-game/.env.example`, & `react-native-game/eas.json`)**:
     - Isolated inside `react-native-game/` (separate from the root web project) and configured with official Google AdMob test IDs for Android and iOS:
       - `EXPO_PUBLIC_ADMOB_ANDROID_APP_ID=ca-app-pub-3940256099942544~3375010800`
       - `EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID=ca-app-pub-3940256099942544/6300978111`
       - `EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_ID=ca-app-pub-3940256099942544/5224354917`
       - `EXPO_PUBLIC_ADMOB_IOS_APP_ID=ca-app-pub-3940256099942544~1458002511`
       - `EXPO_PUBLIC_ADMOB_IOS_BANNER_ID=ca-app-pub-3940256099942544/2934735716`
       - `EXPO_PUBLIC_ADMOB_IOS_REWARDED_ID=ca-app-pub-3940256099942544/1712485313`
     - These environment variables are also embedded in the `development` and `preview` profiles of `react-native-game/eas.json` (`"developmentClient": true`, `"distribution": "internal"`, `"android": { "buildType": "apk" }`) so cloud EAS builds always have the App IDs available during prebuild.
   - **Dual Expo Plugin Config (`react-native-game/app.json` & `react-native-game/app.config.js`)**:
     - `app.config.js` reads `process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID` and `process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID` and injects them into the `react-native-google-mobile-ads` config plugin (`androidAppId`, `iosAppId`, `delayAppMeasurementInit: true`, `optimizeInitialization: true`, `optimizeAdLoading: true`).
     - `app.json` also includes the `"react-native-google-mobile-ads"` plugin entry inside `expo.plugins` with the official test App IDs (`androidAppId`, `iosAppId`, `delayAppMeasurementInit: true`, `optimizeInitialization: true`, `optimizeAdLoading: true`), while keeping `"expo"` as the sole root key in `app.json` so `@expo/config` emits zero root-object warnings during `expo prebuild` and EAS builds.
   - **Native AdMob Modules (`react-native-game/src/ads/`)**:
     - `admobConfig.ts`: Selects the Android or iOS Banner and Rewarded Ad Unit IDs from `process.env.EXPO_PUBLIC_ADMOB_*` with official Google test ID fallbacks.
     - `AdBannerSlot.tsx` & `AdBannerSlot.web.tsx`: Mounts `<BannerAd unitId={...} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />` in the bottom mobile menu slot when `visible={isMenuScreen}` is true, hides it completely during active gameplay (`PLAYING`, `PAUSED`, `LEVEL_COMPLETE`, `WORLD_VICTORY`, `GAME_OVER`, `TIME_OUT`), and uses a clean no-op on Web (`AdBannerSlot.web.tsx`). Inside `src/App.tsx`, `#mobile-home-ad-banner-slot` is hidden when `isNativeExpoApp` is true so the native `<AdBannerSlot />` occupies that bottom slot without duplication.
     - `rewardedAdManager.ts` & `rewardedAdManager.web.ts`: Initializes `mobileAds().initialize()`, preloads `RewardedAd.createForAdRequest(...)`, and handles the `"Watch Ad & Revive"` flow when the game engine posts `{ type: 'SHOW_REWARDED_AD' }` upon `GAME_OVER` or `TIME_OUT`. When `RewardedAdEventType.EARNED_REWARD` completes and the ad closes, `react-native-game/App.tsx` dispatches `buildRewardedAdResultScript(true)` (`REWARDED_AD_RESULT`) back to the engine to refill 3 lives, reset the stage timer, and resume gameplay.
   - **Root `tsconfig.json` Isolation**: Keep `"react-native-game"` in the `"exclude"` array of the root `/tsconfig.json` so web `tsc --noEmit` and Vite builds remain isolated from React Native types.

2. **EAS Development Client Workflow & Rebuilding the Offline Bundle**:
   - Because `react-native-google-mobile-ads` contains custom native binaries, standard Expo Go cannot run it directly. Always use a custom Expo Development Build (`expo-dev-client`):
     1. Log in to EAS: `npx eas login`
     2. Build a development APK in the cloud: `npx eas build --profile development --platform android`
     3. Install the generated `.apk` on an Android device/emulator and start the server with: `npx expo start --dev-client`
   - Whenever `src/` in the root project is updated, sync `src/App.tsx` to `react-native-game/src/App.tsx`, run `npm run build` in the root, and run `npm run bundle:game` (`node ./scripts/build-inline-bundle.mjs`) inside `react-native-game/` to regenerate `react-native-game/src/bundle/inlineGameHtml.ts` and `react-native-game/assets/game-bundle.html`, then verify with `tsc --noEmit`.

3. **Zero-Lag 60+ FPS Native Performance**:
   - The Expo `WebView` must always run with `androidLayerType="hardware"`, `overScrollMode="never"`, `bounces={false}`, `scrollEnabled={false}`, `scalesPageToFit={false}`, `mediaPlaybackRequiresUserAction={false}`, and `allowsInlineMediaPlayback={true}`.

4. **Native Android Hardware & Gesture Back Button (`handleAndroidBackPress` in `src/App.tsx` & `BackHandler` in `react-native-game/App.tsx`)**:
   - Pressing the Android hardware/software Back button must never abruptly close the app while navigating menus or playing a stage. Follow this exact routing hierarchy:
     - `PLAYING` $\rightarrow$ Pauses the game (`PAUSED`, freezes timer, pauses audio).
     - `PAUSED` $\rightarrow$ Resumes the game (`PLAYING`, unpauses audio).
     - `LEVEL_COMPLETE` / `WORLD_VICTORY` / `GAME_OVER` / `TIME_OUT` $\rightarrow$ Navigates to `LEVEL_SELECT` (and unlocks to Portrait).
     - `SETTINGS` / `CONTROLS` $\rightarrow$ Navigates to `SETTINGS_HUB`.
     - `LEVEL_SELECT` $\rightarrow$ Navigates to `WORLD_SELECT`.
     - `WORLD_SELECT` / `SETTINGS_HUB` $\rightarrow$ Navigates to `TITLE_MENU` (Home Screen).
     - `TITLE_MENU` (Root Home Screen) $\rightarrow$ Posts `BACK_AT_ROOT` to React Native, which displays `"Press Back again to exit Crown of Emeraldia"` (`ToastAndroid.SHORT`) and exits only on a second press within 2 seconds.

5. **Google Play Store Icon & Splash Screen Assets (Strict Valid PNG Requirement for Android AAPT2)**:
   - All `.png` files inside `react-native-game/assets/` (`icon.png` 1024×1024, `adaptive-icon.png` 1024×1024, `playstore-icon-512.png` 512×512, `splash-icon.png` 1080×1920, `favicon.png` 48×48) MUST be genuine PNG-encoded files (`89 50 4E 47 0D 0A 1A 0A` header). Never copy JPEG files with a `.png` extension, as Android's AAPT2 resource compiler (`:app:mergeDebugResources` during `Run gradlew`) strictly validates PNG magic bytes and fails the build if a `.png` resource contains JPEG data.

