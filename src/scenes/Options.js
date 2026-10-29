import Phaser from 'phaser';
import { VIEW_W as W, VIEW_H as H } from '../config.js';
import { Controls } from '../game/input.js';
import { audio } from '../game/audio.js';
import { save } from '../game/save.js';
import { setFullscreen } from '../game/platform.js';
import { Menu, title } from '../ui/ui.js';

const pct = (v) => `${Math.round(v * 100)}%`;
const clamp = (v) => Math.round(Math.min(1, Math.max(0, v)) * 10) / 10;

export class OptionsScene extends Phaser.Scene {
  constructor() {
    super('Options');
  }

  create({ from }) {
    this.from = from;
    this.controls = new Controls(this);
    const s = save.data.settings;
    this.add.rectangle(0, 0, W, H, 0x120d14, 0.8).setOrigin(0);
    title(this, W / 2, 140, 'Options', 72);
    this.menu = new Menu(this, this.controls, W / 2, 260, [
      { label: 'Music', get: () => pct(s.music), adjust: (d) => { s.music = clamp(s.music + d * 0.1); audio.applySettings(); } },
      { label: 'Sound', get: () => pct(s.sfx), adjust: (d) => { s.sfx = clamp(s.sfx + d * 0.1); audio.applySettings(); audio.play('ember'); } },
      { label: 'Text speed', get: () => ['Slow', 'Normal', 'Fast'][[0.6, 1, 1.8].indexOf(s.textSpeed)] || 'Normal', adjust: (d) => {
        const opts = [0.6, 1, 1.8];
        const i = Math.max(0, opts.indexOf(s.textSpeed));
        s.textSpeed = opts[(i + d + opts.length) % opts.length];
      } },
      { label: 'Fullscreen', get: () => (s.fullscreen ? 'On' : 'Off'), adjust: () => { s.fullscreen = !s.fullscreen; setFullscreen(this.game, s.fullscreen); } },
      { label: 'Back', action: () => this.close() },
    ], { size: 34, gap: 62 });
  }

  close() {
    save.write();
    this.scene.stop();
    this.scene.resume(this.from);
  }

  update() {
    this.controls.update();
    if (this.controls.pressed('back')) { this.close(); return; }
    this.menu.update();
  }
}
