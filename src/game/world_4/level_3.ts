import { LevelDefinition, TileType, CoinDef, EnemySpawnDef, MovingPlatformDef } from '../types';
import {
  LEVEL_ROWS,
  createEmptyGrid,
  fillGroundRange,
  fillIceGroundRange,
  addStairs,
  addCoinRow,
  addFragileIceBridge,
  addFreezingWaterPit,
} from '../level_builder';

export function buildWorld4Level3(): LevelDefinition {
  const cols = 128;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // Underground Ice Cavern Ceiling (leave row 1 clear near Question Blocks and upper hidden route)
  for (let c = 0; c < cols; c++) {
    grid[0][c] = TileType.SOLID_STONE;
    const isClearCeilingZone =
      (c >= 8 && c <= 17) || (c >= 40 && c <= 65) || (c >= 82 && c <= 104);
    if (c % 5 === 0 && !isClearCeilingZone) {
      grid[1][c] = TileType.SOLID_STONE;
    }
  }

  // Cavern floor alternating with Sub-Zero Freezing Water pools
  fillGroundRange(grid, 0, 20);
  addFreezingWaterPit(grid, 21, 29, 16);
  fillIceGroundRange(grid, 30, 48, 16);
  addFreezingWaterPit(grid, 49, 60, 16);
  fillGroundRange(grid, 61, 79);
  addFreezingWaterPit(grid, 80, 91, 16);
  fillIceGroundRange(grid, 92, 127, 16);

  // Early Power-up slot 1 at col 12 (row 12 = 4 tiles above ground)
  grid[12][10] = TileType.QUESTION_COIN;
  grid[12][11] = TileType.BRICK;
  grid[12][12] = TileType.QUESTION_MUSHROOM;
  grid[12][13] = TileType.BRICK;
  grid[12][14] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w4_l3_intro', 10, 5, 9);

  // Fragile ice bridge over Freezing Water Pool 1 (cols 21..29)
  addFragileIceBridge(grid, 22, 28, 12);
  addCoinRow(coins, 'w4_l3_pool1', 22, 7, 9);

  // Icicle hazards on ice shelf (cols 35..36) with bridge bypass at row 12
  grid[15][35] = TileType.ICICLE;
  grid[15][36] = TileType.ICICLE;
  for (let c = 34; c <= 37; c++) {
    grid[12][c] = TileType.BRIDGE;
  }

  // Star slot 1 at col 41 (row 11)
  grid[11][41] = TileType.QUESTION_STAR;

  // LOWER ROUTE across Freezing Water Pool 2 (cols 49..60): Moving platform + fragile ice
  movingPlatforms.push({
    id: 'w4_l3_mp1',
    x: 50 * 32,
    y: 13 * 32,
    width: 96,
    endX: 57 * 32,
    endY: 13 * 32,
    speed: 95,
  });

  // UPPER HIDDEN CAVERN PATHWAY (cols 44..62 at row 8):
  // Accessible via stepped bridges at cols 44..47, containing bonus coins & Power-up slot 2 at col 54 (row 4 -> 4 tiles above row 8!)
  for (let c = 44; c <= 46; c++) grid[11][c] = TileType.BRIDGE;
  for (let c = 48; c <= 61; c++) grid[8][c] = TileType.BRIDGE;
  grid[4][53] = TileType.QUESTION_COIN;
  grid[4][54] = TileType.QUESTION_FIRE;
  grid[4][55] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w4_l3_secret', 49, 11, 6);

  // Checkpoint at col 66
  const checkpoint = { x: 66 * 32, y: 14 * 32 };

  // Cavern chamber icicle trap at cols 72..73 with fragile ice bridge at row 12
  grid[15][72] = TileType.ICICLE;
  grid[15][73] = TileType.ICICLE;
  addFragileIceBridge(grid, 71, 74, 12);

  // Freezing Water Pool 3 (cols 80..91) with twin fragile ice bridges & moving lift
  addFragileIceBridge(grid, 81, 84, 12);
  movingPlatforms.push({
    id: 'w4_l3_mp2',
    x: 86 * 32,
    y: 13 * 32,
    width: 96,
    endX: 89 * 32,
    endY: 9 * 32,
    speed: 100,
  });
  addCoinRow(coins, 'w4_l3_pool3', 81, 9, 8);

  // Late Power-up slot 3 at col 96 (row 12) & Star slot 2 at col 102 (row 11)
  grid[12][95] = TileType.BRICK;
  grid[12][96] = TileType.QUESTION_FEATHER;
  grid[12][97] = TileType.BRICK;
  grid[11][102] = TileType.QUESTION_STAR;

  // Final stone stairs to Goal Flagpole
  addStairs(grid, 107, 16, 5, true);

  enemies.push(
    { id: 'w4_l3_e1', type: 'SLIME', x: 16 * 32, y: 15 * 32 },
    { id: 'w4_l3_e2', type: 'BAT', x: 25 * 32, y: 7 * 32, patrolRange: 120 },
    { id: 'w4_l3_e3', type: 'BEETLE', x: 43 * 32, y: 15 * 32 },
    { id: 'w4_l3_e4', type: 'BAT', x: 54 * 32, y: 10 * 32, patrolRange: 130 },
    { id: 'w4_l3_e5', type: 'KNIGHT', x: 75 * 32, y: 15 * 32 },
    { id: 'w4_l3_e6', type: 'BAT', x: 85 * 32, y: 6 * 32, patrolRange: 130 },
    { id: 'w4_l3_e7', type: 'KNIGHT', x: 100 * 32, y: 15 * 32 }
  );

  return {
    id: 18,
    worldId: 4,
    stageNumber: 3,
    name: 'Level 3: Frozen Depths',
    subtitle: 'Crystal Caverns, Icicles & Freezing Water',
    theme: 'ICE_CAVERN',
    musicTrack: 'CAVERN',
    widthInTiles: cols,
    heightInTiles: LEVEL_ROWS,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    checkpoint,
    goalX: 118 * 32,
    goalY: 6 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}

export const world4Level3 = buildWorld4Level3();
