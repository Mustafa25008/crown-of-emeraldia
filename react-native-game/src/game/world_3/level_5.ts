import { LevelDefinition, TileType, CoinDef, EnemySpawnDef, MovingPlatformDef } from '../types';
import {
  LEVEL_ROWS,
  createEmptyGrid,
  fillGroundRange,
  addCoinRow,
  addQuicksandPit,
  addCrumbleBridge,
} from '../level_builder';

export function buildWorld3Level5(): LevelDefinition {
  const cols = 128;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // Sunken Pyramid Ceiling (keep row 1 clear near Question Blocks)
  for (let c = 0; c < cols; c++) {
    grid[0][c] = TileType.SOLID_STONE;
    const isNearQuestionBlock =
      (c >= 6 && c <= 15) || (c >= 30 && c <= 46) || (c >= 66 && c <= 85);
    if (c < 90 && c % 4 === 0 && !isNearQuestionBlock) {
      grid[1][c] = TileType.SOLID_STONE;
    }
  }

  // Pyramid Floor + Quicksand Trap + Molten Fire Pit + Solkar Boss Chamber (cols 90..124)
  fillGroundRange(grid, 0, 18);
  addQuicksandPit(grid, 19, 26, 16);
  fillGroundRange(grid, 27, 46);
  for (let c = 47; c <= 57; c++) {
    grid[17][c] = TileType.LAVA_TOP;
    grid[18][c] = TileType.LAVA_DEEP;
  }
  fillGroundRange(grid, 58, 86);
  fillGroundRange(grid, 87, 127);

  // Right wall of Solkar's Pyramid Boss Arena
  for (let r = 1; r < 16; r++) {
    grid[r][125] = TileType.SOLID_STONE;
    grid[r][126] = TileType.SOLID_STONE;
  }

  // Early Pyramid Supply Blocks (Power-up slot 1 at col 10, row 12)
  grid[12][8] = TileType.QUESTION_COIN;
  grid[12][10] = TileType.QUESTION_MUSHROOM;
  grid[12][12] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w3_l5_c1', 8, 5, 9);

  // Crumbling sandstone bridge over Quicksand Pit 1 (cols 19..26)
  addCrumbleBridge(grid, 20, 25, 12);
  addCoinRow(coins, 'w3_l5_qs1', 20, 6, 9);

  // Mid Pyramid Hall (cols 27..46): Power-up slot 2 at col 35 (row 11), Star slot 1 at col 43 (row 11)
  for (let c = 32; c <= 38; c++) {
    grid[11][c] = c === 35 ? TileType.QUESTION_FIRE : TileType.BRICK;
  }
  grid[11][43] = TileType.QUESTION_STAR;
  addCoinRow(coins, 'w3_l5_c2', 32, 7, 7);

  // Molten Pyramid Trap (cols 47..57) with twin moving stone barges
  movingPlatforms.push(
    {
      id: 'w3_l5_mp1',
      x: 48 * 32,
      y: 14 * 32,
      width: 96,
      endX: 51 * 32,
      endY: 10 * 32,
      speed: 105,
    },
    {
      id: 'w3_l5_mp2',
      x: 53 * 32,
      y: 10 * 32,
      width: 96,
      endX: 56 * 32,
      endY: 14 * 32,
      speed: 105,
    }
  );

  // Pre-Boss Checkpoint & Pharaoh's Sanctuary (cols 60..86)
  // Power-up slot 3 at col 72 (row 12), Star slot 2 at col 82 (row 12)
  const checkpoint = { x: 64 * 32, y: 14 * 32 };
  grid[12][69] = TileType.QUESTION_COIN;
  grid[12][72] = TileType.QUESTION_FEATHER;
  grid[12][75] = TileType.QUESTION_COIN;
  grid[12][82] = TileType.QUESTION_STAR;
  addCoinRow(coins, 'w3_l5_sanctuary', 69, 9, 9);

  // Boss Arena tactical sandstone bridges (cols 95..117) for battling Solkar, the Sand Titan
  for (let c = 95; c <= 98; c++) grid[12][c] = TileType.BRIDGE;
  for (let c = 105; c <= 108; c++) grid[10][c] = TileType.BRIDGE;
  for (let c = 114; c <= 117; c++) grid[12][c] = TileType.BRIDGE;

  enemies.push(
    { id: 'w3_l5_e1', type: 'KNIGHT', x: 15 * 32, y: 15 * 32 },
    { id: 'w3_l5_fb1', type: 'FIRE_BAR', x: 30 * 32 + 16, y: 13 * 32 + 16 },
    { id: 'w3_l5_e2', type: 'KNIGHT', x: 40 * 32, y: 15 * 32 },
    { id: 'w3_l5_fb2', type: 'FIRE_BAR', x: 44 * 32 + 16, y: 13 * 32 + 16 },
    { id: 'w3_l5_e3', type: 'BAT', x: 52 * 32, y: 7 * 32, patrolRange: 130 },
    { id: 'w3_l5_fb3', type: 'FIRE_BAR', x: 61 * 32 + 16, y: 13 * 32 + 16 },
    { id: 'w3_l5_e4', type: 'BEETLE', x: 79 * 32, y: 15 * 32 }
  );

  return {
    id: 15,
    worldId: 3,
    stageNumber: 5,
    name: 'Level 5: Sunken Pyramid',
    subtitle: 'Lair of Solkar, the Sand Titan',
    theme: 'PYRAMID',
    musicTrack: 'CASTLE_BOSS',
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

export const world3Level5 = buildWorld3Level5();
