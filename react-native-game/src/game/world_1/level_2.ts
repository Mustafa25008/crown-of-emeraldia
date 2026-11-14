import { LevelDefinition, TileType, CoinDef, EnemySpawnDef, MovingPlatformDef } from '../types';
import {
  LEVEL_ROWS,
  createEmptyGrid,
  fillGroundRange,
  addPipe,
  addStairs,
  addCoinRow,
} from '../level_builder';

export function buildLevel2(): LevelDefinition {
  const cols = 130;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // Forest floor with wider gaps and elevated canopy ledges
  fillGroundRange(grid, 0, 18);
  fillGroundRange(grid, 25, 42);
  fillGroundRange(grid, 53, 74);
  fillGroundRange(grid, 86, 102);
  fillGroundRange(grid, 106, 129);

  // First canopy blocks
  grid[12][10] = TileType.BRICK;
  grid[12][11] = TileType.QUESTION_MUSHROOM;
  grid[12][12] = TileType.BRICK;
  addCoinRow(coins, 'l2_c1', 9, 5, 9);

  // Moving platform across gap 1 (cols 18..25)
  movingPlatforms.push({
    id: 'l2_mp1',
    x: 19 * 32,
    y: 14 * 32,
    width: 96,
    endX: 23 * 32,
    endY: 11 * 32,
    speed: 75,
  });

  // Forest high treetop platforms + Optional Hidden Canopy Bonus Area!
  // Bridge is placed at row 13, and Question Block is placed at row 9 (4 full tiles = 128px clearance for Big Pip!)
  for (let c = 28; c <= 35; c++) {
    grid[13][c] = TileType.BRIDGE;
  }
  grid[9][31] = TileType.QUESTION_FIRE;

  // Stepping blocks up to the Hidden Treetop Stash
  grid[11][36] = TileType.SOLID_STONE;
  grid[9][38] = TileType.SOLID_STONE;
  for (let c = 40; c <= 47; c++) {
    grid[8][c] = TileType.BRIDGE;
  }
  // Floating blocks at row 4 (4 full tiles below top border AND 3 full empty tiles above row 8 bridge)
  grid[4][42] = TileType.QUESTION_STAR;
  grid[4][45] = TileType.QUESTION_COIN;
  // Coins float cleanly above the bridge at row 6
  addCoinRow(coins, 'l2_secret_canopy', 40, 8, 6);

  // Moving platforms across wide forest chasm (cols 42..53)
  movingPlatforms.push(
    {
      id: 'l2_mp2',
      x: 43 * 32,
      y: 14 * 32,
      width: 96,
      endX: 47 * 32,
      endY: 14 * 32,
      speed: 90,
    },
    {
      id: 'l2_mp3',
      x: 48 * 32,
      y: 11 * 32,
      width: 96,
      endX: 52 * 32,
      endY: 11 * 32,
      speed: 95,
    }
  );
  addCoinRow(coins, 'l2_chasm_coins', 44, 7, 9);

  const checkpoint = { x: 58 * 32, y: 14 * 32 };

  // Forest pipes & bricks
  addPipe(grid, 62, 16, 3);
  addPipe(grid, 69, 16, 4);
  grid[10][65] = TileType.BRICK;
  grid[10][66] = TileType.QUESTION_FEATHER;
  grid[10][67] = TileType.BRICK;

  // Vertical & horizontal moving platforms across gap (cols 74..86)
  movingPlatforms.push(
    {
      id: 'l2_mp4',
      x: 76 * 32,
      y: 15 * 32,
      width: 96,
      endX: 76 * 32,
      endY: 9 * 32,
      speed: 85,
    },
    {
      id: 'l2_mp5',
      x: 80 * 32,
      y: 10 * 32,
      width: 96,
      endX: 84 * 32,
      endY: 13 * 32,
      speed: 95,
    }
  );
  addCoinRow(coins, 'l2_vert_coins', 79, 5, 7);

  // Final stretch before flagpole (Star slot 2 at col 93)
  for (let c = 91; c <= 96; c++) {
    grid[12][c] =
      c === 93 ? TileType.QUESTION_STAR : c % 2 === 0 ? TileType.BRICK : TileType.QUESTION_COIN;
  }
  addStairs(grid, 108, 16, 6, true);

  enemies.push(
    { id: 'l2_e1', type: 'SLIME', x: 14 * 32, y: 15 * 32 },
    { id: 'l2_e2', type: 'BEETLE', x: 30 * 32, y: 15 * 32 },
    { id: 'l2_e3', type: 'SLIME', x: 37 * 32, y: 15 * 32 },
    { id: 'l2_e4', type: 'BAT', x: 46 * 32, y: 8 * 32, patrolRange: 140 },
    { id: 'l2_e5', type: 'BEETLE', x: 66 * 32, y: 15 * 32 },
    { id: 'l2_e6', type: 'BAT', x: 79 * 32, y: 8 * 32, patrolRange: 120 },
    { id: 'l2_e7', type: 'SLIME', x: 90 * 32, y: 15 * 32 },
    { id: 'l2_e8', type: 'BEETLE', x: 95 * 32, y: 15 * 32 },
    { id: 'l2_e9', type: 'SLIME', x: 100 * 32, y: 15 * 32 }
  );

  return {
    id: 2,
    name: 'Level 2: Mushroom Forest',
    subtitle: 'Canopy Ledges & Secret Treetops',
    theme: 'FOREST',
    musicTrack: 'FOREST',
    widthInTiles: cols,
    heightInTiles: LEVEL_ROWS,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    checkpoint,
    goalX: 120 * 32,
    goalY: 6 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}

export const level2 = buildLevel2();
