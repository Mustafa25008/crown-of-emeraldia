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
  addStairs,
  addCoinRow,
  addFragileCrystalBridge,
} from '../level_builder';

export function buildWorld9Level4(): LevelDefinition {
  const cols = 200;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // 9-4: The Crystal Labyrinth
  // Multi-tiered crystal maze with prism laser beams, reflective teleporters, and crystal spikes
  fillGroundRange(grid, 0, 26, 16);
  fillGroundRange(grid, 36, 68, 16);
  fillGroundRange(grid, 78, 114, 16);
  fillGroundRange(grid, 124, 158, 16);
  fillGroundRange(grid, 166, 199, 16);

  // Fragile crystal bridges across labyrinth chasms
  addFragileCrystalBridge(grid, 27, 35, 14);
  addFragileCrystalBridge(grid, 69, 77, 14);
  addFragileCrystalBridge(grid, 159, 165, 14);

  // Moving prism platform over chasm 115..123
  movingPlatforms.push({
    id: 'w9_l4_mp1',
    x: 115 * 32,
    y: 14 * 32,
    width: 96,
    endX: 121 * 32,
    endY: 10 * 32,
    speed: 76,
  });

  // Crystal Spike hazards
  grid[15][20] = TileType.CRYSTAL_SPIKE;
  grid[15][54] = TileType.CRYSTAL_SPIKE;
  grid[15][96] = TileType.CRYSTAL_SPIKE;
  grid[15][140] = TileType.CRYSTAL_SPIKE;

  // Power-Up Slot 1: Mushroom at col 14, row 12
  grid[12][13] = TileType.BRICK;
  grid[12][14] = TileType.QUESTION_MUSHROOM;
  grid[12][15] = TileType.BRICK;
  addCoinRow(coins, 'w9_4', 12, 5, 9);

  // Upper labyrinth tier 1 (cols 42..54, row 10)
  for (let c = 42; c <= 54; c++) grid[10][c] = TileType.SOLID_STONE;
  addCoinRow(coins, 'w9_4', 43, 10, 7);

  // Star Slot 1 at col 60, row 12
  grid[12][59] = TileType.BRICK;
  grid[12][60] = TileType.QUESTION_STAR;
  grid[12][61] = TileType.BRICK;

  // Power-Up Slot 2: Solar Fire Flower at col 84, row 12
  grid[12][83] = TileType.BRICK;
  grid[12][84] = TileType.QUESTION_FIRE;
  grid[12][85] = TileType.BRICK;
  addCoinRow(coins, 'w9_4', 82, 5, 9);

  // Upper labyrinth tier 2 (cols 92..104, row 10)
  for (let c = 92; c <= 104; c++) grid[10][c] = TileType.SOLID_STONE;
  addCoinRow(coins, 'w9_4', 93, 10, 7);

  // Power-Up Slot 3: Raccoon Feather at col 130, row 12
  grid[12][129] = TileType.BRICK;
  grid[12][130] = TileType.QUESTION_FEATHER;
  grid[12][131] = TileType.BRICK;

  // Star Slot 2 at col 148, row 12
  grid[12][147] = TileType.BRICK;
  grid[12][148] = TileType.QUESTION_STAR;
  grid[12][149] = TileType.BRICK;
  addCoinRow(coins, 'w9_4', 146, 5, 9);

  // Ceiling crystal emitter mounts for high lasers
  grid[1][64] = TileType.SOLID_STONE;
  grid[1][136] = TileType.SOLID_STONE;
  grid[1][154] = TileType.SOLID_STONE;

  addStairs(grid, 181, 16, 6, true);
  addCoinRow(coins, 'w9_4', 182, 5, 9);

  enemies.push(
    { id: 'w9_4_e1', type: 'BEETLE', x: 22 * 32, y: 15 * 32 },
    { id: 'w9_4_e2', type: 'KNIGHT', x: 51 * 32, y: 15 * 32, patrolRange: 100 },
    { id: 'w9_4_e3', type: 'BAT', x: 72 * 32, y: 8 * 32, patrolRange: 120 },
    { id: 'w9_4_e4', type: 'KNIGHT', x: 101 * 32, y: 15 * 32, patrolRange: 100 },
    { id: 'w9_4_e5', type: 'BEETLE', x: 108 * 32, y: 15 * 32 },
    { id: 'w9_4_e6', type: 'KNIGHT', x: 138 * 32, y: 15 * 32, patrolRange: 100 },
    { id: 'w9_4_e7', type: 'BAT', x: 160 * 32, y: 8 * 32, patrolRange: 120 },
    { id: 'w9_4_e8', type: 'SLIME', x: 170 * 32, y: 15 * 32 }
  );

  return {
    id: 44,
    worldId: 9,
    stageNumber: 4,
    name: '9-4: The Crystal Labyrinth',
    subtitle: 'Refracting laser beams, prism portals, and crystalline mazes',
    theme: 'CRYSTAL_CAVERN',
    musicTrack: 'CRYSTAL',
    crystalLasers: [
      { col: 48, topRow: 11, bottomRow: 16, cycleSeconds: 3.2, phaseOffset: 0.0 },
      { col: 64, topRow: 2, bottomRow: 16, cycleSeconds: 3.4, phaseOffset: 1.1 },
      { col: 98, topRow: 11, bottomRow: 16, cycleSeconds: 3.2, phaseOffset: 0.6 },
      { col: 136, topRow: 2, bottomRow: 16, cycleSeconds: 3.0, phaseOffset: 1.8 },
      { col: 154, topRow: 2, bottomRow: 16, cycleSeconds: 3.0, phaseOffset: 0.4 },
    ],
    teleporters: [
      { id: 'w9_4_tp1', fromCol: 39, fromRow: 16, toCol: 43, toRow: 10 },
      { id: 'w9_4_tp2', fromCol: 89, fromRow: 16, toCol: 93, toRow: 10 },
    ],
    widthInTiles: cols,
    heightInTiles: LEVEL_ROWS,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    checkpoint: { x: 108 * 32, y: 14 * 32 },
    goalX: 190 * 32,
    goalY: 6 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}
