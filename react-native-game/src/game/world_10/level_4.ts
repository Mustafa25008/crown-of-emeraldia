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
  addAncientCrumbleBridge,
} from '../level_builder';

export function buildWorld10Level4(): LevelDefinition {
  const cols = 200;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // 10-4: Colossus Valley
  // Monumental valley of giant stone statues, falling temple boulders, crushing monoliths, and dart totems
  fillGroundRange(grid, 0, 26, 16);
  fillGroundRange(grid, 36, 68, 16);
  fillGroundRange(grid, 78, 114, 16);
  fillGroundRange(grid, 124, 158, 16);
  fillGroundRange(grid, 166, 199, 16);

  // Ancient crumbling bridges & moving monolith platforms
  addAncientCrumbleBridge(grid, 27, 35, 14);
  addAncientCrumbleBridge(grid, 69, 77, 14);
  addAncientCrumbleBridge(grid, 159, 165, 14);

  movingPlatforms.push({
    id: 'w10_l4_mp1',
    x: 115 * 32,
    y: 14 * 32,
    width: 96,
    endX: 121 * 32,
    endY: 10 * 32,
    speed: 78,
  });

  // Poisonous flora & dart totem mounts
  grid[15][19] = TileType.POISON_PLANT;
  grid[15][58] = TileType.SOLID_STONE;
  grid[14][58] = TileType.SOLID_STONE;
  grid[15][104] = TileType.SOLID_STONE;
  grid[14][104] = TileType.SOLID_STONE;
  grid[15][148] = TileType.SOLID_STONE;
  grid[14][148] = TileType.SOLID_STONE;

  // Power-Up Slot 1: Mushroom at col 14, row 12
  grid[12][13] = TileType.BRICK;
  grid[12][14] = TileType.QUESTION_MUSHROOM;
  grid[12][15] = TileType.BRICK;
  addCoinRow(coins, 'w10_4', 12, 5, 9);

  // Star Slot 1 at col 42, row 12
  grid[12][41] = TileType.BRICK;
  grid[12][42] = TileType.QUESTION_STAR;
  grid[12][43] = TileType.BRICK;
  addCoinRow(coins, 'w10_4', 40, 5, 9);

  // Power-Up Slot 2: Solar Fire Flower at col 84, row 12
  grid[12][83] = TileType.BRICK;
  grid[12][84] = TileType.QUESTION_FIRE;
  grid[12][85] = TileType.BRICK;
  addCoinRow(coins, 'w10_4', 82, 5, 9);

  // High colossus shoulder terrace (cols 90..100, row 8)
  for (let c = 90; c <= 100; c++) grid[8][c] = TileType.SOLID_STONE;
  addCoinRow(coins, 'w10_4', 91, 9, 5);

  // Power-Up Slot 3: Raccoon Feather at col 130, row 12
  grid[12][129] = TileType.BRICK;
  grid[12][130] = TileType.QUESTION_FEATHER;
  grid[12][131] = TileType.BRICK;

  // Star Slot 2 at col 152, row 12
  grid[12][151] = TileType.BRICK;
  grid[12][152] = TileType.QUESTION_STAR;
  grid[12][153] = TileType.BRICK;
  addCoinRow(coins, 'w10_4', 150, 5, 9);

  // Overhead stone lintels for crushing monolith traps
  for (let c = 47; c <= 49; c++) grid[2][c] = TileType.SOLID_STONE;
  for (let c = 135; c <= 137; c++) grid[2][c] = TileType.SOLID_STONE;

  addStairs(grid, 181, 16, 6, true);
  addCoinRow(coins, 'w10_4', 182, 5, 9);

  enemies.push(
    { id: 'w10_4_e1', type: 'BEETLE', x: 22 * 32, y: 15 * 32 },
    { id: 'w10_4_e2', type: 'KNIGHT', x: 51 * 32, y: 15 * 32, patrolRange: 100 },
    { id: 'w10_4_e3', type: 'BAT', x: 72 * 32, y: 8 * 32, patrolRange: 120 },
    { id: 'w10_4_e4', type: 'KNIGHT', x: 96 * 32, y: 15 * 32, patrolRange: 100 },
    { id: 'w10_4_e5', type: 'BEETLE', x: 108 * 32, y: 15 * 32 },
    { id: 'w10_4_e6', type: 'KNIGHT', x: 140 * 32, y: 15 * 32, patrolRange: 100 },
    { id: 'w10_4_e7', type: 'BAT', x: 161 * 32, y: 8 * 32, patrolRange: 120 },
    { id: 'w10_4_e8', type: 'SLIME', x: 170 * 32, y: 15 * 32 }
  );

  return {
    id: 49,
    worldId: 10,
    stageNumber: 4,
    name: '10-4: Colossus Valley',
    subtitle: 'Towering stone guardians, seismic debris, and ancient monolith traps',
    theme: 'FORGOTTEN_JUNGLE',
    musicTrack: 'RUINS',
    hasFallingRocks: true,
    arrowTraps: [
      { col: 58, row: 14, direction: -1, intervalSeconds: 2.6, phaseOffset: 0.3 },
      { col: 104, row: 14, direction: -1, intervalSeconds: 2.5, phaseOffset: 1.2 },
      { col: 148, row: 14, direction: -1, intervalSeconds: 2.4, phaseOffset: 0.7 },
    ],
    crusherPistons: [
      { col: 48, topRow: 3, crushRow: 15, cycleSeconds: 3.1, phaseOffset: 0.5 },
      { col: 136, topRow: 3, crushRow: 15, cycleSeconds: 2.9, phaseOffset: 1.4 },
    ],
    widthInTiles: cols,
    heightInTiles: LEVEL_ROWS,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    checkpoint: { x: 110 * 32, y: 14 * 32 },
    goalX: 190 * 32,
    goalY: 6 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}
