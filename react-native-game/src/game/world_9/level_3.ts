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
  addFragileCrystalBridge,
  addFreezingWaterPit,
  addConveyorBelt,
} from '../level_builder';

export function buildWorld9Level3(): LevelDefinition {
  const cols = 196;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // 9-3: Luminous Lake
  // Subterranean glowing crystal lake with rushing water currents, geyser spouts, and fragile crystal stepping stones
  fillGroundRange(grid, 0, 24, 16);
  addFreezingWaterPit(grid, 25, 34, 16);
  fillGroundRange(grid, 35, 64, 16);
  addFreezingWaterPit(grid, 65, 76, 16);
  fillGroundRange(grid, 77, 108, 16);
  addFreezingWaterPit(grid, 109, 120, 16);
  fillGroundRange(grid, 121, 152, 16);
  addFreezingWaterPit(grid, 153, 160, 16);
  fillGroundRange(grid, 161, 195, 16);

  // Fragile crystal bridges & rushing water current ledges
  addFragileCrystalBridge(grid, 26, 33, 13);
  addConveyorBelt(grid, 44, 52, 16, 'RIGHT');
  addFragileCrystalBridge(grid, 66, 75, 13);
  addConveyorBelt(grid, 86, 96, 16, 'LEFT');
  addFragileCrystalBridge(grid, 154, 159, 13);

  // Floating crystal raft over lake 109..120
  movingPlatforms.push({
    id: 'w9_l3_mp1',
    x: 110 * 32,
    y: 13 * 32,
    width: 96,
    endX: 117 * 32,
    endY: 13 * 32,
    speed: 74,
  });

  // Crystal Spike hazards
  grid[15][18] = TileType.CRYSTAL_SPIKE;
  grid[15][56] = TileType.CRYSTAL_SPIKE;
  grid[15][134] = TileType.CRYSTAL_SPIKE;
  grid[15][135] = TileType.CRYSTAL_SPIKE;

  // Power-Up Slot 1: Mushroom at col 13, row 12
  grid[12][12] = TileType.BRICK;
  grid[12][13] = TileType.QUESTION_MUSHROOM;
  grid[12][14] = TileType.BRICK;
  addCoinRow(coins, 'w9_3', 11, 5, 9);

  // Star Slot 1 at col 40, row 12
  grid[12][39] = TileType.BRICK;
  grid[12][40] = TileType.QUESTION_STAR;
  grid[12][41] = TileType.BRICK;
  addCoinRow(coins, 'w9_3', 38, 5, 9);

  // Power-Up Slot 2: Solar Fire Flower at col 80, row 12
  grid[12][79] = TileType.BRICK;
  grid[12][80] = TileType.QUESTION_FIRE;
  grid[12][81] = TileType.BRICK;
  addCoinRow(coins, 'w9_3', 78, 5, 9);

  // Upper luminous crystal arch (cols 86..96, row 8)
  addFragileCrystalBridge(grid, 86, 96, 8);
  addCoinRow(coins, 'w9_3', 87, 9, 5);

  // Power-Up Slot 3: Raccoon Feather at col 126, row 12
  grid[12][125] = TileType.BRICK;
  grid[12][126] = TileType.QUESTION_FEATHER;
  grid[12][127] = TileType.BRICK;

  // Star Slot 2 at col 144, row 12
  grid[12][143] = TileType.BRICK;
  grid[12][144] = TileType.QUESTION_STAR;
  grid[12][145] = TileType.BRICK;
  addCoinRow(coins, 'w9_3', 142, 5, 9);

  addStairs(grid, 177, 16, 6, true);
  addCoinRow(coins, 'w9_3', 178, 5, 9);

  enemies.push(
    { id: 'w9_3_e1', type: 'SLIME', x: 20 * 32, y: 15 * 32 },
    { id: 'w9_3_e2', type: 'BAT', x: 30 * 32, y: 8 * 32, patrolRange: 120 },
    { id: 'w9_3_e3', type: 'BEETLE', x: 50 * 32, y: 15 * 32 },
    { id: 'w9_3_e4', type: 'BAT', x: 70 * 32, y: 8 * 32, patrolRange: 130 },
    { id: 'w9_3_e5', type: 'KNIGHT', x: 98 * 32, y: 15 * 32, patrolRange: 100 },
    { id: 'w9_3_e6', type: 'BEETLE', x: 130 * 32, y: 15 * 32 },
    { id: 'w9_3_e7', type: 'KNIGHT', x: 148 * 32, y: 15 * 32, patrolRange: 100 },
    { id: 'w9_3_e8', type: 'SLIME', x: 166 * 32, y: 15 * 32 }
  );

  return {
    id: 43,
    worldId: 9,
    stageNumber: 3,
    name: '9-3: Luminous Lake',
    subtitle: 'Subterranean glowing waters, crystal geysers, and rushing currents',
    theme: 'LUMINOUS_LAKE',
    musicTrack: 'CRYSTAL',
    steamVents: [
      { col: 30, baseRow: 16, peakRow: 8, cycleSeconds: 3.4, phaseOffset: 0 },
      { col: 71, baseRow: 16, peakRow: 8, cycleSeconds: 3.4, phaseOffset: 1.5 },
      { col: 156, baseRow: 16, peakRow: 8, cycleSeconds: 3.2, phaseOffset: 0.8 },
    ],
    widthInTiles: cols,
    heightInTiles: LEVEL_ROWS,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    checkpoint: { x: 102 * 32, y: 14 * 32 },
    goalX: 186 * 32,
    goalY: 6 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}
