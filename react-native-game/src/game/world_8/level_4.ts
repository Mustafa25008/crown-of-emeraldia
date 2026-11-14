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
  addPhantomBridge,
  addCrumbleBridge,
} from '../level_builder';

export function buildWorld8Level4(): LevelDefinition {
  const cols = 200;
  const grid = createEmptyGrid(cols);
  const coins: CoinDef[] = [];
  const enemies: EnemySpawnDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // 8-4: Cursed Moonlight
  // High-altitude haunted ridge under a blood-violet full moon with dark gale winds and lightning
  fillGroundRange(grid, 0, 24, 16);
  fillGroundRange(grid, 34, 62, 16);
  fillGroundRange(grid, 72, 104, 16);
  fillGroundRange(grid, 116, 148, 16);
  fillGroundRange(grid, 160, 199, 16);

  // Phantom & crumble bridges across moonlit chasms
  addPhantomBridge(grid, 25, 33, 14);
  addCrumbleBridge(grid, 63, 71, 14);
  addPhantomBridge(grid, 105, 115, 13);

  // Moving spectral platforms across chasm 149..159
  movingPlatforms.push(
    {
      id: 'w8_l4_mp1',
      x: 149 * 32,
      y: 14 * 32,
      width: 96,
      endX: 156 * 32,
      endY: 10 * 32,
      speed: 78,
    }
  );

  // Cursed thorn & spike hazards
  grid[15][18] = TileType.CURSED_THORN;
  grid[15][46] = TileType.CURSED_THORN;
  grid[15][47] = TileType.CURSED_THORN;
  grid[15][88] = TileType.CURSED_THORN;
  grid[15][134] = TileType.CURSED_THORN;
  grid[15][135] = TileType.CURSED_THORN;

  // Power-Up Slot 1: Mushroom at col 13, row 12
  grid[12][12] = TileType.BRICK;
  grid[12][13] = TileType.QUESTION_MUSHROOM;
  grid[12][14] = TileType.BRICK;
  addCoinRow(coins, 'w8_4', 11, 5, 9);

  // Star Slot 1 at col 40, row 12
  grid[12][39] = TileType.BRICK;
  grid[12][40] = TileType.QUESTION_STAR;
  grid[12][41] = TileType.BRICK;
  addCoinRow(coins, 'w8_4', 38, 5, 9);

  // Power-Up Slot 2: Solar Fire Flower at col 78, row 12
  grid[12][77] = TileType.BRICK;
  grid[12][78] = TileType.QUESTION_FIRE;
  grid[12][79] = TileType.BRICK;
  addCoinRow(coins, 'w8_4', 76, 5, 9);

  // Moonlit upper phantom terrace (cols 84..94, row 8)
  addPhantomBridge(grid, 84, 94, 8);
  addCoinRow(coins, 'w8_4', 85, 9, 5);

  // Power-Up Slot 3: Raccoon Feather at col 124, row 12
  grid[12][123] = TileType.BRICK;
  grid[12][124] = TileType.QUESTION_FEATHER;
  grid[12][125] = TileType.BRICK;

  // Star Slot 2 at col 142, row 12
  grid[12][141] = TileType.BRICK;
  grid[12][142] = TileType.QUESTION_STAR;
  grid[12][143] = TileType.BRICK;
  addCoinRow(coins, 'w8_4', 140, 5, 9);

  addStairs(grid, 181, 16, 6, true);
  addCoinRow(coins, 'w8_4', 182, 5, 9);

  enemies.push(
    { id: 'w8_4_e1', type: 'BAT', x: 28 * 32, y: 9 * 32, patrolRange: 130 },
    { id: 'w8_4_e2', type: 'KNIGHT', x: 52 * 32, y: 15 * 32, patrolRange: 110 },
    { id: 'w8_4_e3', type: 'BEETLE', x: 82 * 32, y: 15 * 32 },
    { id: 'w8_4_e4', type: 'BAT', x: 108 * 32, y: 8 * 32, patrolRange: 140 },
    { id: 'w8_4_e5', type: 'KNIGHT', x: 128 * 32, y: 15 * 32, patrolRange: 110 },
    { id: 'w8_4_e6', type: 'SLIME', x: 144 * 32, y: 15 * 32 },
    { id: 'w8_4_e7', type: 'KNIGHT', x: 168 * 32, y: 15 * 32, patrolRange: 100 }
  );

  return {
    id: 39,
    worldId: 8,
    stageNumber: 4,
    name: '8-4: Cursed Moonlight',
    subtitle: 'Howling night gales, cursed lightning, and vanishing bridges',
    theme: 'HAUNTED_WOODS',
    musicTrack: 'SHADOWVEIL',
    hasStormClouds: true,
    windForce: -55,
    lightningStrikes: [
      { col: 50, topRow: 0, bottomRow: 16, cycleSeconds: 4.2, phaseOffset: 0.5 },
      { col: 96, topRow: 0, bottomRow: 16, cycleSeconds: 4.0, phaseOffset: 1.8 },
      { col: 138, topRow: 0, bottomRow: 16, cycleSeconds: 3.8, phaseOffset: 2.9 },
    ],
    teleporters: [
      { id: 'w8_4_tp1', fromCol: 81, fromRow: 16, toCol: 85, toRow: 8 },
    ],
    widthInTiles: cols,
    heightInTiles: LEVEL_ROWS,
    tiles: grid,
    coins,
    enemies,
    movingPlatforms,
    checkpoint: { x: 100 * 32, y: 14 * 32 },
    goalX: 190 * 32,
    goalY: 6 * 32,
    playerStart: { x: 3 * 32, y: 14 * 32 },
  };
}
