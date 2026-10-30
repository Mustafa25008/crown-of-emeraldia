import { LevelDefinition, TileType, CoinDef, EnemySpawnDef, MovingPlatformDef } from '../types';
import {
  LEVEL_ROWS,
  createEmptyGrid,
  fillGroundRange,
  addStairs,
  addCoinRow,
  addLavaPit,
  addMagmaCrumbleBridge,
} from '../level_builder';

export function buildWorld5Level3(): LevelDefinition {
  const cols = 128;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // Firefall Cliffs: Steep volcanic mountain ridges with deep lava geyser canyons
  fillGroundRange(grid, 0, 18);
  addLavaPit(grid, 19, 30, 16); // Geyser Canyon 1
  fillGroundRange(grid, 31, 44);
  addLavaPit(grid, 45, 58, 16); // Geyser Canyon 2
  fillGroundRange(grid, 59, 68);
  addLavaPit(grid, 69, 93, 16); // Great Firefall Gorge
  fillGroundRange(grid, 94, 127);

  // Early Power-up slot 1 at col 11 (row 12 = 4 tiles above ground)
  grid[12][9] = TileType.QUESTION_COIN;
  grid[12][10] = TileType.BRICK;
  grid[12][11] = TileType.QUESTION_MUSHROOM;
  grid[12][12] = TileType.BRICK;
  grid[12][13] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w5_l3_intro', 9, 5, 9);

  // Geyser Canyon 1 (cols 19..30): High bridges flanking Erupting Geyser at col 24
  for (let c = 20; c <= 22; c++) grid[13][c] = TileType.BRIDGE;
  for (let c = 26; c <= 29; c++) grid[11][c] = TileType.BRIDGE;
  addCoinRow(coins, 'w5_l3_geyser1', 20, 8, 8);

  // Mountain Ridge 1 (cols 31..44): Star slot 1 at col 37 (row 11) + Burning Rocks
  grid[15][34] = TileType.BURNING_ROCK;
  grid[11][36] = TileType.BRICK;
  grid[11][37] = TileType.QUESTION_STAR;
  grid[11][38] = TileType.BRICK;
  grid[15][41] = TileType.BURNING_ROCK;

  // Geyser Canyon 2 (cols 45..58): Moving platform & Magma Crumble bridge past Geyser at col 51
  movingPlatforms.push({
    id: 'w5_l3_mp1',
    x: 46 * 32,
    y: 13 * 32,
    width: 96,
    endX: 49 * 32,
    endY: 10 * 32,
    speed: 95,
  });
  addMagmaCrumbleBridge(grid, 53, 57, 11);
  addCoinRow(coins, 'w5_l3_geyser2', 53, 5, 8);

  // Mid-level Sanctuary Ridge (cols 59..68): Power-up slot 2 at col 62 (row 12) + Checkpoint at col 66
  grid[12][61] = TileType.BRICK;
  grid[12][62] = TileType.QUESTION_FIRE;
  grid[12][63] = TileType.BRICK;
  const checkpoint = { x: 66 * 32, y: 14 * 32 };

  // Great Firefall Gorge (cols 69..93): Moving platforms & bridges timed between twin geysers (cols 74 & 86)
  movingPlatforms.push(
    {
      id: 'w5_l3_mp2',
      x: 70 * 32,
      y: 13 * 32,
      width: 96,
      endX: 73 * 32,
      endY: 10 * 32,
      speed: 100,
    },
    {
      id: 'w5_l3_mp3',
      x: 82 * 32,
      y: 12 * 32,
      width: 96,
      endX: 85 * 32,
      endY: 9 * 32,
      speed: 100,
    }
  );
  for (let c = 77; c <= 80; c++) grid[11][c] = TileType.BRIDGE;
  addMagmaCrumbleBridge(grid, 88, 92, 12);
  addCoinRow(coins, 'w5_l3_gorge', 77, 4, 8);

  // Late-level Power-up slot 3 at col 98 (row 12) & Star slot 2 at col 104 (row 11)
  grid[12][97] = TileType.BRICK;
  grid[12][98] = TileType.QUESTION_FEATHER;
  grid[12][99] = TileType.BRICK;
  grid[11][104] = TileType.QUESTION_STAR;
  addCoinRow(coins, 'w5_l3_late', 96, 5, 9);

  addStairs(grid, 108, 16, 6, true);

  enemies.push(
    { id: 'w5_l3_e1', type: 'SLIME', x: 15 * 32, y: 15 * 32 },
    { id: 'w5_l3_e2', type: 'BAT', x: 25 * 32, y: 7 * 32, patrolRange: 120 },
    { id: 'w5_l3_e3', type: 'KNIGHT', x: 38 * 32, y: 15 * 32 },
    { id: 'w5_l3_e4', type: 'BAT', x: 52 * 32, y: 6 * 32, patrolRange: 130 },
    { id: 'w5_l3_e5', type: 'BEETLE', x: 78 * 32, y: 10 * 32 },
    { id: 'w5_l3_e6', type: 'BAT', x: 86 * 32, y: 6 * 32, patrolRange: 135 },
    { id: 'w5_l3_e7', type: 'KNIGHT', x: 101 * 32, y: 15 * 32 },
    { id: 'w5_l3_e8', type: 'SLIME', x: 106 * 32, y: 15 * 32 }
  );

  return {
    id: 23,
    worldId: 5,
    stageNumber: 3,
    name: 'Level 3: Firefall Cliffs',
    subtitle: 'Erupting Lava Geysers, Falling Debris & High Cliffs',
    theme: 'VOLCANO',
    musicTrack: 'VOLCANO',
    hasAshfall: true,
    hasFallingRocks: true,
    lavaGeysers: [
      { col: 24, baseRow: 16, peakRow: 8, cycleSeconds: 4.0, phaseOffset: 0.0 },
      { col: 51, baseRow: 16, peakRow: 7, cycleSeconds: 3.8, phaseOffset: 1.2 },
      { col: 75, baseRow: 16, peakRow: 7, cycleSeconds: 4.0, phaseOffset: 0.5 },
      { col: 87, baseRow: 16, peakRow: 7, cycleSeconds: 3.6, phaseOffset: 2.0 },
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

export const world5Level3 = buildWorld5Level3();
