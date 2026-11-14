import { LevelDefinition, TileType, CoinDef, EnemySpawnDef, MovingPlatformDef } from '../types';
import {
  LEVEL_ROWS,
  createEmptyGrid,
  fillGroundRange,
  fillIceGroundRange,
  addStairs,
  addCoinRow,
  addFragileIceBridge,
  addFreezingWaterPit,
} from '../level_builder';

export function buildWorld4Level4(): LevelDefinition {
  const cols = 128;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // Exposed mountain ledges separated by freezing abyssal chasms and icy plateaus
  fillGroundRange(grid, 0, 20);
  // Mountain Abyss 1 at cols 21..28
  fillIceGroundRange(grid, 29, 46, 16);
  addFreezingWaterPit(grid, 47, 55, 16);
  fillGroundRange(grid, 56, 74);
  // Mountain Abyss 2 at cols 75..85
  fillIceGroundRange(grid, 86, 127, 16);

  // Early Power-up slot 1 at col 11 (row 12 = 4 tiles above ground)
  grid[12][9] = TileType.QUESTION_COIN;
  grid[12][10] = TileType.BRICK;
  grid[12][11] = TileType.QUESTION_MUSHROOM;
  grid[12][12] = TileType.BRICK;
  grid[12][13] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w4_l4_intro', 9, 5, 9);

  // Exposed Fragile Ice Platforms across Mountain Abyss 1 (cols 21..28)
  addFragileIceBridge(grid, 22, 24, 13);
  addFragileIceBridge(grid, 26, 28, 11);
  addCoinRow(coins, 'w4_l4_abyss1', 22, 7, 8);

  // Wind-swept Glacier Plateau (cols 29..46) with icicle cluster and Star slot 1 at col 34 (row 11)
  grid[11][34] = TileType.QUESTION_STAR;
  grid[15][39] = TileType.ICICLE;
  grid[15][40] = TileType.ICICLE;
  for (let c = 38; c <= 41; c++) {
    grid[12][c] = TileType.BRIDGE;
  }

  // Mid Power-up slot 2 at col 44 (row 12 = 4 tiles above ground)
  grid[12][43] = TileType.BRICK;
  grid[12][44] = TileType.QUESTION_FEATHER;
  grid[12][45] = TileType.BRICK;

  // Freezing Water Gorge (cols 47..55) with moving mountain cable-platform
  movingPlatforms.push({
    id: 'w4_l4_mp1',
    x: 48 * 32,
    y: 13 * 32,
    width: 96,
    endX: 53 * 32,
    endY: 10 * 32,
    speed: 105,
  });
  addCoinRow(coins, 'w4_l4_gorge', 48, 6, 7);

  // Checkpoint at col 60
  const checkpoint = { x: 60 * 32, y: 14 * 32 };

  // High Exposed Ridge (cols 64..72) with Power-up slot 3 at col 68 (row 12)
  grid[12][66] = TileType.QUESTION_COIN;
  grid[12][68] = TileType.QUESTION_FIRE;
  grid[12][70] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w4_l4_ridge', 66, 5, 9);

  // Mountain Abyss 2 (cols 75..85): Dual moving platforms & fragile ice bridge in blizzard headwind
  movingPlatforms.push({
    id: 'w4_l4_mp2',
    x: 76 * 32,
    y: 13 * 32,
    width: 96,
    endX: 79 * 32,
    endY: 11 * 32,
    speed: 110,
  });
  addFragileIceBridge(grid, 81, 84, 11);
  addCoinRow(coins, 'w4_l4_abyss2', 77, 8, 8);

  // Final Ice Summit (cols 86..127) with icicle hazards, Star slot 2 at col 94, and stairs to Goal
  grid[11][94] = TileType.QUESTION_STAR;
  grid[15][98] = TileType.ICICLE;
  grid[15][99] = TileType.ICICLE;
  addFragileIceBridge(grid, 97, 100, 12);
  addStairs(grid, 106, 16, 6, true);

  enemies.push(
    { id: 'w4_l4_e1', type: 'SLIME', x: 16 * 32, y: 15 * 32 },
    { id: 'w4_l4_e2', type: 'BAT', x: 25 * 32, y: 7 * 32, patrolRange: 130 },
    { id: 'w4_l4_e3', type: 'BEETLE', x: 35 * 32, y: 15 * 32 },
    { id: 'w4_l4_e4', type: 'BAT', x: 51 * 32, y: 7 * 32, patrolRange: 140 },
    { id: 'w4_l4_e5', type: 'KNIGHT', x: 65 * 32, y: 15 * 32 },
    { id: 'w4_l4_e6', type: 'BAT', x: 80 * 32, y: 6 * 32, patrolRange: 150 },
    { id: 'w4_l4_e7', type: 'BEETLE', x: 92 * 32, y: 15 * 32 },
    { id: 'w4_l4_e8', type: 'KNIGHT', x: 103 * 32, y: 15 * 32 }
  );

  return {
    id: 19,
    worldId: 4,
    stageNumber: 4,
    name: 'Level 4: Blizzard Pass',
    subtitle: 'Howling Blizzard Winds & Exposed Ice Ledges',
    theme: 'SNOW',
    hasBlizzard: true,
    windForce: -62,
    musicTrack: 'SNOW',
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

export const world4Level4 = buildWorld4Level4();
