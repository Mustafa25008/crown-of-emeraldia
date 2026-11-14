import { LevelDefinition, TileType, CoinDef, EnemySpawnDef, MovingPlatformDef } from '../types';
import {
  LEVEL_ROWS,
  createEmptyGrid,
  fillGroundRange,
  addPipe,
  addStairs,
  addCoinRow,
} from '../level_builder';

export function buildWorld3Level1(): LevelDefinition {
  const cols = 124;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // Golden sand dunes with canyon gaps
  fillGroundRange(grid, 0, 32);
  fillGroundRange(grid, 36, 70);
  fillGroundRange(grid, 75, 123);

  // Elevated sand dune plateaus (row 15)
  for (let c = 18; c <= 23; c++) {
    grid[15][c] = TileType.GROUND_TOP;
    grid[16][c] = TileType.GROUND_DEEP;
  }

  // Intro Desert Ruins Block Formation
  // Power-up slot 1 at col 12 (row 12 = 4 tiles above row 16 ground), Star slot 1 at col 26 (row 8)
  grid[12][10] = TileType.QUESTION_COIN;
  grid[12][11] = TileType.BRICK;
  grid[12][12] = TileType.QUESTION_MUSHROOM;
  grid[12][13] = TileType.BRICK;
  grid[12][14] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w3_l1_intro', 10, 5, 9);

  // Desert Saguaro Cacti hazards with sandstone arch above
  grid[14][20] = TileType.CACTUS;
  grid[14][21] = TileType.CACTUS;
  for (let c = 19; c <= 23; c++) {
    grid[11][c] = TileType.BRIDGE;
  }
  addCoinRow(coins, 'w3_l1_cactus1', 19, 5, 8);

  // Star slot 1 at col 26 (row 8)
  grid[8][25] = TileType.BRICK;
  grid[8][26] = TileType.QUESTION_STAR;
  grid[8][27] = TileType.BRICK;

  // Ancient Oasis pipes
  addPipe(grid, 29, 16, 3);
  addPipe(grid, 40, 16, 4);

  // Mid Desert Ruins: Bridge at row 12 + Power-up slot 2 at col 50 (row 8 = 4 tiles above row 12 bridge)
  for (let c = 47; c <= 54; c++) {
    grid[12][c] = TileType.BRIDGE;
  }
  grid[8][49] = TileType.BRICK;
  grid[8][50] = TileType.QUESTION_FIRE;
  grid[8][51] = TileType.BRICK;
  addCoinRow(coins, 'w3_l1_mid', 47, 8, 10);

  // Checkpoint at col 58
  const checkpoint = { x: 58 * 32, y: 14 * 32 };

  // Cactus patch at cols 62..65 with upper sandstone bridge at row 12
  for (let c = 62; c <= 65; c++) {
    grid[15][c] = TileType.CACTUS;
  }
  for (let c = 61; c <= 66; c++) {
    grid[12][c] = TileType.BRIDGE;
  }
  addCoinRow(coins, 'w3_l1_cactus2', 61, 6, 9);

  // Moving dune platform across second canyon (cols 71..74)
  movingPlatforms.push({
    id: 'w3_l1_mp1',
    x: 71 * 32,
    y: 14 * 32,
    width: 96,
    endX: 73 * 32,
    endY: 11 * 32,
    speed: 90,
  });
  addCoinRow(coins, 'w3_l1_canyon', 71, 4, 8);

  // Late Desert Obelisks: Power-up slot 3 at col 82, Star slot 2 at col 94
  grid[12][80] = TileType.QUESTION_COIN;
  grid[12][81] = TileType.BRICK;
  grid[12][82] = TileType.QUESTION_FEATHER;
  grid[12][83] = TileType.BRICK;
  grid[12][84] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w3_l1_late', 80, 5, 9);

  addPipe(grid, 88, 16, 3);
  grid[11][94] = TileType.QUESTION_STAR;

  // Sandstone pyramid stairs to goal flagpole
  addStairs(grid, 100, 16, 6, true);

  // Desert Enemies (Dune Scorpions, Scarab Tortoises, Desert Vultures, Temple Mummy Guards)
  enemies.push(
    { id: 'w3_l1_e1', type: 'SLIME', x: 16 * 32, y: 15 * 32 },
    { id: 'w3_l1_e2', type: 'BEETLE', x: 26 * 32, y: 15 * 32 },
    { id: 'w3_l1_e3', type: 'BAT', x: 34 * 32, y: 9 * 32, patrolRange: 120 },
    { id: 'w3_l1_e4', type: 'SLIME', x: 45 * 32, y: 15 * 32 },
    { id: 'w3_l1_e5', type: 'KNIGHT', x: 67 * 32, y: 15 * 32 },
    { id: 'w3_l1_e6', type: 'BAT', x: 76 * 32, y: 8 * 32, patrolRange: 140 },
    { id: 'w3_l1_e7', type: 'BEETLE', x: 85 * 32, y: 15 * 32 },
    { id: 'w3_l1_e8', type: 'KNIGHT', x: 96 * 32, y: 15 * 32 }
  );

  return {
    id: 11,
    worldId: 3,
    stageNumber: 1,
    name: 'Level 1: Dune Dash',
    subtitle: 'Sun-Baked Dunes, Cacti & Ancient Ruins',
    theme: 'DESERT',
    musicTrack: 'DESERT',
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

export const world3Level1 = buildWorld3Level1();
