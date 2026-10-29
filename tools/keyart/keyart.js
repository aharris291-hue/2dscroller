// Paints Steam store/library images from the game's own art.
// Open /tools/keyart/?w=920&h=430&layout=header in the dev server; tools/steam-art.cjs saves them all.
import '@fontsource/patrick-hand';
import { rng, rgba, wash, blobPoints, glow, skyGradient, paperCanvas, darken } from '../../src/art/paint.js';
import { drawWick, drawPip } from '../../src/art/characters.js';
import { drawMorrow } from '../../src/art/heart.js';

const q = new URLSearchParams(location.search);
const W = +q.get('w') || 920, H = +q.get('h') || 430;
const L = {
  // cx: where Wick stands (fraction of width), cs: character scale (in heights), logo: [x, y, size] fractions, moth: show Morrow
  header: { cx: 0.76, cs: 0.42, logo: [0.36, 0.42, 0.24], moth: true },
  small: { cx: 0.86, cs: 0.55, logo: [0.4, 0.5, 0.36], moth: false },
  main: { cx: 0.76, cs: 0.4, logo: [0.36, 0.4, 0.2], moth: true },
  vertical: { cx: 0.5, cs: 0.32, logo: [0.5, 0.17, 0.12], moth: true },
  libcapsule: { cx: 0.5, cs: 0.3, logo: [0.5, 0.15, 0.1], moth: true },
  background: { cx: 0.8, cs: 0.3, logo: null, moth: false, soft: true },
  hero: { cx: 0.72, cs: 0.36, logo: null, moth: true },
  logo: { logo: [0.5, 0.5, 0.36], only: true },
}[q.get('layout') || 'header'];

const c = document.createElement('canvas');
c.width = W; c.height = H;
document.body.appendChild(c);
const ctx = c.getContext('2d');
const rand = rng(42);
const ground = H * 0.8;

function logo(x, y, size) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${size}px "Patrick Hand"`;
  while (ctx.measureText('Ember Hollow').width > W * 0.88) { size *= 0.95; ctx.font = `${size}px "Patrick Hand"`; }
  ctx.shadowColor = 'rgba(255,170,80,0.85)';
  ctx.shadowBlur = size * 0.35;
  ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.09;
  ctx.strokeStyle = '#3a2630';
  ctx.strokeText('Ember Hollow', x, y);
  ctx.shadowBlur = 0;
  const g = ctx.createLinearGradient(0, y - size / 2, 0, y + size / 2);
  g.addColorStop(0, '#fff3cf'); g.addColorStop(1, '#ffb45e');
  ctx.fillStyle = g;
  ctx.fillText('Ember Hollow', x, y);
  ctx.restore();
}

function hills(color, baseY, amp, seed, alpha = 0.9) {
  const r = rng(seed);
  const pts = [[-50, H + 50]];
  for (let x = -50; x <= W + 50; x += Math.max(40, W / 30)) pts.push([x, baseY - Math.sin(x / W * 5 + seed) * amp - r() * amp * 0.4]);
  pts.push([W + 50, H + 50]);
  wash(ctx, pts, color, r, { layers: 4, alpha: alpha / 3, amp: 6 });
}

function house(x, base, s, r) {
  ctx.fillStyle = '#3a2a40';
  ctx.fillRect(x - 30 * s, base - 40 * s, 60 * s, 40 * s);
  ctx.beginPath(); ctx.moveTo(x - 40 * s, base - 38 * s); ctx.lineTo(x, base - 70 * s); ctx.lineTo(x + 40 * s, base - 38 * s); ctx.fill();
  glow(ctx, x - 10 * s, base - 22 * s, 26 * s, '#ffc070', 0.6);
  ctx.fillStyle = '#ffd890';
  ctx.fillRect(x - 16 * s, base - 28 * s, 11 * s, 11 * s);
  if (r() < 0.6) ctx.fillRect(x + 8 * s, base - 28 * s, 11 * s, 11 * s);
}

function scene() {
  skyGradient(ctx, W, H, [[0, '#2e2a5a'], [0.4, '#7a5a86'], [0.75, '#e08a6a'], [1, '#f6c98a']], rand);
  glow(ctx, W * 0.62, H * 0.62, Math.max(W, H) * 0.35, '#ffd9a0', 0.55);
  // stars
  for (let i = 0; i < W * H / 6000; i++) { ctx.fillStyle = rgba('#fff4d8', 0.3 + rand() * 0.5); ctx.fillRect(rand() * W, rand() * H * 0.4, 2, 2); }
  if (L.moth) {
    // tall images: a smaller moth high in the sky, clear of Wick and Pip
    const tall = H > W;
    ctx.save(); ctx.globalAlpha = tall ? 0.3 : 0.36;
    drawMorrow(ctx, W * (tall ? 0.5 : 0.3), H * (tall ? 0.27 : 0.36), H * (tall ? 0.0015 : 0.0026), { eyes: 'sad', open: 1 });
    ctx.restore();
  }
  hills('#8a6f8f', H * 0.62, H * 0.06, 3);
  // village on the middle hill, lanterns strung between houses
  const r = rng(11);
  const hs = H / 720;
  for (let x = W * 0.05; x < W; x += 150 * hs * (1 + r())) house(x, H * 0.7, hs * (0.7 + r() * 0.3), r);
  hills('#5f4a6a', H * 0.74, H * 0.03, 7);
  ctx.strokeStyle = 'rgba(40,30,40,0.6)'; ctx.lineWidth = 2 * hs;
  ctx.beginPath(); ctx.moveTo(0, H * 0.55);
  ctx.quadraticCurveTo(W * 0.5, H * 0.66, W, H * 0.55); ctx.stroke();
  for (let i = 1; i < 18; i++) {
    const t = i / 18, x = W * t, y = (1 - t) * (1 - t) * H * 0.55 + 2 * (1 - t) * t * H * 0.66 + t * t * H * 0.55;
    glow(ctx, x, y + 6 * hs, 18 * hs, '#ffb050', 0.8);
    ctx.fillStyle = i % 2 ? '#ffcf70' : '#ff9a50';
    ctx.beginPath(); ctx.ellipse(x, y + 6 * hs, 5 * hs, 7 * hs, 0, 0, Math.PI * 2); ctx.fill();
  }
  // floating embers
  for (let i = 0; i < 40; i++) glow(ctx, rand() * W, H * (0.2 + rand() * 0.7), (2 + rand() * 5) * hs, '#ffc070', 0.7);
  // foreground hill where Wick stands
  const pts = [[-50, H + 50], [-50, ground + 20]];
  for (let x = -50; x <= W + 50; x += 40) pts.push([x, ground - Math.exp(-(((x - W * L.cx) / (W * 0.25)) ** 2)) * H * 0.06]);
  pts.push([W + 50, H + 50]);
  wash(ctx, pts, '#2d2233', rand, { layers: 5, alpha: 0.4, amp: 5 });
  ctx.fillStyle = '#2d2233';
  ctx.fillRect(0, ground + 30, W, H);
  // Wick and Pip
  const s = (H * L.cs) / 95;
  const fy = ground - H * 0.06 + 6;
  glow(ctx, W * L.cx, fy - 40 * s, 120 * s, '#ffcf80', 0.35);
  drawWick(ctx, W * L.cx, fy, s, { arm: -0.4, scarf: 1 }, true);
  drawPip(ctx, W * L.cx - 55 * s, fy - 100 * s, s * 1.4, { phase: 1 });
  if (L.soft) { ctx.fillStyle = 'rgba(30,24,40,0.35)'; ctx.fillRect(0, 0, W, H); }
  // paper texture
  const paper = paperCanvas(512, 7);
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.5;
  ctx.fillStyle = ctx.createPattern(paper, 'repeat'); ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

document.fonts.load('80px "Patrick Hand"').then(() => {
  if (!L.only) scene();
  if (L.logo) logo(W * L.logo[0], H * L.logo[1], H * L.logo[2]);
  window.__done = true;
});
