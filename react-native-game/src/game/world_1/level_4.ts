import { LevelDefinition, TileType, CoinDef, EnemySpawnDef, MovingPlatformDef } from '../types';
import {
  LEVEL_ROWS,
  createEmptyGrid,
  fillGroundRange,
  addStairs,
  addCoinRow,
} from '../level_builder';

export function buildLevel4(): LevelDefinition {
  const cols = 140;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // Castle Approach Battlements & Lava Trenches
  fillGroundRange(grid, 0, 22);
  fillGroundRange(grid, 30, 54);
  fillGroundRange(grid, 66, 94);
  fillGroundRange(grid, 106, 139);

  // Fill lava trenches in gaps
  const lavaRanges = [
    [23, 29],
    [55, 65],
    [95, 105],
  ];
  for (const [start, end] of lavaRanges) {
    for (let c = start; c <= end; c++) {
      grid[17][c] = TileType.LAVA_TOP;
      grid[18][c] = TileType.LAVA_DEEP;
    }
  }

  // Intro supply blocks (Power-up slot 1 at col 11)
  grid[12][10] = TileType.BRICK;
  grid[12][11] = TileType.QUESTION_MUSHROOM;
  grid[12][12] = TileType.BRICK;
  grid[12][13] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'l4_c1', 9, 6, 9);

  // Moving platform over Lava Trench 1 (cols 23..29)
  movingPlatforms.push({
    id: 'l4_mp1',
    x: 23 * 32,
    y: 14 * 32,
    width: 96,
    endX: 27 * 32,
    endY: 14 * 32,
    speed: 95,
  });

  // Battlement section (cols 30..54) with Fire Bars and Knights (Star slot 1 at col 44)
  grid[13][38] = TileType.SOLID_STONE;
  grid[12][38] = TileType.SOLID_STONE;
  for (let c = 41; c <= 47; c++) {
    grid[10][c] = c === 44 ? TileType.QUESTION_STAR : TileType.BRICK;
  }
  // Coins float above blocks at row 7
  addCoinRow(coins, 'l4_bat', 41, 7, 7);

  // Moving platforms over Lava Trench 2 (cols 55..65)
  movingPlatforms.push(
    {
      id: 'l4_mp2',
      x: 56 * 32,
      y: 13 * 32,
      width: 96,
      endX: 59 * 32,
      endY: 10 * 32,
      speed: 95,
    },
    {
      id: 'l4_mp3',
      x: 61 * 32,
      y: 10 * 32,
      width: 96,
      endX: 64 * 32,
      endY: 13 * 32,
      speed: 95,
    }
  );

  // Mid-late section (cols 66..94) (Power-up slot 2 at col 73)
  grid[12][72] = TileType.BRICK;
  grid[12][73] = TileType.QUESTION_FIRE;
  grid[12][74] = TileType.BRICK;

  for (let c = 79; c <= 83; c++) {
    grid[15][c] = TileType.SPIKE;
  }
  for (let c = 78; c <= 84; c++) {
    grid[12][c] = TileType.BRIDGE;
  }
  addCoinRow(coins, 'l4_bridge', 79, 5, 10);

  // Star slot 2 at col 87 before Checkpoint
  grid[12][87] = TileType.QUESTION_STAR;

  // Checkpoint near end of approach (col 90)
  const checkpoint = { x: 90 * 32, y: 14 * 32 };

  // Lava Trench 3 (cols 95..105) with stone pillars & moving platform
  grid[14][98] = TileType.SOLID_STONE;
  grid[15][98] = TileType.SOLID_STONE;
  grid[16][98] = TileType.SOLID_STONE;

  movingPlatforms.push({
    id: 'l4_mp4',
    x: 100 * 32,
    y: 13 * 32,
    width: 96,
    endX: 104 * 32,
    endY: 13 * 32,
    speed: 105,
  });

  // Power-up slot 3 after Lava Trench 3 at col 108
  grid[12][107] = TileType.BRICK;
  grid[12][108] = TileType.QUESTION_FEATHER;
  grid[12][109] = TileType.BRICK;

  // Grand castle approach staircase
  addStairs(grid, 114, 16, 7, true);

  enemies.push(
    { id: 'l4_e1', type: 'KNIGHT', x: 17 * 32, y: 15 * 32 },
    { id: 'l4_e2', type: 'BEETLE', x: 34 * 32, y: 15 * 32 },
    { id: 'l4_fb1', type: 'FIRE_BAR', x: 38 * 32 + 16, y: 12 * 32 + 16 },
    { id: 'l4_e3', type: 'KNIGHT', x: 49 * 32, y: 15 * 32 },
    { id: 'l4_e4', type: 'BAT', x: 60 * 32, y: 8 * 32, patrolRange: 140 },
    { id: 'l4_fb2', type: 'FIRE_BAR', x: 76 * 32 + 16, y: 13 * 32 + 16 },
    { id: 'l4_e5', type: 'KNIGHT', x: 86 * 32, y: 15 * 32 },
    { id: 'l4_e6', type: 'BEETLE', x: 110 * 32, y: 15 * 32 }
  );

  return {
    id: 4,
    name: 'Level 4: Castle Approach',
    subtitle: 'Iron Battlements & Molten Moats',
    theme: 'FORTRESS',
    musicTrack: 'FORTRESS',
    widthInTiles: cols,
    heightInTiles: LEVEL_ROWS,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    checkpoint,
    goalX: 129 * 32,
    goalY: 6 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}

export const level4 = buildLevel4();
