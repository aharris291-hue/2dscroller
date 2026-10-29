// Painted world art: parallax backgrounds, per-level terrain, and props.

import { TILE, VIEW_W, VIEW_H } from '../config.js';
import {
  rng, canvas, rgba, mix, darken, lighten, wash, blobPoints, granulate, glow,
  skyGradient, paperCanvas, addTexture, addSheet, tracePoly, wobble,
} from './paint.js';
import { INK, drawMossback } from './characters.js';

export const THEMES = {
  village: {
    sky: [[0, '#463f72'], [0.45, '#b06a78'], [0.8, '#f0a86a'], [1, '#f6c98a']],
    sun: { x: 0.7, y: 0.78, r: 70, color: '#ffd9a0' },
    clouds: '#f6c1a0', far: '#8a6f8f', mid: '#5f4a6a', near: '#2d2233',
    soil: '#7a5238', grass: ['#c4c46a', '#8fa64e', '#5f7f3e'], rock: '#9a8c84', wood: '#a8743f',
    midKind: 'village', hearth: true, fog: '#b9aec4', light: '#ffd29a', particle: 0xffd27a,
  },
  woods: {
    sky: [[0, '#8fbcc0'], [0.5, '#cfe2c6'], [1, '#f3ebc4']],
    sun: { x: 0.25, y: 0.15, r: 90, color: '#fff6d8' },
    clouds: '#ffffff', far: '#9db8a8', mid: '#5f8466', near: '#2a3f30',
    soil: '#6b4a35', grass: ['#a8d870', '#6fa64c', '#4a7a3a'], rock: '#8a9488', wood: '#9a6a40',
    midKind: 'cedars', hearth: true, fog: '#c8d0cc', light: '#fff4c0', particle: 0xfff3a0,
  },
  caves: {
    sky: [[0, '#1c1630'], [1, '#3a2d58']],
    sun: null, clouds: null, far: '#3a3058', mid: '#2a2244', near: '#140f22',
    soil: '#4a3e62', grass: ['#9a8ae0', '#7262c4', '#54489a'], rock: '#6a6488', wood: '#8f6a4a',
    midKind: 'crystals', hearth: false, fog: '#6a6088', light: '#a8e0ff', particle: 0x9fd8ff,
  },
  cliffs: {
    sky: [[0, '#5a3a6a'], [0.5, '#e07a5a'], [1, '#ffcf8a']],
    sun: { x: 0.3, y: 0.7, r: 80, color: '#ffe0a0' },
    clouds: '#ffb48a', far: '#a06070', mid: '#6a3a50', near: '#2e1a28',
    soil: '#7a4a48', grass: ['#f0c070', '#c98a48', '#94603a'], rock: '#a08088', wood: '#a8743f',
    midKind: 'cliffs', hearth: true, fog: '#d0a8a8', light: '#ffd8a0', particle: 0xffc070,
  },
  heart: {
    sky: [[0, '#1a0a10'], [1, '#4a1424']],
    sun: null, clouds: null, far: '#3a1420', mid: '#260a14', near: '#12060a',
    soil: '#4a2830', grass: ['#ff9a5a', '#d9583a', '#a3382a'], rock: '#6e4a52', wood: '#8f5a3a',
    midKind: 'roots', hearth: false, fog: '#8a7a80', light: '#ffb070', particle: 0xff8a4a,
  },
};

// ------------------------------------------------------------------ backgrounds

const BW = VIEW_W, BH = VIEW_H;

/** Draw something at x and its horizontal wrap-arounds so the layer tiles. */
function wrapped(x, w, fn) {
  for (const off of [-BW, 0, BW]) if (x + off + w > 0 && x + off - w < BW) fn(x + off);
}

function paintSky(th, seed) {
  const c = canvas(BW, BH), ctx = c.getContext('2d'), rand = rng(seed);
  skyGradient(ctx, BW, BH, th.sky, rand);
  if (th.sun) {
    const { x, y, r, color } = th.sun;
    glow(ctx, x * BW, y * BH, r * 4, color, 0.45);
    wash(ctx, blobPoints(x * BW, y * BH, r, r, rand, 0.04, 24), color, rand, { layers: 5, alpha: 0.5, edge: 0.1, amp: 2 });
  } else {
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = rgba('#ffffff', rand() * 0.5);
      ctx.fillRect(rand() * BW, rand() * BH, 2, 2);
    }
  }
  if (th.clouds) {
    for (let i = 0; i < 9; i++) {
      const cx = rand() * BW, cy = 40 + rand() * BH * 0.4, w = 120 + rand() * 200;
      for (let k = 0; k < 4; k++) {
        wash(ctx, blobPoints(cx + (k - 1.5) * w * 0.3, cy + rand() * 14, w * 0.32, 24 + rand() * 18, rand, 0.2), th.clouds, rand, { layers: 3, alpha: 0.12, edge: 0.04, amp: 6 });
      }
    }
  }
  granulate(ctx, 0, 0, BW, BH, '#2a1a20', rand, 0.0025, 0.12);
  return c;
}

function paintFar(th, seed) {
  const c = canvas(BW, BH), ctx = c.getContext('2d'), rand = rng(seed);
  // two mountain ranges, the farther one paler (atmospheric perspective)
  for (const [depth, base, col] of [[0, 0.5, lighten(th.far, 0.35)], [1, 0.6, th.far]]) {
    const k1 = 2 + depth, k2 = 5 + depth * 2, p1 = rand() * 6, p2 = rand() * 6;
    const pts = [[-20, BH + 20]];
    for (let x = -20; x <= BW + 20; x += 16) {
      const y = BH * base - 70 * Math.sin((x / BW) * Math.PI * 2 * k1 + p1) - 28 * Math.sin((x / BW) * Math.PI * 2 * k2 + p2);
      pts.push([x, y]);
    }
    pts.push([BW + 20, BH + 20]);
    wash(ctx, pts, col, rand, { layers: 4, alpha: 0.35, edge: 0.25, amp: 3 });
  }
  if (th.hearth) {
    // The Great Hearth: a vast tree glowing on the horizon, seen from every outdoor level.
    const hx = BW * 0.62, hy = BH * 0.56;
    glow(ctx, hx, hy - 170, 300, th.light, 0.4);
    const bark = mix(th.far, '#3a2430', 0.35);
    wash(ctx, [[hx - 40, hy + 60], [hx - 18, hy - 120], [hx - 50, hy - 170], [hx - 8, hy - 150], [hx + 10, hy - 180], [hx + 16, hy - 120], [hx + 44, hy + 60]], bark, rand, { layers: 4, alpha: 0.45, edge: 0.3 });
    const crown = mix(th.far, th.light, 0.25);
    for (let i = 0; i < 12; i++) {
      const a = Math.PI + (i / 11) * Math.PI;
      wash(ctx, blobPoints(hx + Math.cos(a) * 120, hy - 190 + Math.sin(a) * 70, 70 + rand() * 30, 44 + rand() * 16, rand, 0.25), crown, rand, { layers: 3, alpha: 0.32, edge: 0.15 });
    }
    glow(ctx, hx, hy - 200, 90, '#ffd890', 0.55);
    // embers glimmering in the leaves
    for (let i = 0; i < 70; i++) {
      const a = Math.PI + rand() * Math.PI, r = rand() * 150;
      glow(ctx, hx + Math.cos(a) * r * 1.3, hy - 180 + Math.sin(a) * r * 0.75, 3 + rand() * 4, '#ffcf7a', 0.9);
    }
  }
  return c;
}

function paintMid(th, seed) {
  const c = canvas(BW, BH), ctx = c.getContext('2d'), rand = rng(seed);
  const ground = BH * 0.72;
  const hill = [[-20, BH + 20]];
  for (let x = -20; x <= BW + 20; x += 20) hill.push([x, ground - 30 * Math.sin((x / BW) * Math.PI * 4 + 1) - 14 * Math.sin((x / BW) * Math.PI * 10)]);
  hill.push([BW + 20, BH + 20]);

  if (th.midKind === 'cedars') {
    for (let i = 0; i < 9; i++) {
      const x = (i / 9) * BW + rand() * 60, w = 26 + rand() * 30;
      const col = mix(th.mid, th.far, rand() * 0.4);
      wrapped(x, w * 4, (xx) => {
        wash(ctx, [[xx - w / 2, BH], [xx - w / 2.6, -20], [xx + w / 2.6, -20], [xx + w / 2, BH]], col, rand, { layers: 3, alpha: 0.4, edge: 0.3 });
        for (let k = 0; k < 4; k++) {
          const yy = 60 + k * 110 + rand() * 40;
          wash(ctx, blobPoints(xx + (rand() - 0.5) * 40, yy, 70 + rand() * 50, 40 + rand() * 20, rand, 0.25), darken(col, 0.05), rand, { layers: 2, alpha: 0.3, edge: 0.15 });
        }
      });
    }
    // light shafts
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) {
      const x = rand() * BW;
      const g = ctx.createLinearGradient(x, 0, x + 200, BH);
      g.addColorStop(0, 'rgba(255,250,210,0.10)'); g.addColorStop(1, 'rgba(255,250,210,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 50, 0); ctx.lineTo(x + 260, BH); ctx.lineTo(x + 170, BH); ctx.fill();
    }
    ctx.restore();
  }
  wash(ctx, hill, th.mid, rand, { layers: 4, alpha: 0.4, edge: 0.3 });

  if (th.midKind === 'village') {
    for (let i = 0; i < 6; i++) {
      const x = (i / 6) * BW + rand() * 80, y = ground - 10 + rand() * 20, w = 70 + rand() * 50, h = 50 + rand() * 30;
      wrapped(x, w, (xx) => {
        const wall = mix(th.mid, '#c9a08a', 0.25);
        wash(ctx, [[xx - w / 2, y], [xx - w / 2, y - h], [xx + w / 2, y - h], [xx + w / 2, y]], wall, rand, { layers: 3, alpha: 0.5 });
        wash(ctx, [[xx - w / 2 - 12, y - h + 4], [xx, y - h - 40], [xx + w / 2 + 12, y - h + 4]], darken(th.mid, 0.2), rand, { layers: 3, alpha: 0.5 });
        for (let k = 0; k < 2; k++) {
          const wx = xx - w / 4 + k * w / 2.4;
          glow(ctx, wx, y - h / 2, 22, '#ffcf7a', 0.5);
          ctx.fillStyle = rgba('#ffd890', 0.85);
          ctx.fillRect(wx - 6, y - h / 2 - 7, 12, 14);
        }
      });
    }
    // a windmill
    const mx = BW * 0.2, my = ground - 20;
    wash(ctx, [[mx - 22, my], [mx - 12, my - 120], [mx + 12, my - 120], [mx + 22, my]], darken(th.mid, 0.1), rand, { layers: 3, alpha: 0.5 });
    ctx.strokeStyle = rgba(darken(th.mid, 0.3), 0.7); ctx.lineWidth = 6;
    for (let k = 0; k < 4; k++) {
      const a = k * Math.PI / 2 + 0.4;
      ctx.beginPath(); ctx.moveTo(mx, my - 118); ctx.lineTo(mx + Math.cos(a) * 80, my - 118 + Math.sin(a) * 80); ctx.stroke();
    }
    // strings of festival lanterns
    for (let i = 0; i < 4; i++) {
      const x0 = rand() * BW, y0 = ground - 120 - rand() * 60, len = 200 + rand() * 120;
      ctx.strokeStyle = rgba(INK, 0.4); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x0 + len / 2, y0 + 40, x0 + len, y0); ctx.stroke();
      for (let k = 1; k < 7; k++) {
        const t = k / 7, lx = x0 + len * t, ly = y0 + 80 * t * (1 - t) + 8;
        glow(ctx, lx, ly, 16, '#ffb060', 0.6);
        ctx.fillStyle = rgba(k % 2 ? '#ff9a5a' : '#ffd06a', 0.9);
        ctx.beginPath(); ctx.ellipse(lx, ly, 5, 7, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
  }
  if (th.midKind === 'crystals' || th.midKind === 'roots') {
    for (let i = 0; i < 12; i++) {
      const x = rand() * BW, h = 80 + rand() * 160, w = 20 + rand() * 30;
      wrapped(x, w, (xx) => {
        const col = th.midKind === 'crystals' ? mix(th.mid, '#7ad0ff', 0.25) : mix(th.mid, '#ff8a4a', 0.1);
        wash(ctx, [[xx - w, ground + 30], [xx, ground - h], [xx + w, ground + 30]], col, rand, { layers: 3, alpha: 0.4 });
        wash(ctx, [[xx - w * 0.7 + 40, -10], [xx + 40, h * 0.7], [xx + w * 0.7 + 40, -10]], th.mid, rand, { layers: 3, alpha: 0.45 });
        if (th.midKind === 'crystals') glow(ctx, xx, ground - h * 0.4, 40, '#9fe0ff', 0.25);
      });
    }
  }
  if (th.midKind === 'cliffs') {
    for (let i = 0; i < 6; i++) {
      const x = rand() * BW, h = 200 + rand() * 260, w = 60 + rand() * 60;
      wrapped(x, w, (xx) => wash(ctx, [[xx - w, BH], [xx - w * 0.7, BH - h], [xx + w * 0.6, BH - h - 20], [xx + w, BH]], darken(th.mid, rand() * 0.2), rand, { layers: 3, alpha: 0.45 }));
    }
    for (let i = 0; i < 5; i++) {
      const kx = rand() * BW, ky = 80 + rand() * 200;
      ctx.strokeStyle = rgba(INK, 0.3); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(kx, ky); ctx.quadraticCurveTo(kx - 30, ky + 80, kx + 10, ky + 160); ctx.stroke();
      wash(ctx, [[kx, ky - 16], [kx + 12, ky], [kx, ky + 16], [kx - 12, ky]], rand() < 0.5 ? '#e8604a' : '#f0c060', rand, { layers: 2, alpha: 0.6 });
    }
  }
  return c;
}

function paintNear(th, seed) {
  // Dark foliage that frames the bottom of the screen and scrolls faster than the player.
  const c = canvas(BW, BH), ctx = c.getContext('2d'), rand = rng(seed);
  for (let i = 0; i < 22; i++) {
    const x = rand() * BW, y = BH - 10 + rand() * 30, r = 40 + rand() * 60;
    wrapped(x, r, (xx) => wash(ctx, blobPoints(xx, y, r, r * 0.6, rand, 0.25), th.near, rand, { layers: 2, alpha: 0.5, edge: 0.2 }));
  }
  for (let i = 0; i < 14; i++) {
    const x = rand() * BW, h = 30 + rand() * 60;
    wrapped(x, 20, (xx) => {
      ctx.strokeStyle = rgba(th.near, 0.8); ctx.lineWidth = 3 + rand() * 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(xx, BH + 5); ctx.quadraticCurveTo(xx + (rand() - 0.5) * 30, BH - h / 2, xx + (rand() - 0.5) * 50, BH - h); ctx.stroke();
    });
  }
  return c;
}

function paintFog(th, seed) {
  const c = canvas(BW, BH), ctx = c.getContext('2d'), rand = rng(seed);
  for (let i = 0; i < 30; i++) {
    const x = rand() * BW, y = BH * 0.3 + rand() * BH * 0.7, r = 120 + rand() * 200;
    wrapped(x, r, (xx) => {
      const g = ctx.createRadialGradient(xx, y, 0, xx, y, r);
      g.addColorStop(0, rgba(th.fog, 0.35)); g.addColorStop(1, rgba(th.fog, 0));
      ctx.fillStyle = g; ctx.fillRect(xx - r, y - r, r * 2, r * 2);
    });
  }
  return c;
}

export function ensureBackground(scene, name) {
  if (scene.textures.exists(`sky-${name}`)) return;
  const th = THEMES[name];
  const seed = name.length * 101;
  addTexture(scene, `sky-${name}`, paintSky(th, seed));
  addTexture(scene, `far-${name}`, paintFar(th, seed + 1));
  addTexture(scene, `mid-${name}`, paintMid(th, seed + 2));
  addTexture(scene, `near-${name}`, paintNear(th, seed + 3));
  addTexture(scene, `fog-${name}`, paintFog(th, seed + 4));
}

// ------------------------------------------------------------------ terrain

const SOLID = '#B';
const CHUNK = 1024;

function isSolid(grid, c, r) {
  if (r < 0) return false;
  if (r >= grid.length) return true;
  if (c < 0 || c >= grid[0].length) return true;
  return SOLID.includes(grid[r][c]);
}

/**
 * Paint a level's static scenery into chunked textures.
 * Returns { back: [{key,x}] }.
 */
export function paintTerrain(scene, level, th) {
  const { grid, deco = [] } = level;
  const rows = grid.length, cols = grid[0].length;
  const W = cols * TILE, H = rows * TILE;
  const out = { back: [] };
  const seed = level.id.length * 977 + cols;

  for (let cx = 0; cx < W; cx += CHUNK) {
    const cw = Math.min(CHUNK, W - cx);
    const c = canvas(cw, H), ctx = c.getContext('2d');
    const fctx = ctx; // tall grass tufts are painted straight onto the ground layer
    ctx.translate(-cx, 0);
    const c0 = Math.max(0, Math.floor(cx / TILE) - 3), c1 = Math.min(cols, Math.ceil((cx + cw) / TILE) + 3);

    // 1. decorations behind the ground
    for (const d of deco) {
      if (d.x * TILE < cx - 700 || d.x * TILE > cx + cw + 700) continue;
      paintDeco(ctx, d, th, rows);
    }
    paintAutoDeco(ctx, fctx, grid, th, c0, c1, seed);

    // 2. soil body, clipped to solid cells
    ctx.save();
    ctx.beginPath();
    for (let r = 0; r < rows; r++) for (let col = c0; col < c1; col++) {
      if (grid[r][col] === '#') ctx.rect(col * TILE - 0.5, r * TILE - 0.5, TILE + 1, TILE + 1);
    }
    ctx.clip();
    paintSoil(ctx, th, c0 * TILE, 0, (c1 - c0) * TILE, H, rng(seed + cx));
    ctx.restore();

    // 3. round off convex corners so the ground looks organic
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    for (let r = 0; r < rows; r++) for (let col = c0; col < c1; col++) {
      if (grid[r][col] !== '#') continue;
      const up = !isSolid(grid, col, r - 1), dn = !isSolid(grid, col, r + 1);
      const lf = !isSolid(grid, col - 1, r), rt = !isSolid(grid, col + 1, r);
      const R = 14, x = col * TILE, y = r * TILE;
      // erase the little square at a corner, leaving a quarter-circle curve
      const cut = (cxp, cyp, ox, oy) => {
        const ccx = cxp + ox * R, ccy = cyp + oy * R;
        const a1 = Math.atan2(-oy, 0), a2 = Math.atan2(0, -ox);
        let d = a2 - a1;
        while (d <= -Math.PI) d += Math.PI * 2;
        while (d > Math.PI) d -= Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(cxp, cyp); ctx.lineTo(ccx, cyp); ctx.arc(ccx, ccy, R, a1, a2, d < 0); ctx.closePath(); ctx.fill();
      };
      if (up && lf) cut(x, y, 1, 1);
      if (up && rt) cut(x + TILE, y, -1, 1);
      if (dn && lf) cut(x, y + TILE, 1, -1);
      if (dn && rt) cut(x + TILE, y + TILE, -1, -1);
    }
    ctx.restore();

    // 4. pooled-pigment edges on exposed faces, grass on top faces
    const rand = rng(seed + cx * 3);
    for (let r = 0; r < rows; r++) for (let col = c0; col < c1; col++) {
      const ch = grid[r][col];
      const x = col * TILE, y = r * TILE;
      if (ch === '#') {
        const edge = rgba(darken(th.soil, 0.5), 0.55);
        if (!isSolid(grid, col - 1, r)) inkEdge(ctx, x + 2, y + 6, x + 2, y + TILE - 6, edge, rand);
        if (!isSolid(grid, col + 1, r)) inkEdge(ctx, x + TILE - 2, y + 6, x + TILE - 2, y + TILE - 6, edge, rand);
        if (!isSolid(grid, col, r + 1)) {
          inkEdge(ctx, x + 6, y + TILE - 2, x + TILE - 6, y + TILE - 2, edge, rand);
          paintDrips(ctx, x, y + TILE, th, rand);
        }
        if (!isSolid(grid, col, r - 1)) paintGrass(ctx, fctx, x, y, th, rand, !isSolid(grid, col - 1, r), !isSolid(grid, col + 1, r));
      } else if (ch === 'B') {
        paintStone(ctx, x, y, th, rand);
      } else if (ch === '=') {
        paintPlank(ctx, x, y, th, rand, grid[r][col - 1] !== '=', grid[r][col + 1] !== '=');
      } else if (ch === '^') {
        paintThorns(ctx, x, y, th, rand);
      }
    }

    const key = `terrain-${level.id}-${cx}`;
    addTexture(scene, key, c);
    out.back.push({ key, x: cx });
  }
  return out;
}

function inkEdge(ctx, x1, y1, x2, y2, color, rand) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2 + rand() * 1.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1 + (rand() - 0.5) * 2, y1);
  ctx.quadraticCurveTo((x1 + x2) / 2 + (rand() - 0.5) * 3, (y1 + y2) / 2 + (rand() - 0.5) * 3, x2, y2);
  ctx.stroke();
}

function paintSoil(ctx, th, x, y, w, h, rand) {
  ctx.fillStyle = th.soil;
  ctx.fillRect(x, y, w, h);
  // layered washes give the soil a painted, uneven tone
  for (let i = 0; i < (w * h) / 9000; i++) {
    const px = x + rand() * w, py = y + rand() * h;
    const col = rand() < 0.5 ? darken(th.soil, 0.25) : lighten(th.soil, 0.15);
    ctx.fillStyle = rgba(col, 0.18);
    ctx.beginPath(); ctx.ellipse(px, py, 30 + rand() * 60, 12 + rand() * 24, rand() * 0.6 - 0.3, 0, Math.PI * 2); ctx.fill();
  }
  // strata lines
  ctx.strokeStyle = rgba(darken(th.soil, 0.35), 0.25);
  ctx.lineWidth = 1.5;
  for (let i = 0; i < (w * h) / 26000; i++) {
    const px = x + rand() * w, py = y + rand() * h, l = 30 + rand() * 60;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.quadraticCurveTo(px + l / 2, py + (rand() - 0.5) * 8, px + l, py); ctx.stroke();
  }
  // pebbles
  for (let i = 0; i < (w * h) / 12000; i++) {
    const px = x + rand() * w, py = y + rand() * h, r = 3 + rand() * 6;
    ctx.fillStyle = rgba(mix(th.rock, th.soil, 0.4), 0.85);
    ctx.beginPath(); ctx.ellipse(px, py, r, r * 0.7, rand(), 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = rgba(INK, 0.35); ctx.lineWidth = 1; ctx.stroke();
  }
  granulate(ctx, x, y, w, h, '#1a1020', rand, 0.006, 0.22);
}

function paintGrass(ctx, fctx, x, y, th, rand, openLeft, openRight) {
  const [gl, gm, gd] = th.grass;
  const x0 = x - (openLeft ? 4 : 0), x1 = x + TILE + (openRight ? 4 : 0);
  // a wash band of turf
  const band = [[x0, y - 2]];
  for (let px = x0; px <= x1; px += 8) band.push([px, y - 3 + rand() * 3]);
  for (let px = x1; px >= x0; px -= 8) band.push([px, y + 9 + rand() * 6]);
  wash(ctx, band, gm, rand, { layers: 3, alpha: 0.6, edge: 0.3, amp: 1.5 });
  // blades
  for (let i = 0; i < 16; i++) {
    const bx = x0 + rand() * (x1 - x0), h = 5 + rand() * 9, lean = (rand() - 0.5) * 8;
    ctx.strokeStyle = [gl, gm, gd][Math.floor(rand() * 3)];
    ctx.lineWidth = 1.5 + rand();
    ctx.beginPath(); ctx.moveTo(bx, y + 3); ctx.quadraticCurveTo(bx + lean / 2, y - h / 2, bx + lean, y - h); ctx.stroke();
  }
  // grass hanging over open edges
  for (const [open, ex, dir] of [[openLeft, x0, -1], [openRight, x1, 1]]) {
    if (!open) continue;
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = [gm, gd][i % 2];
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(ex - dir * 4, y + 4); ctx.quadraticCurveTo(ex + dir * 3, y + 6, ex + dir * (2 + rand() * 3), y + 10 + rand() * 12); ctx.stroke();
    }
  }
  // occasional flowers
  if (rand() < 0.25) {
    const fx = x + 8 + rand() * (TILE - 16), fy = y - 8 - rand() * 6;
    ctx.strokeStyle = gd; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(fx, y + 2); ctx.lineTo(fx, fy); ctx.stroke();
    const petal = ['#fff4e8', '#ffd0dc', '#ffe07a', '#c8b8ff'][Math.floor(rand() * 4)];
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      ctx.fillStyle = petal;
      ctx.beginPath(); ctx.ellipse(fx + Math.cos(a) * 3, fy + Math.sin(a) * 3, 2.6, 1.8, a, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#f0a040'; ctx.beginPath(); ctx.arc(fx, fy, 1.6, 0, Math.PI * 2); ctx.fill();
  }
  // tall tufts in front of the player for depth
  if (rand() < 0.12) {
    const tx = x + rand() * TILE;
    for (let i = 0; i < 7; i++) {
      fctx.strokeStyle = rgba([gm, gd][i % 2], 0.95);
      fctx.lineWidth = 2.5;
      const h = 16 + rand() * 16, lean = (rand() - 0.5) * 16;
      fctx.beginPath(); fctx.moveTo(tx + i * 2, y + 8); fctx.quadraticCurveTo(tx + i * 2 + lean / 2, y - h / 2, tx + i * 2 + lean, y - h); fctx.stroke();
    }
  }
}

function paintDrips(ctx, x, y, th, rand) {
  // roots and moss hanging from overhangs
  for (let i = 0; i < 3; i++) {
    if (rand() < 0.4) continue;
    const rx = x + 6 + rand() * (TILE - 12), l = 6 + rand() * 18;
    ctx.strokeStyle = rgba(rand() < 0.5 ? darken(th.soil, 0.3) : th.grass[2], 0.8);
    ctx.lineWidth = 1.5 + rand();
    ctx.beginPath(); ctx.moveTo(rx, y - 3); ctx.quadraticCurveTo(rx + (rand() - 0.5) * 8, y + l / 2, rx + (rand() - 0.5) * 6, y + l); ctx.stroke();
  }
}

function paintStone(ctx, x, y, th, rand) {
  const pts = [[x + 3, y + 5], [x + 8, y + 2], [x + TILE - 6, y + 3], [x + TILE - 2, y + 9], [x + TILE - 3, y + TILE - 3], [x + 4, y + TILE - 2], [x + 1, y + TILE / 2]];
  tracePoly(ctx, wobble(pts, 1.2, rand));
  ctx.fillStyle = th.rock; ctx.fill();
  ctx.save(); ctx.clip();
  const g = ctx.createLinearGradient(x, y, x + TILE, y + TILE);
  g.addColorStop(0, rgba(lighten(th.rock, 0.4), 0.6)); g.addColorStop(1, rgba(darken(th.rock, 0.4), 0.6));
  ctx.fillStyle = g; ctx.fillRect(x, y, TILE, TILE);
  granulate(ctx, x, y, TILE, TILE, '#1a1020', rand, 0.02, 0.3);
  // moss cap
  ctx.fillStyle = rgba(th.grass[1], 0.85);
  ctx.beginPath(); ctx.ellipse(x + TILE / 2, y + 2, TILE * 0.55, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  tracePoly(ctx, wobble(pts, 1.2, rand));
  ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.strokeStyle = rgba(INK, 0.5); ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x + 14, y + 16); ctx.lineTo(x + 22, y + 26); ctx.lineTo(x + 20, y + 34); ctx.stroke();
}

function paintPlank(ctx, x, y, th, rand, leftEnd, rightEnd) {
  const top = y + 2, h = 14;
  ctx.fillStyle = th.wood;
  ctx.fillRect(x - (leftEnd ? 0 : 1), top, TILE + (leftEnd || rightEnd ? 0 : 2), h);
  const g = ctx.createLinearGradient(0, top, 0, top + h);
  g.addColorStop(0, rgba(lighten(th.wood, 0.35), 0.8)); g.addColorStop(1, rgba(darken(th.wood, 0.4), 0.8));
  ctx.fillStyle = g; ctx.fillRect(x, top, TILE, h);
  ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x + TILE, top); ctx.moveTo(x, top + h); ctx.lineTo(x + TILE, top + h); ctx.stroke();
  if (leftEnd) { ctx.beginPath(); ctx.moveTo(x + 1, top); ctx.lineTo(x + 1, top + h); ctx.stroke(); }
  if (rightEnd) { ctx.beginPath(); ctx.moveTo(x + TILE - 1, top); ctx.lineTo(x + TILE - 1, top + h); ctx.stroke(); }
  ctx.strokeStyle = rgba(INK, 0.5); ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(x + 24, top + 2); ctx.lineTo(x + 24, top + h - 2); ctx.stroke();
  ctx.fillStyle = INK; ctx.fillRect(x + 8, top + 5, 2.5, 2.5); ctx.fillRect(x + 38, top + 5, 2.5, 2.5);
  // hanging ropes at the ends
  for (const [isEnd, ex] of [[leftEnd, x + 6], [rightEnd, x + TILE - 6]]) {
    if (!isEnd) continue;
    ctx.strokeStyle = rgba('#c9b08a', 0.9); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ex, top + h); ctx.quadraticCurveTo(ex + 3, top + h + 14, ex - 1, top + h + 26); ctx.stroke();
  }
  // a little moss
  if (rand() < 0.5) {
    ctx.fillStyle = rgba(th.grass[1], 0.8);
    ctx.beginPath(); ctx.ellipse(x + rand() * TILE, top + 1, 8, 3, 0, 0, Math.PI * 2); ctx.fill();
  }
}

function paintThorns(ctx, x, y, th, rand) {
  // a bramble of dark, curling vines with sharp thorns
  const base = y + TILE;
  ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    const sx = x + rand() * TILE, h = 18 + rand() * 20, curl = (rand() - 0.5) * 30;
    ctx.strokeStyle = '#3a2a3a'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(sx, base); ctx.bezierCurveTo(sx + curl, base - h * 0.5, sx - curl, base - h, sx + curl * 0.5, base - h); ctx.stroke();
    ctx.strokeStyle = '#6a4a6a'; ctx.lineWidth = 1.5; ctx.stroke();
    for (let k = 0; k < 4; k++) {
      const t = (k + 1) / 5, tx = sx + curl * 0.3 * Math.sin(t * 3), ty = base - h * t;
      const d = k % 2 ? 1 : -1;
      ctx.fillStyle = '#e8dcd0';
      ctx.beginPath(); ctx.moveTo(tx, ty - 2); ctx.lineTo(tx + d * 7, ty - 4); ctx.lineTo(tx, ty + 2); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
    }
  }
}

function paintAutoDeco(ctx, fctx, grid, th, c0, c1, seed) {
  // bushes and ferns sprinkled on open ground, behind the player
  const rows = grid.length;
  for (let col = c0; col < c1; col++) {
    const rand = rng(seed + col * 13);
    for (let r = 1; r < rows; r++) {
      if (grid[r][col] !== '#' || isSolid(grid, col, r - 1) || grid[r - 1][col] !== '.') continue;
      const roll = rand();
      const x = col * TILE + TILE / 2, y = r * TILE + 6;
      if (roll < 0.14) {
        const col2 = mix(th.grass[2], th.mid, 0.3);
        for (let k = 0; k < 3; k++) wash(ctx, blobPoints(x + (k - 1) * 16, y - 16 - rand() * 8, 22, 18, rand, 0.25), col2, rand, { layers: 2, alpha: 0.6, edge: 0.3 });
      } else if (roll < 0.22) {
        ctx.strokeStyle = th.grass[2]; ctx.lineWidth = 2;
        for (let k = 0; k < 6; k++) {
          const a = -Math.PI / 2 + (k - 2.5) * 0.35, l = 22 + rand() * 12;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a) * l * 0.6, y + Math.sin(a) * l, x + Math.cos(a) * l, y + Math.sin(a) * l * 0.7); ctx.stroke();
        }
      } else if (roll < 0.26) {
        wash(ctx, blobPoints(x, y - 8, 14, 10, rand, 0.2), th.rock, rand, { layers: 2, alpha: 0.8, edge: 0.6 });
      }
      break;
    }
  }
}

// Named decorations a level can place: houses, trees, the lantern tower, Mossback...
function paintDeco(ctx, d, th, rows) {
  const rand = rng(d.x * 7 + d.y);
  const x = d.x * TILE + TILE / 2, y = (rows - d.y) * TILE + 4; // y = ground surface it stands on
  switch (d.type) {
    case 'house': {
      const w = 190, h = 120;
      wash(ctx, [[x - w / 2, y], [x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2, y]], '#d9c0a0', rand, { layers: 3, alpha: 0.75, edge: 0.6 });
      wash(ctx, [[x - w / 2 - 24, y - h + 6], [x - 10, y - h - 70], [x + 10, y - h - 70], [x + w / 2 + 24, y - h + 6]], '#a8564a', rand, { layers: 3, alpha: 0.75, edge: 0.6 });
      wash(ctx, [[x - 18, y], [x - 18, y - 60], [x + 18, y - 60], [x + 18, y]], '#6a4a3a', rand, { layers: 2, alpha: 0.9 });
      for (const wx of [-60, 60]) {
        glow(ctx, x + wx, y - 70, 40, '#ffcf7a', 0.5);
        wash(ctx, [[x + wx - 16, y - 54], [x + wx - 16, y - 86], [x + wx + 16, y - 86], [x + wx + 16, y - 54]], '#ffd890', rand, { layers: 2, alpha: 0.9 });
      }
      break;
    }
    case 'tree': {
      const h = 220 + rand() * 120;
      wash(ctx, [[x - 18, y], [x - 12, y - h], [x + 12, y - h], [x + 22, y]], mix(th.wood, '#3a2a20', 0.4), rand, { layers: 3, alpha: 0.7, edge: 0.5 });
      for (let k = 0; k < 6; k++) {
        wash(ctx, blobPoints(x + (rand() - 0.5) * 120, y - h + (rand() - 0.3) * 80, 70 + rand() * 30, 50 + rand() * 20, rand, 0.25), mix(th.grass[2], th.mid, rand() * 0.5), rand, { layers: 2, alpha: 0.55, edge: 0.3 });
      }
      break;
    }
    case 'fence': {
      ctx.strokeStyle = INK; ctx.lineWidth = 2;
      for (let k = 0; k < 5; k++) {
        ctx.fillStyle = th.wood;
        ctx.fillRect(x - 96 + k * 48, y - 46, 10, 46); ctx.strokeRect(x - 96 + k * 48, y - 46, 10, 46);
      }
      ctx.fillStyle = th.wood;
      ctx.fillRect(x - 100, y - 36, 210, 7); ctx.strokeRect(x - 100, y - 36, 210, 7);
      ctx.fillRect(x - 100, y - 18, 210, 7); ctx.strokeRect(x - 100, y - 18, 210, 7);
      break;
    }
    case 'tower': {
      // the village lantern tower (top of the prologue)
      const h = 300;
      wash(ctx, [[x - 60, y], [x - 40, y - h], [x + 40, y - h], [x + 60, y]], '#b8a088', rand, { layers: 3, alpha: 0.8, edge: 0.6 });
      wash(ctx, [[x - 70, y - h], [x, y - h - 70], [x + 70, y - h]], '#7a4a40', rand, { layers: 3, alpha: 0.85, edge: 0.6 });
      wash(ctx, blobPoints(x, y - h + 40, 26, 30, rand, 0.05), d.lit ? '#ffd070' : '#5a6070', rand, { layers: 3, alpha: 0.9 });
      break;
    }
    case 'shrine': {
      ctx.fillStyle = '#b2523a'; ctx.strokeStyle = INK; ctx.lineWidth = 3;
      for (const px of [-40, 34]) { ctx.fillRect(x + px, y - 110, 9, 110); ctx.strokeRect(x + px, y - 110, 9, 110); }
      ctx.beginPath(); ctx.moveTo(x - 64, y - 110); ctx.lineTo(x + 66, y - 110); ctx.lineTo(x + 58, y - 124); ctx.lineTo(x - 56, y - 124); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillRect(x - 48, y - 94, 98, 8); ctx.strokeRect(x - 48, y - 94, 98, 8);
      break;
    }
    case 'statue': {
      // a small stone spirit, asleep
      wash(ctx, blobPoints(x, y - 22, 18, 22, rand, 0.08), '#a8aaa0', rand, { layers: 3, alpha: 0.85, edge: 0.7 });
      ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x - 6, y - 28, 3, 0.3, Math.PI - 0.3); ctx.arc(x + 6, y - 28, 3, 0.3, Math.PI - 0.3); ctx.stroke();
      ctx.fillStyle = rgba('#6f9a4a', 0.8);
      ctx.beginPath(); ctx.ellipse(x, y - 42, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'mossback': {
      drawMossback(ctx, x, y + 6, 1.4, { eyeOpen: 0 });
      break;
    }
    case 'bigtree': {
      const h = 520;
      wash(ctx, [[x - 60, y], [x - 34, y - h], [x + 34, y - h], [x + 70, y]], '#5a4434', rand, { layers: 4, alpha: 0.75, edge: 0.6 });
      for (let k = 0; k < 7; k++) {
        ctx.strokeStyle = rgba('#3a2a20', 0.5); ctx.lineWidth = 2;
        const lx = x - 30 + k * 10;
        ctx.beginPath(); ctx.moveTo(lx, y); ctx.quadraticCurveTo(lx + (rand() - 0.5) * 20, y - h / 2, lx, y - h); ctx.stroke();
      }
      break;
    }
    default:
  }
}

// ------------------------------------------------------------------ props

export function createPropTextures(scene) {
  // Paper grain, lightened so it can be multiplied over the whole screen.
  const grain = paperCanvas(512);
  const paper = canvas(512, 512), pctx = paper.getContext('2d');
  pctx.fillStyle = '#ffffff'; pctx.fillRect(0, 0, 512, 512);
  pctx.globalAlpha = 0.32; pctx.drawImage(grain, 0, 0);
  addTexture(scene, 'paper', paper);
  // A screen-sized version with a soft vignette baked in, so it costs one draw.
  const scr = canvas(VIEW_W, VIEW_H), sctx = scr.getContext('2d');
  for (let x = 0; x < VIEW_W; x += 512) for (let y = 0; y < VIEW_H; y += 512) sctx.drawImage(paper, x, y);
  const vg = sctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.45, VIEW_W / 2, VIEW_H / 2, VIEW_W * 0.75);
  vg.addColorStop(0, 'rgba(60,40,60,0)'); vg.addColorStop(1, 'rgba(60,40,60,0.45)');
  sctx.fillStyle = vg; sctx.fillRect(0, 0, VIEW_W, VIEW_H);
  addTexture(scene, 'paper-screen', scr);

  // Lantern post checkpoint: frame 0 unlit, frame 1 lit.
  addSheet(scene, 'lantern', 64, 160, 2, (ctx, i) => {
    const rand = rng(4);
    ctx.fillStyle = '#7a5232'; ctx.strokeStyle = INK; ctx.lineWidth = 3;
    ctx.fillRect(28, 40, 9, 118); ctx.strokeRect(28, 40, 9, 118);
    ctx.fillRect(16, 36, 32, 7); ctx.strokeRect(16, 36, 32, 7);
    ctx.beginPath(); ctx.moveTo(40, 43); ctx.lineTo(44, 54); ctx.stroke();
    if (i === 1) glow(ctx, 44, 74, 30, '#ffcf7a', 0.8);
    wash(ctx, blobPoints(44, 74, 11, 16, rand, 0.04), i ? '#ffd27a' : '#8a8a9a', rand, { layers: 3, alpha: 0.9, edge: 0.8 });
    ctx.strokeStyle = INK; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(44, 74, 11, 16, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = INK; ctx.fillRect(38, 55, 12, 4); ctx.fillRect(38, 89, 12, 4);
    if (i === 1) { ctx.fillStyle = '#fff8e0'; ctx.beginPath(); ctx.ellipse(44, 74, 4, 7, 0, 0, Math.PI * 2); ctx.fill(); }
    // a paper note tied to the post
    ctx.fillStyle = '#f4ead4'; ctx.save(); ctx.translate(26, 110); ctx.rotate(-0.15);
    ctx.fillRect(-10, -8, 16, 18); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.strokeRect(-10, -8, 16, 18);
    ctx.strokeStyle = rgba(INK, 0.5); ctx.lineWidth = 1;
    for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-7, -3 + k * 5); ctx.lineTo(3, -3 + k * 5); ctx.stroke(); }
    ctx.restore();
  });

  addSheet(scene, 'ember', 40, 40, 6, (ctx, i) => {
    const sway = Math.sin((i / 6) * Math.PI * 2) * 2;
    glow(ctx, 20, 22, 18, '#ffb050', 0.6);
    ctx.beginPath();
    ctx.moveTo(20, 31);
    ctx.bezierCurveTo(11, 31, 10, 22, 15, 17);
    ctx.quadraticCurveTo(19 + sway * 0.5, 13, 20 + sway, 7);
    ctx.quadraticCurveTo(27, 15, 28, 21);
    ctx.bezierCurveTo(29, 28, 25, 31, 20, 31);
    ctx.fillStyle = '#ff8a3a'; ctx.fill();
    ctx.strokeStyle = rgba('#a8341c', 0.8); ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = '#ffd36a'; ctx.beginPath(); ctx.ellipse(20, 25, 5, 5.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fffbe8'; ctx.beginPath(); ctx.ellipse(20, 26, 2.2, 2.6, 0, 0, Math.PI * 2); ctx.fill();
  });

  addSheet(scene, 'petal', 48, 48, 2, (ctx, i) => {
    glow(ctx, 24, 24, 22, '#ffd0e8', 0.6 + i * 0.2);
    ctx.save(); ctx.translate(24, 24); ctx.rotate(-0.4 + i * 0.1);
    ctx.beginPath(); ctx.moveTo(0, 12); ctx.bezierCurveTo(-12, 4, -10, -10, 0, -13); ctx.bezierCurveTo(10, -10, 12, 4, 0, 12);
    ctx.fillStyle = '#ffe4f0'; ctx.fill(); ctx.strokeStyle = '#b8607a'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.strokeStyle = rgba('#d97a9a', 0.7); ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(0, -8); ctx.stroke();
    ctx.restore();
  });

  addSheet(scene, 'mushroom', 96, 80, 2, (ctx, i) => {
    const sq = i === 1 ? 0.7 : 1;
    const rand = rng(12);
    ctx.save(); ctx.translate(48, 78);
    ctx.fillStyle = '#f4ead4'; ctx.strokeStyle = INK; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-9, -30 * sq); ctx.lineTo(9, -30 * sq); ctx.lineTo(12, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.scale(1 + (1 - sq) * 0.4, sq);
    ctx.beginPath(); ctx.moveTo(-44, -26); ctx.bezierCurveTo(-42, -74, 42, -74, 44, -26); ctx.quadraticCurveTo(0, -18, -44, -26); ctx.closePath();
    ctx.fillStyle = '#d9533e'; ctx.fill();
    ctx.save(); ctx.clip();
    glow(ctx, 14, -60, 40, '#ffb09a', 0.6);
    granulate(ctx, -44, -74, 88, 56, '#4a1010', rand, 0.03, 0.3);
    ctx.restore();
    ctx.stroke();
    ctx.fillStyle = '#fff6e8';
    for (const [sx, sy, r] of [[-22, -40, 7], [4, -52, 9], [26, -38, 6], [-6, -34, 4]]) { ctx.beginPath(); ctx.ellipse(sx, sy, r, r * 0.8, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  });

  // Spirit gate: the level exit.
  addSheet(scene, 'gate', 192, 224, 1, (ctx) => {
    const rand = rng(2);
    glow(ctx, 96, 140, 90, '#fff0c0', 0.75);
    ctx.fillStyle = '#b2523a'; ctx.strokeStyle = INK; ctx.lineWidth = 4;
    for (const px of [34, 146]) { ctx.fillRect(px, 40, 13, 184); ctx.strokeRect(px, 40, 13, 184); }
    ctx.beginPath(); ctx.moveTo(4, 30); ctx.quadraticCurveTo(96, 46, 188, 30); ctx.lineTo(184, 14); ctx.quadraticCurveTo(96, 30, 8, 14); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillRect(24, 58, 144, 11); ctx.strokeRect(24, 58, 144, 11);
    granulate(ctx, 0, 0, 192, 224, '#3a1010', rand, 0.004, 0.3);
    // hanging lantern
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(96, 69); ctx.lineTo(96, 84); ctx.stroke();
    glow(ctx, 96, 100, 26, '#ffcf7a', 0.9);
    wash(ctx, blobPoints(96, 100, 12, 16, rand, 0.04), '#ffd27a', rand, { layers: 3, alpha: 0.95, edge: 0.8 });
  });

  // Hidden spirit platform (revealed by Pip's Glow). One 48px tileable segment.
  addSheet(scene, 'spiritplank', 48, 20, 1, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 20);
    g.addColorStop(0, 'rgba(210,255,230,0.95)'); g.addColorStop(1, 'rgba(120,220,190,0.35)');
    ctx.fillStyle = g; ctx.fillRect(0, 2, 48, 14);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 3); ctx.lineTo(48, 3); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (const [x, y] of [[10, 9], [30, 7], [40, 11]]) { ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill(); }
  });

  // Wooden signpost for tutorial hints.
  addSheet(scene, 'sign', 80, 96, 1, (ctx) => {
    ctx.fillStyle = '#7a5232'; ctx.strokeStyle = INK; ctx.lineWidth = 3;
    ctx.fillRect(36, 40, 9, 56); ctx.strokeRect(36, 40, 9, 56);
    ctx.fillStyle = '#b8875a';
    ctx.beginPath(); ctx.moveTo(6, 14); ctx.lineTo(66, 10); ctx.lineTo(76, 30); ctx.lineTo(66, 50); ctx.lineTo(8, 50); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = rgba(INK, 0.5); ctx.lineWidth = 2;
    for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(16, 22 + k * 9); ctx.lineTo(56, 21 + k * 9); ctx.stroke(); }
  });

  addSheet(scene, 'soft', 64, 64, 1, (ctx) => glow(ctx, 32, 32, 32, '#ffffff', 1));
  addSheet(scene, 'dot', 8, 8, 1, (ctx) => glow(ctx, 4, 4, 4, '#ffffff', 1));
  addSheet(scene, 'leaf', 16, 10, 1, (ctx) => {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(8, 5, 7, 3.5, 0.3, 0, Math.PI * 2); ctx.fill();
  });
  addSheet(scene, 'soot', 16, 16, 1, (ctx) => {
    ctx.fillStyle = 'rgba(40,30,50,0.9)';
    ctx.beginPath(); ctx.arc(8, 8, 6, 0, Math.PI * 2); ctx.fill();
  });

  scene.anims.create({ key: 'ember-flicker', frames: scene.anims.generateFrameNumbers('ember', { start: 0, end: 5 }), frameRate: 10, repeat: -1 });
  scene.anims.create({ key: 'petal-shine', frames: scene.anims.generateFrameNumbers('petal', { start: 0, end: 1 }), frameRate: 3, repeat: -1, yoyo: true });
}
