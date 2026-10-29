// Characters are drawn with vector shapes so the same code can paint a small
// in-game sprite or a big cutscene illustration. Every draw function works in
// "character space": origin at the feet, y going up as negative numbers.

import { addSheet, rgba, darken, lighten, rng, granulate } from './paint.js';

export const INK = '#3a2630';

// ------------------------------------------------------------------ helpers

/** Fill the current path with soft watercolor shading, then ink the outline. */
function paint(ctx, base, { shade = 0.35, light = 0.3, lw = 3, ink = true, sx = 0, sy = 0, r = 60 } = {}) {
  ctx.fillStyle = base;
  ctx.fill();
  ctx.save();
  ctx.clip();
  // shade pools at the lower-left, light catches upper-right
  let g = ctx.createRadialGradient(sx - r * 0.6, sy + r * 0.5, 0, sx - r * 0.6, sy + r * 0.5, r * 1.2);
  g.addColorStop(0, rgba(darken(base, 0.45), shade));
  g.addColorStop(1, rgba(darken(base, 0.45), 0));
  ctx.fillStyle = g;
  ctx.fillRect(sx - r * 3, sy - r * 3, r * 6, r * 6);
  g = ctx.createRadialGradient(sx + r * 0.4, sy - r * 0.6, 0, sx + r * 0.4, sy - r * 0.6, r);
  g.addColorStop(0, rgba(lighten(base, 0.6), light));
  g.addColorStop(1, rgba(lighten(base, 0.6), 0));
  ctx.fillStyle = g;
  ctx.fillRect(sx - r * 3, sy - r * 3, r * 6, r * 6);
  ctx.restore();
  if (ink) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = lw;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function ellipse(ctx, x, y, rx, ry, rot = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
}

/** A thick inked limb from (x1,y1) to (x2,y2). */
function limb(ctx, x1, y1, x2, y2, w, color) {
  ctx.lineCap = 'round';
  ctx.strokeStyle = INK;
  ctx.lineWidth = w + 5;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}

function eye(ctx, x, y, closed, s = 1) {
  if (closed) {
    ctx.strokeStyle = INK; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.arc(x, y - 1 * s, 3 * s, 0.2, Math.PI - 0.2); ctx.stroke();
    return;
  }
  ellipse(ctx, x, y, 2.4 * s, 3.4 * s);
  ctx.fillStyle = INK; ctx.fill();
  circle(ctx, x + 0.8 * s, y - 1.3 * s, 0.9 * s);
  ctx.fillStyle = '#ffffff'; ctx.fill();
}

// ------------------------------------------------------------------ Wick

const WICK = {
  cloak: '#3f7f86', lining: '#e0a85a', scarf: '#c8553d', skin: '#f6d6b8',
  hair: '#3b2a2a', legs: '#4a3a4a', boot: '#6a4232', brass: '#d8a548', glass: '#ffd27a',
};

/**
 * pose: { legA, legB, legLen, arm, cloakBack, hoodTip, bob, lean, eyes, cast, scarf }
 */
export function drawWick(ctx, x, y, s, pose = {}, flip = false) {
  const p = { legA: 0.08, legB: -0.08, legLen: 24, arm: 0, cloakBack: 4, hoodTip: 0, bob: 0, lean: 0, eyes: 'open', cast: false, scarf: 0, ...pose };
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip ? -s : s, s);

  const hipY = -34 + p.bob;
  const foot = (a) => [Math.sin(a) * p.legLen, hipY + Math.cos(a) * p.legLen];

  // back leg
  const fb = foot(p.legB);
  limb(ctx, -3, hipY, fb[0] - 3, fb[1], 8, darken(WICK.legs, 0.2));
  ellipse(ctx, fb[0] - 1, fb[1] - 1, 8, 5); paint(ctx, darken(WICK.boot, 0.2), { lw: 2.5, sx: fb[0], sy: fb[1], r: 10 });

  ctx.save();
  ctx.translate(0, hipY);
  ctx.rotate(p.lean);
  ctx.translate(0, -hipY);

  // scarf tail flutters behind
  ctx.beginPath();
  ctx.moveTo(-6, -71 + p.bob);
  ctx.quadraticCurveTo(-18 - p.scarf, -70 + p.bob, -26 - p.scarf * 1.6, -62 + p.bob + Math.sin(p.scarf) * 3);
  ctx.lineTo(-22 - p.scarf * 1.4, -57 + p.bob);
  ctx.quadraticCurveTo(-14, -63 + p.bob, -4, -65 + p.bob);
  ctx.closePath();
  paint(ctx, WICK.scarf, { lw: 2.5, sx: -14, sy: -64, r: 18 });

  // cloak (bell shape, trailing edge flares behind when moving)
  const b = p.bob;
  ctx.beginPath();
  ctx.moveTo(-10, -72 + b);
  ctx.quadraticCurveTo(-22 - p.cloakBack * 0.4, -52 + b, -26 - p.cloakBack, -27 + b - p.cloakBack * 0.4);
  ctx.quadraticCurveTo(-10, -22 + b, 2, -25 + b);
  ctx.quadraticCurveTo(14, -22 + b, 22, -27 + b);
  ctx.quadraticCurveTo(16, -52 + b, 10, -72 + b);
  ctx.closePath();
  paint(ctx, WICK.cloak, { sx: -4, sy: -48 + b, r: 34 });
  // lining peeks out along the front edge
  ctx.strokeStyle = WICK.lining; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(12, -64 + b); ctx.quadraticCurveTo(16, -48 + b, 20, -30 + b); ctx.stroke();
  // a patch, because it was Grandpa's
  ctx.save(); ctx.translate(-12, -40 + b); ctx.rotate(-0.2);
  ctx.fillStyle = darken(WICK.cloak, 0.25); ctx.fillRect(-4, -4, 8, 8);
  ctx.strokeStyle = lighten(WICK.cloak, 0.5); ctx.lineWidth = 1; ctx.setLineDash([2, 2]); ctx.strokeRect(-4, -4, 8, 8); ctx.setLineDash([]);
  ctx.restore();

  // scarf wrap at the neck
  ellipse(ctx, 1, -70 + b, 13, 5.5); paint(ctx, WICK.scarf, { lw: 2.5, sx: 1, sy: -70 + b, r: 14 });

  // hood with a floppy tip
  ctx.beginPath();
  ctx.moveTo(-12, -100 + b);
  ctx.quadraticCurveTo(-26, -108 + b - p.hoodTip, -34, -100 + b - p.hoodTip * 1.4);
  ctx.quadraticCurveTo(-26, -96 + b, -20, -84 + b);
  ctx.closePath();
  paint(ctx, WICK.cloak, { lw: 2.5, sx: -24, sy: -98 + b, r: 14 });
  circle(ctx, 1, -87 + b, 21);
  paint(ctx, WICK.cloak, { sx: 1, sy: -87 + b, r: 24 });

  // face peeking out of the hood
  circle(ctx, 7, -85 + b, 14.5);
  paint(ctx, WICK.skin, { shade: 0.2, light: 0.25, lw: 2.5, sx: 7, sy: -85 + b, r: 16 });
  // fringe
  ctx.beginPath();
  ctx.moveTo(-7, -88 + b);
  ctx.quadraticCurveTo(0, -102 + b, 14, -99 + b);
  ctx.quadraticCurveTo(22, -97 + b, 21, -89 + b);
  ctx.lineTo(17, -92 + b); ctx.lineTo(14, -87 + b); ctx.lineTo(10, -92 + b); ctx.lineTo(5, -88 + b); ctx.lineTo(1, -92 + b);
  ctx.closePath();
  paint(ctx, WICK.hair, { lw: 2, light: 0.2, sx: 6, sy: -94 + b, r: 14 });
  eye(ctx, 10, -82 + b, p.eyes === 'closed');
  eye(ctx, 18.5, -82 + b, p.eyes === 'closed');
  ellipse(ctx, 18, -76 + b, 3.4, 2.2); ctx.fillStyle = rgba('#e8806a', 0.5); ctx.fill();
  if (p.eyes === 'worried') {
    ctx.strokeStyle = INK; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(7, -89 + b); ctx.lineTo(12, -87.5 + b); ctx.moveTo(21, -89 + b); ctx.lineTo(16.5, -87.5 + b); ctx.stroke();
  }
  // tiny mouth
  ctx.strokeStyle = INK; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(15, -76 + b, 2, 0.3, Math.PI - 0.3); ctx.stroke();

  // arm + lantern
  const sh = [6, -62 + b];
  const hand = p.cast ? [18, -84 + b] : [15 + p.arm * 6, -44 + b - Math.abs(p.arm) * 2];
  limb(ctx, sh[0], sh[1], hand[0], hand[1], 8, WICK.cloak);
  circle(ctx, hand[0], hand[1], 4); paint(ctx, WICK.skin, { lw: 2, shade: 0.1, light: 0.1, sx: hand[0], sy: hand[1], r: 5 });
  const lx = hand[0] + 2 + p.arm * 2, ly = hand[1] + 13;
  ctx.strokeStyle = INK; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(hand[0], hand[1] + 2); ctx.lineTo(lx, ly - 8); ctx.stroke();
  const gl = ctx.createRadialGradient(lx, ly, 0, lx, ly, 22);
  gl.addColorStop(0, 'rgba(255,210,122,0.55)'); gl.addColorStop(1, 'rgba(255,210,122,0)');
  ctx.fillStyle = gl; ctx.fillRect(lx - 22, ly - 22, 44, 44);
  circle(ctx, lx, ly, 8); paint(ctx, WICK.brass, { lw: 2.5, sx: lx, sy: ly, r: 10 });
  circle(ctx, lx, ly, 4.8); ctx.fillStyle = WICK.glass; ctx.fill();
  circle(ctx, lx - 0.8, ly - 0.8, 2.2); ctx.fillStyle = '#fffbe8'; ctx.fill();
  ctx.fillStyle = INK; ctx.fillRect(lx - 4, ly - 10, 8, 3);

  ctx.restore(); // lean

  // front leg
  const ff = foot(p.legA);
  limb(ctx, 4, hipY, ff[0] + 4, ff[1], 8, WICK.legs);
  ellipse(ctx, ff[0] + 6, ff[1] - 1, 8.5, 5.2); paint(ctx, WICK.boot, { lw: 2.5, sx: ff[0] + 6, sy: ff[1], r: 10 });

  ctx.restore();
}

// Animation frames for Wick. Each entry is a pose.
const TAU = Math.PI * 2;
export const WICK_FRAMES = [];
export const WICK_ANIMS = {};
function addFrames(name, poses, rate, repeat = -1) {
  const start = WICK_FRAMES.length;
  WICK_FRAMES.push(...poses);
  WICK_ANIMS[name] = { start, count: poses.length, rate, repeat };
}
addFrames('idle', Array.from({ length: 12 }, (_, i) => ({
  bob: Math.round(Math.sin((i / 12) * TAU) * 1.2 + 1.2) * 0.8,
  eyes: i === 10 ? 'closed' : 'open',
  scarf: Math.sin((i / 12) * TAU) * 1.5,
  cloakBack: 3 + Math.sin((i / 12) * TAU),
})), 8);
addFrames('run', Array.from({ length: 8 }, (_, i) => {
  const ph = (i / 8) * TAU;
  return {
    legA: Math.sin(ph) * 0.75, legB: -Math.sin(ph) * 0.75,
    bob: -Math.abs(Math.sin(ph)) * 3.5, arm: -Math.sin(ph), lean: 0.1,
    cloakBack: 10 + Math.sin(ph * 2) * 3, hoodTip: 4 + Math.sin(ph * 2) * 2, scarf: 8 + Math.sin(ph * 2) * 2,
  };
}), 14);
addFrames('jump', [{ legA: 0.6, legB: -0.25, legLen: 19, arm: -0.6, cloakBack: 6, hoodTip: -2, scarf: 5 }], 1, 0);
addFrames('fall', [
  { legA: 0.25, legB: -0.2, arm: 0.8, cloakBack: 12, hoodTip: 9, scarf: 10, eyes: 'worried' },
  { legA: 0.3, legB: -0.25, arm: 0.9, cloakBack: 14, hoodTip: 11, scarf: 12, eyes: 'worried' },
], 10);
addFrames('cast', [
  { cast: true, cloakBack: 6, scarf: 6, eyes: 'closed' },
  { cast: true, cloakBack: 8, scarf: 8, eyes: 'open', bob: -1 },
], 6, 0);
addFrames('sleepy', [{ eyes: 'closed', bob: 1.5, lean: 0.05 }], 1, 0);

// ------------------------------------------------------------------ Pip

export function drawPip(ctx, x, y, s, { phase = 0, mood = 'happy', glow = 1 } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const sway = Math.sin(phase) * 3;
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
  g.addColorStop(0, `rgba(255,190,90,${0.5 * glow})`); g.addColorStop(1, 'rgba(255,190,90,0)');
  ctx.fillStyle = g; ctx.fillRect(-30, -30, 60, 60);
  const flame = (scale, color) => {
    ctx.beginPath();
    ctx.moveTo(0, 12 * scale);
    ctx.bezierCurveTo(-13 * scale, 12 * scale, -14 * scale, -2 * scale, -6 * scale, -10 * scale);
    ctx.quadraticCurveTo(sway * 0.6 * scale, -14 * scale, sway * scale, -24 * scale);
    ctx.quadraticCurveTo(10 * scale, -10 * scale, 12 * scale, -2 * scale);
    ctx.bezierCurveTo(14 * scale, 8 * scale, 8 * scale, 12 * scale, 0, 12 * scale);
    ctx.closePath();
    ctx.fillStyle = color; ctx.fill();
  };
  flame(1, '#ff7a3a');
  ctx.strokeStyle = rgba('#a8341c', 0.8); ctx.lineWidth = 1.5; ctx.stroke();
  flame(0.78, '#ffb648');
  flame(0.5, '#fff1c0');
  if (mood === 'sleep') {
    ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-6, 2); ctx.lineTo(-2, 2); ctx.moveTo(2, 2); ctx.lineTo(6, 2); ctx.stroke();
  } else {
    eye(ctx, -4, 2, false, 0.75);
    eye(ctx, 4, 2, false, 0.75);
    if (mood === 'worried') {
      ctx.strokeStyle = INK; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(-7, -3); ctx.lineTo(-2, -2); ctx.moveTo(7, -3); ctx.lineTo(2, -2); ctx.stroke();
    }
  }
  ctx.restore();
}

// ------------------------------------------------------------------ Gloomlings

const GLOOM = { body: '#4b4258', top: '#7a6d8c', eye: '#fdf6ea' };

export function drawGloomling(ctx, x, y, s, { sx = 1, sy = 1, step = 0, seed = 3, pupils = 1 } = {}) {
  const rand = rng(seed);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  // little feet
  ctx.fillStyle = INK;
  ellipse(ctx, -9 + step * 3, -3, 6, 3.5); ctx.fill();
  ellipse(ctx, 9 - step * 3, -3, 6, 3.5); ctx.fill();
  ctx.scale(sx, sy);
  // fuzzy soot edge
  for (let i = 0; i < 46; i++) {
    const a = (i / 46) * Math.PI * 2;
    const r = 25 + rand() * 4;
    circle(ctx, Math.cos(a) * r, -27 + Math.sin(a) * r * 0.9, 4 + rand() * 4);
    ctx.fillStyle = rgba(darken(GLOOM.body, 0.3), 0.9); ctx.fill();
  }
  ellipse(ctx, 0, -27, 26, 24);
  paint(ctx, GLOOM.body, { ink: false, shade: 0.4, light: 0.45, sx: 0, sy: -27, r: 26 });
  granulate(ctx, -24, -50, 48, 46, '#1a1020', rand, 0.03, 0.3);
  // sad worried eyes
  for (const ex of [-9, 9]) {
    ellipse(ctx, ex, -30, 6.5, 7.5); ctx.fillStyle = GLOOM.eye; ctx.fill();
    circle(ctx, ex + 2 * pupils, -28, 3); ctx.fillStyle = INK; ctx.fill();
  }
  ctx.strokeStyle = GLOOM.eye; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-15, -38); ctx.lineTo(-5, -42); ctx.moveTo(15, -38); ctx.lineTo(5, -42); ctx.stroke();
  ctx.restore();
}

export function drawHopper(ctx, x, y, s, { crouch = 0, air = false, seed = 9 } = {}) {
  const rand = rng(seed);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const h = air ? 1.12 : 1 - crouch * 0.18;
  const w = air ? 0.9 : 1 + crouch * 0.12;
  // legs
  ctx.fillStyle = INK;
  if (air) {
    limb(ctx, -10, -10, -16, 0, 5, '#3c4a46'); limb(ctx, 10, -10, 16, 0, 5, '#3c4a46');
  } else {
    ellipse(ctx, -14, -3, 9, 4); ctx.fill(); ellipse(ctx, 14, -3, 9, 4); ctx.fill();
  }
  ctx.translate(0, air ? -8 : 0);
  ctx.scale(w, h);
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    circle(ctx, Math.cos(a) * 27, -22 + Math.sin(a) * 19, 3 + rand() * 4);
    ctx.fillStyle = 'rgba(30,36,40,0.9)'; ctx.fill();
  }
  ellipse(ctx, 0, -22, 28, 20);
  paint(ctx, '#46605a', { ink: false, shade: 0.4, light: 0.4, sx: 0, sy: -22, r: 26 });
  granulate(ctx, -26, -42, 52, 40, '#1a1020', rand, 0.03, 0.3);
  // eyes sit on top like a toad
  for (const ex of [-12, 12]) {
    circle(ctx, ex, -38, 7.5); ctx.fillStyle = '#46605a'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    circle(ctx, ex, -38, 5); ctx.fillStyle = GLOOM.eye; ctx.fill();
    circle(ctx, ex + 1.5, -37, 2.6); ctx.fillStyle = INK; ctx.fill();
  }
  ctx.strokeStyle = INK; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-12, -18); ctx.quadraticCurveTo(0, -14, 12, -18); ctx.stroke();
  ctx.restore();
}

/** The small bright spirit released when a Gloomling is freed. */
export function drawWisp(ctx, x, y, s, { phase = 0 } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 22);
  g.addColorStop(0, 'rgba(220,255,210,0.7)'); g.addColorStop(1, 'rgba(220,255,210,0)');
  ctx.fillStyle = g; ctx.fillRect(-22, -22, 44, 44);
  ellipse(ctx, 0, 2, 10, 9); paint(ctx, '#f4fbe8', { lw: 2, shade: 0.15, sx: 0, sy: 2, r: 10 });
  // sprout
  ctx.strokeStyle = '#5c8a3a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, -7); ctx.quadraticCurveTo(1, -12, 0, -15); ctx.stroke();
  ellipse(ctx, 4, -15, 4.5, 2.5, -0.5 + Math.sin(phase) * 0.2); ctx.fillStyle = '#86c35a'; ctx.fill();
  ellipse(ctx, -4, -14, 3.5, 2, 0.5 - Math.sin(phase) * 0.2); ctx.fillStyle = '#86c35a'; ctx.fill();
  circle(ctx, -3, 2, 1.4); ctx.fillStyle = INK; ctx.fill();
  circle(ctx, 3, 2, 1.4); ctx.fill();
  ctx.restore();
}

// ------------------------------------------------------------------ NPCs

/** Grandpa Tallow. `sleep` slumps him and adds creeping moss. */
export function drawGrandpa(ctx, x, y, s, { sleep = false, flip = false, moss = 0 } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip ? -s : s, s);
  const slump = sleep ? 6 : 0;
  // legs + boots
  limb(ctx, -6, -30, -7, -4, 9, '#5a4a3a');
  limb(ctx, 6, -30, 8, -4, 9, '#5a4a3a');
  ellipse(ctx, -5, -3, 9, 5); paint(ctx, '#4a3024', { lw: 2.5, sx: -5, sy: -3, r: 10 });
  ellipse(ctx, 11, -3, 9, 5); paint(ctx, '#4a3024', { lw: 2.5, sx: 11, sy: -3, r: 10 });
  // long coat
  ctx.beginPath();
  ctx.moveTo(-14, -78 + slump);
  ctx.quadraticCurveTo(-26, -50, -24, -22);
  ctx.lineTo(24, -22);
  ctx.quadraticCurveTo(24, -50, 14, -78 + slump);
  ctx.closePath();
  paint(ctx, '#7a5a3c', { sx: 0, sy: -50, r: 34 });
  ctx.strokeStyle = '#d8a548'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-23, -40); ctx.lineTo(23, -40); ctx.stroke();
  // head
  circle(ctx, 2, -92 + slump, 16); paint(ctx, '#efc9a8', { lw: 2.5, sx: 2, sy: -92, r: 18 });
  // beard
  ctx.beginPath();
  ctx.moveTo(-10, -90 + slump);
  ctx.quadraticCurveTo(-4, -64 + slump, 6, -64 + slump);
  ctx.quadraticCurveTo(18, -70 + slump, 16, -88 + slump);
  ctx.quadraticCurveTo(4, -82 + slump, -10, -90 + slump);
  paint(ctx, '#ece6dc', { lw: 2.5, shade: 0.25, sx: 4, sy: -76, r: 14 });
  // cap
  ctx.beginPath();
  ctx.moveTo(-15, -98 + slump); ctx.quadraticCurveTo(0, -116 + slump, 17, -100 + slump); ctx.lineTo(24, -98 + slump); ctx.lineTo(-15, -96 + slump);
  ctx.closePath();
  paint(ctx, '#3f5f6a', { lw: 2.5, sx: 2, sy: -104, r: 14 });
  eye(ctx, 6, -92 + slump, sleep, 0.9);
  eye(ctx, 13, -92 + slump, sleep, 0.9);
  // bushy brows + nose
  ctx.fillStyle = '#ece6dc';
  ellipse(ctx, 5, -97 + slump, 4, 1.8); ctx.fill(); ellipse(ctx, 14, -97 + slump, 4, 1.8); ctx.fill();
  circle(ctx, 12, -87 + slump, 3.2); paint(ctx, '#e5a88a', { lw: 1.5, shade: 0.1, sx: 12, sy: -87, r: 4 });
  if (moss > 0) {
    const rand = rng(21);
    for (let i = 0; i < 40 * moss; i++) {
      circle(ctx, -24 + rand() * 50, -2 - rand() * 30 * moss, 2 + rand() * 4);
      ctx.fillStyle = rgba(rand() < 0.5 ? '#6f9a4a' : '#4f7a3a', 0.85); ctx.fill();
    }
  }
  ctx.restore();
}

/** A sleeping villager slumped against something; colours vary per villager. */
export function drawSleeper(ctx, x, y, s, { coat = '#8a5a6a', hair = '#4a3020', seed = 1 } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ellipse(ctx, 0, -14, 26, 15); paint(ctx, coat, { sx: 0, sy: -14, r: 26 });
  circle(ctx, 18, -30, 13); paint(ctx, '#efcfb0', { lw: 2.5, sx: 18, sy: -30, r: 14 });
  ctx.beginPath(); ctx.arc(18, -33, 13, Math.PI * 1.05, Math.PI * 1.95); ctx.lineTo(18, -30); ctx.closePath();
  paint(ctx, hair, { lw: 2, sx: 18, sy: -38, r: 12 });
  eye(ctx, 15, -28, true, 0.8); eye(ctx, 22, -28, true, 0.8);
  const rand = rng(seed);
  for (let i = 0; i < 18; i++) {
    circle(ctx, -24 + rand() * 48, -2 - rand() * 10, 2 + rand() * 3);
    ctx.fillStyle = rgba('#6f9a4a', 0.8); ctx.fill();
  }
  ctx.restore();
}

/** Mossback the tortoise: a hill with a shrine on its back. Drawn huge. */
export function drawMossback(ctx, x, y, s, { eyeOpen = 0, seed = 5 } = {}) {
  const rand = rng(seed);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  // feet
  for (const fx of [-150, -60, 70, 150]) {
    ellipse(ctx, fx, -20, 38, 26); paint(ctx, '#8a8a6a', { sx: fx, sy: -20, r: 40 });
  }
  // head
  ctx.beginPath();
  ctx.moveTo(170, -70); ctx.quadraticCurveTo(250, -90, 280, -60); ctx.quadraticCurveTo(290, -30, 250, -24);
  ctx.quadraticCurveTo(200, -20, 160, -40); ctx.closePath();
  paint(ctx, '#9a9a78', { sx: 230, sy: -55, r: 60 });
  if (eyeOpen > 0) {
    ellipse(ctx, 252, -60, 11, 11 * eyeOpen); ctx.fillStyle = '#fff6dc'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
    circle(ctx, 255, -60, 5 * eyeOpen); ctx.fillStyle = '#2a2018'; ctx.fill();
  } else {
    ctx.strokeStyle = INK; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(252, -62, 10, 0.3, Math.PI - 0.3); ctx.stroke();
  }
  // shell: a mossy hill
  ctx.beginPath();
  ctx.moveTo(-210, -30);
  ctx.bezierCurveTo(-200, -230, 200, -230, 210, -30);
  ctx.closePath();
  paint(ctx, '#6e8a52', { sx: 0, sy: -120, r: 200, shade: 0.5 });
  ctx.save(); ctx.clip();
  for (let i = 0; i < 9; i++) {
    const px = -180 + i * 45, py = -40 - rand() * 120;
    ctx.strokeStyle = rgba('#3f5a32', 0.5); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(px, py, 34, 22, 0, 0, Math.PI * 2); ctx.stroke();
  }
  granulate(ctx, -210, -200, 420, 180, '#2a3a20', rand, 0.01, 0.4);
  ctx.restore();
  // tiny shrine on top
  ctx.fillStyle = '#b2523a'; ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
  ctx.fillRect(-6, -214, 6, 34); ctx.strokeRect(-6, -214, 6, 34);
  ctx.fillRect(26, -214, 6, 34); ctx.strokeRect(26, -214, 6, 34);
  ctx.beginPath(); ctx.moveTo(-18, -214); ctx.lineTo(44, -214); ctx.lineTo(40, -222); ctx.lineTo(-14, -222); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillRect(-10, -206, 46, 4);
  ctx.restore();
}

// ------------------------------------------------------------------ sprite sheets

export function createCharacterTextures(scene) {
  const S = 1; // frames are painted at 2x and displayed at 0.5 scale
  addSheet(scene, 'wick', 128, 128, WICK_FRAMES.length, (ctx, i) => drawWick(ctx, 64, 124, S, WICK_FRAMES[i]));
  addSheet(scene, 'pip', 64, 64, 8, (ctx, i) => drawPip(ctx, 32, 36, 1, { phase: (i / 8) * TAU }));
  addSheet(scene, 'gloomling', 96, 96, 4, (ctx, i) => {
    const sq = [[1, 1], [1.05, 0.95], [1, 1], [0.96, 1.04]][i];
    drawGloomling(ctx, 48, 92, 1, { sx: sq[0], sy: sq[1], step: i % 2 ? 1 : -1 });
  });
  addSheet(scene, 'hopper', 96, 96, 3, (ctx, i) => drawHopper(ctx, 48, 92, 1, { crouch: i === 1 ? 1 : 0, air: i === 2 }));
  addSheet(scene, 'wisp', 48, 48, 2, (ctx, i) => drawWisp(ctx, 24, 26, 1, { phase: i * Math.PI }));
  addSheet(scene, 'grandpa-sleep', 128, 160, 1, (ctx) => drawGrandpa(ctx, 64, 154, 1, { sleep: true, moss: 0.6 }));
  const sleepers = [['#8a5a6a', '#4a3020'], ['#5a6a8a', '#c9a060'], ['#7a7a4a', '#2a2020']];
  addSheet(scene, 'sleeper', 96, 64, 3, (ctx, i) => drawSleeper(ctx, 40, 60, 1, { coat: sleepers[i][0], hair: sleepers[i][1], seed: i + 1 }));

  const a = scene.anims;
  for (const [name, { start, count, rate, repeat }] of Object.entries(WICK_ANIMS)) {
    a.create({ key: `wick-${name}`, frames: a.generateFrameNumbers('wick', { start, end: start + count - 1 }), frameRate: rate, repeat });
  }
  a.create({ key: 'pip-float', frames: a.generateFrameNumbers('pip', { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
  a.create({ key: 'gloomling-walk', frames: a.generateFrameNumbers('gloomling', { start: 0, end: 3 }), frameRate: 6, repeat: -1 });
  a.create({ key: 'wisp-float', frames: a.generateFrameNumbers('wisp', { start: 0, end: 1 }), frameRate: 4, repeat: -1 });
}
