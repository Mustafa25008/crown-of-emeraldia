import { LevelDefinition, TileType, CoinDef, EnemySpawnDef, MovingPlatformDef } from '../types';
import {
  LEVEL_ROWS,
  createEmptyGrid,
  fillGroundRange,
  addStairs,
  addCoinRow,
  addCloudPlatform,
} from '../level_builder';

export function buildWorld6Level1(): LevelDefinition {
  const cols = 128;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // 6-1: Cloudtop Meadows — Floating grassy sky islands separated by small aerial gaps & cloud platforms
  fillGroundRange(grid, 0, 20); // Sky Island 1
  // Gap 1 (cols 21..24) bridged by low cloud platform
  fillGroundRange(grid, 25, 44); // Sky Island 2
  // Vertical Cloud Meadow Gap (cols 45..52) with tiered cloud platforms
  fillGroundRange(grid, 53, 72); // Sky Island 3 (Checkpoint & Sky Sanctuary)
  // Gap 3 (cols 73..80) with stepped cloud platforms & high bonus cloud island
  fillGroundRange(grid, 81, 100); // Sky Island 4
  // Gap 4 (cols 101..104) with cloud step
  fillGroundRange(grid, 105, 127); // Final Sky Meadow & Goal Island

  // Early Power-up slot 1 at col 11 (row 12 = 4 tiles above row 16 ground)
  grid[12][9] = TileType.BRICK;
  grid[12][10] = TileType.QUESTION_COIN;
  grid[12][11] = TileType.QUESTION_MUSHROOM;
  grid[12][12] = TileType.QUESTION_COIN;
  grid[12][13] = TileType.BRICK;
  addCoinRow(coins, 'w6_l1_intro', 9, 5, 9);

  // Cloud platform over Gap 1 (cols 21..24) + upper cloud step
  addCloudPlatform(grid, 21, 24, 14);
  addCloudPlatform(grid, 18, 21, 10);
  addCoinRow(coins, 'w6_l1_gap1', 21, 4, 11);

  // Sky Island 2 (cols 25..44): Vertical Cloud Climb to high Star block (col 35, row 7)
  addCloudPlatform(grid, 28, 31, 13);
  addCloudPlatform(grid, 33, 37, 10);
  grid[7][34] = TileType.BRICK;
  grid[7][35] = TileType.QUESTION_STAR;
  grid[7][36] = TileType.BRICK;
  addCoinRow(coins, 'w6_l1_skyarch', 33, 5, 8);

  // Tiered Cloud Platforms across Vertical Meadow Gap (cols 45..52)
  addCloudPlatform(grid, 45, 48, 14);
  addCloudPlatform(grid, 49, 52, 11);
  // High Super-Jump / Raccoon bonus cloud ledge at row 7
  addCloudPlatform(grid, 46, 51, 7);
  addCoinRow(coins, 'w6_l1_highbonus1', 46, 6, 5);

  // Sky Island 3 (cols 53..72): Mid-level Power-up slot 2 at col 59 (row 12) + Checkpoint at col 66
  grid[12][57] = TileType.QUESTION_COIN;
  grid[12][58] = TileType.BRICK;
  grid[12][59] = TileType.QUESTION_FIRE;
  grid[12][60] = TileType.BRICK;
  grid[12][61] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w6_l1_mid', 57, 5, 9);

  const checkpoint = { x: 66 * 32, y: 14 * 32 };

  // Gap 3 (cols 73..80): Multi-tier vertical cloud staircase & moving sky platform
  addCloudPlatform(grid, 73, 76, 13);
  movingPlatforms.push({
    id: 'w6_l1_mp1',
    x: 76 * 32,
    y: 11 * 32,
    width: 96,
    endX: 79 * 32,
    endY: 8 * 32,
    speed: 85,
  });
  addCoinRow(coins, 'w6_l1_gap3', 73, 4, 10);

  // Sky Island 4 (cols 81..100): Upper cloud terrace & Late Power-up slot 3 at col 90 (row 12)
  addCloudPlatform(grid, 83, 87, 11);
  addCoinRow(coins, 'w6_l1_terrace', 83, 5, 8);

  grid[12][89] = TileType.BRICK;
  grid[12][90] = TileType.QUESTION_FEATHER;
  grid[12][91] = TileType.BRICK;
  grid[11][97] = TileType.QUESTION_STAR;

  // Cloud bridge over Gap 4 (cols 101..104)
  addCloudPlatform(grid, 101, 104, 14);
  addCoinRow(coins, 'w6_l1_gap4', 101, 4, 11);

  // Celestial marble stairs to Goal Flagpole
  addStairs(grid, 108, 16, 6, true);

  enemies.push(
    { id: 'w6_l1_e1', type: 'SLIME', x: 15 * 32, y: 15 * 32 },
    { id: 'w6_l1_e2', type: 'BAT', x: 23 * 32, y: 8 * 32, patrolRange: 110 },
    { id: 'w6_l1_e3', type: 'BEETLE', x: 31 * 32, y: 15 * 32 },
    { id: 'w6_l1_e4', type: 'SLIME', x: 40 * 32, y: 15 * 32 },
    { id: 'w6_l1_e5', type: 'BAT', x: 49 * 32, y: 9 * 32, patrolRange: 120 },
    { id: 'w6_l1_e6', type: 'BEETLE', x: 63 * 32, y: 15 * 32 },
    { id: 'w6_l1_e7', type: 'BAT', x: 77 * 32, y: 7 * 32, patrolRange: 120 },
    { id: 'w6_l1_e8', type: 'KNIGHT', x: 86 * 32, y: 15 * 32 },
    { id: 'w6_l1_e9', type: 'SLIME', x: 95 * 32, y: 15 * 32 }
  );

  return {
    id: 26,
    worldId: 6,
    stageNumber: 1,
    name: 'Level 1: Cloudtop Meadows',
    subtitle: 'Floating Sky Islands, Cloud Platforms & Cascades',
    theme: 'CELESTIA',
    musicTrack: 'CELESTIA',
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

export const world6Level1 = buildWorld6Level1();
