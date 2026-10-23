import { LevelDefinition, TileType, CoinDef, EnemySpawnDef, MovingPlatformDef } from '../types';
import {
  LEVEL_ROWS,
  createEmptyGrid,
  fillGroundRange,
  addPipe,
  addStairs,
  addCoinRow,
} from '../level_builder';

export function buildLevel1(): LevelDefinition {
  const cols = 120;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // Ground segments with beginner-friendly pits
  fillGroundRange(grid, 0, 34);
  fillGroundRange(grid, 37, 68);
  fillGroundRange(grid, 71, 119);

  // Intro Question & Brick formations
  grid[12][10] = TileType.QUESTION_COIN;
  grid[12][14] = TileType.BRICK;
  grid[12][15] = TileType.QUESTION_MUSHROOM;
  grid[12][16] = TileType.BRICK;
  grid[12][17] = TileType.QUESTION_COIN;
  grid[12][18] = TileType.BRICK;
  grid[8][16] = TileType.QUESTION_COIN;

  addCoinRow(coins, 'l1_intro', 14, 5, 10);

  // Pipes
  addPipe(grid, 23, 16, 2);
  addPipe(grid, 30, 16, 3);

  // Mid section after first pit
  grid[12][41] = TileType.BRICK;
  grid[12][42] = TileType.QUESTION_FIRE;
  grid[12][43] = TileType.BRICK;

  // High brick bridge with coins (row 8 bridge, coins placed at row 6)
  for (let c = 45; c <= 51; c++) {
    grid[8][c] = TileType.BRICK;
  }
  addCoinRow(coins, 'l1_high', 45, 7, 5);

  // Checkpoint at col 56
  const checkpoint = { x: 56 * 32, y: 14 * 32 };

  // Star block & bricks
  grid[12][60] = TileType.BRICK;
  grid[12][61] = TileType.QUESTION_STAR;
  grid[12][62] = TileType.BRICK;

  addPipe(grid, 65, 16, 3);

  // Second gap & platforming challenge: row 11 blocks with coins placed above at row 8
  for (let c = 75; c <= 79; c++) {
    grid[11][c] = c === 77 ? TileType.QUESTION_COIN : TileType.BRICK;
  }
  addCoinRow(coins, 'l1_mid2', 75, 5, 8);

  // Staircase before flagpole
  addStairs(grid, 84, 16, 4, true);
  addStairs(grid, 90, 16, 4, false);
  addStairs(grid, 98, 16, 6, true);

  // Enemies
  enemies.push(
    { id: 'l1_e1', type: 'SLIME', x: 19 * 32, y: 15 * 32 },
    { id: 'l1_e2', type: 'SLIME', x: 27 * 32, y: 15 * 32 },
    { id: 'l1_e3', type: 'SLIME', x: 44 * 32, y: 15 * 32 },
    { id: 'l1_e4', type: 'BEETLE', x: 52 * 32, y: 15 * 32 },
    { id: 'l1_e5', type: 'SLIME', x: 63 * 32, y: 15 * 32 },
    { id: 'l1_e6', type: 'SLIME', x: 76 * 32, y: 15 * 32 },
    { id: 'l1_e7', type: 'BEETLE', x: 81 * 32, y: 15 * 32 },
    { id: 'l1_e8', type: 'SLIME', x: 96 * 32, y: 15 * 32 }
  );

  return {
    id: 1,
    name: 'Level 1: Green Hills',
    subtitle: 'Sunlit Meadows of Emeraldia',
    theme: 'HILLS',
    musicTrack: 'OVERWORLD',
    widthInTiles: cols,
    heightInTiles: LEVEL_ROWS,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    checkpoint,
    goalX: 110 * 32,
    goalY: 6 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}

export const level1 = buildLevel1();
