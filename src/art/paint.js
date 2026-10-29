// Watercolor painting helpers. Everything in the game is painted at startup
// with these, so the game ships with no image files.
//
// The watercolor look comes from a few tricks layered together:
//  - shapes are filled several times at low opacity with slightly jittered edges,
//  - edges get a darker, thin "pooled pigment" stroke,
//  - a soft paper grain is laid over the whole screen at runtime.

export function rng(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w);
  c.height = Math.ceil(h);
  return c;
}

/** Parse '#rrggbb' into {r,g,b}. */
export function hex(c) {
  const n = parseInt(c.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgba(c, a = 1) {
  const { r, g, b } = hex(c);
  return `rgba(${r},${g},${b},${a})`;
}

/** Blend two hex colours, t=0 gives a, t=1 gives b. */
export function mix(a, b, t) {
  const A = hex(a), B = hex(b);
  const h = (v) => Math.round(v).toString(16).padStart(2, '0');
  return `#${h(A.r + (B.r - A.r) * t)}${h(A.g + (B.g - A.g) * t)}${h(A.b + (B.b - A.b) * t)}`;
}

/**
 * Turn a polygon into a wobbly closed path by subdividing each edge and nudging
 * the new points sideways. `amp` is how far (in px) the edge can wander.
 */
export function wobble(points, amp, rand, steps = 3) {
  const out = [];
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
    const n = Math.max(1, Math.round((len / 24) * steps));
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const off = k === 0 ? 0 : (rand() - 0.5) * 2 * amp;
      out.push([x1 + (x2 - x1) * t + nx * off, y1 + (y2 - y1) * t + ny * off]);
    }
  }
  return out;
}

export function tracePoly(ctx, pts) {
  ctx.beginPath();
  // Smooth through midpoints for organic edges.
  const n = pts.length;
  const mid = (i) => [(pts[i][0] + pts[(i + 1) % n][0]) / 2, (pts[i][1] + pts[(i + 1) % n][1]) / 2];
  const m0 = mid(n - 1);
  ctx.moveTo(m0[0], m0[1]);
  for (let i = 0; i < n; i++) {
    const m = mid(i);
    ctx.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]);
  }
  ctx.closePath();
}

/** Points for an ellipse-ish blob. */
export function blobPoints(cx, cy, rx, ry, rand, bumps = 0.12, count = 18) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const r = 1 + (rand() - 0.5) * 2 * bumps;
    pts.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]);
  }
  return pts;
}

/**
 * Paint a polygon like a watercolor wash: several faint layered fills with
 * jittered edges, then a darker pooled edge.
 */
export function wash(ctx, pts, color, rand, { layers = 4, alpha = 0.32, amp = 4, edge = 0.35, edgeWidth = 1.6 } = {}) {
  ctx.save();
  for (let i = 0; i < layers; i++) {
    tracePoly(ctx, wobble(pts, amp, rand));
    ctx.fillStyle = rgba(color, alpha);
    ctx.fill();
  }
  if (edge > 0) {
    tracePoly(ctx, wobble(pts, amp * 0.6, rand));
    ctx.strokeStyle = rgba(darken(color, 0.35), edge);
    ctx.lineWidth = edgeWidth;
    ctx.stroke();
  }
  ctx.restore();
}

/** Solid, clean fill (for characters, where shapes must read clearly). */
export function fillPoly(ctx, pts, color) {
  tracePoly(ctx, pts);
  ctx.fillStyle = color;
  ctx.fill();
}

export function darken(c, t) {
  return mix(c, '#1c1020', t);
}

export function lighten(c, t) {
  return mix(c, '#fff8ec', t);
}

/** Speckle granulation: tiny dots of pigment that settle into paper. */
export function granulate(ctx, x, y, w, h, color, rand, density = 0.004, maxA = 0.25) {
  const n = Math.floor(w * h * density);
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = rgba(color, rand() * maxA);
    const s = rand() < 0.85 ? 1 : 2;
    ctx.fillRect(x + rand() * w, y + rand() * h, s, s);
  }
}

/** Soft radial glow. */
export function glow(ctx, x, y, r, color, a = 1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(color, a));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

/** Vertical gradient fill in a rect, banded slightly so it reads as painted. */
export function skyGradient(ctx, w, h, stops, rand) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  stops.forEach(([t, c]) => g.addColorStop(t, c));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // Uneven horizontal washes so it doesn't look like a perfect digital gradient.
  for (let i = 0; i < 14; i++) {
    const y = rand() * h, hh = 30 + rand() * 90;
    const pick = stops[Math.floor(rand() * stops.length)][1];
    ctx.fillStyle = rgba(pick, 0.08);
    ctx.beginPath();
    ctx.ellipse(rand() * w, y, w * (0.3 + rand() * 0.5), hh, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Off-white paper with fibres and grain, tileable. Used as a screen overlay. */
export function paperCanvas(size = 512, seed = 7) {
  const c = canvas(size, size);
  const ctx = c.getContext('2d');
  const rand = rng(seed);
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);
  const img = ctx.getImageData(0, 0, size, size);
  // Value noise at two scales, tileable by wrapping the lattice.
  const lattice = (cells) => {
    const v = Array.from({ length: cells * cells }, () => rand());
    return (x, y) => {
      const fx = (x / size) * cells, fy = (y / size) * cells;
      const x0 = Math.floor(fx), y0 = Math.floor(fy);
      const tx = fx - x0, ty = fy - y0;
      const at = (i, j) => v[((j % cells) * cells + (i % cells))];
      const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
      const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * sx;
      const b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * sx;
      return a + (b - a) * sy;
    };
  };
  const big = lattice(8), small = lattice(64);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = big(x, y) * 0.5 + small(x, y) * 0.35 + rand() * 0.15;
      const v = 128 + (n - 0.5) * 70;
      const i = (y * size + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    }
  }
  ctx.putImageData(img, 0, 0);
  // fibres
  ctx.lineWidth = 1;
  for (let i = 0; i < 260; i++) {
    const x = rand() * size, y = rand() * size, a = rand() * Math.PI, l = 6 + rand() * 18;
    ctx.strokeStyle = rand() < 0.5 ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    for (const off of [-size, 0, size]) {
      ctx.moveTo(x + off, y);
      ctx.lineTo(x + off + Math.cos(a) * l, y + Math.sin(a) * l);
    }
    ctx.stroke();
  }
  return c;
}

/** Register a canvas as a Phaser texture (replacing any older one). */
export function addTexture(scene, key, c) {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  scene.textures.addCanvas(key, c);
  return key;
}

/**
 * Build a horizontal sprite sheet from a draw function and register frames 0..n-1.
 * `scale` lets us paint at high resolution; sprites are displayed at 1/scale.
 */
export function addSheet(scene, key, w, h, count, draw) {
  const c = canvas(w * count, h);
  const ctx = c.getContext('2d');
  for (let i = 0; i < count; i++) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(i * w, 0, w, h);
    ctx.clip();
    ctx.translate(i * w, 0);
    draw(ctx, i);
    ctx.restore();
  }
  addTexture(scene, key, c);
  const tex = scene.textures.get(key);
  for (let i = 0; i < count; i++) tex.add(i, 0, i * w, 0, w, h);
  return tex;
}
