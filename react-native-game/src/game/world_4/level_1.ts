import { LevelDefinition, TileType, CoinDef, EnemySpawnDef, MovingPlatformDef } from '../types';
import {
  LEVEL_ROWS,
  createEmptyGrid,
  fillGroundRange,
  fillIceGroundRange,
  addPipe,
  addStairs,
  addCoinRow,
  addFragileIceBridge,
} from '../level_builder';

export function buildWorld4Level1(): LevelDefinition {
  const cols = 128;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // Snowy mountain trails alternating with frozen ponds (slippery ICE_GROUND patches)
  fillGroundRange(grid, 0, 19);
  fillIceGroundRange(grid, 20, 31, 16); // Frozen Pond 1
  fillGroundRange(grid, 32, 47);
  // Chasm 1 at cols 48..51
  fillGroundRange(grid, 52, 69);
  fillIceGroundRange(grid, 70, 82, 16); // Frozen Pond 2
  // Chasm 2 at cols 83..86
  fillGroundRange(grid, 87, 127);

  // Early Power-up slot 1 at col 12 (row 12 = 4 tiles above row 16 ground)
  grid[12][10] = TileType.BRICK;
  grid[12][11] = TileType.QUESTION_COIN;
  grid[12][12] = TileType.QUESTION_MUSHROOM;
  grid[12][13] = TileType.QUESTION_COIN;
  grid[12][14] = TileType.BRICK;
  addCoinRow(coins, 'w4_l1_intro', 10, 5, 9);

  // Snow-covered bridge & icicle guard over Frozen Pond 1 (cols 20..31)
  for (let c = 23; c <= 28; c++) {
    grid[12][c] = TileType.BRIDGE;
  }
  grid[15][25] = TileType.ICICLE;
  addCoinRow(coins, 'w4_l1_pond1', 23, 6, 9);

  // Star slot 1 at col 36 (row 11)
  grid[11][35] = TileType.BRICK;
  grid[11][36] = TileType.QUESTION_STAR;
  grid[11][37] = TileType.BRICK;

  addPipe(grid, 42, 16, 3);

  // Fragile ice bridge over Chasm 1 (cols 48..51)
  addFragileIceBridge(grid, 48, 51, 13);
  addCoinRow(coins, 'w4_l1_chasm1', 48, 4, 10);

  // Mid-level Power-up slot 2 at col 58 (row 12 = 4 tiles above ground)
  grid[12][56] = TileType.QUESTION_COIN;
  grid[12][57] = TileType.BRICK;
  grid[12][58] = TileType.QUESTION_FIRE;
  grid[12][59] = TileType.BRICK;
  grid[12][60] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w4_l1_mid', 56, 5, 9);

  // Checkpoint at col 65
  const checkpoint = { x: 65 * 32, y: 14 * 32 };

  // Elevated snow platforms above Frozen Pond 2 (cols 70..82)
  for (let c = 72; c <= 76; c++) {
    grid[11][c] = TileType.ICE_GROUND;
  }
  grid[15][78] = TileType.ICICLE;
  addCoinRow(coins, 'w4_l1_pond2', 72, 5, 8);

  // Moving ice platform over Chasm 2 (cols 83..86)
  movingPlatforms.push({
    id: 'w4_l1_mp1',
    x: 83 * 32,
    y: 13 * 32,
    width: 96,
    endX: 85 * 32,
    endY: 10 * 32,
    speed: 85,
  });

  // Late-level Power-up slot 3 at col 92 (row 12) & Star slot 2 at col 100 (row 11)
  grid[12][91] = TileType.BRICK;
  grid[12][92] = TileType.QUESTION_FEATHER;
  grid[12][93] = TileType.BRICK;
  grid[11][100] = TileType.QUESTION_STAR;
  addCoinRow(coins, 'w4_l1_late', 90, 5, 9);

  // Final stone stairs leading to Goal Flagpole
  addStairs(grid, 106, 16, 6, true);

  enemies.push(
    { id: 'w4_l1_e1', type: 'SLIME', x: 16 * 32, y: 15 * 32 },
    { id: 'w4_l1_e2', type: 'BEETLE', x: 28 * 32, y: 15 * 32 },
    { id: 'w4_l1_e3', type: 'SLIME', x: 39 * 32, y: 15 * 32 },
    { id: 'w4_l1_e4', type: 'BAT', x: 50 * 32, y: 8 * 32, patrolRange: 110 },
    { id: 'w4_l1_e5', type: 'BEETLE', x: 61 * 32, y: 15 * 32 },
    { id: 'w4_l1_e6', type: 'KNIGHT', x: 75 * 32, y: 15 * 32 },
    { id: 'w4_l1_e7', type: 'SLIME', x: 96 * 32, y: 15 * 32 },
    { id: 'w4_l1_e8', type: 'BEETLE', x: 103 * 32, y: 15 * 32 }
  );

  return {
    id: 16,
    worldId: 4,
    stageNumber: 1,
    name: 'Level 1: Snowbound Trails',
    subtitle: 'Snowy Trails, Frozen Ponds & Frost Sprites',
    theme: 'SNOW',
    musicTrack: 'SNOW',
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

export const world4Level1 = buildWorld4Level1();
