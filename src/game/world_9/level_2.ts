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
  addMineRail,
  addFragileCrystalBridge,
} from '../level_builder';

export function buildWorld9Level2(): LevelDefinition {
  const cols = 198;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // 9-2: Shimmering Mines
  // Deep crystal excavation shafts with high-speed mine cart rails, moving ore carts, and falling crystal shards
  fillGroundRange(grid, 0, 22, 16);
  fillGroundRange(grid, 36, 62, 16);
  fillGroundRange(grid, 78, 108, 16);
  fillGroundRange(grid, 124, 154, 16);
  fillGroundRange(grid, 164, 197, 16);

  // High-speed Mine Cart Rail tracks over chasms & shafts
  addMineRail(grid, 23, 35, 15, 'RIGHT');
  addMineRail(grid, 63, 77, 14, 'RIGHT');
  addMineRail(grid, 109, 123, 13, 'LEFT');
  addFragileCrystalBridge(grid, 155, 163, 14);

  // Moving Mine Cart platforms
  movingPlatforms.push(
    {
      id: 'w9_l2_mp1',
      x: 24 * 32,
      y: 12 * 32,
      width: 96,
      endX: 33 * 32,
      endY: 12 * 32,
      speed: 105,
    },
    {
      id: 'w9_l2_mp2',
      x: 110 * 32,
      y: 10 * 32,
      width: 96,
      endX: 121 * 32,
      endY: 10 * 32,
      speed: 110,
    }
  );

  // Crystal Spike hazards
  grid[15][46] = TileType.CRYSTAL_SPIKE;
  grid[15][47] = TileType.CRYSTAL_SPIKE;
  grid[15][92] = TileType.CRYSTAL_SPIKE;
  grid[15][138] = TileType.CRYSTAL_SPIKE;
  grid[15][139] = TileType.CRYSTAL_SPIKE;

  // Power-Up Slot 1: Mushroom at col 13, row 12
  grid[12][12] = TileType.BRICK;
  grid[12][13] = TileType.QUESTION_MUSHROOM;
  grid[12][14] = TileType.BRICK;
  addCoinRow(coins, 'w9_2', 11, 5, 9);

  // Coins along Mine Rail 1
  addCoinRow(coins, 'w9_2', 25, 9, 12);

  // Star Slot 1 at col 52, row 12
  grid[12][51] = TileType.BRICK;
  grid[12][52] = TileType.QUESTION_STAR;
  grid[12][53] = TileType.BRICK;

  // Power-Up Slot 2: Solar Fire Flower at col 84, row 12
  grid[12][83] = TileType.BRICK;
  grid[12][84] = TileType.QUESTION_FIRE;
  grid[12][85] = TileType.BRICK;
  addCoinRow(coins, 'w9_2', 82, 5, 9);

  // Upper mine rail scaffold (cols 90..100, row 8)
  addMineRail(grid, 90, 100, 8, 'RIGHT');
  addCoinRow(coins, 'w9_2', 91, 9, 5);

  // Power-Up Slot 3: Raccoon Feather at col 130, row 12
  grid[12][129] = TileType.BRICK;
  grid[12][130] = TileType.QUESTION_FEATHER;
  grid[12][131] = TileType.BRICK;

  // Star Slot 2 at col 148, row 12
  grid[12][147] = TileType.BRICK;
  grid[12][148] = TileType.QUESTION_STAR;
  grid[12][149] = TileType.BRICK;
  addCoinRow(coins, 'w9_2', 146, 5, 9);

  addStairs(grid, 179, 16, 6, true);
  addCoinRow(coins, 'w9_2', 180, 5, 9);

  enemies.push(
    { id: 'w9_2_e1', type: 'BEETLE', x: 18 * 32, y: 15 * 32 },
    { id: 'w9_2_e2', type: 'SLIME', x: 42 * 32, y: 15 * 32 },
    { id: 'w9_2_e3', type: 'KNIGHT', x: 56 * 32, y: 15 * 32, patrolRange: 100 },
    { id: 'w9_2_e4', type: 'BAT', x: 70 * 32, y: 8 * 32, patrolRange: 130 },
    { id: 'w9_2_e5', type: 'BEETLE', x: 96 * 32, y: 15 * 32 },
    { id: 'w9_2_e6', type: 'KNIGHT', x: 134 * 32, y: 15 * 32, patrolRange: 110 },
    { id: 'w9_2_e7', type: 'BAT', x: 158 * 32, y: 8 * 32, patrolRange: 120 },
    { id: 'w9_2_e8', type: 'BEETLE', x: 168 * 32, y: 15 * 32 }
  );

  return {
    id: 42,
    worldId: 9,
    stageNumber: 2,
    name: '9-2: Shimmering Mines',
    subtitle: 'High-speed ore rails, motorized carts, and falling crystal shards',
    theme: 'SHIMMERING_MINES',
    musicTrack: 'CRYSTAL',
    hasFallingRocks: true,
    widthInTiles: cols,
    heightInTiles: LEVEL_ROWS,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    checkpoint: { x: 102 * 32, y: 14 * 32 },
    goalX: 188 * 32,
    goalY: 6 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}
