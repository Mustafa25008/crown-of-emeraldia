import {
  LevelDefinition,
  HiddenRoomDefinition,
  TileType,
  CoinDef,
  EnemySpawnDef,
  MovingPlatformDef,
  SwingingPendulumDef,
  TeleporterPairDef,
} from '../types';
import {
  createEmptyGrid,
  fillGroundRange,
  addStairs,
  addCoinRow,
  addConveyorBelt,
  addTempCogBridge,
  addWarpPipe,
} from '../level_builder';

function buildDimensionHiddenRoom(): HiddenRoomDefinition {
  const cols = 44;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];
  const swingingPendulums: SwingingPendulumDef[] = [];

  // Temporal Sanctum Frame
  for (let c = 0; c < cols; c++) {
    grid[0][c] = TileType.SOLID_STONE;
  }
  for (let r = 0; r < 16; r++) {
    grid[r][0] = TileType.SOLID_STONE;
    grid[r][cols - 1] = TileType.SOLID_STONE;
  }

  // Sanctum Entry Platform (Cols 1 - 10)
  fillGroundRange(grid, 0, 10, 16);
  grid[12][6] = TileType.QUESTION_MUSHROOM;
  addCoinRow(coins, 'w7_4_hr', 4, 5, 14);

  // Disappearing Cog Stepping Stones & Swinging Pendulum (Cols 12 - 26)
  addTempCogBridge(grid, 12, 15, 14);
  addCoinRow(coins, 'w7_4_hr', 12, 4, 12);

  fillGroundRange(grid, 17, 25, 16);
  swingingPendulums.push({
    pivotCol: 21,
    pivotRow: 2,
    lengthPx: 10 * 32,
    maxAngleRad: 0.56,
    speed: 2.3,
    phaseOffset: 0.3,
  });
  enemies.push({ id: 'w7_4_hr_e1', type: 'BEETLE', x: 19 * 32, y: 15 * 32 });
  enemies.push({ id: 'w7_4_hr_e2', type: 'BAT', x: 24 * 32, y: 9 * 32, patrolRange: 75 });

  // Shifting Platform to the Elevated Golden Key Altar (Cols 27 - 35)
  movingPlatforms.push({
    id: 'w7_4_hr_mp1',
    x: 27 * 32,
    y: 14 * 32,
    width: 80,
    endX: 30 * 32,
    endY: 11 * 32,
    speed: 95,
  });

  // Golden Key Altar at Cols 32 - 35, Row 11 + Ground Deck below (Cols 31 - 43)
  fillGroundRange(grid, 31, 43, 16);
  for (let c = 32; c <= 35; c++) {
    grid[11][c] = TileType.SOLID_STONE;
  }
  addCoinRow(coins, 'w7_4_hr', 32, 4, 7);
  enemies.push({ id: 'w7_4_hr_e3', type: 'KNIGHT', x: 34 * 32, y: 15 * 32 });

  // Exit Warp Pipe back to Parent Level at Col 38
  addWarpPipe(grid, 38, 16, 2);

  return {
    name: 'Hidden Sanctum: Temporal Core',
    theme: 'LOST_DIMENSION',
    widthInTiles: cols,
    heightInTiles: 19,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    swingingPendulums,
    playerStart: { x: 3 * 32, y: 14 * 32 },
    keyPosition: { x: 33 * 32 + 12, y: 9 * 32 + 4 },
    exitPipeCol: 38,
    exitPipeTopRow: 14,
    entrancePipeCol: 93,
    entrancePipeTopRow: 7,
    returnPosition: { x: 95 * 32 + 8, y: 7 * 32 },
  };
}

function buildWorld7Level4(): LevelDefinition {
  const cols = 138;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];
  const teleporters: TeleporterPairDef[] = [];

  // 1. Dimensional Rift Entry & Disappearing Bridges (Cols 0 - 22)
  fillGroundRange(grid, 0, 16, 16);
  grid[12][7] = TileType.BRICK;
  grid[12][8] = TileType.QUESTION_MUSHROOM; // Early Power-up
  grid[12][9] = TileType.BRICK;
  addCoinRow(coins, 'w7_4', 7, 4, 9);
  enemies.push({ id: 'w7_4_e1', type: 'SLIME', x: 13 * 32, y: 15 * 32 });

  addTempCogBridge(grid, 18, 21, 14);
  addCoinRow(coins, 'w7_4', 18, 4, 12);

  // 2. First Temporal Teleporter Section (Cols 23 - 52)
  fillGroundRange(grid, 23, 37, 16);
  addConveyorBelt(grid, 26, 32, 16, 'LEFT');
  grid[15][29] = TileType.GEAR_HAZARD;
  enemies.push({ id: 'w7_4_e2', type: 'BEETLE', x: 33 * 32, y: 15 * 32 });

  // Teleporter Pad #1 at Col 35, Row 16 -> warps across the sealed chasm to Col 43, Row 12
  teleporters.push({
    id: 'tp_rift_1',
    fromCol: 35,
    fromRow: 16,
    toCol: 43,
    toRow: 12,
  });
  // Also provide a high-skill moving platform path so players have multiple ways across
  movingPlatforms.push({
    id: 'w7_4_mp1',
    x: 38 * 32,
    y: 15 * 32,
    width: 80,
    endX: 41 * 32,
    endY: 12 * 32,
    speed: 105,
  });

  for (let c = 42; c <= 48; c++) {
    grid[12][c] = TileType.SOLID_STONE;
  }
  addCoinRow(coins, 'w7_4', 43, 5, 10);
  grid[8][46] = TileType.QUESTION_FIRE; // Second Power-up Block

  // 3. Shifting Dimension Platforms & Checkpoint (Cols 50 - 76)
  addTempCogBridge(grid, 50, 53, 13);
  fillGroundRange(grid, 55, 66, 16);
  grid[13][60] = TileType.SOLID_STONE;
  enemies.push({ id: 'w7_4_fb1', type: 'FIRE_BAR', x: 60 * 32 + 16, y: 13 * 32 + 16 });
  enemies.push({ id: 'w7_4_e3', type: 'KNIGHT', x: 64 * 32, y: 15 * 32 });

  fillGroundRange(grid, 69, 77, 16);
  const checkpoint = { x: 72 * 32, y: 14 * 32 };

  // 4. Dual-Path Temporal Skyway & Concealed Entrance Pipe to Hidden Room #2 (Cols 78 - 102)
  fillGroundRange(grid, 78, 84, 16);
  // Teleporter Pad #2 at Col 81, Row 16 -> warps up to the Upper Dimensional Skyway at Col 87, Row 9!
  teleporters.push({
    id: 'tp_rift_2',
    fromCol: 81,
    fromRow: 16,
    toCol: 87,
    toRow: 9,
  });

  // Lower path & stepping platforms (so players can also reach the upper skyway by jumping)
  fillGroundRange(grid, 86, 102, 16);
  addConveyorBelt(grid, 88, 95, 16, 'LEFT');
  grid[13][85] = TileType.SOLID_STONE;
  grid[11][86] = TileType.SOLID_STONE;

  // Upper Dimensional Skyway Deck (Cols 87 - 97, Row 9) holding the Concealed Entrance Warp Pipe!
  for (let c = 87; c <= 97; c++) {
    grid[9][c] = TileType.SOLID_STONE;
  }
  addWarpPipe(grid, 93, 9, 2); // Top of Warp Pipe at Row 7, Cols 93-94
  addCoinRow(coins, 'w7_4', 88, 4, 7);
  grid[12][99] = TileType.QUESTION_FEATHER; // Third Power-up Block

  enemies.push({ id: 'w7_4_e4', type: 'BAT', x: 89 * 32, y: 6 * 32, patrolRange: 90 });
  enemies.push({ id: 'w7_4_e5', type: 'BEETLE', x: 96 * 32, y: 15 * 32 });

  // 5. Final Shifting Gauntlet & Locked Mechanical Exit Door (Cols 105 - 137)
  addTempCogBridge(grid, 104, 107, 14);
  movingPlatforms.push({
    id: 'w7_4_mp2',
    x: 109 * 32,
    y: 14 * 32,
    width: 96,
    endX: 115 * 32,
    endY: 12 * 32,
    speed: 110,
  });
  addCoinRow(coins, 'w7_4', 110, 5, 10);

  fillGroundRange(grid, 118, 137, 16);
  addConveyorBelt(grid, 120, 125, 16, 'LEFT');
  grid[15][122] = TileType.GEAR_HAZARD;
  enemies.push({ id: 'w7_4_e6', type: 'KNIGHT', x: 127 * 32, y: 15 * 32 });

  addStairs(grid, 128, 16, 3, true);

  // Solid Vault Bulkhead Wall behind the Locked Mechanical Exit Door at Cols 134-137
  for (let r = 0; r < 16; r++) {
    grid[r][134] = TileType.SOLID_STONE;
    grid[r][135] = TileType.SOLID_STONE;
    grid[r][136] = TileType.SOLID_STONE;
    grid[r][137] = TileType.SOLID_STONE;
  }

  return {
    id: 34,
    worldId: 7,
    stageNumber: 4,
    name: 'Level 4: The Lost Dimension',
    subtitle: 'Temporal Teleporters, Shifting Pathways, Secret Sanctum & Locked Gate',
    theme: 'LOST_DIMENSION',
    musicTrack: 'CHRONOS',
    requiresKey: true,
    hiddenRoom: buildDimensionHiddenRoom(),
    teleporters,
    widthInTiles: cols,
    heightInTiles: 19,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    checkpoint,
    goalX: 132 * 32,
    goalY: 13 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}

export const world7Level4: LevelDefinition = buildWorld7Level4();
