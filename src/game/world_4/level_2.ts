import { LevelDefinition, TileType, CoinDef, EnemySpawnDef, MovingPlatformDef } from '../types';
import {
  LEVEL_ROWS,
  createEmptyGrid,
  fillGroundRange,
  fillIceGroundRange,
  addCoinRow,
  addFragileIceBridge,
} from '../level_builder';

export function buildWorld4Level2(): LevelDefinition {
  const cols = 128;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // Introductory snow pad followed by extensive slippery ice slopes and stepped glaciers
  fillGroundRange(grid, 0, 9);
  fillIceGroundRange(grid, 10, 21, 16);

  // Ascending & Descending Stepped Ice Slope 1 (cols 22..37)
  fillIceGroundRange(grid, 22, 24, 15);
  fillIceGroundRange(grid, 25, 27, 14);
  fillIceGroundRange(grid, 28, 31, 13);
  fillIceGroundRange(grid, 32, 34, 14);
  fillIceGroundRange(grid, 35, 37, 15);

  // Gap 1 at cols 38..42 with fragile ice steps
  addFragileIceBridge(grid, 39, 41, 13);
  addCoinRow(coins, 'w4_l2_gap1', 39, 3, 10);

  // Mid Glacier Rink & Stepped Ice Slope 2 (cols 43..72)
  fillIceGroundRange(grid, 43, 55, 16);
  fillIceGroundRange(grid, 56, 59, 15);
  fillIceGroundRange(grid, 60, 65, 14);
  fillIceGroundRange(grid, 66, 72, 16);

  // Gap 2 at cols 73..82 with moving ice platforms & fragile ledges
  addFragileIceBridge(grid, 74, 76, 13);
  movingPlatforms.push({
    id: 'w4_l2_mp1',
    x: 78 * 32,
    y: 12 * 32,
    width: 96,
    endX: 81 * 32,
    endY: 10 * 32,
    speed: 100,
  });

  // Late Steep Glacier Slope 3 (cols 83..127)
  fillIceGroundRange(grid, 83, 93, 16);
  fillIceGroundRange(grid, 94, 96, 15);
  fillIceGroundRange(grid, 97, 99, 14);
  fillIceGroundRange(grid, 100, 103, 13);
  fillIceGroundRange(grid, 104, 106, 14);
  fillIceGroundRange(grid, 107, 127, 16);

  // Early Power-up slot 1 at col 14 (row 12 = 4 tiles above row 16 ice)
  grid[12][12] = TileType.QUESTION_COIN;
  grid[12][13] = TileType.BRICK;
  grid[12][14] = TileType.QUESTION_MUSHROOM;
  grid[12][15] = TileType.BRICK;
  grid[12][16] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w4_l2_intro', 12, 5, 9);

  // Coins & Star slot 1 above Stepped Ice Slope 1 Summit (row 13 -> row 9 = 4 tiles above)
  grid[9][29] = TileType.BRICK;
  grid[9][30] = TileType.QUESTION_STAR;
  grid[9][31] = TileType.BRICK;
  addCoinRow(coins, 'w4_l2_slope1', 25, 9, 6);

  // Icicle obstacle on Mid Glacier Rink with bridge above
  grid[15][48] = TileType.ICICLE;
  grid[15][49] = TileType.ICICLE;
  addFragileIceBridge(grid, 47, 50, 12);

  // Mid Power-up slot 2 at col 53 (row 12 = 4 tiles above row 16 ice)
  grid[12][52] = TileType.BRICK;
  grid[12][53] = TileType.QUESTION_FIRE;
  grid[12][54] = TileType.BRICK;
  addCoinRow(coins, 'w4_l2_slope2', 60, 6, 11);

  // Checkpoint at col 68
  const checkpoint = { x: 68 * 32, y: 14 * 32 };

  // Late Power-up slot 3 at col 88 (row 12 = 4 tiles above row 16 ice)
  grid[12][86] = TileType.QUESTION_COIN;
  grid[12][88] = TileType.QUESTION_FEATHER;
  grid[12][90] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w4_l2_late', 86, 5, 9);

  // Star slot 2 above Slope 3 Summit at col 101 (row 9 = 4 tiles above row 13 summit)
  grid[9][101] = TileType.QUESTION_STAR;
  addCoinRow(coins, 'w4_l2_slope3', 98, 6, 6);

  enemies.push(
    { id: 'w4_l2_e1', type: 'BEETLE', x: 17 * 32, y: 15 * 32 },
    { id: 'w4_l2_e2', type: 'SLIME', x: 29 * 32, y: 12 * 32 },
    { id: 'w4_l2_e3', type: 'BAT', x: 40 * 32, y: 8 * 32, patrolRange: 120 },
    { id: 'w4_l2_e4', type: 'BEETLE', x: 52 * 32, y: 15 * 32 },
    { id: 'w4_l2_e5', type: 'KNIGHT', x: 62 * 32, y: 13 * 32 },
    { id: 'w4_l2_e6', type: 'BAT', x: 77 * 32, y: 7 * 32, patrolRange: 130 },
    { id: 'w4_l2_e7', type: 'BEETLE', x: 90 * 32, y: 15 * 32 },
    { id: 'w4_l2_e8', type: 'KNIGHT', x: 111 * 32, y: 15 * 32 }
  );

  return {
    id: 17,
    worldId: 4,
    stageNumber: 2,
    name: 'Level 2: Slippery Slopes',
    subtitle: 'Icy Glaciers, Reduced Friction & Steep Slopes',
    theme: 'SNOW',
    musicTrack: 'SNOW',
    widthInTiles: cols,
    heightInTiles: LEVEL_ROWS,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    checkpoint,
    goalX: 118 * 32,
    goalY: 6 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}

export const world4Level2 = buildWorld4Level2();
