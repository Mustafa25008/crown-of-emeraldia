import { LevelDefinition, TileType, CoinDef, EnemySpawnDef, MovingPlatformDef } from '../types';
import {
  LEVEL_ROWS,
  createEmptyGrid,
  fillGroundRange,
  addCoinRow,
} from '../level_builder';

export function buildLevel5(): LevelDefinition {
  const cols = 128;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // Castle ceiling
  for (let c = 0; c < cols; c++) {
    grid[0][c] = TileType.SOLID_STONE;
    if (c < 90 && c % 4 === 0) {
      grid[1][c] = TileType.SOLID_STONE;
    }
  }

  // Castle gauntlet floor + Boss Arena (cols 90..124)
  fillGroundRange(grid, 0, 18);
  fillGroundRange(grid, 27, 46);
  fillGroundRange(grid, 58, 86);
  fillGroundRange(grid, 87, 127);

  // Lava pits in castle gauntlet
  const lavaGaps = [
    [19, 26],
    [47, 57],
  ];
  for (const [s, e] of lavaGaps) {
    for (let c = s; c <= e; c++) {
      grid[17][c] = TileType.LAVA_TOP;
      grid[18][c] = TileType.LAVA_DEEP;
    }
  }

  // Right wall of Boss Arena
  for (let r = 1; r < 16; r++) {
    grid[r][125] = TileType.SOLID_STONE;
    grid[r][126] = TileType.SOLID_STONE;
  }

  // Supply blocks at start
  grid[12][8] = TileType.QUESTION_MUSHROOM;
  grid[12][10] = TileType.QUESTION_FIRE;
  addCoinRow(coins, 'l5_c1', 7, 5, 9);

  // Moving platform over Lava Pit 1 (cols 19..26)
  movingPlatforms.push({
    id: 'l5_mp1',
    x: 19 * 32,
    y: 14 * 32,
    width: 96,
    endX: 24 * 32,
    endY: 12 * 32,
    speed: 95,
  });

  // Mid Castle Hall (cols 27..46)
  for (let c = 32; c <= 38; c++) {
    grid[11][c] = c === 35 ? TileType.QUESTION_COIN : TileType.BRICK;
  }
  addCoinRow(coins, 'l5_c2', 32, 7, 8);

  // Lava Pit 2 (cols 47..57) with bridges & moving platforms
  movingPlatforms.push(
    {
      id: 'l5_mp2',
      x: 48 * 32,
      y: 14 * 32,
      width: 96,
      endX: 51 * 32,
      endY: 10 * 32,
      speed: 100,
    },
    {
      id: 'l5_mp3',
      x: 53 * 32,
      y: 10 * 32,
      width: 96,
      endX: 56 * 32,
      endY: 14 * 32,
      speed: 100,
    }
  );

  // Pre-Boss Checkpoint & Power-Up Sanctuary (cols 60..86)
  const checkpoint = { x: 64 * 32, y: 14 * 32 };
  grid[12][70] = TileType.QUESTION_MUSHROOM;
  grid[12][73] = TileType.QUESTION_FIRE;
  grid[12][76] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'l5_sanctuary', 69, 9, 9);

  // Boss Arena tactical platforms (cols 94..118) so player can dodge fire & stomp Dredge!
  for (let c = 95; c <= 98; c++) grid[12][c] = TileType.BRIDGE;
  for (let c = 105; c <= 108; c++) grid[10][c] = TileType.BRIDGE;
  for (let c = 114; c <= 117; c++) grid[12][c] = TileType.BRIDGE;

  enemies.push(
    { id: 'l5_e1', type: 'KNIGHT', x: 14 * 32, y: 15 * 32 },
    { id: 'l5_fb1', type: 'FIRE_BAR', x: 30 * 32 + 16, y: 13 * 32 + 16 },
    { id: 'l5_e2', type: 'KNIGHT', x: 40 * 32, y: 15 * 32 },
    { id: 'l5_fb2', type: 'FIRE_BAR', x: 44 * 32 + 16, y: 13 * 32 + 16 },
    { id: 'l5_e3', type: 'BAT', x: 52 * 32, y: 7 * 32, patrolRange: 130 },
    { id: 'l5_e4', type: 'BEETLE', x: 80 * 32, y: 15 * 32 }
  );

  return {
    id: 5,
    name: 'Level 5: Final Castle & Boss Fight',
    subtitle: 'Throne of Ironclad King Dredge',
    theme: 'CASTLE',
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

export const level5 = buildLevel5();
