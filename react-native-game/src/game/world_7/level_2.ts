import {
  LevelDefinition,
  HiddenRoomDefinition,
  TileType,
  CoinDef,
  EnemySpawnDef,
  MovingPlatformDef,
  SteamVentDef,
  CrusherPistonDef,
} from '../types';
import {
  createEmptyGrid,
  fillGroundRange,
  addPipe,
  addStairs,
  addCoinRow,
  addConveyorBelt,
  addTempCogBridge,
  addWarpPipe,
} from '../level_builder';

function buildFactoryHiddenRoom(): HiddenRoomDefinition {
  const cols = 42;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];
  const steamVents: SteamVentDef[] = [];
  const crusherPistons: CrusherPistonDef[] = [];

  // Enclosed Sub-Factory Vault Ceiling & Walls
  for (let c = 0; c < cols; c++) {
    grid[0][c] = TileType.SOLID_STONE;
    grid[1][c] = TileType.SOLID_STONE;
  }
  for (let r = 0; r < 16; r++) {
    grid[r][0] = TileType.SOLID_STONE;
    grid[r][cols - 1] = TileType.SOLID_STONE;
  }

  // Entry Deck (Cols 1 - 10)
  fillGroundRange(grid, 0, 10, 16);
  grid[12][6] = TileType.QUESTION_MUSHROOM;
  addCoinRow(coins, 'w7_2_hr', 4, 5, 14);

  // Conveyor & Steam Vent Trench (Cols 12 - 24)
  fillGroundRange(grid, 12, 24, 16);
  addConveyorBelt(grid, 13, 18, 16, 'LEFT');
  steamVents.push({ col: 19, baseRow: 16, peakRow: 11, cycleSeconds: 3.4, phaseOffset: 0.5 });
  addConveyorBelt(grid, 20, 23, 16, 'RIGHT');
  addCoinRow(coins, 'w7_2_hr', 14, 5, 12);
  enemies.push({ id: 'w7_2_hr_e1', type: 'BEETLE', x: 16 * 32, y: 15 * 32 });

  // Hydraulic Crusher & Elevated Key Pedestal (Cols 25 - 40)
  fillGroundRange(grid, 25, 41, 16);
  crusherPistons.push({ col: 27, topRow: 2, crushRow: 15, cycleSeconds: 3.2, phaseOffset: 0.0 });
  enemies.push({ id: 'w7_2_hr_e2', type: 'KNIGHT', x: 30 * 32, y: 15 * 32 });

  // Golden Key Pedestal at Cols 31 - 33, Row 13
  grid[13][31] = TileType.SOLID_STONE;
  grid[13][32] = TileType.SOLID_STONE;
  grid[13][33] = TileType.SOLID_STONE;
  addCoinRow(coins, 'w7_2_hr', 31, 3, 9);

  // Exit Warp Pipe back to Parent Level at Col 36
  addWarpPipe(grid, 36, 16, 2);

  return {
    name: 'Hidden Vault: Sub-Factory Boiler',
    theme: 'FORGOTTEN_FACTORY',
    widthInTiles: cols,
    heightInTiles: 19,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    steamVents,
    crusherPistons,
    playerStart: { x: 3 * 32, y: 14 * 32 },
    keyPosition: { x: 32 * 32 + 4, y: 11 * 32 + 4 },
    exitPipeCol: 36,
    exitPipeTopRow: 14,
    entrancePipeCol: 61,
    entrancePipeTopRow: 8,
    returnPosition: { x: 63 * 32 + 8, y: 8 * 32 },
  };
}

function buildWorld7Level2(): LevelDefinition {
  const cols = 136;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];
  const steamVents: SteamVentDef[] = [];
  const crusherPistons: CrusherPistonDef[] = [];

  // 1. Factory Entry Yard & Steam Pipes (Cols 0 - 22)
  fillGroundRange(grid, 0, 22, 16);
  grid[12][7] = TileType.BRICK;
  grid[12][8] = TileType.QUESTION_MUSHROOM; // Early Power-up
  grid[12][9] = TileType.BRICK;
  addCoinRow(coins, 'w7_2', 7, 4, 9);

  addPipe(grid, 14, 16, 2);
  steamVents.push({ col: 18, baseRow: 16, peakRow: 11, cycleSeconds: 3.6, phaseOffset: 0.0 });
  enemies.push({ id: 'w7_2_e1', type: 'SLIME', x: 11 * 32, y: 15 * 32 });
  enemies.push({ id: 'w7_2_e2', type: 'BEETLE', x: 20 * 32, y: 15 * 32 });

  // 2. Hydraulic Crusher Assembly Line (Cols 25 - 48)
  fillGroundRange(grid, 25, 48, 16);
  for (let c = 28; c <= 45; c++) {
    grid[2][c] = TileType.SOLID_STONE; // Overhead Factory Girders for Crushers
  }
  addConveyorBelt(grid, 27, 35, 16, 'RIGHT');
  crusherPistons.push({ col: 30, topRow: 3, crushRow: 15, cycleSeconds: 3.1, phaseOffset: 0.0 });
  crusherPistons.push({ col: 34, topRow: 3, crushRow: 15, cycleSeconds: 3.1, phaseOffset: 1.5 });
  addCoinRow(coins, 'w7_2', 28, 6, 13);

  addConveyorBelt(grid, 38, 45, 16, 'LEFT');
  crusherPistons.push({ col: 41, topRow: 3, crushRow: 15, cycleSeconds: 2.9, phaseOffset: 0.8 });
  grid[11][46] = TileType.QUESTION_FIRE; // Second Power-up Block
  enemies.push({ id: 'w7_2_e3', type: 'KNIGHT', x: 44 * 32, y: 15 * 32 });

  // 3. Concealed Upper Factory Alcove with Hidden Room Entrance Pipe (Cols 50 - 68)
  fillGroundRange(grid, 51, 68, 16);
  steamVents.push({ col: 54, baseRow: 16, peakRow: 11, cycleSeconds: 3.4, phaseOffset: 1.1 });

  // Stepping ledges leading up to the Concealed Entrance Pipe at Col 61, Row 8
  grid[13][52] = TileType.SOLID_STONE;
  grid[13][53] = TileType.SOLID_STONE;
  addConveyorBelt(grid, 55, 58, 11, 'RIGHT');
  for (let c = 59; c <= 65; c++) {
    grid[10][c] = TileType.SOLID_STONE;
  }
  // Concealed Entrance Warp Pipe sitting on the Row 10 alcove deck (Top at Row 8, Cols 61-62)
  addWarpPipe(grid, 61, 10, 2);
  addCoinRow(coins, 'w7_2', 60, 4, 6);

  enemies.push({ id: 'w7_2_e4', type: 'SLIME', x: 58 * 32, y: 15 * 32 });
  enemies.push({ id: 'w7_2_e5', type: 'BAT', x: 64 * 32, y: 13 * 32, patrolRange: 90 });

  // 4. Checkpoint & Dual Steam-Conveyor Chasm (Cols 71 - 102)
  fillGroundRange(grid, 71, 79, 16);
  const checkpoint = { x: 74 * 32, y: 14 * 32 };

  movingPlatforms.push({
    id: 'w7_2_mp1',
    x: 81 * 32,
    y: 14 * 32,
    width: 96,
    endX: 88 * 32,
    endY: 11 * 32,
    speed: 100,
  });
  addCoinRow(coins, 'w7_2', 83, 4, 10);

  fillGroundRange(grid, 91, 104, 16);
  addConveyorBelt(grid, 92, 97, 16, 'LEFT');
  grid[15][98] = TileType.GEAR_HAZARD;
  steamVents.push({ col: 101, baseRow: 16, peakRow: 10, cycleSeconds: 3.2, phaseOffset: 0.4 });
  grid[11][95] = TileType.QUESTION_FEATHER; // Third Power-up Block
  enemies.push({ id: 'w7_2_e6', type: 'BEETLE', x: 96 * 32, y: 15 * 32 });

  // 5. Final Crusher Corridor & Locked Mechanical Exit Door (Cols 107 - 135)
  addTempCogBridge(grid, 106, 109, 14);
  fillGroundRange(grid, 111, 135, 16);

  for (let c = 113; c <= 123; c++) {
    grid[2][c] = TileType.SOLID_STONE;
  }
  crusherPistons.push({ col: 115, topRow: 3, crushRow: 15, cycleSeconds: 2.8, phaseOffset: 0.2 });
  crusherPistons.push({ col: 120, topRow: 3, crushRow: 15, cycleSeconds: 2.8, phaseOffset: 1.6 });
  addCoinRow(coins, 'w7_2', 115, 6, 13);
  enemies.push({ id: 'w7_2_e7', type: 'KNIGHT', x: 124 * 32, y: 15 * 32 });

  addStairs(grid, 125, 16, 3, true);

  // Solid Vault Bulkhead Wall behind the Locked Mechanical Exit Door at Cols 132-135
  // Prevents jumping, Raccoon-flying, or clipping past the locked door!
  for (let r = 0; r < 16; r++) {
    grid[r][132] = TileType.SOLID_STONE;
    grid[r][133] = TileType.SOLID_STONE;
    grid[r][134] = TileType.SOLID_STONE;
    grid[r][135] = TileType.SOLID_STONE;
  }

  return {
    id: 32,
    worldId: 7,
    stageNumber: 2,
    name: 'Level 2: The Forgotten Factory',
    subtitle: 'Hydraulic Crushers, Steam Vents, Secret Vault & Locked Blast Door',
    theme: 'FORGOTTEN_FACTORY',
    musicTrack: 'CHRONOS',
    requiresKey: true,
    hiddenRoom: buildFactoryHiddenRoom(),
    steamVents,
    crusherPistons,
    widthInTiles: cols,
    heightInTiles: 19,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    checkpoint,
    goalX: 130 * 32,
    goalY: 13 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}

export const world7Level2: LevelDefinition = buildWorld7Level2();
