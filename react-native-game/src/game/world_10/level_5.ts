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
  addAncientCrumbleBridge,
  addLavaPit,
} from '../level_builder';

export function buildWorld10Level5(): LevelDefinition {
  const cols = 205;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // 10-5: The Eternal Temple
  // Grand sacred ziggurat culminating in the final battle against Azhurak, the Ancient Colossus
  fillGroundRange(grid, 0, 26, 16);
  addLavaPit(grid, 27, 32, 16);
  fillGroundRange(grid, 33, 64, 16);
  addLavaPit(grid, 65, 72, 16);
  fillGroundRange(grid, 73, 108, 16);
  addLavaPit(grid, 109, 116, 16);
  fillGroundRange(grid, 117, 148, 16);
  // Boss Arena floor (cols 149..204)
  fillGroundRange(grid, 149, 204, 16);

  // Sacred temple ceiling
  for (let c = 0; c < cols; c++) {
    grid[0][c] = TileType.SOLID_STONE;
  }

  // Ancient crumbling bridges over molten temple trenches
  addAncientCrumbleBridge(grid, 27, 32, 13);
  addAncientCrumbleBridge(grid, 65, 72, 13);

  // Moving golden altar platform over trench 109..116
  movingPlatforms.push({
    id: 'w10_l5_mp1',
    x: 109 * 32,
    y: 13 * 32,
    width: 96,
    endX: 114 * 32,
    endY: 13 * 32,
    speed: 82,
  });

  // Dart totem mounts
  grid[15][58] = TileType.SOLID_STONE;
  grid[14][58] = TileType.SOLID_STONE;
  grid[15][102] = TileType.SOLID_STONE;
  grid[14][102] = TileType.SOLID_STONE;

  // Power-Up Slot 1: Mushroom at col 14, row 12
  grid[12][13] = TileType.BRICK;
  grid[12][14] = TileType.QUESTION_MUSHROOM;
  grid[12][15] = TileType.BRICK;
  addCoinRow(coins, 'w10_5', 12, 5, 9);

  // Star Slot 1 at col 40, row 12
  grid[12][39] = TileType.BRICK;
  grid[12][40] = TileType.QUESTION_STAR;
  grid[12][41] = TileType.BRICK;

  // Power-Up Slot 2: Solar Fire Flower at col 80, row 12
  grid[12][79] = TileType.BRICK;
  grid[12][80] = TileType.QUESTION_FIRE;
  grid[12][81] = TileType.BRICK;
  addCoinRow(coins, 'w10_5', 78, 5, 9);

  // Power-Up Slot 3: Raccoon Feather at col 126, row 12
  grid[12][125] = TileType.BRICK;
  grid[12][126] = TileType.QUESTION_FEATHER;
  grid[12][127] = TileType.BRICK;

  // Star Slot 2 at col 140, row 12
  grid[12][139] = TileType.BRICK;
  grid[12][140] = TileType.QUESTION_STAR;
  grid[12][141] = TileType.BRICK;
  addCoinRow(coins, 'w10_5', 138, 5, 9);

  // Boss Arena elevated stone altars
  for (let c = 160; c <= 164; c++) grid[12][c] = TileType.BRIDGE;
  for (let c = 176; c <= 180; c++) grid[12][c] = TileType.BRIDGE;
  addCoinRow(coins, 'w10_5', 160, 5, 10);
  addCoinRow(coins, 'w10_5', 176, 5, 10);

  // Stone pivot for rotating solar flame totem bar
  grid[13][105] = TileType.SOLID_STONE;

  enemies.push(
    { id: 'w10_5_e1', type: 'KNIGHT', x: 20 * 32, y: 15 * 32, patrolRange: 96 },
    { id: 'w10_5_e2', type: 'BEETLE', x: 51 * 32, y: 15 * 32 },
    { id: 'w10_5_e3', type: 'BAT', x: 68 * 32, y: 8 * 32, patrolRange: 120 },
    { id: 'w10_5_e4', type: 'KNIGHT', x: 94 * 32, y: 15 * 32, patrolRange: 110 },
    { id: 'w10_5_e5', type: 'FIRE_BAR', x: 105 * 32 + 16, y: 13 * 32 + 16 },
    { id: 'w10_5_e6', type: 'BEETLE', x: 131 * 32, y: 15 * 32 }
  );

  return {
    id: 50,
    worldId: 10,
    stageNumber: 5,
    name: '10-5: The Eternal Temple',
    subtitle: 'Vanquish Azhurak, the Ancient Colossus in the heart of the lost civilization',
    theme: 'ETERNAL_TEMPLE',
    musicTrack: 'CASTLE_BOSS',
    hasFallingRocks: true,
    arrowTraps: [
      { col: 58, row: 14, direction: -1, intervalSeconds: 2.5, phaseOffset: 0.4 },
      { col: 102, row: 14, direction: -1, intervalSeconds: 2.4, phaseOffset: 1.3 },
    ],
    crusherPistons: [
      { col: 48, topRow: 1, crushRow: 15, cycleSeconds: 3.0, phaseOffset: 0.2 },
      { col: 88, topRow: 1, crushRow: 15, cycleSeconds: 3.0, phaseOffset: 1.5 },
      { col: 134, topRow: 1, crushRow: 15, cycleSeconds: 2.8, phaseOffset: 0.8 },
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
