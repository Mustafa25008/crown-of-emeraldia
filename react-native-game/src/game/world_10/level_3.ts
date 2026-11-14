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
  addFreezingWaterPit,
  addConveyorBelt,
} from '../level_builder';

export function buildWorld10Level3(): LevelDefinition {
  const cols = 198;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // 10-3: Sunken Ruins
  // Half-submerged aqueducts and flooded temple courtyards with water currents, geysers, and collapsing bridges
  fillGroundRange(grid, 0, 24, 16);
  addFreezingWaterPit(grid, 25, 34, 16);
  fillGroundRange(grid, 35, 64, 16);
  addFreezingWaterPit(grid, 65, 76, 16);
  fillGroundRange(grid, 77, 110, 16);
  addFreezingWaterPit(grid, 111, 122, 16);
  fillGroundRange(grid, 123, 154, 16);
  addFreezingWaterPit(grid, 155, 162, 16);
  fillGroundRange(grid, 163, 197, 16);

  // Ancient crumbling bridges & aqueduct water currents
  addAncientCrumbleBridge(grid, 26, 33, 13);
  addConveyorBelt(grid, 44, 52, 16, 'RIGHT');
  addAncientCrumbleBridge(grid, 66, 75, 13);
  addConveyorBelt(grid, 88, 98, 16, 'LEFT');
  addAncientCrumbleBridge(grid, 156, 161, 13);

  // Moving stone barge over flooded basin 111..122
  movingPlatforms.push({
    id: 'w10_l3_mp1',
    x: 112 * 32,
    y: 13 * 32,
    width: 96,
    endX: 119 * 32,
    endY: 13 * 32,
    speed: 74,
  });

  // Poisonous flora hazards
  grid[15][18] = TileType.POISON_PLANT;
  grid[15][56] = TileType.POISON_PLANT;
  grid[15][136] = TileType.POISON_PLANT;
  grid[15][137] = TileType.POISON_PLANT;

  // Power-Up Slot 1: Mushroom at col 13, row 12
  grid[12][12] = TileType.BRICK;
  grid[12][13] = TileType.QUESTION_MUSHROOM;
  grid[12][14] = TileType.BRICK;
  addCoinRow(coins, 'w10_3', 11, 5, 9);

  // Star Slot 1 at col 40, row 12
  grid[12][39] = TileType.BRICK;
  grid[12][40] = TileType.QUESTION_STAR;
  grid[12][41] = TileType.BRICK;
  addCoinRow(coins, 'w10_3', 38, 5, 9);

  // Power-Up Slot 2: Solar Fire Flower at col 80, row 12
  grid[12][79] = TileType.BRICK;
  grid[12][80] = TileType.QUESTION_FIRE;
  grid[12][81] = TileType.BRICK;
  addCoinRow(coins, 'w10_3', 78, 5, 9);

  // Upper aqueduct walkway (cols 88..98, row 8)
  addAncientCrumbleBridge(grid, 88, 98, 8);
  addCoinRow(coins, 'w10_3', 89, 9, 5);

  // Power-Up Slot 3: Raccoon Feather at col 128, row 12
  grid[12][127] = TileType.BRICK;
  grid[12][128] = TileType.QUESTION_FEATHER;
  grid[12][129] = TileType.BRICK;

  // Star Slot 2 at col 146, row 12
  grid[12][145] = TileType.BRICK;
  grid[12][146] = TileType.QUESTION_STAR;
  grid[12][147] = TileType.BRICK;
  addCoinRow(coins, 'w10_3', 144, 5, 9);

  addStairs(grid, 179, 16, 6, true);
  addCoinRow(coins, 'w10_3', 180, 5, 9);

  enemies.push(
    { id: 'w10_3_e1', type: 'SLIME', x: 20 * 32, y: 15 * 32 },
    { id: 'w10_3_e2', type: 'BAT', x: 30 * 32, y: 8 * 32, patrolRange: 120 },
    { id: 'w10_3_e3', type: 'BEETLE', x: 50 * 32, y: 15 * 32 },
    { id: 'w10_3_e4', type: 'BAT', x: 70 * 32, y: 8 * 32, patrolRange: 130 },
    { id: 'w10_3_e5', type: 'KNIGHT', x: 100 * 32, y: 15 * 32, patrolRange: 100 },
    { id: 'w10_3_e6', type: 'BEETLE', x: 132 * 32, y: 15 * 32 },
    { id: 'w10_3_e7', type: 'KNIGHT', x: 150 * 32, y: 15 * 32, patrolRange: 100 },
    { id: 'w10_3_e8', type: 'SLIME', x: 168 * 32, y: 15 * 32 }
  );

  return {
    id: 48,
    worldId: 10,
    stageNumber: 3,
    name: '10-3: Sunken Ruins',
    subtitle: 'Flooded temple courtyards, ancient aqueducts, and pressurized geysers',
    theme: 'SUNKEN_RUINS',
    musicTrack: 'RUINS',
    steamVents: [
      { col: 30, baseRow: 16, peakRow: 8, cycleSeconds: 3.3, phaseOffset: 0 },
      { col: 71, baseRow: 16, peakRow: 8, cycleSeconds: 3.3, phaseOffset: 1.4 },
      { col: 158, baseRow: 16, peakRow: 8, cycleSeconds: 3.1, phaseOffset: 0.7 },
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
