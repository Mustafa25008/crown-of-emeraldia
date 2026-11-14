import { LevelDefinition, TileType, CoinDef, EnemySpawnDef, MovingPlatformDef } from '../types';
import {
  LEVEL_ROWS,
  createEmptyGrid,
  fillGroundRange,
  addPipe,
  addStairs,
  addCoinRow,
} from '../level_builder';

export function buildWorld2Level2(): LevelDefinition {
  const cols = 132;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // Seabed segments separated by deep ocean kelp trenches
  fillGroundRange(grid, 0, 22);
  fillGroundRange(grid, 30, 56);
  fillGroundRange(grid, 66, 92);
  fillGroundRange(grid, 102, 131);

  // Power-up slot 1 at col 12 (row 12)
  grid[12][11] = TileType.BRICK;
  grid[12][12] = TileType.QUESTION_MUSHROOM;
  grid[12][13] = TileType.BRICK;
  addCoinRow(coins, 'w2_l2_c1', 10, 5, 9);

  // Underwater current elevator across Trench 1 (cols 23..29)
  movingPlatforms.push({
    id: 'w2_l2_mp1',
    x: 23 * 32,
    y: 14 * 32,
    width: 96,
    endX: 27 * 32,
    endY: 9 * 32,
    speed: 80,
  });
  addCoinRow(coins, 'w2_l2_t1', 24, 5, 6);

  // Kelp Canopy Upper & Lower Reefs (cols 32..54)
  // Bridge at row 12 + Power-up slot 2 at col 38 (row 8 = 4 tiles above bridge)
  for (let c = 34; c <= 42; c++) {
    grid[12][c] = TileType.BRIDGE;
  }
  grid[8][38] = TileType.QUESTION_FIRE;
  addCoinRow(coins, 'w2_l2_kelp1', 35, 7, 10);

  // Upper secret coral shelf (row 9) + Star slot 1 at col 49 (row 5 = 4 tiles above shelf)
  for (let c = 46; c <= 53; c++) {
    grid[9][c] = TileType.BRIDGE;
  }
  grid[5][49] = TileType.QUESTION_STAR;
  grid[5][51] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w2_l2_kelp_top', 46, 8, 7);

  // Trench 2 (cols 57..65) with coral stepping stones
  grid[13][59] = TileType.SOLID_STONE;
  grid[13][60] = TileType.SOLID_STONE;
  grid[10][63] = TileType.SOLID_STONE;
  grid[10][64] = TileType.SOLID_STONE;
  addCoinRow(coins, 'w2_l2_t2', 58, 7, 7);

  // Checkpoint at col 69
  const checkpoint = { x: 69 * 32, y: 14 * 32 };

  // Mid-late Kelp Forest Pipes & Power-up slot 3 at col 78
  addPipe(grid, 73, 16, 3);
  grid[11][77] = TileType.BRICK;
  grid[11][78] = TileType.QUESTION_FEATHER;
  grid[11][79] = TileType.BRICK;
  addPipe(grid, 83, 16, 4);

  // Star slot 2 at col 89 (row 11)
  grid[11][88] = TileType.QUESTION_COIN;
  grid[11][89] = TileType.QUESTION_STAR;
  grid[11][90] = TileType.QUESTION_COIN;

  // Trench 3 (cols 93..101) with twin underwater elevators
  movingPlatforms.push(
    {
      id: 'w2_l2_mp2',
      x: 93 * 32,
      y: 14 * 32,
      width: 96,
      endX: 96 * 32,
      endY: 10 * 32,
      speed: 85,
    },
    {
      id: 'w2_l2_mp3',
      x: 98 * 32,
      y: 10 * 32,
      width: 96,
      endX: 100 * 32,
      endY: 14 * 32,
      speed: 85,
    }
  );
  addCoinRow(coins, 'w2_l2_t3', 94, 6, 7);

  // Final staircase to flagpole
  addStairs(grid, 110, 16, 6, true);

  enemies.push(
    { id: 'w2_l2_e1', type: 'BEETLE', x: 16 * 32, y: 15 * 32 },
    { id: 'w2_l2_e2', type: 'BAT', x: 25 * 32, y: 8 * 32, patrolRange: 140 },
    { id: 'w2_l2_e3', type: 'SLIME', x: 37 * 32, y: 15 * 32 },
    { id: 'w2_l2_e4', type: 'BAT', x: 42 * 32, y: 6 * 32, patrolRange: 130 },
    { id: 'w2_l2_e5', type: 'KNIGHT', x: 52 * 32, y: 15 * 32 },
    { id: 'w2_l2_e6', type: 'BAT', x: 61 * 32, y: 9 * 32, patrolRange: 120 },
    { id: 'w2_l2_e7', type: 'BEETLE', x: 80 * 32, y: 15 * 32 },
    { id: 'w2_l2_e8', type: 'BAT', x: 87 * 32, y: 7 * 32, patrolRange: 130 },
    { id: 'w2_l2_e9', type: 'KNIGHT', x: 105 * 32, y: 15 * 32 }
  );

  return {
    id: 7,
    worldId: 2,
    stageNumber: 2,
    name: 'Level 2: Kelp Forest Trench',
    subtitle: 'Swaying Seaweed & Deep Reef Chasms',
    theme: 'UNDERWATER',
    isUnderwater: true,
    musicTrack: 'UNDERWATER',
    widthInTiles: cols,
    heightInTiles: LEVEL_ROWS,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    checkpoint,
    goalX: 122 * 32,
    goalY: 6 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}

export const world2Level2 = buildWorld2Level2();
