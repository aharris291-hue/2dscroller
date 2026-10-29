// Painted cutscene panels. Each "shot" is composed from the world backgrounds
// plus large versions of the characters.

import { VIEW_W as W, VIEW_H as H } from '../config.js';
import { canvas, rng, wash, blobPoints, glow, rgba, granulate, addTexture } from './paint.js';
import { drawWick, drawPip, drawGrandpa, drawMossback, INK } from './characters.js';
import { ensureBackground } from './world.js';
import { drawThornwolf, drawHaruSleeping } from './thornwolf.js';
import { drawNell } from './caves.js';
import { drawWren, drawBird, drawFeather } from './cliffs.js';
import { drawMorrow, drawSmallMoth, drawAsh } from './heart.js';

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

function caveRoom(scene, ctx, rand, office = true) {
  layer(scene, ctx, 'sky-caves');
  layer(scene, ctx, 'far-caves');
  layer(scene, ctx, 'mid-caves', 0, 40);
  ground(ctx, 500, '#3c3352', rand);
  if (office) {
    wash(ctx, [[60, 500], [60, 250], [360, 250], [360, 500]], '#7a5a40', rand, { layers: 3, alpha: 0.85, edge: 0.6 });
    wash(ctx, [[30, 256], [210, 170], [390, 256]], '#5a4038', rand, { layers: 3, alpha: 0.9, edge: 0.6 });
    glow(ctx, 280, 340, 70, '#ffcf7a', 0.6);
  }
  for (let i = 0; i < 5; i++) glow(ctx, 100 + rand() * 1080, 120 + rand() * 300, 30 + rand() * 30, '#7ad8f0', 0.35);
}

function rootsRoom(scene, ctx, rand) {
  layer(scene, ctx, 'sky-heart');
  layer(scene, ctx, 'far-heart');
  layer(scene, ctx, 'mid-heart', 0, 40);
  // huge roots arching overhead
  for (let i = 0; i < 6; i++) {
    const x = rand() * W;
    ctx.strokeStyle = rgba('#2a1218', 0.9); ctx.lineWidth = 30 + rand() * 30; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, -40); ctx.bezierCurveTo(x + 200, 200, x - 200, 300, x + (rand() - 0.5) * 300, 560); ctx.stroke();
  }
  ground(ctx, 500, '#3a1e24', rand);
}

function cliffSky(scene, ctx) {
  layer(scene, ctx, 'sky-cliffs');
  layer(scene, ctx, 'far-cliffs');
  layer(scene, ctx, 'mid-cliffs', 0, 40);
}

function tracePolyLocal(ctx, pts) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
}

function paint2(ctx, color) {
  ctx.fillStyle = color; ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
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
  'mine-office'(scene, ctx, rand) { caveRoom(scene, ctx, rand); drawNell(ctx, 840, 520, 2.6, { swing: 0.6 }, true); drawWick(ctx, 380, 520, 2.4, { eyes: 'worried' }); drawPip(ctx, 450, 300, 1.8, { mood: 'worried' }); },
  'mine-office-empty'(scene, ctx, rand) { caveRoom(scene, ctx, rand); drawWick(ctx, 380, 520, 2.4, { eyes: 'open' }); drawPip(ctx, 450, 300, 1.8, {}); },
  'nell-saved'(scene, ctx, rand) {
    caveRoom(scene, ctx, rand, false);
    // the overturned cart, wheels in the air
    ctx.save(); ctx.translate(900, 470); ctx.rotate(Math.PI * 0.85);
    ctx.beginPath(); ctx.moveTo(-90, -40); ctx.lineTo(90, -40); ctx.lineTo(74, 40); ctx.lineTo(-74, 40); ctx.closePath();
    paint2(ctx, '#6a5a5a');
    for (const wx of [-50, 50]) { ctx.beginPath(); ctx.arc(wx, 50, 18, 0, Math.PI * 2); paint2(ctx, '#4a4048'); }
    ctx.restore();
    for (let i = 0; i < 8; i++) glow(ctx, 760 + rand() * 260, 380 + rand() * 120, 6, '#9fe0ff', 0.8);
    drawNell(ctx, 680, 520, 2.4, { eyes: 'cross', pick: false });
    drawWick(ctx, 360, 520, 2.4, { eyes: 'worried', arm: 0.6 });
    drawPip(ctx, 430, 300, 1.8, {});
  },
  'drowned-talk'(scene, ctx, rand) {
    caveRoom(scene, ctx, rand, false);
    tint(ctx, '#101a30', 0.35);
    // still black water with lantern reflections
    ctx.fillStyle = 'rgba(30,50,90,0.9)'; ctx.fillRect(0, 500, W, H - 500);
    for (let i = 0; i < 30; i++) { ctx.fillStyle = rgba('#ffd27a', 0.4 * rand()); ctx.fillRect(560 + rand() * 160, 510 + rand() * 120, 30 + rand() * 40, 2); }
    glow(ctx, 640, 420, 220, '#ffcf7a', 0.35);
    wash(ctx, [[-20, 520], [-20, 470], [W + 20, 480], [W + 20, 520]], '#3a3352', rand, { layers: 3, alpha: 0.9 });
    drawWick(ctx, 520, 490, 2.2, { eyes: 'open' });
    drawNell(ctx, 790, 490, 2.2, { pick: false, eyes: 'closed' }, true);
    drawPip(ctx, 640, 290, 1.6, {});
  },
  'sleepers-mine'(scene, ctx, rand) {
    caveRoom(scene, ctx, rand, false);
    tint(ctx, '#141024', 0.25);
    glow(ctx, 640, 420, 360, '#ffcf7a', 0.45);
    ground(ctx, 500, '#4a5a3a', rand, ['#6a8a4a', '#4a6a3a']);
    for (const [sx, sy] of [[90, 470], [230, 490], [1180, 480], [560, 492]]) drawNell(ctx, sx, sy, 1.1, { sleep: true });
    // Nell's mum, the foreman, asleep right beside her daughter
    drawNell(ctx, 900, 488, 1.5, { sleep: true, foreman: true });
    // the lantern Wick leaves behind, set in a crystal
    wash(ctx, [[600, 500], [620, 380], [640, 340], [660, 380], [680, 500]], '#7ad8f0', rand, { layers: 3, alpha: 0.7, edge: 0.6 });
    glow(ctx, 640, 360, 80, '#ffd27a', 0.9);
    drawNell(ctx, 1060, 480, 2.0, { pick: false, eyes: 'closed' }, true);
    drawWick(ctx, 420, 470, 2.0, { eyes: 'open' });
    drawPip(ctx, 490, 280, 1.5, {});
  },
  'cliffs-arrive'(scene, ctx, rand) {
    cliffSky(scene, ctx, rand);
    ground(ctx, 500, '#7a4a48', rand, ['#f0c070', '#c98a48']);
    for (const [bx, by] of [[760, 498], [800, 496], [840, 499], [1010, 497], [1050, 498]]) drawBird(ctx, bx, by, 2.2, { color: ['#6a7a9a', '#9a6a5a', '#7a8a5a'][Math.floor(rand() * 3)] });
    drawWick(ctx, 360, 510, 2.3, { eyes: 'open' });
    drawPip(ctx, 430, 300, 1.8, { mood: 'worried' });
  },
  'post-office'(scene, ctx, rand) {
    // inside the Sky Post Office: towering shelves of letters
    ctx.fillStyle = '#5a3a34'; ctx.fillRect(0, 0, W, H);
    for (let sx = 0; sx < W; sx += 160) {
      for (let sy = 40; sy < 480; sy += 60) {
        ctx.fillStyle = '#7a5040'; ctx.fillRect(sx + 10, sy + 44, 140, 8);
        for (let k = 0; k < 9; k++) { ctx.fillStyle = rand() < 0.5 ? '#f4ead4' : '#e8d8b8'; ctx.fillRect(sx + 16 + k * 15, sy + 14 + rand() * 6, 11, 30); }
      }
    }
    glow(ctx, 640, 200, 420, '#ffcf7a', 0.35);
    ground(ctx, 500, '#6a4434', rand);
    for (let i = 0; i < 40; i++) { ctx.save(); ctx.translate(500 + rand() * 360, 470 + rand() * 30); ctx.rotate(rand()); ctx.fillStyle = '#f4ead4'; ctx.fillRect(-10, -7, 20, 14); ctx.restore(); }
    drawWren(ctx, 780, 510, 2.2, {}, true);
    drawWick(ctx, 330, 510, 2.2, { eyes: 'open' });
    drawPip(ctx, 400, 310, 1.7, {});
  },
  'wren-letter'(scene, ctx, rand) {
    ctx.fillStyle = '#3a2a2a'; ctx.fillRect(0, 0, W, H);
    glow(ctx, 640, 300, 420, '#ffcf7a', 0.4);
    // the old letter, sealed with a moth-wing stamp of grey wax
    ctx.save(); ctx.translate(640, 280); ctx.rotate(-0.04);
    wash(ctx, [[-300, -170], [300, -180], [310, 170], [-290, 180]], '#f2e6cc', rand, { layers: 4, alpha: 0.9, edge: 0.5 });
    ctx.fillStyle = INK; ctx.font = 'italic 24px Nunito, sans-serif';
    ['Dear Ash,', 'Today you told me you are getting old,', 'and you laughed, as if it were nothing...', '', '                         Your Morrow'].forEach((l, i) => ctx.fillText(l, -250, -100 + i * 40));
    ctx.beginPath(); ctx.arc(220, 120, 34, 0, Math.PI * 2); ctx.fillStyle = '#8a8890'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#b8b4c0';
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(220 + sd * 13, 116, 14, 9, sd * 0.5, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  },
  'kite-memory'(scene, ctx, rand) {
    cliffSky(scene, ctx, rand);
    for (let i = 0; i < 6; i++) {
      const kx = 120 + i * 200, ky = 80 + rand() * 180;
      ctx.strokeStyle = rgba(INK, 0.4); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(kx, ky); ctx.quadraticCurveTo(kx - 40, ky + 200, kx - 20, 500); ctx.stroke();
      wash(ctx, [[kx, ky - 30], [kx + 22, ky], [kx, ky + 34], [kx - 22, ky]], ['#e8604a', '#f0c060', '#6aa0c8'][i % 3], rand, { layers: 2, alpha: 0.85, edge: 0.6 });
    }
    ground(ctx, 500, '#9a7048', rand, ['#f0c070', '#c98a48']);
    // a remembered fox of fire, singing, faint in the sky
    ctx.save(); ctx.globalAlpha = 0.35; glow(ctx, 900, 220, 200, '#ffb060', 0.8); ctx.restore();
    drawWick(ctx, 420, 510, 2.3, { eyes: 'open' });
    drawPip(ctx, 560, 300, 2.2, { mood: 'happy' });
  },
  'wind-returns'(scene, ctx, rand) {
    layer(scene, ctx, 'sky-storm');
    layer(scene, ctx, 'far-storm');
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = 0; i < 30; i++) { const y = rand() * 460; const x = rand() * W; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 80, y - 20, x + 180, y); ctx.stroke(); }
    for (let i = 0; i < 30; i++) drawBird(ctx, rand() * W, 60 + rand() * 300, 1.4, { flying: true });
    ground(ctx, 500, '#5a3a40', rand);
    drawWren(ctx, 820, 470, 2.0, { wings: 1, flying: true }, true);
    drawWick(ctx, 380, 510, 2.2, { eyes: 'open', scarf: 14, cloakBack: 14, hoodTip: 10 });
    drawPip(ctx, 450, 310, 1.7, {});
  },
  'wren-flight'(scene, ctx, rand) {
    // over the valley at night: a trail of every lantern Wick has lit
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#1a1838'); g.addColorStop(1, '#4a3a5a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 160; i++) { ctx.fillStyle = rgba('#ffffff', rand() * 0.6); ctx.fillRect(rand() * W, rand() * H * 0.5, 2, 2); }
    wash(ctx, [[-20, H + 20], [-20, 420], [300, 380], [700, 430], [1000, 390], [W + 20, 420], [W + 20, H + 20]], '#2a2440', rand, { layers: 3, alpha: 0.8 });
    let lx = 80, ly = 600;
    for (let i = 0; i < 26; i++) { lx += 40 + rand() * 20; ly -= 6 + rand() * 4; glow(ctx, lx, ly, 14, '#ffcf7a', 0.9); }
    // Wren carries Wick gently in her talons
    drawWick(ctx, 640, 430, 1.0, { eyes: 'open', scarf: 16, cloakBack: 16, hoodTip: 10, legA: 0.4, legB: -0.3 });
    drawWren(ctx, 640, 300, 1.6, { wings: 1, flying: true });
    ctx.strokeStyle = '#d8a048'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (const tx of [-14, 14]) { ctx.beginPath(); ctx.moveTo(640 + tx, 296); ctx.lineTo(640 + tx * 0.6, 352); ctx.stroke(); }
    drawPip(ctx, 720, 380, 1.2, {});
  },
  'hearth-wings'(scene, ctx, rand) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#141020'); g.addColorStop(1, '#3a2030');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    glow(ctx, 640, 360, 360, '#ff9a50', 0.25);
    wash(ctx, [[560, 720], [600, 300], [680, 300], [720, 720]], '#2e1e24', rand, { layers: 4, alpha: 0.6 });
    // vast moth wings like burnt paper, folded around the tree
    for (const side of [-1, 1]) {
      const lobe = (cx, cy, rx, ry, rot) => {
        const pts = [];
        for (let i = 0; i < 26; i++) {
          const a = (i / 26) * Math.PI * 2;
          const wob = 1 + (rand() - 0.5) * 0.08;
          pts.push([cx + Math.cos(a) * rx * wob * Math.cos(rot) - Math.sin(a) * ry * wob * Math.sin(rot), cy + Math.cos(a) * rx * wob * Math.sin(rot) + Math.sin(a) * ry * wob * Math.cos(rot)]);
        }
        return pts;
      };
      const upper = lobe(640 + side * 290, 220, 300, 150, side * -0.35);
      const lower = lobe(640 + side * 220, 450, 210, 120, side * 0.4);
      for (const pts of [lower, upper]) {
        wash(ctx, pts, '#8a8490', rand, { layers: 5, alpha: 0.55, edge: 0.6, amp: 6 });
        // scorched edges
        ctx.save(); tracePolyLocal(ctx, pts); ctx.clip();
        ctx.strokeStyle = 'rgba(40,30,40,0.55)'; ctx.lineWidth = 26; tracePolyLocal(ctx, pts); ctx.stroke();
        ctx.restore();
      }
      // pale eye-spots, like old moth wings
      for (const [ex, ey, r] of [[640 + side * 360, 210, 46], [640 + side * 230, 460, 30]]) {
        ctx.fillStyle = 'rgba(220,214,224,0.6)'; ctx.beginPath(); ctx.arc(ex, ey, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(70,60,80,0.7)'; ctx.beginPath(); ctx.arc(ex, ey, r * 0.45, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = rgba('#3a3440', 0.45); ctx.lineWidth = 2;
      for (let k = 0; k < 7; k++) { ctx.beginPath(); ctx.moveTo(640 + side * 40, 340); ctx.quadraticCurveTo(640 + side * (180 + k * 50), 300 - k * 30, 640 + side * (260 + k * 50), 120 + k * 40); ctx.stroke(); }
    }
    glow(ctx, 640, 380, 60, '#ffb060', 0.7);
    granulate(ctx, 0, 0, W, H, '#c0b8c8', rand, 0.004, 0.25);
  },
  'root-gate'(scene, ctx, rand) {
    rootsRoom(scene, ctx, rand);
    hush(ctx, rand, 1.2);
    drawWick(ctx, 520, 510, 2.3, { eyes: 'worried' });
    drawPip(ctx, 600, 320, 1.3, { mood: 'worried', glow: 0.5 });
  },
  'hall-of-sleepers'(scene, ctx, rand) {
    rootsRoom(scene, ctx, rand);
    // countless spirits curled up like seeds
    for (let i = 0; i < 40; i++) { const x = rand() * W, y = 380 + rand() * 120; ctx.fillStyle = rgba('#d8d0c8', 0.5 + rand() * 0.3); ctx.beginPath(); ctx.ellipse(x, y, 14 + rand() * 10, 9, 0, 0, Math.PI * 2); ctx.fill(); }
    hush(ctx, rand, 1);
    drawWick(ctx, 520, 510, 2.3, { eyes: 'closed', lean: 0.1 });
    drawPip(ctx, 720, 300, 2.4, {});
  },
  hearthsong(scene, ctx, rand) {
    rootsRoom(scene, ctx, rand);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let r = 60; r < 700; r += 70) { ctx.strokeStyle = rgba('#ffd27a', Math.max(0, 0.5 - r / 1400)); ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(640, 320, r, 0, Math.PI * 2); ctx.stroke(); }
    glow(ctx, 640, 320, 300, '#ffd27a', 0.5);
    ctx.restore();
    drawWick(ctx, 560, 510, 2.3, { eyes: 'open', cast: true });
    drawPip(ctx, 640, 300, 2.6, {});
  },
  'dream-fall'(scene, ctx, rand) {
    layer(scene, ctx, 'sky-dream'); layer(scene, ctx, 'far-dream'); layer(scene, ctx, 'mid-dream', 0, 40);
    for (let i = 0; i < 40; i++) glow(ctx, rand() * W, rand() * H, 6 + rand() * 8, '#fff4c0', 0.7);
    drawWick(ctx, 640, 420, 2.4, { eyes: 'closed', legA: 0.4, legB: -0.3, cloakBack: 14, hoodTip: 10 });
    drawPip(ctx, 740, 230, 1.8, {});
  },
  'ash-memory'(scene, ctx, rand) {
    layer(scene, ctx, 'sky-dream'); layer(scene, ctx, 'far-dream');
    ground(ctx, 500, '#d89878', rand, ['#ffe0a8', '#f4b888']);
    drawAsh(ctx, 470, 520, 1.2, {});
    drawSmallMoth(ctx, 900, 330, 4);
  },
  'ash-wrapped'(scene, ctx, rand) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a2030'); g.addColorStop(1, '#4a3040');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    drawAsh(ctx, 470, 560, 1.1, { asleep: true, dim: 0.8 });
    drawMorrow(ctx, 640, 300, 1.2, { flap: 0, eyes: 'closed' });
    hush(ctx, rand, 0.8);
    glow(ctx, 640, 60, 30, '#ffd27a', 0.9);
  },
  'morrow-reveal'(scene, ctx, rand) {
    rootsRoom(scene, ctx, rand);
    hush(ctx, rand, 0.8);
    drawMorrow(ctx, 760, 250, 1.0, { flap: 0.6, eyes: 'angry' });
    drawWick(ctx, 300, 510, 2.2, { eyes: 'worried' });
    drawPip(ctx, 370, 320, 1.5, { mood: 'worried' });
  },
  'morrow-open'(scene, ctx, rand) {
    rootsRoom(scene, ctx, rand);
    drawMorrow(ctx, 760, 260, 1.0, { open: 1, eyes: 'sad' });
    drawWick(ctx, 360, 510, 2.2, { eyes: 'open', arm: 0.8 });
    ctx.save(); ctx.translate(430, 400); ctx.rotate(-0.2); ctx.fillStyle = '#f2e6cc'; ctx.fillRect(-24, -16, 48, 32); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(-24, -16, 48, 32); ctx.restore();
  },
  'trail-of-lights'(scene, ctx, rand) {
    layer(scene, ctx, 'sky-festival');
    wash(ctx, [[-20, H + 20], [-20, 420], [400, 380], [800, 430], [W + 20, 400], [W + 20, H + 20]], '#2a2440', rand, { layers: 3, alpha: 0.8 });
    let lx = 40, ly = 640;
    for (let i = 0; i < 34; i++) { lx += 30 + rand() * 14; ly -= 6 + rand() * 6; glow(ctx, lx, ly, 16, '#ffcf7a', 0.9); }
    glow(ctx, 1150, 120, 140, '#ffb060', 0.5);
  },
  'morrow-free'(scene, ctx, rand) {
    rootsRoom(scene, ctx, rand);
    for (let i = 0; i < 160; i++) { ctx.fillStyle = rgba('#d0c8d8', rand() * 0.7); ctx.fillRect(rand() * W, rand() * H, 3, 3); }
    drawWick(ctx, 520, 510, 2.3, { eyes: 'open', cast: true });
    drawPip(ctx, 700, 260, 2.2, {});
    drawSmallMoth(ctx, 470, 300, 2);
  },
  'ash-wakes'(scene, ctx, rand) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#4a1e20'); g.addColorStop(1, '#ff9a50');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    drawAsh(ctx, 360, 560, 1.3, {});
    drawWick(ctx, 1040, 510, 1.8, { eyes: 'open' }, true);
    drawSmallMoth(ctx, 1080, 300, 1.6);
  },
  'montage-woods'(scene, ctx, rand) {
    layer(scene, ctx, 'sky-woods'); layer(scene, ctx, 'far-woods'); layer(scene, ctx, 'mid-woods', 0, 60);
    ground(ctx, 500, '#5a8a42', rand, ['#7aa84c', '#9ccf6a']);
    drawThornwolf(ctx, 640, 520, 1.5, { brambles: 0, eyes: 'calm', tail: 1 });
  },
  'montage-mine'(scene, ctx, rand) {
    caveRoom(scene, ctx, rand, false);
    glow(ctx, 640, 360, 360, '#ffcf7a', 0.4);
    drawNell(ctx, 560, 510, 2.2, { pick: false }, false);
    drawNell(ctx, 760, 510, 2.4, { foreman: true, pick: false }, true);
  },
  'montage-cliffs'(scene, ctx, rand) {
    cliffSky(scene, ctx, rand);
    for (let i = 0; i < 24; i++) drawBird(ctx, rand() * W, 60 + rand() * 300, 1.4, { flying: true });
    for (let i = 0; i < 30; i++) { ctx.save(); ctx.translate(rand() * W, rand() * 420); ctx.rotate(rand()); ctx.fillStyle = '#f4ead4'; ctx.fillRect(-10, -7, 20, 14); ctx.restore(); }
    drawWren(ctx, 640, 360, 1.6, { wings: 1, flying: true });
  },
  'grandpa-wakes'(scene, ctx, rand) {
    layer(scene, ctx, 'sky-village');
    glow(ctx, 640, 200, 420, '#ffd890', 0.4);
    wash(ctx, [[-20, H + 20], [-20, 600], [W + 20, 600], [W + 20, H + 20]], '#8a7a70', rand, { layers: 4, alpha: 0.6 });
    drawGrandpa(ctx, 660, 640, 3.0, { flip: true, moss: 0.3 });
  },
  'tower-festival'(scene, ctx, rand) {
    layer(scene, ctx, 'sky-festival'); layer(scene, ctx, 'far-festival'); layer(scene, ctx, 'mid-festival', 0, 40);
    glow(ctx, 640, 200, 300, '#ffd070', 0.6);
    wash(ctx, blobPoints(640, 200, 70, 85, rand, 0.04), '#ffd27a', rand, { layers: 4, alpha: 0.8, edge: 0.5 });
    ground(ctx, 500, '#3a2a30', rand);
    drawGrandpa(ctx, 820, 520, 2.4, { flip: true });
    drawWick(ctx, 460, 510, 2.3, { eyes: 'open' });
    drawSmallMoth(ctx, 640, 120, 1.5);
  },
  'new-ember'(scene, ctx, rand) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#101030'); g.addColorStop(1, '#3a2a58');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 180; i++) { ctx.fillStyle = rgba('#ffffff', rand() * 0.7); ctx.fillRect(rand() * W, rand() * H, 2, 2); }
    glow(ctx, 760, 300, 300, '#ffb050', 0.35);
    drawWick(ctx, 460, 900, 5.4, { eyes: 'open', arm: 0.4 });
    drawPip(ctx, 800, 300, 2.6, { phase: 1.2 });
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
  ensureBackground(scene, 'caves');
  ensureBackground(scene, 'cliffs');
  ensureBackground(scene, 'storm');
  ensureBackground(scene, 'heart');
  ensureBackground(scene, 'dream');
  ensureBackground(scene, 'festival');
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
  const bg = { morrow: '#4a4050', ash: '#5a2018', ember: '#2a2048', wren: '#f0d8c0', nell: '#e8d8b0', wick: '#cfe0d8', grandpa: '#ead8c0', pip: '#3a2a48', mossback: '#c8dcb0', thornwolf: '#3a2a3a', haru: '#d8e4c8' }[who] || '#ddd';
  ctx.fillStyle = bg; ctx.fillRect(0, 0, S, S);
  if (who === 'wick') drawWick(ctx, 44, 290, 2.5, {});
  if (who === 'grandpa') drawGrandpa(ctx, 54, 300, 2.4, {});
  if (who === 'pip') drawPip(ctx, 64, 72, 2.6, {});
  if (who === 'thornwolf') drawThornwolf(ctx, -50, 168, 0.95, { eyes: 'angry', brambles: 1 });
  if (who === 'haru') drawThornwolf(ctx, -50, 168, 0.95, { eyes: 'calm', brambles: 0 });
  if (who === 'morrow') drawMorrow(ctx, 64, 150, 0.85, { eyes: 'sad' });
  if (who === 'ash') drawAsh(ctx, -68, 141, 0.6, {});
  if (who === 'ember') drawPip(ctx, 64, 72, 2.6, {});
  if (who === 'wren') drawWren(ctx, 64, 165, 1.3, {});
  if (who === 'nell') drawNell(ctx, 52, 236, 1.55, {});
  if (who === 'mossback') drawMossback(ctx, -230, 140, 1.2, { eyeOpen: 1 });
  ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(S / 2, S / 2, S / 2 - 3, 0, Math.PI * 2); ctx.stroke();
  addTexture(scene, key, c);
  return key;
}
