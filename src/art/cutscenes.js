// Painted cutscene panels. Each "shot" is composed from the world backgrounds
// plus large versions of the characters.

import { VIEW_W as W, VIEW_H as H } from '../config.js';
import { canvas, rng, wash, blobPoints, glow, rgba, granulate, addTexture } from './paint.js';
import { drawWick, drawPip, drawGrandpa, drawMossback, INK } from './characters.js';
import { ensureBackground } from './world.js';
import { drawThornwolf, drawHaruSleeping } from './thornwolf.js';

function layer(scene, ctx, key, dx = 0, dy = 0, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(scene.textures.get(key).getSourceImage(), dx, dy);
  ctx.restore();
}

function ground(ctx, y, color, rand, grass) {
  const pts = [[-20, H + 20], [-20, y]];
  for (let x = 0; x <= W + 20; x += 40) pts.push([x, y + Math.sin(x / 140) * 10 + rand() * 4]);
  pts.push([W + 20, H + 20]);
  wash(ctx, pts, color, rand, { layers: 4, alpha: 0.5, edge: 0.4 });
  if (grass) {
    for (let i = 0; i < 260; i++) {
      const x = rand() * W, h = 8 + rand() * 18;
      ctx.strokeStyle = grass[Math.floor(rand() * grass.length)]; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, y + 12); ctx.quadraticCurveTo(x + 3, y - h / 2, x + (rand() - 0.5) * 10, y - h + 8); ctx.stroke();
    }
  }
}

function roof(ctx, rand) {
  // a tiled cottage roof that Wick and Grandpa stand on
  const pts = [[-40, H + 20], [-40, 560], [W + 40, 590], [W + 40, H + 20]];
  wash(ctx, pts, '#8a4a40', rand, { layers: 4, alpha: 0.6, edge: 0.5 });
  ctx.strokeStyle = rgba('#3a1a18', 0.45); ctx.lineWidth = 2;
  for (let y = 590; y < H; y += 26) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y + 20); ctx.stroke();
    for (let x = (y / 26) % 2 ? 0 : 30; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, y + (x / W) * 20); ctx.lineTo(x, y + 26 + (x / W) * 20); ctx.stroke(); }
  }
}

function hush(ctx, rand, amount) {
  for (let i = 0; i < 26 * amount; i++) {
    const x = rand() * W, y = 250 + rand() * 300, r = 100 + rand() * 180;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(200,196,212,0.5)'); g.addColorStop(1, 'rgba(200,196,212,0)');
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
}

function tint(ctx, color, alpha) {
  ctx.fillStyle = rgba(color, alpha);
  ctx.fillRect(0, 0, W, H);
}

const SHOTS = {
  'hearth-night'(scene, ctx, rand) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#141436'); g.addColorStop(1, '#3a2a58');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 220; i++) { ctx.fillStyle = rgba('#ffffff', rand() * 0.8); ctx.fillRect(rand() * W, rand() * H * 0.7, 2, 2); }
    // the Great Hearth, huge and warm
    glow(ctx, W / 2, 330, 520, '#ffb060', 0.35);
    wash(ctx, [[W / 2 - 70, 640], [W / 2 - 40, 330], [W / 2 + 40, 330], [W / 2 + 80, 640]], '#3a2228', rand, { layers: 4, alpha: 0.5 });
    for (let i = 0; i < 11; i++) {
      const a = -Math.PI / 2 + (i - 5) * 0.28;
      wash(ctx, blobPoints(W / 2 + Math.cos(a) * 240, 280 + Math.sin(a) * 140, 150, 90, rand, 0.25), '#2e2030', rand, { layers: 3, alpha: 0.4, edge: 0.15 });
    }
    glow(ctx, W / 2, 300, 160, '#ffd890', 0.6);
    for (let i = 0; i < 60; i++) glow(ctx, W / 2 + (rand() - 0.5) * 600, 160 + rand() * 300, 4 + rand() * 5, '#ffcf7a', 0.8);
    ground(ctx, 620, '#1e1626', rand);
  },
  rooftop(scene, ctx, rand) {
    layer(scene, ctx, 'sky-village');
    layer(scene, ctx, 'far-village');
    layer(scene, ctx, 'mid-village', 0, 40);
    roof(ctx, rand);
    drawGrandpa(ctx, 820, 600, 3.0, { flip: true });
    drawWick(ctx, 470, 590, 3.2, { eyes: 'open', arm: 0.3 });
  },
  'rooftop-hush'(scene, ctx, rand) {
    SHOTS.rooftop(scene, ctx, rand);
    tint(ctx, '#2a2a48', 0.35);
    hush(ctx, rand, 1.2);
  },
  'tower-top'(scene, ctx, rand) {
    layer(scene, ctx, 'sky-village');
    tint(ctx, '#20204a', 0.35);
    glow(ctx, 640, 230, 380, '#ffcf7a', 0.55);
    // the great lamp
    wash(ctx, blobPoints(640, 240, 90, 110, rand, 0.04), '#ffd27a', rand, { layers: 5, alpha: 0.6, edge: 0.6 });
    glow(ctx, 640, 240, 70, '#fffbe0', 0.9);
    ctx.fillStyle = '#5a3a30'; ctx.fillRect(560, 100, 160, 22); ctx.fillRect(590, 340, 100, 30);
    // stone floor
    wash(ctx, [[-20, H + 20], [-20, 600], [W + 20, 600], [W + 20, H + 20]], '#8a7a70', rand, { layers: 4, alpha: 0.6 });
    hush(ctx, rand, 0.5);
    drawGrandpa(ctx, 830, 640, 2.9, { flip: true, sleep: false });
    drawWick(ctx, 460, 640, 3.2, { eyes: 'worried' });
  },
  'tower-sleep'(scene, ctx, rand) {
    layer(scene, ctx, 'sky-village');
    tint(ctx, '#141436', 0.6);
    ctx.fillStyle = '#3a2a30'; ctx.fillRect(560, 100, 160, 22); ctx.fillRect(590, 340, 100, 30);
    wash(ctx, blobPoints(640, 240, 90, 110, rand, 0.04), '#5a6070', rand, { layers: 5, alpha: 0.6, edge: 0.6 });
    wash(ctx, [[-20, H + 20], [-20, 600], [W + 20, 600], [W + 20, H + 20]], '#5a5060', rand, { layers: 4, alpha: 0.7 });
    hush(ctx, rand, 1.5);
    drawGrandpa(ctx, 760, 640, 2.9, { flip: true, sleep: true, moss: 0.8 });
    drawWick(ctx, 470, 640, 3.2, { eyes: 'closed', lean: 0.08 });
  },
  'pip-arrives'(scene, ctx, rand) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#101030'); g.addColorStop(1, '#2a2048');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 180; i++) { ctx.fillStyle = rgba('#ffffff', rand() * 0.7); ctx.fillRect(rand() * W, rand() * H, 2, 2); }
    glow(ctx, 760, 300, 380, '#ffb050', 0.45);
    drawWick(ctx, 460, 900, 5.4, { eyes: 'open', arm: 0.4 });
    drawPip(ctx, 820, 280, 4.6, { phase: 0.5 });
  },
  mossback(scene, ctx, rand) {
    layer(scene, ctx, 'sky-woods');
    layer(scene, ctx, 'far-woods');
    layer(scene, ctx, 'mid-woods', 0, 60);
    ground(ctx, 500, '#5a7a42', rand, ['#7aa84c', '#4a7a3a', '#9ccf6a']);
    drawMossback(ctx, 470, 530, 1.5, { eyeOpen: 1 });
    drawWick(ctx, 1130, 520, 1.9, { eyes: 'open' }, true);
    drawPip(ctx, 1070, 330, 1.6, {});
  },
  'mossback-gift'(scene, ctx, rand) {
    SHOTS.mossback(scene, ctx, rand);
    tint(ctx, '#203a28', 0.25);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let r = 40; r < 180; r += 28) {
      ctx.strokeStyle = rgba('#9affc8', 0.5 - r / 400); ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(1070, 330, r, 0, Math.PI * 2); ctx.stroke();
    }
    glow(ctx, 1070, 330, 160, '#9affc8', 0.5);
    ctx.restore();
  },
  'thornwolf-reveal'(scene, ctx, rand) {
    layer(scene, ctx, 'sky-woods');
    layer(scene, ctx, 'far-woods');
    layer(scene, ctx, 'mid-woods', 0, 60);
    tint(ctx, '#1a1426', 0.55);
    hush(ctx, rand, 1.2);
    glow(ctx, 760, 330, 300, '#ff6a4a', 0.18);
    ground(ctx, 500, '#1e2620', rand);
    drawThornwolf(ctx, 760, 520, 1.6, { crouch: 0.6, brambles: 1, eyes: 'angry', tail: 1 });
    drawWick(ctx, 200, 520, 1.9, { eyes: 'worried' });
    drawPip(ctx, 270, 330, 1.6, { mood: 'worried' });
  },
  'haru-fall'(scene, ctx, rand) {
    layer(scene, ctx, 'sky-woods');
    layer(scene, ctx, 'far-woods');
    layer(scene, ctx, 'mid-woods', 0, 60);
    tint(ctx, '#2a2a3a', 0.25);
    ground(ctx, 500, '#4a6a3a', rand, ['#6a9a4a', '#4a7a3a']);
    // brambles falling away as he remembers
    for (let i = 0; i < 18; i++) {
      const x = 560 + rand() * 420, y = 360 + rand() * 140;
      ctx.strokeStyle = rgba('#2e2030', 0.7); ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 20, y + 20, x + (rand() - 0.5) * 60, y + 30); ctx.stroke();
    }
    drawThornwolf(ctx, 780, 520, 1.5, { stun: true, brambles: 0.15, eyes: 'calm' });
    drawWick(ctx, 290, 520, 2.0, { eyes: 'open', arm: 0.5 });
    drawPip(ctx, 360, 320, 1.6, {});
  },
  'haru-sleep'(scene, ctx, rand) {
    layer(scene, ctx, 'sky-woods');
    layer(scene, ctx, 'far-woods');
    layer(scene, ctx, 'mid-woods', 0, 60);
    // morning light returns to the forest
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++) {
      const x = 200 + i * 180;
      const g = ctx.createLinearGradient(x, 0, x + 160, 520);
      g.addColorStop(0, 'rgba(255,240,190,0.16)'); g.addColorStop(1, 'rgba(255,240,190,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 60, 0); ctx.lineTo(x + 240, 520); ctx.lineTo(x + 150, 520); ctx.fill();
    }
    ctx.restore();
    ground(ctx, 500, '#5a8a42', rand, ['#7aa84c', '#9ccf6a', '#4a7a3a']);
    // the shrine gate, with Haru curled around it
    ctx.fillStyle = '#b2523a'; ctx.strokeStyle = INK; ctx.lineWidth = 5;
    for (const px of [600, 760]) { ctx.fillRect(px, 250, 18, 260); ctx.strokeRect(px, 250, 18, 260); }
    ctx.beginPath(); ctx.moveTo(560, 250); ctx.lineTo(820, 250); ctx.lineTo(805, 226); ctx.lineTo(575, 226); ctx.closePath(); ctx.fill(); ctx.stroke();
    drawHaruSleeping(ctx, 690, 520, 1.7);
    drawWick(ctx, 1080, 520, 1.9, { eyes: 'closed' }, true);
    drawPip(ctx, 1010, 330, 1.6, {});
  },
  'woods-end'(scene, ctx, rand) {
    layer(scene, ctx, 'sky-woods');
    layer(scene, ctx, 'far-woods');
    layer(scene, ctx, 'mid-woods', 0, 60);
    tint(ctx, '#141a2a', 0.6);
    hush(ctx, rand, 1);
    // brambles and two glowing eyes in the dark
    for (let i = 0; i < 40; i++) {
      const x = rand() * W, y = 420 + rand() * 260;
      ctx.strokeStyle = rgba('#1a1018', 0.8); ctx.lineWidth = 3 + rand() * 4;
      ctx.beginPath(); ctx.moveTo(x, H); ctx.bezierCurveTo(x + 60, y, x - 60, y - 80, x + (rand() - 0.5) * 120, y - 120); ctx.stroke();
    }
    for (const ex of [860, 940]) { glow(ctx, ex, 330, 34, '#ff6a4a', 0.8); ctx.fillStyle = '#ffd0b0'; ctx.beginPath(); ctx.ellipse(ex, 330, 12, 5, ex > 900 ? -0.2 : 0.2, 0, Math.PI * 2); ctx.fill(); }
    ground(ctx, 520, '#1e2620', rand);
    drawWick(ctx, 380, 540, 2.4, { eyes: 'worried' });
    drawPip(ctx, 470, 300, 2, { mood: 'worried' });
  },
};

/** Returns a texture key for the requested shot, painting it the first time. */
export function shotTexture(scene, name) {
  const key = `shot-${name}`;
  if (scene.textures.exists(key)) return key;
  ensureBackground(scene, 'village');
  ensureBackground(scene, 'woods');
  const c = canvas(W, H), ctx = c.getContext('2d');
  const rand = rng(name.length * 41);
  SHOTS[name](scene, ctx, rand);
  granulate(ctx, 0, 0, W, H, '#1a1020', rand, 0.002, 0.15);
  addTexture(scene, key, c);
  return key;
}

/** Round portrait for the dialogue box. */
export function portraitTexture(scene, who) {
  const key = `portrait-${who}`;
  if (scene.textures.exists(key)) return key;
  const S = 128, c = canvas(S, S), ctx = c.getContext('2d');
  ctx.save();
  ctx.beginPath(); ctx.arc(S / 2, S / 2, S / 2 - 3, 0, Math.PI * 2); ctx.clip();
  const bg = { wick: '#cfe0d8', grandpa: '#ead8c0', pip: '#3a2a48', mossback: '#c8dcb0', thornwolf: '#3a2a3a', haru: '#d8e4c8' }[who] || '#ddd';
  ctx.fillStyle = bg; ctx.fillRect(0, 0, S, S);
  if (who === 'wick') drawWick(ctx, 44, 290, 2.5, {});
  if (who === 'grandpa') drawGrandpa(ctx, 54, 300, 2.4, {});
  if (who === 'pip') drawPip(ctx, 64, 72, 2.6, {});
  if (who === 'thornwolf') drawThornwolf(ctx, -50, 168, 0.95, { eyes: 'angry', brambles: 1 });
  if (who === 'haru') drawThornwolf(ctx, -50, 168, 0.95, { eyes: 'calm', brambles: 0 });
  if (who === 'mossback') drawMossback(ctx, -230, 140, 1.2, { eyeOpen: 1 });
  ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(S / 2, S / 2, S / 2 - 3, 0, Math.PI * 2); ctx.stroke();
  addTexture(scene, key, c);
  return key;
}
