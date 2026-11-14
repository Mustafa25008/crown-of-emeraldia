import {
  LevelDefinition,
  TileType,
  CoinDef,
  EnemySpawnDef,
  MovingPlatformDef,
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

function buildWorld7Level1(): LevelDefinition {
  const cols = 135;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // 1. Opening Brass Gearworks Platform (Cols 0 - 20)
  fillGroundRange(grid, 0, 20, 16);
  grid[12][8] = TileType.QUESTION_COIN;
  grid[12][9] = TileType.BRICK;
  grid[12][10] = TileType.QUESTION_MUSHROOM; // Early Growth Mushroom
  grid[12][11] = TileType.BRICK;
  grid[12][12] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w7_1', 8, 5, 9);

  addPipe(grid, 16, 16, 2);
  enemies.push({ id: 'w7_1_e1', type: 'SLIME', x: 13 * 32, y: 15 * 32 });

  // 2. First Conveyor Belt & Spinning Gear Chasm (Cols 23 - 42)
  fillGroundRange(grid, 23, 30, 16);
  addConveyorBelt(grid, 25, 29, 16, 'RIGHT');
  addCoinRow(coins, 'w7_1', 25, 5, 14);

  // Elevated Conveyor Deck with Spinning Gear Hazard below
  addConveyorBelt(grid, 33, 40, 12, 'LEFT');
  addCoinRow(coins, 'w7_1', 34, 5, 10);
  fillGroundRange(grid, 32, 42, 16);
  grid[15][36] = TileType.GEAR_HAZARD;
  enemies.push({ id: 'w7_1_e2', type: 'BEETLE', x: 39 * 32, y: 15 * 32 });

  // 3. Moving Clockwork Platforms over the Gear Pit (Cols 45 - 64)
  movingPlatforms.push({
    id: 'w7_1_mp1',
    x: 45 * 32,
    y: 14 * 32,
    width: 96,
    endX: 52 * 32,
    endY: 11 * 32,
    speed: 95,
  });
  addCoinRow(coins, 'w7_1', 47, 4, 10);

  fillGroundRange(grid, 55, 65, 16);
  grid[12][58] = TileType.BRICK;
  grid[12][59] = TileType.QUESTION_FIRE; // Second Power-up Block
  grid[12][60] = TileType.BRICK;
  enemies.push({ id: 'w7_1_e3', type: 'BAT', x: 52 * 32, y: 8 * 32, patrolRange: 100 });
  enemies.push({ id: 'w7_1_e4', type: 'KNIGHT', x: 61 * 32, y: 15 * 32 });

  // 4. Checkpoint Plaza & Dual Conveyor Tier Challenge (Cols 68 - 95)
  fillGroundRange(grid, 68, 76, 16);
  const checkpoint = { x: 71 * 32, y: 14 * 32 };

  // Lower fast conveyor + upper counter-conveyor with bonus coins
  fillGroundRange(grid, 79, 95, 16);
  addConveyorBelt(grid, 80, 86, 16, 'LEFT');
  grid[15][87] = TileType.GEAR_HAZARD;
  addConveyorBelt(grid, 88, 94, 16, 'RIGHT');

  addConveyorBelt(grid, 82, 91, 11, 'RIGHT');
  addCoinRow(coins, 'w7_1', 83, 7, 9);
  grid[7][86] = TileType.QUESTION_STAR; // Optional Star Block high above

  enemies.push({ id: 'w7_1_e5', type: 'SLIME', x: 84 * 32, y: 15 * 32 });
  enemies.push({ id: 'w7_1_e6', type: 'BEETLE', x: 92 * 32, y: 15 * 32 });

  // 5. Clockwork Mechanism Gauntlet & Final Ascent (Cols 98 - 134)
  addTempCogBridge(grid, 97, 100, 14);
  addCoinRow(coins, 'w7_1', 97, 4, 12);

  fillGroundRange(grid, 102, 114, 16);
  grid[13][107] = TileType.SOLID_STONE;
  enemies.push({ id: 'w7_1_fb1', type: 'FIRE_BAR', x: 107 * 32 + 16, y: 13 * 32 + 16 });
  grid[11][111] = TileType.QUESTION_FEATHER; // Third Power-up Block

  movingPlatforms.push({
    id: 'w7_1_mp2',
    x: 116 * 32,
    y: 14 * 32,
    width: 96,
    endX: 120 * 32,
    endY: 14 * 32,
    speed: 105,
  });

  fillGroundRange(grid, 122, 134, 16);
  addStairs(grid, 123, 16, 5, true);
  addCoinRow(coins, 'w7_1', 124, 4, 9);

  return {
    id: 31,
    worldId: 7,
    stageNumber: 1,
    name: 'Level 1: Gearworks Valley',
    subtitle: 'Rotating Brass Gears, Conveyor Belts & Clockwork Sentinels',
    theme: 'CHRONOS_VALLEY',
    musicTrack: 'CHRONOS',
    widthInTiles: cols,
    heightInTiles: 19,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    checkpoint,
    goalX: 130 * 32,
    goalY: 6 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}

export const world7Level1: LevelDefinition = buildWorld7Level1();
