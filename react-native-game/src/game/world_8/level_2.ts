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
  addCrumbleBridge,
} from '../level_builder';

export function buildWorld8Level2(): LevelDefinition {
  const cols = 195;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // 8-2: Forgotten Graveyard
  // Ancient crypts, crumbling gravestones, skeletal patrols, and ghostly mist updrafts
  fillGroundRange(grid, 0, 24, 16);
  fillGroundRange(grid, 30, 56, 16);
  fillGroundRange(grid, 64, 96, 16);
  fillGroundRange(grid, 104, 138, 16);
  fillGroundRange(grid, 146, 194, 16);

  // Crumbling crypt bridges & phantom platforms
  addCrumbleBridge(grid, 25, 29, 15);
  addPhantomBridge(grid, 57, 63, 14);
  addCrumbleBridge(grid, 97, 103, 14);

  // Floating spectral coffin platforms over chasm 139..145
  movingPlatforms.push(
    {
      id: 'w8_l2_mp1',
      x: 139 * 32,
      y: 14 * 32,
      width: 96,
      endX: 143 * 32,
      endY: 10 * 32,
      speed: 68,
    },
    {
      id: 'w8_l2_mp2',
      x: 76 * 32,
      y: 11 * 32,
      width: 96,
      endX: 86 * 32,
      endY: 11 * 32,
      speed: 74,
    }
  );

  // Tombstone spike & cursed thorn hazards
  grid[15][17] = TileType.CURSED_THORN;
  grid[15][42] = TileType.CURSED_THORN;
  grid[15][43] = TileType.CURSED_THORN;
  grid[15][82] = TileType.SPIKE;
  grid[15][83] = TileType.SPIKE;
  grid[15][124] = TileType.CURSED_THORN;
  grid[15][125] = TileType.CURSED_THORN;

  // Power-Up Slot 1: Mushroom at col 13, row 12
  grid[12][12] = TileType.BRICK;
  grid[12][13] = TileType.QUESTION_MUSHROOM;
  grid[12][14] = TileType.BRICK;
  addCoinRow(coins, 'w8_2', 11, 5, 9);

  // Elevated mausoleum roof (cols 35..41, row 12)
  for (let c = 35; c <= 41; c++) grid[12][c] = TileType.SOLID_STONE;
  grid[8][38] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w8_2', 36, 5, 5);

  // Star Slot 1 at col 50, row 12
  grid[12][49] = TileType.BRICK;
  grid[12][50] = TileType.QUESTION_STAR;
  grid[12][51] = TileType.BRICK;

  // Power-Up Slot 2: Fire Flower at col 70, row 12
  grid[12][69] = TileType.BRICK;
  grid[12][70] = TileType.QUESTION_FIRE;
  grid[12][71] = TileType.BRICK;
  addCoinRow(coins, 'w8_2', 68, 5, 9);

  // Upper phantom walkway above the graveyard (cols 108..116, row 11)
  addPhantomBridge(grid, 108, 116, 11);
  addCoinRow(coins, 'w8_2', 109, 7, 8);

  // Power-Up Slot 3: Raccoon Feather at col 130, row 12
  grid[12][129] = TileType.BRICK;
  grid[12][130] = TileType.QUESTION_FEATHER;
  grid[12][131] = TileType.BRICK;

  // Star Slot 2 at col 156, row 12
  grid[12][155] = TileType.BRICK;
  grid[12][156] = TileType.QUESTION_STAR;
  grid[12][157] = TileType.BRICK;
  addCoinRow(coins, 'w8_2', 154, 5, 9);

  addStairs(grid, 176, 16, 6, true);
  addCoinRow(coins, 'w8_2', 177, 5, 9);

  enemies.push(
    { id: 'w8_2_e1', type: 'BEETLE', x: 20 * 32, y: 15 * 32 },
    { id: 'w8_2_e2', type: 'SLIME', x: 38 * 32, y: 15 * 32 },
    { id: 'w8_2_e3', type: 'BAT', x: 58 * 32, y: 9 * 32, patrolRange: 120 },
    { id: 'w8_2_e4', type: 'KNIGHT', x: 74 * 32, y: 15 * 32, patrolRange: 100 },
    { id: 'w8_2_e5', type: 'BEETLE', x: 91 * 32, y: 15 * 32 },
    { id: 'w8_2_e6', type: 'BAT', x: 112 * 32, y: 7 * 32, patrolRange: 130 },
    { id: 'w8_2_e7', type: 'KNIGHT', x: 132 * 32, y: 15 * 32, patrolRange: 110 },
    { id: 'w8_2_e8', type: 'BEETLE', x: 162 * 32, y: 15 * 32 }
  );

  return {
    id: 37,
    worldId: 8,
    stageNumber: 2,
    name: '8-2: Forgotten Graveyard',
    subtitle: 'Restless crypts, crumbling headstones, and spectral updrafts',
    theme: 'GRAVEYARD',
    musicTrack: 'SHADOWVEIL',
    windUpdrafts: [
      { startCol: 57, endCol: 63, minRow: 6, maxRow: 16, liftForce: 500 },
      { startCol: 97, endCol: 103, minRow: 6, maxRow: 16, liftForce: 500 },
    ],
    widthInTiles: cols,
    heightInTiles: LEVEL_ROWS,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    checkpoint: { x: 92 * 32, y: 14 * 32 },
    goalX: 185 * 32,
    goalY: 6 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}
