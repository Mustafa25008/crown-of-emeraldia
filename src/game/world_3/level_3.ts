import { LevelDefinition, TileType, CoinDef, EnemySpawnDef, MovingPlatformDef } from '../types';
import {
  LEVEL_ROWS,
  createEmptyGrid,
  fillGroundRange,
  addStairs,
  addCoinRow,
  addQuicksandPit,
  addCrumbleBridge,
} from '../level_builder';

export function buildWorld3Level3(): LevelDefinition {
  const cols = 128;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // Ancient Temple Ceiling (keep row 1 clear near all Question Blocks so >= 4 tiles headroom is guaranteed)
  for (let c = 0; c < cols; c++) {
    grid[0][c] = TileType.SOLID_STONE;
    const isNearQuestionOrUpperPassage =
      (c >= 8 && c <= 20) || (c >= 32 && c <= 60) || (c >= 74 && c <= 98);
    if (c < 105 && c % 5 === 0 && !isNearQuestionOrUpperPassage) {
      grid[1][c] = TileType.SOLID_STONE;
    }
  }

  // Temple Sandstone Floor with Sunken Traps & Quicksand Chambers
  fillGroundRange(grid, 0, 24);
  fillGroundRange(grid, 31, 56);
  addQuicksandPit(grid, 57, 65, 16);
  fillGroundRange(grid, 66, 88);
  fillGroundRange(grid, 95, 127);

  // Early Temple Altar: Power-up slot 1 at col 13 (row 12 = 4 tiles above row 16 floor)
  grid[12][11] = TileType.QUESTION_COIN;
  grid[12][12] = TileType.BRICK;
  grid[12][13] = TileType.QUESTION_MUSHROOM;
  grid[12][14] = TileType.BRICK;
  grid[12][15] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w3_l3_intro', 11, 5, 9);

  // Collapsing sandstone bridge over first temple chasm (cols 25..30)
  addCrumbleBridge(grid, 25, 30, 14);
  addCoinRow(coins, 'w3_l3_chasm1', 25, 6, 11);

  // Temple of Echoes Split Path (cols 34..54):
  // Lower path has Spike traps with a row 12 bridge; Upper Hidden Passage at row 8 holds treasure & Star slot 1!
  for (let c = 38; c <= 41; c++) {
    grid[15][c] = TileType.SPIKE;
  }
  for (let c = 37; c <= 42; c++) {
    grid[12][c] = TileType.BRIDGE;
  }

  // Upper Hidden Temple Gallery (row 8 bridge) + Power-up slot 2 at col 48 (row 12) + Star slot 1 at col 45 (row 5)
  for (let c = 42; c <= 52; c++) {
    grid[8][c] = TileType.BRIDGE;
  }
  addCoinRow(coins, 'w3_l3_upper_secret', 43, 8, 6);
  grid[5][45] = TileType.QUESTION_STAR;

  // Power-up slot 2 at col 50 (row 12 = 4 tiles below row 8 and 4 tiles above row 16)
  grid[12][49] = TileType.BRICK;
  grid[12][50] = TileType.QUESTION_FIRE;
  grid[12][51] = TileType.BRICK;

  // Quicksand Chamber (cols 57..65) with crumbling stepping stones at row 12
  addCrumbleBridge(grid, 58, 60, 12);
  addCrumbleBridge(grid, 62, 64, 12);
  addCoinRow(coins, 'w3_l3_qs', 58, 7, 9);

  // Checkpoint at col 68
  const checkpoint = { x: 68 * 32, y: 14 * 32 };

  // Late Temple Hall: Power-up slot 3 at col 78 (row 12) & Star slot 2 at col 86 (row 11)
  grid[12][76] = TileType.QUESTION_COIN;
  grid[12][77] = TileType.BRICK;
  grid[12][78] = TileType.QUESTION_FEATHER;
  grid[12][79] = TileType.BRICK;
  grid[12][80] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w3_l3_late', 76, 5, 9);

  grid[11][86] = TileType.QUESTION_STAR;

  // Second temple chasm (cols 89..94) with moving stone elevator
  movingPlatforms.push({
    id: 'w3_l3_mp1',
    x: 89 * 32,
    y: 14 * 32,
    width: 96,
    endX: 92 * 32,
    endY: 10 * 32,
    speed: 100,
  });

  // Final temple steps to goal flagpole
  addStairs(grid, 104, 16, 6, true);

  // Temple Guardians, Rotating Fire Bars, Scarabs, and Vultures
  enemies.push(
    { id: 'w3_l3_e1', type: 'SLIME', x: 18 * 32, y: 15 * 32 },
    { id: 'w3_l3_e2', type: 'KNIGHT', x: 34 * 32, y: 15 * 32 },
    { id: 'w3_l3_fb1', type: 'FIRE_BAR', x: 46 * 32 + 16, y: 13 * 32 + 16 },
    { id: 'w3_l3_e3', type: 'BEETLE', x: 53 * 32, y: 15 * 32 },
    { id: 'w3_l3_e4', type: 'BAT', x: 61 * 32, y: 7 * 32, patrolRange: 130 },
    { id: 'w3_l3_fb2', type: 'FIRE_BAR', x: 73 * 32 + 16, y: 13 * 32 + 16 },
    { id: 'w3_l3_e5', type: 'KNIGHT', x: 83 * 32, y: 15 * 32 },
    { id: 'w3_l3_e6', type: 'BEETLE', x: 99 * 32, y: 15 * 32 }
  );

  return {
    id: 13,
    worldId: 3,
    stageNumber: 3,
    name: 'Level 3: Temple of Echoes',
    subtitle: 'Ancient Stone Traps, Collapsing Bridges & Hidden Chambers',
    theme: 'PYRAMID',
    musicTrack: 'CAVERN',
    widthInTiles: cols,
    heightInTiles: LEVEL_ROWS,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    checkpoint,
    goalX: 117 * 32,
    goalY: 6 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}

export const world3Level3 = buildWorld3Level3();
