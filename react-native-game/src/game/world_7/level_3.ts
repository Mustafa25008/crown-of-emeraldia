import {
  LevelDefinition,
  TileType,
  CoinDef,
  EnemySpawnDef,
  MovingPlatformDef,
  SwingingPendulumDef,
} from '../types';
import {
  createEmptyGrid,
  fillGroundRange,
  addPipe,
  addStairs,
  addCoinRow,
  addConveyorBelt,
  addTempCogBridge,
} from '../level_builder';

function buildWorld7Level3(): LevelDefinition {
  const cols = 136;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];
  const swingingPendulums: SwingingPendulumDef[] = [];

  // 1. Clocktower Vestibule & First Swinging Pendulum (Cols 0 - 24)
  fillGroundRange(grid, 0, 24, 16);
  grid[12][8] = TileType.BRICK;
  grid[12][9] = TileType.QUESTION_MUSHROOM; // First Power-up
  grid[12][10] = TileType.BRICK;
  addCoinRow(coins, 'w7_3', 7, 5, 9);

  // First Swinging Clock Pendulum over Col 18
  swingingPendulums.push({
    pivotCol: 18,
    pivotRow: 3,
    lengthPx: 10 * 32,
    maxAngleRad: 0.55,
    speed: 2.1,
    phaseOffset: 0.0,
  });
  enemies.push({ id: 'w7_3_e1', type: 'SLIME', x: 14 * 32, y: 15 * 32 });
  enemies.push({ id: 'w7_3_e2', type: 'BEETLE', x: 22 * 32, y: 15 * 32 });

  // 2. Timed Disappearing Cog Platforms & Twin Pendulums (Cols 27 - 54)
  addTempCogBridge(grid, 27, 30, 14);
  addCoinRow(coins, 'w7_3', 27, 4, 12);

  fillGroundRange(grid, 33, 46, 16);
  swingingPendulums.push({
    pivotCol: 37,
    pivotRow: 3,
    lengthPx: 10 * 32,
    maxAngleRad: 0.58,
    speed: 2.3,
    phaseOffset: 0.8,
  });
  swingingPendulums.push({
    pivotCol: 42,
    pivotRow: 3,
    lengthPx: 10 * 32,
    maxAngleRad: 0.58,
    speed: 2.3,
    phaseOffset: 2.4,
  });
  addCoinRow(coins, 'w7_3', 36, 7, 13);

  addTempCogBridge(grid, 48, 52, 13);
  grid[9][50] = TileType.QUESTION_FIRE; // Second Power-up Block
  enemies.push({ id: 'w7_3_e3', type: 'BAT', x: 49 * 32, y: 8 * 32, patrolRange: 95 });

  // 3. Rotating Clock-Chamber & Checkpoint (Cols 55 - 82)
  fillGroundRange(grid, 55, 70, 16);
  // Central Rotating Clock-Hand Mechanism + Orbital Platforms
  grid[12][62] = TileType.SOLID_STONE;
  enemies.push({ id: 'w7_3_fb1', type: 'FIRE_BAR', x: 62 * 32 + 16, y: 12 * 32 + 16 });
  addConveyorBelt(grid, 57, 61, 16, 'RIGHT');
  addConveyorBelt(grid, 63, 67, 16, 'LEFT');
  addCoinRow(coins, 'w7_3', 59, 7, 8);
  enemies.push({ id: 'w7_3_e4', type: 'KNIGHT', x: 68 * 32, y: 15 * 32 });

  fillGroundRange(grid, 73, 81, 16);
  const checkpoint = { x: 76 * 32, y: 14 * 32 };

  // 4. Precision Pendulum Bridge & Counter-Rotating Cogs (Cols 84 - 112)
  movingPlatforms.push({
    id: 'w7_3_mp1',
    x: 83 * 32,
    y: 14 * 32,
    width: 96,
    endX: 89 * 32,
    endY: 11 * 32,
    speed: 95,
  });

  fillGroundRange(grid, 92, 108, 16);
  addConveyorBelt(grid, 94, 105, 16, 'LEFT');
  swingingPendulums.push({
    pivotCol: 97,
    pivotRow: 3,
    lengthPx: 10 * 32,
    maxAngleRad: 0.62,
    speed: 2.5,
    phaseOffset: 0.4,
  });
  swingingPendulums.push({
    pivotCol: 103,
    pivotRow: 3,
    lengthPx: 10 * 32,
    maxAngleRad: 0.62,
    speed: 2.5,
    phaseOffset: 1.9,
  });
  grid[11][100] = TileType.QUESTION_FEATHER; // Third Power-up Block
  addCoinRow(coins, 'w7_3', 96, 8, 13);
  enemies.push({ id: 'w7_3_e5', type: 'BEETLE', x: 106 * 32, y: 15 * 32 });

  // 5. Final Timed Ascent to the Clocktower Spire (Cols 110 - 135)
  addTempCogBridge(grid, 110, 113, 14);
  addTempCogBridge(grid, 115, 118, 12);
  addCoinRow(coins, 'w7_3', 115, 4, 10);

  fillGroundRange(grid, 120, 135, 16);
  addPipe(grid, 121, 16, 2);
  addStairs(grid, 124, 16, 5, true);
  addCoinRow(coins, 'w7_3', 125, 4, 9);

  return {
    id: 33,
    worldId: 7,
    stageNumber: 3,
    name: 'Level 3: Pendulum Passage',
    subtitle: 'Swinging Clocktower Pendulums, Timed Platforms & Rotating Chambers',
    theme: 'CLOCKWORK_TOWER',
    musicTrack: 'CHRONOS',
    swingingPendulums,
    widthInTiles: cols,
    heightInTiles: 19,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    checkpoint,
    goalX: 131 * 32,
    goalY: 6 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}

export const world7Level3: LevelDefinition = buildWorld7Level3();
