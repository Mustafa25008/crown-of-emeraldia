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

export function buildWorld8Level3(): LevelDefinition {
  const cols = 200;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // 8-3: Phantom Manor
  // Haunted gothic mansion with floating furniture platforms, shadow teleporters, and swinging chandeliers
  fillGroundRange(grid, 0, 26, 16);
  fillGroundRange(grid, 38, 68, 16);
  fillGroundRange(grid, 80, 114, 16);
  fillGroundRange(grid, 126, 158, 16);
  fillGroundRange(grid, 166, 199, 16);

  // Moving haunted furniture platforms across grand manor halls
  movingPlatforms.push(
    {
      id: 'w8_l3_mp1',
      x: 28 * 32,
      y: 14 * 32,
      width: 96,
      endX: 35 * 32,
      endY: 11 * 32,
      speed: 72,
    },
    {
      id: 'w8_l3_mp2',
      x: 70 * 32,
      y: 13 * 32,
      width: 96,
      endX: 77 * 32,
      endY: 13 * 32,
      speed: 80,
    },
    {
      id: 'w8_l3_mp3',
      x: 116 * 32,
      y: 14 * 32,
      width: 96,
      endX: 123 * 32,
      endY: 10 * 32,
      speed: 76,
    }
  );

  // Phantom bridge over chasm 159..165
  addPhantomBridge(grid, 159, 165, 14);

  // Power-Up Slot 1: Mushroom at col 14, row 12
  grid[12][13] = TileType.BRICK;
  grid[12][14] = TileType.QUESTION_MUSHROOM;
  grid[12][15] = TileType.BRICK;
  addCoinRow(coins, 'w8_3', 12, 5, 9);

  // Upper gallery balcony (cols 44..54, row 11) reachable via Shadow Teleporter 1
  for (let c = 44; c <= 54; c++) grid[11][c] = TileType.SOLID_STONE;
  addCoinRow(coins, 'w8_3', 45, 9, 8);

  // Star Slot 1 at col 60, row 12
  grid[12][59] = TileType.BRICK;
  grid[12][60] = TileType.QUESTION_STAR;
  grid[12][61] = TileType.BRICK;

  // Power-Up Slot 2: Solar Fire Flower at col 88, row 12
  grid[12][87] = TileType.BRICK;
  grid[12][88] = TileType.QUESTION_FIRE;
  grid[12][89] = TileType.BRICK;
  addCoinRow(coins, 'w8_3', 86, 5, 9);

  // High chandelier gallery (cols 96..106, row 10) reachable via Shadow Teleporter 2
  addPhantomBridge(grid, 96, 106, 10);
  addCoinRow(coins, 'w8_3', 97, 9, 7);

  // Power-Up Slot 3: Raccoon Feather at col 134, row 12
  grid[12][133] = TileType.BRICK;
  grid[12][134] = TileType.QUESTION_FEATHER;
  grid[12][135] = TileType.BRICK;

  // Star Slot 2 at col 150, row 12
  grid[12][149] = TileType.BRICK;
  grid[12][150] = TileType.QUESTION_STAR;
  grid[12][151] = TileType.BRICK;
  addCoinRow(coins, 'w8_3', 148, 5, 9);

  // Stone pivot for rotating shadow-flame bar & ceiling mounts for chandeliers
  grid[13][92] = TileType.SOLID_STONE;
  grid[2][63] = TileType.SOLID_STONE;
  grid[2][144] = TileType.SOLID_STONE;

  addStairs(grid, 181, 16, 6, true);
  addCoinRow(coins, 'w8_3', 182, 5, 9);

  enemies.push(
    { id: 'w8_3_e1', type: 'SLIME', x: 20 * 32, y: 15 * 32 },
    { id: 'w8_3_e2', type: 'KNIGHT', x: 50 * 32, y: 15 * 32, patrolRange: 110 },
    { id: 'w8_3_e3', type: 'BAT', x: 64 * 32, y: 9 * 32, patrolRange: 120 },
    { id: 'w8_3_e4', type: 'FIRE_BAR', x: 92 * 32 + 16, y: 13 * 32 + 16 },
    { id: 'w8_3_e5', type: 'BEETLE', x: 108 * 32, y: 15 * 32 },
    { id: 'w8_3_e6', type: 'KNIGHT', x: 140 * 32, y: 15 * 32, patrolRange: 100 },
    { id: 'w8_3_e7', type: 'BAT', x: 161 * 32, y: 9 * 32, patrolRange: 120 },
    { id: 'w8_3_e8', type: 'BEETLE', x: 170 * 32, y: 15 * 32 }
  );

  return {
    id: 38,
    worldId: 8,
    stageNumber: 3,
    name: '8-3: Phantom Manor',
    subtitle: 'Poltergeist furniture, shadow portals, and swinging chandeliers',
    theme: 'PHANTOM_MANOR',
    musicTrack: 'SHADOWVEIL',
    swingingPendulums: [
      { pivotCol: 63, pivotRow: 3, lengthPx: 10 * 32, maxAngleRad: 0.58, speed: 2.1, phaseOffset: 0 },
      { pivotCol: 144, pivotRow: 3, lengthPx: 10 * 32, maxAngleRad: 0.6, speed: 2.3, phaseOffset: 1.5 },
    ],
    teleporters: [
      { id: 'w8_3_tp1', fromCol: 41, fromRow: 16, toCol: 46, toRow: 11 },
      { id: 'w8_3_tp2', fromCol: 94, fromRow: 16, toCol: 98, toRow: 10 },
    ],
    widthInTiles: cols,
    heightInTiles: LEVEL_ROWS,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    checkpoint: { x: 108 * 32, y: 14 * 32 },
    goalX: 190 * 32,
    goalY: 6 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}
