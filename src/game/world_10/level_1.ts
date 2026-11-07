import {
  LevelDefinition,
  TileType,
  CoinDef,
  EnemySpawnDef,
  MovingPlatformDef,
} from '../types';
import {
  LEVEL_ROWS,
  createEmptyGrid,
  fillGroundRange,
  addStairs,
  addCoinRow,
  addAncientCrumbleBridge,
} from '../level_builder';

export function buildWorld10Level1(): LevelDefinition {
  const cols = 192;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // 10-1: Forgotten Jungle
  // Dense overgrown jungle ruins with venomous flora, collapsing stone bridges, and canopy vine platforms
  fillGroundRange(grid, 0, 26, 16);
  fillGroundRange(grid, 33, 62, 16);
  fillGroundRange(grid, 70, 102, 16);
  fillGroundRange(grid, 110, 144, 16);
  fillGroundRange(grid, 152, 191, 16);

  // Collapsing ancient stone bridges over jungle ravines
  addAncientCrumbleBridge(grid, 27, 32, 15);
  addAncientCrumbleBridge(grid, 63, 69, 14);
  addAncientCrumbleBridge(grid, 103, 109, 14);

  // Moving vine-draped stone platform over ravine 145..151
  movingPlatforms.push({
    id: 'w10_l1_mp1',
    x: 145 * 32,
    y: 14 * 32,
    width: 96,
    endX: 149 * 32,
    endY: 10 * 32,
    speed: 70,
  });

  // Poisonous Jungle Plant hazards
  grid[15][18] = TileType.POISON_PLANT;
  grid[15][46] = TileType.POISON_PLANT;
  grid[15][47] = TileType.POISON_PLANT;
  grid[15][86] = TileType.POISON_PLANT;
  grid[15][126] = TileType.POISON_PLANT;
  grid[15][127] = TileType.POISON_PLANT;

  // Power-Up Slot 1: Mushroom at col 14, row 12
  grid[12][13] = TileType.BRICK;
  grid[12][14] = TileType.QUESTION_MUSHROOM;
  grid[12][15] = TileType.BRICK;
  addCoinRow(coins, 'w10_1', 12, 5, 9);

  // Overgrown temple terrace (cols 37..43, row 12)
  for (let c = 37; c <= 43; c++) grid[12][c] = TileType.BRICK;
  grid[12][40] = TileType.QUESTION_COIN;
  addCoinRow(coins, 'w10_1', 37, 7, 9);

  // Star Slot 1 at col 54, row 12
  grid[12][53] = TileType.BRICK;
  grid[12][54] = TileType.QUESTION_STAR;
  grid[12][55] = TileType.BRICK;

  // Power-Up Slot 2: Solar Fire Flower at col 76, row 12
  grid[12][75] = TileType.BRICK;
  grid[12][76] = TileType.QUESTION_FIRE;
  grid[12][77] = TileType.BRICK;
  addCoinRow(coins, 'w10_1', 74, 5, 9);

  // High jungle canopy walkway (cols 82..94, row 8)
  addAncientCrumbleBridge(grid, 82, 94, 8);
  addCoinRow(coins, 'w10_1', 83, 10, 5);

  // Power-Up Slot 3: Raccoon Feather at col 118, row 12
  grid[12][117] = TileType.BRICK;
  grid[12][118] = TileType.QUESTION_FEATHER;
  grid[12][119] = TileType.BRICK;

  // Star Slot 2 at col 158, row 12
  grid[12][157] = TileType.BRICK;
  grid[12][158] = TileType.QUESTION_STAR;
  grid[12][159] = TileType.BRICK;
  addCoinRow(coins, 'w10_1', 156, 5, 9);

  addStairs(grid, 173, 16, 6, true);
  addCoinRow(coins, 'w10_1', 174, 5, 9);

  enemies.push(
    { id: 'w10_1_e1', type: 'SLIME', x: 21 * 32, y: 15 * 32 },
    { id: 'w10_1_e2', type: 'BEETLE', x: 41 * 32, y: 15 * 32 },
    { id: 'w10_1_e3', type: 'BAT', x: 58 * 32, y: 9 * 32, patrolRange: 120 },
    { id: 'w10_1_e4', type: 'SLIME', x: 80 * 32, y: 15 * 32 },
    { id: 'w10_1_e5', type: 'KNIGHT', x: 96 * 32, y: 15 * 32, patrolRange: 100 },
    { id: 'w10_1_e6', type: 'BEETLE', x: 122 * 32, y: 15 * 32 },
    { id: 'w10_1_e7', type: 'BAT', x: 138 * 32, y: 8 * 32, patrolRange: 130 },
    { id: 'w10_1_e8', type: 'KNIGHT', x: 164 * 32, y: 15 * 32, patrolRange: 100 }
  );

  return {
    id: 46,
    worldId: 10,
    stageNumber: 1,
    name: '10-1: Forgotten Jungle',
    subtitle: 'Overgrown ziggurats, venomous flora, and crumbling stone bridges',
    theme: 'FORGOTTEN_JUNGLE',
    musicTrack: 'RUINS',
    widthInTiles: cols,
    heightInTiles: LEVEL_ROWS,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    checkpoint: { x: 98 * 32, y: 14 * 32 },
    goalX: 182 * 32,
    goalY: 6 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}
