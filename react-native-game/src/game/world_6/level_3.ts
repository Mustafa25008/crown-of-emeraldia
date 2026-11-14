import { LevelDefinition, TileType, CoinDef, EnemySpawnDef, MovingPlatformDef } from '../types';
import {
  LEVEL_ROWS,
  createEmptyGrid,
  fillGroundRange,
  addStairs,
  addCoinRow,
  addCloudPlatform,
  addTempCloudBridge,
} from '../level_builder';

export function buildWorld6Level3(): LevelDefinition {
  const cols = 128;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // 6-3: Sky Temple Ruins — Floating ancient marble temples, disappearing platforms, rotating mechanisms & hidden sky passages
  fillGroundRange(grid, 0, 18); // Outer Temple Terrace
  // Disappearing Cloud Courtyard 1 (cols 19..29)
  fillGroundRange(grid, 30, 47); // Inner Sanctuary Hall (with hidden upper sky passage above!)
  // Temple Abyss 2 (cols 48..60) with rotating celestial mechanisms & disappearing clouds
  fillGroundRange(grid, 61, 75); // Central Temple Altar (Checkpoint)
  // Collapsing Sky Colonnade 3 (cols 76..92)
  fillGroundRange(grid, 93, 127); // Grand Temple Promenade & Goal

  // Early Power-up slot 1 at col 11 (row 12 = 4 tiles above row 16 ground)
  grid[12][9] = TileType.BRICK;
  grid[12][10] = TileType.QUESTION_COIN;
  grid[12][11] = TileType.QUESTION_MUSHROOM;
  grid[12][12] = TileType.QUESTION_COIN;
  grid[12][13] = TileType.BRICK;
  addCoinRow(coins, 'w6_l3_intro', 9, 5, 9);

  // Storm spike trap on Outer Terrace at col 16
  grid[15][16] = TileType.STORM_SPIKE;

  // Disappearing Cloud Courtyard 1 (cols 19..29): Stepped TEMP_CLOUD & stable CLOUD_PLATFORM
  addTempCloudBridge(grid, 19, 22, 14);
  addCloudPlatform(grid, 23, 25, 12);
  addTempCloudBridge(grid, 26, 29, 13);
  addCoinRow(coins, 'w6_l3_courtyard1', 20, 8, 9);

  // Inner Sanctuary Hall (cols 30..47):
  // Lower path has rotating mechanism + storm traps; Upper Hidden Sky Passage at row 6 has bonus coins & Star slot 1 (col 38, row 10)
  grid[10][37] = TileType.BRICK;
  grid[10][38] = TileType.QUESTION_STAR;
  grid[10][39] = TileType.BRICK;
  grid[15][43] = TileType.STORM_SPIKE;
  // Cloud steps leading up to the Hidden Upper Sky Passage (row 5..6)
  addCloudPlatform(grid, 31, 33, 12);
  addCloudPlatform(grid, 34, 44, 6);
  addCoinRow(coins, 'w6_l3_secret_sky', 35, 8, 4);

  // Temple Abyss 2 (cols 48..60): Moving marble platform & disappearing cloud ledges
  addTempCloudBridge(grid, 48, 51, 13);
  movingPlatforms.push({
    id: 'w6_l3_mp1',
    x: 52 * 32,
    y: 13 * 32,
    width: 96,
    endX: 56 * 32,
    endY: 9 * 32,
    speed: 100,
  });
  addTempCloudBridge(grid, 57, 60, 12);
  addCoinRow(coins, 'w6_l3_abyss2', 52, 6, 7);

  // Central Temple Altar (cols 61..75): Mid-level Power-up slot 2 at col 64 (row 12) + Checkpoint at col 70
  grid[12][62] = TileType.QUESTION_COIN;
  grid[12][63] = TileType.BRICK;
  grid[12][64] = TileType.QUESTION_FIRE;
  grid[12][65] = TileType.BRICK;
  grid[12][66] = TileType.QUESTION_COIN;
  const checkpoint = { x: 70 * 32, y: 14 * 32 };
  grid[15][73] = TileType.STORM_SPIKE;

  // Collapsing Sky Colonnade 3 (cols 76..92): Alternating temporary clouds, solid temple bridge & rotating mechanism
  addTempCloudBridge(grid, 76, 79, 13);
  addCloudPlatform(grid, 81, 85, 11);
  addTempCloudBridge(grid, 87, 91, 13);
  // High secret temple arch at row 6
  addCloudPlatform(grid, 80, 86, 6);
  addCoinRow(coins, 'w6_l3_colonnade_high', 80, 7, 4);

  // Grand Temple Promenade (cols 93..127): Late Power-up slot 3 at col 97 (row 12) & Star slot 2 at col 103 (row 11)
  grid[12][96] = TileType.BRICK;
  grid[12][97] = TileType.QUESTION_FEATHER;
  grid[12][98] = TileType.BRICK;
  grid[15][100] = TileType.STORM_SPIKE;
  grid[11][103] = TileType.QUESTION_STAR;
  addCoinRow(coins, 'w6_l3_late', 95, 5, 9);

  addStairs(grid, 108, 16, 6, true);

  enemies.push(
    { id: 'w6_l3_e1', type: 'BEETLE', x: 14 * 32, y: 15 * 32 },
    { id: 'w6_l3_e2', type: 'BAT', x: 24 * 32, y: 7 * 32, patrolRange: 120 },
    { id: 'w6_l3_fb1', type: 'FIRE_BAR', x: 35 * 32 + 16, y: 13 * 32 + 16 },
    { id: 'w6_l3_e3', type: 'KNIGHT', x: 41 * 32, y: 15 * 32 },
    { id: 'w6_l3_e4', type: 'BAT', x: 54 * 32, y: 6 * 32, patrolRange: 130 },
    { id: 'w6_l3_fb2', type: 'FIRE_BAR', x: 67 * 32 + 16, y: 13 * 32 + 16 },
    { id: 'w6_l3_fb3', type: 'FIRE_BAR', x: 83 * 32 + 16, y: 10 * 32 + 16 },
    { id: 'w6_l3_e5', type: 'KNIGHT', x: 95 * 32, y: 15 * 32 },
    { id: 'w6_l3_e6', type: 'BEETLE', x: 105 * 32, y: 15 * 32 }
  );

  return {
    id: 28,
    worldId: 6,
    stageNumber: 3,
    name: 'Level 3: Sky Temple Ruins',
    subtitle: 'Ancient Floating Temples, Disappearing Clouds & Traps',
    theme: 'SKY_TEMPLE',
    musicTrack: 'CELESTIA',
    windUpdrafts: [
      { startCol: 78, endCol: 83, minRow: 4, maxRow: 15, liftForce: 500 },
    ],
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

export const world6Level3 = buildWorld6Level3();
