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
  addCoinRow,
  addPhantomBridge,
  addLavaPit,
} from '../level_builder';

export function buildWorld8Level5(): LevelDefinition {
  const cols = 205;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // 8-5: Shadowveil Castle
  // Dark gothic citadel culminating in the battle against Nocthar, the Shadow King
  fillGroundRange(grid, 0, 26, 16);
  addLavaPit(grid, 27, 32, 16);
  fillGroundRange(grid, 33, 64, 16);
  addLavaPit(grid, 65, 72, 16);
  fillGroundRange(grid, 73, 108, 16);
  addLavaPit(grid, 109, 116, 16);
  fillGroundRange(grid, 117, 148, 16);
  // Boss Arena floor (cols 149..204)
  fillGroundRange(grid, 149, 204, 16);

  // Castle ceiling battlements
  for (let c = 0; c < cols; c++) {
    grid[0][c] = TileType.SOLID_STONE;
  }

  // Phantom bridges over dark abyssal pits
  addPhantomBridge(grid, 27, 32, 13);
  addPhantomBridge(grid, 65, 72, 13);

  // Moving shadow platform over pit 109..116
  movingPlatforms.push({
    id: 'w8_l5_mp1',
    x: 109 * 32,
    y: 13 * 32,
    width: 96,
    endX: 114 * 32,
    endY: 13 * 32,
    speed: 78,
  });

  // Cursed thorn hazards
  grid[15][44] = TileType.CURSED_THORN;
  grid[15][45] = TileType.CURSED_THORN;
  grid[15][90] = TileType.CURSED_THORN;
  grid[15][91] = TileType.CURSED_THORN;

  // Power-Up Slot 1: Mushroom at col 14, row 12
  grid[12][13] = TileType.BRICK;
  grid[12][14] = TileType.QUESTION_MUSHROOM;
  grid[12][15] = TileType.BRICK;
  addCoinRow(coins, 'w8_5', 12, 5, 9);

  // Star Slot 1 at col 40, row 12
  grid[12][39] = TileType.BRICK;
  grid[12][40] = TileType.QUESTION_STAR;
  grid[12][41] = TileType.BRICK;

  // Power-Up Slot 2: Solar Fire Flower at col 80, row 12
  grid[12][79] = TileType.BRICK;
  grid[12][80] = TileType.QUESTION_FIRE;
  grid[12][81] = TileType.BRICK;
  addCoinRow(coins, 'w8_5', 78, 5, 9);

  // Power-Up Slot 3: Raccoon Feather at col 126, row 12 (before boss arena)
  grid[12][125] = TileType.BRICK;
  grid[12][126] = TileType.QUESTION_FEATHER;
  grid[12][127] = TileType.BRICK;

  // Star Slot 2 at col 140, row 12
  grid[12][139] = TileType.BRICK;
  grid[12][140] = TileType.QUESTION_STAR;
  grid[12][141] = TileType.BRICK;
  addCoinRow(coins, 'w8_5', 138, 5, 9);

  // Boss Arena elevated shadow platforms (for dodging Nocthar's shadow volleys & teleports)
  for (let c = 160; c <= 164; c++) grid[12][c] = TileType.BRIDGE;
  for (let c = 176; c <= 180; c++) grid[12][c] = TileType.BRIDGE;
  addCoinRow(coins, 'w8_5', 160, 5, 10);
  addCoinRow(coins, 'w8_5', 176, 5, 10);

  // Stone pivots for rotating shadow-flame bars
  grid[13][52] = TileType.SOLID_STONE;
  grid[13][102] = TileType.SOLID_STONE;

  enemies.push(
    { id: 'w8_5_e1', type: 'KNIGHT', x: 20 * 32, y: 15 * 32, patrolRange: 96 },
    { id: 'w8_5_e2', type: 'FIRE_BAR', x: 52 * 32 + 16, y: 13 * 32 + 16 },
    { id: 'w8_5_e3', type: 'BAT', x: 68 * 32, y: 8 * 32, patrolRange: 120 },
    { id: 'w8_5_e4', type: 'KNIGHT', x: 96 * 32, y: 15 * 32, patrolRange: 110 },
    { id: 'w8_5_e5', type: 'FIRE_BAR', x: 102 * 32 + 16, y: 13 * 32 + 16 },
    { id: 'w8_5_e6', type: 'BEETLE', x: 132 * 32, y: 15 * 32 }
  );

  return {
    id: 40,
    worldId: 8,
    stageNumber: 5,
    name: '8-5: Shadowveil Castle',
    subtitle: 'Confront Nocthar, the Shadow King in the throne room of eternal night',
    theme: 'SHADOW_CASTLE',
    musicTrack: 'CASTLE_BOSS',
    swingingPendulums: [
      { pivotCol: 58, pivotRow: 2, lengthPx: 10 * 32, maxAngleRad: 0.58, speed: 2.2, phaseOffset: 0.4 },
      { pivotCol: 134, pivotRow: 2, lengthPx: 10 * 32, maxAngleRad: 0.6, speed: 2.4, phaseOffset: 1.7 },
    ],
    widthInTiles: cols,
    heightInTiles: LEVEL_ROWS,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    checkpoint: { x: 120 * 32, y: 14 * 32 },
    hasBoss: true,
    bossArenaStartX: 152 * 32,
    goalX: 196 * 32,
    goalY: 6 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}
