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

export function buildWorld6Level4(): LevelDefinition {
  const cols = 128;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // 6-4: Stormbound Skies — Dark storm clouds, lightning strikes, crosswinds & falling cloud platforms
  fillGroundRange(grid, 0, 18); // Storm Outpost 1
  // Tempest Chasm 1 (cols 19..30) with falling/disappearing clouds & lightning strike
  fillGroundRange(grid, 31, 46); // Thunderhead Island 2
  // Lightning Gorge 2 (cols 47..60) with moving platforms & crosswinds
  fillGroundRange(grid, 61, 75); // Eye of the Storm Sanctuary (Checkpoint)
  // Squall Crossing 3 (cols 76..92) with tiered clouds, updrafts & lightning bolts
  fillGroundRange(grid, 93, 127); // Stormbreaker Bastion & Goal

  // Early Power-up slot 1 at col 11 (row 12 = 4 tiles above row 16 ground)
  grid[12][9] = TileType.QUESTION_COIN;
  grid[12][10] = TileType.BRICK;
  grid[12][11] = TileType.QUESTION_MUSHROOM;
  grid[12][12] = TileType.BRICK;
  grid[12][13] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w6_l4_intro', 9, 5, 9);

  // Tempest Chasm 1 (cols 19..30): Disappearing storm clouds & safe cloud refuge
  addTempCloudBridge(grid, 19, 22, 13);
  addCloudPlatform(grid, 23, 25, 11);
  addTempCloudBridge(grid, 26, 30, 13);
  addCoinRow(coins, 'w6_l4_chasm1', 20, 9, 8);

  // Thunderhead Island 2 (cols 31..46): Star slot 1 at col 37 (row 11) + Storm Spike hazards
  grid[15][33] = TileType.STORM_SPIKE;
  grid[11][36] = TileType.BRICK;
  grid[11][37] = TileType.QUESTION_STAR;
  grid[11][38] = TileType.BRICK;
  grid[15][43] = TileType.STORM_SPIKE;
  addCloudPlatform(grid, 41, 45, 11);

  // Lightning Gorge 2 (cols 47..60): Moving cloud platforms + temporary cloud step
  movingPlatforms.push({
    id: 'w6_l4_mp1',
    x: 47 * 32 + 16,
    y: 13 * 32,
    width: 96,
    endX: 53 * 32,
    endY: 10 * 32,
    speed: 105,
  });
  addTempCloudBridge(grid, 55, 59, 12);
  addCoinRow(coins, 'w6_l4_gorge2', 49, 7, 7);

  // Eye of the Storm Sanctuary (cols 61..75): Mid-level Power-up slot 2 at col 64 (row 12) + Checkpoint at col 70
  grid[12][62] = TileType.QUESTION_COIN;
  grid[12][63] = TileType.BRICK;
  grid[12][64] = TileType.QUESTION_FIRE;
  grid[12][65] = TileType.BRICK;
  grid[12][66] = TileType.QUESTION_COIN;
  const checkpoint = { x: 70 * 32, y: 14 * 32 };

  // Squall Crossing 3 (cols 76..92): Twin moving platforms, disappearing clouds & high updraft route
  addTempCloudBridge(grid, 76, 79, 13);
  movingPlatforms.push(
    {
      id: 'w6_l4_mp2',
      x: 80 * 32,
      y: 13 * 32,
      width: 96,
      endX: 84 * 32,
      endY: 10 * 32,
      speed: 105,
    },
    {
      id: 'w6_l4_mp3',
      x: 87 * 32,
      y: 10 * 32,
      width: 96,
      endX: 91 * 32,
      endY: 13 * 32,
      speed: 105,
    }
  );
  addCloudPlatform(grid, 82, 87, 6);
  addCoinRow(coins, 'w6_l4_squall3', 81, 7, 4);

  // Stormbreaker Bastion (cols 93..127): Late Power-up slot 3 at col 97 (row 12) & Star slot 2 at col 104 (row 11)
  grid[12][96] = TileType.BRICK;
  grid[12][97] = TileType.QUESTION_FEATHER;
  grid[12][98] = TileType.BRICK;
  grid[15][101] = TileType.STORM_SPIKE;
  grid[11][104] = TileType.QUESTION_STAR;
  addCoinRow(coins, 'w6_l4_late', 95, 5, 9);

  addStairs(grid, 108, 16, 6, true);

  enemies.push(
    { id: 'w6_l4_e1', type: 'SLIME', x: 15 * 32, y: 15 * 32 },
    { id: 'w6_l4_e2', type: 'BAT', x: 24 * 32, y: 7 * 32, patrolRange: 125 },
    { id: 'w6_l4_e3', type: 'KNIGHT', x: 39 * 32, y: 15 * 32 },
    { id: 'w6_l4_e4', type: 'BAT', x: 53 * 32, y: 6 * 32, patrolRange: 135 },
    { id: 'w6_l4_fb1', type: 'FIRE_BAR', x: 67 * 32 + 16, y: 13 * 32 + 16 },
    { id: 'w6_l4_e5', type: 'BAT', x: 85 * 32, y: 7 * 32, patrolRange: 140 },
    { id: 'w6_l4_e6', type: 'KNIGHT', x: 95 * 32, y: 15 * 32 },
    { id: 'w6_l4_e7', type: 'BEETLE', x: 105 * 32, y: 15 * 32 }
  );

  return {
    id: 29,
    worldId: 6,
    stageNumber: 4,
    name: 'Level 4: Stormbound Skies',
    subtitle: 'Thunderheads, Lightning Strikes & Crosswinds',
    theme: 'STORM_SKIES',
    musicTrack: 'FORTRESS',
    hasStormClouds: true,
    windForce: -52,
    windUpdrafts: [
      { startCol: 78, endCol: 84, minRow: 3, maxRow: 15, liftForce: 540 },
    ],
    lightningStrikes: [
      { col: 24, topRow: 0, bottomRow: 11, cycleSeconds: 4.0, phaseOffset: 0.4 },
      { col: 40, topRow: 0, bottomRow: 16, cycleSeconds: 4.2, phaseOffset: 1.6 },
      { col: 56, topRow: 0, bottomRow: 12, cycleSeconds: 3.8, phaseOffset: 0.9 },
      { col: 84, topRow: 0, bottomRow: 14, cycleSeconds: 3.9, phaseOffset: 2.1 },
      { col: 102, topRow: 0, bottomRow: 16, cycleSeconds: 4.0, phaseOffset: 1.2 },
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

export const world6Level4 = buildWorld6Level4();
