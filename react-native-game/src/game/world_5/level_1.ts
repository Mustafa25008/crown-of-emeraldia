import { LevelDefinition, TileType, CoinDef, EnemySpawnDef, MovingPlatformDef } from '../types';
import {
  LEVEL_ROWS,
  createEmptyGrid,
  fillGroundRange,
  addPipe,
  addStairs,
  addCoinRow,
  addLavaPit,
  addMagmaCrumbleBridge,
} from '../level_builder';

export function buildWorld5Level1(): LevelDefinition {
  const cols = 128;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // Ashen volcanic ground alternating with small bubbling lava pools
  fillGroundRange(grid, 0, 21);
  addLavaPit(grid, 22, 26, 16); // Small Lava Pool 1
  fillGroundRange(grid, 27, 47);
  addLavaPit(grid, 48, 53, 16); // Lava Pool 2
  fillGroundRange(grid, 54, 75);
  addLavaPit(grid, 76, 82, 16); // Lava Pool 3
  fillGroundRange(grid, 83, 127);

  // Early Power-up slot 1 at col 12 (row 12 = 4 tiles above row 16 ground)
  grid[12][10] = TileType.BRICK;
  grid[12][11] = TileType.QUESTION_COIN;
  grid[12][12] = TileType.QUESTION_MUSHROOM;
  grid[12][13] = TileType.QUESTION_COIN;
  grid[12][14] = TileType.BRICK;
  addCoinRow(coins, 'w5_l1_intro', 10, 5, 9);

  // Burning Rock hazard on ground at col 18 with easy jump clearance
  grid[15][18] = TileType.BURNING_ROCK;

  // Bridge over Small Lava Pool 1 (cols 22..26)
  for (let c = 23; c <= 25; c++) {
    grid[13][c] = TileType.BRIDGE;
  }
  addCoinRow(coins, 'w5_l1_lava1', 22, 5, 10);

  // Burning rocks & Star slot 1 at col 36 (row 11)
  grid[15][32] = TileType.BURNING_ROCK;
  grid[11][35] = TileType.BRICK;
  grid[11][36] = TileType.QUESTION_STAR;
  grid[11][37] = TileType.BRICK;
  grid[15][41] = TileType.BURNING_ROCK;

  addPipe(grid, 44, 16, 3);

  // Collapsing Magma Bridge over Lava Pool 2 (cols 48..53)
  addMagmaCrumbleBridge(grid, 49, 52, 13);
  addCoinRow(coins, 'w5_l1_lava2', 49, 4, 10);

  // Mid-level Power-up slot 2 at col 59 (row 12 = 4 tiles above ground)
  grid[12][57] = TileType.QUESTION_COIN;
  grid[12][58] = TileType.BRICK;
  grid[12][59] = TileType.QUESTION_FIRE;
  grid[12][60] = TileType.BRICK;
  grid[12][61] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w5_l1_mid', 57, 5, 9);

  // Checkpoint at col 66
  const checkpoint = { x: 66 * 32, y: 14 * 32 };

  // Burning rock formation at cols 70..71 with elevated bridge at row 12
  grid[15][70] = TileType.BURNING_ROCK;
  grid[15][71] = TileType.BURNING_ROCK;
  for (let c = 69; c <= 72; c++) {
    grid[12][c] = TileType.BRIDGE;
  }
  addCoinRow(coins, 'w5_l1_burnbridge', 69, 4, 9);

  // Moving platform over Lava Pool 3 (cols 76..82)
  movingPlatforms.push({
    id: 'w5_l1_mp1',
    x: 76 * 32 + 16,
    y: 13 * 32,
    width: 96,
    endX: 80 * 32,
    endY: 11 * 32,
    speed: 90,
  });

  // Late-level Power-up slot 3 at col 92 (row 12) & Star slot 2 at col 101 (row 11)
  grid[12][91] = TileType.BRICK;
  grid[12][92] = TileType.QUESTION_FEATHER;
  grid[12][93] = TileType.BRICK;
  grid[15][97] = TileType.BURNING_ROCK;
  grid[11][101] = TileType.QUESTION_STAR;
  addCoinRow(coins, 'w5_l1_late', 90, 5, 9);

  // Volcanic basalt stairs to Goal Flagpole
  addStairs(grid, 107, 16, 6, true);

  enemies.push(
    { id: 'w5_l1_e1', type: 'SLIME', x: 15 * 32, y: 15 * 32 },
    { id: 'w5_l1_e2', type: 'BEETLE', x: 29 * 32, y: 15 * 32 },
    { id: 'w5_l1_e3', type: 'SLIME', x: 38 * 32, y: 15 * 32 },
    { id: 'w5_l1_e4', type: 'BAT', x: 50 * 32, y: 8 * 32, patrolRange: 115 },
    { id: 'w5_l1_e5', type: 'BEETLE', x: 63 * 32, y: 15 * 32 },
    { id: 'w5_l1_e6', type: 'KNIGHT', x: 86 * 32, y: 15 * 32 },
    { id: 'w5_l1_e7', type: 'SLIME', x: 95 * 32, y: 15 * 32 },
    { id: 'w5_l1_e8', type: 'BEETLE', x: 104 * 32, y: 15 * 32 }
  );

  return {
    id: 21,
    worldId: 5,
    stageNumber: 1,
    name: 'Level 1: Ashen Outskirts',
    subtitle: 'Ash-Covered Wastes, Burning Rocks & Lava Pools',
    theme: 'VOLCANO',
    musicTrack: 'VOLCANO',
    hasAshfall: true,
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

export const world5Level1 = buildWorld5Level1();
