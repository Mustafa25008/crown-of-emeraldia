import { LevelDefinition, TileType, CoinDef, EnemySpawnDef, MovingPlatformDef } from '../types';
import {
  LEVEL_ROWS,
  createEmptyGrid,
  fillGroundRange,
  addStairs,
  addCoinRow,
  addLavaPit,
  addMagmaCrumbleBridge,
} from '../level_builder';

export function buildWorld5Level2(): LevelDefinition {
  const cols = 128;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // Underground Molten Cavern ceiling (keep row 1 clear near Question Blocks & high ledges)
  for (let c = 0; c < cols; c++) {
    grid[0][c] = TileType.GROUND_DEEP;
    const isNearQuestionBlock =
      (c >= 8 && c <= 17) || (c >= 31 && c <= 42) || (c >= 53 && c <= 65) || (c >= 88 && c <= 104);
    if (c % 5 === 0 && !isNearQuestionBlock) {
      grid[1][c] = TileType.GROUND_DEEP;
    }
  }

  // Subterranean volcanic passages with wide flowing lava lakes
  fillGroundRange(grid, 0, 17);
  addLavaPit(grid, 18, 28, 16); // Lava River 1
  fillGroundRange(grid, 29, 45);
  addLavaPit(grid, 46, 58, 16); // Lava River 2
  fillGroundRange(grid, 59, 75);
  addLavaPit(grid, 76, 90, 16); // Lava River 3
  fillGroundRange(grid, 91, 127);

  // Early Power-up slot 1 at col 11 (row 12 = 4 tiles above row 16 ground)
  grid[12][9] = TileType.BRICK;
  grid[12][10] = TileType.QUESTION_COIN;
  grid[12][11] = TileType.QUESTION_MUSHROOM;
  grid[12][12] = TileType.QUESTION_COIN;
  grid[12][13] = TileType.BRICK;
  addCoinRow(coins, 'w5_l2_intro', 9, 5, 9);

  // Narrow collapsing magma ledges over Lava River 1 (cols 18..28)
  addMagmaCrumbleBridge(grid, 19, 22, 13);
  addMagmaCrumbleBridge(grid, 24, 27, 11);
  addCoinRow(coins, 'w5_l2_lava1', 20, 7, 8);

  // Cavern Island 1 (cols 29..45): Burning rock & Star slot 1 at col 36 (row 11)
  grid[15][33] = TileType.BURNING_ROCK;
  grid[11][35] = TileType.BRICK;
  grid[11][36] = TileType.QUESTION_STAR;
  grid[11][37] = TileType.BRICK;
  grid[15][41] = TileType.BURNING_ROCK;

  // Narrow passage & collapsing platforms over Lava River 2 (cols 46..58)
  addMagmaCrumbleBridge(grid, 47, 50, 12);
  movingPlatforms.push({
    id: 'w5_l2_mp1',
    x: 52 * 32,
    y: 12 * 32,
    width: 96,
    endX: 56 * 32,
    endY: 10 * 32,
    speed: 95,
  });
  addCoinRow(coins, 'w5_l2_lava2', 47, 6, 9);

  // Cavern Island 2 (cols 59..75): Mid-level Power-up slot 2 at col 62 (row 12) + Checkpoint at col 69
  grid[12][60] = TileType.QUESTION_COIN;
  grid[12][61] = TileType.BRICK;
  grid[12][62] = TileType.QUESTION_FIRE;
  grid[12][63] = TileType.BRICK;
  grid[12][64] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w5_l2_mid', 60, 5, 9);

  const checkpoint = { x: 69 * 32, y: 14 * 32 };
  grid[15][73] = TileType.BURNING_ROCK;

  // Lava River 3 (cols 76..90): Tiered collapsing magma ledges & stone islands
  addMagmaCrumbleBridge(grid, 77, 80, 13);
  for (let c = 82; c <= 84; c++) {
    grid[11][c] = TileType.BRIDGE;
  }
  addMagmaCrumbleBridge(grid, 86, 89, 13);
  addCoinRow(coins, 'w5_l2_lava3', 81, 6, 8);

  // Late-level Power-up slot 3 at col 95 (row 12) & Star slot 2 at col 102 (row 11)
  grid[12][94] = TileType.BRICK;
  grid[12][95] = TileType.QUESTION_FEATHER;
  grid[12][96] = TileType.BRICK;
  grid[15][99] = TileType.BURNING_ROCK;
  grid[11][102] = TileType.QUESTION_STAR;
  addCoinRow(coins, 'w5_l2_late', 93, 5, 9);

  addStairs(grid, 108, 16, 5, true);

  enemies.push(
    { id: 'w5_l2_e1', type: 'SLIME', x: 15 * 32, y: 15 * 32 },
    { id: 'w5_l2_e2', type: 'BAT', x: 23 * 32, y: 7 * 32, patrolRange: 120 },
    { id: 'w5_l2_e3', type: 'BEETLE', x: 38 * 32, y: 15 * 32 },
    { id: 'w5_l2_e4', type: 'BAT', x: 52 * 32, y: 6 * 32, patrolRange: 130 },
    { id: 'w5_l2_e5', type: 'KNIGHT', x: 66 * 32, y: 15 * 32 },
    { id: 'w5_l2_e6', type: 'BAT', x: 83 * 32, y: 6 * 32, patrolRange: 140 },
    { id: 'w5_l2_e7', type: 'KNIGHT', x: 97 * 32, y: 15 * 32 },
    { id: 'w5_l2_e8', type: 'BEETLE', x: 105 * 32, y: 15 * 32 }
  );

  return {
    id: 22,
    worldId: 5,
    stageNumber: 2,
    name: 'Level 2: Molten Caverns',
    subtitle: 'Flowing Lava, Falling Rocks & Collapsing Ledges',
    theme: 'MOLTEN_CAVERN',
    musicTrack: 'CAVERN',
    hasAshfall: true,
    hasFallingRocks: true,
    hasRisingLava: true,
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

export const world5Level2 = buildWorld5Level2();
