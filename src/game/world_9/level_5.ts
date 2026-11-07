import {
  LevelDefinition,
  TileType,
  CoinDef,
  EnemySpawnDef,
  MovingPlatformDef,
} from '../types';
import {
  LEVEL_ROWS,
  createEmptyGrid,
  fillGroundRange,
  addCoinRow,
  addFragileCrystalBridge,
  addLavaPit,
} from '../level_builder';

export function buildWorld9Level5(): LevelDefinition {
  const cols = 205;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // 9-5: Heart of the Crystal
  // Radiant crystal core sanctum culminating in the battle against Crystalis, the Crystal Guardian
  fillGroundRange(grid, 0, 26, 16);
  addLavaPit(grid, 27, 32, 16);
  fillGroundRange(grid, 33, 64, 16);
  addLavaPit(grid, 65, 72, 16);
  fillGroundRange(grid, 73, 108, 16);
  addLavaPit(grid, 109, 116, 16);
  fillGroundRange(grid, 117, 148, 16);
  // Boss Arena floor (cols 149..204)
  fillGroundRange(grid, 149, 204, 16);

  // Crystal ceiling
  for (let c = 0; c < cols; c++) {
    grid[0][c] = TileType.SOLID_STONE;
  }

  // Fragile crystal bridges over abyssal core fissures
  addFragileCrystalBridge(grid, 27, 32, 13);
  addFragileCrystalBridge(grid, 65, 72, 13);

  // Moving prism platform over fissure 109..116
  movingPlatforms.push({
    id: 'w9_l5_mp1',
    x: 109 * 32,
    y: 13 * 32,
    width: 96,
    endX: 114 * 32,
    endY: 13 * 32,
    speed: 80,
  });

  // Crystal Spike hazards
  grid[15][46] = TileType.CRYSTAL_SPIKE;
  grid[15][47] = TileType.CRYSTAL_SPIKE;
  grid[15][92] = TileType.CRYSTAL_SPIKE;
  grid[15][93] = TileType.CRYSTAL_SPIKE;

  // Power-Up Slot 1: Mushroom at col 14, row 12
  grid[12][13] = TileType.BRICK;
  grid[12][14] = TileType.QUESTION_MUSHROOM;
  grid[12][15] = TileType.BRICK;
  addCoinRow(coins, 'w9_5', 12, 5, 9);

  // Star Slot 1 at col 40, row 12
  grid[12][39] = TileType.BRICK;
  grid[12][40] = TileType.QUESTION_STAR;
  grid[12][41] = TileType.BRICK;

  // Power-Up Slot 2: Solar Fire Flower at col 80, row 12
  grid[12][79] = TileType.BRICK;
  grid[12][80] = TileType.QUESTION_FIRE;
  grid[12][81] = TileType.BRICK;
  addCoinRow(coins, 'w9_5', 78, 5, 9);

  // Power-Up Slot 3: Raccoon Feather at col 126, row 12
  grid[12][125] = TileType.BRICK;
  grid[12][126] = TileType.QUESTION_FEATHER;
  grid[12][127] = TileType.BRICK;

  // Star Slot 2 at col 140, row 12
  grid[12][139] = TileType.BRICK;
  grid[12][140] = TileType.QUESTION_STAR;
  grid[12][141] = TileType.BRICK;
  addCoinRow(coins, 'w9_5', 138, 5, 9);

  // Boss Arena elevated crystal platforms
  for (let c = 160; c <= 164; c++) grid[12][c] = TileType.BRIDGE;
  for (let c = 176; c <= 180; c++) grid[12][c] = TileType.BRIDGE;
  addCoinRow(coins, 'w9_5', 160, 5, 10);
  addCoinRow(coins, 'w9_5', 176, 5, 10);

  // Stone pivot for rotating prism bar
  grid[13][104] = TileType.SOLID_STONE;

  enemies.push(
    { id: 'w9_5_e1', type: 'KNIGHT', x: 20 * 32, y: 15 * 32, patrolRange: 96 },
    { id: 'w9_5_e2', type: 'BEETLE', x: 52 * 32, y: 15 * 32 },
    { id: 'w9_5_e3', type: 'BAT', x: 68 * 32, y: 8 * 32, patrolRange: 120 },
    { id: 'w9_5_e4', type: 'KNIGHT', x: 98 * 32, y: 15 * 32, patrolRange: 110 },
    { id: 'w9_5_e5', type: 'FIRE_BAR', x: 104 * 32 + 16, y: 13 * 32 + 16 },
    { id: 'w9_5_e6', type: 'BEETLE', x: 132 * 32, y: 15 * 32 }
  );

  return {
    id: 45,
    worldId: 9,
    stageNumber: 5,
    name: '9-5: Heart of the Crystal',
    subtitle: 'Challenge Crystalis, the Crystal Guardian in the prism core',
    theme: 'CRYSTAL_CORE',
    musicTrack: 'CASTLE_BOSS',
    hasFallingRocks: true,
    crystalLasers: [
      { col: 56, topRow: 1, bottomRow: 16, cycleSeconds: 3.2, phaseOffset: 0.4 },
      { col: 88, topRow: 1, bottomRow: 16, cycleSeconds: 3.2, phaseOffset: 1.6 },
      { col: 134, topRow: 1, bottomRow: 16, cycleSeconds: 3.0, phaseOffset: 0.9 },
    ],
    widthInTiles: cols,
    heightInTiles: LEVEL_ROWS,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    checkpoint: { x: 120 * 32, y: 14 * 32 },
    hasBoss: true,
    bossArenaStartX: 152 * 32,
    goalX: 196 * 32,
    goalY: 6 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}
