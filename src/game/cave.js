// Chapter 2 systems, kept separate from the core game scene:
//  - darkness that only lights can push back
//  - moving mine lifts
//  - water (Pip hates it) and the rising flood
//  - stalactites that shake loose and fall
//  - boulders that Nell breaks when Wick lights a crystal switch
//  - the mine cart ride

import Phaser from 'phaser';
import { TILE, VIEW_W, VIEW_H } from '../config.js';
import { audio } from './audio.js';

export class CaveSystems {
  constructor(scene) {
    this.s = scene;
    this.L = scene.level;
    this.hazards = []; // static danger rectangles (water)
    this.lights = []; // { obj, r } things that light the darkness
    this.time = 0;
    this.nopeTimer = 0;
    this.setupWater();
    this.setupMovers();
    this.setupCrystals();
    this.setupDrips();
    this.setupBoulders();
    if (this.L.dark) this.setupDarkness();
    if (this.L.mode === 'flood') this.setupFlood();
    if (this.L.mode === 'cart') this.setupCart();
  }

  ents(type) {
    return this.L.entities.filter((e) => e.type === type);
  }

  // ---------------------------------------------------------------- water

  setupWater() {
    const { grid } = this.L;
    this.waterTops = [];
    grid.forEach((row, r) => {
      let c = 0;
      while (c < row.length) {
        if (row[c] !== 'w') { c++; continue; }
        const start = c;
        while (row[c] === 'w') c++;
        const x = start * TILE, w = (c - start) * TILE, y = r * TILE;
        const top = r === 0 || grid[r - 1][start] !== 'w';
        this.s.add.tileSprite(x, y + (top ? 12 : 0), w, TILE - (top ? 12 : 0), 'water-body').setOrigin(0).setDepth(18);
        if (top) {
          const t = this.s.add.tileSprite(x, y, w, 24, 'water-top').setOrigin(0).setDepth(18);
          this.waterTops.push(t);
        }
        this.hazards.push(new Phaser.Geom.Rectangle(x, y + (top ? 18 : 0), w, TILE - (top ? 18 : 0)));
      }
    });
  }

  // ---------------------------------------------------------------- lifts

  setupMovers() {
    this.movers = [];
    const rows = this.L.grid.length;
    for (const e of this.ents('mover')) {
      const x = e.x * TILE, y = (rows - 1 - e.y) * TILE;
      const lift = this.s.add.tileSprite(x, y, e.w * TILE, e.skin === 'kite' ? 26 : 22, e.skin || 'lift').setOrigin(0).setDepth(13);
      this.s.physics.add.existing(lift);
      const b = lift.body;
      b.setAllowGravity(false).setImmovable(true);
      b.checkCollision.down = false;
      b.checkCollision.left = false;
      b.checkCollision.right = false;
      lift.from = new Phaser.Math.Vector2(x, y);
      lift.to = new Phaser.Math.Vector2(x + e.dx * TILE, y - e.dy * TILE);
      lift.speed = e.speed || 80;
      lift.dir = 1;
      lift.pause = 0.5;
      this.s.physics.add.collider(this.s.player, lift);
      this.movers.push(lift);
    }
  }

  updateMovers(dt) {
    for (const m of this.movers) {
      const b = m.body;
      if (m.pause > 0) {
        m.pause -= dt;
        b.setVelocity(0, 0);
        continue;
      }
      const target = m.dir > 0 ? m.to : m.from;
      const dx = target.x - b.x, dy = target.y - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist < m.speed * dt + 1) {
        b.reset(target.x, target.y);
        m.dir *= -1;
        m.pause = 0.6;
        continue;
      }
      b.setVelocity((dx / dist) * m.speed, (dy / dist) * m.speed);
    }
  }

  // ---------------------------------------------------------------- crystals, switches, boulders, Nell

  setupCrystals() {
    for (const e of this.ents('crystal')) {
      const p = this.s.feet(e);
      const c = this.s.add.image(p.x, p.y + 4, 'crystal', 0).setOrigin(0.5, 1).setScale(0.8).setDepth(11);
      const g = this.s.add.image(p.x, p.y - 30, 'soft').setBlendMode(Phaser.BlendModes.ADD).setTint(0x7ad8f0).setScale(3).setAlpha(0.35).setDepth(11);
      this.s.tweens.add({ targets: g, alpha: 0.55, duration: 1600 + Math.random() * 800, yoyo: true, repeat: -1 });
      this.lights.push({ obj: c, r: 210, dy: -30 });
    }
  }

  setupBoulders() {
    this.switches = [];
    this.boulders = [];
    for (const e of this.ents('switch')) {
      const p = this.s.feet(e);
      const sw = this.s.add.image(p.x, p.y + 4, 'switch', 0).setOrigin(0.5, 1).setScale(0.8).setDepth(11);
      sw.id = e.id;
      this.switches.push(sw);
    }
    for (const e of this.ents('boulder')) {
      const p = this.s.feet(e);
      const bx = p.x + TILE / 2; // a boulder fills two tiles across
      const bo = this.s.physics.add.staticImage(bx, p.y - TILE, 'boulder').setDepth(14);
      bo.body.setSize(TILE * 2 - 4, TILE * 2);
      bo.id = e.id;
      this.s.physics.add.collider(this.s.player, bo);
      this.boulders.push(bo);
    }
    const n = this.ents('nell')[0];
    if (n) {
      const p = this.s.feet(n);
      this.nell = this.s.add.sprite(p.x, p.y + 2, 'nell', 0).setOrigin(56 / 128, 140 / 144).setScale(0.55).setDepth(19);
      this.nell.lines = n.lines || [];
      this.nellLine = 0;
      this.lights.push({ obj: this.nell, r: 170, dy: -60 });
    }
  }

  /** Called when Pip glows: wakes any crystal switch close enough. */
  onGlow(px, py) {
    for (const sw of this.switches) {
      if (sw.lit || Phaser.Math.Distance.Between(px, py, sw.x, sw.y - 30) > 160) continue;
      sw.lit = true;
      sw.setFrame(1);
      this.lights.push({ obj: sw, r: 220, dy: -30 });
      audio.play('lantern');
      this.s.sparkle.explode(20, sw.x, sw.y - 40);
      const bo = this.boulders.find((b) => b.id === sw.id && b.active);
      if (bo) this.breakBoulder(bo);
    }
  }

  breakBoulder(bo) {
    const s = this.s;
    if (this.nell) {
      // Nell hurries over and swings her pickaxe
      const side = s.player.x < bo.x ? -1 : 1;
      this.nell.setPosition(bo.x + side * 80, bo.y + TILE).setFlipX(side > 0);
      this.nell.play('nell-swing');
      s.bubble.show(this.nell, ['Stand back, candle-kid!', 'Light it up, I\'ll knock it down!', 'One more! Together!'][this.nellLine++ % 3], 2.4, -80);
    }
    s.time.delayedCall(900, () => {
      audio.play('thud');
      s.cameras.main.shake(200, 0.008);
      s.dust.explode(30, bo.x, bo.y);
      bo.body.enable = false;
      s.tweens.add({ targets: bo, alpha: 0, scale: 1.3, duration: 300, onComplete: () => bo.destroy() });
      if (this.nell) this.nell.setFrame(0);
    });
  }

  // ---------------------------------------------------------------- stalactites

  setupDrips() {
    this.drips = [];
    const rows = this.L.grid.length;
    for (const e of this.ents('drip')) {
      const x = e.x * TILE + TILE / 2, y = (rows - 1 - e.y) * TILE;
      const d = this.s.add.image(x, y, 'drip').setOrigin(0.5, 0).setDepth(14);
      d.home = { x, y };
      d.state = 'hang';
      d.t = 0;
      d.vy = 0;
      this.drips.push(d);
    }
  }

  updateDrips(dt) {
    const pl = this.s.player;
    for (const d of this.drips) {
      d.t += dt;
      if (d.state === 'hang') {
        if (Math.abs(pl.x - d.home.x) < 70 && pl.y > d.home.y && pl.y - d.home.y < 9 * TILE) {
          d.state = 'shake'; d.t = 0;
          audio.play('bramble');
        }
      } else if (d.state === 'shake') {
        d.x = d.home.x + Math.sin(d.t * 60) * 2;
        if (d.t > 0.45) { d.state = 'fall'; d.vy = 0; d.x = d.home.x; }
      } else if (d.state === 'fall') {
        d.vy += 2200 * dt;
        d.y += d.vy * dt;
        if (this.s.solidAt(d.x, d.y + 66) || d.y > this.s.worldH) {
          d.state = 'gone'; d.t = 0;
          this.s.dust.explode(14, d.x, d.y + 60);
          audio.play('thud');
          d.setVisible(false);
        }
      } else if (d.state === 'gone' && d.t > 3) {
        d.setPosition(d.home.x, d.home.y).setVisible(true).setAlpha(0);
        this.s.tweens.add({ targets: d, alpha: 1, duration: 500 });
        d.state = 'hang';
      }
    }
  }

  // ---------------------------------------------------------------- darkness

  setupDarkness() {
    this.rt = this.s.add.renderTexture(0, 0, VIEW_W, VIEW_H).setOrigin(0).setScrollFactor(0).setDepth(44);
    this.boost = 0;
  }

  updateDarkness(dt) {
    const s = this.s, cam = s.cameras.main;
    const ox = cam.scrollX, oy = cam.scrollY;
    this.boost = Math.max(0, this.boost - dt);
    const rt = this.rt;
    rt.clear();
    rt.fill(0x07040c, this.L.dark);
    const hole = (x, y, r) => {
      const sx = x - ox, sy = y - oy;
      if (sx < -r || sy < -r || sx > VIEW_W + r || sy > VIEW_H + r) return;
      rt.stamp('lightmask', 0, sx, sy, { scale: r / 128, erase: true });
    };
    const pl = s.player;
    if (pl.visible && pl.alpha > 0.2) hole(pl.x, pl.y - 30, 230 + this.boost * 220);
    if (s.pip?.visible) hole(s.pip.x, s.pip.y, 120);
    for (const l of this.lights) if (l.obj.active && l.obj.visible) hole(l.obj.x, l.obj.y + (l.dy || 0), l.r);
    for (const lt of s.lanterns) if (lt.lit) hole(lt.x, lt.y - 50, 280);
    if (s.exit) hole(s.exit.x, s.exit.y - 80, 300);
    if (this.cart) hole(this.cart.x + 60, this.cart.y - 30, 260);
  }

  // ---------------------------------------------------------------- flood

  setupFlood() {
    const s = this.s;
    this.floodY = s.worldH - TILE * 0.5;
    this.floodSpeed = this.L.floodSpeed || 30;
    this.floodDelay = 3;
    this.floodBody = s.add.tileSprite(0, this.floodY, s.worldW, VIEW_H + 200, 'water-body').setOrigin(0).setDepth(46);
    this.floodTop = s.add.tileSprite(0, this.floodY - 12, s.worldW, 24, 'water-top').setOrigin(0).setDepth(46);
  }

  updateFlood(dt) {
    const s = this.s;
    if (s.frozen || s.completed) return;
    this.floodDelay -= dt;
    if (this.floodDelay <= 0 && !s.dead) {
      // the water speeds up a little the longer it rises
      this.floodY -= this.floodSpeed * dt;
      this.floodSpeed = Math.min(this.floodSpeed + dt * 0.4, (this.L.floodSpeed || 30) * 1.6);
    }
    this.floodBody.y = this.floodY;
    this.floodTop.y = this.floodY - 12;
    this.floodTop.tilePositionX += dt * 30;
    if (!s.dead && s.player.y - 16 > this.floodY) s.hurt(true);
  }

  /** After a tumble, pull the water back down below the lantern. */
  onRespawn(at) {
    if (this.L.mode === 'flood') {
      this.floodY = Math.max(this.floodY, at.y + TILE * 7);
      this.floodSpeed = this.L.floodSpeed || 30;
      this.floodDelay = 2;
    }
    for (const d of this.drips) if (d.state !== 'hang') { d.state = 'gone'; d.t = 2.5; d.setVisible(false); }
  }

  // ---------------------------------------------------------------- mine cart

  setupCart() {
    const s = this.s;
    this.cart = s.add.sprite(s.player.x, s.player.y, 'cart', 0).setOrigin(0.5, 1).setScale(0.75).setDepth(21).play('cart-roll');
  }

  updateCart() {
    const pl = this.s.player;
    this.cart.setPosition(pl.x, pl.y + 6).setAlpha(pl.alpha).setVisible(pl.visible);
    this.cart.anims.timeScale = this.s.dead ? 0 : 1;
  }

  // ---------------------------------------------------------------- each frame

  update(dt) {
    this.time += dt;
    for (const t of this.waterTops) t.tilePositionX += dt * 24;
    this.updateMovers(dt);
    this.updateDrips(dt);
    if (this.L.mode === 'flood') this.updateFlood(dt);
    if (this.cart) this.updateCart();
    if (this.rt) this.updateDarkness(dt);
    // Pip really does not like water
    this.nopeTimer -= dt;
    const pl = this.s.player;
    if (this.nopeTimer <= 0 && this.hazards.some((h) => Math.abs(h.centerX - pl.x) < h.width / 2 + 120 && Math.abs(h.y - pl.y) < 120)) {
      this.nopeTimer = 8;
      this.s.pipSay('water');
    }
    if (this.nell && this.nell.lines.length && !this.nell.talked && Math.abs(this.nell.x - pl.x) < 140) {
      this.nell.talked = true;
      this.s.bubble.show(this.nell, this.nell.lines[0], 3.5, -80);
    }
  }

  /** Is the player's box touching water or a falling stalactite? */
  hits(box) {
    for (const h of this.hazards) if (Phaser.Geom.Rectangle.Overlaps(box, h)) return 'water';
    for (const d of this.drips) {
      if (d.state !== 'fall') continue;
      if (Phaser.Geom.Rectangle.Overlaps(box, new Phaser.Geom.Rectangle(d.x - 12, d.y + 20, 24, 46))) return 'rock';
    }
    return null;
  }
}
