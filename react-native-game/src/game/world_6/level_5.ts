import { LevelDefinition, TileType, CoinDef, EnemySpawnDef, MovingPlatformDef } from '../types';
import {
  LEVEL_ROWS,
  createEmptyGrid,
  fillGroundRange,
  addCoinRow,
  addCloudPlatform,
  addTempCloudBridge,
} from '../level_builder';

export function buildWorld6Level5(): LevelDefinition {
  const cols = 128;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // Celestial Palace arched ceiling (keep row 1 clear near Question Blocks & high ledges)
  for (let c = 0; c < cols; c++) {
    grid[0][c] = TileType.SOLID_STONE;
    const isNearQuestionBlock =
      (c >= 6 && c <= 16) || (c >= 30 && c <= 46) || (c >= 66 && c <= 86);
    if (c < 90 && c % 4 === 0 && !isNearQuestionBlock) {
      grid[1][c] = TileType.SOLID_STONE;
    }
  }

  // Grand Celestial Palace Halls + Sky Chasm 1 + Sovereign Ascent Chasm 2 + Aetherion's Sky Throne Arena (cols 90..124)
  fillGroundRange(grid, 0, 18);
  // Sky Chasm 1 (cols 19..28)
  fillGroundRange(grid, 29, 46);
  // Sovereign Ascent Chasm 2 (cols 47..59)
  fillGroundRange(grid, 60, 89);
  fillGroundRange(grid, 90, 127);

  // Right wall of Aetherion's Celestial Throne Room
  for (let r = 1; r < 16; r++) {
    grid[r][125] = TileType.SOLID_STONE;
    grid[r][126] = TileType.SOLID_STONE;
  }

  // Early Palace Supply Blocks (Power-up slot 1 at col 10, row 12)
  grid[12][8] = TileType.QUESTION_COIN;
  grid[12][10] = TileType.QUESTION_MUSHROOM;
  grid[12][12] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w6_l5_c1', 8, 5, 9);

  // Sky Chasm 1 (cols 19..28): Disappearing cloud bridges & golden cloud platform
  addTempCloudBridge(grid, 19, 22, 13);
  addCloudPlatform(grid, 23, 25, 11);
  addTempCloudBridge(grid, 26, 28, 13);
  addCoinRow(coins, 'w6_l5_chasm1', 20, 8, 8);

  // Palace Gallery (cols 29..46): Power-up slot 2 at col 35 (row 11), Star slot 1 at col 43 (row 11)
  for (let c = 32; c <= 38; c++) {
    grid[11][c] = c === 35 ? TileType.QUESTION_FIRE : TileType.BRICK;
  }
  grid[15][39] = TileType.STORM_SPIKE;
  grid[11][43] = TileType.QUESTION_STAR;
  addCoinRow(coins, 'w6_l5_c2', 32, 7, 7);

  // Sovereign Ascent Chasm 2 (cols 47..59): Twin moving celestial barges + high cloud arch
  movingPlatforms.push(
    {
      id: 'w6_l5_mp1',
      x: 48 * 32,
      y: 14 * 32,
      width: 96,
      endX: 52 * 32,
      endY: 10 * 32,
      speed: 110,
    },
    {
      id: 'w6_l5_mp2',
      x: 54 * 32,
      y: 10 * 32,
      width: 96,
      endX: 58 * 32,
      endY: 14 * 32,
      speed: 110,
    }
  );
  addCloudPlatform(grid, 51, 55, 7);
  addCoinRow(coins, 'w6_l5_chasm2', 51, 5, 5);

  // Pre-Boss Checkpoint & Celestial Sanctuary (cols 60..89)
  // Power-up slot 3 at col 72 (row 12), Star slot 2 at col 82 (row 12)
  const checkpoint = { x: 64 * 32, y: 14 * 32 };
  grid[12][69] = TileType.QUESTION_COIN;
  grid[12][72] = TileType.QUESTION_FEATHER;
  grid[12][75] = TileType.QUESTION_COIN;
  grid[12][82] = TileType.QUESTION_STAR;
  addCoinRow(coins, 'w6_l5_sanctuary', 69, 9, 9);

  // Boss Arena tactical cloud platforms (cols 95..117) for battling Aetherion, the Storm Sovereign
  addCloudPlatform(grid, 95, 98, 12);
  addCloudPlatform(grid, 105, 108, 10);
  addCloudPlatform(grid, 114, 117, 12);

  enemies.push(
    { id: 'w6_l5_e1', type: 'KNIGHT', x: 15 * 32, y: 15 * 32 },
    { id: 'w6_l5_fb1', type: 'FIRE_BAR', x: 30 * 32 + 16, y: 13 * 32 + 16 },
    { id: 'w6_l5_e2', type: 'KNIGHT', x: 41 * 32, y: 15 * 32 },
    { id: 'w6_l5_fb2', type: 'FIRE_BAR', x: 45 * 32 + 16, y: 13 * 32 + 16 },
    { id: 'w6_l5_e3', type: 'BAT', x: 53 * 32, y: 6 * 32, patrolRange: 135 },
    { id: 'w6_l5_fb3', type: 'FIRE_BAR', x: 61 * 32 + 16, y: 13 * 32 + 16 },
    { id: 'w6_l5_e4', type: 'BEETLE', x: 79 * 32, y: 15 * 32 }
  );

  return {
    id: 30,
    worldId: 6,
    stageNumber: 5,
    name: 'Level 5: Celestial Palace',
    subtitle: 'Sanctum of Aetherion, the Storm Sovereign',
    theme: 'CELESTIAL_PALACE',
    musicTrack: 'CASTLE_BOSS',
    lightningStrikes: [
      { col: 24, topRow: 1, bottomRow: 11, cycleSeconds: 4.0, phaseOffset: 0.6 },
      { col: 53, topRow: 1, bottomRow: 14, cycleSeconds: 4.2, phaseOffset: 1.9 },
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

export const world6Level5 = buildWorld6Level5();
