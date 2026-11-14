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

export function buildWorld9Level1(): LevelDefinition {
  const cols = 190;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // 9-1: Crystal Entrance
  // Glowing quartz & amethyst caverns with fragile crystal bridges, crystal spikes, and prism enemies
  fillGroundRange(grid, 0, 26, 16);
  fillGroundRange(grid, 32, 62, 16);
  fillGroundRange(grid, 68, 100, 16);
  fillGroundRange(grid, 108, 142, 16);
  fillGroundRange(grid, 150, 189, 16);

  // Fragile crystal bridges over cavern fissures
  addFragileCrystalBridge(grid, 27, 31, 15);
  addFragileCrystalBridge(grid, 63, 67, 14);
  addFragileCrystalBridge(grid, 101, 107, 14);

  // Moving crystal prism platform over chasm 143..149
  movingPlatforms.push({
    id: 'w9_l1_mp1',
    x: 143 * 32,
    y: 14 * 32,
    width: 96,
    endX: 147 * 32,
    endY: 11 * 32,
    speed: 68,
  });

  // Glowing Crystal Spike hazards
  grid[15][18] = TileType.CRYSTAL_SPIKE;
  grid[15][46] = TileType.CRYSTAL_SPIKE;
  grid[15][47] = TileType.CRYSTAL_SPIKE;
  grid[15][84] = TileType.CRYSTAL_SPIKE;
  grid[15][124] = TileType.CRYSTAL_SPIKE;
  grid[15][125] = TileType.CRYSTAL_SPIKE;

  // Power-Up Slot 1: Mushroom at col 14, row 12
  grid[12][13] = TileType.BRICK;
  grid[12][14] = TileType.QUESTION_MUSHROOM;
  grid[12][15] = TileType.BRICK;
  addCoinRow(coins, 'w9_1', 12, 5, 9);

  // Elevated crystal ledge (cols 36..42, row 12)
  for (let c = 36; c <= 42; c++) grid[12][c] = TileType.BRICK;
  grid[12][39] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w9_1', 36, 7, 9);

  // Star Slot 1 at col 54, row 12
  grid[12][53] = TileType.BRICK;
  grid[12][54] = TileType.QUESTION_STAR;
  grid[12][55] = TileType.BRICK;

  // Power-Up Slot 2: Solar Fire Flower at col 74, row 12
  grid[12][73] = TileType.BRICK;
  grid[12][74] = TileType.QUESTION_FIRE;
  grid[12][75] = TileType.BRICK;
  addCoinRow(coins, 'w9_1', 72, 5, 9);

  // High fragile crystal canopy (cols 82..92, row 8)
  addFragileCrystalBridge(grid, 82, 92, 8);
  addCoinRow(coins, 'w9_1', 83, 9, 5);

  // Power-Up Slot 3: Raccoon Feather at col 116, row 12
  grid[12][115] = TileType.BRICK;
  grid[12][116] = TileType.QUESTION_FEATHER;
  grid[12][117] = TileType.BRICK;

  // Star Slot 2 at col 158, row 12
  grid[12][157] = TileType.BRICK;
  grid[12][158] = TileType.QUESTION_STAR;
  grid[12][159] = TileType.BRICK;
  addCoinRow(coins, 'w9_1', 156, 5, 9);

  addStairs(grid, 172, 16, 6, true);
  addCoinRow(coins, 'w9_1', 173, 5, 9);

  enemies.push(
    { id: 'w9_1_e1', type: 'SLIME', x: 21 * 32, y: 15 * 32 },
    { id: 'w9_1_e2', type: 'BEETLE', x: 40 * 32, y: 15 * 32 },
    { id: 'w9_1_e3', type: 'BAT', x: 58 * 32, y: 9 * 32, patrolRange: 120 },
    { id: 'w9_1_e4', type: 'SLIME', x: 78 * 32, y: 15 * 32 },
    { id: 'w9_1_e5', type: 'KNIGHT', x: 94 * 32, y: 15 * 32, patrolRange: 100 },
    { id: 'w9_1_e6', type: 'BEETLE', x: 120 * 32, y: 15 * 32 },
    { id: 'w9_1_e7', type: 'BAT', x: 136 * 32, y: 8 * 32, patrolRange: 130 },
    { id: 'w9_1_e8', type: 'KNIGHT', x: 162 * 32, y: 15 * 32, patrolRange: 96 }
  );

  return {
    id: 41,
    worldId: 9,
    stageNumber: 1,
    name: '9-1: Crystal Entrance',
    subtitle: 'Bioluminescent quartz caverns and shimmering crystal bridges',
    theme: 'CRYSTAL_CAVERN',
    musicTrack: 'CRYSTAL',
    widthInTiles: cols,
    heightInTiles: LEVEL_ROWS,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    checkpoint: { x: 96 * 32, y: 14 * 32 },
    goalX: 181 * 32,
    goalY: 6 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}
