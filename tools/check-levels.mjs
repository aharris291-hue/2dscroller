// Checks that every level can be finished and every collectible can be reached,
// using a simplified model of Wick's jump. Run with: npm run check
import { LEVELS } from '../src/levels/levels.js';

const SOLID = '#B';
const FLOOR = '#B=~'; // things Wick can stand on (spirit platforms assume Glow)

function check(level) {
  const { grid, entities } = level;
  const H = grid.length, W = grid[0].length;
  const at = (x, y) => (x < 0 || x >= W ? '#' : y < 0 ? '.' : y >= H ? '.' : grid[H - 1 - y][x]);
  const canStand = (x, y) => at(x, y) !== '^' && !SOLID.includes(at(x, y)) && !SOLID.includes(at(x, y + 1)) && FLOOR.includes(at(x, y - 1));
  const springs = new Set(entities.filter((e) => e.type === 'spring').map((e) => `${e.x},${e.y}`));
  // Max tiles across for a jump that ends dy tiles higher (negative = lower).
  // From PHYS: a flat jump carries ~5.2 tiles, so 4 leaves a comfortable margin.
  const reach = (dy) => (dy >= 3 ? 3 : dy === 2 ? 3 : dy >= -1 ? 4 : dy >= -3 ? 5 : 6);
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
      const r = spring ? 5 : reach(dy);
      for (let dx = -r; dx <= r; dx++) {
        const nx = x + dx, ny = y + dy;
        const k = `${nx},${ny}`;
        if (seen.has(k) || !canStand(nx, ny) || !clear(x, y, nx, ny)) continue;
        seen.add(k);
        queue.push([nx, ny]);
      }
    }
  }
  const problems = [];
  if (!seen.has(`${exit.x},${exit.y}`)) problems.push(`exit at (${exit.x},${exit.y}) is NOT reachable`);
  for (const e of entities) {
    if (!['ember', 'petal', 'lantern', 'sign', 'sleeper', 'spring'].includes(e.type)) continue;
    let ok = false;
    for (const k of seen) {
      const [sx, sy] = k.split(',').map(Number);
      const up = e.y - sy;
      if (Math.abs(e.x - sx) <= (up >= 4 ? 2 : 3) && up >= 0 && up <= (springs.has(k) ? 10 : 4)) { ok = true; break; }
    }
    if (!ok) problems.push(`${e.type} at (${e.x},${e.y}) looks unreachable`);
    if (['lantern', 'sign', 'sleeper', 'spring'].includes(e.type) && !canStand(e.x, e.y)) problems.push(`${e.type} at (${e.x},${e.y}) is not standing on ground`);
  }
  if (!canStand(start.x, start.y)) problems.push('start is not on ground');
  if (!canStand(exit.x, exit.y)) problems.push('exit is not on ground');
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
