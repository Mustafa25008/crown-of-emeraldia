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

export function buildWorld3Level4(): LevelDefinition {
  const cols = 130;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // Wind-swept desert plateaus, quicksand basins, and sandstorm canyons
  fillGroundRange(grid, 0, 23);
  addQuicksandPit(grid, 24, 31, 16);
  fillGroundRange(grid, 32, 54);
  fillGroundRange(grid, 62, 86);
  addQuicksandPit(grid, 87, 95, 16);
  fillGroundRange(grid, 96, 129);

  // Early Windbreak Block Formation: Power-up slot 1 at col 12 (row 12)
  grid[12][10] = TileType.QUESTION_COIN;
  grid[12][11] = TileType.BRICK;
  grid[12][12] = TileType.QUESTION_MUSHROOM;
  grid[12][13] = TileType.BRICK;
  grid[12][14] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w3_l4_intro', 10, 5, 9);

  // Windbreak pipe before Quicksand Basin 1 (cols 24..31)
  addPipe(grid, 19, 16, 3);
  addCrumbleBridge(grid, 25, 30, 12);
  addCoinRow(coins, 'w3_l4_qs1', 25, 6, 9);

  // Star slot 1 at col 36 (row 11)
  grid[11][35] = TileType.BRICK;
  grid[11][36] = TileType.QUESTION_STAR;
  grid[11][37] = TileType.BRICK;

  // Cactus cluster (cols 41..44) with elevated bridge at row 12 + Power-up slot 2 at col 48 (row 8)
  for (let c = 41; c <= 44; c++) {
    grid[15][c] = TileType.CACTUS;
  }
  for (let c = 40; c <= 51; c++) {
    grid[12][c] = TileType.BRIDGE;
  }
  grid[8][47] = TileType.BRICK;
  grid[8][48] = TileType.QUESTION_FIRE;
  grid[8][49] = TileType.BRICK;
  addCoinRow(coins, 'w3_l4_mid', 41, 6, 9);

  // Sandstorm Canyon (cols 55..61) with twin moving wind-barge platforms
  movingPlatforms.push(
    {
      id: 'w3_l4_mp1',
      x: 55 * 32,
      y: 14 * 32,
      width: 96,
      endX: 59 * 32,
      endY: 10 * 32,
      speed: 105,
    }
  );
  addCoinRow(coins, 'w3_l4_canyon', 56, 5, 8);

  // Checkpoint at col 65
  const checkpoint = { x: 65 * 32, y: 14 * 32 };

  // Late Sandstorm Gauntlet: Power-up slot 3 at col 74 (row 12), Star slot 2 at col 83 (row 11)
  grid[12][72] = TileType.QUESTION_COIN;
  grid[12][73] = TileType.BRICK;
  grid[12][74] = TileType.QUESTION_FEATHER;
  grid[12][75] = TileType.BRICK;
  grid[12][76] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w3_l4_late', 72, 5, 9);

  grid[15][80] = TileType.CACTUS;
  grid[11][83] = TileType.QUESTION_STAR;

  // Quicksand Basin 2 (cols 87..95) with crumble platforms & high bridge
  addCrumbleBridge(grid, 88, 90, 12);
  addCrumbleBridge(grid, 92, 94, 11);
  addCoinRow(coins, 'w3_l4_qs2', 88, 7, 8);

  // Final stairs to goal flagpole
  addStairs(grid, 106, 16, 7, true);

  enemies.push(
    { id: 'w3_l4_e1', type: 'SLIME', x: 15 * 32, y: 15 * 32 },
    { id: 'w3_l4_e2', type: 'BAT', x: 27 * 32, y: 7 * 32, patrolRange: 130 },
    { id: 'w3_l4_e3', type: 'BEETLE', x: 38 * 32, y: 15 * 32 },
    { id: 'w3_l4_e4', type: 'KNIGHT', x: 51 * 32, y: 15 * 32 },
    { id: 'w3_l4_e5', type: 'BAT', x: 58 * 32, y: 7 * 32, patrolRange: 140 },
    { id: 'w3_l4_e6', type: 'BEETLE', x: 70 * 32, y: 15 * 32 },
    { id: 'w3_l4_e7', type: 'KNIGHT', x: 78 * 32, y: 15 * 32 },
    { id: 'w3_l4_e8', type: 'BAT', x: 91 * 32, y: 6 * 32, patrolRange: 140 },
    { id: 'w3_l4_e9', type: 'KNIGHT', x: 101 * 32, y: 15 * 32 }
  );

  return {
    id: 14,
    worldId: 3,
    stageNumber: 4,
    name: 'Level 4: The Sandstorm',
    subtitle: 'Howling Desert Gales, Swirling Dust & High Dunes',
    theme: 'DESERT',
    hasSandstorm: true,
    windForce: -55,
    musicTrack: 'DESERT',
    widthInTiles: cols,
    heightInTiles: LEVEL_ROWS,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    checkpoint,
    goalX: 119 * 32,
    goalY: 6 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}

export const world3Level4 = buildWorld3Level4();
