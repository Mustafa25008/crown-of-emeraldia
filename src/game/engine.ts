import {
  LevelDefinition,
  TileType,
  PowerState,
  ActiveEnemy,
  ActivePowerUpItem,
  ActiveFireball,
  BossState,
  Particle,
  FloatingText,
  BumpedTile,
  HudSnapshot,
} from './types';
import { soundManager } from './audio';
import {
  drawParallaxBackground,
  drawTile,
  drawCoin,
  drawMovingPlatform,
  drawCheckpointFlag,
  drawGoalFlagpole,
  drawPlayer,
  drawEnemy,
  drawPowerUpItem,
  drawFireball,
  drawBoss,
  drawSandstormOverlay,
  drawParticlesAndFloatingText,
} from './renderer';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 608; // 19 tiles * 32px
export const TILE_SIZE = 32;

// Physics constants tuned for crisp classic Super Mario Bros. feel
const GRAVITY = 1550;
const MAX_FALL_SPEED = 680;
const WALK_ACCEL = 1150;
const RUN_ACCEL = 1650;
const GROUND_FRICTION = 1350;
const AIR_FRICTION = 450;
const MAX_WALK_SPEED = 230;
const MAX_RUN_SPEED = 350;
const JUMP_INITIAL_VEL = -500;
const JUMP_HOLD_BOOST = -1150; // extra upward force while jump held
const MAX_JUMP_HOLD_TIME = 0.21; // 210ms variable jump window
const COYOTE_TIME_WINDOW = 0.11; // 110ms grace period after leaving ledge
const JUMP_BUFFER_WINDOW = 0.12; // 120ms input buffer before landing

interface RuntimeMovingPlatform {
  id: string;
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  width: number;
  height: number;
  speed: number;
  progress: number;
  dir: 1 | -1;
}

export class PlatformerEngine {
  private ctx: CanvasRenderingContext2D;
  private level: LevelDefinition;
  private tiles: number[][];
  private onHudUpdate: (snapshot: HudSnapshot) => void;
  private onLevelComplete: (score: number, coins: number) => void;
  private onGameOver: (score: number, coins: number) => void;
  private onPauseToggle: () => void;

  // Player state
  private px: number = 96;
  private py: number = 400;
  private pvx: number = 0;
  private pvy: number = 0;
  private pWidth: number = 24;
  private pHeight: number = 28;
  private pFacing: -1 | 1 = 1;
  private onGround: boolean = false;
  private powerState: PowerState = 'SMALL';
  private isInvincibleStar: boolean = false;
  private starTimer: number = 0;
  private invulnTimer: number = 0;
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;
  private jumpHoldTimer: number = 0;
  private isJumping: boolean = false;
  private isCrouching: boolean = false;
  private isRaccoonFlying: boolean = false;
  private tailSpinTimer: number = 0;
  private tailSpinCooldown: number = 0;
  private fireballCooldown: number = 0;

  // Game progression & counters
  private score: number = 0;
  private coins: number = 0;
  private lives: number = 3;
  private checkpointReached: boolean = false;
  private respawnPoint: { x: number; y: number };
  private cameraX: number = 0;
  private minCameraX: number = 0;
  private elapsedTime: number = 0;
  private isPaused: boolean = false;
  private isDead: boolean = false;
  private deathTimer: number = 0;
  private isLevelFinishing: boolean = false;
  private finishTimer: number = 0;

  // Per-level randomized power-up & star progression state
  private levelUpgradeMode: 'ALL_THREE' | 'ONLY_FIRE_FLOWER' | 'ONLY_FEATHER' = 'ALL_THREE';
  private nextVarietyUpgrade: 'FIRE_FLOWER' | 'FEATHER' = 'FIRE_FLOWER';
  private powerUpsSpawnedInLevel: number = 0;

  // Dynamic Entities
  private activeCoins: Map<string, { x: number; y: number; collected: boolean }> = new Map();
  private enemies: ActiveEnemy[] = [];
  private powerUps: ActivePowerUpItem[] = [];
  private fireballs: ActiveFireball[] = [];
  private movingPlatforms: RuntimeMovingPlatform[] = [];
  private bumpedTiles: BumpedTile[] = [];
  private crumblingBlocks: Array<{ col: number; row: number; state: 'SHAKING' | 'BROKEN'; timer: number }> = [];
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private boss: BossState;

  // Input state
  private keys: Record<string, boolean> = {};
  private jumpJustPressed: boolean = false;
  private fireJustPressed: boolean = false;
  private rafId: number | null = null;
  private lastFrameTime: number = 0;

  constructor(
    ctx: CanvasRenderingContext2D,
    level: LevelDefinition,
    initialScore: number,
    initialCoins: number,
    initialLives: number,
    initialPowerState: PowerState,
    callbacks: {
      onHudUpdate: (snapshot: HudSnapshot) => void;
      onLevelComplete: (score: number, coins: number) => void;
      onGameOver: (score: number, coins: number) => void;
      onPauseToggle: () => void;
    }
  ) {
    this.ctx = ctx;
    this.level = level;
    this.tiles = level.tiles.map((row) => [...row]);
    this.score = initialScore;
    this.coins = initialCoins;
    this.lives = initialLives;
    this.powerState = initialPowerState;
    this.onHudUpdate = callbacks.onHudUpdate;
    this.onLevelComplete = callbacks.onLevelComplete;
    this.onGameOver = callbacks.onGameOver;
    this.onPauseToggle = callbacks.onPauseToggle;

    this.respawnPoint = { ...level.playerStart };
    this.boss = this.createInitialBossState();

    this.initEntitiesFromLevel(true);
    this.bindKeyboardListeners();
  }

  private createInitialBossState(): BossState {
    const isWorld3Boss = this.level.worldId === 3 || this.level.id >= 11;
    const isWorld2Boss = !isWorld3Boss && (this.level.worldId === 2 || this.level.id >= 6);
    const bossHp = isWorld3Boss || isWorld2Boss ? 6 : 5;
    const bossName = isWorld3Boss
      ? 'Solkar, the Sand Titan'
      : isWorld2Boss
      ? 'Abyssal Warlord Krakenos'
      : 'Ironclad King Dredge';
    return {
      active: false,
      name: bossName,
      hp: bossHp,
      maxHp: bossHp,
      x: 112 * TILE_SIZE,
      y: 13 * TILE_SIZE,
      vx: 0,
      vy: 0,
      width: 64,
      height: 64,
      facing: -1,
      phase: 'IDLE',
      phaseTimer: 1.5,
      invulnerableTimer: 0,
      animFrame: 0,
      attackCounter: 0,
    };
  }

  private initEntitiesFromLevel(resetCoinsAndBlocks: boolean) {
    if (resetCoinsAndBlocks) {
      this.tiles = this.level.tiles.map((row) => [...row]);
      this.randomizeLevelPowerUpAndStarBlocks();
      this.activeCoins.clear();
      for (const c of this.level.coins) {
        this.activeCoins.set(c.id, { x: c.x, y: c.y, collected: false });
      }
    }

    this.updatePlayerDimensions();
    this.px = this.respawnPoint.x;
    this.py = this.respawnPoint.y - (this.pHeight - 28);
    this.pvx = 0;
    this.pvy = 0;
    this.onGround = false;
    this.isCrouching = false;
    this.isRaccoonFlying = false;
    this.tailSpinTimer = 0;
    this.tailSpinCooldown = 0;
    this.isDead = false;
    this.isLevelFinishing = false;
    this.isInvincibleStar = false;
    this.starTimer = 0;
    this.invulnTimer = 1.0;
    this.minCameraX = 0;
    this.cameraX = Math.max(0, this.px - 240);

    this.powerUps = [];
    this.fireballs = [];
    this.bumpedTiles = [];
    for (const cb of this.crumblingBlocks) {
      if (cb.state === 'BROKEN') {
        this.tiles[cb.row][cb.col] = TileType.CRUMBLE_BLOCK;
      }
    }
    this.crumblingBlocks = [];

    // Spawn Enemies
    this.enemies = this.level.enemies.map((e) => ({
      id: e.id,
      type: e.type,
      x: e.x,
      y: e.y + 4,
      startX: e.x,
      startY: e.y + 4,
      vx: e.type === 'KNIGHT' ? -80 : -65,
      vy: 0,
      width: 28,
      height: 28,
      state: 'PATROL',
      facing: -1,
      animTimer: 0,
      squishTimer: 0,
      patrolRange: e.patrolRange || 120,
      angle: 0,
    }));

    // Spawn Moving Platforms
    this.movingPlatforms = this.level.movingPlatforms.map((mp) => ({
      id: mp.id,
      x: mp.x,
      y: mp.y,
      prevX: mp.x,
      prevY: mp.y,
      startX: mp.x,
      startY: mp.y,
      endX: mp.endX,
      endY: mp.endY,
      width: mp.width,
      height: 16,
      speed: mp.speed,
      progress: 0,
      dir: 1,
    }));

    this.boss = this.createInitialBossState();
    this.emitHud();
  }

  private randomizeLevelPowerUpAndStarBlocks() {
    this.powerUpsSpawnedInLevel = 0;

    // 1. Randomly pick the upgrade behavior for this level when Pip is BIG/FIRE/RACCOON:
    // - 'ALL_THREE': gives both FIRE_FLOWER and FEATHER across consecutive upgrade blocks
    // - 'ONLY_FIRE_FLOWER': gives only FIRE_FLOWER when grown in this level
    // - 'ONLY_FEATHER': gives only FEATHER when grown in this level
    const modes: Array<'ALL_THREE' | 'ONLY_FIRE_FLOWER' | 'ONLY_FEATHER'> = [
      'ALL_THREE',
      'ONLY_FIRE_FLOWER',
      'ONLY_FEATHER',
    ];
    this.levelUpgradeMode = modes[Math.floor(Math.random() * modes.length)];
    this.nextVarietyUpgrade = Math.random() < 0.5 ? 'FIRE_FLOWER' : 'FEATHER';

    // 2. Collect all candidate power-up Question Blocks (QUESTION_MUSHROOM, QUESTION_FIRE, QUESTION_FEATHER)
    //    and enforce at least 3 full tiles (96px) of open headroom above every Question Block so a grown
    //    character (44px tall) can always jump and collect power-ups sitting on top of the block!
    const powerUpBlocks: Array<{ r: number; c: number }> = [];
    const starBlocks: Array<{ r: number; c: number }> = [];

    for (let r = 0; r < this.level.heightInTiles; r++) {
      for (let c = 0; c < this.level.widthInTiles; c++) {
        const t = this.tiles[r][c];
        const isQuestion =
          t === TileType.QUESTION_COIN ||
          t === TileType.QUESTION_MUSHROOM ||
          t === TileType.QUESTION_FIRE ||
          t === TileType.QUESTION_FEATHER ||
          t === TileType.QUESTION_STAR;

        if (isQuestion) {
          // Clear any solid ceiling/stalactite tiles within 3 rows directly above this Question Block
          for (let ur = Math.max(0, r - 3); ur < r; ur++) {
            for (let uc = Math.max(0, c - 1); uc <= Math.min(this.level.widthInTiles - 1, c + 1); uc++) {
              if (ur > 0 || r <= 3) {
                const aboveTile = this.tiles[ur][uc];
                if (
                  aboveTile === TileType.GROUND_DEEP ||
                  aboveTile === TileType.GROUND_TOP ||
                  aboveTile === TileType.SOLID_STONE
                ) {
                  this.tiles[ur][uc] = TileType.EMPTY;
                }
              }
            }
          }
        }

        if (
          t === TileType.QUESTION_MUSHROOM ||
          t === TileType.QUESTION_FIRE ||
          t === TileType.QUESTION_FEATHER
        ) {
          powerUpBlocks.push({ r, c });
        } else if (t === TileType.QUESTION_STAR) {
          starBlocks.push({ r, c });
        }
      }
    }

    // Sort left-to-right by column and enforce minimum spacing (>= 12 tiles apart)
    // so two adjacent or nearby blocks can NEVER both give power-ups.
    powerUpBlocks.sort((a, b) => a.c - b.c);
    const spacedPowerUpBlocks: Array<{ r: number; c: number }> = [];
    for (const blk of powerUpBlocks) {
      if (
        spacedPowerUpBlocks.length === 0 ||
        blk.c - spacedPowerUpBlocks[spacedPowerUpBlocks.length - 1].c >= 12
      ) {
        spacedPowerUpBlocks.push(blk);
      } else {
        this.tiles[blk.r][blk.c] = TileType.QUESTION_COIN;
      }
    }

    // Randomly decide how many power-up blocks appear in this level: 1, 2, or 3 (max 3).
    // Note: Always keep the earliest block active if quota >= 1 so a Small player can find a Mushroom early,
    // or shuffle among the spaced slots so any 1, 2, or all 3 slots are active.
    const maxSlots = Math.min(3, spacedPowerUpBlocks.length);
    const possibleQuotas = [1, 2, 3].filter((q) => q <= maxSlots);
    const powerUpQuota =
      possibleQuotas.length > 0
        ? possibleQuotas[Math.floor(Math.random() * possibleQuotas.length)]
        : maxSlots;

    // Shuffle indices to pick `powerUpQuota` active power-up blocks; convert unselected slots to QUESTION_COIN
    const slotIndices = spacedPowerUpBlocks.map((_, idx) => idx);
    for (let i = slotIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [slotIndices[i], slotIndices[j]] = [slotIndices[j], slotIndices[i]];
    }
    const activePowerUpSet = new Set(slotIndices.slice(0, powerUpQuota));
    spacedPowerUpBlocks.forEach((blk, idx) => {
      if (!activePowerUpSet.has(idx)) {
        this.tiles[blk.r][blk.c] = TileType.QUESTION_COIN;
      }
    });

    // 3. Randomly decide how many Invincible Stars appear in this level: 0, 1, or 2 Stars
    const starQuota = Math.min(starBlocks.length, Math.floor(Math.random() * 3)); // 0, 1, or 2
    const starIndices = starBlocks.map((_, idx) => idx);
    for (let i = starIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [starIndices[i], starIndices[j]] = [starIndices[j], starIndices[i]];
    }
    const activeStarSet = new Set(starIndices.slice(0, starQuota));
    starBlocks.forEach((blk, idx) => {
      if (!activeStarSet.has(idx)) {
        this.tiles[blk.r][blk.c] = TileType.QUESTION_COIN;
      }
    });
  }

  private updatePlayerDimensions() {
    const oldHeight = this.pHeight;
    if (this.powerState === 'SMALL') {
      this.pWidth = 24;
      this.pHeight = 28;
    } else if (this.isCrouching) {
      this.pWidth = 26;
      this.pHeight = 28;
    } else {
      this.pWidth = 26;
      this.pHeight = 44;
    }
    if (oldHeight !== this.pHeight) {
      this.py -= this.pHeight - oldHeight;
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    const code = e.code;
    if (
      code === 'ArrowUp' ||
      code === 'ArrowDown' ||
      code === 'ArrowLeft' ||
      code === 'ArrowRight' ||
      code === 'Space'
    ) {
      e.preventDefault();
    }

    if (code === 'Escape' || code === 'KeyP') {
      if (!e.repeat) {
        this.onPauseToggle();
      }
      return;
    }

    if (!this.keys[code]) {
      if (code === 'Space' || code === 'KeyW' || code === 'ArrowUp') {
        this.jumpJustPressed = true;
      }
      if (code === 'ShiftLeft' || code === 'ShiftRight' || code === 'KeyX' || code === 'KeyJ') {
        this.fireJustPressed = true;
      }
    }
    this.keys[code] = true;
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  private handleBlur = () => {
    this.keys = {};
    this.jumpJustPressed = false;
    this.fireJustPressed = false;
  };

  public setVirtualKey(code: string, pressed: boolean) {
    if (pressed) {
      if (!this.keys[code]) {
        if (code === 'Space' || code === 'KeyW' || code === 'ArrowUp') {
          this.jumpJustPressed = true;
        }
        if (code === 'ShiftLeft' || code === 'ShiftRight' || code === 'KeyX' || code === 'KeyJ') {
          this.fireJustPressed = true;
        }
      }
      this.keys[code] = true;
    } else {
      this.keys[code] = false;
    }
  }

  private bindKeyboardListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
  }

  public destroy() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
    this.keys = {};
    this.jumpJustPressed = false;
    this.fireJustPressed = false;
    this.lastFrameTime = performance.now();
  }

  public start() {
    this.lastFrameTime = performance.now();
    const loop = (now: number) => {
      const rawDt = (now - this.lastFrameTime) / 1000;
      this.lastFrameTime = now;
      const dt = Math.min(rawDt, 0.04); // Cap delta time to prevent tunneling on tab switch

      if (!this.isPaused) {
        this.update(dt);
      }
      this.render();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  private update(dt: number) {
    this.elapsedTime += dt;

    // Handle Death Animation Sequence
    if (this.isDead) {
      this.deathTimer -= dt;
      this.pvy += GRAVITY * 0.8 * dt;
      this.py += this.pvy * dt;
      this.updateParticles(dt);
      if (this.deathTimer <= 0) {
        if (this.lives > 0) {
          this.initEntitiesFromLevel(false);
          soundManager.playMusic(this.level.musicTrack);
        } else {
          this.isPaused = true;
          this.onGameOver(this.score, this.coins);
        }
      }
      return;
    }

    // Handle Level Completion Celebration Sequence
    if (this.isLevelFinishing) {
      this.finishTimer -= dt;
      this.updateParticles(dt);
      if (this.finishTimer <= 0) {
        this.isLevelFinishing = false;
        this.isPaused = true;
        this.onLevelComplete(this.score, this.coins);
      }
      return;
    }

    // Update Timers
    if (this.invulnTimer > 0) this.invulnTimer = Math.max(0, this.invulnTimer - dt);
    if (this.fireballCooldown > 0) this.fireballCooldown = Math.max(0, this.fireballCooldown - dt);
    if (this.tailSpinTimer > 0) this.tailSpinTimer = Math.max(0, this.tailSpinTimer - dt);
    if (this.tailSpinCooldown > 0) this.tailSpinCooldown = Math.max(0, this.tailSpinCooldown - dt);
    if (this.isInvincibleStar) {
      this.starTimer -= dt;
      if (this.starTimer <= 0) {
        this.isInvincibleStar = false;
        this.starTimer = 0;
        this.emitHud();
      }
    }

    // 1. Update Moving Platforms first so player can ride them smoothly
    this.updateMovingPlatforms(dt);

    // 2. Update Player Controls, Physics, and Solid Tile Collisions
    this.updatePlayer(dt);

    // 3. Update Bumped Tiles, Crumbling Blocks, Coins, Power-Ups, Fireballs, Enemies, and Boss
    this.updateBumpedTiles(dt);
    this.updateCrumblingBlocks(dt);
    this.updateCoins();
    this.updatePowerUps(dt);
    this.updateFireballs(dt);
    this.updateEnemies(dt);
    if (this.level.hasBoss) {
      this.updateBoss(dt);
    }
    this.updateParticles(dt);

    // 4. Check Checkpoint & Level Goal Flagpole
    this.checkCheckpointAndGoal();

    // 5. Update Smooth Scrolling Camera
    const targetCamX = this.px - CANVAS_WIDTH * 0.36;
    const maxCamX = this.level.widthInTiles * TILE_SIZE - CANVAS_WIDTH;
    this.cameraX += (targetCamX - this.cameraX) * Math.min(1, dt * 10);
    this.cameraX = Math.max(this.minCameraX, Math.min(maxCamX, this.cameraX));

    this.jumpJustPressed = false;
    this.fireJustPressed = false;
  }

  private updateMovingPlatforms(dt: number) {
    for (const mp of this.movingPlatforms) {
      mp.prevX = mp.x;
      mp.prevY = mp.y;

      const dx = mp.endX - mp.startX;
      const dy = mp.endY - mp.startY;
      const totalDist = Math.hypot(dx, dy) || 1;
      const step = (mp.speed * dt) / totalDist;

      mp.progress += step * mp.dir;
      if (mp.progress >= 1) {
        mp.progress = 1;
        mp.dir = -1;
      } else if (mp.progress <= 0) {
        mp.progress = 0;
        mp.dir = 1;
      }

      mp.x = mp.startX + dx * mp.progress;
      mp.y = mp.startY + dy * mp.progress;
    }
  }

  private updatePlayer(dt: number) {
    const rawMoveLeft = this.keys['ArrowLeft'] || this.keys['KeyA'];
    const rawMoveRight = this.keys['ArrowRight'] || this.keys['KeyD'];
    const downHeld = this.keys['ArrowDown'] || this.keys['KeyS'];
    const isRunning = this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.keys['KeyX'] || this.keys['KeyJ'];
    const jumpHeld = this.keys['Space'] || this.keys['KeyW'] || this.keys['ArrowUp'];

    // Classic Crouch / Sit Mechanic when character is grown (BIG, FIRE, or RACCOON):
    // Holding Down makes the grown character sit/crouch and disables Left/Right movement while held.
    const nextCrouching = this.powerState !== 'SMALL' && !!downHeld && (this.onGround || this.isCrouching);
    if (nextCrouching !== this.isCrouching) {
      this.isCrouching = nextCrouching;
      this.updatePlayerDimensions();
    }

    const moveLeft = this.isCrouching ? false : rawMoveLeft;
    const moveRight = this.isCrouching ? false : rawMoveRight;

    // Fireball shooting when in FIRE state
    if (this.fireJustPressed && this.powerState === 'FIRE' && this.fireballCooldown <= 0) {
      const activePlayerFireballs = this.fireballs.filter((f) => !f.isEnemyProjectile).length;
      if (activePlayerFireballs < 3) {
        this.fireballCooldown = 0.22;
        soundManager.playFireball();
        this.fireballs.push({
          id: `fb_${Date.now()}_${Math.random()}`,
          x: this.pFacing === 1 ? this.px + this.pWidth + 4 : this.px - 4,
          y: this.py + this.pHeight * 0.45,
          vx: this.pFacing * 440,
          vy: 160,
          radius: 6,
          bounces: 0,
          active: true,
        });
      }
    }

    // Raccoon Tail Spin Attack when in RACCOON state (triggered by Shift / X / J or On-Screen FIRE button)
    if (this.fireJustPressed && this.powerState === 'RACCOON' && this.tailSpinCooldown <= 0) {
      this.tailSpinTimer = 0.26;
      this.tailSpinCooldown = 0.28;
      soundManager.playTailSpin();
      this.spawnBurstParticles(
        this.pFacing === 1 ? this.px + this.pWidth + 8 : this.px - 8,
        this.py + (this.isCrouching ? 16 : 28),
        '#fef08a',
        5
      );
      this.performRaccoonTailBlockHit();
    }

    if (this.tailSpinTimer > 0 && this.powerState === 'RACCOON') {
      this.performRaccoonTailAttack();
    }

    const isUnderwater = Boolean(this.level.isUnderwater || this.level.theme === 'UNDERWATER');

    // Horizontal Acceleration & Friction (with smooth water resistance in underwater stages)
    const accel = (isRunning ? RUN_ACCEL : WALK_ACCEL) * (isUnderwater ? 0.72 : 1);
    const maxSpeed = isUnderwater
      ? isRunning
        ? 250
        : 185
      : isRunning
      ? MAX_RUN_SPEED
      : MAX_WALK_SPEED;
    const friction = this.onGround ? GROUND_FRICTION : AIR_FRICTION;

    if (moveLeft && !moveRight) {
      this.pFacing = -1;
      if (this.pvx > 0 && this.onGround) {
        // Quick turnaround skid traction
        this.pvx -= friction * 1.8 * dt;
      } else {
        this.pvx -= accel * dt;
      }
    } else if (moveRight && !moveLeft) {
      this.pFacing = 1;
      if (this.pvx < 0 && this.onGround) {
        this.pvx += friction * 1.8 * dt;
      } else {
        this.pvx += accel * dt;
      }
    } else {
      if (this.pvx > 0) {
        this.pvx = Math.max(0, this.pvx - friction * dt);
      } else if (this.pvx < 0) {
        this.pvx = Math.min(0, this.pvx + friction * dt);
      }
    }

    this.pvx = Math.max(-maxSpeed, Math.min(maxSpeed, this.pvx));

    if (isUnderwater) {
      // Classic Super Mario Bros. Underwater Swimming Physics:
      // Every press of Jump (or Up on mobile) executes an upward swimming stroke anywhere in the water!
      if (this.jumpJustPressed) {
        this.pvy = -255;
        this.onGround = false;
        this.jumpJustPressed = false;
        soundManager.playSwim();
        this.spawnBurstParticles(
          this.px + (this.pFacing === 1 ? 4 : this.pWidth - 4),
          this.py + this.pHeight * 0.5,
          '#bae6fd',
          3
        );
      }

      // Buoyant underwater gravity and gentle sinking speed
      const uwGravity = 480;
      const uwMaxSink = this.powerState === 'RACCOON' && jumpHeld ? 95 : 210;
      this.pvy = Math.min(uwMaxSink, this.pvy + uwGravity * dt);

      // Keep swimmer below the top water surface shimmer
      if (this.py < 24) {
        this.py = 24;
        if (this.pvy < 0) this.pvy = 0;
      }
    } else {
      // Coyote Time & Jump Buffering
      if (this.onGround) {
        this.coyoteTimer = COYOTE_TIME_WINDOW;
        this.isRaccoonFlying = false;
      } else {
        this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
      }

      if (this.jumpJustPressed) {
        this.jumpBufferTimer = JUMP_BUFFER_WINDOW;
      } else {
        this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
      }

      // Execute Jump if buffered and within Coyote window
      if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
        const isSprintTakeoff = isRunning || Math.abs(this.pvx) >= MAX_WALK_SPEED * 0.75;
        const speedBonus = Math.abs(this.pvx) > MAX_WALK_SPEED + 20 ? -35 : 0;
        this.pvy = JUMP_INITIAL_VEL + speedBonus;
        this.onGround = false;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.isJumping = true;
        this.jumpHoldTimer = MAX_JUMP_HOLD_TIME;
        if (this.powerState === 'RACCOON' && isSprintTakeoff) {
          this.isRaccoonFlying = true;
        }
        soundManager.playJump(this.powerState !== 'SMALL');
      }

      // Variable Jump Height while holding Jump button
      if (this.isJumping && jumpHeld && this.jumpHoldTimer > 0 && this.pvy < 0) {
        this.pvy += JUMP_HOLD_BOOST * dt;
        this.jumpHoldTimer -= dt;
      } else {
        this.isJumping = false;
        this.jumpHoldTimer = 0;
      }

      // Raccoon Tail Flight & Slow Falling:
      // 1. Flying: During a sprint run jump, keeping Jump pressed/clicked makes Pip fly upward.
      // 2. Slow Falling: When descending in mid-air, holding or tapping Jump wags the tail to descend slowly!
      if (this.powerState === 'RACCOON' && !this.onGround) {
        if (isRunning && Math.abs(this.pvx) >= MAX_WALK_SPEED * 0.75 && (jumpHeld || this.jumpJustPressed)) {
          this.isRaccoonFlying = true;
        }

        if (this.isRaccoonFlying && (jumpHeld || this.jumpJustPressed)) {
          this.pvy = -195;
          if (this.py < 36) {
            this.py = 36;
            this.pvy = 0;
          }
        } else if (this.pvy >= 0 && (jumpHeld || this.jumpJustPressed)) {
          // Ability 4: Slow Falling while holding or tapping Jump during descent
          if (this.jumpJustPressed) {
            this.pvy = Math.min(this.pvy, 75);
          }
          this.pvy = Math.min(95, this.pvy + GRAVITY * 0.3 * dt);
        } else {
          // Standard descent when Jump is not held
          this.pvy = Math.min(480, this.pvy + GRAVITY * dt);
        }
      } else {
        // Standard Gravity
        this.pvy = Math.min(MAX_FALL_SPEED, this.pvy + GRAVITY * dt);
      }
      // Quicksand Sinking & Escape Jump Mechanics (World 3 Desert)
      if (this.isPlayerInQuicksand()) {
        this.pvx *= 0.78;
        this.coyoteTimer = COYOTE_TIME_WINDOW;
        if (this.jumpJustPressed) {
          this.pvy = JUMP_INITIAL_VEL * 0.86;
          this.jumpJustPressed = false;
          this.jumpBufferTimer = 0;
          this.isJumping = true;
          this.jumpHoldTimer = MAX_JUMP_HOLD_TIME * 0.75;
          soundManager.playJump(this.powerState !== 'SMALL');
          this.spawnBurstParticles(this.px + this.pWidth * 0.5, this.py + this.pHeight, '#fbbf24', 5);
        } else if (this.pvy > -80) {
          // Slow steady sinking into quicksand
          this.pvy = 42;
        }
      }
    }

    // Desert Wind / Sandstorm Horizontal Gusts
    let windDeltaX = 0;
    if (this.level.windForce || this.level.hasSandstorm) {
      const baseWind = this.level.windForce ?? -55;
      const gustWave = Math.sin(this.elapsedTime * 1.1);
      const gustMult = gustWave > -0.25 ? 1.0 : 0.35;
      windDeltaX = baseWind * gustMult * dt;
    }

    // Horizontal Movement & Collision
    this.px += this.pvx * dt + windDeltaX;
    if (this.px < this.minCameraX) {
      this.px = this.minCameraX;
      this.pvx = 0;
    }
    const maxLevelX = this.level.widthInTiles * TILE_SIZE - this.pWidth;
    if (this.px > maxLevelX) {
      this.px = maxLevelX;
      this.pvx = 0;
    }
    this.resolveHorizontalTileCollisions();

    // Vertical Movement & Collision
    const prevBottom = this.py + this.pHeight;
    this.py += this.pvy * dt;
    this.onGround = false;
    this.resolveVerticalTileCollisions();
    this.resolveMovingPlatformCollisions(prevBottom);
    if (this.onGround) {
      this.isRaccoonFlying = false;
    }

    // Check Lethal Pits & Hazard Tiles
    if (this.py > CANVAS_HEIGHT + 24) {
      this.killPlayer();
      return;
    }
    this.checkHazardTiles();
  }

  private performRaccoonTailBlockHit() {
    // Check tiles immediately to the left and right at tail/waist height
    const waistRow = Math.floor((this.py + 28) / TILE_SIZE);
    const sideCols = [
      Math.floor((this.px - 14) / TILE_SIZE),
      Math.floor((this.px + this.pWidth + 14) / TILE_SIZE),
    ];

    for (const c of sideCols) {
      const tile = this.getTileAt(c, waistRow);
      if (
        tile === TileType.BRICK ||
        tile === TileType.QUESTION_COIN ||
        tile === TileType.QUESTION_MUSHROOM ||
        tile === TileType.QUESTION_FIRE ||
        tile === TileType.QUESTION_FEATHER ||
        tile === TileType.QUESTION_STAR
      ) {
        this.handleBlockHitFromBelow(c, waistRow, tile);
      }
    }
  }

  private performRaccoonTailAttack() {
    // 360° Tail Spin Hitbox around Pip's lower torso & tail reach (22px left and right)
    const hitX = this.px - 22;
    const hitY = this.py + 10;
    const hitW = this.pWidth + 44;
    const hitH = this.pHeight - 10;

    // 1. Defeat enemies within Tail Spin reach
    for (const enemy of this.enemies) {
      if (enemy.state === 'DEAD' || enemy.state === 'SQUISHED' || enemy.type === 'FIRE_BAR') continue;
      if (this.rectsOverlap(hitX, hitY, hitW, hitH, enemy.x, enemy.y, enemy.width, enemy.height)) {
        enemy.state = 'DEAD';
        soundManager.playStomp();
        this.addScore(200, enemy.x, enemy.y);
        this.spawnBurstParticles(enemy.x + 14, enemy.y + 14, '#fef08a', 12);
      }
    }

    // 2. Strike Boss if Boss is in VULNERABLE phase within tail reach
    if (
      this.boss.active &&
      this.boss.phase !== 'DEFEATED' &&
      this.boss.invulnerableTimer <= 0 &&
      this.rectsOverlap(hitX, hitY, hitW, hitH, this.boss.x, this.boss.y, this.boss.width, this.boss.height)
    ) {
      if (this.boss.phase === 'VULNERABLE') {
        this.px += this.px < this.boss.x ? -24 : 24;
        this.damageBoss();
      }
    }
  }

  private isSolidTile(t: TileType): boolean {
    return (
      t === TileType.GROUND_TOP ||
      t === TileType.GROUND_DEEP ||
      t === TileType.BRICK ||
      t === TileType.QUESTION_COIN ||
      t === TileType.QUESTION_MUSHROOM ||
      t === TileType.QUESTION_FIRE ||
      t === TileType.QUESTION_FEATHER ||
      t === TileType.QUESTION_STAR ||
      t === TileType.USED_BLOCK ||
      t === TileType.SOLID_STONE ||
      t === TileType.PIPE_TOP_L ||
      t === TileType.PIPE_TOP_R ||
      t === TileType.PIPE_BODY_L ||
      t === TileType.PIPE_BODY_R ||
      t === TileType.BRIDGE ||
      t === TileType.CRUMBLE_BLOCK ||
      t === TileType.SPIKE ||
      t === TileType.CACTUS
    );
  }

  private isHazardContactTile(t: TileType): boolean {
    return t === TileType.SPIKE || t === TileType.CACTUS;
  }

  private isPlayerInQuicksand(): boolean {
    const startCol = Math.floor((this.px + 4) / TILE_SIZE);
    const endCol = Math.floor((this.px + this.pWidth - 4) / TILE_SIZE);
    const startRow = Math.floor((this.py + 8) / TILE_SIZE);
    const endRow = Math.floor((this.py + this.pHeight) / TILE_SIZE);
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const t = this.getTileAt(c, r);
        if (t === TileType.QUICKSAND_TOP || t === TileType.QUICKSAND_DEEP) {
          return true;
        }
      }
    }
    return false;
  }

  private triggerCrumbleBlock(col: number, row: number) {
    const existing = this.crumblingBlocks.find((cb) => cb.col === col && cb.row === row);
    if (!existing) {
      this.crumblingBlocks.push({ col, row, state: 'SHAKING', timer: 0.42 });
    }
  }

  private updateCrumblingBlocks(dt: number) {
    for (const cb of this.crumblingBlocks) {
      cb.timer -= dt;
      if (cb.state === 'SHAKING') {
        if (cb.timer <= 0) {
          cb.state = 'BROKEN';
          cb.timer = 3.0;
          this.tiles[cb.row][cb.col] = TileType.EMPTY;
          soundManager.playBreakBlock();
          this.spawnBurstParticles(cb.col * TILE_SIZE + 16, cb.row * TILE_SIZE + 10, '#d97706', 8);
        }
      } else if (cb.state === 'BROKEN') {
        if (cb.timer <= 0) {
          this.tiles[cb.row][cb.col] = TileType.CRUMBLE_BLOCK;
        }
      }
    }
    this.crumblingBlocks = this.crumblingBlocks.filter(
      (cb) => !(cb.state === 'BROKEN' && cb.timer <= 0)
    );
  }

  private getTileAt(col: number, row: number): TileType {
    if (row < 0 || row >= this.level.heightInTiles || col < 0 || col >= this.level.widthInTiles) {
      return TileType.EMPTY;
    }
    return this.tiles[row][col];
  }

  private getTileOffsetY(col: number, row: number): number {
    const bumped = this.bumpedTiles.find((b) => b.tx === col && b.ty === row);
    return bumped ? bumped.offsetY : 0;
  }

  private getTileHitbox(
    col: number,
    row: number
  ): { x: number; y: number; width: number; height: number; tile: TileType; offsetY: number } | null {
    const tile = this.getTileAt(col, row);
    if (!this.isSolidTile(tile)) return null;
    const offsetY = this.getTileOffsetY(col, row);
    return {
      x: col * TILE_SIZE,
      y: row * TILE_SIZE + offsetY,
      width: TILE_SIZE,
      height: TILE_SIZE,
      tile,
      offsetY,
    };
  }

  private carryPowerUpsOnBumpedTile(col: number, row: number, newOffsetY: number) {
    if (!this.isSolidTile(this.getTileAt(col, row))) return;
    const brickLeft = col * TILE_SIZE;
    const brickRight = (col + 1) * TILE_SIZE;
    const bumpedTopY = row * TILE_SIZE + newOffsetY;
    const unbumpedTopY = row * TILE_SIZE;

    for (const item of this.powerUps) {
      if (item.collected) continue;
      const overlapsHoriz = item.x + item.width - 0.1 > brickLeft && item.x + 0.1 < brickRight;
      const itemBottom = item.y + item.height;
      if (overlapsHoriz && itemBottom > bumpedTopY && itemBottom <= unbumpedTopY + 2) {
        item.y = bumpedTopY - item.height;
        if (item.vy > 0) {
          item.vy = 0;
        }
      }
    }
  }

  private resolveHorizontalTileCollisions() {
    const startRow = Math.floor((this.py + 2) / TILE_SIZE);
    const endRow = Math.floor((this.py + this.pHeight - 2) / TILE_SIZE);
    let touchedSpike = false;

    if (this.pvx > 0) {
      const rightCol = Math.floor((this.px + this.pWidth) / TILE_SIZE);
      for (let r = startRow; r <= endRow; r++) {
        if (this.isHazardContactTile(this.getTileAt(rightCol, r))) {
          touchedSpike = true;
        }
      }
      for (let r = startRow; r <= endRow; r++) {
        const tile = this.getTileAt(rightCol, r);
        if (this.isSolidTile(tile) && tile !== TileType.BRIDGE && tile !== TileType.CRUMBLE_BLOCK) {
          this.px = rightCol * TILE_SIZE - this.pWidth - 0.01;
          this.pvx = 0;
          break;
        }
      }
    } else if (this.pvx < 0) {
      const leftCol = Math.floor(this.px / TILE_SIZE);
      for (let r = startRow; r <= endRow; r++) {
        if (this.isHazardContactTile(this.getTileAt(leftCol, r))) {
          touchedSpike = true;
        }
      }
      for (let r = startRow; r <= endRow; r++) {
        const tile = this.getTileAt(leftCol, r);
        if (this.isSolidTile(tile) && tile !== TileType.BRIDGE && tile !== TileType.CRUMBLE_BLOCK) {
          this.px = (leftCol + 1) * TILE_SIZE + 0.01;
          this.pvx = 0;
          break;
        }
      }
    }

    if (touchedSpike && !this.isInvincibleStar) {
      this.damagePlayer();
    }
  }

  private resolveVerticalTileCollisions() {
    const startCol = Math.floor((this.px + 3) / TILE_SIZE);
    const endCol = Math.floor((this.px + this.pWidth - 3) / TILE_SIZE);
    let touchedSpike = false;

    if (this.pvy > 0) {
      // Falling down
      const bottomRow = Math.floor((this.py + this.pHeight) / TILE_SIZE);
      for (let c = startCol; c <= endCol; c++) {
        if (this.isHazardContactTile(this.getTileAt(c, bottomRow))) {
          touchedSpike = true;
        }
      }
      for (let c = startCol; c <= endCol; c++) {
        const tile = this.getTileAt(c, bottomRow);
        if (this.isSolidTile(tile)) {
          // Bridge and Crumble Block are one-way from above
          if (
            (tile === TileType.BRIDGE || tile === TileType.CRUMBLE_BLOCK) &&
            this.py + this.pHeight - this.pvy * 0.02 > bottomRow * TILE_SIZE + 8
          ) {
            continue;
          }
          this.py = bottomRow * TILE_SIZE - this.pHeight;
          this.pvy = 0;
          this.onGround = true;
          this.isJumping = false;
          for (let cc = startCol; cc <= endCol; cc++) {
            if (this.getTileAt(cc, bottomRow) === TileType.CRUMBLE_BLOCK) {
              this.triggerCrumbleBlock(cc, bottomRow);
            }
          }
          break;
        }
      }
    } else if (this.pvy < 0) {
      // Jumping up into underside of blocks
      const topRow = Math.floor(this.py / TILE_SIZE);
      for (let c = startCol; c <= endCol; c++) {
        if (this.isHazardContactTile(this.getTileAt(c, topRow))) {
          touchedSpike = true;
        }
      }
      for (let c = startCol; c <= endCol; c++) {
        const tile = this.getTileAt(c, topRow);
        if (this.isSolidTile(tile) && tile !== TileType.BRIDGE && tile !== TileType.CRUMBLE_BLOCK) {
          this.py = (topRow + 1) * TILE_SIZE + 0.01;
          this.pvy = 40;
          this.isJumping = false;
          if (!this.isHazardContactTile(tile)) {
            this.handleBlockHitFromBelow(c, topRow, tile);
          }
          break;
        }
      }
    }

    if (touchedSpike && !this.isInvincibleStar) {
      this.damagePlayer();
    }
  }

  private resolveMovingPlatformCollisions(prevBottom: number) {
    for (const mp of this.movingPlatforms) {
      const horizOverlap = this.px + this.pWidth > mp.x + 2 && this.px < mp.x + mp.width - 2;
      if (horizOverlap && this.pvy >= 0) {
        const currBottom = this.py + this.pHeight;
        if (prevBottom <= mp.prevY + 10 && currBottom >= mp.y) {
          this.py = mp.y - this.pHeight;
          this.pvy = 0;
          this.onGround = true;
          this.isJumping = false;
          // Carry player horizontally with platform
          this.px += mp.x - mp.prevX;
          this.resolveHorizontalTileCollisions();
          break;
        }
      }
    }
  }

  private handleBlockHitFromBelow(col: number, row: number, tile: TileType) {
    const blockCenterX = col * TILE_SIZE + 16;
    const blockTopY = row * TILE_SIZE;

    // Trigger bump animation
    this.bumpedTiles = this.bumpedTiles.filter((b) => !(b.tx === col && b.ty === row));
    this.bumpedTiles.push({ tx: col, ty: row, offsetY: -8, timer: 0.14 });

    // Defeat any enemy standing right on top of this bumped block
    for (const enemy of this.enemies) {
      if (enemy.state === 'DEAD' || enemy.type === 'FIRE_BAR') continue;
      const exCenter = enemy.x + enemy.width / 2;
      const eyBottom = enemy.y + enemy.height;
      if (Math.abs(exCenter - blockCenterX) < 24 && Math.abs(eyBottom - blockTopY) < 12) {
        enemy.state = 'DEAD';
        this.addScore(200, enemy.x, enemy.y);
        this.spawnBurstParticles(enemy.x + 14, enemy.y + 14, '#fbbf24', 8);
        soundManager.playStomp();
      }
    }

    if (tile === TileType.BRICK) {
      if (this.powerState !== 'SMALL') {
        // Break brick block into particles!
        this.tiles[row][col] = TileType.EMPTY;
        soundManager.playBreakBlock();
        this.addScore(50, blockCenterX - 8, blockTopY);
        this.spawnBurstParticles(blockCenterX, blockTopY + 16, '#c2410c', 12);
      } else {
        soundManager.playBump();
      }
    }

    // Carry or push any power-up item standing on top of this bumped block upward with its surface
    this.carryPowerUpsOnBumpedTile(col, row, -8);

    if (tile === TileType.BRICK) {
      return;
    } else if (tile === TileType.QUESTION_COIN) {
      this.tiles[row][col] = TileType.USED_BLOCK;
      soundManager.playCoin();
      this.coins++;
      this.checkExtraLifeFromCoins();
      this.addScore(200, blockCenterX - 10, blockTopY - 16);
      this.spawnBurstParticles(blockCenterX, blockTopY - 8, '#fbbf24', 10);
      this.emitHud();
    } else if (tile === TileType.QUESTION_STAR) {
      this.tiles[row][col] = TileType.USED_BLOCK;
      soundManager.playPowerUpAppear();
      this.powerUps.push({
        id: `pu_star_${col}_${row}_${Date.now()}`,
        type: 'STAR',
        x: col * TILE_SIZE + 4,
        y: (row - 1) * TILE_SIZE + 8,
        vx: 95,
        vy: -260,
        width: 24,
        height: 24,
        spawnTimer: 0.25,
        collected: false,
      });
    } else if (
      tile === TileType.QUESTION_MUSHROOM ||
      tile === TileType.QUESTION_FIRE ||
      tile === TileType.QUESTION_FEATHER
    ) {
      this.tiles[row][col] = TileType.USED_BLOCK;

      // Enforce hard cap of at most 3 non-star power-ups per level
      if (this.powerUpsSpawnedInLevel >= 3) {
        soundManager.playCoin();
        this.coins++;
        this.checkExtraLifeFromCoins();
        this.addScore(200, blockCenterX - 10, blockTopY - 16);
        this.spawnBurstParticles(blockCenterX, blockTopY - 8, '#fbbf24', 10);
        this.emitHud();
        return;
      }

      this.powerUpsSpawnedInLevel++;
      soundManager.playPowerUpAppear();

      // Dynamic & State-Aware Power-Up Selection:
      // 1. Whenever the character is SMALL, a MUSHROOM is guaranteed to spawn!
      //    (If the player shrinks back to SMALL after taking a hit, or stays SMALL for the whole level,
      //     any power-up block they hit will definitely give a MUSHROOM.)
      // 2. When the character is already grown (BIG, FIRE, or RACCOON), MUSHROOM will NOT come.
      //    Instead, either FEATHER or FIRE_FLOWER spawns based on the level's randomized mode:
      //    - 'ONLY_FIRE_FLOWER': spawns FIRE_FLOWER
      //    - 'ONLY_FEATHER': spawns FEATHER
      //    - 'ALL_THREE': alternates between FIRE_FLOWER and FEATHER so all 3 power-ups appear once!
      let spawnType: 'MUSHROOM' | 'FIRE_FLOWER' | 'FEATHER' = 'MUSHROOM';
      if (this.powerState === 'SMALL') {
        spawnType = 'MUSHROOM';
      } else if (this.levelUpgradeMode === 'ONLY_FIRE_FLOWER') {
        spawnType = 'FIRE_FLOWER';
      } else if (this.levelUpgradeMode === 'ONLY_FEATHER') {
        spawnType = 'FEATHER';
      } else {
        // 'ALL_THREE' mode: if player is already FIRE, prefer FEATHER; if already RACCOON, prefer FIRE_FLOWER;
        // otherwise alternate using nextVarietyUpgrade so all three appear one time each.
        if (this.powerState === 'FIRE') {
          spawnType = 'FEATHER';
        } else if (this.powerState === 'RACCOON') {
          spawnType = 'FIRE_FLOWER';
        } else {
          spawnType = this.nextVarietyUpgrade;
          this.nextVarietyUpgrade =
            this.nextVarietyUpgrade === 'FIRE_FLOWER' ? 'FEATHER' : 'FIRE_FLOWER';
        }
      }

      this.powerUps.push({
        id: `pu_${col}_${row}_${Date.now()}`,
        type: spawnType,
        x: col * TILE_SIZE + 4,
        y: (row - 1) * TILE_SIZE + 8,
        vx: spawnType === 'FIRE_FLOWER' ? 0 : spawnType === 'FEATHER' ? 55 : 95,
        vy: spawnType === 'FEATHER' ? -140 : 0,
        width: 24,
        height: 24,
        spawnTimer: 0.25,
        collected: false,
      });
    } else {
      soundManager.playBump();
    }
  }

  private checkHazardTiles() {
    // Check inner bounds for lava or deep quicksand submersion
    const lavaStartCol = Math.floor((this.px + 4) / TILE_SIZE);
    const lavaEndCol = Math.floor((this.px + this.pWidth - 4) / TILE_SIZE);
    const lavaStartRow = Math.floor((this.py + 4) / TILE_SIZE);
    const lavaEndRow = Math.floor((this.py + this.pHeight - 2) / TILE_SIZE);

    for (let r = lavaStartRow; r <= lavaEndRow; r++) {
      for (let c = lavaStartCol; c <= lavaEndCol; c++) {
        const tile = this.getTileAt(c, r);
        if (tile === TileType.LAVA_TOP || tile === TileType.LAVA_DEEP) {
          this.killPlayer();
          return;
        }
        if (tile === TileType.QUICKSAND_DEEP && this.py + this.pHeight > r * TILE_SIZE + 22) {
          this.killPlayer();
          return;
        }
      }
    }

    // Since SPIKE and CACTUS are solid tiles, check a 1px contact margin around the player so standing
    // on top of or pressing against a spike/cactus continues to apply damage once invuln expires
    const spikeStartCol = Math.floor((this.px - 1) / TILE_SIZE);
    const spikeEndCol = Math.floor((this.px + this.pWidth + 1) / TILE_SIZE);
    const spikeStartRow = Math.floor((this.py - 1) / TILE_SIZE);
    const spikeEndRow = Math.floor((this.py + this.pHeight + 1) / TILE_SIZE);

    for (let r = spikeStartRow; r <= spikeEndRow; r++) {
      for (let c = spikeStartCol; c <= spikeEndCol; c++) {
        if (this.isHazardContactTile(this.getTileAt(c, r))) {
          if (!this.isInvincibleStar) {
            this.damagePlayer();
          }
          return;
        }
      }
    }
  }

  private updateBumpedTiles(dt: number) {
    for (const b of this.bumpedTiles) {
      const prevOffsetY = b.offsetY;
      b.timer -= dt;
      b.offsetY = b.timer > 0.07 ? -8 : -4;
      if (b.offsetY < prevOffsetY) {
        this.carryPowerUpsOnBumpedTile(b.tx, b.ty, b.offsetY);
      }
    }
    this.bumpedTiles = this.bumpedTiles.filter((b) => b.timer > 0);
  }

  private updateCoins() {
    for (const coin of this.activeCoins.values()) {
      if (coin.collected) continue;
      if (this.rectsOverlap(this.px, this.py, this.pWidth, this.pHeight, coin.x, coin.y, 16, 16)) {
        coin.collected = true;
        this.coins++;
        this.checkExtraLifeFromCoins();
        soundManager.playCoin();
        this.addScore(100, coin.x, coin.y);
        this.spawnBurstParticles(coin.x + 8, coin.y + 8, '#fde047', 6);
        this.emitHud();
      }
    }
  }

  private checkExtraLifeFromCoins() {
    if (this.coins >= 100) {
      this.coins -= 100;
      this.lives++;
      soundManager.playPowerUpCollect();
      this.floatingTexts.push({
        x: this.px,
        y: this.py - 16,
        text: '1UP!',
        color: '#4ade80',
        life: 1.1,
      });
    }
  }

  private updatePowerUps(dt: number) {
    for (const item of this.powerUps) {
      if (item.collected) continue;

      if (item.spawnTimer > 0) {
        item.spawnTimer -= dt;
        continue;
      }

      if (item.type !== 'FIRE_FLOWER') {
        const gravMult = item.type === 'FEATHER' ? 0.28 : 0.85;
        const maxFall = item.type === 'FEATHER' ? 110 : MAX_FALL_SPEED;
        const prevX = item.x;
        const prevY = item.y;
        const prevBottom = prevY + item.height;

        item.vy = Math.min(maxFall, item.vy + GRAVITY * gravMult * dt);
        item.x += item.vx * dt;

        // Horizontal collision with solid tiles (accounting for bumped tile offsets)
        const hStartCol = Math.floor(item.x / TILE_SIZE);
        const hEndCol = Math.floor((item.x + item.width - 0.001) / TILE_SIZE);
        const hStartRow = Math.floor(prevY / TILE_SIZE);
        const hEndRow = Math.floor((prevY + item.height - 0.001) / TILE_SIZE) + 1;

        for (let r = hStartRow; r <= hEndRow; r++) {
          let hitWall = false;
          for (let c = hStartCol; c <= hEndCol; c++) {
            const hb = this.getTileHitbox(c, r);
            if (!hb || hb.tile === TileType.BRIDGE) continue;

            const overlapsX = item.x < hb.x + hb.width && item.x + item.width > hb.x;
            const overlapsY = prevY + 1 < hb.y + hb.height && prevY + item.height - 1 > hb.y;
            if (overlapsX && overlapsY) {
              if (item.vx > 0 && prevX + item.width <= hb.x + 4) {
                item.x = hb.x - item.width - 0.01;
                item.vx = -item.vx;
                hitWall = true;
                break;
              } else if (item.vx < 0 && prevX >= hb.x + hb.width - 4) {
                item.x = hb.x + hb.width + 0.01;
                item.vx = -item.vx;
                hitWall = true;
                break;
              }
            }
          }
          if (hitWall) break;
        }

        // Vertical floor/ceiling collision (accounting for bumped tile offsets)
        item.y += item.vy * dt;
        const vStartCol = Math.floor((item.x + 0.1) / TILE_SIZE);
        const vEndCol = Math.floor((item.x + item.width - 0.1) / TILE_SIZE);
        const vStartRow = Math.floor(item.y / TILE_SIZE);
        const vEndRow = Math.floor((item.y + item.height) / TILE_SIZE) + 1;

        if (item.vy >= 0) {
          let highestFloorY: number | null = null;
          for (let r = vStartRow; r <= vEndRow; r++) {
            for (let c = vStartCol; c <= vEndCol; c++) {
              const hb = this.getTileHitbox(c, r);
              if (!hb) continue;
              if (item.y + item.height >= hb.y && item.y < hb.y + hb.height && prevBottom <= hb.y + 8) {
                if (highestFloorY === null || hb.y < highestFloorY) {
                  highestFloorY = hb.y;
                }
              }
            }
          }
          if (highestFloorY !== null) {
            item.y = highestFloorY - item.height;
            if (item.type === 'STAR') {
              item.vy = -340; // Star bounces!
            } else {
              item.vy = 0;
            }
          }
        } else {
          for (let r = vStartRow; r <= vEndRow; r++) {
            let hitCeiling = false;
            for (let c = vStartCol; c <= vEndCol; c++) {
              const hb = this.getTileHitbox(c, r);
              if (!hb || hb.tile === TileType.BRIDGE) continue;
              if (item.y < hb.y + hb.height && item.y + item.height > hb.y && prevY >= hb.y + hb.height - 8) {
                item.y = hb.y + hb.height + 0.01;
                item.vy = 0;
                hitCeiling = true;
                break;
              }
            }
            if (hitCeiling) break;
          }
        }
      }

      // Check player collection
      if (this.rectsOverlap(this.px, this.py, this.pWidth, this.pHeight, item.x, item.y, item.width, item.height)) {
        item.collected = true;
        soundManager.playPowerUpCollect();
        this.addScore(1000, item.x, item.y);
        this.spawnBurstParticles(item.x + 12, item.y + 12, '#fde047', 14);

        if (item.type === 'MUSHROOM') {
          if (this.powerState === 'SMALL') {
            this.powerState = 'BIG';
            this.updatePlayerDimensions();
          }
        } else if (item.type === 'FIRE_FLOWER') {
          this.powerState = 'FIRE';
          this.updatePlayerDimensions();
        } else if (item.type === 'FEATHER') {
          this.powerState = 'RACCOON';
          this.updatePlayerDimensions();
        } else if (item.type === 'STAR') {
          this.isInvincibleStar = true;
          this.starTimer = 10.0;
        }
        this.emitHud();
      }
    }
    this.powerUps = this.powerUps.filter((p) => !p.collected && p.y < CANVAS_HEIGHT + 64);
  }

  private updateFireballs(dt: number) {
    for (const fb of this.fireballs) {
      if (!fb.active) continue;

      fb.x += fb.vx * dt;
      if (!fb.isEnemyProjectile) {
        fb.vy += GRAVITY * 0.75 * dt;
      }
      fb.y += fb.vy * dt;

      const col = Math.floor(fb.x / TILE_SIZE);
      const row = Math.floor((fb.y + fb.radius) / TILE_SIZE);

      if (!fb.isEnemyProjectile) {
        // Bounce on floor
        if (this.isSolidTile(this.getTileAt(col, row))) {
          fb.y = row * TILE_SIZE - fb.radius;
          fb.vy = -260;
          fb.bounces++;
        }
        // Hit wall
        const sideCol = Math.floor((fb.x + (fb.vx > 0 ? fb.radius : -fb.radius)) / TILE_SIZE);
        const midRow = Math.floor(fb.y / TILE_SIZE);
        if (this.isSolidTile(this.getTileAt(sideCol, midRow)) && this.getTileAt(sideCol, midRow) !== TileType.BRIDGE) {
          fb.active = false;
          this.spawnBurstParticles(fb.x, fb.y, '#f97316', 6);
          continue;
        }

        // Hit enemies
        for (const enemy of this.enemies) {
          if (enemy.state === 'DEAD' || enemy.state === 'SQUISHED' || enemy.type === 'FIRE_BAR') continue;
          if (
            this.rectsOverlap(
              fb.x - fb.radius,
              fb.y - fb.radius,
              fb.radius * 2,
              fb.radius * 2,
              enemy.x,
              enemy.y,
              enemy.width,
              enemy.height
            )
          ) {
            fb.active = false;
            enemy.state = 'DEAD';
            soundManager.playStomp();
            this.addScore(200, enemy.x, enemy.y);
            this.spawnBurstParticles(enemy.x + 14, enemy.y + 14, '#f97316', 10);
            break;
          }
        }

        // Hit Boss
        if (
          this.boss.active &&
          this.boss.phase !== 'DEFEATED' &&
          this.boss.invulnerableTimer <= 0 &&
          this.rectsOverlap(
            fb.x - fb.radius,
            fb.y - fb.radius,
            fb.radius * 2,
            fb.radius * 2,
            this.boss.x,
            this.boss.y,
            this.boss.width,
            this.boss.height
          )
        ) {
          fb.active = false;
          this.spawnBurstParticles(fb.x, fb.y, '#fbbf24', 8);
          if (this.boss.phase === 'VULNERABLE') {
            this.damageBoss();
          } else {
            soundManager.playBump();
          }
        }
      } else {
        // Boss projectile hitting player
        if (
          this.rectsOverlap(
            fb.x - fb.radius,
            fb.y - fb.radius,
            fb.radius * 2,
            fb.radius * 2,
            this.px,
            this.py,
            this.pWidth,
            this.pHeight
          )
        ) {
          fb.active = false;
          if (!this.isInvincibleStar) {
            this.damagePlayer();
          }
        }
      }

      if (fb.bounces > 4 || Math.abs(fb.x - this.px) > CANVAS_WIDTH) {
        fb.active = false;
      }
    }
    this.fireballs = this.fireballs.filter((f) => f.active);
  }

  private updateEnemies(dt: number) {
    for (const enemy of this.enemies) {
      if (enemy.state === 'DEAD') continue;

      if (enemy.state === 'SQUISHED') {
        enemy.squishTimer -= dt;
        if (enemy.squishTimer <= 0) {
          enemy.state = 'DEAD';
        }
        continue;
      }

      // Only activate enemies within reasonable distance of camera
      if (Math.abs(enemy.x - this.px) > CANVAS_WIDTH * 1.1) continue;

      if (enemy.type === 'FIRE_BAR') {
        enemy.angle = (enemy.angle || 0) + 2.1 * dt;
        // Check collision with rotating fire bar segments
        if (!this.isInvincibleStar) {
          for (let i = 1; i < 5; i++) {
            const dist = i * 18;
            const fx = enemy.x + Math.cos(enemy.angle) * dist - 6;
            const fy = enemy.y + Math.sin(enemy.angle) * dist - 6;
            if (this.rectsOverlap(this.px, this.py, this.pWidth, this.pHeight, fx, fy, 12, 12)) {
              this.damagePlayer();
              break;
            }
          }
        }
        continue;
      }

      if (enemy.type === 'BAT') {
        enemy.x += enemy.vx * dt;
        enemy.y = enemy.startY + Math.sin(this.elapsedTime * 4 + enemy.startX) * 28;
        if (Math.abs(enemy.x - enemy.startX) > enemy.patrolRange) {
          enemy.vx = -enemy.vx;
          enemy.facing = enemy.vx > 0 ? 1 : -1;
        }
      } else {
        // Ground patrolling enemy (SLIME, BEETLE, KNIGHT)
        if (enemy.state === 'SHELL_IDLE') {
          enemy.vx = 0;
        }
        enemy.vy = Math.min(MAX_FALL_SPEED, enemy.vy + GRAVITY * dt);
        enemy.x += enemy.vx * dt;

        // Wall, Spike, or Ledge turnaround (reflect back cleanly like hitting a wall)
        const movingRight = enemy.vx > 0;
        const sideCol = movingRight
          ? Math.floor((enemy.x + enemy.width) / TILE_SIZE)
          : Math.floor(enemy.x / TILE_SIZE);
        const midRow = Math.floor((enemy.y + enemy.height / 2) / TILE_SIZE);
        const belowRow = Math.floor((enemy.y + enemy.height + 4) / TILE_SIZE);

        const sideTile = this.getTileAt(sideCol, midRow);
        const belowTile = this.getTileAt(sideCol, belowRow);
        const hitWall =
          this.isSolidTile(sideTile) &&
          sideTile !== TileType.BRIDGE &&
          sideTile !== TileType.CRUMBLE_BLOCK;
        const atLedge =
          enemy.state === 'PATROL' &&
          (!this.isSolidTile(belowTile) || this.isHazardContactTile(belowTile));

        if (hitWall || atLedge) {
          if (hitWall) {
            enemy.x = movingRight
              ? sideCol * TILE_SIZE - enemy.width - 0.5
              : (sideCol + 1) * TILE_SIZE + 0.5;
          }
          enemy.vx = -enemy.vx;
          enemy.facing = enemy.vx > 0 ? 1 : -1;
          if (!hitWall) {
            enemy.x += enemy.vx * dt * 2;
          }
        }

        // Floor collision
        enemy.y += enemy.vy * dt;
        const bottomRow = Math.floor((enemy.y + enemy.height) / TILE_SIZE);
        const c1 = Math.floor((enemy.x + 4) / TILE_SIZE);
        const c2 = Math.floor((enemy.x + enemy.width - 4) / TILE_SIZE);
        if (this.isSolidTile(this.getTileAt(c1, bottomRow)) || this.isSolidTile(this.getTileAt(c2, bottomRow))) {
          enemy.y = bottomRow * TILE_SIZE - enemy.height;
          enemy.vy = 0;
        }

        // Moving beetle shell bowling into other enemies!
        if (enemy.state === 'SHELL_MOVING') {
          for (const other of this.enemies) {
            if (other === enemy || other.state === 'DEAD' || other.type === 'FIRE_BAR') continue;
            if (
              this.rectsOverlap(
                enemy.x,
                enemy.y,
                enemy.width,
                enemy.height,
                other.x,
                other.y,
                other.width,
                other.height
              )
            ) {
              other.state = 'DEAD';
              soundManager.playStomp();
              this.addScore(200, other.x, other.y);
              this.spawnBurstParticles(other.x + 14, other.y + 14, '#38bdf8', 8);
            }
          }
        }
      }

      // Check Player vs Enemy Interaction
      if (
        this.rectsOverlap(
          this.px,
          this.py,
          this.pWidth,
          this.pHeight,
          enemy.x,
          enemy.y,
          enemy.width,
          enemy.height
        )
      ) {
        if (this.isInvincibleStar || (this.powerState === 'RACCOON' && this.tailSpinTimer > 0)) {
          enemy.state = 'DEAD';
          soundManager.playStomp();
          this.addScore(200, enemy.x, enemy.y);
          this.spawnBurstParticles(enemy.x + 14, enemy.y + 14, '#fde047', 10);
          continue;
        }

        const playerBottom = this.py + this.pHeight;
        const enemyCenterY = enemy.y + enemy.height * 0.55;
        const isStomp = this.pvy > 0 && playerBottom - this.pvy * dt <= enemyCenterY + 8;

        if (isStomp) {
          // Bounce player upward
          this.pvy = -370;
          this.isJumping = true;
          this.jumpHoldTimer = 0.14;
          soundManager.playStomp();

          if (enemy.type === 'BEETLE') {
            if (enemy.state === 'PATROL' || enemy.state === 'SHELL_MOVING') {
              enemy.state = 'SHELL_IDLE';
              enemy.vx = 0;
              this.addScore(100, enemy.x, enemy.y);
            } else if (enemy.state === 'SHELL_IDLE') {
              enemy.state = 'SHELL_MOVING';
              enemy.vx = this.px + this.pWidth / 2 < enemy.x + enemy.width / 2 ? 320 : -320;
              this.addScore(200, enemy.x, enemy.y);
            }
          } else {
            enemy.state = 'SQUISHED';
            enemy.squishTimer = 0.45;
            this.addScore(150, enemy.x, enemy.y);
            this.spawnBurstParticles(enemy.x + 14, enemy.y + 14, '#fb7185', 8);
          }
        } else if (enemy.state === 'SHELL_IDLE') {
          // Kick idle shell from side without taking damage
          enemy.state = 'SHELL_MOVING';
          enemy.vx = this.px < enemy.x ? 320 : -320;
          this.px += this.px < enemy.x ? -6 : 6;
          soundManager.playStomp();
          this.addScore(100, enemy.x, enemy.y);
        } else {
          this.damagePlayer();
        }
      }
    }
  }

  private updateBoss(dt: number) {
    const arenaStart = this.level.bossArenaStartX || 90 * TILE_SIZE;

    // Activate boss and lock arena camera when player enters Castle Throne Room
    if (!this.boss.active && this.px >= arenaStart) {
      this.boss.active = true;
      this.minCameraX = arenaStart - 32;
      this.emitHud();
    }

    if (!this.boss.active || this.boss.phase === 'DEFEATED') return;

    if (this.boss.invulnerableTimer > 0) {
      this.boss.invulnerableTimer = Math.max(0, this.boss.invulnerableTimer - dt);
    }

    this.boss.phaseTimer -= dt;
    this.boss.facing = this.px < this.boss.x ? -1 : 1;

    // Boss State Machine with 4 Clear Patterns + Vulnerable Window
    if (this.boss.phase === 'IDLE') {
      this.boss.vx = 0;
      if (this.boss.phaseTimer <= 0) {
        const nextPattern = this.boss.attackCounter % 3;
        this.boss.attackCounter++;
        if (nextPattern === 0) {
          this.boss.phase = 'FIRE_BREATH';
          this.boss.phaseTimer = 1.4;
          this.spawnBossFireVolley();
        } else if (nextPattern === 1) {
          this.boss.phase = 'CHARGE';
          this.boss.phaseTimer = 1.6;
          this.boss.vx = this.boss.facing * 240;
        } else {
          this.boss.phase = 'JUMP_SLAM';
          this.boss.phaseTimer = 1.4;
          this.boss.vy = -560;
          this.boss.vx = this.boss.facing * 170;
          soundManager.playJump(true);
        }
        this.emitHud();
      }
    } else if (this.boss.phase === 'FIRE_BREATH') {
      this.boss.vx = 0;
      if (this.boss.phaseTimer <= 0) {
        this.boss.phase = 'VULNERABLE';
        this.boss.phaseTimer = 2.8;
        this.emitHud();
      }
    } else if (this.boss.phase === 'CHARGE') {
      if (this.boss.phaseTimer <= 0) {
        this.boss.vx = 0;
        this.boss.phase = 'VULNERABLE';
        this.boss.phaseTimer = 2.8;
        this.emitHud();
      }
    } else if (this.boss.phase === 'JUMP_SLAM') {
      if (this.boss.onGroundCheck && this.boss.phaseTimer < 0.9) {
        this.boss.vx = 0;
        this.boss.phase = 'VULNERABLE';
        this.boss.phaseTimer = 3.0;
        this.emitHud();
      }
    } else if (this.boss.phase === 'VULNERABLE') {
      this.boss.vx = 0;
      if (this.boss.phaseTimer <= 0) {
        this.boss.phase = 'IDLE';
        this.boss.phaseTimer = 1.0;
        this.emitHud();
      }
    }

    // Apply Boss Physics & Arena Bounds
    this.boss.vy = Math.min(MAX_FALL_SPEED, this.boss.vy + GRAVITY * dt);
    this.boss.x += this.boss.vx * dt;
    this.boss.y += this.boss.vy * dt;

    const minArenaX = arenaStart + 16;
    const maxArenaX = 124 * TILE_SIZE - this.boss.width;
    if (this.boss.x < minArenaX) {
      this.boss.x = minArenaX;
      this.boss.vx = -this.boss.vx;
    } else if (this.boss.x > maxArenaX) {
      this.boss.x = maxArenaX;
      this.boss.vx = -this.boss.vx;
    }

    const groundY = 16 * TILE_SIZE - this.boss.height;
    if (this.boss.y >= groundY) {
      if (this.boss.vy > 200) {
        soundManager.playBump();
        this.spawnBurstParticles(this.boss.x + 32, groundY + 60, '#fb923c', 12);
      }
      this.boss.y = groundY;
      this.boss.vy = 0;
      (this.boss as BossState & { onGroundCheck?: boolean }).onGroundCheck = true;
    } else {
      (this.boss as BossState & { onGroundCheck?: boolean }).onGroundCheck = false;
    }

    // Player vs Boss Collision
    if (
      this.rectsOverlap(
        this.px,
        this.py,
        this.pWidth,
        this.pHeight,
        this.boss.x,
        this.boss.y,
        this.boss.width,
        this.boss.height
      )
    ) {
      const playerBottom = this.py + this.pHeight;
      const isStompingHead = this.pvy > 0 && playerBottom - this.pvy * dt <= this.boss.y + 26;

      if (isStompingHead && this.boss.invulnerableTimer <= 0) {
        this.pvy = -440;
        this.px += this.px < this.boss.x ? -24 : 24;
        this.damageBoss();
      } else if (this.boss.invulnerableTimer <= 0 && !this.isInvincibleStar) {
        this.damagePlayer();
      }
    }
  }

  private spawnBossFireVolley() {
    soundManager.playFireball();
    const dir = this.boss.facing;
    const startX = dir === -1 ? this.boss.x - 8 : this.boss.x + this.boss.width + 8;
    const startY = this.boss.y + 22;

    const speedsY = [-60, 20, 95];
    for (const vy of speedsY) {
      this.fireballs.push({
        id: `boss_fb_${Date.now()}_${Math.random()}`,
        x: startX,
        y: startY,
        vx: dir * 270,
        vy,
        radius: 8,
        bounces: 0,
        isEnemyProjectile: true,
        active: true,
      });
    }
  }

  private damageBoss() {
    this.boss.hp = Math.max(0, this.boss.hp - 1);
    this.boss.invulnerableTimer = 1.2;
    this.addScore(1000, this.boss.x + 16, this.boss.y);
    this.spawnBurstParticles(this.boss.x + 32, this.boss.y + 24, '#fbbf24', 18);

    if (this.boss.hp <= 0) {
      this.boss.phase = 'DEFEATED';
      soundManager.stopMusic();
      soundManager.playBossDefeat();
      this.addScore(5000, this.boss.x, this.boss.y - 20);
      this.spawnBurstParticles(this.boss.x + 32, this.boss.y + 32, '#ef4444', 35);
      this.isLevelFinishing = true;
      this.finishTimer = 2.2;
    } else {
      soundManager.playBossHit();
      this.boss.phase = 'IDLE';
      this.boss.phaseTimer = 0.9;
    }
    this.emitHud();
  }

  private checkCheckpointAndGoal() {
    // Checkpoint Flag
    if (this.level.checkpoint && !this.checkpointReached) {
      const cp = this.level.checkpoint;
      if (this.rectsOverlap(this.px, this.py, this.pWidth, this.pHeight, cp.x, cp.y, 32, 64)) {
        this.checkpointReached = true;
        this.respawnPoint = { x: cp.x, y: cp.y };
        soundManager.playCheckpoint();
        this.addScore(500, cp.x, cp.y);
        this.floatingTexts.push({
          x: cp.x - 16,
          y: cp.y - 12,
          text: 'CHECKPOINT!',
          color: '#34d399',
          life: 1.2,
        });
        this.emitHud();
      }
    }

    // Level Goal Flagpole (If level has a boss, boss must be defeated first!)
    if (!this.level.hasBoss || this.boss.phase === 'DEFEATED') {
      const gx = this.level.goalX;
      const gy = this.level.goalY;
      if (this.rectsOverlap(this.px, this.py, this.pWidth, this.pHeight, gx, gy, 32, 10 * 32)) {
        this.isLevelFinishing = true;
        this.finishTimer = 1.8;
        this.pvx = 0;
        this.pvy = 0;
        soundManager.stopMusic();
        soundManager.playLevelClear();
        this.addScore(2000, gx, this.py);
        this.spawnBurstParticles(gx + 16, this.py, '#fde047', 28);
      }
    }
  }

  private damagePlayer() {
    if (this.invulnTimer > 0 || this.isInvincibleStar || this.isDead) return;

    if (this.powerState === 'FIRE' || this.powerState === 'RACCOON') {
      this.powerState = 'BIG';
      this.isRaccoonFlying = false;
      this.invulnTimer = 1.8;
      soundManager.playDamage();
      this.spawnBurstParticles(this.px + 12, this.py + 20, '#f97316', 12);
      this.emitHud();
    } else if (this.powerState === 'BIG') {
      this.powerState = 'SMALL';
      this.isCrouching = false;
      this.isRaccoonFlying = false;
      this.updatePlayerDimensions();
      this.invulnTimer = 1.8;
      soundManager.playDamage();
      this.spawnBurstParticles(this.px + 12, this.py + 14, '#10b981', 12);
      this.emitHud();
    } else {
      this.killPlayer();
    }
  }

  private killPlayer() {
    if (this.isDead) return;
    this.isDead = true;
    this.deathTimer = 1.6;
    this.lives = Math.max(0, this.lives - 1);
    this.powerState = 'SMALL';
    this.pvx = 0;
    this.pvy = -440;
    soundManager.stopMusic();
    soundManager.playDeath();
    this.spawnBurstParticles(this.px + 12, this.py + 12, '#ef4444', 18);
    this.emitHud();
  }

  private addScore(points: number, x: number, y: number) {
    this.score += points;
    this.floatingTexts.push({
      x,
      y,
      text: `+${points}`,
      color: '#fef08a',
      life: 0.85,
    });
    this.emitHud();
  }

  private spawnBurstParticles(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const speed = 60 + Math.random() * 160;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 80,
        color,
        size: 5,
        life: 0.45 + Math.random() * 0.25,
        maxLife: 0.7,
        gravity: true,
      });
    }
  }

  private updateParticles(dt: number) {
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      if (p.gravity) p.vy += 600 * dt;
      p.y += p.vy * dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);

    for (const ft of this.floatingTexts) {
      ft.life -= dt;
      ft.y -= 38 * dt;
    }
    this.floatingTexts = this.floatingTexts.filter((ft) => ft.life > 0);
  }

  private rectsOverlap(
    x1: number,
    y1: number,
    w1: number,
    h1: number,
    x2: number,
    y2: number,
    w2: number,
    h2: number
  ): boolean {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  private emitHud() {
    this.onHudUpdate({
      score: this.score,
      coins: this.coins,
      lives: this.lives,
      levelId: this.level.id,
      levelName: this.level.name,
      powerState: this.powerState,
      isInvincibleStar: this.isInvincibleStar,
      starTimeRemaining: Math.ceil(this.starTimer),
      checkpointReached: this.checkpointReached,
      boss: this.boss.active
        ? {
            active: this.boss.active,
            name: this.boss.name,
            hp: this.boss.hp,
            maxHp: this.boss.maxHp,
            phase: this.boss.phase,
          }
        : null,
    });
  }

  private render() {
    const ctx = this.ctx;
    ctx.save();

    // 1. Parallax Scenery Background
    drawParallaxBackground(
      ctx,
      this.level.theme,
      this.cameraX,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      this.elapsedTime
    );

    // Translate world by cameraX
    ctx.translate(-Math.floor(this.cameraX), 0);

    // 2. Visible Tilemap Range
    const startCol = Math.max(0, Math.floor(this.cameraX / TILE_SIZE) - 1);
    const endCol = Math.min(
      this.level.widthInTiles - 1,
      Math.ceil((this.cameraX + CANVAS_WIDTH) / TILE_SIZE) + 1
    );

    for (let r = 0; r < this.level.heightInTiles; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tile = this.tiles[r][c];
        if (tile === TileType.EMPTY) continue;
        const bumped = this.bumpedTiles.find((b) => b.tx === c && b.ty === r);
        const crumbling = this.crumblingBlocks.find(
          (cb) => cb.col === c && cb.row === r && cb.state === 'SHAKING'
        );
        const offsetX = crumbling ? (Math.floor(this.elapsedTime * 45) % 2 === 0 ? -2 : 2) : 0;
        const offsetY = bumped ? bumped.offsetY : 0;
        drawTile(
          ctx,
          tile,
          c * TILE_SIZE + offsetX,
          r * TILE_SIZE + offsetY,
          this.level.theme,
          this.elapsedTime
        );
      }
    }

    // 3. Moving Platforms
    for (const mp of this.movingPlatforms) {
      drawMovingPlatform(ctx, mp.x, mp.y, mp.width);
    }

    // 4. Checkpoint & Goal Flagpole
    if (this.level.checkpoint) {
      drawCheckpointFlag(
        ctx,
        this.level.checkpoint.x,
        this.level.checkpoint.y,
        this.checkpointReached,
        this.elapsedTime
      );
    }
    if (!this.level.hasBoss || this.boss.phase === 'DEFEATED') {
      drawGoalFlagpole(ctx, this.level.goalX, this.level.goalY, this.elapsedTime);
    }

    // 5. Coins & Power-Ups
    for (const coin of this.activeCoins.values()) {
      if (!coin.collected) {
        drawCoin(ctx, coin.x, coin.y, this.elapsedTime);
      }
    }
    for (const item of this.powerUps) {
      drawPowerUpItem(ctx, item, this.elapsedTime);
    }

    // 6. Enemies & Boss
    for (const enemy of this.enemies) {
      drawEnemy(ctx, enemy, this.elapsedTime, this.level.theme);
    }
    if (this.level.hasBoss) {
      drawBoss(ctx, this.boss, this.elapsedTime);
    }

    // 7. Fireballs
    for (const fb of this.fireballs) {
      drawFireball(ctx, fb, this.elapsedTime);
    }

    // 8. Hero Pip
    drawPlayer(
      ctx,
      this.px,
      this.py,
      this.pWidth,
      this.pHeight,
      this.pFacing,
      this.powerState,
      this.isInvincibleStar,
      this.invulnTimer,
      this.pvx,
      this.pvy,
      this.onGround,
      this.elapsedTime,
      this.tailSpinTimer,
      this.isCrouching
    );

    // 9. Particles & Floating Score Popups
    drawParticlesAndFloatingText(ctx, this.particles, this.floatingTexts);

    ctx.restore();

    // 10. Atmospheric Sandstorm Overlay (Screen-Space)
    if (this.level.hasSandstorm) {
      const windActive = Math.sin(this.elapsedTime * 1.1) > -0.25;
      drawSandstormOverlay(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, this.elapsedTime, windActive);
    }
  }
}
