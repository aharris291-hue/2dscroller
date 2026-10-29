// Chapter 4 art: Morrow the Ashen Moth, Grandmother Ash, ash flakes and root lanterns.

import { addSheet, rng, rgba, glow, granulate, wash } from './paint.js';
import { INK, paint, circle, ellipse, eye, drawGrandpa } from './characters.js';
import { drawNell } from './caves.js';

function lobe(cx, cy, rx, ry, rot, rand, wob = 0.08) {
  const pts = [];
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const w = 1 + (rand() - 0.5) * wob;
    const ex = Math.cos(a) * rx * w, ey = Math.sin(a) * ry * w;
    pts.push([cx + ex * Math.cos(rot) - ey * Math.sin(rot), cy + ex * Math.sin(rot) + ey * Math.cos(rot)]);
  }
  return pts;
}

function poly(ctx, pts) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
}

/**
 * Morrow, the Ashen Moth. Origin at the centre of his body.
 * pose: { flap 0..1 (wings raised), open 0..1 (wings spread to show the heart), eyes: 'sad'|'angry'|'closed', small }
 */
export function drawMorrow(ctx, x, y, s, pose = {}) {
  const p = { flap: 0, open: 0, eyes: 'angry', ...pose };
  const rand = rng(33);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const lift = -p.flap * 40;
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.scale(side, 1);
    const spread = 0.35 - p.open * 0.35;
    const upper = lobe(150 + p.open * 30, -60 + lift, 160, 90, -0.5 + spread + p.flap * -0.3, rand);
    const lower = lobe(110 + p.open * 20, 70 + lift * 0.4, 110, 70, 0.5 - spread * 0.5, rand);
    for (const pts of [lower, upper]) {
      poly(ctx, pts);
      paint(ctx, '#8a8490', { lw: 4, sx: 120, sy: 0, r: 160, shade: 0.45 });
      ctx.save(); poly(ctx, pts); ctx.clip();
      ctx.strokeStyle = 'rgba(30,20,30,0.55)'; ctx.lineWidth = 22; poly(ctx, pts); ctx.stroke();
      granulate(ctx, -20, -200, 360, 360, '#2a2030', rand, 0.004, 0.45);
      ctx.restore();
    }
    // eye-spots and veins
    for (const [ex, ey, r] of [[170, -70 + lift, 30], [110, 70 + lift * 0.4, 20]]) {
      circle(ctx, ex, ey, r); ctx.fillStyle = 'rgba(225,218,228,0.75)'; ctx.fill();
      circle(ctx, ex, ey, r * 0.45); ctx.fillStyle = 'rgba(60,50,70,0.85)'; ctx.fill();
    }
    ctx.strokeStyle = rgba('#3a3440', 0.5); ctx.lineWidth = 2;
    for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(20, 0); ctx.quadraticCurveTo(100 + k * 30, -40 + lift - k * 10, 160 + k * 30, -120 + lift + k * 30); ctx.stroke(); }
    ctx.restore();
  }
  // furry body
  ellipse(ctx, 0, 20, 34, 80); paint(ctx, '#6a6470', { lw: 4, sx: 0, sy: 20, r: 70 });
  for (let k = 0; k < 6; k++) { ctx.strokeStyle = rgba('#3a3440', 0.6); ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 40 + k * 12, 30 - k * 3, 6, 0, 0, Math.PI); ctx.stroke(); }
  // the hidden heart: a small dim flame he is holding onto
  if (p.open > 0) {
    glow(ctx, 0, 10, 60 * p.open, '#ffb060', 0.8 * p.open);
    ctx.globalAlpha = p.open;
    ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(-16, 30, -16, 10, -6, 0); ctx.quadraticCurveTo(0, -10, 2, -24); ctx.quadraticCurveTo(14, 4, 14, 14); ctx.bezierCurveTo(14, 26, 8, 30, 0, 30);
    ctx.fillStyle = '#ff9a40'; ctx.fill();
    ctx.globalAlpha = 1;
  }
  // head, antennae, eyes
  circle(ctx, 0, -70, 30); paint(ctx, '#6a6470', { lw: 4, sx: 0, sy: -70, r: 30 });
  ctx.strokeStyle = INK; ctx.lineWidth = 3;
  for (const side of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(side * 10, -96); ctx.quadraticCurveTo(side * 40, -150, side * 70, -140); ctx.stroke();
    for (let k = 0; k < 6; k++) { const t = 0.3 + k * 0.12; ctx.beginPath(); ctx.moveTo(side * (10 + 60 * t), -96 - 50 * t); ctx.lineTo(side * (16 + 60 * t), -104 - 50 * t); ctx.stroke(); }
  }
  for (const ex of [-12, 12]) {
    if (p.eyes === 'closed') { eye(ctx, ex, -72, true, 1.6); continue; }
    ellipse(ctx, ex, -72, 9, 10); ctx.fillStyle = p.eyes === 'angry' ? '#c8c0d0' : '#e8e4f0'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    circle(ctx, ex, -70, 4.5); ctx.fillStyle = INK; ctx.fill();
    if (p.eyes === 'angry') { ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ex - 10 * Math.sign(ex), -86); ctx.lineTo(ex + 6 * Math.sign(ex), -82); ctx.stroke(); }
    else if (p.eyes === 'sad') { ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(ex - 8 * Math.sign(ex), -88); ctx.lineTo(ex + 8 * Math.sign(ex), -82); ctx.stroke(); }
  }
  ctx.restore();
}

/** Morrow as he really is: a small, ordinary grey moth. */
export function drawSmallMoth(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const side of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(side * 12, -6, 12, 8, side * -0.5, 0, Math.PI * 2); paint(ctx, '#a8a2b0', { lw: 1.8, sx: side * 12, sy: -6, r: 12 });
    ctx.beginPath(); ctx.ellipse(side * 9, 7, 8, 6, side * 0.5, 0, Math.PI * 2); paint(ctx, '#a8a2b0', { lw: 1.8, sx: side * 9, sy: 7, r: 8 });
  }
  ellipse(ctx, 0, 0, 4, 11); paint(ctx, '#7a7480', { lw: 1.8, sx: 0, sy: 0, r: 10 });
  ctx.strokeStyle = INK; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(-2, -10); ctx.quadraticCurveTo(-8, -20, -12, -18); ctx.moveTo(2, -10); ctx.quadraticCurveTo(8, -20, 12, -18); ctx.stroke();
  ctx.restore();
}

/** Grandmother Ash: a vast, gentle fox of living flame with nine tails. Origin at her chest on the ground. */
export function drawAsh(ctx, x, y, s, { asleep = false, dim = 0 } = {}) {
  const rand = rng(9);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const fur = dim > 0.5 ? '#8a5040' : '#ff8a40';
  const light = dim > 0.5 ? '#c08060' : '#ffd070';
  glow(ctx, 0, -120, 360, '#ffb060', 0.5 * (1 - dim));
  // nine bushy tails of flame fanned behind her
  for (let t = 0; t < 9; t++) {
    const a = -Math.PI * 0.92 + (t / 8) * Math.PI * 0.62;
    const bx = -110, by = -60;
    const tx = bx + Math.cos(a) * 230, ty = by + Math.sin(a) * 190;
    const dx = tx - bx, dy = ty - by, len = Math.hypot(dx, dy);
    const nx = -dy / len, ny = dx / len, w = 42;
    const mx = bx + dx * 0.55, my = by + dy * 0.55;
    ctx.beginPath();
    ctx.moveTo(bx + nx * 16, by + ny * 16);
    ctx.bezierCurveTo(mx + nx * w, my + ny * w, tx + nx * 18 - dx * 0.05, ty + ny * 18 - dy * 0.05, tx, ty);
    ctx.bezierCurveTo(tx - nx * 18 - dx * 0.05, ty - ny * 18 - dy * 0.05, mx - nx * w, my - ny * w, bx - nx * 16, by - ny * 16);
    ctx.closePath();
    paint(ctx, t % 2 ? fur : light, { lw: 3, sx: tx, sy: ty, r: 120, shade: 0.3 });
    // a bright inner flame
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(mx + nx * 12, my + ny * 12, tx - dx * 0.08, ty - dy * 0.08);
    ctx.quadraticCurveTo(mx - nx * 12, my - ny * 12, bx, by);
    ctx.fillStyle = rgba('#fff0b0', 0.5); ctx.fill();
  }
  // body lying down
  ellipse(ctx, 0, -60, 170, 70); paint(ctx, fur, { lw: 4, sx: 0, sy: -60, r: 160 });
  // head
  ctx.beginPath();
  ctx.moveTo(110, -110); ctx.quadraticCurveTo(170, -180, 230, -150); ctx.lineTo(300, -120); ctx.quadraticCurveTo(310, -100, 290, -94);
  ctx.quadraticCurveTo(220, -70, 150, -60); ctx.closePath();
  paint(ctx, fur, { lw: 4, sx: 210, sy: -120, r: 90 });
  for (const ex of [150, 190]) {
    ctx.beginPath(); ctx.moveTo(ex - 18, -150); ctx.lineTo(ex, -215); ctx.lineTo(ex + 18, -148); ctx.closePath();
    paint(ctx, fur, { lw: 3, sx: ex, sy: -180, r: 30 });
  }
  circle(ctx, 298, -110, 7); ctx.fillStyle = INK; ctx.fill();
  if (asleep) eye(ctx, 220, -128, true, 2.2);
  else {
    ellipse(ctx, 220, -128, 11, 8); ctx.fillStyle = '#fff4c0'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
    ellipse(ctx, 223, -128, 4, 6); ctx.fillStyle = '#8a3a10'; ctx.fill();
  }
  // embers drifting off her fur
  for (let i = 0; i < 50; i++) glow(ctx, -160 + rand() * 460, -260 + rand() * 230, 3 + rand() * 4, '#ffe0a0', 0.9 * (1 - dim));
  ctx.restore();
}

export function createHeartTextures(scene) {
  addSheet(scene, 'morrow', 560, 400, 3, (ctx, i) => drawMorrow(ctx, 280, 230, 0.95, [{ flap: 0 }, { flap: 1 }, { open: 1, eyes: 'sad' }][i]));
  scene.anims.create({ key: 'morrow-flap', frames: [{ key: 'morrow', frame: 0 }, { key: 'morrow', frame: 1 }], frameRate: 3, repeat: -1 });
  addSheet(scene, 'smallmoth', 48, 40, 1, (ctx) => drawSmallMoth(ctx, 24, 22, 1));
  addSheet(scene, 'ashflake', 28, 28, 1, (ctx) => {
    glow(ctx, 14, 14, 13, '#c0b0c0', 0.6);
    ctx.beginPath(); ctx.moveTo(14, 3); ctx.lineTo(23, 12); ctx.lineTo(16, 25); ctx.lineTo(5, 16); ctx.closePath();
    paint(ctx, '#6a6070', { lw: 2, sx: 14, sy: 14, r: 12 });
    ctx.fillStyle = 'rgba(255,140,60,0.8)'; ctx.fillRect(12, 12, 4, 4);
  });
  // Friends standing at the festival.
  addSheet(scene, 'grandpa-stand', 128, 170, 1, (ctx) => drawGrandpa(ctx, 64, 166, 1, {}));
  addSheet(scene, 'nellmum', 128, 144, 1, (ctx) => drawNell(ctx, 60, 140, 1.05, { foreman: true, pick: false }));
  addSheet(scene, 'ash-small', 640, 380, 1, (ctx) => drawAsh(ctx, 250, 370, 0.85, {}));

  // A lantern hanging from a twisted root: frame 0 dark, frame 1 lit.
  addSheet(scene, 'rootlantern', 80, 140, 2, (ctx, i) => {
    ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(30, 140); ctx.bezierCurveTo(10, 100, 50, 70, 30, 30); ctx.quadraticCurveTo(28, 10, 50, 12); ctx.stroke();
    ctx.strokeStyle = '#6a4030'; ctx.lineWidth = 6; ctx.stroke();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(50, 14); ctx.lineTo(50, 34); ctx.stroke();
    if (i) glow(ctx, 50, 54, 36, '#ffcf7a', 0.85);
    ellipse(ctx, 50, 54, 15, 19); paint(ctx, i ? '#ffd27a' : '#5a4a58', { lw: 2.5, sx: 50, sy: 54, r: 18, shade: 0.2 });
    ctx.strokeStyle = rgba(INK, 0.6); ctx.lineWidth = 1;
    for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.ellipse(50, 54, 15, 19 - Math.abs(k) * 6, 0, k > 0 ? 0 : Math.PI, k > 0 ? Math.PI : 0); }
    if (i) { circle(ctx, 50, 54, 5); ctx.fillStyle = '#fff8e0'; ctx.fill(); }
  });
}
