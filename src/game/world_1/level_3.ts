import { LevelDefinition, TileType, CoinDef, EnemySpawnDef, MovingPlatformDef } from '../types';
import {
  LEVEL_ROWS,
  createEmptyGrid,
  fillGroundRange,
  addStairs,
  addCoinRow,
} from '../level_builder';

export function buildLevel3(): LevelDefinition {
  const cols = 135;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // Underground ceiling
  for (let c = 0; c < cols; c++) {
    grid[0][c] = TileType.GROUND_DEEP;
    if (c % 5 === 0 && c > 6 && c < 115) {
      grid[1][c] = TileType.GROUND_DEEP;
    }
  }

  // Cavern floor sections & narrow underground ledges
  fillGroundRange(grid, 0, 20);
  fillGroundRange(grid, 24, 48);
  fillGroundRange(grid, 64, 88);
  fillGroundRange(grid, 102, 134);

  // Spike pit between 20 and 24
  for (let c = 21; c <= 23; c++) {
    grid[17][c] = TileType.SPIKE;
    grid[18][c] = TileType.GROUND_DEEP;
  }
  grid[13][22] = TileType.BRIDGE;

  // Early powerup (Power-up slot 1 at col 12)
  grid[12][11] = TileType.BRICK;
  grid[12][12] = TileType.QUESTION_MUSHROOM;
  grid[12][13] = TileType.QUESTION_COIN;
  grid[12][14] = TileType.BRICK;

  // Hidden Subterranean Vault in ceiling (cols 28..42)
  for (let c = 28; c <= 42; c++) {
    grid[6][c] = TileType.BRICK;
  }
  // Stepping stones to reach vault
  grid[12][27] = TileType.SOLID_STONE;
  grid[9][26] = TileType.SOLID_STONE;
  // Vault floating power block at row 3 (Power-up slot 2 at col 35)
  grid[3][35] = TileType.QUESTION_FIRE;
  // Coins float above vault floor (floor at row 6, coins placed at row 4 to avoid row 3 blocks)
  addCoinRow(coins, 'l3_vault_l', 29, 4, 4);
  addCoinRow(coins, 'l3_vault_r', 39, 4, 4);

  // Narrow platforms over abyss (cols 49..63) + Star slot 1 at col 56
  grid[14][51] = TileType.SOLID_STONE;
  grid[14][52] = TileType.SOLID_STONE;
  grid[12][55] = TileType.SOLID_STONE;
  grid[12][56] = TileType.SOLID_STONE;
  grid[8][56] = TileType.QUESTION_STAR;
  grid[10][59] = TileType.SOLID_STONE;
  grid[10][60] = TileType.SOLID_STONE;
  addCoinRow(coins, 'l3_narrow', 51, 10, 7);

  const checkpoint = { x: 67 * 32, y: 14 * 32 };

  // Cavern hazard section with spikes and bridges (Power-up slot 3 at col 80)
  for (let c = 73; c <= 81; c++) {
    grid[15][c] = TileType.SPIKE;
  }
  for (let c = 72; c <= 75; c++) grid[12][c] = TileType.BRIDGE;
  for (let c = 78; c <= 82; c++) grid[10][c] = TileType.BRIDGE;
  grid[6][80] = TileType.QUESTION_FEATHER;

  // Moving cavern elevators over second abyss (cols 88..102)
  movingPlatforms.push(
    {
      id: 'l3_mp1',
      x: 90 * 32,
      y: 14 * 32,
      width: 96,
      endX: 94 * 32,
      endY: 9 * 32,
      speed: 90,
    },
    {
      id: 'l3_mp2',
      x: 96 * 32,
      y: 9 * 32,
      width: 96,
      endX: 100 * 32,
      endY: 14 * 32,
      speed: 90,
    }
  );
  addCoinRow(coins, 'l3_elev', 91, 8, 7);

  // Star slot 2 before final cavern stairs
  grid[12][104] = TileType.BRICK;
  grid[12][105] = TileType.QUESTION_STAR;
  grid[12][106] = TileType.BRICK;

  // Final cavern stairs
  addStairs(grid, 112, 16, 6, true);

  enemies.push(
    { id: 'l3_e1', type: 'BEETLE', x: 16 * 32, y: 15 * 32 },
    { id: 'l3_e2', type: 'BAT', x: 22 * 32, y: 9 * 32, patrolRange: 110 },
    { id: 'l3_e3', type: 'SLIME', x: 33 * 32, y: 15 * 32 },
    { id: 'l3_e4', type: 'KNIGHT', x: 42 * 32, y: 15 * 32 },
    { id: 'l3_e5', type: 'BAT', x: 55 * 32, y: 7 * 32, patrolRange: 130 },
    { id: 'l3_e6', type: 'BEETLE', x: 70 * 32, y: 15 * 32 },
    { id: 'l3_e7', type: 'BAT', x: 77 * 32, y: 7 * 32, patrolRange: 120 },
    { id: 'l3_e8', type: 'KNIGHT', x: 85 * 32, y: 15 * 32 },
    { id: 'l3_e9', type: 'BEETLE', x: 106 * 32, y: 15 * 32 }
  );

  return {
    id: 3,
    name: 'Level 3: Underground Caverns',
    subtitle: 'Crystal Depths & Stalactite Traps',
    theme: 'CAVERN',
    musicTrack: 'CAVERN',
    widthInTiles: cols,
    heightInTiles: LEVEL_ROWS,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    checkpoint,
    goalX: 125 * 32,
    goalY: 6 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}

export const level3 = buildLevel3();
