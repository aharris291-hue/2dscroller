// Levels are written as short build scripts (see levels.js). Coordinates are in
// tiles: x counts from the left, y counts UP from the bottom row (y = 0).
// Something "standing on" ground of height h is placed at y = h.
//
// Tile letters in the finished grid:
//   #  soil      B  stone block      =  wooden plank (jump up through it)
//   ~  spirit platform (only solid while Pip's Glow is shining)
//   ^  thorns (hurt)     w  water (hurt; Pip hates it)     r  mine-cart rail
//   c  crumbling ledge (falls away a moment after Wick lands on it)
//   .  empty air

export function buildLevel(def) {
  const W = def.width, H = def.height;
  const grid = Array.from({ length: H }, () => Array(W).fill('.'));
  const entities = [];
  const deco = [];
  const set = (ch, x, y) => {
    if (x >= 0 && x < W && y >= 0 && y < H) grid[H - 1 - y][x] = ch;
  };
  const ent = (type, x, y, extra = {}) => entities.push({ type, x, y, ...extra });

  const L = {
    ground(x, w, h) { for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) set('#', x + i, j); },
    fill(x, y, w, h) { for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) set('#', x + i, y + j); },
    ceil(x, w, h) { for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) set('#', x + i, H - 1 - j); },
    block(x, y, w = 1, h = 1) { for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) set('B', x + i, y + j); },
    plat(x, y, w) { for (let i = 0; i < w; i++) set('=', x + i, y); },
    spirit(x, y, w) { for (let i = 0; i < w; i++) set('~', x + i, y); },
    thorns(x, y, w) { for (let i = 0; i < w; i++) set('^', x + i, y); },
    water(x, y, w, h = 1) { for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) set('w', x + i, y + j); },
    rail(x, y, w) { for (let i = 0; i < w; i++) set('r', x + i, y); },
    /** A lift w tiles wide that travels dx tiles right and dy tiles up, then back. */
    mover(x, y, w, dx, dy, speed = 80) { ent('mover', x, y, { w, dx, dy, speed }); },
    crystal(x, y) { ent('crystal', x, y); },
    /** A crystal switch; lighting it with Glow makes Nell break the boulder with the same id. */
    switchCrystal(x, y, id) { ent('switch', x, y, { id }); },
    boulder(x, y, id) { ent('boulder', x, y, { id }); },
    /** A stalactite hanging just under the ceiling tile above (x, y). */
    drip(x, y) { ent('drip', x, y); },
    nell(x, y, lines = []) { ent('nell', x, y, { lines }); },
    crumble(x, y, w) { for (let i = 0; i < w; i++) set('c', x + i, y); },
    /** A column of rising wind, w wide and h tall, starting at row y. Gliding inside it lifts Wick. */
    updraft(x, y, w, h) { ent('updraft', x, y, { w, h }); },
    /** A lightning strike that hits column x, from cloud row `top` down to ground row y. */
    bolt(x, y, top, period = 3) { ent('bolt', x, y, { top, period }); },
    /** A gloom bat that swoops `range` tiles either side of (x, y). */
    bat(x, y, range = 3, vrange = 0.6) { ent('bat', x, y, { range, vrange }); },
    /** A friend's remembered voice, shown when Wick passes column x. */
    echo(x, who, text) { ent('trigger', x, 0, { event: 'echo', who, text }); },
    /** A friend standing around (epilogue): sprite key/frame and a line to say. */
    npc(x, y, key, line, opts = {}) { ent('npc', x, y, { key, line, ...opts }); },
    kite(x, y, w, dx, dy, speed = 70) { ent('mover', x, y, { w, dx, dy, speed, skin: 'kite' }); },
    embers(x, y, n = 1, dx = 1, dy = 0) { for (let i = 0; i < n; i++) ent('ember', x + i * dx, y + i * dy); },
    petal(x, y, id) { ent('petal', x, y, { id }); },
    start(x, y) { ent('start', x, y); },
    lantern(x, y, note) { ent('lantern', x, y, { note }); },
    exit(x, y) { ent('exit', x, y); },
    boss(x, y) { ent('boss', x, y); },
    shrine(x, y, skin) { ent('shrine', x, y, { skin }); },
    gloom(x, y) { ent('gloomling', x, y); },
    hopper(x, y) { ent('hopper', x, y); },
    spring(x, y) { ent('spring', x, y); },
    sleeper(x, y, line, look = 0) { ent('sleeper', x, y, { line, look }); },
    sign(x, y, text) { ent('sign', x, y, { text }); },
    /** Run a story event (bark, cutscene, unlock) when Wick first passes column x. */
    trigger(x, event) { ent('trigger', x, 0, { event }); },
    deco(type, x, y, extra = {}) { deco.push({ type, x, y, ...extra }); },
  };
  def.build(L);
  return { ...def, grid: grid.map((r) => r.join('')), entities, deco };
}
