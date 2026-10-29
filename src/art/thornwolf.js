// The Thornwolf (Haru): a white forest-guardian wolf tangled in Gloom brambles.
// Drawn facing right, in "wolf space": origin at the ground under his chest.

import { addSheet, rng, rgba, granulate } from './paint.js';
import { INK, paint, circle, ellipse, limb } from './characters.js';

const FUR = '#ece6dc';
const FUR_SHADE = '#b9b2c4';

/**
 * pose: { crouch 0..1, legPhase radians, leap, stun, brambles 0..1, eyes: 'angry'|'calm'|'closed'|'dizzy', tail }
 */
export function drawThornwolf(ctx, x, y, s, pose = {}) {
  const p = { crouch: 0, legPhase: 0, leap: false, stun: false, brambles: 1, eyes: 'angry', tail: 0, ...pose };
  const rand = rng(77);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  const dip = p.crouch * 14 + (p.stun ? 8 : 0);
  const bodyY = -78 + dip;
  const legs = [
    { hx: 52, side: 1, phase: 0 }, { hx: 40, side: 0, phase: Math.PI },
    { hx: -48, side: 1, phase: Math.PI }, { hx: -60, side: 0, phase: 0 },
  ];

  // legs on the far side first, darker
  for (const back of [0, 1]) {
    for (const l of legs) {
      if (l.side !== back) continue;
      let a = Math.sin(p.legPhase + l.phase) * 0.55;
      if (p.leap) a = l.hx > 0 ? -0.9 : 0.9;
      const len = 60 - p.crouch * 14;
      const fx = l.hx + Math.sin(a) * len, fy = bodyY + 20 + Math.cos(a) * len;
      limb(ctx, l.hx, bodyY + 18, fx, Math.min(fy, 0), 20, back ? FUR : FUR_SHADE);
      ellipse(ctx, fx + 7, Math.min(fy, 0) - 4, 14, 7);
      paint(ctx, back ? FUR : FUR_SHADE, { lw: 2.5, sx: fx, sy: fy, r: 10 });
    }
    if (back === 0) {
      // tail: a big bushy plume
      const t = p.tail;
      ctx.beginPath();
      ctx.moveTo(-80, bodyY - 22);
      ctx.bezierCurveTo(-120, bodyY - 74, -178, bodyY - 64 + t * 8, -168, bodyY - 104 + t * 12);
      ctx.bezierCurveTo(-126, bodyY - 96, -96, bodyY - 40, -70, bodyY + 18);
      ctx.closePath();
      paint(ctx, FUR, { sx: -120, sy: bodyY - 50, r: 50 });
      // torso
      ellipse(ctx, 0, bodyY, 92, 44);
      paint(ctx, FUR, { sx: 0, sy: bodyY, r: 90, shade: 0.45 });
      // fur tufts along the back
      ctx.fillStyle = FUR;
      ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
      for (let i = 0; i < 6; i++) {
        const tx = -70 + i * 26, ty = bodyY - 40 + Math.abs(i - 2.5) * 3;
        ctx.beginPath(); ctx.moveTo(tx - 10, ty + 6); ctx.lineTo(tx, ty - 9); ctx.lineTo(tx + 10, ty + 6); ctx.fill(); ctx.stroke();
      }
    }
  }

  // head and neck
  const hx = 96, hy = bodyY - 32 + (p.stun ? 18 : 0) + p.crouch * 10;
  ctx.beginPath();
  ctx.moveTo(48, bodyY - 30); ctx.quadraticCurveTo(80, hy - 30, hx + 10, hy - 22);
  ctx.lineTo(hx + 18, hy + 30); ctx.quadraticCurveTo(70, bodyY + 20, 46, bodyY + 10);
  ctx.closePath();
  paint(ctx, FUR, { sx: 70, sy: hy, r: 50 });
  for (const ex of [-6, 14]) {
    ctx.beginPath(); ctx.moveTo(hx + ex - 10, hy - 18); ctx.lineTo(hx + ex - 2, hy - 52 + (p.stun ? 14 : 0)); ctx.lineTo(hx + ex + 10, hy - 16); ctx.closePath();
    paint(ctx, FUR, { lw: 2.5, sx: hx + ex, sy: hy - 30, r: 16 });
  }
  ctx.beginPath();
  ctx.moveTo(hx - 18, hy - 14);
  ctx.quadraticCurveTo(hx + 6, hy - 30, hx + 30, hy - 10);
  ctx.lineTo(hx + 64, hy + 2); ctx.quadraticCurveTo(hx + 70, hy + 12, hx + 60, hy + 16);
  ctx.quadraticCurveTo(hx + 30, hy + 30, hx - 10, hy + 22);
  ctx.closePath();
  paint(ctx, FUR, { sx: hx + 20, sy: hy, r: 40 });
  circle(ctx, hx + 64, hy + 4, 5.5); ctx.fillStyle = INK; ctx.fill();
  // eye
  const exx = hx + 22, eyy = hy - 6;
  if (p.eyes === 'closed') {
    ctx.strokeStyle = INK; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(exx, eyy - 2, 7, 0.3, Math.PI - 0.3); ctx.stroke();
  } else if (p.eyes === 'dizzy') {
    ctx.strokeStyle = INK; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let a = 0; a < 12; a += 0.4) ctx.lineTo(exx + Math.cos(a) * a * 0.6, eyy + Math.sin(a) * a * 0.6);
    ctx.stroke();
  } else {
    const angry = p.eyes === 'angry';
    ellipse(ctx, exx, eyy, 8, angry ? 4.5 : 7); ctx.fillStyle = angry ? '#ff6a3a' : '#f2c25a'; ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    ellipse(ctx, exx + 2, eyy, 2.5, angry ? 3.5 : 5); ctx.fillStyle = INK; ctx.fill();
    if (angry) {
      ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(exx - 12, eyy - 12); ctx.lineTo(exx + 10, eyy - 5); ctx.stroke();
      // bared teeth
      ctx.fillStyle = '#fff8ee'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        const tx = hx + 34 + i * 7;
        ctx.beginPath(); ctx.moveTo(tx, hy + 14); ctx.lineTo(tx + 3, hy + 21); ctx.lineTo(tx + 6, hy + 14); ctx.fill(); ctx.stroke();
      }
    }
  }

  // brambles and soot of the Gloom wrapped around him
  const n = Math.round(16 * p.brambles);
  for (let i = 0; i < 16; i++) {
    const r1 = rand(), r2 = rand(), r3 = rand(), r4 = rand();
    if (i >= n) continue;
    const sx = -90 + r1 * 200, sy = bodyY - 40 + r2 * 70;
    const ex = sx + (r3 - 0.5) * 120, ey = sy + (r4 - 0.3) * 60;
    ctx.strokeStyle = '#2e2030'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.bezierCurveTo(sx + 30, sy - 40, ex - 30, ey + 40, ex, ey); ctx.stroke();
    ctx.strokeStyle = '#6a4a6a'; ctx.lineWidth = 2; ctx.stroke();
    for (let k = 1; k < 4; k++) {
      const t = k / 4, tx = sx + (ex - sx) * t, ty = sy + (ey - sy) * t - Math.sin(t * Math.PI) * 10;
      ctx.fillStyle = '#e8dcd0';
      ctx.beginPath(); ctx.moveTo(tx - 3, ty); ctx.lineTo(tx, ty - 10); ctx.lineTo(tx + 3, ty); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
    }
  }
  if (p.brambles > 0) {
    ctx.save();
    ellipse(ctx, 0, bodyY, 92, 44); ctx.clip();
    granulate(ctx, -92, bodyY - 44, 184, 88, '#2a2030', rand, 0.03 * p.brambles, 0.5);
    ctx.restore();
  }
  ctx.restore();
}

/** Haru asleep, curled up and at peace. */
export function drawHaruSleeping(ctx, x, y, s) {
  const rand = rng(12);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(-120, -10); ctx.bezierCurveTo(-170, -60, -150, -110, -80, -96); ctx.bezierCurveTo(-110, -70, -100, -30, -40, -14); ctx.closePath();
  paint(ctx, FUR, { sx: -120, sy: -60, r: 50 });
  ellipse(ctx, 0, -46, 110, 48);
  paint(ctx, FUR, { sx: 0, sy: -46, r: 100, shade: 0.4 });
  ellipse(ctx, 90, -30, 46, 26, 0.2);
  paint(ctx, FUR, { sx: 90, sy: -30, r: 40 });
  for (const ex of [70, 92]) {
    ctx.beginPath(); ctx.moveTo(ex - 10, -48); ctx.lineTo(ex - 4, -78); ctx.lineTo(ex + 10, -46); ctx.closePath();
    paint(ctx, FUR, { lw: 2.5, sx: ex, sy: -60, r: 14 });
  }
  circle(ctx, 132, -24, 5); ctx.fillStyle = INK; ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(100, -36, 8, 0.3, Math.PI - 0.3); ctx.stroke();
  // flowers blooming where the brambles were
  for (let i = 0; i < 14; i++) {
    const fx = -100 + rand() * 220, fy = -6 - rand() * 8;
    const c = ['#fff4e8', '#ffd0dc', '#ffe07a', '#c8b8ff'][i % 4];
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(fx + Math.cos(a) * 4, fy + Math.sin(a) * 4, 3.4, 2.4, a, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#f0a040'; ctx.beginPath(); ctx.arc(fx, fy, 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// Frame order in each sheet: 0 stand, 1 crouch, 2 run A, 3 run B, 4 leap, 5 stunned.
export const WOLF_FRAMES = { stand: 0, crouch: 1, runA: 2, runB: 3, leap: 4, stun: 5 };
const POSES = [
  {}, { crouch: 1 }, { legPhase: 0.9, tail: 1 }, { legPhase: 0.9 + Math.PI, tail: -1 }, { leap: true, tail: 1 }, { stun: true, eyes: 'dizzy' },
];
// One sheet per number of shrine lanterns lit: the brambles fall away as he remembers.
const STAGES = [1, 0.7, 0.45, 0.2];

export function createThornwolfTextures(scene) {
  STAGES.forEach((brambles, stage) => {
    addSheet(scene, `wolf-${stage}`, 360, 240, POSES.length, (ctx, i) => {
      drawThornwolf(ctx, 170, 232, 1, { ...POSES[i], brambles, eyes: POSES[i].eyes || (stage === 3 ? 'calm' : 'angry') });
    });
  });
  addSheet(scene, 'wolf-calm', 360, 240, 1, (ctx) => drawThornwolf(ctx, 170, 232, 1, { brambles: 0, eyes: 'calm' }));
  addSheet(scene, 'wolf-sleep', 360, 160, 1, (ctx) => drawHaruSleeping(ctx, 170, 152, 1));

  // A burst of thorns that erupts from the ground during the last phase.
  addSheet(scene, 'thornburst', 48, 72, 1, (ctx) => {
    const rand = rng(31);
    for (let i = 0; i < 5; i++) {
      const bx = 6 + rand() * 36, h = 40 + rand() * 28, lean = (rand() - 0.5) * 16;
      ctx.fillStyle = '#3a2a3a'; ctx.strokeStyle = INK; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(bx - 6, 72); ctx.lineTo(bx + lean, 72 - h); ctx.lineTo(bx + 6, 72); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = rgba('#8a5a8a', 0.8);
      ctx.beginPath(); ctx.moveTo(bx - 2, 72); ctx.lineTo(bx + lean * 0.9, 76 - h); ctx.lineTo(bx + 1, 72); ctx.closePath(); ctx.fill();
    }
  });

  // Stone shrine lantern: frame 0 dark, frame 1 lit.
  addSheet(scene, 'shrine', 80, 128, 2, (ctx, i) => {
    const stone = '#a8aaa0';
    const g = (x, y, w, h) => { ctx.beginPath(); ctx.rect(x, y, w, h); paint(ctx, stone, { lw: 3, sx: x + w / 2, sy: y + h / 2, r: Math.max(w, h) }); };
    g(22, 104, 36, 22);
    g(33, 66, 14, 40);
    g(18, 56, 44, 12);
    if (i === 1) {
      const gr = ctx.createRadialGradient(40, 42, 0, 40, 42, 40);
      gr.addColorStop(0, 'rgba(255,214,130,0.95)'); gr.addColorStop(1, 'rgba(255,214,130,0)');
      ctx.fillStyle = gr; ctx.fillRect(0, 2, 80, 80);
    }
    g(22, 28, 36, 28);
    ctx.fillStyle = i ? '#ffd27a' : '#3a3a48';
    ctx.fillRect(30, 34, 20, 16);
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(30, 34, 20, 16);
    if (i) { ctx.fillStyle = '#fff8e0'; ctx.fillRect(36, 38, 8, 8); }
    ctx.beginPath(); ctx.moveTo(8, 30); ctx.quadraticCurveTo(40, 6, 72, 30); ctx.closePath();
    paint(ctx, stone, { lw: 3, sx: 40, sy: 22, r: 34 });
    ctx.fillStyle = rgba('#6f9a4a', 0.85);
    ctx.beginPath(); ctx.ellipse(40, 18, 14, 5, 0, 0, Math.PI * 2); ctx.fill();
  });
}
