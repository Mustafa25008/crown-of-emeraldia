export type GameState =
  | 'TITLE_MENU'
  | 'WORLD_SELECT'
  | 'LEVEL_SELECT'
  | 'SETTINGS_HUB'
  | 'CONTROLS'
  | 'SETTINGS'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_COMPLETE'
  | 'GAME_OVER'
  | 'WORLD_VICTORY';

export type PowerState = 'SMALL' | 'BIG' | 'FIRE' | 'RACCOON';

export type LevelTheme = 'HILLS' | 'FOREST' | 'CAVERN' | 'FORTRESS' | 'CASTLE';

export enum TileType {
  EMPTY = 0,
  GROUND_TOP = 1,
  GROUND_DEEP = 2,
  BRICK = 3,
  QUESTION_COIN = 4,
  QUESTION_MUSHROOM = 5,
  QUESTION_FIRE = 6,
  QUESTION_STAR = 7,
  USED_BLOCK = 8,
  SOLID_STONE = 9,
  PIPE_TOP_L = 10,
  PIPE_TOP_R = 11,
  PIPE_BODY_L = 12,
  PIPE_BODY_R = 13,
  SPIKE = 14,
  LAVA_TOP = 15,
  LAVA_DEEP = 16,
  BRIDGE = 17,
  HIDDEN_BONUS = 18,
  QUESTION_FEATHER = 19,
}

export interface MovingPlatformDef {
  id: string;
  x: number;
  y: number;
  width: number;
  endX: number;
  endY: number;
  speed: number;
}

export interface EnemySpawnDef {
  id: string;
  type: 'SLIME' | 'BEETLE' | 'BAT' | 'KNIGHT' | 'FIRE_BAR';
  x: number;
  y: number;
  patrolRange?: number;
}

export interface CoinDef {
  id: string;
  x: number;
  y: number;
}

export interface CheckpointDef {
  x: number;
  y: number;
}

export interface LevelDefinition {
  id: number;
  name: string;
  subtitle: string;
  theme: LevelTheme;
  musicTrack: 'OVERWORLD' | 'FOREST' | 'CAVERN' | 'FORTRESS' | 'CASTLE_BOSS';
  widthInTiles: number;
  heightInTiles: number;
  tiles: number[][];
  coins: CoinDef[];
  enemies: EnemySpawnDef[];
  movingPlatforms: MovingPlatformDef[];
  checkpoint?: CheckpointDef;
  goalX: number;
  goalY: number;
  hasBoss?: boolean;
  bossArenaStartX?: number;
  playerStart: { x: number; y: number };
}

export interface SaveProgress {
  unlockedLevel: number;
  highScores: Record<number, number>;
  bestCoins: Record<number, number>;
  totalCoinsCollected: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
}

export interface ActivePowerUpItem {
  id: string;
  type: 'MUSHROOM' | 'FIRE_FLOWER' | 'FEATHER' | 'STAR' | 'COIN_POP';
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  spawnTimer: number;
  collected: boolean;
}

export interface ActiveFireball {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  bounces: number;
  isEnemyProjectile?: boolean;
  active: boolean;
}

export interface ActiveEnemy {
  id: string;
  type: 'SLIME' | 'BEETLE' | 'BAT' | 'KNIGHT' | 'FIRE_BAR';
  x: number;
  y: number;
  startX: number;
  startY: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  state: 'PATROL' | 'SHELL_IDLE' | 'SHELL_MOVING' | 'SQUISHED' | 'DEAD';
  facing: -1 | 1;
  animTimer: number;
  squishTimer: number;
  patrolRange: number;
  angle?: number;
}

export interface BossState {
  active: boolean;
  name: string;
  hp: number;
  maxHp: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: -1 | 1;
  phase: 'IDLE' | 'CHARGE' | 'JUMP_SLAM' | 'FIRE_BREATH' | 'VULNERABLE' | 'HURT' | 'DEFEATED';
  phaseTimer: number;
  invulnerableTimer: number;
  animFrame: number;
  attackCounter: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  gravity?: boolean;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

export interface BumpedTile {
  tx: number;
  ty: number;
  offsetY: number;
  timer: number;
}

export interface HudSnapshot {
  score: number;
  coins: number;
  lives: number;
  levelId: number;
  levelName: string;
  powerState: PowerState;
  isInvincibleStar: boolean;
  starTimeRemaining: number;
  checkpointReached: boolean;
  boss: {
    active: boolean;
    name: string;
    hp: number;
    maxHp: number;
    phase: string;
  } | null;
}
