import {
  LevelDefinition,
  TileType,
  CoinDef,
  EnemySpawnDef,
  MovingPlatformDef,
  SteamVentDef,
  CrusherPistonDef,
  SwingingPendulumDef,
} from '../types';
import {
  createEmptyGrid,
  fillGroundRange,
  addCoinRow,
  addConveyorBelt,
  addTempCogBridge,
} from '../level_builder';

function buildWorld7Level5(): LevelDefinition {
  const cols = 136;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];
  const steamVents: SteamVentDef[] = [];
  const crusherPistons: CrusherPistonDef[] = [];
  const swingingPendulums: SwingingPendulumDef[] = [];

  // 1. Eternal Clocktower Grand Hallway (Cols 0 - 24)
  fillGroundRange(grid, 0, 24, 16);
  grid[12][7] = TileType.BRICK;
  grid[12][8] = TileType.QUESTION_MUSHROOM; // Early Power-up
  grid[12][9] = TileType.BRICK;
  addCoinRow(coins, 'w7_5', 7, 4, 9);

  addConveyorBelt(grid, 13, 21, 16, 'LEFT');
  swingingPendulums.push({
    pivotCol: 17,
    pivotRow: 3,
    lengthPx: 10 * 32,
    maxAngleRad: 0.58,
    speed: 2.3,
    phaseOffset: 0.0,
  });
  enemies.push({ id: 'w7_5_e1', type: 'BEETLE', x: 22 * 32, y: 15 * 32 });

  // 2. Steam & Crusher Foundry Wing (Cols 27 - 54)
  addTempCogBridge(grid, 26, 29, 14);
  addCoinRow(coins, 'w7_5', 26, 4, 12);

  fillGroundRange(grid, 31, 54, 16);
  for (let c = 33; c <= 48; c++) {
    grid[2][c] = TileType.SOLID_STONE;
  }
  crusherPistons.push({ col: 36, topRow: 3, crushRow: 15, cycleSeconds: 2.9, phaseOffset: 0.0 });
  steamVents.push({ col: 41, baseRow: 16, peakRow: 10, cycleSeconds: 3.2, phaseOffset: 0.9 });
  crusherPistons.push({ col: 46, topRow: 3, crushRow: 15, cycleSeconds: 2.9, phaseOffset: 1.4 });
  grid[11][51] = TileType.QUESTION_FIRE; // Second Power-up Block
  enemies.push({ id: 'w7_5_e2', type: 'KNIGHT', x: 50 * 32, y: 15 * 32 });

  // 3. Twin Pendulum & Rotating Mechanism Bridge (Cols 57 - 80)
  movingPlatforms.push({
    id: 'w7_5_mp1',
    x: 56 * 32,
    y: 14 * 32,
    width: 96,
    endX: 62 * 32,
    endY: 12 * 32,
    speed: 105,
  });
  addCoinRow(coins, 'w7_5', 58, 4, 10);

  fillGroundRange(grid, 65, 80, 16);
  grid[13][71] = TileType.SOLID_STONE;
  enemies.push({ id: 'w7_5_fb1', type: 'FIRE_BAR', x: 71 * 32 + 16, y: 13 * 32 + 16 });
  swingingPendulums.push({
    pivotCol: 76,
    pivotRow: 3,
    lengthPx: 10 * 32,
    maxAngleRad: 0.6,
    speed: 2.5,
    phaseOffset: 1.1,
  });
  enemies.push({ id: 'w7_5_e3', type: 'BAT', x: 68 * 32, y: 8 * 32, patrolRange: 85 });

  // 4. Pre-Boss Sanctum Checkpoint & Preparation Deck (Cols 82 - 89)
  fillGroundRange(grid, 82, 89, 16);
  const checkpoint = { x: 84 * 32, y: 14 * 32 };
  grid[11][87] = TileType.QUESTION_FEATHER; // Pre-Boss Power-Up Block (3+ tiles open headroom above)

  // 5. Grand Clocktower Boss Arena: Chronos, the Timekeeper (Cols 90 - 135)
  fillGroundRange(grid, 90, 135, 16);
  // Elevated Tactical Clockwork Platforms inside Arena
  grid[12][96] = TileType.BRIDGE;
  grid[12][97] = TileType.BRIDGE;
  grid[12][98] = TileType.BRIDGE;

  grid[12][114] = TileType.BRIDGE;
  grid[12][115] = TileType.BRIDGE;
  grid[12][116] = TileType.BRIDGE;

  addCoinRow(coins, 'w7_5', 96, 3, 10);
  addCoinRow(coins, 'w7_5', 114, 3, 10);

  return {
    id: 35,
    worldId: 7,
    stageNumber: 5,
    name: 'Level 5: Eternal Clocktower',
    subtitle: 'Master Clockwork Fortress & Boss Battle: Chronos, the Timekeeper',
    theme: 'CLOCKWORK_TOWER',
    musicTrack: 'CASTLE_BOSS',
    steamVents,
    crusherPistons,
    swingingPendulums,
    widthInTiles: cols,
    heightInTiles: 19,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    checkpoint,
    hasBoss: true,
    bossArenaStartX: 90 * 32,
    goalX: 129 * 32,
    goalY: 6 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}

export const world7Level5: LevelDefinition = buildWorld7Level5();
