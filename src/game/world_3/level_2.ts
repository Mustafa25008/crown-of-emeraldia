import { LevelDefinition, TileType, CoinDef, EnemySpawnDef, MovingPlatformDef } from '../types';
import {
  LEVEL_ROWS,
  createEmptyGrid,
  fillGroundRange,
  addPipe,
  addStairs,
  addCoinRow,
  addQuicksandPit,
  addCrumbleBridge,
} from '../level_builder';

export function buildWorld3Level2(): LevelDefinition {
  const cols = 128;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // Solid dune sections separated by sinking quicksand pits
  fillGroundRange(grid, 0, 21);
  addQuicksandPit(grid, 22, 29, 16);
  fillGroundRange(grid, 30, 50);
  addQuicksandPit(grid, 51, 61, 16);
  fillGroundRange(grid, 62, 82);
  addQuicksandPit(grid, 83, 94, 16);
  fillGroundRange(grid, 95, 127);

  // Early Power-up slot 1 at col 12 (row 12 = 4 tiles above row 16 ground)
  grid[12][10] = TileType.QUESTION_COIN;
  grid[12][11] = TileType.BRICK;
  grid[12][12] = TileType.QUESTION_MUSHROOM;
  grid[12][13] = TileType.BRICK;
  grid[12][14] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w3_l2_intro', 10, 5, 9);

  // Quicksand Pit 1 (cols 22..29) with collapsing sandstone blocks at row 12
  addCrumbleBridge(grid, 23, 28, 12);
  addCoinRow(coins, 'w3_l2_qs1', 23, 6, 9);

  // Star slot 1 at col 35 (row 11)
  grid[11][34] = TileType.BRICK;
  grid[11][35] = TileType.QUESTION_STAR;
  grid[11][36] = TileType.BRICK;

  // Cactus hazard on mid plateau with crumble step above
  grid[15][42] = TileType.CACTUS;
  grid[15][43] = TileType.CACTUS;
  addCrumbleBridge(grid, 41, 44, 12);

  // Power-up slot 2 at col 47 (row 12 = 4 tiles above row 16 ground)
  grid[12][46] = TileType.BRICK;
  grid[12][47] = TileType.QUESTION_FIRE;
  grid[12][48] = TileType.BRICK;

  // Quicksand Pit 2 (cols 51..61) with moving sand barge platform
  movingPlatforms.push({
    id: 'w3_l2_mp1',
    x: 52 * 32,
    y: 13 * 32,
    width: 96,
    endX: 58 * 32,
    endY: 10 * 32,
    speed: 95,
  });
  addCoinRow(coins, 'w3_l2_qs2', 53, 6, 7);

  // Checkpoint at col 65
  const checkpoint = { x: 65 * 32, y: 14 * 32 };

  // Mid-late sandstone oasis pipes & Power-up slot 3 at col 74 (row 12)
  addPipe(grid, 68, 16, 3);
  grid[12][73] = TileType.QUESTION_COIN;
  grid[12][74] = TileType.QUESTION_FEATHER;
  grid[12][75] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w3_l2_mid', 72, 5, 9);

  // Quicksand Pit 3 (cols 83..94) with alternating crumble bridges and moving platform
  addCrumbleBridge(grid, 84, 86, 13);
  movingPlatforms.push({
    id: 'w3_l2_mp2',
    x: 88 * 32,
    y: 12 * 32,
    width: 96,
    endX: 92 * 32,
    endY: 12 * 32,
    speed: 105,
  });
  addCoinRow(coins, 'w3_l2_qs3', 85, 8, 9);

  // Star slot 2 at col 99 (row 11)
  grid[11][99] = TileType.QUESTION_STAR;

  // Final sandstone stairs to goal flagpole
  addStairs(grid, 105, 16, 6, true);

  enemies.push(
    { id: 'w3_l2_e1', type: 'SLIME', x: 16 * 32, y: 15 * 32 },
    { id: 'w3_l2_e2', type: 'BAT', x: 25 * 32, y: 7 * 32, patrolRange: 120 },
    { id: 'w3_l2_e3', type: 'BEETLE', x: 38 * 32, y: 15 * 32 },
    { id: 'w3_l2_e4', type: 'BAT', x: 55 * 32, y: 8 * 32, patrolRange: 140 },
    { id: 'w3_l2_e5', type: 'KNIGHT', x: 78 * 32, y: 15 * 32 },
    { id: 'w3_l2_e6', type: 'BAT', x: 89 * 32, y: 7 * 32, patrolRange: 130 },
    { id: 'w3_l2_e7', type: 'BEETLE', x: 101 * 32, y: 15 * 32 }
  );

  return {
    id: 12,
    worldId: 3,
    stageNumber: 2,
    name: 'Level 2: Shifting Sands',
    subtitle: 'Quicksand Pits & Crumbling Sandstone',
    theme: 'DESERT',
    musicTrack: 'DESERT',
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

export const world3Level2 = buildWorld3Level2();
