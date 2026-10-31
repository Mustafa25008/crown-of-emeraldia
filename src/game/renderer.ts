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
  } else if (theme === 'UNDERWATER') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(0.55, '#0369a1');
    grad.addColorStop(1, '#0c4a6e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Shimmering water surface waves at top of screen
    const waveShift = Math.floor(time * 24) % 32;
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, 0, width, 10);
    ctx.fillStyle = '#bae6fd';
    for (let wx = -waveShift; wx < width + 32; wx += 32) {
      ctx.fillRect(wx, 2, 18, 4);
      ctx.fillRect(wx + 8, 6, 12, 3);
    }
  } else if (theme === 'DESERT') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#d97706');
    grad.addColorStop(0.45, '#f59e0b');
    grad.addColorStop(0.8, '#fbbf24');
    grad.addColorStop(1, '#fde68a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Blazing Desert Sun in upper sky
    ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
    ctx.fillRect(width - 148, 22, 68, 68);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(width - 140, 30, 52, 52);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(width - 132, 38, 36, 36);
  } else if (theme === 'PYRAMID') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#291507');
    grad.addColorStop(0.55, '#451a03');
    grad.addColorStop(1, '#78350f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (theme === 'SNOW') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(0.45, '#38bdf8');
    grad.addColorStop(0.8, '#bae6fd');
    grad.addColorStop(1, '#f0f9ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Pale Winter Sun & Aurora Shimmer in upper sky
    ctx.fillStyle = 'rgba(224, 242, 254, 0.35)';
    ctx.fillRect(width - 144, 24, 60, 60);
    ctx.fillStyle = '#f0f9ff';
    ctx.fillRect(width - 136, 32, 44, 44);
  } else if (theme === 'ICE_CAVERN') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#082f49');
    grad.addColorStop(0.55, '#0c4a6e');
    grad.addColorStop(1, '#0369a1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (theme === 'FROST_CASTLE') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(0.55, '#0f172a');
    grad.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (theme === 'VOLCANO') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#1c1917');
    grad.addColorStop(0.45, '#450a0a');
    grad.addColorStop(0.8, '#991b1b');
    grad.addColorStop(1, '#ea580c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Blood-red volcanic glow in upper sky
    ctx.fillStyle = 'rgba(249, 115, 22, 0.28)';
    ctx.fillRect(width - 152, 22, 68, 68);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(width - 144, 30, 52, 52);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(width - 134, 40, 32, 32);
  } else if (theme === 'MOLTEN_CAVERN') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#140707');
    grad.addColorStop(0.55, '#450a0a');
    grad.addColorStop(1, '#9a3412');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (theme === 'INFERNO_CASTLE') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#0c0a09');
    grad.addColorStop(0.55, '#290909');
    grad.addColorStop(1, '#7f1d1d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (theme === 'CELESTIA' || theme === 'SKY_TEMPLE') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(0.45, '#38bdf8');
    grad.addColorStop(0.8, '#bae6fd');
    grad.addColorStop(1, '#fef3c7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Radiant Celestial Sun with Golden Halo
    ctx.fillStyle = 'rgba(254, 240, 138, 0.32)';
    ctx.fillRect(width - 156, 18, 76, 76);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(width - 146, 28, 56, 56);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(width - 136, 38, 36, 36);
  } else if (theme === 'STORM_SKIES') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#1e1b4b');
    grad.addColorStop(0.82, '#312e81');
    grad.addColorStop(1, '#475569');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Occasional distant sheet-lightning flash in upper storm clouds
    if (Math.floor(time * 9) % 19 === 0) {
      ctx.fillStyle = 'rgba(186, 230, 253, 0.18)';
      ctx.fillRect(0, 0, width, height);
    }
  } else if (theme === 'CELESTIAL_PALACE') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#0c1938');
    grad.addColorStop(0.5, '#1e3a8a');
    grad.addColorStop(0.85, '#0284c7');
    grad.addColorStop(1, '#fde68a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (theme === 'CHRONOS_VALLEY') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(0.45, '#1e293b');
    grad.addColorStop(0.8, '#451a03');
    grad.addColorStop(1, '#92400e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Radiant Temporal Astral Dial in upper sky
    ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.fillRect(width - 156, 18, 76, 76);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(width - 146, 28, 56, 56);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(width - 136, 38, 36, 36);
  } else if (theme === 'FORGOTTEN_FACTORY') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(0.55, '#1c1917');
    grad.addColorStop(1, '#451a03');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (theme === 'CLOCKWORK_TOWER') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(0.5, '#172554');
    grad.addColorStop(0.85, '#451a03');
    grad.addColorStop(1, '#78350f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (theme === 'LOST_DIMENSION') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#020617');
    grad.addColorStop(0.45, '#0f172a');
    grad.addColorStop(0.8, '#0c4a6e');
    grad.addColorStop(1, '#0284c7');
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

  // Far parallax layer (clouds / glowing crystals / rising bubbles / desert pyramids / temple pillars / snowy peaks)
  const farOffset = Math.floor(cameraX * 0.18);
  if (theme === 'HILLS' || theme === 'FOREST') {
    for (let i = -1; i < 8; i++) {
      const cx = ((i * 220 - farOffset) % (width + 260) + (width + 260)) % (width + 260) - 100;
      // Keep clouds up high in the upper sky (y: 24 to 90), well above blocks at y: 350+
      const cy = 24 + (Math.abs(i) % 3) * 28;
      drawPixelCloud(ctx, Math.floor(cx), cy, theme === 'FOREST' ? '#a7f3d0' : '#ffffff');
    }
  } else if (theme === 'SNOW') {
    // Crisp winter clouds + Distant Snow-Capped Mountain Peaks
    for (let i = -1; i < 6; i++) {
      const cx = ((i * 240 - farOffset) % (width + 280) + (width + 280)) % (width + 280) - 100;
      const cy = 20 + (Math.abs(i) % 2) * 24;
      drawPixelCloud(ctx, Math.floor(cx), cy, '#f8fafc');
    }
    for (let i = -1; i < 5; i++) {
      const mx = ((i * 330 - farOffset) % (width + 380) + (width + 380)) % (width + 380) - 140;
      drawSnowMountain(ctx, Math.floor(mx), height - 96, 180 + (i % 2) * 40, 130 + (i % 2) * 28);
    }
  } else if (theme === 'DESERT') {
    // Warm desert clouds high in sky + Distant Ancient Pyramids on the horizon
    for (let i = -1; i < 6; i++) {
      const cx = ((i * 250 - farOffset) % (width + 280) + (width + 280)) % (width + 280) - 100;
      const cy = 22 + (Math.abs(i) % 2) * 24;
      drawPixelCloud(ctx, Math.floor(cx), cy, '#fef3c7');
    }
    for (let i = -1; i < 5; i++) {
      const px = ((i * 340 - farOffset) % (width + 380) + (width + 380)) % (width + 380) - 140;
      drawDistantPyramid(ctx, Math.floor(px), height - 96, 170 + (i % 2) * 40, 115 + (i % 2) * 25);
    }
  } else if (theme === 'UNDERWATER') {
    // Rising air bubbles and sunlit ocean rays
    for (let i = 0; i < 16; i++) {
      const bx = ((i * 110 - farOffset) % (width + 120) + (width + 120)) % (width + 120) - 20;
      const by = ((height - ((time * (38 + (i % 3) * 14) + i * 75) % (height - 40)))) | 0;
      const bSize = i % 3 === 0 ? 8 : 6;
      ctx.fillStyle = 'rgba(186, 230, 253, 0.55)';
      ctx.fillRect(Math.floor(bx), by, bSize, bSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.floor(bx) + 1, by + 1, 2, 2);
    }
  } else if (theme === 'VOLCANO') {
    // Dark volcanic ash clouds + Distant Erupting Volcanoes with magma plumes
    for (let i = -1; i < 6; i++) {
      const cx = ((i * 250 - farOffset) % (width + 280) + (width + 280)) % (width + 280) - 100;
      const cy = 20 + (Math.abs(i) % 2) * 24;
      drawPixelCloud(ctx, Math.floor(cx), cy, '#57534e');
    }
    for (let i = -1; i < 5; i++) {
      const vx = ((i * 340 - farOffset) % (width + 380) + (width + 380)) % (width + 380) - 140;
      drawEruptingVolcano(ctx, Math.floor(vx), height - 96, 185 + (i % 2) * 35, 130 + (i % 2) * 25, time, i);
    }
  } else if (theme === 'CAVERN' || theme === 'ICE_CAVERN' || theme === 'MOLTEN_CAVERN') {
    for (let i = 0; i < 12; i++) {
      const cx = ((i * 150 - farOffset) % (width + 200) + (width + 200)) % (width + 200) - 50;
      const cy = 50 + (i % 4) * 45;
      const pulse =
        theme === 'MOLTEN_CAVERN'
          ? Math.sin(time * 4 + i) > 0
            ? '#f97316'
            : '#fde047'
          : theme === 'ICE_CAVERN'
          ? Math.sin(time * 3 + i) > 0
            ? '#7dd3fc'
            : '#e0f2fe'
          : Math.sin(time * 3 + i) > 0
          ? '#38bdf8'
          : '#818cf8';
      ctx.fillStyle = pulse;
      ctx.fillRect(Math.floor(cx), cy, 6, 14);
      ctx.fillRect(Math.floor(cx) - 4, cy + 4, 14, 6);
    }
  } else if (theme === 'PYRAMID') {
    // Ancient Sandstone Temple Columns with Hieroglyphs & Golden Braziers
    for (let i = -1; i < 8; i++) {
      const px = ((i * 200 - farOffset) % (width + 220) + (width + 220)) % (width + 220) - 60;
      const xCol = Math.floor(px);
      ctx.fillStyle = '#5c2808';
      ctx.fillRect(xCol, 48, 52, height - 48);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(xCol + 6, 48, 16, height - 48);
      // Carved golden hieroglyph bands
      ctx.fillStyle = '#d97706';
      for (let hy = 90; hy < height - 120; hy += 64) {
        ctx.fillRect(xCol + 8, hy, 36, 6);
        ctx.fillRect(xCol + 18, hy + 14, 16, 8);
      }
      // Flickering golden temple torch
      const flicker = Math.floor(time * 10 + i) % 2 === 0;
      ctx.fillStyle = '#b45309';
      ctx.fillRect(xCol + 22, 182, 10, 18);
      ctx.fillStyle = flicker ? '#fde047' : '#f59e0b';
      ctx.fillRect(xCol + 19, 166, 16, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(xCol + 23, 170, 8, 8);
    }
    } else if (theme === 'CELESTIA' || theme === 'SKY_TEMPLE' || theme === 'STORM_SKIES') {
    // High-altitude sunlit or storm clouds + Distant Floating Sky Islands with cascading waterfalls
    const cloudColor = theme === 'STORM_SKIES' ? '#475569' : '#ffffff';
    for (let i = -1; i < 7; i++) {
      const cx = ((i * 230 - farOffset) % (width + 260) + (width + 260)) % (width + 260) - 100;
      const cy = 20 + (Math.abs(i) % 3) * 24;
      drawPixelCloud(ctx, Math.floor(cx), cy, cloudColor);
    }
    for (let i = -1; i < 5; i++) {
      const ix = ((i * 340 - farOffset) % (width + 380) + (width + 380)) % (width + 380) - 140;
      const iy = 120 + (Math.abs(i) % 2) * 38;
      drawFloatingSkyIsland(ctx, Math.floor(ix), iy, 130 + (i % 2) * 30, time, i, theme === 'STORM_SKIES');
    }
  } else if (theme === 'CELESTIAL_PALACE') {
    // Grand Alabaster & Gold Celestial Palace Columns with Starlight Braziers
    for (let i = -1; i < 8; i++) {
      const px = ((i * 200 - farOffset) % (width + 220) + (width + 220)) % (width + 220) - 60;
      const xCol = Math.floor(px);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(xCol, 48, 50, height - 48);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(xCol + 6, 48, 16, height - 48);
      // Golden celestial sun-trim bands
      ctx.fillStyle = '#f59e0b';
      for (let hy = 84; hy < height - 120; hy += 64) {
        ctx.fillRect(xCol + 4, hy, 42, 6);
        ctx.fillRect(xCol + 16, hy + 12, 18, 8);
      }
      // Radiant cyan-gold starlight brazier
      const flicker = Math.floor(time * 10 + i) % 2 === 0;
      ctx.fillStyle = '#d97706';
      ctx.fillRect(xCol + 20, 180, 10, 18);
      ctx.fillStyle = flicker ? '#38bdf8' : '#fde047';
      ctx.fillRect(xCol + 17, 164, 16, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(xCol + 21, 168, 8, 8);
    }
  } else if (
    theme === 'CHRONOS_VALLEY' ||
    theme === 'FORGOTTEN_FACTORY' ||
    theme === 'CLOCKWORK_TOWER' ||
    theme === 'LOST_DIMENSION'
  ) {
    // Giant Rotating Brass/Bronze Gears & Clockwork Pillars in Far Parallax
    for (let i = -1; i < 6; i++) {
      const gx = ((i * 230 - farOffset) % (width + 260) + (width + 260)) % (width + 260) - 90;
      const gy = 70 + (Math.abs(i) % 3) * 48;
      const dir = i % 2 === 0 ? 1 : -1;
      drawRotatingParallaxGear(
        ctx,
        Math.floor(gx),
        gy,
        32 + (i % 2) * 10,
        time * 0.9 * dir + i,
        theme === 'LOST_DIMENSION'
      );
    }
    if (theme === 'FORGOTTEN_FACTORY' || theme === 'CLOCKWORK_TOWER') {
      for (let i = -1; i < 7; i++) {
        const px = ((i * 210 - farOffset) % (width + 240) + (width + 240)) % (width + 240) - 60;
        const xCol = Math.floor(px);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(xCol, 40, 44, height - 40);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(xCol + 6, 40, 12, height - 40);
        // Glowing blue temporal energy conduit along column
        ctx.fillStyle = Math.floor(time * 8 + i) % 2 === 0 ? '#38bdf8' : '#0284c7';
        ctx.fillRect(xCol + 24, 60, 6, height - 120);
      }
    }
  } else {
    // FORTRESS / CASTLE / FROST_CASTLE / INFERNO_CASTLE background brick arches & torches
    for (let i = -1; i < 8; i++) {
      const px = ((i * 200 - farOffset) % (width + 220) + (width + 220)) % (width + 220) - 60;
      const isFrost = theme === 'FROST_CASTLE';
      const isInferno = theme === 'INFERNO_CASTLE';
      ctx.fillStyle = isFrost
        ? '#1e3a8a'
        : isInferno
        ? '#1c1917'
        : theme === 'CASTLE'
        ? '#27272a'
        : '#431407';
      ctx.fillRect(Math.floor(px), 60, 48, height - 60);
      ctx.fillStyle = isFrost
        ? '#0284c7'
        : isInferno
        ? '#7f1d1d'
        : theme === 'CASTLE'
        ? '#3f3f46'
        : '#7c2d12';
      ctx.fillRect(Math.floor(px) + 6, 60, 12, height - 60);
      // Animated wall torch (icy blue flame in FROST_CASTLE, roaring hellfire in INFERNO_CASTLE)
      const flicker = Math.floor(time * 10 + i) % 2 === 0;
      ctx.fillStyle = isFrost ? '#334155' : '#78350f';
      ctx.fillRect(Math.floor(px) + 20, 180, 8, 20);
      ctx.fillStyle = isFrost
        ? flicker
          ? '#38bdf8'
          : '#0ea5e9'
        : isInferno
        ? flicker
          ? '#ef4444'
          : '#f97316'
        : flicker
        ? '#fbbf24'
        : '#f97316';
      ctx.fillRect(Math.floor(px) + 18, 166, 12, 14);
      ctx.fillStyle = isFrost ? '#e0f2fe' : '#fef08a';
      ctx.fillRect(Math.floor(px) + 21, 170, 6, 8);
    }
  }

  // Mid parallax layer (hills / giant mushroom trees / swaying kelp & coral / sand dunes / stalagmites / snowy pines / volcanic ridges / cloud sea)
  const midOffset = Math.floor(cameraX * 0.4);
  for (let i = -1; i < 7; i++) {
    const hx = ((i * 260 - midOffset) % (width + 300) + (width + 300)) % (width + 300) - 120;
    if (theme === 'HILLS') {
      drawPixelHill(ctx, Math.floor(hx), height - 96, 180, 130 + (i % 2) * 45, '#16a34a', '#22c55e');
      drawPixelBush(ctx, Math.floor(hx) + 90, height - 96);
    } else if (theme === 'CELESTIA' || theme === 'SKY_TEMPLE' || theme === 'STORM_SKIES') {
      // Rolling sea of golden-white or storm clouds below the floating islands + ancient sky ruins
      drawPixelHill(
        ctx,
        Math.floor(hx),
        height - 72,
        220,
        85 + (i % 2) * 28,
        theme === 'STORM_SKIES' ? '#334155' : '#bae6fd',
        theme === 'STORM_SKIES' ? '#64748b' : '#ffffff'
      );
      if (theme === 'SKY_TEMPLE') {
        drawSkyTempleRuinsPillar(ctx, Math.floor(hx) + 88, height - 96, 85 + (i % 2) * 22);
      }
    } else if (theme === 'SNOW') {
      drawPixelHill(ctx, Math.floor(hx), height - 96, 190, 95 + (i % 2) * 35, '#7dd3fc', '#f0f9ff');
      drawSnowPineTree(ctx, Math.floor(hx) + 110, height - 96, 68 + (i % 2) * 18);
    } else if (theme === 'VOLCANO') {
      drawPixelHill(ctx, Math.floor(hx), height - 96, 195, 90 + (i % 2) * 32, '#292524', '#44403c');
    } else if (theme === 'DESERT') {
      drawPixelHill(ctx, Math.floor(hx), height - 96, 210, 85 + (i % 2) * 30, '#d97706', '#fbbf24');
      drawBackdropCactus(ctx, Math.floor(hx) + 115, height - 96, 48 + (i % 2) * 14);
    } else if (theme === 'FOREST') {
      // Keep background mushroom trees lower in the backdrop so caps do not intersect floating blocks
      drawMushroomTree(ctx, Math.floor(hx), height - 96, 95 + (i % 2) * 30);
    } else if (theme === 'UNDERWATER') {
      drawCoralReef(ctx, Math.floor(hx), height - 96, 75 + (i % 2) * 28, i);
      drawSeaweedStalk(ctx, Math.floor(hx) + 110, height - 96, 95 + (i % 3) * 20, time, i);
    } else if (
      theme === 'CAVERN' ||
      theme === 'PYRAMID' ||
      theme === 'ICE_CAVERN' ||
      theme === 'MOLTEN_CAVERN'
    ) {
      drawStalagmite(
        ctx,
        Math.floor(hx),
        height - 96,
        85 + (i % 3) * 22,
        theme === 'MOLTEN_CAVERN'
          ? '#292524'
          : theme === 'ICE_CAVERN'
          ? '#0369a1'
          : theme === 'PYRAMID'
          ? '#78350f'
          : '#1e293b',
        theme === 'MOLTEN_CAVERN'
          ? '#dc2626'
          : theme === 'ICE_CAVERN'
          ? '#38bdf8'
          : theme === 'PYRAMID'
          ? '#b45309'
          : '#334155'
      );
    } else if (
      theme === 'CHRONOS_VALLEY' ||
      theme === 'FORGOTTEN_FACTORY' ||
      theme === 'CLOCKWORK_TOWER' ||
      theme === 'LOST_DIMENSION'
    ) {
      drawClockworkTowerBackdrop(
        ctx,
        Math.floor(hx),
        height - 96,
        125 + (i % 2) * 32,
        time,
        i,
        theme === 'LOST_DIMENSION'
      );
    } else if (
      theme === 'FORTRESS' ||
      theme === 'FROST_CASTLE' ||
      theme === 'INFERNO_CASTLE' ||
      theme === 'CELESTIAL_PALACE'
    ) {
      drawDistantTower(ctx, Math.floor(hx), height - 96, 120 + (i % 2) * 30);
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

function drawStalagmite(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  h: number,
  darkColor: string = '#1e293b',
  lightColor: string = '#334155'
) {
  ctx.fillStyle = darkColor;
  ctx.fillRect(x + 10, baseY - h, 36, h);
  ctx.fillRect(x + 18, baseY - h - 24, 20, 24);
  ctx.fillStyle = lightColor;
  ctx.fillRect(x + 14, baseY - h, 12, h);
}

function drawDistantPyramid(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  w: number,
  h: number
) {
  const steps = 12;
  const stepH = Math.floor(h / steps);
  for (let s = 0; s < steps; s++) {
    const shrink = s * Math.floor(w / (steps * 2));
    const sy = baseY - (s + 1) * stepH;
    const sw = Math.max(12, w - shrink * 2);
    const sx = x + shrink;
    // Shadowed right half & sunlit left half
    ctx.fillStyle = '#b45309';
    ctx.fillRect(sx, sy, sw, stepH + 1);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(sx, sy, Math.floor(sw * 0.58), stepH);
  }
}

function drawBackdropCactus(ctx: CanvasRenderingContext2D, x: number, baseY: number, h: number) {
  ctx.fillStyle = '#15803d';
  ctx.fillRect(x + 10, baseY - h, 12, h);
  // Left arm
  ctx.fillRect(x, baseY - Math.floor(h * 0.65), 10, 8);
  ctx.fillRect(x, baseY - Math.floor(h * 0.85), 8, Math.floor(h * 0.25));
  // Right arm
  ctx.fillRect(x + 22, baseY - Math.floor(h * 0.55), 10, 8);
  ctx.fillRect(x + 24, baseY - Math.floor(h * 0.78), 8, Math.floor(h * 0.25));
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(x + 13, baseY - h + 3, 4, h - 6);
}

function drawSnowMountain(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  w: number,
  h: number
) {
  const steps = 12;
  const stepH = Math.floor(h / steps);
  for (let s = 0; s < steps; s++) {
    const shrink = s * Math.floor(w / (steps * 2));
    const sy = baseY - (s + 1) * stepH;
    const sw = Math.max(12, w - shrink * 2);
    const sx = x + shrink;
    const isSnowCap = s >= 7;
    ctx.fillStyle = isSnowCap ? '#cbd5e1' : '#334155';
    ctx.fillRect(sx, sy, sw, stepH + 1);
    ctx.fillStyle = isSnowCap ? '#ffffff' : '#64748b';
    ctx.fillRect(sx, sy, Math.floor(sw * 0.58), stepH);
  }
}

function drawSnowPineTree(ctx: CanvasRenderingContext2D, x: number, baseY: number, h: number) {
  // Trunk
  ctx.fillStyle = '#451a03';
  ctx.fillRect(x + 18, baseY - 18, 12, 18);
  // 3 Tiered Snow-Frosted Pine Boughs
  const tiers = [
    { y: baseY - Math.floor(h * 0.45), w: 48, th: 20 },
    { y: baseY - Math.floor(h * 0.75), w: 36, th: 18 },
    { y: baseY - h, w: 24, th: 16 },
  ];
  for (const t of tiers) {
    const tx = x + 24 - Math.floor(t.w / 2);
    ctx.fillStyle = '#0f766e';
    ctx.fillRect(tx, t.y, t.w, t.th);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(tx, t.y, t.w, 6);
  }
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

function drawEruptingVolcano(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  w: number,
  h: number,
  time: number,
  idx: number
) {
  const steps = 11;
  const stepH = Math.floor(h / steps);
  for (let s = 0; s < steps; s++) {
    const shrink = s * Math.floor(w / (steps * 2.3));
    const sy = baseY - (s + 1) * stepH;
    const sw = Math.max(28, w - shrink * 2);
    const sx = x + shrink;
    const isCraterRim = s >= 9;
    ctx.fillStyle = isCraterRim ? '#7f1d1d' : '#1c1917';
    ctx.fillRect(sx, sy, sw, stepH + 1);
    ctx.fillStyle = isCraterRim ? '#ea580c' : '#292524';
    ctx.fillRect(sx, sy, Math.floor(sw * 0.55), stepH);
  }
  // Glowing lava river flowing down volcano slope
  const pulse = Math.floor(time * 6 + idx) % 2 === 0;
  const craterCenterX = x + Math.floor(w * 0.5);
  ctx.fillStyle = pulse ? '#fde047' : '#f97316';
  ctx.fillRect(craterCenterX - 10, baseY - h - 4, 20, 8);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(craterCenterX - 5, baseY - h + 4, 10, Math.floor(h * 0.55));
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(craterCenterX - 2, baseY - h + 4, 4, Math.floor(h * 0.4));
}

function drawCoralReef(ctx: CanvasRenderingContext2D, x: number, baseY: number, h: number, idx: number) {
  const mainColor = idx % 2 === 0 ? '#f43f5e' : '#fb923c';
  const lightColor = idx % 2 === 0 ? '#fda4af' : '#fed7aa';
  // Central coral trunk
  ctx.fillStyle = mainColor;
  ctx.fillRect(x + 20, baseY - h, 20, h);
  // Left & right coral branches
  ctx.fillRect(x + 4, baseY - Math.floor(h * 0.75), 16, 14);
  ctx.fillRect(x + 4, baseY - Math.floor(h * 0.9), 12, Math.floor(h * 0.3));
  ctx.fillRect(x + 40, baseY - Math.floor(h * 0.65), 16, 14);
  ctx.fillRect(x + 44, baseY - Math.floor(h * 0.85), 12, Math.floor(h * 0.3));
  ctx.fillStyle = lightColor;
  ctx.fillRect(x + 24, baseY - h + 4, 6, h - 12);
}

function drawSeaweedStalk(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  h: number,
  time: number,
  idx: number
) {
  const segments = 6;
  const segH = Math.floor(h / segments);
  for (let s = 0; s < segments; s++) {
    const sway = Math.floor(Math.sin(time * 3.5 + s * 0.8 + idx) * 5);
    const sy = baseY - (s + 1) * segH;
    ctx.fillStyle = '#059669';
    ctx.fillRect(x + sway, sy, 14, segH + 2);
    ctx.fillStyle = '#34d399';
    ctx.fillRect(x + sway + 3, sy + 2, 5, segH - 2);
  }
}

function drawFloatingSkyIsland(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  time: number,
  idx: number,
  isStorm: boolean
) {
  // Tapered floating rock underside
  ctx.fillStyle = isStorm ? '#334155' : '#94a3b8';
  ctx.fillRect(x + 12, y + 12, w - 24, 18);
  ctx.fillStyle = isStorm ? '#1e293b' : '#64748b';
  ctx.fillRect(x + 28, y + 30, w - 56, 16);
  ctx.fillRect(x + 44, y + 46, Math.max(18, w - 88), 12);

  // Lush emerald-gold meadow turf & miniature temple spire on top
  ctx.fillStyle = isStorm ? '#0f766e' : '#16a34a';
  ctx.fillRect(x, y + 4, w, 10);
  ctx.fillStyle = isStorm ? '#2dd4bf' : '#4ade80';
  ctx.fillRect(x + 4, y, w - 8, 6);

  // Miniature golden sky temple gazebo on the distant island
  const templeX = x + Math.floor(w * 0.35);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(templeX, y - 18, 28, 18);
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(templeX - 4, y - 24, 36, 6);

  // Enormous waterfall cascading down from the floating island into the clouds below!
  const fallX = x + Math.floor(w * 0.62);
  const shimmer = Math.floor(time * 12 + idx) % 8;
  ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
  ctx.fillRect(fallX, y + 10, 16, 140);
  ctx.fillStyle = 'rgba(224, 242, 254, 0.9)';
  ctx.fillRect(fallX + 4, y + 10 + shimmer, 6, 128);
  // Cloud mist at base of waterfall
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(fallX - 8, y + 144, 32, 10);
}

function drawSkyTempleRuinsPillar(ctx: CanvasRenderingContext2D, x: number, baseY: number, h: number) {
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(x, baseY - h, 28, h);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(x + 4, baseY - h, 10, h);
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(x - 4, baseY - h - 8, 36, 8);
  ctx.fillRect(x - 4, baseY - 10, 36, 10);
}

function drawRotatingParallaxGear(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  angle: number,
  isDimension: boolean
) {
  const outerColor = isDimension ? '#0369a1' : '#92400e';
  const rimColor = isDimension ? '#38bdf8' : '#d97706';
  const coreColor = isDimension ? '#bae6fd' : '#fbbf24';

  // 8 Rotating Gear Teeth
  ctx.fillStyle = outerColor;
  for (let t = 0; t < 8; t++) {
    const a = angle + (t * Math.PI) / 4;
    const tx = Math.floor(cx + Math.cos(a) * (radius + 5) - 6);
    const ty = Math.floor(cy + Math.sin(a) * (radius + 5) - 6);
    ctx.fillRect(tx, ty, 12, 12);
  }

  // Main Gear Wheel
  ctx.fillStyle = outerColor;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  ctx.fillStyle = rimColor;
  ctx.fillRect(cx - radius + 5, cy - radius + 5, (radius - 5) * 2, (radius - 5) * 2);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(cx - radius + 12, cy - radius + 12, (radius - 12) * 2, (radius - 12) * 2);

  // Glowing Axle Core
  ctx.fillStyle = coreColor;
  ctx.fillRect(cx - 8, cy - 8, 16, 16);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(cx - 4, cy - 4, 8, 8);
}

function drawClockworkTowerBackdrop(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  h: number,
  time: number,
  idx: number,
  isDimension: boolean
) {
  // Dark Steel & Bronze Clock Tower Silhouette
  ctx.fillStyle = isDimension ? '#0f172a' : '#1e293b';
  ctx.fillRect(x, baseY - h, 72, h);
  ctx.fillStyle = isDimension ? '#1e3a8a' : '#78350f';
  ctx.fillRect(x + 6, baseY - h + 6, 60, h - 6);

  // Golden Spire Roof
  ctx.fillStyle = '#d97706';
  ctx.fillRect(x - 4, baseY - h - 10, 80, 10);
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(x + 28, baseY - h - 24, 16, 14);

  // Illuminated Clock Dial Face with Rotating Hands
  const dialX = x + 16;
  const dialY = baseY - h + 18;
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(dialX, dialY, 40, 40);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(dialX + 4, dialY + 4, 32, 32);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(dialX + 18, dialY + 8, 4, 14);
  const handDir = Math.floor(time * 2 + idx) % 2 === 0 ? 1 : -1;
  ctx.fillRect(dialX + 18, dialY + 18, handDir * 12, 4);
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
      } else if (theme === 'UNDERWATER') {
        // Sandy ocean seabed with coral reef crust
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(x + 4, y + 12, 10, 10);
        ctx.fillRect(x + 18, y + 16, 10, 10);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(x, y, s, 10);
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(x, y, s, 4);
        ctx.fillRect(x + 6, y + 8, 6, 3);
        ctx.fillRect(x + 20, y + 8, 6, 3);
      } else if (theme === 'DESERT') {
        // Sun-baked golden desert sand dune crust
        ctx.fillStyle = '#d97706';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x + 4, y + 14, 10, 10);
        ctx.fillRect(x + 18, y + 18, 10, 8);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x, y, s, 10);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(x, y, s, 4);
        ctx.fillRect(x + 4, y + 8, 8, 3);
        ctx.fillRect(x + 18, y + 8, 8, 3);
      } else if (theme === 'PYRAMID') {
        // Carved Ancient Pyramid Sandstone Floor
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x + 2, y + 2, s - 4, 12);
        ctx.fillRect(x + 2, y + 16, 13, 14);
        ctx.fillRect(x + 17, y + 16, 13, 14);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(x, y, s, 3);
      } else if (theme === 'SNOW') {
        // Frosted alpine rock with thick white snowdrifts on top
        ctx.fillStyle = '#334155';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#475569';
        ctx.fillRect(x + 4, y + 14, 10, 10);
        ctx.fillRect(x + 18, y + 18, 10, 8);
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(x, y, s, 11);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, s, 6);
        ctx.fillRect(x + 4, y + 6, 8, 4);
        ctx.fillRect(x + 18, y + 6, 8, 4);
      } else if (theme === 'ICE_CAVERN') {
        // Deep glacial crystal floor
        ctx.fillStyle = '#0c4a6e';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(x, y, s, 9);
        ctx.fillStyle = '#7dd3fc';
        ctx.fillRect(x + 4, y + 2, 14, 3);
        ctx.fillStyle = '#082f49';
        ctx.fillRect(x + 6, y + 14, 8, 8);
        ctx.fillRect(x + 18, y + 20, 10, 8);
      } else if (theme === 'FROST_CASTLE') {
        // Frost-covered royal citadel masonry
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#334155';
        ctx.fillRect(x + 2, y + 2, s - 4, 12);
        ctx.fillRect(x + 2, y + 18, 14, 12);
        ctx.fillRect(x + 18, y + 18, 12, 12);
        ctx.fillStyle = '#7dd3fc';
        ctx.fillRect(x, y, s, 4);
      } else if (theme === 'VOLCANO') {
        // Ash-covered scorched volcanic basalt with glowing magma cracks
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#292524';
        ctx.fillRect(x + 4, y + 14, 10, 10);
        ctx.fillRect(x + 18, y + 18, 10, 8);
        // Ash crust & glowing ember seam
        ctx.fillStyle = '#57534e';
        ctx.fillRect(x, y, s, 9);
        ctx.fillStyle = '#78716c';
        ctx.fillRect(x, y, s, 4);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(x + 6, y + 10, 8, 2);
        ctx.fillRect(x + 20, y + 24, 6, 2);
      } else if (theme === 'MOLTEN_CAVERN') {
        // Subterranean obsidian rock with glowing magma veins
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(x, y, s, 8);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(x + 4, y + 2, 14, 3);
        ctx.fillRect(x + 16, y + 18, 10, 3);
        ctx.fillStyle = '#0c0a09';
        ctx.fillRect(x + 6, y + 12, 8, 8);
      } else if (theme === 'INFERNO_CASTLE') {
        // Forged Obsidian Inferno Citadel masonry with molten trim
        ctx.fillStyle = '#18181b';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#27272a';
        ctx.fillRect(x + 2, y + 2, s - 4, 12);
        ctx.fillRect(x + 2, y + 18, 14, 12);
        ctx.fillRect(x + 18, y + 18, 12, 12);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(x, y, s, 3);
      } else if (theme === 'CELESTIA') {
        // Floating Sky-Island Alabaster Rock with Golden-Emerald Meadow Grass
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(x + 4, y + 14, 10, 10);
        ctx.fillRect(x + 18, y + 18, 10, 8);
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(x, y, s, 10);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(x, y, s, 5);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(x + 6, y + 2, 6, 2);
        ctx.fillRect(x + 20, y + 2, 6, 2);
      } else if (theme === 'SKY_TEMPLE' || theme === 'CELESTIAL_PALACE') {
        // Ancient Floating Marble & Burnished Gold Temple Masonry
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(x + 2, y + 4, s - 4, 12);
        ctx.fillRect(x + 2, y + 18, 13, 12);
        ctx.fillRect(x + 17, y + 18, 13, 12);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x, y, s, 4);
      } else if (theme === 'STORM_SKIES') {
        // Storm-Charged Sky-Stone with Glowing Lightning Trim
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#334155';
        ctx.fillRect(x + 4, y + 12, 10, 10);
        ctx.fillRect(x + 18, y + 16, 10, 10);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x, y, s, 8);
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(x, y, s, 3);
      } else if (
        theme === 'CHRONOS_VALLEY' ||
        theme === 'FORGOTTEN_FACTORY' ||
        theme === 'CLOCKWORK_TOWER' ||
        theme === 'LOST_DIMENSION'
      ) {
        // Burnished Brass, Bronze, Dark Steel & Glowing Blue Energy Floor Plating
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = theme === 'LOST_DIMENSION' ? '#0f172a' : '#334155';
        ctx.fillRect(x + 2, y + 10, s - 4, s - 12);
        // Brass & Golden Top Plate
        ctx.fillStyle = theme === 'LOST_DIMENSION' ? '#0284c7' : '#b45309';
        ctx.fillRect(x, y, s, 9);
        ctx.fillStyle = theme === 'LOST_DIMENSION' ? '#38bdf8' : '#f59e0b';
        ctx.fillRect(x, y, s, 4);
        // Glowing Blue Energy Seam & Golden Rivets
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + 4, y + 9, s - 8, 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x + 5, y + 15, 4, 4);
        ctx.fillRect(x + 23, y + 15, 4, 4);
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
      if (theme === 'HILLS' || theme === 'FOREST' || theme === 'UNDERWATER' || theme === 'DESERT') {
        ctx.fillStyle =
          theme === 'DESERT' ? '#b45309' : theme === 'UNDERWATER' ? '#92400e' : '#78350f';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle =
          theme === 'DESERT' ? '#d97706' : theme === 'UNDERWATER' ? '#b45309' : '#92400e';
        ctx.fillRect(x + 4, y + 4, 10, 10);
        ctx.fillRect(x + 18, y + 16, 10, 10);
      } else if (
        theme === 'CHRONOS_VALLEY' ||
        theme === 'FORGOTTEN_FACTORY' ||
        theme === 'CLOCKWORK_TOWER' ||
        theme === 'LOST_DIMENSION'
      ) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 3, y + 3, 12, 12);
        ctx.fillRect(x + 17, y + 17, 12, 12);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(x + 14, y + 12, 4, 4);
      } else if (theme === 'CELESTIA' || theme === 'SKY_TEMPLE' || theme === 'CELESTIAL_PALACE') {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(x + 3, y + 3, 12, 12);
        ctx.fillRect(x + 17, y + 17, 12, 12);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x + 14, y + 12, 4, 4);
      } else if (theme === 'STORM_SKIES') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 4, y + 4, 12, 12);
        ctx.fillRect(x + 18, y + 18, 10, 10);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(x + 14, y + 12, 6, 3);
      } else if (theme === 'VOLCANO' || theme === 'MOLTEN_CAVERN' || theme === 'INFERNO_CASTLE') {
        ctx.fillStyle = '#141210';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#292524';
        ctx.fillRect(x + 4, y + 4, 12, 12);
        ctx.fillRect(x + 18, y + 18, 10, 10);
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(x + 14, y + 12, 6, 3);
      } else if (theme === 'SNOW' || theme === 'ICE_CAVERN') {
        ctx.fillStyle = theme === 'ICE_CAVERN' ? '#082f49' : '#1e293b';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = theme === 'ICE_CAVERN' ? '#0c4a6e' : '#334155';
        ctx.fillRect(x + 4, y + 4, 12, 12);
        ctx.fillRect(x + 18, y + 18, 10, 10);
      } else if (theme === 'PYRAMID') {
        ctx.fillStyle = '#451a03';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x + 2, y + 2, 12, 12);
        ctx.fillRect(x + 16, y + 16, 12, 12);
      } else if (theme === 'CAVERN') {
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#312e81';
        ctx.fillRect(x + 4, y + 4, 12, 12);
        ctx.fillRect(x + 18, y + 18, 10, 10);
      } else {
        ctx.fillStyle = theme === 'FROST_CASTLE' ? '#0f172a' : '#27272a';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = theme === 'FROST_CASTLE' ? '#1e293b' : '#3f3f46';
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
    case TileType.QUESTION_STAR:
    case TileType.QUESTION_FEATHER: {
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

    case TileType.QUICKSAND_TOP: {
      const shift = Math.floor(time * 10) % 8;
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x, y + 2, s, s - 2);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(x, y + 4, s, 12);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x + shift, y + 3, 12, 4);
      ctx.fillRect(x + ((shift + 16) % 24), y + 9, 10, 4);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x + ((16 - shift) % 24), y + 18, 10, 4);
      break;
    }

    case TileType.QUICKSAND_DEEP: {
      const shift = Math.floor(time * 8) % 8;
      ctx.fillStyle = '#92400e';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x + 4, y + shift, 12, 8);
      ctx.fillRect(x + 18, y + ((shift + 14) % 24), 10, 8);
      break;
    }

    case TileType.CRUMBLE_BLOCK: {
      // Cracked unstable sandstone platform block
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x, y, s, 18);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(x + 2, y + 2, s - 4, 13);
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(x + 4, y + 2, s - 8, 3);
      // Visible cracks & loose sand teeth underneath
      ctx.fillStyle = '#451a03';
      ctx.fillRect(x + 10, y + 4, 2, 10);
      ctx.fillRect(x + 12, y + 8, 4, 2);
      ctx.fillRect(x + 21, y + 5, 2, 9);
      ctx.fillRect(x + 4, y + 18, 6, 4);
      ctx.fillRect(x + 14, y + 18, 6, 5);
      ctx.fillRect(x + 24, y + 18, 5, 4);
      break;
    }

    case TileType.CACTUS: {
      // Prickly Saguaro Desert Cactus Hazard
      ctx.fillStyle = '#14532d';
      ctx.fillRect(x + 10, y + 4, 12, 28);
      // Left & Right Cactus Arms
      ctx.fillRect(x + 2, y + 12, 8, 6);
      ctx.fillRect(x + 2, y + 8, 6, 8);
      ctx.fillRect(x + 22, y + 14, 8, 6);
      ctx.fillRect(x + 24, y + 10, 6, 8);
      // Bright green inner ribs
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(x + 12, y + 6, 4, 24);
      ctx.fillRect(x + 18, y + 6, 2, 24);
      // Sharp white needles & desert flower on top
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + 8, y + 8, 2, 2);
      ctx.fillRect(x + 22, y + 8, 2, 2);
      ctx.fillRect(x + 8, y + 22, 2, 2);
      ctx.fillRect(x + 22, y + 22, 2, 2);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(x + 13, y + 1, 6, 4);
      break;
    }

    case TileType.ICE_GROUND: {
      // Glossy translucent slippery ice block with diagonal specular shine
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(x, y, s, 6);
      // Diagonal ice sheen
      ctx.fillStyle = '#f0f9ff';
      ctx.fillRect(x + 6, y + 10, 8, 3);
      ctx.fillRect(x + 12, y + 13, 8, 3);
      ctx.fillRect(x + 18, y + 20, 8, 3);
      break;
    }

    case TileType.FRAGILE_ICE: {
      // Cracked fragile ice ledge that shatters shortly after being stepped on
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(x, y, s, 18);
      ctx.fillStyle = '#7dd3fc';
      ctx.fillRect(x + 2, y + 2, s - 4, 13);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 4, y + 2, s - 8, 3);
      // Fracture lines & hanging mini icicles
      ctx.fillStyle = '#0c4a6e';
      ctx.fillRect(x + 9, y + 4, 2, 10);
      ctx.fillRect(x + 11, y + 9, 5, 2);
      ctx.fillRect(x + 22, y + 5, 2, 9);
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(x + 4, y + 18, 4, 5);
      ctx.fillRect(x + 14, y + 18, 4, 6);
      ctx.fillRect(x + 24, y + 18, 4, 5);
      break;
    }

    case TileType.ICICLE: {
      // Razor-sharp crystalline ice spikes
      for (let i = 0; i < 2; i++) {
        const sx = x + i * 16;
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(sx + 6, y + 6, 4, 26);
        ctx.fillRect(sx + 4, y + 12, 8, 20);
        ctx.fillRect(sx + 2, y + 18, 12, 14);
        ctx.fillStyle = '#7dd3fc';
        ctx.fillRect(sx + 5, y + 8, 5, 22);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx + 6, y + 4, 2, 20);
      }
      break;
    }

    case TileType.FREEZING_WATER_TOP: {
      const wave = Math.floor(time * 7) % 2;
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(x, y + 4, s, s - 4);
      ctx.fillStyle = '#0ea5e9';
      ctx.fillRect(x, y + (wave ? 4 : 6), s, 10);
      // Floating ice floe chunks on top of sub-zero water
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(x + (wave ? 3 : 14), y + 3, 14, 4);
      break;
    }

    case TileType.FREEZING_WATER_DEEP: {
      ctx.fillStyle = '#082f49';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(x + 4, y + 6, 12, 10);
      ctx.fillRect(x + 18, y + 18, 10, 10);
      break;
    }

    case TileType.BURNING_ROCK: {
      // Superheated Volcanic Burning Rock Hazard with pulsing magma cracks & flames
      const glow = Math.floor(time * 8) % 2 === 0;
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(x + 2, y + 6, s - 4, s - 6);
      ctx.fillStyle = '#44403c';
      ctx.fillRect(x + 4, y + 8, s - 8, s - 10);
      // Glowing magma fissures & flame tips
      ctx.fillStyle = glow ? '#ef4444' : '#f97316';
      ctx.fillRect(x + 6, y + 2, 6, 8);
      ctx.fillRect(x + 18, y + 2, 8, 8);
      ctx.fillRect(x + 8, y + 12, 16, 4);
      ctx.fillRect(x + 6, y + 20, 8, 6);
      ctx.fillRect(x + 18, y + 18, 8, 8);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + 8, y + 4, 3, 4);
      ctx.fillRect(x + 20, y + 4, 4, 4);
      ctx.fillRect(x + 12, y + 13, 8, 2);
      break;
    }

    case TileType.MAGMA_CRUMBLE: {
      // Unstable Cracked Obsidian & Magma Platform that collapses after being stepped on
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(x, y, s, 18);
      ctx.fillStyle = '#44403c';
      ctx.fillRect(x + 2, y + 2, s - 4, 13);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(x + 4, y + 2, s - 8, 3);
      // Glowing lava fracture lines & jagged obsidian teeth
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + 9, y + 5, 2, 10);
      ctx.fillRect(x + 11, y + 9, 5, 2);
      ctx.fillRect(x + 21, y + 5, 2, 9);
      ctx.fillStyle = '#292524';
      ctx.fillRect(x + 4, y + 18, 5, 5);
      ctx.fillRect(x + 14, y + 18, 5, 6);
      ctx.fillRect(x + 24, y + 18, 5, 5);
      break;
    }

    case TileType.CLOUD_PLATFORM: {
      // Fluffy Golden-Lined Celestial Cloud One-Way Platform
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(x + 2, y + 4, s - 4, 14);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y + 2, s, 12);
      ctx.fillRect(x + 4, y, s - 8, 14);
      // Golden sunlight rim on top
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + 4, y, s - 8, 3);
      // Soft cloud puffs along bottom
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(x + 3, y + 14, 7, 4);
      ctx.fillRect(x + 13, y + 15, 7, 4);
      ctx.fillRect(x + 22, y + 14, 7, 4);
      break;
    }

    case TileType.TEMP_CLOUD: {
      // Shimmering Temporary Sky-Rune Cloud Platform that dissipates shortly after being stepped on
      const shimmer = Math.floor(time * 8) % 2 === 0;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x + 2, y + 4, s - 4, 13);
      ctx.fillStyle = shimmer ? '#f0f9ff' : '#bae6fd';
      ctx.fillRect(x + 2, y + 2, s - 4, 11);
      // Golden rune dashes & dissipating cloud wisps underneath
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x + 5, y + 6, 6, 3);
      ctx.fillRect(x + 13, y + 6, 6, 3);
      ctx.fillRect(x + 21, y + 6, 6, 3);
      ctx.fillStyle = '#7dd3fc';
      ctx.fillRect(x + 6, y + 17, 4, 4);
      ctx.fillRect(x + 15, y + 18, 4, 5);
      ctx.fillRect(x + 23, y + 17, 4, 4);
      break;
    }

    case TileType.STORM_SPIKE: {
      // Electrified Celestial Storm Crystal Trap
      const spark = Math.floor(time * 12) % 2 === 0;
      for (let i = 0; i < 2; i++) {
        const sx = x + i * 16;
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(sx + 6, y + 6, 4, 26);
        ctx.fillRect(sx + 4, y + 12, 8, 20);
        ctx.fillRect(sx + 2, y + 18, 12, 14);
        ctx.fillStyle = spark ? '#fde047' : '#38bdf8';
        ctx.fillRect(sx + 5, y + 8, 5, 22);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx + 6, y + 4, 2, 18);
      }
      break;
    }

    case TileType.CONVEYOR_LEFT:
    case TileType.CONVEYOR_RIGHT: {
      const isRight = tile === TileType.CONVEYOR_RIGHT;
      const shift = Math.floor(time * 24) % 16;
      // Dark steel belt housing & brass rollers
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x, y, s, 20);
      ctx.fillStyle = '#334155';
      ctx.fillRect(x + 2, y + 3, s - 4, 14);
      // Brass top & bottom belt tracks
      ctx.fillStyle = '#d97706';
      ctx.fillRect(x, y, s, 3);
      ctx.fillRect(x, y + 17, s, 3);
      // Animated directional energy chevrons on belt
      ctx.fillStyle = '#38bdf8';
      for (let i = 0; i < 2; i++) {
        const rawPos = i * 16 + (isRight ? shift : 15 - shift);
        const cx = x + (rawPos % 28);
        ctx.fillRect(cx, y + 6, 4, 8);
      }
      // Rotating brass axle bolts inside belt
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x + 5, y + 8, 4, 4);
      ctx.fillRect(x + 23, y + 8, 4, 4);
      break;
    }

    case TileType.TEMP_COG_PLATFORM: {
      // Timed Disappearing Clockwork Cog Platform
      const pulse = Math.floor(time * 10) % 2 === 0;
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x, y, s, 18);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(x + 2, y + 2, s - 4, 13);
      ctx.fillStyle = pulse ? '#38bdf8' : '#fef08a';
      ctx.fillRect(x + 6, y + 5, s - 12, 5);
      // Clockwork gear teeth along bottom
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x + 3, y + 18, 5, 4);
      ctx.fillRect(x + 13, y + 18, 6, 4);
      ctx.fillRect(x + 24, y + 18, 5, 4);
      break;
    }

    case TileType.GEAR_HAZARD: {
      // Spinning Brass & Steel Saw-Gear Hazard Tile
      const spin = Math.floor(time * 16) % 2;
      // Outer saw teeth
      ctx.fillStyle = '#cbd5e1';
      if (spin === 0) {
        ctx.fillRect(x + 12, y, 8, s);
        ctx.fillRect(x, y + 12, s, 8);
        ctx.fillRect(x + 4, y + 4, 24, 24);
      } else {
        ctx.fillRect(x + 2, y + 2, 28, 28);
        ctx.fillRect(x + 14, y, 4, s);
        ctx.fillRect(x, y + 14, s, 4);
      }
      // Burnished brass inner wheel
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x + 6, y + 6, 20, 20);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x + 8, y + 8, 16, 16);
      // Glowing blue temporal axle
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 11, y + 11, 10, 10);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x + 13, y + 13, 6, 6);
      break;
    }

    case TileType.WARP_PIPE_TOP_L: {
      // Bronze & Glowing Blue Chronos Warp Pipe (Top Left)
      ctx.fillStyle = '#451a03';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(x + 2, y + 2, s - 2, s - 4);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(x + 6, y + 2, 6, s - 4);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x + 4, y + 4, s - 4, 3);
      break;
    }

    case TileType.WARP_PIPE_TOP_R: {
      // Bronze & Glowing Blue Chronos Warp Pipe (Top Right)
      ctx.fillStyle = '#451a03';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x, y + 2, s - 2, s - 4);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x + s - 10, y + 2, 6, s - 4);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x, y + 4, s - 4, 3);
      break;
    }

    case TileType.WARP_PIPE_BODY_L: {
      ctx.fillStyle = '#451a03';
      ctx.fillRect(x + 4, y, s - 4, s);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(x + 6, y, s - 6, s);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(x + 10, y, 6, s);
      break;
    }

    case TileType.WARP_PIPE_BODY_R: {
      ctx.fillStyle = '#451a03';
      ctx.fillRect(x, y, s - 4, s);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x, y, s - 6, s);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x + s - 12, y, 6, s);
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
  time: number,
  tailSpinTimer: number = 0,
  isCrouching: boolean = false,
  isSuperJumpCharging: boolean = false
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

  // Palette based on power-up, star invincibility, or Charged Super Jump visual blink
  let tunicColor = '#10b981'; // Emerald Ranger
  let capeColor = '#fbbf24';
  let armorColor = '#047857';

  if (powerState === 'FIRE') {
    tunicColor = '#f97316'; // Solar Flame Tunic
    capeColor = '#fef08a';
    armorColor = '#b91c1c';
  } else if (powerState === 'RACCOON') {
    tunicColor = '#dc2626'; // Classic Raccoon Red/Amber Tunic
    capeColor = '#b45309';
    armorColor = '#1d4ed8';
  }

  if (isInvincibleStar || isSuperJumpCharging) {
    const starColors = ['#fbbf24', '#38bdf8', '#f43f5e', '#a855f7', '#4ade80'];
    const idx = Math.floor(time * 20) % starColors.length;
    tunicColor = starColors[idx];
    capeColor = starColors[(idx + 2) % starColors.length];
    if (isSuperJumpCharging && !isInvincibleStar) {
      armorColor = starColors[(idx + 1) % starColors.length];
    }
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
  } else if (isCrouching) {
    // Crouching / Sitting Grown Hero Pip (26x28)
    if (powerState === 'RACCOON') {
      // Striped Raccoon Tail tucked behind sitting Pip
      ctx.fillStyle = '#451a03';
      ctx.fillRect(px - 10, py + 15, 12, 8);
      ctx.fillRect(px - 13, py + 16, 4, 6);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(px - 11, py + 16, 3, 6);
      ctx.fillRect(px - 5, py + 16, 3, 6);
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(px - 11, py + 17, 2, 4);
      ctx.fillRect(px - 5, py + 17, 2, 4);

      // Pointed Raccoon Ears on lowered Cap
      ctx.fillStyle = '#451a03';
      ctx.fillRect(px + 5, py - 2, 5, 6);
      ctx.fillRect(px + 14, py - 2, 5, 6);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(px + 6, py - 1, 3, 4);
      ctx.fillRect(px + 15, py - 1, 3, 4);
    } else {
      // Lowered Plume & Tucked Cape for BIG / FIRE
      ctx.fillStyle = capeColor;
      ctx.fillRect(px + 2, py, 10, 5);
      ctx.fillRect(px, py + 13, 6, 10);
    }

    // Lowered Cap / Helmet
    ctx.fillStyle = tunicColor;
    ctx.fillRect(px + 4, py + 2, 18, 7);
    ctx.fillStyle = armorColor;
    ctx.fillRect(px + 6, py + 7, 16, 2);
    // Tucked Face
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(px + 6, py + 9, 15, 7);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(px + 16, py + 10, 3, 4);
    // Sitting / Crouching Torso & Knees
    ctx.fillStyle = tunicColor;
    ctx.fillRect(px + 4, py + 16, 18, 7);
    ctx.fillStyle = armorColor;
    ctx.fillRect(px + 6, py + 17, 14, 5);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(px + 11, py + 20, 6, 3);
    // Arms holding knees
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(px + 15, py + 17, 6, 5);
    // Sitting Boots planted on ground
    ctx.fillStyle = '#78350f';
    ctx.fillRect(px + 3, py + 23, 9, 5);
    ctx.fillRect(px + 14, py + 23, 9, 5);
  } else {
    // Big / Fire / Raccoon Hero Pip (26x44)
    if (powerState === 'RACCOON') {
      const isSpinAttacking = tailSpinTimer > 0;
      const isFlapping = !onGround || Math.abs(vx) > 220;
      const tailWag = isFlapping ? (Math.floor(time * 22) % 3) - 1 : 0;
      const ty = py + 26 + tailWag * 2;

      if (isSpinAttacking) {
        // 360° Tail Spin Attack Swoosh & Extended Whip on Front + Back!
        const spinPhase = Math.floor(tailSpinTimer * 36) % 2;
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(px - 18, py + 25, width + 36, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px - 16, py + 27, width + 32, 2);

        // Extended Striped Tail whipping across front and back
        const whipX = spinPhase === 0 ? px + width - 2 : px - 16;
        ctx.fillStyle = '#451a03';
        ctx.fillRect(whipX, py + 24, 18, 9);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(whipX + 3, py + 25, 4, 7);
        ctx.fillRect(whipX + 10, py + 25, 4, 7);
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(whipX + 4, py + 26, 2, 5);
        ctx.fillRect(whipX + 11, py + 26, 2, 5);
      } else {
        // Standard Striped Raccoon Tail extending behind Pip
        ctx.fillStyle = '#451a03';
        ctx.fillRect(px - 10, ty, 12, 9);
        ctx.fillRect(px - 13, ty + 1, 4, 7);
        // Warm tan/amber raccoon tail stripes (#f59e0b / #fde68a)
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(px - 11, ty + 1, 3, 7);
        ctx.fillRect(px - 5, ty + 1, 3, 7);
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(px - 11, ty + 2, 2, 5);
        ctx.fillRect(px - 5, ty + 2, 2, 5);
      }

      // Pointed Raccoon Ears on top of Cap
      ctx.fillStyle = '#451a03';
      ctx.fillRect(px + 5, py - 3, 5, 7);
      ctx.fillRect(px + 14, py - 3, 5, 7);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(px + 6, py - 2, 3, 5);
      ctx.fillRect(px + 15, py - 2, 3, 5);
    } else {
      // Royal Plume & Flowing Cape for BIG / FIRE
      ctx.fillStyle = capeColor;
      ctx.fillRect(px + 2, py, 10, 6);
      ctx.fillRect(px, py + 22, 6, 14 + walkCycle * 2);
    }

    // Cap / Helmet
    ctx.fillStyle = tunicColor;
    ctx.fillRect(px + 4, py + 4, 18, 8);
    ctx.fillStyle = armorColor;
    ctx.fillRect(px + 6, py + 9, 16, 3);
    // Face
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(px + 6, py + 12, 15, 10);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(px + 16, py + 14, 3, 5);
    // Armor & Tunic Torso
    ctx.fillStyle = tunicColor;
    ctx.fillRect(px + 5, py + 22, 16, 14);
    ctx.fillStyle = armorColor;
    ctx.fillRect(px + 7, py + 24, 12, 8);
    // Belt buckle
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(px + 11, py + 32, 6, 4);
    // Arms (outstretched when flying in Raccoon state!)
    ctx.fillStyle = '#fde68a';
    if (powerState === 'RACCOON' && !onGround) {
      ctx.fillRect(px + 17, py + 21, 7, 5);
    } else {
      ctx.fillRect(px + (walkCycle ? 18 : 15), py + 25, 5, 6);
    }
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

export function drawEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: ActiveEnemy,
  time: number,
  theme?: LevelTheme
) {
  if (enemy.state === 'DEAD') return;
  const px = Math.floor(enemy.x);
  const py = Math.floor(enemy.y);
  const step = Math.floor(time * 8) % 2;

  const isIceTheme = theme === 'SNOW' || theme === 'ICE_CAVERN' || theme === 'FROST_CASTLE';
  const isVolcanicTheme =
    theme === 'VOLCANO' || theme === 'MOLTEN_CAVERN' || theme === 'INFERNO_CASTLE';
  const isCelestiaTheme =
    theme === 'CELESTIA' ||
    theme === 'SKY_TEMPLE' ||
    theme === 'STORM_SKIES' ||
    theme === 'CELESTIAL_PALACE';
  const isChronosTheme =
    theme === 'CHRONOS_VALLEY' ||
    theme === 'FORGOTTEN_FACTORY' ||
    theme === 'CLOCKWORK_TOWER' ||
    theme === 'LOST_DIMENSION';

  if (enemy.type === 'SLIME') {
    if (enemy.state === 'SQUISHED') {
      ctx.fillStyle = isChronosTheme
        ? '#92400e'
        : isCelestiaTheme
        ? '#0284c7'
        : isVolcanicTheme
        ? '#9a3412'
        : isIceTheme
        ? '#0284c7'
        : theme === 'DESERT' || theme === 'PYRAMID'
        ? '#b45309'
        : '#be123c';
      ctx.fillRect(px + 2, py + 18, 24, 10);
      ctx.fillStyle = isChronosTheme
        ? '#38bdf8'
        : isCelestiaTheme
        ? '#fef08a'
        : isVolcanicTheme
        ? '#fde047'
        : isIceTheme
        ? '#e0f2fe'
        : theme === 'DESERT' || theme === 'PYRAMID'
        ? '#fde68a'
        : '#fda4af';
      ctx.fillRect(px + 6, py + 20, 16, 4);
      return;
    }
    if (isChronosTheme) {
      // Clockwork Cog Bot / Brass Wind-Up Automaton
      ctx.fillStyle = '#78350f';
      ctx.fillRect(px + 2, py + 6 + step, 24, 18 - step);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(px + 4, py + 8 + step, 20, 14 - step);
      // Wind-up Golden Key on Top
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(px + 10, py + 1 + step, 8, 5);
      // Glowing Blue Optical Sensors & Steel Treads
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px + 6, py + 12, 16, 5);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(px + 8, py + 13, 4, 3);
      ctx.fillRect(px + 16, py + 13, 4, 3);
      ctx.fillStyle = '#334155';
      ctx.fillRect(px + (step ? 2 : 4), py + 24, 8, 4);
      ctx.fillRect(px + (step ? 18 : 16), py + 24, 8, 4);
      return;
    }
    if (isCelestiaTheme) {
      // Nimbus Puff / Storm Cloud Sprite
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(px + 2, py + 6 + step * 2, 24, 20 - step * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 4, py + 8 + step * 2, 20, 14 - step * 2);
      // Golden lightning halo crest
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(px + 10, py + 2 + step * 2, 8, 5);
      // Eyes & golden sky-sandals
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px + 7, py + 13, 3, 4);
      ctx.fillRect(px + 18, py + 13, 3, 4);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(px + (step ? 2 : 4), py + 24, 8, 4);
      ctx.fillRect(px + (step ? 18 : 16), py + 24, 8, 4);
      return;
    }
    if (isVolcanicTheme) {
      // Magma Cinder Imp / Living Lava Blob
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(px + 2, py + 6 + step * 2, 24, 22 - step * 2);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(px + 4, py + 8 + step * 2, 20, 16 - step * 2);
      // Flickering flame crest on top
      ctx.fillStyle = '#fde047';
      ctx.fillRect(px + 8, py + 2 + step * 2, 12, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 7, py + 13, 4, 4);
      ctx.fillRect(px + 17, py + 13, 4, 4);
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(px + (step ? 2 : 4), py + 24, 8, 4);
      ctx.fillRect(px + (step ? 18 : 16), py + 24, 8, 4);
      return;
    }
    if (isIceTheme) {
      // Frost Sprite / Crystal Snow Fluff
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(px + 2, py + 6 + step * 2, 24, 22 - step * 2);
      ctx.fillStyle = '#7dd3fc';
      ctx.fillRect(px + 4, py + 8 + step * 2, 20, 16 - step * 2);
      ctx.fillStyle = '#f0f9ff';
      ctx.fillRect(px + 6, py + 4 + step * 2, 4, 4);
      ctx.fillRect(px + 18, py + 4 + step * 2, 4, 4);
      // Glowing eyes & icy boots
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px + 7, py + 13, 3, 4);
      ctx.fillRect(px + 18, py + 13, 3, 4);
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(px + (step ? 2 : 4), py + 24, 8, 4);
      ctx.fillRect(px + (step ? 18 : 16), py + 24, 8, 4);
      return;
    }
    if (theme === 'DESERT' || theme === 'PYRAMID') {
      // Dune Scorpion / Sand Scarab
      ctx.fillStyle = '#92400e';
      ctx.fillRect(px + 4, py + 10 + step, 20, 14 - step);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(px + 6, py + 12 + step, 16, 10 - step);
      // Raised Scorpion Tail & Stinger
      const tailX = enemy.facing === 1 ? px + 2 : px + 22;
      ctx.fillStyle = '#b45309';
      ctx.fillRect(tailX, py + 2, 4, 10);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(tailX + (enemy.facing === 1 ? 2 : -2), py, 5, 4);
      // Snapping Pincer Claws
      const clawX = enemy.facing === 1 ? px + 22 : px;
      ctx.fillStyle = '#d97706';
      ctx.fillRect(clawX, py + 12, 6, 6);
      // Glowing eyes & legs
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px + 8, py + 14, 3, 3);
      ctx.fillRect(px + 17, py + 14, 3, 3);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(px + (step ? 3 : 5), py + 24, 6, 4);
      ctx.fillRect(px + (step ? 17 : 15), py + 24, 6, 4);
      return;
    }
    // Bouncing Spore Slime / Reef Crab
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
    // Armored Shell Beetle / Sea Turtle / Golden Scarab Tortoise / Glacier Tortoise / Obsidian Flame Tortoise / Winged Sky Tortoise / Bronze Gear-Tortoise
    const isShell = enemy.state === 'SHELL_IDLE' || enemy.state === 'SHELL_MOVING';
    const isDesert = theme === 'DESERT' || theme === 'PYRAMID';
    ctx.fillStyle = isChronosTheme
      ? '#451a03'
      : isCelestiaTheme
      ? '#0284c7'
      : isVolcanicTheme
      ? '#1c1917'
      : isIceTheme
      ? '#0369a1'
      : isDesert
      ? '#78350f'
      : '#1e3a8a';
    ctx.fillRect(px + 2, py + (isShell ? 6 : 4), 24, isShell ? 22 : 20);
    ctx.fillStyle = isChronosTheme
      ? '#d97706'
      : isCelestiaTheme
      ? '#f59e0b'
      : isVolcanicTheme
      ? '#dc2626'
      : isIceTheme
      ? '#38bdf8'
      : isDesert
      ? '#d97706'
      : '#2563eb';
    ctx.fillRect(px + 4, py + (isShell ? 8 : 6), 20, 16);
    ctx.fillStyle = isChronosTheme
      ? '#38bdf8'
      : isCelestiaTheme
      ? '#ffffff'
      : isVolcanicTheme
      ? '#fde047'
      : isIceTheme
      ? '#f0f9ff'
      : isDesert
      ? '#fef08a'
      : '#93c5fd';
    ctx.fillRect(px + 8, py + (isShell ? 10 : 8), 12, 6);
    if (!isShell) {
      // Head & legs
      ctx.fillStyle = isChronosTheme
        ? '#fbbf24'
        : isCelestiaTheme
        ? '#fef08a'
        : isVolcanicTheme
        ? '#f97316'
        : isIceTheme
        ? '#bae6fd'
        : '#fde047';
      const headX = enemy.facing === 1 ? px + 20 : px;
      ctx.fillRect(headX, py + 10, 8, 10);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(headX + (enemy.facing === 1 ? 4 : 2), py + 12, 2, 4);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(px + (step ? 4 : 6), py + 24, 6, 4);
      ctx.fillRect(px + (step ? 18 : 16), py + 24, 6, 4);
    }
  } else if (enemy.type === 'BAT') {
    if (theme === 'UNDERWATER') {
      // Classic Cheep-Cheep Swimming Reef Fish!
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(px + 4, py + 6, 20, 16);
      ctx.fillStyle = '#fca5a5';
      ctx.fillRect(px + 6, py + 16, 16, 5);
      // Dorsal & Tail Fins
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(px + 10, py + 2, 8, 4);
      const tailX = enemy.facing === 1 ? px : px + 22;
      ctx.fillRect(tailX, py + (step ? 5 : 7), 6, 14);
      // Wing-like pectoral fin
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(px + 10, py + (step ? 11 : 14), 8, 5);
      // Eye
      const eyeX = enemy.facing === 1 ? px + 18 : px + 6;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(eyeX, py + 8, 5, 5);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(eyeX + (enemy.facing === 1 ? 2 : 0), py + 9, 3, 3);
    } else if (isChronosTheme) {
      // Hovering Brass Chrono-Drone with Spinning Rotor Wings
      const wingY = step === 0 ? py + 3 : py + 11;
      ctx.fillStyle = '#d97706';
      ctx.fillRect(px, wingY, 9, 8);
      ctx.fillRect(px + 19, wingY, 9, 8);
      ctx.fillStyle = '#334155';
      ctx.fillRect(px + 7, py + 5, 14, 16);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(px + 10, py + 2, 8, 3);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(px + 10, py + 10, 8, 6);
    } else if (isCelestiaTheme) {
      // Swooping Celestial Wind Falcon / Sky Harpy
      const wingY = step === 0 ? py + 2 : py + 12;
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(px, wingY, 9, 10);
      ctx.fillRect(px + 19, wingY, 9, 10);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(px + 8, py + 6, 12, 14);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(px + 10, py + 4, 8, 4);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(px + 10, py + 9, 3, 3);
      ctx.fillRect(px + 15, py + 9, 3, 3);
    } else if (isVolcanicTheme) {
      // Swooping Firewing Hellbat / Phoenix Cinderbat
      const wingY = step === 0 ? py + 2 : py + 12;
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(px, wingY, 9, 10);
      ctx.fillRect(px + 19, wingY, 9, 10);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(px + 8, py + 6, 12, 14);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(px + 10, py + 9, 3, 3);
      ctx.fillRect(px + 15, py + 9, 3, 3);
    } else if (isIceTheme) {
      // Swooping Snowy Owl / Frostwing Bat
      const wingY = step === 0 ? py + 2 : py + 12;
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(px, wingY, 9, 10);
      ctx.fillRect(px + 19, wingY, 9, 10);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(px + 8, py + 6, 12, 14);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(px + 12, py + 12, 4, 4);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(px + 10, py + 9, 3, 3);
      ctx.fillRect(px + 15, py + 9, 3, 3);
    } else if (theme === 'DESERT' || theme === 'PYRAMID') {
      // Swooping Desert Vulture / Sand Hawk
      const wingY = step === 0 ? py + 2 : py + 12;
      ctx.fillStyle = '#78350f';
      ctx.fillRect(px, wingY, 9, 10);
      ctx.fillRect(px + 19, wingY, 9, 10);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(px + 8, py + 6, 12, 14);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(px + (enemy.facing === 1 ? 18 : 4), py + 10, 6, 5);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(px + 11, py + 9, 3, 3);
    } else {
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
    }
  } else if (enemy.type === 'KNIGHT') {
    if (theme === 'UNDERWATER') {
      // Blooper Squid / Deep-Sea Guard
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(px + 4, py + 2, 20, 16);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(px + 2, py + 8, 24, 8);
      // Tentacles
      const tentH = step ? 8 : 5;
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(px + 5, py + 18, 4, tentH);
      ctx.fillRect(px + 12, py + 18, 4, tentH + 2);
      ctx.fillRect(px + 19, py + 18, 4, tentH);
      // Eyes
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px + 6, py + 9, 16, 5);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(px + 8, py + 10, 4, 3);
      ctx.fillRect(px + 16, py + 10, 4, 3);
    } else if (isChronosTheme) {
      // Clockwork Brass Centurion / Temporal Automaton Sentinel
      ctx.fillStyle = '#451a03';
      ctx.fillRect(px + 2, py + 2, 24, 24);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(px + 4, py + 4, 20, 18);
      // Golden Clock-Gear Crest on Helmet
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(px + 8, py - 3, 12, 6);
      // Glowing Blue Temporal Visor
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px + 6, py + 9, 16, 5);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(px + 8, py + 10, 12, 3);
      // Dark Steel Greaves
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(px + (step ? 3 : 6), py + 24, 7, 4);
      ctx.fillRect(px + (step ? 18 : 15), py + 24, 7, 4);
    } else if (isCelestiaTheme) {
      // Valkyrie Sky Guard / Celestial Temple Sentinel
      ctx.fillStyle = '#d97706';
      ctx.fillRect(px + 2, py + 2, 24, 24);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(px + 4, py + 4, 20, 18);
      // Feathered Golden Valkyrie Wings on Helm
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(px - 2, py - 2, 7, 8);
      ctx.fillRect(px + 23, py - 2, 7, 8);
      // Radiant Sky-Blue Visor
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px + 6, py + 9, 16, 5);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(px + 8, py + 10, 4, 3);
      ctx.fillRect(px + 16, py + 10, 4, 3);
      // Golden Greaves
      ctx.fillStyle = '#b45309';
      ctx.fillRect(px + (step ? 3 : 6), py + 24, 7, 4);
      ctx.fillRect(px + (step ? 18 : 15), py + 24, 7, 4);
    } else if (isVolcanicTheme) {
      // Dread Magma Knight / Obsidian Pyromancer Guard
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(px + 2, py + 2, 24, 24);
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(px + 4, py + 4, 20, 18);
      // Blazing Flame Horns
      ctx.fillStyle = '#f97316';
      ctx.fillRect(px, py - 2, 6, 7);
      ctx.fillRect(px + 22, py - 2, 6, 7);
      // Glowing Molten Visor
      ctx.fillStyle = '#0c0a09';
      ctx.fillRect(px + 6, py + 9, 16, 5);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(px + 8, py + 10, 4, 3);
      ctx.fillRect(px + 16, py + 10, 4, 3);
      // Obsidian Greaves
      ctx.fillStyle = '#292524';
      ctx.fillRect(px + (step ? 3 : 6), py + 24, 7, 4);
      ctx.fillRect(px + (step ? 18 : 15), py + 24, 7, 4);
    } else if (isIceTheme) {
      // Frost Viking / Ice Golem Guard
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(px + 2, py + 2, 24, 24);
      ctx.fillStyle = '#7dd3fc';
      ctx.fillRect(px + 4, py + 4, 20, 18);
      // Ice Crystal Horns
      ctx.fillStyle = '#f0f9ff';
      ctx.fillRect(px, py - 2, 6, 7);
      ctx.fillRect(px + 22, py - 2, 6, 7);
      // Glowing Cyan Visor
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px + 6, py + 9, 16, 5);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(px + 8, py + 10, 4, 3);
      ctx.fillRect(px + 16, py + 10, 4, 3);
      // Frost Boots
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(px + (step ? 3 : 6), py + 24, 7, 4);
      ctx.fillRect(px + (step ? 18 : 15), py + 24, 7, 4);
    } else if (theme === 'DESERT' || theme === 'PYRAMID') {
      // Anubis Temple Guardian / Mummy Phalanx
      ctx.fillStyle = '#d97706';
      ctx.fillRect(px + 2, py + 2, 24, 24);
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(px + 4, py + 6, 20, 16);
      // Mummy bandage stripes & golden Nemes crown
      ctx.fillStyle = '#b45309';
      ctx.fillRect(px + 4, py + 14, 20, 2);
      ctx.fillRect(px + 4, py + 19, 20, 2);
      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(px + 2, py, 24, 6);
      // Glowing ruby eyes
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px + 6, py + 8, 16, 5);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(px + 8, py + 9, 4, 3);
      ctx.fillRect(px + 16, py + 9, 4, 3);
      // Sandaled feet
      ctx.fillStyle = '#78350f';
      ctx.fillRect(px + (step ? 3 : 6), py + 24, 7, 4);
      ctx.fillRect(px + (step ? 18 : 15), py + 24, 7, 4);
    } else {
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
    }
  } else if (enemy.type === 'FIRE_BAR') {
    // Rotating Fire / Frost Crystal / Celestial Storm / Golden Clock-Hand Bar around pivot enemy.x, enemy.y
    const angle = enemy.angle || 0;
    for (let i = 0; i < 5; i++) {
      const dist = i * 18;
      const fx = Math.floor(enemy.x + Math.cos(angle) * dist - 7);
      const fy = Math.floor(enemy.y + Math.sin(angle) * dist - 7);
      ctx.fillStyle = isChronosTheme
        ? i % 2 === 0
          ? '#d97706'
          : '#38bdf8'
        : isCelestiaTheme
        ? i % 2 === 0
          ? '#fbbf24'
          : '#38bdf8'
        : isIceTheme
        ? i % 2 === 0
          ? '#0ea5e9'
          : '#38bdf8'
        : i % 2 === 0
        ? '#f97316'
        : '#ef4444';
      ctx.fillRect(fx, fy, 14, 14);
      ctx.fillStyle = isChronosTheme
        ? '#fef08a'
        : isCelestiaTheme || isIceTheme
        ? '#ffffff'
        : '#fef08a';
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
  } else if (item.type === 'FEATHER') {
    // Raccoon Flight Feather (Swaying golden/white/crimson-tipped plume)
    const sway = Math.floor(Math.sin(time * 7) * 2);
    const fx = px + sway;
    // Quill stem
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(fx + 5, py + 16, 4, 7);
    // Lower white/cream vane
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(fx + 7, py + 9, 10, 9);
    // Golden-brown middle band
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(fx + 9, py + 5, 10, 6);
    // Crimson/orange raccoon crest tip
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(fx + 11, py + 1, 9, 5);
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(fx + 8, py + 6, 3, 12);
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

  if (boss.name.includes('Chronos')) {
    // CHRONOS, THE TIMEKEEPER (Ancient Mechanical Clockwork Titan Guardian Boss)
    const isPhase3 = boss.hp <= 3;
    const isPhase2 = boss.hp <= 7;
    const gearPulse = Math.floor(time * (isPhase3 ? 16 : 10)) % 2;

    // Twin Rotating Shoulder Clockwork Gears
    ctx.fillStyle = '#78350f';
    ctx.fillRect(px - 8, py + 8 + gearPulse * 2, 18, 22);
    ctx.fillRect(px + w - 10, py + 8 + (1 - gearPulse) * 2, 18, 22);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(px - 4, py + 12, 10, 14);
    ctx.fillRect(px + w - 6, py + 12, 10, 14);

    // Armored Brass, Bronze & Dark Steel Chassis
    ctx.fillStyle = isVulnerable ? '#fde047' : '#1e293b';
    ctx.fillRect(px + 6, py + 12, w - 12, h - 20);
    ctx.fillStyle = isVulnerable
      ? '#fef9c3'
      : isPhase3
      ? '#0284c7'
      : isPhase2
      ? '#d97706'
      : '#b45309';
    ctx.fillRect(px + 10, py + 16, w - 20, h - 28);

    // Radiant Chest Clock-Face & Temporal Core
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(px + 18, py + 20, w - 36, 22);
    ctx.fillStyle = isPhase3 ? '#fde047' : '#38bdf8';
    ctx.fillRect(px + 22, py + 24, w - 44, 14);
    // Rotating Clock Hands inside Chest Core
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(px + Math.floor(w / 2) - 1, py + 25, 3, 8);
    ctx.fillRect(px + Math.floor(w / 2), py + 30, gearPulse ? 6 : -6, 3);

    // Sovereign Automaton Head & Golden Pendulum Crown
    const headX = boss.facing === -1 ? px + 6 : px + w - 36;
    ctx.fillStyle = '#334155';
    ctx.fillRect(headX, py - 2, 30, 22);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(headX + 3, py, 24, 18);

    // Golden Crown of Gears
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(headX + 2, py - 10, 26, 8);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(headX + 4, py - 16, 6, 8);
    ctx.fillRect(headX + 12, py - 20, 6, 12);
    ctx.fillRect(headX + 20, py - 16, 6, 8);

    // Glowing Temporal Visor Eyes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(headX + 4, py + 6, 22, 6);
    ctx.fillStyle = isVulnerable ? '#f97316' : isPhase3 ? '#fde047' : '#38bdf8';
    ctx.fillRect(headX + (boss.facing === -1 ? 6 : 14), py + 7, 10, 4);

    if (boss.phase === 'FIRE_BREATH') {
      const beamX = boss.facing === -1 ? headX - 20 : headX + 30;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(beamX, py + 8, 20, 12);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(beamX + 4, py + 11, 12, 6);
    }

    // Heavy Bronze Piston Greaves
    ctx.fillStyle = '#451a03';
    ctx.fillRect(px + 10, py + h - 10 + step * 2, 18, 10);
    ctx.fillRect(px + w - 28, py + h - 10 + (1 - step) * 2, 18, 10);

    if (isVulnerable) {
      const starOffset = Math.floor(Math.sin(time * 10) * 10);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(px + 20 + starOffset, py - 26, 8, 8);
      ctx.fillRect(px + 38 - starOffset, py - 26, 8, 8);
    }
    return;
  }

  if (boss.name.includes('Aetherion')) {
    // AETHERION, THE STORM SOVEREIGN (Majestic Celestial Thunderbird / Storm Phoenix Guardian Boss)
    const isPhase3 = boss.hp <= 3;
    const isPhase2 = boss.hp <= 6;
    const wingLift = Math.floor(Math.sin(time * (isPhase2 ? 14 : 10)) * 8);
    const wingX = boss.facing === -1 ? px + 20 : px + 4;

    // Sweeping Radiant Storm Wings (Golden & Electric Cyan Pinions)
    ctx.fillStyle = isPhase3 ? '#38bdf8' : '#0284c7';
    ctx.fillRect(wingX, py - 14 + wingLift, 40, 28);
    ctx.fillStyle = isPhase3 ? '#fef08a' : '#fbbf24';
    ctx.fillRect(wingX + 4, py - 10 + wingLift, 30, 20);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(wingX + 8, py - 6 + wingLift, 20, 10);

    // Celestial Feathered Breast & Storm-Armor Plastron
    ctx.fillStyle = isVulnerable ? '#fde047' : '#0369a1';
    ctx.fillRect(px + 8, py + 12, w - 16, h - 20);
    ctx.fillStyle = isVulnerable
      ? '#fef9c3'
      : isPhase3
      ? '#38bdf8'
      : isPhase2
      ? '#0ea5e9'
      : '#f8fafc';
    ctx.fillRect(px + 12, py + 16, w - 24, h - 28);

    // Golden Sovereign Sun-Crest on Chest
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(px + 20, py + 22, w - 40, 14);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(px + 24, py + 25, w - 48, 8);

    // Tail Plumes
    const tailX = boss.facing === -1 ? px + w - 12 : px - 10;
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(tailX, py + 26, 20, 14);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(tailX + 2, py + 30, 16, 8);

    // Sovereign Bird Head, Sharp Golden Hooked Beak & Lightning Crown
    const headX = boss.facing === -1 ? px - 2 : px + w - 28;
    const beakX = boss.facing === -1 ? headX - 10 : headX + 28;
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(headX, py + 2, 30, 24);
    // Hooked Golden Raptor Beak
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(beakX, py + 10, 12, 10);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(beakX + (boss.facing === -1 ? 2 : 0), py + 10, 8, 4);

    // Celestial Storm Crown & Feathered Plumes
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(headX + 4, py - 8, 22, 10);
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(headX + 2, py - 16, 6, 10);
    ctx.fillRect(headX + 12, py - 20, 6, 14);
    ctx.fillRect(headX + 22, py - 16, 6, 10);

    // Piercing Lightning Eyes
    ctx.fillStyle = isVulnerable ? '#f97316' : '#ffffff';
    ctx.fillRect(headX + (boss.facing === -1 ? 6 : 16), py + 9, 8, 6);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(headX + (boss.facing === -1 ? 7 : 18), py + 11, 4, 4);

    if (boss.phase === 'FIRE_BREATH') {
      const galeX = boss.facing === -1 ? beakX - 18 : beakX + 12;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(galeX, py + 10, 20, 12);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(galeX + 4, py + 13, 12, 6);
    }

    // Golden Raptor Talons
    ctx.fillStyle = '#d97706';
    ctx.fillRect(px + 12, py + h - 10 + step * 2, 16, 10);
    ctx.fillRect(px + w - 28, py + h - 10 + (1 - step) * 2, 16, 10);

    if (isVulnerable) {
      const starOffset = Math.floor(Math.sin(time * 10) * 10);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(px + 20 + starOffset, py - 26, 8, 8);
      ctx.fillRect(px + 38 - starOffset, py - 26, 8, 8);
    }
    return;
  }

  if (boss.name.includes('Ignarok')) {
    // IGNAROK, THE INFERNO KING (Gigantic Multi-Phase Horned Fire Demon Boss)
    const isPhase3 = boss.hp <= 2;
    const isPhase2 = boss.hp <= 5;
    const wingLift = Math.floor(Math.sin(time * (isPhase2 ? 13 : 9)) * 7);
    const wingX = boss.facing === -1 ? px + 24 : px + 6;

    // Blazing Infernal Demon Wings
    ctx.fillStyle = isPhase3 ? '#f97316' : '#991b1b';
    ctx.fillRect(wingX, py - 12 + wingLift, 36, 26);
    ctx.fillStyle = isPhase3 ? '#fef08a' : '#ef4444';
    ctx.fillRect(wingX + 4, py - 8 + wingLift, 26, 18);

    // Obsidian & Molten Magma Armor Torso
    ctx.fillStyle = isVulnerable ? '#fde047' : '#1c1917';
    ctx.fillRect(px + 6, py + 12, w - 12, h - 20);
    ctx.fillStyle = isVulnerable
      ? '#fef9c3'
      : isPhase3
      ? '#f97316'
      : isPhase2
      ? '#dc2626'
      : '#991b1b';
    ctx.fillRect(px + 10, py + 16, w - 20, h - 28);

    // Glowing Molten Core Chestplate
    ctx.fillStyle = isPhase3 ? '#ffffff' : '#fde047';
    ctx.fillRect(px + 22, py + 24, w - 44, 14);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(px + 26, py + 27, w - 52, 8);

    // Demon Head, Curved Obsidian Horns & Blazing Inferno Crown
    const headX = boss.facing === -1 ? px - 2 : px + w - 28;
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(headX, py + 2, 30, 24);
    // Blazing Inferno Crown & Twin Demon Horns
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(headX + 4, py - 8, 22, 10);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(headX + 2, py - 16, 6, 12);
    ctx.fillRect(headX + 12, py - 18, 6, 12);
    ctx.fillRect(headX + 22, py - 16, 6, 12);

    // Glowing Hellfire Eyes & Roaring Jaws
    ctx.fillStyle = isVulnerable ? '#38bdf8' : '#fef08a';
    ctx.fillRect(headX + (boss.facing === -1 ? 4 : 16), py + 10, 9, 6);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(headX + (boss.facing === -1 ? 6 : 18), py + 12, 5, 4);

    if (boss.phase === 'FIRE_BREATH') {
      const breathX = boss.facing === -1 ? headX - 22 : headX + 30;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(breathX, py + 14, 22, 12);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(breathX + 4, py + 16, 14, 8);
    }

    // Heavy Magma-Forged Demon Hooves
    ctx.fillStyle = '#0c0a09';
    ctx.fillRect(px + 10, py + h - 10 + step * 2, 18, 10);
    ctx.fillRect(px + w - 28, py + h - 10 + (1 - step) * 2, 18, 10);

    if (isVulnerable) {
      const starOffset = Math.floor(Math.sin(time * 10) * 10);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(px + 20 + starOffset, py - 26, 8, 8);
      ctx.fillRect(px + 38 - starOffset, py - 26, 8, 8);
    }
    return;
  }

  if (boss.name.includes('Glacior')) {
    // GLACIOR, THE FROST DRAGON (Winged Sapphire & Cyan Ice Dragon Boss)
    // Flapping Crystalline Dragon Wings
    const wingLift = Math.floor(Math.sin(time * 9) * 6);
    const wingX = boss.facing === -1 ? px + 22 : px + 8;
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(wingX, py - 10 + wingLift, 32, 24);
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(wingX + 4, py - 6 + wingLift, 24, 16);

    // Armored Frost Scales Body
    ctx.fillStyle = isVulnerable ? '#fde047' : '#0369a1';
    ctx.fillRect(px + 8, py + 14, w - 16, h - 22);
    ctx.fillStyle = isVulnerable ? '#fef9c3' : '#38bdf8';
    ctx.fillRect(px + 12, py + 18, w - 24, h - 30);

    // Spiked Ice Tail
    const tailX = boss.facing === -1 ? px + w - 12 : px - 8;
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(tailX, py + 30, 18, 12);
    ctx.fillStyle = '#f0f9ff';
    ctx.fillRect(tailX + (boss.facing === -1 ? 10 : 0), py + 24, 8, 8);

    // Dragon Head, Jaws & Crystal Horns
    const headX = boss.facing === -1 ? px - 4 : px + w - 24;
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(headX, py + 4, 28, 24);
    // Twin Crystalline Frost Horns
    ctx.fillStyle = '#f0f9ff';
    ctx.fillRect(headX + 4, py - 10, 6, 14);
    ctx.fillRect(headX + 16, py - 12, 6, 16);
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(headX + 6, py - 8, 4, 10);

    // Glowing Frost Dragon Eyes & Open Freezing Jaws
    ctx.fillStyle = isVulnerable ? '#f59e0b' : '#e0f2fe';
    ctx.fillRect(headX + (boss.facing === -1 ? 4 : 16), py + 10, 8, 6);
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(headX + (boss.facing === -1 ? 6 : 18), py + 12, 4, 4);
    if (boss.phase === 'FIRE_BREATH') {
      const breathX = boss.facing === -1 ? headX - 18 : headX + 28;
      ctx.fillStyle = '#7dd3fc';
      ctx.fillRect(breathX, py + 16, 18, 10);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(breathX + 4, py + 18, 10, 6);
    }

    // Dragon Claws
    ctx.fillStyle = '#0c4a6e';
    ctx.fillRect(px + 10, py + h - 10 + step * 2, 16, 10);
    ctx.fillRect(px + w - 26, py + h - 10 + (1 - step) * 2, 16, 10);

    if (isVulnerable) {
      const starOffset = Math.floor(Math.sin(time * 10) * 10);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(px + 20 + starOffset, py - 24, 8, 8);
      ctx.fillRect(px + 36 - starOffset, py - 24, 8, 8);
    }
    return;
  }

  if (boss.name.includes('Solkar')) {
    // SOLKAR, THE SAND TITAN (Giant Armored Desert Scorpion Boss)
    // Segmented Golden-Chitin Carapace
    ctx.fillStyle = isVulnerable ? '#fde047' : '#92400e';
    ctx.fillRect(px + 6, py + 18, w - 12, h - 26);
    ctx.fillStyle = isVulnerable ? '#fef9c3' : '#d97706';
    ctx.fillRect(px + 10, py + 22, w - 20, h - 34);
    // Chitin Armor Ribs
    ctx.fillStyle = '#78350f';
    ctx.fillRect(px + 20, py + 20, 4, h - 30);
    ctx.fillRect(px + 32, py + 20, 4, h - 30);
    ctx.fillRect(px + 44, py + 20, 4, h - 30);

    // Towering Arched Scorpion Tail & Glowing Venom Stinger
    const tailBaseX = boss.facing === -1 ? px + w - 18 : px + 6;
    const stingerX = boss.facing === -1 ? px + 10 : px + w - 24;
    const tailSway = Math.floor(Math.sin(time * 7) * 3);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(tailBaseX, py + 2, 12, 18);
    ctx.fillRect(px + 22, py - 10 + tailSway, 20, 12);
    ctx.fillStyle = isVulnerable ? '#38bdf8' : '#ef4444';
    ctx.fillRect(stingerX, py - 8 + tailSway, 14, 12);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(stingerX + 4, py - 4 + tailSway, 6, 4);

    // Scorpion Head & Heavy Crushing Pincer Claws
    const headX = boss.facing === -1 ? px : px + w - 26;
    const clawX = boss.facing === -1 ? px - 12 : px + w - 6;
    ctx.fillStyle = '#78350f';
    ctx.fillRect(headX, py + 16, 26, 24);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(clawX, py + 22 + step * 3, 18, 14);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(clawX + (boss.facing === -1 ? 0 : 10), py + 26 + step * 3, 8, 4);

    // Glowing Ruby Eyes
    ctx.fillStyle = isVulnerable ? '#38bdf8' : '#fef08a';
    ctx.fillRect(headX + (boss.facing === -1 ? 4 : 14), py + 22, 8, 6);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(headX + (boss.facing === -1 ? 5 : 16), py + 24, 4, 4);

    // Arachnid Walking Legs
    ctx.fillStyle = '#451a03';
    for (let i = 0; i < 4; i++) {
      const lx = px + 8 + i * 14;
      const legLift = (i + step) % 2 === 0 ? 0 : 3;
      ctx.fillRect(lx, py + h - 10 + legLift, 8, 10 - legLift);
    }

    if (isVulnerable) {
      const starOffset = Math.floor(Math.sin(time * 10) * 10);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(px + 20 + starOffset, py - 24, 8, 8);
      ctx.fillRect(px + 36 - starOffset, py - 24, 8, 8);
    }
    return;
  }

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

export function drawSandstormOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  windActive: boolean
) {
  // Warm golden sandstorm atmospheric veil
  ctx.fillStyle = windActive ? 'rgba(217, 119, 6, 0.22)' : 'rgba(245, 158, 11, 0.12)';
  ctx.fillRect(0, 0, width, height);

  // Swirling high-velocity sand streaks across viewport
  const speed = windActive ? 540 : 260;
  for (let i = 0; i < 36; i++) {
    const sx = width - (((time * speed + i * 97) % (width + 80)) - 40);
    const sy = ((i * 53 + Math.sin(time * 4 + i) * 18) % height + height) % height;
    const len = windActive ? 22 + (i % 3) * 10 : 12 + (i % 2) * 8;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(254, 240, 138, 0.65)' : 'rgba(251, 191, 36, 0.55)';
    ctx.fillRect(Math.floor(sx), Math.floor(sy), len, 3);
  }
}

export function drawBlizzardOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  isHeavyBlizzard: boolean,
  windActive: boolean
) {
  if (isHeavyBlizzard) {
    // Frosty whiteout mist during blizzard pass
    ctx.fillStyle = windActive ? 'rgba(186, 230, 253, 0.22)' : 'rgba(224, 242, 254, 0.11)';
    ctx.fillRect(0, 0, width, height);
  }

  const count = isHeavyBlizzard ? 42 : 22;
  const speedX = isHeavyBlizzard ? (windActive ? 460 : 220) : 70;
  const speedY = isHeavyBlizzard ? 160 : 85;

  for (let i = 0; i < count; i++) {
    const sx = width - (((time * speedX + i * 97) % (width + 60)) - 30);
    const sy = ((time * speedY + i * 67) % (height + 20)) - 10;
    const flakeW = isHeavyBlizzard && windActive ? 10 + (i % 3) * 4 : 4 + (i % 2) * 2;
    const flakeH = isHeavyBlizzard && windActive ? 3 : 4;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(186, 230, 253, 0.7)';
    ctx.fillRect(Math.floor(sx), Math.floor(sy), flakeW, flakeH);
  }
}

export function drawLavaGeyser(
  ctx: CanvasRenderingContext2D,
  col: number,
  baseRow: number,
  currentTopY: number,
  isWarning: boolean,
  time: number
) {
  const x = col * 32;
  const baseY = baseRow * 32;
  const flicker = Math.floor(time * 14) % 2 === 0;

  // Volcanic geyser vent rim at baseRow
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(x, baseY, 32, 10);
  ctx.fillStyle = isWarning || currentTopY < baseY ? '#f97316' : '#7f1d1d';
  ctx.fillRect(x + 4, baseY, 24, 6);

  if (isWarning && currentTopY >= baseY) {
    // Telegraph bubbling magma sparks before eruption
    const bubbleLift = Math.floor((time * 40) % 18);
    ctx.fillStyle = flicker ? '#fde047' : '#f97316';
    ctx.fillRect(x + 8, baseY - 6 - bubbleLift, 6, 6);
    ctx.fillRect(x + 18, baseY - 10 - ((bubbleLift + 8) % 16), 6, 6);
    return;
  }

  if (currentTopY < baseY) {
    const colH = baseY - currentTopY;
    // Outer crimson magma plume
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x + 3, Math.floor(currentTopY), 26, Math.ceil(colH) + 4);
    // Inner orange-gold molten core
    ctx.fillStyle = flicker ? '#f97316' : '#fbbf24';
    ctx.fillRect(x + 8, Math.floor(currentTopY) + 4, 16, Math.max(4, Math.ceil(colH)));
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x + 12, Math.floor(currentTopY) + 6, 8, Math.max(4, Math.ceil(colH) - 4));
    // Foaming eruption crown at top of geyser
    ctx.fillStyle = '#fde047';
    ctx.fillRect(x, Math.floor(currentTopY) - 4, 32, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 6, Math.floor(currentTopY) - 2, 20, 4);
  }
}

export function drawRisingLavaTide(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  width: number,
  tideTopY: number,
  bottomY: number,
  time: number
) {
  if (tideTopY >= bottomY) return;
  const startX = Math.floor(cameraX) - 16;
  const endX = Math.ceil(cameraX + width) + 16;
  const topY = Math.floor(tideTopY);
  const wave = Math.floor(time * 8) % 2;

  ctx.fillStyle = 'rgba(185, 28, 28, 0.88)';
  ctx.fillRect(startX, topY + 6, endX - startX, bottomY - topY);
  ctx.fillStyle = '#f97316';
  ctx.fillRect(startX, topY + 2, endX - startX, 10);
  ctx.fillStyle = '#fde047';
  for (let lx = startX - (startX % 32); lx < endX; lx += 32) {
    ctx.fillRect(lx + (wave ? 4 : 16), topY, 14, 4);
  }
}

export function drawVolcanicAshOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
) {
  // Subtle warm volcanic heat shimmer
  ctx.fillStyle = 'rgba(234, 88, 12, 0.07)';
  ctx.fillRect(0, 0, width, height);

  // Falling grey volcanic ash flakes & rising glowing orange embers
  for (let i = 0; i < 28; i++) {
    const isEmber = i % 3 === 0;
    const sx = ((i * 89 + Math.sin(time * 2 + i) * 24 - time * 35) % (width + 40) + (width + 40)) % (width + 40) - 20;
    const sy = isEmber
      ? height - (((time * 75 + i * 61) % (height + 20)) - 10)
      : ((time * 55 + i * 73) % (height + 20)) - 10;
    ctx.fillStyle = isEmber
      ? i % 2 === 0
        ? 'rgba(253, 224, 71, 0.85)'
        : 'rgba(249, 115, 22, 0.85)'
      : 'rgba(214, 211, 209, 0.55)';
    const sz = isEmber ? 3 : 4;
    ctx.fillRect(Math.floor(sx), Math.floor(sy), sz, sz);
  }
}

export function drawWindUpdraft(
  ctx: CanvasRenderingContext2D,
  startCol: number,
  endCol: number,
  minRow: number,
  maxRow: number,
  time: number
) {
  const x = startCol * 32;
  const w = (endCol - startCol + 1) * 32;
  const topY = minRow * 32;
  const bottomY = maxRow * 32;
  const h = Math.max(32, bottomY - topY);

  // Subtle vertical shimmering wind column
  ctx.fillStyle = 'rgba(186, 230, 253, 0.14)';
  ctx.fillRect(x, topY, w, h);

  // Rising golden-white wind stream ribbons
  const streamCount = Math.max(3, Math.floor(w / 24));
  for (let i = 0; i < streamCount; i++) {
    const sx = x + 10 + i * Math.floor((w - 16) / Math.max(1, streamCount - 1)) + Math.floor(Math.sin(time * 6 + i) * 4);
    const travel = ((time * 240 + i * 73) % h);
    const sy = Math.floor(bottomY - travel);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.72)' : 'rgba(254, 240, 138, 0.65)';
    ctx.fillRect(sx, sy, 3, 22);
    ctx.fillRect(sx - 2, sy + 6, 2, 10);
  }
}

export function drawLightningStrike(
  ctx: CanvasRenderingContext2D,
  col: number,
  topRow: number,
  bottomRow: number,
  state: 'IDLE' | 'WARNING' | 'STRIKE',
  time: number
) {
  const x = col * 32;
  const topY = topRow * 32;
  const bottomY = bottomRow * 32;
  const flicker = Math.floor(time * 18) % 2 === 0;

  // Storm cloud node at topRow
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x - 4, topY, 40, 14);
  ctx.fillStyle = state !== 'IDLE' ? '#38bdf8' : '#475569';
  ctx.fillRect(x + 2, topY + 4, 28, 8);

  if (state === 'WARNING') {
    // Telegraph crackling static sparks & target column indicator before bolt strikes
    ctx.fillStyle = flicker ? '#fde047' : '#38bdf8';
    ctx.fillRect(x + 8, topY + 14, 16, 8);
    for (let ry = topY + 28; ry < bottomY; ry += 36) {
      ctx.fillStyle = flicker ? 'rgba(253, 224, 71, 0.45)' : 'rgba(56, 189, 248, 0.45)';
      ctx.fillRect(x + 14, ry, 4, 14);
    }
    return;
  }

  if (state === 'STRIKE') {
    const segs = Math.max(2, Math.floor((bottomY - topY) / 24));
    const segH = (bottomY - topY) / segs;
    for (let s = 0; s < segs; s++) {
      const sy = Math.floor(topY + s * segH);
      const zig = (s % 2 === 0 ? -4 : 4) * (flicker ? 1 : -1);
      // Outer electric cyan glow
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x + 6 + zig, sy, 20, Math.ceil(segH) + 2);
      // Inner golden-white lightning core
      ctx.fillStyle = flicker ? '#fde047' : '#ffffff';
      ctx.fillRect(x + 11 + zig, sy, 10, Math.ceil(segH) + 2);
    }
    // Impact shock burst at bottomRow
    ctx.fillStyle = '#fde047';
    ctx.fillRect(x, bottomY - 8, 32, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 6, bottomY - 6, 20, 6);
  }
}

export function drawStormSkiesOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  windActive: boolean
) {
  // Subtle tempest atmosphere tint
  ctx.fillStyle = windActive ? 'rgba(15, 23, 42, 0.18)' : 'rgba(30, 41, 59, 0.1)';
  ctx.fillRect(0, 0, width, height);

  // Diagonal wind-driven rain & electric wind streaks
  const speedX = windActive ? 480 : 250;
  const speedY = 260;
  for (let i = 0; i < 34; i++) {
    const sx = width - (((time * speedX + i * 97) % (width + 60)) - 30);
    const sy = ((time * speedY + i * 67) % (height + 20)) - 10;
    const isWindGust = i % 4 === 0;
    ctx.fillStyle = isWindGust
      ? 'rgba(254, 240, 138, 0.55)'
      : 'rgba(186, 230, 253, 0.6)';
    ctx.fillRect(Math.floor(sx), Math.floor(sy), isWindGust ? 18 : 8, 2);
  }
}

export function drawSteamVent(
  ctx: CanvasRenderingContext2D,
  col: number,
  baseRow: number,
  currentTopY: number,
  isWarning: boolean,
  time: number
) {
  const x = col * 32;
  const baseY = baseRow * 32;
  const flicker = Math.floor(time * 16) % 2 === 0;

  // Brass & Steel Steam Nozzle at baseRow
  ctx.fillStyle = '#451a03';
  ctx.fillRect(x + 2, baseY - 6, 28, 10);
  ctx.fillStyle = isWarning || currentTopY < baseY ? '#38bdf8' : '#d97706';
  ctx.fillRect(x + 6, baseY - 4, 20, 6);

  if (isWarning && currentTopY >= baseY) {
    // Telegraph hissing blue-white steam puffs before jet erupts
    const puffLift = Math.floor((time * 42) % 16);
    ctx.fillStyle = flicker ? '#e0f2fe' : '#38bdf8';
    ctx.fillRect(x + 8, baseY - 12 - puffLift, 6, 6);
    ctx.fillRect(x + 18, baseY - 14 - ((puffLift + 8) % 14), 6, 6);
    return;
  }

  if (currentTopY < baseY) {
    const colH = baseY - currentTopY;
    // Pressurized Steam & Blue Temporal Energy Column
    ctx.fillStyle = 'rgba(56, 189, 248, 0.78)';
    ctx.fillRect(x + 4, Math.floor(currentTopY), 24, Math.ceil(colH));
    ctx.fillStyle = flicker ? '#f0f9ff' : '#bae6fd';
    ctx.fillRect(x + 9, Math.floor(currentTopY) + 2, 14, Math.max(4, Math.ceil(colH) - 4));
    // Billowing steam cap at top
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 2, Math.floor(currentTopY) - 4, 28, 8);
  }
}

export function drawCrusherPiston(
  ctx: CanvasRenderingContext2D,
  col: number,
  topRow: number,
  currentBottomY: number,
  isWarning: boolean,
  time: number
) {
  const x = col * 32;
  const topY = topRow * 32;
  const bottomY = Math.floor(currentBottomY);
  const headH = 26;
  const shaftH = Math.max(8, bottomY - topY - headH);
  const shakeX = isWarning ? (Math.floor(time * 40) % 2 === 0 ? -2 : 2) : 0;

  // Hydraulic Steel Piston Shaft
  ctx.fillStyle = '#334155';
  ctx.fillRect(x + 9 + shakeX, topY, 14, shaftH);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(x + 12 + shakeX, topY, 5, shaftH);

  // Heavy Bronze & Steel Crusher Block Head
  const headY = bottomY - headH;
  ctx.fillStyle = '#451a03';
  ctx.fillRect(x + shakeX, headY, 32, headH);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(x + 2 + shakeX, headY + 2, 28, headH - 8);
  ctx.fillStyle = isWarning ? '#ef4444' : '#38bdf8';
  ctx.fillRect(x + 6 + shakeX, headY + 8, 20, 5);

  // Serrated Crusher Teeth on Bottom
  ctx.fillStyle = '#cbd5e1';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(x + 2 + i * 7 + shakeX, bottomY - 5, 5, 5);
  }
}

export function drawSwingingPendulum(
  ctx: CanvasRenderingContext2D,
  pivotCol: number,
  pivotRow: number,
  lengthPx: number,
  angleRad: number,
  time: number
) {
  const pivotX = pivotCol * 32 + 16;
  const pivotY = pivotRow * 32 + 16;
  const bobX = Math.floor(pivotX + Math.sin(angleRad) * lengthPx);
  const bobY = Math.floor(pivotY + Math.cos(angleRad) * lengthPx);

  // Brass Pivot Mount
  ctx.fillStyle = '#78350f';
  ctx.fillRect(pivotX - 10, pivotY - 10, 20, 20);
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(pivotX - 6, pivotY - 6, 12, 12);

  // Pendulum Rod Segments
  const steps = 14;
  for (let s = 1; s < steps; s++) {
    const t = s / steps;
    const rx = Math.floor(pivotX + Math.sin(angleRad) * (lengthPx * t) - 3);
    const ry = Math.floor(pivotY + Math.cos(angleRad) * (lengthPx * t) - 3);
    ctx.fillStyle = s % 2 === 0 ? '#d97706' : '#92400e';
    ctx.fillRect(rx, ry, 6, 6);
  }

  // Giant Bladed Brass & Glowing Blue Pendulum Bob (Radius ~20px)
  const pulse = Math.floor(time * 12) % 2 === 0;
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(bobX - 22, bobY - 6, 44, 12);
  ctx.fillRect(bobX - 6, bobY - 22, 12, 44);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(bobX - 18, bobY - 18, 36, 36);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(bobX - 14, bobY - 14, 28, 28);
  ctx.fillStyle = pulse ? '#38bdf8' : '#fef08a';
  ctx.fillRect(bobX - 7, bobY - 7, 14, 14);
}

export function drawTeleporterPad(
  ctx: CanvasRenderingContext2D,
  col: number,
  row: number,
  isDestination: boolean,
  time: number
) {
  const x = col * 32;
  const y = row * 32;
  const pulse = Math.floor(time * 10) % 2 === 0;

  // Brass & Dark Steel Base Pad on floor
  ctx.fillStyle = '#451a03';
  ctx.fillRect(x, y - 6, 32, 8);
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(x + 4, y - 6, 24, 4);

  // Shimmering Vertical Temporal Energy Beam
  ctx.fillStyle = isDestination
    ? 'rgba(251, 191, 36, 0.25)'
    : 'rgba(56, 189, 248, 0.32)';
  ctx.fillRect(x + 4, y - 44, 24, 38);

  const ringOffset = Math.floor((time * 36) % 28);
  ctx.fillStyle = isDestination
    ? pulse
      ? '#fef08a'
      : '#f59e0b'
    : pulse
    ? '#bae6fd'
    : '#38bdf8';
  ctx.fillRect(x + 6, y - 10 - ringOffset, 20, 4);
  ctx.fillRect(x + 8, y - 10 - ((ringOffset + 14) % 28), 16, 3);
}

export function drawWarpPipePrompt(
  ctx: CanvasRenderingContext2D,
  col: number,
  topRow: number,
  label: string,
  time: number
) {
  const cx = col * 32 + 32;
  const bob = Math.floor(Math.sin(time * 6) * 4);
  const py = topRow * 32 - 22 + bob;

  // Glowing Blue/Gold Arrow & Label above Concealed Entrance / Exit Pipe
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(cx - 8, py - 2, 16, 12);
  ctx.fillStyle = '#fde047';
  ctx.fillRect(cx - 6, py, 12, 4);
  ctx.fillRect(cx - 4, py + 4, 8, 4);
  ctx.fillRect(cx - 2, py + 8, 4, 3);

  ctx.font = 'bold 9px "Press Start 2P", monospace';
  const textW = ctx.measureText(label).width;
  ctx.fillStyle = '#0f172a';
  ctx.fillText(label, Math.floor(cx - textW / 2) + 1, py - 7);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(label, Math.floor(cx - textW / 2), py - 8);
}

export function drawGoldenKey(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number
) {
  const bob = Math.floor(Math.sin(time * 6) * 4);
  const kx = Math.floor(x);
  const ky = Math.floor(y + bob);
  const sparkle = Math.floor(time * 10) % 2 === 0;

  // Radiant Aura Glow
  ctx.fillStyle = 'rgba(253, 224, 71, 0.25)';
  ctx.fillRect(kx - 4, ky - 4, 32, 32);

  // Ornate Bow (Top Ring of Golden Key)
  ctx.fillStyle = '#92400e';
  ctx.fillRect(kx + 4, ky, 16, 12);
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(kx + 6, ky + 2, 12, 8);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(kx + 9, ky + 4, 6, 4);

  // Key Shaft & Teeth
  ctx.fillStyle = '#92400e';
  ctx.fillRect(kx + 9, ky + 12, 6, 14);
  ctx.fillRect(kx + 15, ky + 16, 6, 4);
  ctx.fillRect(kx + 15, ky + 22, 6, 4);

  ctx.fillStyle = sparkle ? '#fef08a' : '#fbbf24';
  ctx.fillRect(kx + 10, ky + 12, 4, 13);
  ctx.fillRect(kx + 14, ky + 17, 5, 2);
  ctx.fillRect(kx + 14, ky + 23, 5, 2);
}

export function drawLockedMechanicalDoor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  unlockState: 'LOCKED' | 'UNLOCKING' | 'UNLOCKED',
  unlockProgress: number,
  time: number
) {
  const dx = Math.floor(x);
  const dy = Math.floor(y);
  const w = 64; // 2 tiles wide
  const h = 96; // 3 tiles tall (sits flush on Row 16 ground when goalY = 13 * 32)
  const pulse = Math.floor(time * 8) % 2 === 0;

  // Heavy Bronze & Dark Steel Outer Archway Frame
  ctx.fillStyle = '#451a03';
  ctx.fillRect(dx - 6, dy - 8, w + 12, h + 8);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(dx - 4, dy - 6, w + 8, 8);
  ctx.fillRect(dx - 4, dy, 6, h);
  ctx.fillRect(dx + w - 2, dy, 6, h);

  // Interior Glowing Temporal Portal (Visible as the blast doors slide open!)
  ctx.fillStyle = '#090d16';
  ctx.fillRect(dx + 2, dy + 2, w - 4, h - 2);
  ctx.fillStyle = pulse ? '#38bdf8' : '#0284c7';
  ctx.fillRect(dx + 8, dy + 8, w - 16, h - 8);
  ctx.fillStyle = '#e0f2fe';
  ctx.fillRect(dx + 18, dy + 18, w - 36, h - 18);

  // Sliding Mechanical Blast Door Shutters (0 = closed, 1 = fully retracted)
  const openFraction =
    unlockState === 'UNLOCKED' ? 1 : unlockState === 'UNLOCKING' ? unlockProgress : 0;
  const shutterW = Math.max(0, Math.floor(((w - 4) / 2) * (1 - openFraction)));

  if (shutterW > 0) {
    // Left Blast Shutter
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(dx + 2, dy + 2, shutterW, h - 2);
    ctx.fillStyle = '#475569';
    ctx.fillRect(dx + 4, dy + 6, Math.max(0, shutterW - 4), h - 10);

    // Right Blast Shutter
    const rightX = dx + w - 2 - shutterW;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(rightX, dy + 2, shutterW, h - 2);
    ctx.fillStyle = '#475569';
    ctx.fillRect(rightX + 2, dy + 6, Math.max(0, shutterW - 4), h - 10);

    // Central Golden Gear Lock & Keyhole Emblem when Locked or Unlocking
    const centerX = dx + Math.floor(w / 2);
    const centerY = dy + Math.floor(h / 2);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(centerX - 14, centerY - 14, 28, 28);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(centerX - 11, centerY - 11, 22, 22);
    // Keyhole slot
    ctx.fillStyle = unlockState === 'UNLOCKING' ? '#38bdf8' : '#0f172a';
    ctx.fillRect(centerX - 4, centerY - 6, 8, 8);
    ctx.fillRect(centerX - 2, centerY + 2, 4, 6);
  }

  // Status Banner above Door
  ctx.font = 'bold 9px "Press Start 2P", monospace';
  const statusText =
    unlockState === 'UNLOCKED'
      ? 'EXIT OPEN!'
      : unlockState === 'UNLOCKING'
      ? 'UNLOCKING...'
      : 'KEY REQUIRED';
  const tw = ctx.measureText(statusText).width;
  ctx.fillStyle = '#0f172a';
  ctx.fillText(statusText, Math.floor(dx + w / 2 - tw / 2) + 1, dy - 13);
  ctx.fillStyle = unlockState === 'LOCKED' ? '#fbbf24' : '#34d399';
  ctx.fillText(statusText, Math.floor(dx + w / 2 - tw / 2), dy - 14);
}

export function drawChronosHudKeyBadge(
  ctx: CanvasRenderingContext2D,
  hasKey: boolean,
  inHiddenRoom: boolean,
  time: number
) {
  const bx = 14;
  const by = 12;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(bx, by, 178, 28);
  ctx.fillStyle = hasKey ? '#fbbf24' : '#475569';
  ctx.fillRect(bx, by, 178, 2);
  ctx.fillRect(bx, by + 26, 178, 2);

  // Mini Key Icon
  ctx.fillStyle = hasKey ? '#fbbf24' : '#64748b';
  ctx.fillRect(bx + 10, by + 8, 10, 10);
  ctx.fillRect(bx + 20, by + 11, 10, 4);
  ctx.fillRect(bx + 26, by + 15, 3, 3);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(bx + 13, by + 11, 4, 4);

  ctx.font = 'bold 9px "Press Start 2P", monospace';
  const label = hasKey ? 'KEY: COLLECTED' : inHiddenRoom ? 'FIND GOLD KEY!' : 'KEY: MISSING';
  ctx.fillStyle = hasKey ? '#fde047' : Math.floor(time * 4) % 2 === 0 ? '#cbd5e1' : '#94a3b8';
  ctx.fillText(label, bx + 38, by + 18);
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

