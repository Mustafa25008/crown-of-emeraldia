import {
  LevelDefinition,
  TileType,
  CoinDef,
  EnemySpawnDef,
  MovingPlatformDef,
} from '../types';
import {
  LEVEL_ROWS,
  createEmptyGrid,
  fillGroundRange,
  addStairs,
  addCoinRow,
  addPhantomBridge,
} from '../level_builder';

export function buildWorld8Level1(): LevelDefinition {
  const cols = 190;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // 8-1: Haunted Woods
  // Eerie dark-fantasy forest with gnarled trees, cursed thorns, phantom platforms, and shadow spirits
  fillGroundRange(grid, 0, 26, 16);
  fillGroundRange(grid, 31, 60, 16);
  fillGroundRange(grid, 66, 98, 16);
  fillGroundRange(grid, 104, 140, 16);
  fillGroundRange(grid, 146, 189, 16);

  // Phantom bridges over dark forest chasms
  addPhantomBridge(grid, 27, 30, 15);
  addPhantomBridge(grid, 61, 65, 14);
  addPhantomBridge(grid, 99, 103, 14);

  // Moving haunted root platform over chasm 141..145
  movingPlatforms.push({
    id: 'w8_l1_mp1',
    x: 141 * 32,
    y: 14 * 32,
    width: 96,
    endX: 144 * 32,
    endY: 11 * 32,
    speed: 62,
  });

  // Cursed thorn patches on solid ground
  grid[15][18] = TileType.CURSED_THORN;
  grid[15][46] = TileType.CURSED_THORN;
  grid[15][47] = TileType.CURSED_THORN;
  grid[15][84] = TileType.CURSED_THORN;
  grid[15][122] = TileType.CURSED_THORN;
  grid[15][123] = TileType.CURSED_THORN;

  // Power-Up Slot 1: Growth Mushroom at col 14, row 12 (4 tiles above row 16)
  grid[12][13] = TileType.BRICK;
  grid[12][14] = TileType.QUESTION_MUSHROOM;
  grid[12][15] = TileType.BRICK;
  addCoinRow(coins, 'w8_1', 12, 5, 9);

  // Elevated gnarled branch terrace
  for (let c = 36; c <= 42; c++) grid[12][c] = TileType.BRICK;
  grid[12][39] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w8_1', 36, 7, 9);

  // Star Slot 1 at col 52, row 11
  grid[11][51] = TileType.BRICK;
  grid[11][52] = TileType.QUESTION_STAR;
  grid[11][53] = TileType.BRICK;

  // Power-Up Slot 2: Solar Fire Flower at col 74, row 12
  grid[12][73] = TileType.BRICK;
  grid[12][74] = TileType.QUESTION_FIRE;
  grid[12][75] = TileType.BRICK;
  addCoinRow(coins, 'w8_1', 72, 5, 9);

  // High phantom canopy route (cols 80..92)
  addPhantomBridge(grid, 80, 84, 8);
  addPhantomBridge(grid, 87, 91, 8);
  addCoinRow(coins, 'w8_1', 80, 12, 6);

  // Mid-stage stone ruins and question blocks
  for (let c = 110; c <= 116; c++) grid[12][c] = TileType.SOLID_STONE;
  grid[8][113] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w8_1', 111, 5, 5);

  // Power-Up Slot 3: Raccoon Feather at col 130, row 12
  grid[12][129] = TileType.BRICK;
  grid[12][130] = TileType.QUESTION_FEATHER;
  grid[12][131] = TileType.BRICK;

  // Star Slot 2 at col 154, row 12
  grid[12][153] = TileType.BRICK;
  grid[12][154] = TileType.QUESTION_STAR;
  grid[12][155] = TileType.BRICK;
  addCoinRow(coins, 'w8_1', 152, 5, 9);

  // Final stone stairs to Shadowveil gate
  addStairs(grid, 172, 16, 6, true);
  addCoinRow(coins, 'w8_1', 173, 5, 9);

  // Enemies: Shadow Wisps (SLIME), Cursed Skulls (BEETLE), Phantom Bats (BAT), Dark Knights (KNIGHT)
  enemies.push(
    { id: 'w8_1_e1', type: 'SLIME', x: 21 * 32, y: 15 * 32 },
    { id: 'w8_1_e2', type: 'BAT', x: 34 * 32, y: 9 * 32, patrolRange: 110 },
    { id: 'w8_1_e3', type: 'BEETLE', x: 54 * 32, y: 15 * 32 },
    { id: 'w8_1_e4', type: 'SLIME', x: 76 * 32, y: 15 * 32 },
    { id: 'w8_1_e5', type: 'BAT', x: 92 * 32, y: 8 * 32, patrolRange: 130 },
    { id: 'w8_1_e6', type: 'KNIGHT', x: 115 * 32, y: 15 * 32, patrolRange: 100 },
    { id: 'w8_1_e7', type: 'BEETLE', x: 134 * 32, y: 15 * 32 },
    { id: 'w8_1_e8', type: 'KNIGHT', x: 158 * 32, y: 15 * 32, patrolRange: 96 }
  );

  return {
    id: 36,
    worldId: 8,
    stageNumber: 1,
    name: '8-1: Haunted Woods',
    subtitle: 'Whispering boughs and phantom paths beneath a cursed twilight',
    theme: 'HAUNTED_WOODS',
    musicTrack: 'SHADOWVEIL',
    widthInTiles: cols,
    heightInTiles: LEVEL_ROWS,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    checkpoint: { x: 94 * 32, y: 14 * 32 },
    goalX: 181 * 32,
    goalY: 6 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}
