import { LevelDefinition, TileType, CoinDef, EnemySpawnDef, MovingPlatformDef } from '../types';
import {
  LEVEL_ROWS,
  createEmptyGrid,
  fillGroundRange,
  addPipe,
  addStairs,
  addCoinRow,
} from '../level_builder';

export function buildWorld2Level1(): LevelDefinition {
  const cols = 124;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // Sandy coral seabed with gentle ocean trenches
  fillGroundRange(grid, 0, 30);
  fillGroundRange(grid, 35, 68);
  fillGroundRange(grid, 73, 123);

  // Intro Coral Reef Question & Brick formations
  // Power-up slot 1 at col 14 (row 12 = 4 tiles above row 16 seabed), Star slot 1 at col 22 (row 8)
  grid[12][12] = TileType.QUESTION_COIN;
  grid[12][13] = TileType.BRICK;
  grid[12][14] = TileType.QUESTION_MUSHROOM;
  grid[12][15] = TileType.BRICK;
  grid[12][16] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w2_l1_intro', 12, 5, 9);

  // High coral arch for swimming & Star slot 1
  for (let c = 20; c <= 24; c++) {
    grid[8][c] = c === 22 ? TileType.QUESTION_STAR : TileType.BRICK;
  }
  addCoinRow(coins, 'w2_l1_arch', 20, 5, 5);

  // Sea vent pipes
  addPipe(grid, 26, 16, 3);
  addPipe(grid, 39, 16, 4);

  // Mid coral reef bridge (row 11) + Power-up slot 2 at col 48 (row 7 = 4 tiles above row 11 bridge)
  for (let c = 45; c <= 52; c++) {
    grid[11][c] = TileType.BRIDGE;
  }
  grid[7][47] = TileType.BRICK;
  grid[7][48] = TileType.QUESTION_FIRE;
  grid[7][49] = TileType.BRICK;
  addCoinRow(coins, 'w2_l1_mid', 45, 8, 9);

  // Checkpoint at col 58
  const checkpoint = { x: 58 * 32, y: 14 * 32 };

  // Sea urchin spikes on seabed with coral bridge at row 12
  for (let c = 62; c <= 65; c++) {
    grid[15][c] = TileType.SPIKE;
  }
  for (let c = 61; c <= 66; c++) {
    grid[12][c] = TileType.BRIDGE;
  }
  addCoinRow(coins, 'w2_l1_spikes', 61, 6, 9);

  // Second trench swimming rings of coins (cols 69..72)
  addCoinRow(coins, 'w2_l1_trench_top', 69, 4, 7);
  addCoinRow(coins, 'w2_l1_trench_bot', 69, 4, 11);

  // Late coral reef formation: Power-up slot 3 at col 80, Star slot 2 at col 92
  grid[12][79] = TileType.BRICK;
  grid[12][80] = TileType.QUESTION_FEATHER;
  grid[12][81] = TileType.BRICK;
  addCoinRow(coins, 'w2_l1_late', 78, 5, 9);

  addPipe(grid, 86, 16, 3);
  grid[11][92] = TileType.QUESTION_STAR;

  // Coral steps to flagpole
  addStairs(grid, 100, 16, 6, true);

  // Aquatic Enemies (Cheep-Cheep fish, Blooper squids, Sea Beetles, Reef Crabs)
  enemies.push(
    { id: 'w2_l1_e1', type: 'SLIME', x: 18 * 32, y: 15 * 32 },
    { id: 'w2_l1_e2', type: 'BAT', x: 28 * 32, y: 9 * 32, patrolRange: 130 },
    { id: 'w2_l1_e3', type: 'BEETLE', x: 44 * 32, y: 15 * 32 },
    { id: 'w2_l1_e4', type: 'BAT', x: 53 * 32, y: 8 * 32, patrolRange: 140 },
    { id: 'w2_l1_e5', type: 'KNIGHT', x: 67 * 32, y: 15 * 32 },
    { id: 'w2_l1_e6', type: 'BAT', x: 75 * 32, y: 10 * 32, patrolRange: 120 },
    { id: 'w2_l1_e7', type: 'BEETLE', x: 83 * 32, y: 15 * 32 },
    { id: 'w2_l1_e8', type: 'BAT', x: 94 * 32, y: 7 * 32, patrolRange: 130 }
  );

  return {
    id: 6,
    worldId: 2,
    stageNumber: 1,
    name: 'Level 1: Coral Shallows',
    subtitle: 'Sunlit Reefs & Swimming Currents',
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
    goalX: 113 * 32,
    goalY: 6 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}

export const world2Level1 = buildWorld2Level1();
