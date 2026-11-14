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

export function buildWorld5Level4(): LevelDefinition {
  const cols = 128;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // The Burning Fortress: Obsidian roof ceiling (keep row 1 clear near Question Blocks)
  for (let c = 0; c < cols; c++) {
    grid[0][c] = TileType.SOLID_STONE;
    const isNearQuestionBlock =
      (c >= 8 && c <= 17) || (c >= 31 && c <= 43) || (c >= 55 && c <= 68) || (c >= 90 && c <= 105);
    if (c % 4 === 0 && !isNearQuestionBlock) {
      grid[1][c] = TileType.SOLID_STONE;
    }
  }

  // Heavily guarded fortress corridors separated by boiling lava chambers
  fillGroundRange(grid, 0, 18);
  addLavaPit(grid, 19, 30, 16); // Lava Chamber 1
  fillGroundRange(grid, 31, 48);
  addLavaPit(grid, 49, 60, 16); // Lava Chamber 2
  fillGroundRange(grid, 61, 76);
  addLavaPit(grid, 77, 92, 16); // Lava Chamber 3
  fillGroundRange(grid, 93, 127);

  // Early Fortress Supply Blocks (Power-up slot 1 at col 12, row 12)
  grid[12][10] = TileType.QUESTION_COIN;
  grid[12][11] = TileType.BRICK;
  grid[12][12] = TileType.QUESTION_MUSHROOM;
  grid[12][13] = TileType.BRICK;
  grid[12][14] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w5_l4_intro', 10, 5, 9);

  // Lava Chamber 1 (cols 19..30): Collapsing magma bridges + Geyser at col 24
  addMagmaCrumbleBridge(grid, 20, 22, 12);
  addMagmaCrumbleBridge(grid, 26, 29, 12);
  addCoinRow(coins, 'w5_l4_chamber1', 20, 9, 8);

  // Fortress Battlement 1 (cols 31..48): Rotating Fire Bars & Star slot 1 at col 38 (row 11)
  grid[11][37] = TileType.BRICK;
  grid[11][38] = TileType.QUESTION_STAR;
  grid[11][39] = TileType.BRICK;
  grid[15][44] = TileType.BURNING_ROCK;
  for (let c = 42; c <= 46; c++) {
    grid[12][c] = TileType.BRIDGE;
  }

  // Lava Chamber 2 (cols 49..60): Moving iron platform + Geyser at col 55
  movingPlatforms.push({
    id: 'w5_l4_mp1',
    x: 50 * 32,
    y: 13 * 32,
    width: 96,
    endX: 57 * 32,
    endY: 10 * 32,
    speed: 105,
  });
  addCoinRow(coins, 'w5_l4_chamber2', 51, 6, 8);

  // Mid-level Fortress Courtyard (cols 61..76): Power-up slot 2 at col 64 (row 12) + Checkpoint at col 70
  grid[12][62] = TileType.QUESTION_COIN;
  grid[12][63] = TileType.BRICK;
  grid[12][64] = TileType.QUESTION_FIRE;
  grid[12][65] = TileType.BRICK;
  grid[12][66] = TileType.QUESTION_COIN;
  const checkpoint = { x: 70 * 32, y: 14 * 32 };
  grid[15][74] = TileType.BURNING_ROCK;

  // Lava Chamber 3 (cols 77..92): Twin moving platforms & Rotating Fire Bar gauntlet
  movingPlatforms.push(
    {
      id: 'w5_l4_mp2',
      x: 78 * 32,
      y: 13 * 32,
      width: 96,
      endX: 82 * 32,
      endY: 10 * 32,
      speed: 105,
    },
    {
      id: 'w5_l4_mp3',
      x: 86 * 32,
      y: 10 * 32,
      width: 96,
      endX: 90 * 32,
      endY: 13 * 32,
      speed: 105,
    }
  );
  addCoinRow(coins, 'w5_l4_chamber3', 80, 8, 7);

  // Late-level Power-up slot 3 at col 96 (row 12) & Star slot 2 at col 103 (row 11)
  grid[12][95] = TileType.BRICK;
  grid[12][96] = TileType.QUESTION_FEATHER;
  grid[12][97] = TileType.BRICK;
  grid[11][103] = TileType.QUESTION_STAR;
  addCoinRow(coins, 'w5_l4_late', 95, 5, 9);

  addStairs(grid, 108, 16, 6, true);

  enemies.push(
    { id: 'w5_l4_e1', type: 'KNIGHT', x: 15 * 32, y: 15 * 32 },
    { id: 'w5_l4_fb1', type: 'FIRE_BAR', x: 34 * 32 + 16, y: 13 * 32 + 16 },
    { id: 'w5_l4_e2', type: 'KNIGHT', x: 40 * 32, y: 15 * 32 },
    { id: 'w5_l4_fb2', type: 'FIRE_BAR', x: 47 * 32 + 16, y: 13 * 32 + 16 },
    { id: 'w5_l4_e3', type: 'BAT', x: 54 * 32, y: 6 * 32, patrolRange: 130 },
    { id: 'w5_l4_fb3', type: 'FIRE_BAR', x: 67 * 32 + 16, y: 13 * 32 + 16 },
    { id: 'w5_l4_fb4', type: 'FIRE_BAR', x: 84 * 32 + 16, y: 11 * 32 + 16 },
    { id: 'w5_l4_e4', type: 'KNIGHT', x: 99 * 32, y: 15 * 32 },
    { id: 'w5_l4_e5', type: 'BEETLE', x: 105 * 32, y: 15 * 32 }
  );

  return {
    id: 24,
    worldId: 5,
    stageNumber: 4,
    name: 'Level 4: The Burning Fortress',
    subtitle: 'Fire Traps, Lava Chambers & Rotating Hazards',
    theme: 'INFERNO_CASTLE',
    musicTrack: 'FORTRESS',
    hasAshfall: true,
    hasRisingLava: true,
    lavaGeysers: [
      { col: 24, baseRow: 16, peakRow: 8, cycleSeconds: 3.8, phaseOffset: 0.4 },
      { col: 55, baseRow: 16, peakRow: 8, cycleSeconds: 4.0, phaseOffset: 1.6 },
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

export const world5Level4 = buildWorld5Level4();
