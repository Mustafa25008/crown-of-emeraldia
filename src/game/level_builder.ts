import { TileType, CoinDef } from './types';

export const LEVEL_ROWS = 19; // 19 * 32 = 608px

export function createEmptyGrid(cols: number): number[][] {
  const grid: number[][] = [];
  for (let r = 0; r < LEVEL_ROWS; r++) {
    grid.push(new Array(cols).fill(TileType.EMPTY));
  }
  return grid;
}

export function fillGroundRange(grid: number[][], startCol: number, endCol: number, topRow: number = 16) {
  for (let c = startCol; c <= endCol; c++) {
    if (c < 0 || c >= grid[0].length) continue;
    grid[topRow][c] = TileType.GROUND_TOP;
    for (let r = topRow + 1; r < LEVEL_ROWS; r++) {
      grid[r][c] = TileType.GROUND_DEEP;
    }
  }
}

export function addPipe(grid: number[][], col: number, groundRow: number, height: number) {
  const topRow = groundRow - height;
  grid[topRow][col] = TileType.PIPE_TOP_L;
  grid[topRow][col + 1] = TileType.PIPE_TOP_R;
  for (let r = topRow + 1; r < groundRow; r++) {
    grid[r][col] = TileType.PIPE_BODY_L;
    grid[r][col + 1] = TileType.PIPE_BODY_R;
  }
}

export function addStairs(grid: number[][], startCol: number, groundRow: number, steps: number, ascending: boolean = true) {
  for (let i = 0; i < steps; i++) {
    const col = startCol + i;
    const h = ascending ? i + 1 : steps - i;
    for (let r = groundRow - h; r < groundRow; r++) {
      grid[r][col] = TileType.SOLID_STONE;
    }
  }
}

export function addCoinRow(coins: CoinDef[], prefix: string, startCol: number, count: number, row: number) {
  for (let i = 0; i < count; i++) {
    coins.push({
      id: `${prefix}_c_${startCol + i}_${row}`,
      x: (startCol + i) * 32 + 8,
      y: row * 32 + 8,
    });
  }
}

export function addQuicksandPit(grid: number[][], startCol: number, endCol: number, topRow: number = 16) {
  for (let c = startCol; c <= endCol; c++) {
    if (c < 0 || c >= grid[0].length) continue;
    grid[topRow][c] = TileType.QUICKSAND_TOP;
    for (let r = topRow + 1; r < LEVEL_ROWS; r++) {
      grid[r][c] = TileType.QUICKSAND_DEEP;
    }
  }
}

export function addCrumbleBridge(grid: number[][], startCol: number, endCol: number, row: number) {
  for (let c = startCol; c <= endCol; c++) {
    if (c < 0 || c >= grid[0].length) continue;
    grid[row][c] = TileType.CRUMBLE_BLOCK;
  }
}

export function fillIceGroundRange(grid: number[][], startCol: number, endCol: number, topRow: number = 16) {
  for (let c = startCol; c <= endCol; c++) {
    if (c < 0 || c >= grid[0].length) continue;
    grid[topRow][c] = TileType.ICE_GROUND;
    for (let r = topRow + 1; r < LEVEL_ROWS; r++) {
      grid[r][c] = TileType.GROUND_DEEP;
    }
  }
}

export function addFragileIceBridge(grid: number[][], startCol: number, endCol: number, row: number) {
  for (let c = startCol; c <= endCol; c++) {
    if (c < 0 || c >= grid[0].length) continue;
    grid[row][c] = TileType.FRAGILE_ICE;
  }
}

export function addFreezingWaterPit(grid: number[][], startCol: number, endCol: number, topRow: number = 16) {
  for (let c = startCol; c <= endCol; c++) {
    if (c < 0 || c >= grid[0].length) continue;
    grid[topRow][c] = TileType.FREEZING_WATER_TOP;
    for (let r = topRow + 1; r < LEVEL_ROWS; r++) {
      grid[r][c] = TileType.FREEZING_WATER_DEEP;
    }
  }
}

export function addLavaPit(grid: number[][], startCol: number, endCol: number, topRow: number = 16) {
  for (let c = startCol; c <= endCol; c++) {
    if (c < 0 || c >= grid[0].length) continue;
    grid[topRow][c] = TileType.LAVA_TOP;
    for (let r = topRow + 1; r < LEVEL_ROWS; r++) {
      grid[r][c] = TileType.LAVA_DEEP;
    }
  }
}

export function addMagmaCrumbleBridge(grid: number[][], startCol: number, endCol: number, row: number) {
  for (let c = startCol; c <= endCol; c++) {
    if (c < 0 || c >= grid[0].length) continue;
    grid[row][c] = TileType.MAGMA_CRUMBLE;
  }
}
