// Chapter 2 art: Nell the mole miner, mine props, crystals and water.

import { addSheet, rng, rgba, glow, granulate, darken, lighten } from './paint.js';
import { INK, paint, circle, ellipse, limb, eye } from './characters.js';

const NELL = { fur: '#8a6650', belly: '#c9a888', nose: '#f08a9a', overalls: '#4a6a9a', hat: '#f0c040', brass: '#c9a048' };

/**
 * Nell, a mole girl a little taller than Wick. Facing right, feet at origin.
 * pose: { swing 0..1 (pickaxe raised), eyes: 'open'|'closed'|'cross', sleep, foreman, bob }
 */
export function drawNell(ctx, x, y, s, pose = {}, flip = false) {
  const p = { swing: 0, eyes: 'open', sleep: false, foreman: false, bob: 0, pick: true, ...pose };
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip ? -s : s, s);
  const b = p.bob;

  if (p.sleep) {
    // curled up asleep on her side, moss creeping over her
    ellipse(ctx, 0, -20, 40, 22); paint(ctx, NELL.overalls, { sx: 0, sy: -20, r: 40 });
    circle(ctx, 34, -26, 18); paint(ctx, NELL.fur, { sx: 34, sy: -26, r: 20 });
    ellipse(ctx, 52, -22, 8, 6); paint(ctx, NELL.nose, { lw: 2, sx: 52, sy: -22, r: 8 });
    eye(ctx, 38, -30, true, 0.9);
    ctx.beginPath(); ctx.ellipse(28, -42, 18, 8, -0.3, Math.PI, Math.PI * 2); ctx.closePath();
    paint(ctx, p.foreman ? '#e8e0d0' : NELL.hat, { lw: 2.5, sx: 28, sy: -44, r: 16 });
    const rand = rng(Math.round(x));
    for (let i = 0; i < 14; i++) {
      circle(ctx, -36 + rand() * 72, -2 - rand() * 10, 2 + rand() * 3);
      ctx.fillStyle = rgba('#6f9a4a', 0.8); ctx.fill();
    }
    ctx.restore();
    return;
  }

  // legs
  limb(ctx, -7, -26, -9, -4, 9, darken(NELL.overalls, 0.2));
  limb(ctx, 7, -26, 9, -4, 9, NELL.overalls);
  ellipse(ctx, -6, -3, 9, 5); paint(ctx, '#4a3024', { lw: 2.5, sx: -6, sy: -3, r: 9 });
  ellipse(ctx, 12, -3, 9, 5); paint(ctx, '#4a3024', { lw: 2.5, sx: 12, sy: -3, r: 9 });

  // round furry body with overalls
  ellipse(ctx, 0, -50 + b, 26, 30); paint(ctx, NELL.fur, { sx: 0, sy: -50, r: 30 });
  ctx.beginPath(); ctx.moveTo(-22, -46 + b); ctx.lineTo(22, -46 + b); ctx.quadraticCurveTo(24, -22 + b, 0, -20 + b); ctx.quadraticCurveTo(-24, -22 + b, -22, -46 + b); ctx.closePath();
  paint(ctx, NELL.overalls, { sx: 0, sy: -34, r: 24 });
  ctx.strokeStyle = NELL.overalls; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-14, -46 + b); ctx.lineTo(-10, -68 + b); ctx.moveTo(14, -46 + b); ctx.lineTo(10, -68 + b); ctx.stroke();
  circle(ctx, -10, -44 + b, 2.5); ctx.fillStyle = NELL.brass; ctx.fill();
  circle(ctx, 10, -44 + b, 2.5); ctx.fill();

  // pickaxe: resting on the shoulder, or raised for a swing
  if (p.pick) {
    ctx.save();
    ctx.translate(14, -56 + b);
    ctx.rotate(-0.6 + p.swing * 1.5);
    ctx.fillStyle = '#9a6a40'; ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
    ctx.fillRect(-3, -40, 6, 52); ctx.strokeRect(-3, -40, 6, 52);
    ctx.beginPath(); ctx.moveTo(-26, -36); ctx.quadraticCurveTo(0, -50, 26, -36); ctx.lineTo(22, -32); ctx.quadraticCurveTo(0, -42, -22, -32); ctx.closePath();
    paint(ctx, '#a8aab8', { lw: 2.5, sx: 0, sy: -40, r: 26 });
    ctx.restore();
  }

  // head: big pink nose, small eyes, goggles and a hard hat
  circle(ctx, 4, -86 + b, 19); paint(ctx, NELL.fur, { sx: 4, sy: -86, r: 20 });
  ellipse(ctx, 6, -74 + b, 13, 9); paint(ctx, NELL.belly, { ink: false, sx: 6, sy: -74, r: 12 });
  ellipse(ctx, 24, -80 + b, 8, 6.5); paint(ctx, NELL.nose, { lw: 2.5, sx: 24, sy: -80, r: 8 });
  for (const ex of [8, 17]) {
    if (p.eyes === 'closed') eye(ctx, ex, -88 + b, true, 0.8);
    else if (p.eyes === 'cross') {
      ctx.strokeStyle = INK; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(ex - 2.5, -91 + b); ctx.lineTo(ex + 2.5, -86 + b); ctx.moveTo(ex + 2.5, -91 + b); ctx.lineTo(ex - 2.5, -86 + b); ctx.stroke();
    } else { circle(ctx, ex, -88 + b, 2.6); ctx.fillStyle = INK; ctx.fill(); }
  }
  ctx.strokeStyle = INK; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.arc(16, -72 + b, 3, 0.2, Math.PI - 0.2); ctx.stroke();
  // goggles pushed up
  ctx.fillStyle = '#5a4030';
  ctx.fillRect(-14, -100 + b, 36, 5);
  for (const gx of [0, 14]) { circle(ctx, gx, -98 + b, 6); paint(ctx, '#9ad0e0', { lw: 2.2, sx: gx, sy: -98, r: 6, shade: 0.1 }); }
  // hard hat with a lamp
  ctx.beginPath(); ctx.moveTo(-18, -103 + b); ctx.quadraticCurveTo(-14, -126 + b, 6, -126 + b); ctx.quadraticCurveTo(24, -124 + b, 26, -103 + b); ctx.closePath();
  paint(ctx, p.foreman ? '#e8e0d0' : NELL.hat, { sx: 4, sy: -114, r: 20 });
  ctx.fillStyle = p.foreman ? '#d0c8b8' : '#d8a830'; ctx.fillRect(-22, -105 + b, 52, 5); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(-22, -105 + b, 52, 5);
  circle(ctx, 4, -116 + b, 5); paint(ctx, '#fff4c0', { lw: 2, sx: 4, sy: -116, r: 5, shade: 0 });
  ctx.restore();
}

export function createCaveTextures(scene) {
  addSheet(scene, 'nell', 128, 144, 3, (ctx, i) => drawNell(ctx, 56, 140, 1, [{}, { swing: 1 }, { bob: 1 }][i]));
  scene.anims.create({ key: 'nell-swing', frames: [{ key: 'nell', frame: 1 }, { key: 'nell', frame: 0 }], frameRate: 6, repeat: 2 });

  // Mine cart, seen from the side.
  addSheet(scene, 'cart', 112, 64, 2, (ctx, i) => {
    const rand = rng(3);
    ctx.beginPath(); ctx.moveTo(8, 10); ctx.lineTo(104, 10); ctx.lineTo(94, 48); ctx.lineTo(18, 48); ctx.closePath();
    paint(ctx, '#6a5a5a', { lw: 3, sx: 56, sy: 30, r: 50 });
    ctx.fillStyle = '#8a7a7a'; ctx.fillRect(6, 6, 100, 8); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.strokeRect(6, 6, 100, 8);
    ctx.fillStyle = INK;
    for (let k = 0; k < 6; k++) { circle(ctx, 20 + k * 15, 22, 2); ctx.fill(); circle(ctx, 24 + k * 13, 40, 2); ctx.fill(); }
    granulate(ctx, 10, 12, 92, 36, '#1a1020', rand, 0.02, 0.3);
    for (const wx of [30, 82]) {
      circle(ctx, wx, 52, 10); paint(ctx, '#4a4048', { lw: 3, sx: wx, sy: 52, r: 10 });
      ctx.strokeStyle = '#8a8090'; ctx.lineWidth = 2;
      const a = i * 0.8;
      ctx.beginPath(); ctx.moveTo(wx + Math.cos(a) * 7, 52 + Math.sin(a) * 7); ctx.lineTo(wx - Math.cos(a) * 7, 52 - Math.sin(a) * 7); ctx.stroke();
    }
  });
  scene.anims.create({ key: 'cart-roll', frames: scene.anims.generateFrameNumbers('cart', { start: 0, end: 1 }), frameRate: 12, repeat: -1 });

  // Wooden mine lift: a 48px tileable plank.
  addSheet(scene, 'lift', 48, 22, 1, (ctx) => {
    ctx.fillStyle = INK; ctx.fillRect(0, 2, 48, 18);
    ctx.fillStyle = '#b08050'; ctx.fillRect(0, 4, 48, 6);
    ctx.fillStyle = '#8a5a34'; ctx.fillRect(0, 10, 48, 7);
    ctx.fillStyle = '#9a9aa8'; ctx.fillRect(20, 3, 8, 16);
    ctx.fillStyle = INK; ctx.fillRect(23, 7, 2, 2); ctx.fillRect(23, 13, 2, 2);
  });

  // Glowing crystal cluster: a light source in the dark caves.
  addSheet(scene, 'crystal', 72, 88, 2, (ctx, i) => {
    const col = i === 0 ? '#7ad8f0' : '#c49af0';
    glow(ctx, 36, 50, 36, col, 0.6);
    const shards = [[36, 84, 10, 62, 0], [22, 84, 8, 40, -0.35], [50, 84, 8, 46, 0.3], [12, 84, 6, 24, -0.6], [60, 84, 6, 28, 0.6]];
    for (const [sx, sy, w, h, rot] of shards) {
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(rot);
      ctx.beginPath(); ctx.moveTo(-w, 0); ctx.lineTo(-w, -h * 0.75); ctx.lineTo(0, -h); ctx.lineTo(w, -h * 0.75); ctx.lineTo(w, 0); ctx.closePath();
      paint(ctx, col, { lw: 2.5, sx: 0, sy: -h / 2, r: h, light: 0.6 });
      ctx.strokeStyle = rgba('#ffffff', 0.7); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-w * 0.3, -6); ctx.lineTo(-w * 0.3, -h * 0.7); ctx.stroke();
      ctx.restore();
    }
  });

  // Crystal switch (2-F): dim until Pip's Glow wakes it.
  addSheet(scene, 'switch', 72, 88, 2, (ctx, i) => {
    const col = i ? '#ffd27a' : '#6a6a88';
    if (i) glow(ctx, 36, 46, 40, '#ffd27a', 0.8);
    ctx.beginPath(); ctx.moveTo(26, 86); ctx.lineTo(24, 30); ctx.lineTo(36, 8); ctx.lineTo(48, 30); ctx.lineTo(46, 86); ctx.closePath();
    paint(ctx, col, { lw: 3, sx: 36, sy: 46, r: 40, light: 0.5 });
    ctx.fillStyle = '#5a5a68'; ctx.fillRect(14, 78, 44, 10); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.strokeRect(14, 78, 44, 10);
  });

  // Stalactite that shakes loose and falls.
  addSheet(scene, 'drip', 40, 72, 1, (ctx) => {
    ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(36, 0); ctx.quadraticCurveTo(26, 30, 20, 70); ctx.quadraticCurveTo(14, 30, 4, 0); ctx.closePath();
    paint(ctx, '#7a7090', { lw: 2.5, sx: 20, sy: 20, r: 30 });
    ctx.strokeStyle = rgba(INK, 0.5); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(12, 8); ctx.lineTo(18, 30); ctx.moveTo(28, 6); ctx.lineTo(23, 40); ctx.stroke();
  });

  // A boulder blocking the way (96x96: two tiles across).
  addSheet(scene, 'boulder', 100, 100, 1, (ctx) => {
    const rand = rng(8);
    ctx.beginPath(); ctx.moveTo(10, 96); ctx.bezierCurveTo(-4, 50, 20, 4, 54, 6); ctx.bezierCurveTo(88, 8, 104, 50, 92, 96); ctx.closePath();
    paint(ctx, '#7a7488', { lw: 3.5, sx: 50, sy: 50, r: 60 });
    granulate(ctx, 6, 6, 90, 90, '#1a1020', rand, 0.03, 0.35);
    ctx.strokeStyle = rgba(INK, 0.6); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(40, 20); ctx.lineTo(50, 44); ctx.lineTo(44, 66); ctx.moveTo(70, 30); ctx.lineTo(62, 52); ctx.stroke();
  });

  // Water surface: a 96px tileable strip with a light edge.
  addSheet(scene, 'water-top', 96, 24, 1, (ctx) => {
    ctx.fillStyle = 'rgba(70,120,190,0.55)'; ctx.fillRect(0, 6, 96, 18);
    ctx.strokeStyle = 'rgba(210,240,255,0.9)'; ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x <= 96; x += 4) ctx.lineTo(x, 6 + Math.sin((x / 96) * Math.PI * 4) * 2.5);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (const [x, y] of [[14, 12], [52, 14], [80, 11]]) ctx.fillRect(x, y, 8, 2);
  });
  addSheet(scene, 'water-body', 64, 64, 1, (ctx) => {
    ctx.fillStyle = 'rgba(50,90,160,0.55)'; ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = 'rgba(160,210,255,0.15)';
    ctx.fillRect(8, 20, 20, 2); ctx.fillRect(40, 44, 16, 2);
  });

  // Soft white circle used to cut holes in the darkness.
  addSheet(scene, 'lightmask', 256, 256, 1, (ctx) => {
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.55, 'rgba(255,255,255,0.85)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
  });
}

/** Painted into terrain: a mine rail on wooden supports. */
export function paintRail(ctx, x, y, TILE, rand, leftEnd, rightEnd) {
  const top = y + 4;
  // support trestle
  ctx.strokeStyle = '#5a3a24'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(x + 8, top + 10); ctx.lineTo(x + 18, y + TILE + 60); ctx.moveTo(x + TILE - 8, top + 10); ctx.lineTo(x + TILE - 18, y + TILE + 60); ctx.stroke();
  ctx.strokeStyle = rgba(INK, 0.8); ctx.lineWidth = 1.5; ctx.stroke();
  // ties
  ctx.fillStyle = '#7a5232'; ctx.strokeStyle = INK; ctx.lineWidth = 2;
  for (const tx of [4, 28]) { ctx.fillRect(x + tx, top + 4, 16, 8); ctx.strokeRect(x + tx, top + 4, 16, 8); }
  // the iron rail
  ctx.fillStyle = '#9a9aa8';
  ctx.fillRect(x - (leftEnd ? 0 : 1), top, TILE + (rightEnd ? 0 : 2), 5);
  ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x + TILE, top); ctx.moveTo(x, top + 5); ctx.lineTo(x + TILE, top + 5); ctx.stroke();
  if (rand() < 0.2) { ctx.fillStyle = lighten('#9a9aa8', 0.5); ctx.fillRect(x + rand() * 30, top + 1, 10, 1.5); }
}
