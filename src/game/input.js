import Phaser from 'phaser';
// One place that turns keyboard + gamepad into game actions, so every scene
// can ask simple questions like `controls.pressed('jump')`.

const KEYS = {
  left: ['LEFT', 'A'],
  right: ['RIGHT', 'D'],
  up: ['UP', 'W'],
  down: ['DOWN', 'S'],
  jump: ['SPACE', 'Z', 'UP', 'W'],
  glow: ['X', 'C', 'SHIFT'],
  confirm: ['ENTER', 'SPACE', 'Z'],
  back: ['ESC', 'BACKSPACE'],
  pause: ['ESC', 'P'],
  dismiss: ['ENTER', 'DOWN', 'S'],
};

// Standard gamepad layout (Xbox naming): 0 A, 1 B, 2 X, 3 Y, 9 Start, 12-15 d-pad.
const PAD = {
  jump: [0], confirm: [0], back: [1], dismiss: [1], glow: [2, 3], pause: [9], up: [12], down: [13], left: [14], right: [15],
};

export class Controls {
  constructor(scene) {
    this.scene = scene;
    const names = [...new Set(Object.values(KEYS).flat())].join(',');
    this.keys = scene.input.keyboard.addKeys(names, false);
    this.state = this.read();
    this.prev = { ...this.state };
    scene.events.on('resume', () => this.sync());
    scene.events.on('wake', () => this.sync());
  }

  pad() {
    const gp = this.scene.input.gamepad;
    if (!gp || !gp.total) return null;
    return gp.getAll()[0] || null;
  }

  read() {
    const s = {};
    // JustDown catches taps that start and end between two frames.
    this.just = {};
    for (const [action, keys] of Object.entries(KEYS)) {
      this.just[action] = false;
    }
    for (const [name, key] of Object.entries(this.keys || {})) {
      if (key && Phaser.Input.Keyboard.JustDown(key)) {
        for (const [action, keys] of Object.entries(KEYS)) if (keys.includes(name)) this.just[action] = true;
      }
    }
    const pad = this.pad();
    for (const [action, keys] of Object.entries(KEYS)) {
      s[action] = keys.some((k) => this.keys[k] && this.keys[k].isDown) || this.just[action];
      if (pad && PAD[action]) s[action] ||= PAD[action].some((b) => pad.buttons[b] && pad.buttons[b].pressed);
    }
    if (pad && pad.axes.length >= 2) {
      const x = pad.axes[0].getValue(), y = pad.axes[1].getValue();
      s.left ||= x < -0.4;
      s.right ||= x > 0.4;
      s.up ||= y < -0.5;
      s.down ||= y > 0.5;
    }
    return s;
  }

  /** Call once at the start of each scene update. */
  update() {
    this.prev = this.state;
    this.state = this.read();
    if (this.stale) for (const a of [...this.stale]) if (!this.state[a]) this.stale.delete(a);
  }

  /** Forget anything held down, e.g. after returning from a menu. */
  sync() {
    this.state = this.read();
    this.prev = { ...this.state };
    this.just = {};
    // Keys still held from a menu or cutscene must be released before they count again.
    this.stale = new Set(Object.keys(this.state).filter((a) => this.state[a]));
    this.graceUntil = this.scene.time.now + 150;
  }

  blocked(action) {
    return (this.stale && this.stale.has(action)) || (this.graceUntil && this.scene.time.now < this.graceUntil);
  }

  down(action) { return this.state[action] && !(this.stale && this.stale.has(action)); }
  pressed(action) { return !this.blocked(action) && (this.just[action] || (this.state[action] && !this.prev[action])); }
  released(action) { return !this.state[action] && this.prev[action]; }
}
