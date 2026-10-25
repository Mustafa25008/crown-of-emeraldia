import { LevelDefinition, TileType, CoinDef, EnemySpawnDef, MovingPlatformDef } from '../types';
import {
  LEVEL_ROWS,
  createEmptyGrid,
  fillGroundRange,
  addStairs,
  addCoinRow,
} from '../level_builder';

export function buildWorld2Level4(): LevelDefinition {
  const cols = 140;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // Abyssal Whirlpool seabed with thermal vents
  fillGroundRange(grid, 0, 22);
  fillGroundRange(grid, 30, 56);
  fillGroundRange(grid, 66, 94);
  fillGroundRange(grid, 106, 139);

  // Thermal magma trenches at the bottom of the abyss
  const trenchRanges = [
    [23, 29],
    [57, 65],
    [95, 105],
  ];
  for (const [start, end] of trenchRanges) {
    for (let c = start; c <= end; c++) {
      grid[17][c] = TileType.LAVA_TOP;
      grid[18][c] = TileType.LAVA_DEEP;
    }
  }

  // Power-up slot 1 at col 11 (row 12)
  grid[12][10] = TileType.BRICK;
  grid[12][11] = TileType.QUESTION_MUSHROOM;
  grid[12][12] = TileType.BRICK;
  grid[12][13] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w2_l4_c1', 9, 6, 9);

  // Moving platform across Thermal Trench 1 (cols 23..29)
  movingPlatforms.push({
    id: 'w2_l4_mp1',
    x: 23 * 32,
    y: 13 * 32,
    width: 96,
    endX: 27 * 32,
    endY: 10 * 32,
    speed: 90,
  });
  addCoinRow(coins, 'w2_l4_t1', 24, 5, 7);

  // Rotating Fire/Thermal Bar pillar & Star slot 1 at col 45
  grid[13][38] = TileType.SOLID_STONE;
  grid[12][38] = TileType.SOLID_STONE;
  for (let c = 42; c <= 48; c++) {
    grid[10][c] = c === 45 ? TileType.QUESTION_STAR : TileType.BRICK;
  }
  addCoinRow(coins, 'w2_l4_mid', 42, 7, 7);

  // Moving platforms across Thermal Trench 2 (cols 57..65)
  movingPlatforms.push({
    id: 'w2_l4_mp2',
    x: 58 * 32,
    y: 13 * 32,
    width: 96,
    endX: 63 * 32,
    endY: 9 * 32,
    speed: 95,
  });

  // Checkpoint at col 69
  const checkpoint = { x: 69 * 32, y: 14 * 32 };

  // Power-up slot 2 at col 74 (row 12)
  grid[12][73] = TileType.BRICK;
  grid[12][74] = TileType.QUESTION_FIRE;
  grid[12][75] = TileType.BRICK;

  // Solid spike reef barrier (cols 80..84 at row 15) with bridge at row 12 (cols 79..85)
  for (let c = 80; c <= 84; c++) {
    grid[15][c] = TileType.SPIKE;
  }
  for (let c = 79; c <= 85; c++) {
    grid[12][c] = TileType.BRIDGE;
  }
  addCoinRow(coins, 'w2_l4_bridge', 80, 5, 9);

  // Star slot 2 at col 89 (row 11)
  grid[11][89] = TileType.QUESTION_STAR;

  // Thermal Trench 3 (cols 95..105) with stone spire & platform
  grid[14][99] = TileType.SOLID_STONE;
  grid[15][99] = TileType.SOLID_STONE;
  grid[16][99] = TileType.SOLID_STONE;
  movingPlatforms.push({
    id: 'w2_l4_mp3',
    x: 101 * 32,
    y: 12 * 32,
    width: 96,
    endX: 104 * 32,
    endY: 12 * 32,
    speed: 100,
  });

  // Power-up slot 3 at col 109 (row 12)
  grid[12][108] = TileType.BRICK;
  grid[12][109] = TileType.QUESTION_FEATHER;
  grid[12][110] = TileType.BRICK;

  // Approach stairs to the Tidal Citadel
  addStairs(grid, 115, 16, 7, true);

  enemies.push(
    { id: 'w2_l4_e1', type: 'KNIGHT', x: 16 * 32, y: 15 * 32 },
    { id: 'w2_l4_e2', type: 'BAT', x: 26 * 32, y: 7 * 32, patrolRange: 130 },
    { id: 'w2_l4_fb1', type: 'FIRE_BAR', x: 38 * 32 + 16, y: 12 * 32 + 16 },
    { id: 'w2_l4_e3', type: 'BEETLE', x: 50 * 32, y: 15 * 32 },
    { id: 'w2_l4_e4', type: 'BAT', x: 61 * 32, y: 7 * 32, patrolRange: 140 },
    { id: 'w2_l4_fb2', type: 'FIRE_BAR', x: 77 * 32 + 16, y: 13 * 32 + 16 },
    { id: 'w2_l4_e5', type: 'KNIGHT', x: 87 * 32, y: 15 * 32 },
    { id: 'w2_l4_e6', type: 'BAT', x: 99 * 32, y: 8 * 32, patrolRange: 130 },
    { id: 'w2_l4_e7', type: 'BEETLE', x: 112 * 32, y: 15 * 32 }
  );

  return {
    id: 9,
    worldId: 2,
    stageNumber: 4,
    name: 'Level 4: Abyssal Whirlpool',
    subtitle: 'Thermal Vents & Deep Trench Guardians',
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
    goalX: 129 * 32,
    goalY: 6 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}

export const world2Level4 = buildWorld2Level4();
