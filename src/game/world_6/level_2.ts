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

export function buildWorld6Level2(): LevelDefinition {
  const cols = 128;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // 6-2: Windrunner Heights — High-altitude floating islands with wind currents, updrafts & moving clouds
  fillGroundRange(grid, 0, 18); // Windrunner Ledge 1
  // Updraft Chasm 1 (cols 19..29) with cloud steps & vertical wind current
  fillGroundRange(grid, 30, 46); // Sky Island 2
  // Gale Crossing 2 (cols 47..59) with moving cloud platforms & wind updraft
  fillGroundRange(grid, 60, 75); // Sanctuary Island 3 (Checkpoint)
  // High-Altitude Ascent 3 (cols 76..92) with multi-tier cloud platforms & updrafts
  fillGroundRange(grid, 93, 127); // Summit Landing & Flagpole

  // Early Power-up slot 1 at col 11 (row 12 = 4 tiles above row 16 ground)
  grid[12][9] = TileType.QUESTION_COIN;
  grid[12][10] = TileType.BRICK;
  grid[12][11] = TileType.QUESTION_MUSHROOM;
  grid[12][12] = TileType.BRICK;
  grid[12][13] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w6_l2_intro', 9, 5, 9);

  // Updraft Chasm 1 (cols 19..29): Stepped cloud platforms + high coin arc in the updraft
  addCloudPlatform(grid, 19, 22, 14);
  addCloudPlatform(grid, 23, 26, 11);
  addCloudPlatform(grid, 26, 29, 9);
  addCoinRow(coins, 'w6_l2_updraft1', 21, 6, 7);

  // Sky Island 2 (cols 30..46): Star slot 1 at col 37 (row 11) + high cloud lookout
  grid[11][36] = TileType.BRICK;
  grid[11][37] = TileType.QUESTION_STAR;
  grid[11][38] = TileType.BRICK;
  addCloudPlatform(grid, 40, 44, 9);
  addCoinRow(coins, 'w6_l2_lookout', 40, 5, 6);

  // Gale Crossing 2 (cols 47..59): Moving cloud platforms + temporary cloud bridge
  movingPlatforms.push(
    {
      id: 'w6_l2_mp1',
      x: 47 * 32 + 16,
      y: 13 * 32,
      width: 96,
      endX: 52 * 32,
      endY: 10 * 32,
      speed: 95,
    },
    {
      id: 'w6_l2_mp2',
      x: 54 * 32,
      y: 11 * 32,
      width: 96,
      endX: 58 * 32,
      endY: 13 * 32,
      speed: 95,
    }
  );
  addCloudPlatform(grid, 51, 54, 8);
  addCoinRow(coins, 'w6_l2_gale2', 50, 6, 6);

  // Sanctuary Island 3 (cols 60..75): Mid-level Power-up slot 2 at col 64 (row 12) + Checkpoint at col 70
  grid[12][62] = TileType.QUESTION_COIN;
  grid[12][63] = TileType.BRICK;
  grid[12][64] = TileType.QUESTION_FIRE;
  grid[12][65] = TileType.BRICK;
  grid[12][66] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w6_l2_mid', 62, 5, 9);

  const checkpoint = { x: 70 * 32, y: 14 * 32 };

  // High-Altitude Ascent 3 (cols 76..92): Stepped cloud platforms, temporary clouds & updraft column
  addCloudPlatform(grid, 76, 79, 14);
  addTempCloudBridge(grid, 80, 83, 12);
  addCloudPlatform(grid, 84, 87, 9);
  addCloudPlatform(grid, 88, 92, 12);
  // Bonus high cloud deck at row 6 for Super Jump / Updraft riders
  addCloudPlatform(grid, 82, 87, 6);
  addCoinRow(coins, 'w6_l2_ascent3', 82, 6, 4);

  // Summit Landing (cols 93..127): Late Power-up slot 3 at col 98 (row 12) & Star slot 2 at col 104 (row 11)
  grid[12][97] = TileType.BRICK;
  grid[12][98] = TileType.QUESTION_FEATHER;
  grid[12][99] = TileType.BRICK;
  grid[11][104] = TileType.QUESTION_STAR;
  addCoinRow(coins, 'w6_l2_late', 96, 5, 9);

  addStairs(grid, 108, 16, 6, true);

  enemies.push(
    { id: 'w6_l2_e1', type: 'SLIME', x: 15 * 32, y: 15 * 32 },
    { id: 'w6_l2_e2', type: 'BAT', x: 24 * 32, y: 7 * 32, patrolRange: 120 },
    { id: 'w6_l2_e3', type: 'BEETLE', x: 34 * 32, y: 15 * 32 },
    { id: 'w6_l2_e4', type: 'KNIGHT', x: 42 * 32, y: 15 * 32 },
    { id: 'w6_l2_e5', type: 'BAT', x: 53 * 32, y: 6 * 32, patrolRange: 135 },
    { id: 'w6_l2_e6', type: 'BEETLE', x: 67 * 32, y: 15 * 32 },
    { id: 'w6_l2_e7', type: 'BAT', x: 84 * 32, y: 6 * 32, patrolRange: 140 },
    { id: 'w6_l2_e8', type: 'KNIGHT', x: 96 * 32, y: 15 * 32 },
    { id: 'w6_l2_e9', type: 'SLIME', x: 103 * 32, y: 15 * 32 }
  );

  return {
    id: 27,
    worldId: 6,
    stageNumber: 2,
    name: 'Level 2: Windrunner Heights',
    subtitle: 'High-Altitude Gales, Updrafts & Moving Clouds',
    theme: 'CELESTIA',
    musicTrack: 'CELESTIA',
    windForce: -38,
    windUpdrafts: [
      { startCol: 20, endCol: 26, minRow: 4, maxRow: 16, liftForce: 540 },
      { startCol: 49, endCol: 55, minRow: 4, maxRow: 16, liftForce: 520 },
      { startCol: 80, endCol: 86, minRow: 3, maxRow: 16, liftForce: 560 },
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

export const world6Level2 = buildWorld6Level2();
