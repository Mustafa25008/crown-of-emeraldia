import { LevelDefinition, TileType, CoinDef, EnemySpawnDef, MovingPlatformDef } from '../types';
import {
  LEVEL_ROWS,
  createEmptyGrid,
  fillGroundRange,
  addCoinRow,
  addLavaPit,
  addMagmaCrumbleBridge,
} from '../level_builder';

export function buildWorld5Level5(): LevelDefinition {
  const cols = 128;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // Inferno Citadel Ceiling (keep row 1 clear near Question Blocks)
  for (let c = 0; c < cols; c++) {
    grid[0][c] = TileType.SOLID_STONE;
    const isNearQuestionBlock =
      (c >= 6 && c <= 16) || (c >= 30 && c <= 46) || (c >= 66 && c <= 86);
    if (c < 90 && c % 4 === 0 && !isNearQuestionBlock) {
      grid[1][c] = TileType.SOLID_STONE;
    }
  }

  // Obsidian Castle Halls + Molten Moat 1 + Erupting Caldera Chasm + Ignarok Throne Arena (cols 90..124)
  fillGroundRange(grid, 0, 18);
  addLavaPit(grid, 19, 27, 16);
  fillGroundRange(grid, 28, 46);
  addLavaPit(grid, 47, 58, 16);
  fillGroundRange(grid, 59, 89);
  fillGroundRange(grid, 90, 127);

  // Right wall of Ignarok's Inferno Throne Room
  for (let r = 1; r < 16; r++) {
    grid[r][125] = TileType.SOLID_STONE;
    grid[r][126] = TileType.SOLID_STONE;
  }

  // Early Citadel Supply Blocks (Power-up slot 1 at col 10, row 12)
  grid[12][8] = TileType.QUESTION_COIN;
  grid[12][10] = TileType.QUESTION_MUSHROOM;
  grid[12][12] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w5_l5_c1', 8, 5, 9);

  // Collapsing Magma Bridge over Molten Moat 1 (cols 19..27) + Geyser at col 23
  addMagmaCrumbleBridge(grid, 20, 22, 12);
  addMagmaCrumbleBridge(grid, 24, 26, 12);
  addCoinRow(coins, 'w5_l5_moat1', 20, 7, 8);

  // Citadel Hallway (cols 28..46): Power-up slot 2 at col 35 (row 11), Star slot 1 at col 43 (row 11)
  for (let c = 32; c <= 38; c++) {
    grid[11][c] = c === 35 ? TileType.QUESTION_FIRE : TileType.BRICK;
  }
  grid[15][39] = TileType.BURNING_ROCK;
  grid[11][43] = TileType.QUESTION_STAR;
  addCoinRow(coins, 'w5_l5_c2', 32, 7, 7);

  // Erupting Caldera Chasm (cols 47..58) with twin moving obsidian barges + Geyser at col 52
  movingPlatforms.push(
    {
      id: 'w5_l5_mp1',
      x: 48 * 32,
      y: 14 * 32,
      width: 96,
      endX: 51 * 32,
      endY: 10 * 32,
      speed: 110,
    },
    {
      id: 'w5_l5_mp2',
      x: 54 * 32,
      y: 10 * 32,
      width: 96,
      endX: 57 * 32,
      endY: 14 * 32,
      speed: 110,
    }
  );

  // Pre-Boss Checkpoint & Inferno Sanctuary (cols 60..86)
  // Power-up slot 3 at col 72 (row 12), Star slot 2 at col 82 (row 12)
  const checkpoint = { x: 64 * 32, y: 14 * 32 };
  grid[12][69] = TileType.QUESTION_COIN;
  grid[12][72] = TileType.QUESTION_FEATHER;
  grid[12][75] = TileType.QUESTION_COIN;
  grid[12][82] = TileType.QUESTION_STAR;
  addCoinRow(coins, 'w5_l5_sanctuary', 69, 9, 9);

  // Boss Arena tactical bridges (cols 95..117) for battling Ignarok, the Inferno King
  for (let c = 95; c <= 98; c++) grid[12][c] = TileType.BRIDGE;
  for (let c = 105; c <= 108; c++) grid[10][c] = TileType.BRIDGE;
  for (let c = 114; c <= 117; c++) grid[12][c] = TileType.BRIDGE;

  enemies.push(
    { id: 'w5_l5_e1', type: 'KNIGHT', x: 15 * 32, y: 15 * 32 },
    { id: 'w5_l5_fb1', type: 'FIRE_BAR', x: 30 * 32 + 16, y: 13 * 32 + 16 },
    { id: 'w5_l5_e2', type: 'KNIGHT', x: 41 * 32, y: 15 * 32 },
    { id: 'w5_l5_fb2', type: 'FIRE_BAR', x: 45 * 32 + 16, y: 13 * 32 + 16 },
    { id: 'w5_l5_e3', type: 'BAT', x: 53 * 32, y: 7 * 32, patrolRange: 135 },
    { id: 'w5_l5_fb3', type: 'FIRE_BAR', x: 61 * 32 + 16, y: 13 * 32 + 16 },
    { id: 'w5_l5_e4', type: 'BEETLE', x: 79 * 32, y: 15 * 32 }
  );

  return {
    id: 25,
    worldId: 5,
    stageNumber: 5,
    name: 'Level 5: Inferno Citadel',
    subtitle: 'Throne of Ignarok, the Inferno King',
    theme: 'INFERNO_CASTLE',
    musicTrack: 'CASTLE_BOSS',
    hasAshfall: true,
    lavaGeysers: [
      { col: 23, baseRow: 16, peakRow: 8, cycleSeconds: 3.8, phaseOffset: 0.5 },
      { col: 52, baseRow: 16, peakRow: 8, cycleSeconds: 4.0, phaseOffset: 1.8 },
    ],
    widthInTiles: cols,
    heightInTiles: LEVEL_ROWS,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    checkpoint,
    goalX: 120 * 32,
    goalY: 6 * 32,
    hasBoss: true,
    bossArenaStartX: 90 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}

export const world5Level5 = buildWorld5Level5();
