import {
  LevelTheme,
  TileType,
  PowerState,
  ActiveEnemy,
  ActivePowerUpItem,
  ActiveFireball,
  BossState,
  Particle,
  FloatingText,
} from './types';

// Crisp 16-bit Pixel Art Renderer
// Draws every tile, parallax background layer, animated hero, enemy, power-up, and boss using integer pixel coordinates

export function drawParallaxBackground(
  ctx: CanvasRenderingContext2D,
  theme: LevelTheme,
  cameraX: number,
  width: number,
  height: number,
  time: number
) {
  // Base sky / cavern backdrop
  if (theme === 'HILLS') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(0.7, '#7dd3fc');
    grad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (theme === 'FOREST') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#065f46');
    grad.addColorStop(0.6, '#047857');
    grad.addColorStop(1, '#10b981');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (theme === 'CAVERN') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.6, '#1e1b4b');
    grad.addColorStop(1, '#312e81');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (theme === 'FORTRESS') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#451a03');
    grad.addColorStop(0.6, '#7c2d12');
    grad.addColorStop(1, '#ea580c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else {
    // CASTLE
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#18181b');
    grad.addColorStop(0.7, '#27272a');
    grad.addColorStop(1, '#450a0a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // Far parallax layer (clouds / glowing crystals / castle pillars)
  const farOffset = Math.floor(cameraX * 0.18);
  if (theme === 'HILLS' || theme === 'FOREST') {
    for (let i = -1; i < 8; i++) {
      const cx = ((i * 220 - farOffset) % (width + 260) + (width + 260)) % (width + 260) - 100;
      const cy = 65 + (i % 3) * 38;
      drawPixelCloud(ctx, Math.floor(cx), cy, theme === 'FOREST' ? '#a7f3d0' : '#ffffff');
    }
  } else if (theme === 'CAVERN') {
    for (let i = 0; i < 12; i++) {
      const cx = ((i * 150 - farOffset) % (width + 200) + (width + 200)) % (width + 200) - 50;
      const cy = 80 + (i % 4) * 70;
      const pulse = Math.sin(time * 3 + i) > 0 ? '#38bdf8' : '#818cf8';
      ctx.fillStyle = pulse;
      ctx.fillRect(Math.floor(cx), cy, 6, 14);
      ctx.fillRect(Math.floor(cx) - 4, cy + 4, 14, 6);
    }
  } else {
    // FORTRESS / CASTLE background brick arches & torches
    for (let i = -1; i < 8; i++) {
      const px = ((i * 200 - farOffset) % (width + 220) + (width + 220)) % (width + 220) - 60;
      ctx.fillStyle = theme === 'CASTLE' ? '#27272a' : '#431407';
      ctx.fillRect(Math.floor(px), 60, 48, height - 60);
      ctx.fillStyle = theme === 'CASTLE' ? '#3f3f46' : '#7c2d12';
      ctx.fillRect(Math.floor(px) + 6, 60, 12, height - 60);
      // Animated wall torch
      const flicker = Math.floor(time * 10 + i) % 2 === 0;
      ctx.fillStyle = '#78350f';
      ctx.fillRect(Math.floor(px) + 20, 180, 8, 20);
      ctx.fillStyle = flicker ? '#fbbf24' : '#f97316';
      ctx.fillRect(Math.floor(px) + 18, 166, 12, 14);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(Math.floor(px) + 21, 170, 6, 8);
    }
  }

  // Mid parallax layer (hills / giant mushroom trees / stalagmites / battlements)
  const midOffset = Math.floor(cameraX * 0.4);
  for (let i = -1; i < 7; i++) {
    const hx = ((i * 260 - midOffset) % (width + 300) + (width + 300)) % (width + 300) - 120;
    if (theme === 'HILLS') {
      drawPixelHill(ctx, Math.floor(hx), height - 96, 180, 130 + (i % 2) * 45, '#16a34a', '#22c55e');
      drawPixelBush(ctx, Math.floor(hx) + 90, height - 96);
    } else if (theme === 'FOREST') {
      drawMushroomTree(ctx, Math.floor(hx), height - 96, 140 + (i % 2) * 40);
    } else if (theme === 'CAVERN') {
      drawStalagmite(ctx, Math.floor(hx), height - 96, 120 + (i % 3) * 35);
    } else if (theme === 'FORTRESS') {
      drawDistantTower(ctx, Math.floor(hx), height - 96, 150 + (i % 2) * 40);
    }
  }
}

function drawPixelCloud(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(x + 12, y + 12, 64, 24);
  ctx.fillStyle = color;
  ctx.fillRect(x + 16, y, 32, 12);
  ctx.fillRect(x + 8, y + 8, 56, 20);
  ctx.fillRect(x, y + 14, 72, 14);
}

function drawPixelHill(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  w: number,
  h: number,
  darkColor: string,
  lightColor: string
) {
  const steps = 10;
  const stepH = Math.floor(h / steps);
  for (let s = 0; s < steps; s++) {
    const shrink = s * Math.floor(w / (steps * 2.2));
    const sy = baseY - (s + 1) * stepH;
    const sw = Math.max(16, w - shrink * 2);
    const sx = x + shrink;
    ctx.fillStyle = darkColor;
    ctx.fillRect(sx, sy, sw, stepH + 2);
    ctx.fillStyle = lightColor;
    ctx.fillRect(sx + 4, sy + 2, Math.max(8, sw - 12), stepH - 2);
  }
}

function drawPixelBush(ctx: CanvasRenderingContext2D, x: number, baseY: number) {
  ctx.fillStyle = '#14532d';
  ctx.fillRect(x, baseY - 22, 56, 22);
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(x + 4, baseY - 26, 48, 22);
  ctx.fillStyle = '#86efac';
  ctx.fillRect(x + 10, baseY - 24, 12, 6);
  ctx.fillRect(x + 32, baseY - 24, 12, 6);
}

function drawMushroomTree(ctx: CanvasRenderingContext2D, x: number, baseY: number, h: number) {
  // Stalk
  ctx.fillStyle = '#fde68a';
  ctx.fillRect(x + 36, baseY - h, 24, h);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(x + 52, baseY - h, 8, h);
  // Giant Spotted Cap
  ctx.fillStyle = '#be123c';
  ctx.fillRect(x, baseY - h - 24, 96, 28);
  ctx.fillRect(x + 12, baseY - h - 40, 72, 18);
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(x + 16, baseY - h - 20, 12, 12);
  ctx.fillRect(x + 44, baseY - h - 34, 14, 14);
  ctx.fillRect(x + 68, baseY - h - 18, 12, 12);
}

function drawStalagmite(ctx: CanvasRenderingContext2D, x: number, baseY: number, h: number) {
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x + 10, baseY - h, 36, h);
  ctx.fillRect(x + 18, baseY - h - 24, 20, 24);
  ctx.fillStyle = '#334155';
  ctx.fillRect(x + 14, baseY - h, 12, h);
}

function drawDistantTower(ctx: CanvasRenderingContext2D, x: number, baseY: number, h: number) {
  ctx.fillStyle = '#27272a';
  ctx.fillRect(x, baseY - h, 64, h);
  // Crens
  ctx.fillRect(x - 4, baseY - h - 12, 16, 12);
  ctx.fillRect(x + 24, baseY - h - 12, 16, 12);
  ctx.fillRect(x + 52, baseY - h - 12, 16, 12);
  ctx.fillStyle = '#fb923c';
  ctx.fillRect(x + 26, baseY - h + 28, 12, 24);
}

export function drawTile(
  ctx: CanvasRenderingContext2D,
  tile: TileType,
  x: number,
  y: number,
  theme: LevelTheme,
  time: number
) {
  const s = 32;
  switch (tile) {
    case TileType.GROUND_TOP: {
      if (theme === 'HILLS' || theme === 'FOREST') {
        ctx.fillStyle = '#92400e';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x + 4, y + 12, 10, 10);
        ctx.fillRect(x + 18, y + 18, 10, 8);
        // Lush pixel grass top
        ctx.fillStyle = theme === 'FOREST' ? '#059669' : '#16a34a';
        ctx.fillRect(x, y, s, 10);
        ctx.fillStyle = theme === 'FOREST' ? '#34d399' : '#4ade80';
        ctx.fillRect(x, y, s, 4);
        ctx.fillRect(x + 6, y + 10, 6, 4);
        ctx.fillRect(x + 20, y + 10, 6, 3);
      } else if (theme === 'CAVERN') {
        ctx.fillStyle = '#312e81';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#4338ca';
        ctx.fillRect(x, y, s, 8);
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(x + 4, y + 2, 12, 3);
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(x + 6, y + 14, 8, 8);
        ctx.fillRect(x + 18, y + 20, 10, 8);
      } else {
        // FORTRESS / CASTLE
        ctx.fillStyle = '#3f3f46';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#52525b';
        ctx.fillRect(x + 2, y + 2, s - 4, 12);
        ctx.fillRect(x + 2, y + 18, 14, 12);
        ctx.fillRect(x + 18, y + 18, 12, 12);
        ctx.fillStyle = '#71717a';
        ctx.fillRect(x, y, s, 3);
      }
      break;
    }

    case TileType.GROUND_DEEP: {
      if (theme === 'HILLS' || theme === 'FOREST') {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(x + 4, y + 4, 10, 10);
        ctx.fillRect(x + 18, y + 16, 10, 10);
      } else if (theme === 'CAVERN') {
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#312e81';
        ctx.fillRect(x + 4, y + 4, 12, 12);
        ctx.fillRect(x + 18, y + 18, 10, 10);
      } else {
        ctx.fillStyle = '#27272a';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#3f3f46';
        ctx.fillRect(x + 2, y + 2, 12, 12);
        ctx.fillRect(x + 16, y + 16, 12, 12);
      }
      break;
    }

    case TileType.BRICK: {
      ctx.fillStyle = '#7c2d12';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#c2410c';
      // Brick rows with mortar lines
      ctx.fillRect(x + 2, y + 2, 12, 12);
      ctx.fillRect(x + 16, y + 2, 14, 12);
      ctx.fillRect(x + 2, y + 16, 6, 14);
      ctx.fillRect(x + 10, y + 16, 12, 14);
      ctx.fillRect(x + 24, y + 16, 6, 14);
      ctx.fillStyle = '#fb923c';
      ctx.fillRect(x + 2, y + 2, 12, 2);
      ctx.fillRect(x + 16, y + 2, 14, 2);
      break;
    }

    case TileType.QUESTION_COIN:
    case TileType.QUESTION_MUSHROOM:
    case TileType.QUESTION_FIRE:
    case TileType.QUESTION_STAR: {
      const pulse = Math.floor(time * 5) % 3;
      const bgColors = ['#f59e0b', '#fbbf24', '#d97706'];
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = bgColors[pulse];
      ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
      // Corner rivets
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x + 4, y + 4, 3, 3);
      ctx.fillRect(x + s - 7, y + 4, 3, 3);
      ctx.fillRect(x + 4, y + s - 7, 3, 3);
      ctx.fillRect(x + s - 7, y + s - 7, 3, 3);
      // Question mark
      ctx.fillStyle = '#fffbeb';
      ctx.fillRect(x + 11, y + 7, 10, 4);
      ctx.fillRect(x + 17, y + 11, 4, 5);
      ctx.fillRect(x + 13, y + 15, 6, 4);
      ctx.fillRect(x + 13, y + 22, 4, 4);
      break;
    }

    case TileType.USED_BLOCK: {
      ctx.fillStyle = '#44403c';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#78716c';
      ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
      ctx.fillStyle = '#292524';
      ctx.fillRect(x + 4, y + 4, 3, 3);
      ctx.fillRect(x + s - 7, y + 4, 3, 3);
      ctx.fillRect(x + 4, y + s - 7, 3, 3);
      ctx.fillRect(x + s - 7, y + s - 7, 3, 3);
      break;
    }

    case TileType.SOLID_STONE: {
      ctx.fillStyle = '#334155';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(x + 2, y + 2, s - 4, 4);
      ctx.fillRect(x + 2, y + 2, 4, s - 4);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 6, y + s - 4, s - 6, 4);
      ctx.fillRect(x + s - 4, y + 6, 4, s - 6);
      break;
    }

    case TileType.PIPE_TOP_L: {
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(x + 2, y + 2, s - 2, s - 4);
      ctx.fillStyle = '#6ee7b7';
      ctx.fillRect(x + 6, y + 2, 6, s - 4);
      break;
    }

    case TileType.PIPE_TOP_R: {
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#059669';
      ctx.fillRect(x, y + 2, s - 2, s - 4);
      ctx.fillStyle = '#047857';
      ctx.fillRect(x + s - 10, y + 2, 6, s - 4);
      break;
    }

    case TileType.PIPE_BODY_L: {
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(x + 4, y, s - 4, s);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(x + 6, y, s - 6, s);
      ctx.fillStyle = '#6ee7b7';
      ctx.fillRect(x + 10, y, 6, s);
      break;
    }

    case TileType.PIPE_BODY_R: {
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(x, y, s - 4, s);
      ctx.fillStyle = '#059669';
      ctx.fillRect(x, y, s - 6, s);
      ctx.fillStyle = '#047857';
      ctx.fillRect(x + s - 12, y, 6, s);
      break;
    }

    case TileType.SPIKE: {
      // Metallic pixel spikes
      for (let i = 0; i < 2; i++) {
        const sx = x + i * 16;
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(sx + 6, y + 8, 4, 24);
        ctx.fillRect(sx + 4, y + 14, 8, 18);
        ctx.fillRect(sx + 2, y + 20, 12, 12);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(sx + 6, y + 8, 2, 20);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(sx + 6, y + 6, 4, 4);
      }
      break;
    }

    case TileType.LAVA_TOP: {
      const wave = Math.floor(time * 6) % 2;
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x, y + 4, s, s - 4);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(x, y + (wave ? 4 : 6), s, 10);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(x + (wave ? 4 : 16), y + 4, 12, 4);
      break;
    }

    case TileType.LAVA_DEEP: {
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x + 4, y + 6, 12, 12);
      ctx.fillRect(x + 18, y + 18, 10, 10);
      break;
    }

    case TileType.BRIDGE: {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x, y, s, 14);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x + 2, y + 2, 12, 10);
      ctx.fillRect(x + 16, y + 2, 14, 10);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x + 2, y + 2, 12, 3);
      ctx.fillRect(x + 16, y + 2, 14, 3);
      break;
    }
    default:
      break;
  }
}

export function drawCoin(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
  const frame = Math.floor(time * 8) % 4;
  const widths = [14, 10, 6, 10];
  const w = widths[frame];
  const cx = Math.floor(x + (16 - w) / 2);
  const cy = Math.floor(y);

  ctx.fillStyle = '#b45309';
  ctx.fillRect(cx - 1, cy - 1, w + 2, 18);
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(cx, cy, w, 16);
  if (w >= 10) {
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(cx + 2, cy + 2, 3, 10);
  }
}

export function drawMovingPlatform(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number
) {
  const px = Math.floor(x);
  const py = Math.floor(y);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(px, py, width, 16);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(px + 2, py + 2, width - 4, 10);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(px + 4, py + 2, width - 8, 3);
  // Rivets
  ctx.fillStyle = '#78350f';
  for (let rx = px + 8; rx < px + width - 8; rx += 16) {
    ctx.fillRect(rx, py + 6, 4, 4);
  }
}

export function drawCheckpointFlag(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  reached: boolean,
  time: number
) {
  const px = Math.floor(x);
  const py = Math.floor(y);
  // Base
  ctx.fillStyle = '#475569';
  ctx.fillRect(px + 6, py + 56, 20, 8);
  // Pole
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(px + 14, py + 8, 4, 48);
  // Orb
  ctx.fillStyle = reached ? '#fbbf24' : '#94a3b8';
  ctx.fillRect(px + 12, py + 2, 8, 8);
  // Pennant
  const wave = Math.floor(time * 6) % 2;
  ctx.fillStyle = reached ? '#10b981' : '#ef4444';
  ctx.fillRect(px + 18, py + 10, 22, 14);
  ctx.fillStyle = reached ? '#6ee7b7' : '#fca5a5';
  ctx.fillRect(px + 20, py + 12 + wave, 12, 6);
}

export function drawGoalFlagpole(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number
) {
  const px = Math.floor(x);
  const py = Math.floor(y);
  const poleHeight = 10 * 32;

  // Stone base block
  ctx.fillStyle = '#334155';
  ctx.fillRect(px, py + poleHeight - 32, 32, 32);
  ctx.fillStyle = '#64748b';
  ctx.fillRect(px + 4, py + poleHeight - 28, 24, 24);

  // Golden Pole
  ctx.fillStyle = '#eab308';
  ctx.fillRect(px + 13, py, 6, poleHeight - 32);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(px + 14, py, 2, poleHeight - 32);

  // Crown finial on top
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(px + 8, py - 12, 16, 12);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(px + 10, py - 10, 12, 6);

  // Royal Emerald Banner
  const wave = Math.floor(time * 8) % 2;
  ctx.fillStyle = '#10b981';
  ctx.fillRect(px - 34, py + 12 + wave, 48, 28);
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(px - 24, py + 20 + wave, 16, 12);
}

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  facing: -1 | 1,
  powerState: PowerState,
  isInvincibleStar: boolean,
  invulnBlinkTimer: number,
  vx: number,
  vy: number,
  onGround: boolean,
  time: number
) {
  // Damage blink protection
  if (invulnBlinkTimer > 0 && Math.floor(invulnBlinkTimer * 18) % 2 === 0) {
    return;
  }

  const px = Math.floor(x);
  const py = Math.floor(y);

  ctx.save();
  if (facing === -1) {
    ctx.translate(px + width / 2, py);
    ctx.scale(-1, 1);
    ctx.translate(-(px + width / 2), -py);
  }

  // Palette based on power-up or star invincibility
  let tunicColor = '#10b981'; // Emerald Ranger
  let capeColor = '#fbbf24';
  let armorColor = '#047857';

  if (powerState === 'FIRE') {
    tunicColor = '#f97316'; // Solar Flame Tunic
    capeColor = '#fef08a';
    armorColor = '#b91c1c';
  }

  if (isInvincibleStar) {
    const starColors = ['#fbbf24', '#38bdf8', '#f43f5e', '#a855f7', '#4ade80'];
    const idx = Math.floor(time * 20) % starColors.length;
    tunicColor = starColors[idx];
    capeColor = starColors[(idx + 2) % starColors.length];
  }

  const walkCycle = Math.abs(vx) > 15 ? Math.floor(time * 12) % 2 : 0;
  const isJumping = !onGround;

  if (powerState === 'SMALL') {
    // Small Pip (24x28)
    // Plume / Cap
    ctx.fillStyle = capeColor;
    ctx.fillRect(px + 2, py, 8, 4);
    ctx.fillStyle = tunicColor;
    ctx.fillRect(px + 4, py + 2, 16, 6);
    // Face & Visor
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(px + 6, py + 8, 14, 8);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(px + 15, py + 10, 3, 4); // Eye
    // Tunic Body
    ctx.fillStyle = tunicColor;
    ctx.fillRect(px + 5, py + 16, 14, 7);
    ctx.fillStyle = capeColor;
    ctx.fillRect(px + 2, py + 16, 4, 6); // Mini cape
    // Boots
    ctx.fillStyle = '#78350f';
    if (isJumping) {
      ctx.fillRect(px + 4, py + 22, 6, 6);
      ctx.fillRect(px + 14, py + 20, 6, 6);
    } else if (walkCycle === 1) {
      ctx.fillRect(px + 3, py + 23, 7, 5);
      ctx.fillRect(px + 14, py + 22, 7, 6);
    } else {
      ctx.fillRect(px + 5, py + 23, 6, 5);
      ctx.fillRect(px + 13, py + 23, 6, 5);
    }
  } else {
    // Big / Fire Hero Pip (26x44)
    // Royal Plume & Helmet
    ctx.fillStyle = capeColor;
    ctx.fillRect(px + 2, py, 10, 6);
    ctx.fillStyle = tunicColor;
    ctx.fillRect(px + 4, py + 4, 18, 8);
    ctx.fillStyle = armorColor;
    ctx.fillRect(px + 6, py + 9, 16, 3);
    // Face
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(px + 6, py + 12, 15, 10);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(px + 16, py + 14, 3, 5);
    // Flowing Cape
    ctx.fillStyle = capeColor;
    ctx.fillRect(px, py + 22, 6, 14 + walkCycle * 2);
    // Armor & Tunic Torso
    ctx.fillStyle = tunicColor;
    ctx.fillRect(px + 5, py + 22, 16, 14);
    ctx.fillStyle = armorColor;
    ctx.fillRect(px + 7, py + 24, 12, 8);
    // Belt buckle
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(px + 11, py + 32, 6, 4);
    // Arms
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(px + (walkCycle ? 18 : 15), py + 25, 5, 6);
    // Boots
    ctx.fillStyle = '#78350f';
    if (isJumping) {
      ctx.fillRect(px + 4, py + 36, 7, 8);
      ctx.fillRect(px + 15, py + 34, 7, 8);
    } else if (walkCycle === 1) {
      ctx.fillRect(px + 3, py + 36, 8, 8);
      ctx.fillRect(px + 15, py + 35, 8, 9);
    } else {
      ctx.fillRect(px + 5, py + 36, 7, 8);
      ctx.fillRect(px + 14, py + 36, 7, 8);
    }
  }

  ctx.restore();
}

export function drawEnemy(ctx: CanvasRenderingContext2D, enemy: ActiveEnemy, time: number) {
  if (enemy.state === 'DEAD') return;
  const px = Math.floor(enemy.x);
  const py = Math.floor(enemy.y);
  const step = Math.floor(time * 8) % 2;

  if (enemy.type === 'SLIME') {
    if (enemy.state === 'SQUISHED') {
      ctx.fillStyle = '#be123c';
      ctx.fillRect(px + 2, py + 18, 24, 10);
      ctx.fillStyle = '#fda4af';
      ctx.fillRect(px + 6, py + 20, 16, 4);
      return;
    }
    // Bouncing Spore Slime
    ctx.fillStyle = '#9f1239';
    ctx.fillRect(px + 2, py + 4 + step * 2, 24, 24 - step * 2);
    ctx.fillStyle = '#e11d48';
    ctx.fillRect(px + 4, py + 6 + step * 2, 20, 18 - step * 2);
    // Angry eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px + 6, py + 12, 5, 6);
    ctx.fillRect(px + 17, py + 12, 5, 6);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(px + 8, py + 14, 3, 4);
    ctx.fillRect(px + 17, py + 14, 3, 4);
    // Feet
    ctx.fillStyle = '#4c0519';
    ctx.fillRect(px + (step ? 2 : 4), py + 24, 8, 4);
    ctx.fillRect(px + (step ? 18 : 16), py + 24, 8, 4);
  } else if (enemy.type === 'BEETLE') {
    // Armored Shell Beetle
    const isShell = enemy.state === 'SHELL_IDLE' || enemy.state === 'SHELL_MOVING';
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(px + 2, py + (isShell ? 6 : 4), 24, isShell ? 22 : 20);
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(px + 4, py + (isShell ? 8 : 6), 20, 16);
    ctx.fillStyle = '#93c5fd';
    ctx.fillRect(px + 8, py + (isShell ? 10 : 8), 12, 6);
    if (!isShell) {
      // Head & legs
      ctx.fillStyle = '#fde047';
      const headX = enemy.facing === 1 ? px + 20 : px;
      ctx.fillRect(headX, py + 10, 8, 10);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(headX + (enemy.facing === 1 ? 4 : 2), py + 12, 2, 4);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(px + (step ? 4 : 6), py + 24, 6, 4);
      ctx.fillRect(px + (step ? 18 : 16), py + 24, 6, 4);
    }
  } else if (enemy.type === 'BAT') {
    // Swooping Cave Bat
    const wingY = step === 0 ? py + 2 : py + 12;
    ctx.fillStyle = '#581c87';
    ctx.fillRect(px, wingY, 8, 10);
    ctx.fillRect(px + 20, wingY, 8, 10);
    ctx.fillStyle = '#7e22ce';
    ctx.fillRect(px + 8, py + 6, 12, 14);
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(px + 10, py + 10, 3, 3);
    ctx.fillRect(px + 15, py + 10, 3, 3);
  } else if (enemy.type === 'KNIGHT') {
    // Iron Guard Knight
    ctx.fillStyle = '#334155';
    ctx.fillRect(px + 2, py + 2, 24, 24);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(px + 4, py + 4, 20, 18);
    // Horned crest
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(px, py, 6, 6);
    ctx.fillRect(px + 22, py, 6, 6);
    // Glowing visor
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(px + 6, py + 10, 16, 4);
    // Boots
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(px + (step ? 3 : 6), py + 24, 7, 4);
    ctx.fillRect(px + (step ? 18 : 15), py + 24, 7, 4);
  } else if (enemy.type === 'FIRE_BAR') {
    // Rotating Fire Bar around pivot enemy.x, enemy.y
    const angle = enemy.angle || 0;
    for (let i = 0; i < 5; i++) {
      const dist = i * 18;
      const fx = Math.floor(enemy.x + Math.cos(angle) * dist - 7);
      const fy = Math.floor(enemy.y + Math.sin(angle) * dist - 7);
      ctx.fillStyle = i % 2 === 0 ? '#f97316' : '#ef4444';
      ctx.fillRect(fx, fy, 14, 14);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(fx + 3, fy + 3, 8, 8);
    }
  }
}

export function drawPowerUpItem(ctx: CanvasRenderingContext2D, item: ActivePowerUpItem, time: number) {
  const px = Math.floor(item.x);
  const py = Math.floor(item.y);

  if (item.type === 'MUSHROOM') {
    // Growth Mushroom (Red Cap with Gold Spots)
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(px + 2, py, 20, 14);
    ctx.fillRect(px, py + 4, 24, 10);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(px + 4, py + 3, 5, 5);
    ctx.fillRect(px + 15, py + 3, 5, 5);
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(px + 5, py + 14, 14, 10);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(px + 8, py + 16, 2, 4);
    ctx.fillRect(px + 14, py + 16, 2, 4);
  } else if (item.type === 'FIRE_FLOWER') {
    const pulse = Math.floor(time * 10) % 2;
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(px + 10, py + 14, 4, 10);
    ctx.fillRect(px + 4, py + 18, 16, 4);
    ctx.fillStyle = pulse ? '#ef4444' : '#f97316';
    ctx.fillRect(px + 2, py + 2, 20, 14);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(px + 6, py + 5, 12, 8);
  } else if (item.type === 'STAR') {
    const flash = Math.floor(time * 15) % 2;
    ctx.fillStyle = flash ? '#fbbf24' : '#fef08a';
    ctx.fillRect(px + 8, py, 8, 24);
    ctx.fillRect(px, py + 7, 24, 10);
    ctx.fillRect(px + 4, py + 4, 16, 16);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(px + 9, py + 9, 2, 4);
    ctx.fillRect(px + 13, py + 9, 2, 4);
  }
}

export function drawFireball(ctx: CanvasRenderingContext2D, fb: ActiveFireball, time: number) {
  const px = Math.floor(fb.x - fb.radius);
  const py = Math.floor(fb.y - fb.radius);
  const d = fb.radius * 2;
  const flash = Math.floor(time * 20) % 2;

  ctx.fillStyle = fb.isEnemyProjectile ? '#a855f7' : '#ef4444';
  ctx.fillRect(px, py, d, d);
  ctx.fillStyle = fb.isEnemyProjectile ? '#e879f9' : flash ? '#fef08a' : '#f97316';
  ctx.fillRect(px + 2, py + 2, d - 4, d - 4);
}

export function drawBoss(ctx: CanvasRenderingContext2D, boss: BossState, time: number) {
  if (!boss.active || boss.phase === 'DEFEATED') return;

  if (boss.invulnerableTimer > 0 && Math.floor(boss.invulnerableTimer * 18) % 2 === 0) {
    return;
  }

  const px = Math.floor(boss.x);
  const py = Math.floor(boss.y);
  const w = boss.width; // 64
  const h = boss.height; // 64

  const isVulnerable = boss.phase === 'VULNERABLE';
  const step = Math.floor(time * 6) % 2;

  // Armored Shell & Spikes
  ctx.fillStyle = isVulnerable ? '#f59e0b' : '#7f1d1d';
  ctx.fillRect(px + 6, py + 8, w - 12, h - 16);
  ctx.fillStyle = isVulnerable ? '#fef08a' : '#b91c1c';
  ctx.fillRect(px + 10, py + 12, w - 20, h - 24);

  // Crown & Horns on Boss Head
  const headX = boss.facing === -1 ? px : px + w - 24;
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(headX + 2, py - 6, 20, 10);
  ctx.fillRect(headX + 4, py - 12, 4, 6);
  ctx.fillRect(headX + 10, py - 14, 4, 8);
  ctx.fillRect(headX + 16, py - 12, 4, 6);

  // Head & Jaws
  ctx.fillStyle = '#15803d';
  ctx.fillRect(headX, py + 4, 26, 26);
  // Glowing Eyes
  ctx.fillStyle = isVulnerable ? '#38bdf8' : '#fef08a';
  ctx.fillRect(headX + (boss.facing === -1 ? 4 : 14), py + 10, 8, 6);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(headX + (boss.facing === -1 ? 6 : 16), py + 12, 4, 4);

  // Back Spikes
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(px + 20, py, 8, 8);
  ctx.fillRect(px + 34, py, 8, 8);

  // Heavy Claws & Legs
  ctx.fillStyle = '#14532d';
  ctx.fillRect(px + 10, py + h - 10 + step * 2, 16, 10);
  ctx.fillRect(px + w - 26, py + h - 10 + (1 - step) * 2, 16, 10);

  // Vulnerable Dizzy Indicator above head
  if (isVulnerable) {
    const starOffset = Math.floor(Math.sin(time * 10) * 10);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(px + 20 + starOffset, py - 22, 8, 8);
    ctx.fillRect(px + 36 - starOffset, py - 22, 8, 8);
  }
}

export function drawParticlesAndFloatingText(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  floatingTexts: FloatingText[]
) {
  for (const p of particles) {
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
  }

  ctx.font = 'bold 12px "Press Start 2P", monospace';
  for (const ft of floatingTexts) {
    ctx.fillStyle = '#0f172a';
    ctx.fillText(ft.text, Math.floor(ft.x) + 2, Math.floor(ft.y) + 2);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, Math.floor(ft.x), Math.floor(ft.y));
  }
}
