// Chapter 4 systems: Wick's lantern slowly fading in the Hush, and friends
// standing around the festival in the epilogue.

import Phaser from 'phaser';
import { WICK_BARKS } from '../story/script.js';

export class HeartSystems {
  constructor(scene) {
    this.s = scene;
    this.L = scene.level;
    scene.lightPower = 1;
    this.warned = false;
    this.npcs = [];
    for (const e of this.L.entities.filter((en) => en.type === 'npc')) {
      const p = scene.feet(e);
      const n = scene.add.sprite(p.x, p.y + 2, e.key, e.frame || 0).setOrigin(0.5, e.originY ?? 1).setScale(e.scale || 0.5).setDepth(11).setFlipX(!!e.flip);
      n.line = e.line;
      this.npcs.push(n);
      if (e.light) scene.cave.lights.push({ obj: n, r: 200, dy: -40 });
    }
  }

  update(dt) {
    const s = this.s, pl = s.player;
    if (this.L.fade && !s.frozen && !s.dead) {
      // the Hush slowly smothers Wick's lantern; any lit lantern nearby restores it
      const nearLight = s.lanterns.some((l) => l.lit && Phaser.Math.Distance.Between(l.x, l.y - 40, pl.x, pl.y) < 160);
      s.lightPower = nearLight ? Math.min(1, s.lightPower + dt * 0.8) : Math.max(0.32, s.lightPower - dt * 0.018);
      if (s.lightPower < 0.45 && !this.warned) {
        this.warned = true;
        s.bubble.show(pl, WICK_BARKS.lowLight, 3, -72);
      }
      if (s.lightPower > 0.8) this.warned = false;
      s.lanternGlow.setScale(3.2 * s.lightPower);
    }
    for (const n of this.npcs) {
      const near = Math.abs(n.x - pl.x) < 110 && Math.abs(n.y - pl.y) < 120;
      if (near && !n.shown && n.line) s.bubble.show(n, n.line, 4, -n.displayHeight - 10);
      n.shown = near;
    }
  }

  /** Each ember Wick picks up feeds the lantern a little. */
  onEmber() {
    this.s.lightPower = Math.min(1, this.s.lightPower + 0.06);
  }
}
