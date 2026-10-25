import { LevelDefinition, TileType, CoinDef, EnemySpawnDef, MovingPlatformDef } from '../types';
import {
  LEVEL_ROWS,
  createEmptyGrid,
  fillGroundRange,
  addStairs,
  addCoinRow,
} from '../level_builder';

export function buildWorld2Level3(): LevelDefinition {
  const cols = 136;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // Sunken Galleon Reef seabed sections
  fillGroundRange(grid, 0, 24);
  fillGroundRange(grid, 29, 60);
  fillGroundRange(grid, 66, 98);
  fillGroundRange(grid, 104, 135);

  // Spike trench between 24 and 29 with upper bridge at row 12
  for (let c = 25; c <= 28; c++) {
    grid[17][c] = TileType.SPIKE;
    grid[18][c] = TileType.GROUND_DEEP;
  }
  for (let c = 25; c <= 28; c++) {
    grid[12][c] = TileType.BRIDGE;
  }

  // Early supply deck (Power-up slot 1 at col 13)
  grid[12][12] = TileType.BRICK;
  grid[12][13] = TileType.QUESTION_MUSHROOM;
  grid[12][14] = TileType.QUESTION_COIN;
  grid[12][15] = TileType.BRICK;
  addCoinRow(coins, 'w2_l3_intro', 12, 4, 9);

  // Sunken Galleon Deck (cols 33..54): lower deck at row 12, upper captain's deck at row 8
  for (let c = 33; c <= 43; c++) {
    grid[12][c] = TileType.BRIDGE;
  }
  for (let c = 45; c <= 55; c++) {
    grid[9][c] = TileType.BRICK;
  }
  // Power-up slot 2 above the captain's deck at row 5, col 50 (4 full tiles above row 9!)
  grid[5][49] = TileType.QUESTION_COIN;
  grid[5][50] = TileType.QUESTION_FIRE;
  grid[5][51] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w2_l3_deck_l', 34, 8, 9);
  addCoinRow(coins, 'w2_l3_deck_r', 46, 8, 7);

  // Star slot 1 at col 63 over the reef gap
  grid[11][62] = TileType.SOLID_STONE;
  grid[11][63] = TileType.SOLID_STONE;
  grid[7][63] = TileType.QUESTION_STAR;

  // Checkpoint at col 69
  const checkpoint = { x: 69 * 32, y: 14 * 32 };

  // Sea urchin spike bed (cols 75..83 at row 15) with multi-tier bridges above
  for (let c = 75; c <= 83; c++) {
    grid[15][c] = TileType.SPIKE;
  }
  for (let c = 74; c <= 78; c++) grid[12][c] = TileType.BRIDGE;
  for (let c = 80; c <= 84; c++) grid[10][c] = TileType.BRIDGE;
  // Power-up slot 3 at col 82, row 6 (4 full tiles above row 10 bridge!)
  grid[6][82] = TileType.QUESTION_FEATHER;
  addCoinRow(coins, 'w2_l3_reef_arc', 74, 5, 9);

  // Star slot 2 at col 94
  grid[12][93] = TileType.BRICK;
  grid[12][94] = TileType.QUESTION_STAR;
  grid[12][95] = TileType.BRICK;

  // Moving salvager platforms across final abyss (cols 99..103)
  movingPlatforms.push({
    id: 'w2_l3_mp1',
    x: 99 * 32,
    y: 13 * 32,
    width: 96,
    endX: 102 * 32,
    endY: 9 * 32,
    speed: 90,
  });
  addCoinRow(coins, 'w2_l3_abyss', 99, 5, 7);

  // Final sunken monument stairs
  addStairs(grid, 112, 16, 6, true);

  enemies.push(
    { id: 'w2_l3_e1', type: 'BEETLE', x: 18 * 32, y: 15 * 32 },
    { id: 'w2_l3_e2', type: 'BAT', x: 26 * 32, y: 8 * 32, patrolRange: 120 },
    { id: 'w2_l3_e3', type: 'KNIGHT', x: 38 * 32, y: 15 * 32 },
    { id: 'w2_l3_e4', type: 'BAT', x: 48 * 32, y: 6 * 32, patrolRange: 140 },
    { id: 'w2_l3_e5', type: 'SLIME', x: 56 * 32, y: 15 * 32 },
    { id: 'w2_l3_e6', type: 'BAT', x: 63 * 32, y: 9 * 32, patrolRange: 110 },
    { id: 'w2_l3_e7', type: 'BEETLE', x: 72 * 32, y: 15 * 32 },
    { id: 'w2_l3_e8', type: 'BAT', x: 79 * 32, y: 7 * 32, patrolRange: 130 },
    { id: 'w2_l3_e9', type: 'KNIGHT', x: 89 * 32, y: 15 * 32 },
    { id: 'w2_l3_e10', type: 'BEETLE', x: 107 * 32, y: 15 * 32 }
  );

  return {
    id: 8,
    worldId: 2,
    stageNumber: 3,
    name: 'Level 3: Sunken Galleon Reef',
    subtitle: 'Shipwreck Decks & Urchin Fortresses',
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
    goalX: 125 * 32,
    goalY: 6 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}

export const world2Level3 = buildWorld2Level3();
