// Chapter 3 systems: crumbling ledges, wind updrafts, lightning and rain.
// (The Feather Glide itself lives in the game scene's player code.)

import Phaser from 'phaser';
import { TILE, VIEW_W, VIEW_H } from '../config.js';
import { audio } from './audio.js';

export class CliffSystems {
  constructor(scene) {
    this.s = scene;
    this.L = scene.level;
    this.setupCrumbles();
    this.setupUpdrafts();
    this.setupBolts();
    if (this.L.theme === 'storm') this.setupRain();
  }

  ents(type) {
    return this.L.entities.filter((e) => e.type === type);
  }

  // ---------------------------------------------------------------- crumbling ledges

  setupCrumbles() {
    this.crumbles = [];
    this.L.grid.forEach((row, r) => [...row].forEach((ch, c) => {
      if (ch !== 'c') return;
      const img = this.s.add.image(c * TILE, r * TILE, 'crumble').setOrigin(0).setDepth(12);
      this.crumbles.push({ img, c, r, state: 'solid', t: 0, tile: this.s.layer.getTileAt(c, r) });
    }));
  }

  updateCrumbles(dt) {
    const pl = this.s.player, b = pl.body;
    const standing = b.blocked.down || b.touching.down;
    const underC = Math.floor(pl.x / TILE), underR = Math.floor((b.bottom + 4) / TILE);
    for (const k of this.crumbles) {
      k.t += dt;
      if (k.state === 'solid') {
        const touched = standing && k.r === underR && Math.abs(k.c - underC) <= 0 && !this.s.dead;
        if (touched) { k.state = 'shake'; k.t = 0; audio.play('bramble'); }
      } else if (k.state === 'shake') {
        k.img.x = k.c * TILE + Math.sin(k.t * 70) * 2;
        if (k.t > 0.5) {
          k.state = 'gone'; k.t = 0;
          k.tile.setCollision(false, false, false, false);
          this.s.dust.explode(10, k.c * TILE + TILE / 2, k.r * TILE + 10);
          this.s.tweens.add({ targets: k.img, y: k.img.y + 200, alpha: 0, angle: 20, duration: 600 });
        }
      } else if (k.state === 'gone' && k.t > 3.5) {
        // don't reappear inside the player
        const box = new Phaser.Geom.Rectangle(k.c * TILE, k.r * TILE, TILE, TILE);
        if (Phaser.Geom.Rectangle.Overlaps(box, new Phaser.Geom.Rectangle(b.x, b.y, b.width, b.height))) continue;
        k.state = 'solid';
        k.tile.setCollision(false, false, true, false);
        this.s.tweens.killTweensOf(k.img);
        k.img.setPosition(k.c * TILE, k.r * TILE).setAngle(0).setAlpha(0);
        this.s.tweens.add({ targets: k.img, alpha: 1, duration: 300 });
      }
    }
  }

  // ---------------------------------------------------------------- wind updrafts

  setupUpdrafts() {
    this.updrafts = [];
    const rows = this.L.grid.length;
    for (const e of this.ents('updraft')) {
      const rect = new Phaser.Geom.Rectangle(e.x * TILE, (rows - e.y - e.h) * TILE, e.w * TILE, e.h * TILE);
      this.updrafts.push(rect);
      // a soft pale column shows where the wind rises...
      const col = this.s.add.graphics().setDepth(9);
      for (let i = 0; i < 6; i++) {
        col.fillStyle(0xffffff, 0.035);
        col.fillRect(rect.x + i * 4, rect.y, rect.width - i * 8, rect.height);
      }
      // ...and streaks of wind race up through it
      this.s.add.particles(0, 0, 'wind', {
        x: { min: rect.x + 6, max: rect.right - 6 }, y: { min: rect.y + rect.height * 0.5, max: rect.bottom },
        speedY: { min: -460, max: -320 }, lifespan: { min: 700, max: 1300 },
        alpha: { start: 0.95, end: 0 }, scale: { min: 1.1, max: 1.7 }, frequency: 22, tint: 0xfff8f0,
      }).setDepth(15);
    }
  }

  /** Upward push for a point, or 0 if not in any updraft. */
  windAt(x, y) {
    for (const u of this.updrafts) if (u.contains(x, y)) return 1;
    return 0;
  }

  // ---------------------------------------------------------------- lightning

  setupBolts() {
    this.bolts = [];
    const rows = this.L.grid.length;
    for (const e of this.ents('bolt')) {
      const g = this.s.add.graphics().setDepth(40);
      const top = (rows - e.top) * TILE, bottom = (rows - e.y) * TILE;
      this.bolts.push({ x: e.x * TILE + TILE / 2, top, bottom, g, state: 'idle', t: 0, wait: 1 + Math.random() * 2, period: e.period || 3 });
    }
  }

  updateBolts(dt) {
    const pl = this.s.player;
    for (const b of this.bolts) {
      b.t += dt;
      b.g.clear();
      if (b.state === 'idle' && b.t > b.wait) { b.state = 'warn'; b.t = 0; }
      if (b.state === 'warn') {
        // a flickering line of light warns where it will strike
        if (Math.floor(b.t * 12) % 2 === 0) {
          b.g.lineStyle(3, 0xfff4c0, 0.5);
          b.g.lineBetween(b.x, b.top, b.x, b.bottom);
        }
        b.g.fillStyle(0xfff4c0, 0.25); b.g.fillCircle(b.x, b.bottom - 4, 16 + Math.sin(b.t * 30) * 4);
        if (b.t > 0.9) {
          b.state = 'strike'; b.t = 0;
          if (Math.abs(pl.x - b.x) < 700) { audio.play('thunder'); this.s.cameras.main.flash(90, 255, 250, 220, false); }
        }
      }
      if (b.state === 'strike') {
        // jagged bolt
        b.g.lineStyle(10, 0xfff8d0, 0.35);
        this.zigzag(b.g, b.x, b.top, b.bottom);
        b.g.lineStyle(4, 0xffffff, 1);
        this.zigzag(b.g, b.x, b.top, b.bottom);
        if (b.t > 0.28) { b.state = 'idle'; b.t = 0; b.wait = b.period * (0.8 + Math.random() * 0.4); }
      }
    }
  }

  zigzag(g, x, top, bottom) {
    const pts = [];
    const n = Math.max(4, Math.floor((bottom - top) / 40));
    for (let i = 0; i <= n; i++) pts.push(new Phaser.Math.Vector2(x + (i === 0 || i === n ? 0 : (Math.random() - 0.5) * 30), top + ((bottom - top) * i) / n));
    g.strokePoints(pts);
  }

  // ---------------------------------------------------------------- rain

  setupRain() {
    this.s.add.particles(0, 0, 'raindrop', {
      x: { min: -200, max: VIEW_W + 200 }, y: -30, speedY: { min: 900, max: 1200 }, speedX: -160,
      lifespan: 900, alpha: { start: 0.7, end: 0.3 }, frequency: 12, rotate: 10,
    }).setScrollFactor(0).setDepth(42);
  }

  // ---------------------------------------------------------------- each frame

  update(dt) {
    this.updateCrumbles(dt);
    this.updateBolts(dt);
  }

  hits(box) {
    for (const b of this.bolts) {
      if (b.state !== 'strike') continue;
      if (Phaser.Geom.Rectangle.Overlaps(box, new Phaser.Geom.Rectangle(b.x - 18, b.top, 36, b.bottom - b.top))) return true;
    }
    return false;
  }
}
