// Checks that every level can be finished and every collectible can be reached,
// using a simplified model of Wick's jump. Run with: npm run check
import { LEVELS } from '../src/levels/levels.js';

const SOLID = '#B';
const FLOOR = '#B=~rc'; // things Wick can stand on (spirit platforms assume Glow, r = rail)

function check(level) {
  const { entities } = level;
  const grid = level.grid.map((r) => [...r]);
  const H = grid.length, W = grid[0].length;
  // A lift counts as floor everywhere along its path.
  for (const m of entities.filter((e) => e.type === 'mover')) {
    const n = Math.max(Math.abs(m.dx), Math.abs(m.dy), 1);
    for (let t = 0; t <= n; t++) {
      for (let i = 0; i < m.w; i++) {
        const x = m.x + i + Math.round((t * m.dx) / n), y = m.y + Math.round((t * m.dy) / n);
        if (grid[H - 1 - y] && grid[H - 1 - y][x] === '.') grid[H - 1 - y][x] = '=';
      }
    }
  }
  const at = (x, y) => (x < 0 || x >= W ? '#' : y < 0 ? '.' : y >= H ? '.' : grid[H - 1 - y][x]);
  const canStand = (x, y) => at(x, y) !== '^' && at(x, y) !== 'w' && !SOLID.includes(at(x, y)) && !SOLID.includes(at(x, y + 1)) && FLOOR.includes(at(x, y - 1));
  const springs = new Set(entities.filter((e) => e.type === 'spring').map((e) => `${e.x},${e.y}`));
  // Max tiles across for a jump that ends dy tiles higher (negative = lower).
  // From PHYS: a flat jump carries ~5.2 tiles, so 4 leaves a comfortable margin.
  const baseReach = (dy) => (dy >= 3 ? 3 : dy === 2 ? 3 : dy >= -1 ? 4 : dy >= -3 ? 5 : 6);
  // The Ember Dash adds about 3.5 tiles of sideways travel to any jump.
  // The Feather Glide turns the fall from a jump's peak into a long, slow drift.
  const glideReach = (dy) => (dy >= 3 ? 3 : Math.min(12, Math.floor(1.5 + (3.5 - dy) * 2.2)));
  const canGlide = (x) => level.glide || (level.glideFrom !== undefined && x >= level.glideFrom);
  const reachAt = (x, dy) => Math.max(baseReach(dy), canGlide(x) ? glideReach(dy) : 0) + (level.dash ? (dy >= 3 ? 2 : 3) : 0);
  const updrafts = entities.filter((e) => e.type === 'updraft');
  const forwardOnly = level.mode === 'cart';
  const start = entities.find((e) => e.type === 'start');
  const exit = entities.find((e) => e.type === 'exit');

  // Is the straight-ish path from a to b blocked by a solid wall at head height?
  const clear = (x1, y1, x2, y2) => {
    const top = Math.max(y1, y2) + 1;
    const step = Math.sign(x2 - x1);
    for (let x = x1 + step; x !== x2; x += step) {
      if (SOLID.includes(at(x, top)) && SOLID.includes(at(x, top - 1))) return false;
    }
    return true;
  };

  const seen = new Set([`${start.x},${start.y}`]);
  const queue = [[start.x, start.y]];
  while (queue.length) {
    const [x, y] = queue.shift();
    const spring = springs.has(`${x},${y}`);
    const maxUp = spring ? 8 : 3;
    for (let dy = -H; dy <= maxUp; dy++) {
      const r = spring ? 5 : reachAt(x, dy);
      for (let dx = forwardOnly ? 1 : -r; dx <= r; dx++) {
        const nx = x + dx, ny = y + dy;
        const k = `${nx},${ny}`;
        if (seen.has(k) || !canStand(nx, ny) || !clear(x, y, nx, ny)) continue;
        seen.add(k);
        queue.push([nx, ny]);
      }
    }
    // Gliding into an updraft carries Wick up to its top.
    if (canGlide(x)) {
      for (const u of updrafts) {
        const near = x >= u.x - 5 && x <= u.x + u.w + 4 && y >= u.y - 3 && y <= u.y + u.h;
        if (!near) continue;
        for (let ny = u.y; ny <= u.y + u.h + 3; ny++) {
          for (let nx = u.x - 7; nx <= u.x + u.w + 6; nx++) {
            const k = `${nx},${ny}`;
            if (seen.has(k) || !canStand(nx, ny)) continue;
            seen.add(k);
            queue.push([nx, ny]);
          }
        }
      }
    }
  }
  const problems = [];
  if (exit && !seen.has(`${exit.x},${exit.y}`)) problems.push(`exit at (${exit.x},${exit.y}) is NOT reachable`);
  if (!exit && !level.boss) problems.push('level has no exit');
  for (const e of entities) {
    if (!['ember', 'petal', 'lantern', 'sign', 'sleeper', 'spring', 'shrine'].includes(e.type)) continue;
    let ok = false;
    for (const k of seen) {
      const [sx, sy] = k.split(',').map(Number);
      const up = e.y - sy;
      if (Math.abs(e.x - sx) <= (up >= 4 ? 2 : 3) && up >= 0 && up <= (springs.has(k) ? 10 : 4)) { ok = true; break; }
    }
    // Things floating mid-air can be grabbed while gliding past, or by riding an updraft.
    if (!ok && (level.glide || level.glideFrom !== undefined)) {
      for (const k of seen) {
        const [sx, sy] = k.split(',').map(Number);
        const up = e.y - sy;
        if (canGlide(sx) && up <= 4 && up >= -14 && Math.abs(e.x - sx) <= reachAt(sx, up)) { ok = true; break; }
      }
      for (const u of updrafts) {
        if (ok || e.x < u.x - 1 || e.x > u.x + u.w || e.y < u.y || e.y > u.y + u.h + 3) continue;
        for (const k of seen) {
          const [sx, sy] = k.split(',').map(Number);
          if (canGlide(sx) && sx >= u.x - 5 && sx <= u.x + u.w + 4 && sy >= u.y - 3 && sy <= u.y + u.h) { ok = true; break; }
          if (canGlide(sx) && sy >= u.y + 2 && Math.abs(sx - u.x) <= reachAt(sx, u.y - sy)) { ok = true; break; }
        }
      }
    }
    if (!ok) problems.push(`${e.type} at (${e.x},${e.y}) looks unreachable`);
    if (['lantern', 'sign', 'sleeper', 'spring', 'shrine'].includes(e.type) && !canStand(e.x, e.y)) problems.push(`${e.type} at (${e.x},${e.y}) is not standing on ground`);
  }
  if (!canStand(start.x, start.y)) problems.push('start is not on ground');
  if (exit && !canStand(exit.x, exit.y)) problems.push('exit is not on ground');
  for (const e of entities) {
    if ((e.type === 'gloomling' || e.type === 'hopper') && !canStand(e.x, e.y)) problems.push(`${e.type} at (${e.x},${e.y}) is not on ground`);
  }
  return problems;
}

let failed = false;
for (const level of LEVELS) {
  const problems = check(level);
  const embers = level.entities.filter((e) => e.type === 'ember').length;
  const petals = level.entities.filter((e) => e.type === 'petal').length;
  console.log(`${problems.length ? 'FAIL' : 'ok  '} ${level.id.padEnd(4)} ${level.name} (${embers} embers, ${petals} petals)`);
  for (const p of problems) console.log('       - ' + p);
  if (problems.length) failed = true;
}
process.exit(failed ? 1 : 0);
