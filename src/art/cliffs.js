// Chapter 3 art: Wren the courier owl, gloom bats, crumbling ledges, kites,
// Wren's feather, frozen birds and the sky post office.

import { addSheet, rng, rgba, glow, granulate, darken, lighten, wash, blobPoints } from './paint.js';
import { INK, paint, circle, ellipse, eye } from './characters.js';

const WREN = { back: '#a8784a', face: '#fbf3e4', rim: '#d8b890', belly: '#f2e2c8', bag: '#7a4a3a' };

/** Wren: a big round barn owl with spectacles and a mailbag. pose: { wings: 0..1 open, eyes, flying } */
export function drawWren(ctx, x, y, s, pose = {}, flip = false) {
  const p = { wings: 0, eyes: 'open', ...pose };
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip ? -s : s, s);
  // feet
  if (!p.flying) {
    ctx.fillStyle = '#d8a048';
    for (const fx of [-14, 12]) { ellipse(ctx, fx, -3, 9, 4); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke(); }
  }
  // wings: folded at the sides, or spread wide
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.scale(side, 1);
    ctx.beginPath();
    if (p.wings > 0.5) {
      ctx.moveTo(26, -70); ctx.quadraticCurveTo(90, -120, 140, -80); ctx.quadraticCurveTo(110, -70, 120, -50);
      ctx.quadraticCurveTo(90, -50, 96, -34); ctx.quadraticCurveTo(60, -40, 30, -30); ctx.closePath();
    } else {
      ctx.moveTo(30, -80); ctx.quadraticCurveTo(52, -50, 40, -14); ctx.quadraticCurveTo(26, -20, 24, -50); ctx.closePath();
    }
    paint(ctx, WREN.back, { sx: 60, sy: -60, r: 50 });
    ctx.restore();
  }
  // round body
  ellipse(ctx, 0, -52, 40, 48); paint(ctx, WREN.back, { sx: 0, sy: -52, r: 48 });
  ellipse(ctx, 0, -40, 28, 32); paint(ctx, WREN.belly, { ink: false, sx: 0, sy: -40, r: 30, shade: 0.2 });
  const rand = rng(4);
  ctx.fillStyle = rgba('#a8784a', 0.6);
  for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.ellipse(-18 + rand() * 36, -60 + rand() * 40, 2, 3, 0, 0, Math.PI * 2); ctx.fill(); }
  // heart-shaped face
  ctx.beginPath();
  ctx.moveTo(0, -78); ctx.bezierCurveTo(-14, -104, -40, -96, -34, -74); ctx.bezierCurveTo(-30, -58, -10, -52, 0, -48);
  ctx.bezierCurveTo(10, -52, 30, -58, 34, -74); ctx.bezierCurveTo(40, -96, 14, -104, 0, -78); ctx.closePath();
  paint(ctx, WREN.face, { sx: 0, sy: -74, r: 30, shade: 0.15 });
  ctx.strokeStyle = WREN.rim; ctx.lineWidth = 2; ctx.stroke();
  // eyes behind little round spectacles
  for (const ex of [-14, 14]) {
    if (p.eyes === 'closed') eye(ctx, ex, -76, true, 1.2);
    else { circle(ctx, ex, -76, 4.5); ctx.fillStyle = INK; ctx.fill(); circle(ctx, ex + 1.5, -78, 1.5); ctx.fillStyle = '#fff'; ctx.fill(); }
    circle(ctx, ex, -76, 9); ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 2; ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(-5, -76); ctx.lineTo(5, -76); ctx.stroke();
  // beak
  ctx.beginPath(); ctx.moveTo(-4, -68); ctx.lineTo(4, -68); ctx.lineTo(0, -58); ctx.closePath();
  paint(ctx, '#e0a050', { lw: 1.5, sx: 0, sy: -64, r: 6 });
  // mailbag across her front
  ctx.strokeStyle = WREN.bag; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-34, -56); ctx.lineTo(22, -24); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10, -34); ctx.lineTo(40, -34); ctx.lineTo(42, -12); ctx.lineTo(12, -12); ctx.closePath();
  paint(ctx, WREN.bag, { lw: 2.5, sx: 26, sy: -24, r: 18 });
  ctx.fillStyle = '#f4ead4'; ctx.fillRect(16, -38, 14, 6); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(16, -38, 14, 6);
  ctx.restore();
}

/** A small songbird sitting perfectly still (frozen by the Hush) or flying. */
export function drawBird(ctx, x, y, s, { color = '#6a7a9a', flying = false } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  if (flying) {
    ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-12, -4); ctx.quadraticCurveTo(-6, -12, 0, -4); ctx.quadraticCurveTo(6, -12, 12, -4); ctx.stroke();
  } else {
    ellipse(ctx, 0, -8, 9, 7); paint(ctx, color, { lw: 1.8, sx: 0, sy: -8, r: 9 });
    circle(ctx, 7, -14, 5); paint(ctx, color, { lw: 1.8, sx: 7, sy: -14, r: 5 });
    ctx.fillStyle = '#e0a050'; ctx.beginPath(); ctx.moveTo(11, -15); ctx.lineTo(16, -14); ctx.lineTo(11, -12); ctx.fill();
    circle(ctx, 8, -15, 1.2); ctx.fillStyle = INK; ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-8, -6); ctx.lineTo(-16, -2); ctx.stroke();
  }
  ctx.restore();
}

export function drawGloomBat(ctx, x, y, s, { flap = 0 } = {}) {
  const rand = rng(6);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  for (const side of [-1, 1]) {
    ctx.save(); ctx.scale(side, 1);
    ctx.beginPath();
    const up = flap ? -18 : 10;
    ctx.moveTo(10, -4); ctx.quadraticCurveTo(26, up - 10, 44, up); ctx.lineTo(36, up + 8); ctx.lineTo(28, up + 4); ctx.lineTo(20, up + 12); ctx.quadraticCurveTo(14, 6, 10, 6); ctx.closePath();
    paint(ctx, '#4b4258', { sx: 26, sy: up, r: 24 });
    ctx.restore();
  }
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    circle(ctx, Math.cos(a) * 14, Math.sin(a) * 13, 3 + rand() * 3);
    ctx.fillStyle = 'rgba(40,30,50,0.9)'; ctx.fill();
  }
  ellipse(ctx, 0, 0, 15, 14); paint(ctx, '#4b4258', { ink: false, sx: 0, sy: 0, r: 15, light: 0.4 });
  for (const ex of [-5, 5]) {
    ellipse(ctx, ex, -2, 4, 4.5); ctx.fillStyle = '#fdf6ea'; ctx.fill();
    circle(ctx, ex, -1, 2); ctx.fillStyle = INK; ctx.fill();
  }
  ctx.strokeStyle = '#fdf6ea'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-9, -8); ctx.lineTo(-3, -10); ctx.moveTo(9, -8); ctx.lineTo(3, -10); ctx.stroke();
  ctx.restore();
}

export function drawFeather(ctx, x, y, s, rot = 0) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(-14, 10, -12, -20, 0, -34); ctx.bezierCurveTo(12, -20, 14, 10, 0, 30); ctx.closePath();
  paint(ctx, '#e8d0a8', { lw: 2, sx: 0, sy: 0, r: 30 });
  ctx.strokeStyle = '#a8784a'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, 36); ctx.lineTo(0, -30); ctx.stroke();
  for (let k = -20; k < 24; k += 8) { ctx.beginPath(); ctx.moveTo(0, k); ctx.lineTo(-8, k - 6); ctx.moveTo(0, k); ctx.lineTo(8, k - 6); ctx.stroke(); }
  ctx.restore();
}

export function createCliffTextures(scene) {
  addSheet(scene, 'gloombat', 100, 64, 2, (ctx, i) => drawGloomBat(ctx, 50, 34, 1, { flap: i }));
  scene.anims.create({ key: 'gloombat-fly', frames: scene.anims.generateFrameNumbers('gloombat', { start: 0, end: 1 }), frameRate: 7, repeat: -1 });
  addSheet(scene, 'feather', 40, 80, 1, (ctx) => drawFeather(ctx, 20, 40, 1, 0));
  addSheet(scene, 'wren', 300, 160, 2, (ctx, i) => drawWren(ctx, 150, 156, 1, { wings: i, flying: i === 1 }));

  // Crumbling sandstone ledge: one 48px tile.
  addSheet(scene, 'crumble', 48, 48, 1, (ctx) => {
    const rand = rng(14);
    ctx.beginPath(); ctx.moveTo(1, 4); ctx.lineTo(47, 4); ctx.lineTo(44, 22); ctx.lineTo(30, 30); ctx.lineTo(16, 26); ctx.lineTo(4, 20); ctx.closePath();
    paint(ctx, '#c9906a', { lw: 2.5, sx: 24, sy: 14, r: 26 });
    ctx.fillStyle = '#e8c070'; ctx.fillRect(2, 4, 44, 4);
    ctx.strokeStyle = rgba(INK, 0.6); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(14, 8); ctx.lineTo(18, 20); ctx.moveTo(32, 6); ctx.lineTo(28, 18); ctx.lineTo(34, 24); ctx.stroke();
    granulate(ctx, 2, 4, 44, 24, '#3a1a10', rand, 0.04, 0.4);
  });

  // Kite platform: a tileable 48px strip of painted kite cloth.
  addSheet(scene, 'kite', 48, 26, 1, (ctx) => {
    const cols = ['#e8604a', '#f0c060'];
    for (let k = 0; k < 2; k++) {
      ctx.beginPath(); ctx.moveTo(k * 24, 4); ctx.lineTo(k * 24 + 24, 4); ctx.lineTo(k * 24 + 18, 18); ctx.lineTo(k * 24 + 6, 18); ctx.closePath();
      ctx.fillStyle = cols[k]; ctx.fill();
    }
    ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(48, 4); ctx.stroke();
    ctx.strokeStyle = '#7a5232'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(48, 6); ctx.stroke();
    ctx.strokeStyle = rgba(INK, 0.6); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(24, 6); ctx.quadraticCurveTo(28, 18, 22, 26); ctx.stroke();
  });

  // A rising wisp of wind for updraft columns.
  addSheet(scene, 'wind', 24, 64, 1, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 64);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.8)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.strokeStyle = g; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(12, 62); ctx.bezierCurveTo(2, 40, 22, 24, 12, 2); ctx.stroke();
  });

  addSheet(scene, 'raindrop', 4, 24, 1, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 24);
    g.addColorStop(0, 'rgba(200,210,255,0)'); g.addColorStop(1, 'rgba(200,210,255,0.8)');
    ctx.fillStyle = g; ctx.fillRect(1, 0, 2, 24);
  });
}

/** Painted decorations for cliff levels (called from world.js paintDeco). */
export function paintCliffDeco(ctx, d, x, y, rand) {
  switch (d.type) {
    case 'birds': {
      const cols = ['#6a7a9a', '#9a6a5a', '#7a8a5a', '#8a7aa0'];
      for (let i = 0; i < (d.n || 3); i++) drawBird(ctx, x - 40 + i * 30 + rand() * 8, y, 1, { color: cols[i % 4] });
      return true;
    }
    case 'flags': {
      // a string of prayer flags hanging still in the dead air
      const w = (d.w || 6) * 48;
      ctx.strokeStyle = rgba(INK, 0.6); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x, y - 140); ctx.quadraticCurveTo(x + w / 2, y - 90, x + w, y - 140); ctx.stroke();
      const cols = ['#e8604a', '#f0c060', '#6aa0c8', '#9ad07a', '#f4ead4'];
      for (let k = 1; k < 12; k++) {
        const t = k / 12, fx = x + w * t, fy = y - 140 + 50 * 4 * t * (1 - t) * 0.5 + 4;
        ctx.fillStyle = cols[k % cols.length];
        ctx.fillRect(fx - 7, fy, 14, 18); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(fx - 7, fy, 14, 18);
      }
      return true;
    }
    case 'postoffice': {
      // the Sky Post Office: a tall, leaning tower of a building
      const h = d.h || 420;
      wash(ctx, [[x - 120, y], [x - 100, y - h], [x + 110, y - h - 20], [x + 130, y]], '#d8b898', rand, { layers: 3, alpha: 0.85, edge: 0.6 });
      wash(ctx, [[x - 140, y - h + 6], [x, y - h - 110], [x + 150, y - h - 10]], '#8a4a4a', rand, { layers: 3, alpha: 0.9, edge: 0.6 });
      for (let r = 0; r < Math.floor(h / 90); r++) {
        for (const wx of [-60, 0, 60]) {
          const wy = y - 60 - r * 90;
          glow(ctx, x + wx, wy, 26, '#ffd890', 0.45);
          wash(ctx, [[x + wx - 14, wy + 18], [x + wx - 14, wy - 18], [x + wx + 14, wy - 18], [x + wx + 14, wy + 18]], '#ffe0a0', rand, { layers: 2, alpha: 0.9 });
        }
      }
      ctx.fillStyle = '#f4ead4'; ctx.fillRect(x - 80, y - h + 30, 160, 30); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(x - 80, y - h + 30, 160, 30);
      ctx.fillStyle = INK; ctx.font = 'bold 16px Nunito, sans-serif'; ctx.fillText('SKY POST OFFICE', x - 70, y - h + 51);
      return true;
    }
    case 'kitepole': {
      ctx.strokeStyle = '#7a5232'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 200); ctx.stroke();
      ctx.strokeStyle = rgba(INK, 0.5); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y - 200); ctx.quadraticCurveTo(x + 80, y - 260, x + 140, y - 330); ctx.stroke();
      ctx.save(); ctx.translate(x + 140, y - 340); ctx.rotate(0.3);
      ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(20, 0); ctx.lineTo(0, 34); ctx.lineTo(-20, 0); ctx.closePath();
      paint(ctx, rand() < 0.5 ? '#e8604a' : '#6aa0c8', { lw: 2.5, sx: 0, sy: 0, r: 30 });
      ctx.restore();
      return true;
    }
    default:
      return false;
  }
}
