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

export function buildWorld10Level2(): LevelDefinition {
  const cols = 198;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // 10-2: Temple of Traps
  // Booby-trapped temple interior with dart/arrow totems, crushing stone pillars, and swinging blades
  fillGroundRange(grid, 0, 26, 16);
  fillGroundRange(grid, 34, 66, 16);
  fillGroundRange(grid, 74, 108, 16);
  fillGroundRange(grid, 118, 152, 16);
  fillGroundRange(grid, 160, 197, 16);

  // Ancient crumbling bridges over spike pits
  addAncientCrumbleBridge(grid, 27, 33, 14);
  addAncientCrumbleBridge(grid, 67, 73, 14);
  addAncientCrumbleBridge(grid, 153, 159, 14);

  // Moving stone slab over pit 109..117
  movingPlatforms.push({
    id: 'w10_l2_mp1',
    x: 109 * 32,
    y: 14 * 32,
    width: 96,
    endX: 115 * 32,
    endY: 11 * 32,
    speed: 75,
  });

  // Arrow Trap totem blocks mounted on ground
  grid[15][22] = TileType.SOLID_STONE;
  grid[14][22] = TileType.SOLID_STONE;
  grid[15][60] = TileType.SOLID_STONE;
  grid[14][60] = TileType.SOLID_STONE;
  grid[15][102] = TileType.SOLID_STONE;
  grid[14][102] = TileType.SOLID_STONE;
  grid[15][146] = TileType.SOLID_STONE;
  grid[14][146] = TileType.SOLID_STONE;

  // Power-Up Slot 1: Mushroom at col 13, row 12
  grid[12][12] = TileType.BRICK;
  grid[12][13] = TileType.QUESTION_MUSHROOM;
  grid[12][14] = TileType.BRICK;
  addCoinRow(coins, 'w10_2', 11, 5, 9);

  // Star Slot 1 at col 40, row 12
  grid[12][39] = TileType.BRICK;
  grid[12][40] = TileType.QUESTION_STAR;
  grid[12][41] = TileType.BRICK;
  addCoinRow(coins, 'w10_2', 38, 5, 9);

  // Power-Up Slot 2: Solar Fire Flower at col 80, row 12
  grid[12][79] = TileType.BRICK;
  grid[12][80] = TileType.QUESTION_FIRE;
  grid[12][81] = TileType.BRICK;
  addCoinRow(coins, 'w10_2', 78, 5, 9);

  // Power-Up Slot 3: Raccoon Feather at col 124, row 12
  grid[12][123] = TileType.BRICK;
  grid[12][124] = TileType.QUESTION_FEATHER;
  grid[12][125] = TileType.BRICK;

  // Star Slot 2 at col 140, row 12
  grid[12][139] = TileType.BRICK;
  grid[12][140] = TileType.QUESTION_STAR;
  grid[12][141] = TileType.BRICK;
  addCoinRow(coins, 'w10_2', 138, 5, 9);

  // Overhead temple stone lintels for crushers & swinging temple blades
  for (let c = 45; c <= 56; c++) grid[2][c] = TileType.SOLID_STONE;
  for (let c = 87; c <= 98; c++) grid[2][c] = TileType.SOLID_STONE;
  for (let c = 133; c <= 136; c++) grid[2][c] = TileType.SOLID_STONE;

  addStairs(grid, 179, 16, 6, true);
  addCoinRow(coins, 'w10_2', 180, 5, 9);

  enemies.push(
    { id: 'w10_2_e1', type: 'BEETLE', x: 18 * 32, y: 15 * 32 },
    { id: 'w10_2_e2', type: 'KNIGHT', x: 50 * 32, y: 15 * 32, patrolRange: 100 },
    { id: 'w10_2_e3', type: 'BAT', x: 69 * 32, y: 8 * 32, patrolRange: 120 },
    { id: 'w10_2_e4', type: 'KNIGHT', x: 92 * 32, y: 15 * 32, patrolRange: 100 },
    { id: 'w10_2_e5', type: 'BEETLE', x: 130 * 32, y: 15 * 32 },
    { id: 'w10_2_e6', type: 'KNIGHT', x: 164 * 32, y: 15 * 32, patrolRange: 100 }
  );

  return {
    id: 47,
    worldId: 10,
    stageNumber: 2,
    name: '10-2: Temple of Traps',
    subtitle: 'Ancient dart totems, crushing stone pillars, and swinging temple blades',
    theme: 'TEMPLE_OF_TRAPS',
    musicTrack: 'RUINS',
    arrowTraps: [
      { col: 22, row: 14, direction: -1, intervalSeconds: 2.8, phaseOffset: 0.2 },
      { col: 60, row: 14, direction: -1, intervalSeconds: 2.6, phaseOffset: 1.1 },
      { col: 102, row: 14, direction: -1, intervalSeconds: 2.5, phaseOffset: 0.6 },
      { col: 146, row: 14, direction: -1, intervalSeconds: 2.4, phaseOffset: 1.5 },
    ],
    crusherPistons: [
      { col: 46, topRow: 3, crushRow: 15, cycleSeconds: 3.2, phaseOffset: 0 },
      { col: 88, topRow: 3, crushRow: 15, cycleSeconds: 3.0, phaseOffset: 1.4 },
      { col: 134, topRow: 3, crushRow: 15, cycleSeconds: 2.9, phaseOffset: 0.7 },
    ],
    swingingPendulums: [
      { pivotCol: 54, pivotRow: 3, lengthPx: 10 * 32, maxAngleRad: 0.58, speed: 2.2, phaseOffset: 0.5 },
      { pivotCol: 96, pivotRow: 3, lengthPx: 10 * 32, maxAngleRad: 0.6, speed: 2.3, phaseOffset: 1.8 },
    ],
    widthInTiles: cols,
    heightInTiles: LEVEL_ROWS,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    checkpoint: { x: 104 * 32, y: 14 * 32 },
    goalX: 188 * 32,
    goalY: 6 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}
