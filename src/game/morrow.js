// The final encounter: Morrow, the Ashen Moth. Like the Thornwolf, he is not
// beaten by force. Three phases:
//   1. hold on  - survive the falling ash and his wing gusts
//   2. relight  - light the four root lanterns with Glow while he swoops
//   3. reach    - he opens his wings; climb the spirit steps to the flame he is hiding

import Phaser from 'phaser';
import { TILE } from '../config.js';
import { audio } from './audio.js';

const LINES = {
  start: 'Go home, little candle. You will wake her, and she will burn down to nothing.',
  relight: 'Why do you keep lighting them? Every light you make will die.',
  reach: 'If I let go... she will go out.',
};
const HOLD_TIME = 20; // seconds of phase 1

export class MorrowBoss {
  constructor(scene, x, y) {
    this.s = scene;
    this.home = new Phaser.Math.Vector2(x, y);
    this.sprite = scene.add.sprite(x, y, 'morrow', 0).setScale(0.55).setDepth(16).play('morrow-flap');
    this.glow = scene.add.image(x, y, 'soft').setBlendMode(Phaser.BlendModes.ADD).setTint(0xff9a50).setScale(3).setAlpha(0).setDepth(15);
    this.phase = 1;
    this.t = 0;
    this.hold = 0;
    this.ashTimer = 1.5;
    this.gustTimer = 6;
    this.gust = 0;
    this.swoop = null;
    this.swoopTimer = 3;
    this.flakes = [];
    this.warnings = scene.add.graphics().setDepth(14);
    scene.time.delayedCall(1200, () => this.say(LINES.start));
    this.emitProgress();
  }

  say(text) {
    this.s.bubble.show(this.sprite, text, 3.6, -120);
  }

  emitProgress() {
    if (this.phase === 1) this.s.events.emit('progress', 'Hold on!', Math.min(1, this.hold / HOLD_TIME));
    else if (this.phase === 2) this.s.events.emit('progress', 'Light the root lanterns', null);
    else this.s.events.emit('progress', 'Reach him', null);
  }

  // ---------------------------------------------------------------- per frame

  update(dt) {
    const s = this.s, sp = this.sprite;
    this.t += dt;
    if (s.frozen || s.completed) return;

    // hover and bob
    if (!this.swoop) {
      const bob = Math.sin(this.t * 1.6) * 14;
      sp.x += (this.home.x + Math.sin(this.t * 0.5) * (this.phase === 3 ? 0 : 120) - sp.x) * 0.04;
      sp.y += (this.home.y + bob - sp.y) * 0.06;
    }
    this.glow.setPosition(sp.x, sp.y + 10);

    if (this.phase === 1) {
      this.hold += dt;
      this.emitProgress();
      if (this.hold >= HOLD_TIME) this.startPhase(2);
      this.updateGust(dt);
    }
    if (this.phase === 2) this.updateSwoop(dt);
    this.updateAsh(dt);

    if (this.phase === 3) {
      // touching the hidden flame ends the fight
      const pl = s.player;
      if (!s.dead && Phaser.Math.Distance.Between(pl.x, pl.y - 30, sp.x, sp.y + 10) < 110) s.reachMorrow();
    }
  }

  startPhase(n) {
    this.phase = n;
    audio.play('howl');
    this.s.cameras.main.shake(300, 0.008);
    if (n === 2) this.say(LINES.relight);
    if (n === 3) {
      // stop any dive in progress and drift back above the arena's centre
      this.swoop = null;
      this.sprite.setFlipX(false);
      if (this.sprite.x < -100 || this.sprite.x > this.s.worldW + 100) this.sprite.setPosition(this.home.x, -150);
      this.say(LINES.reach);
      this.sprite.anims.stop();
      this.sprite.setFrame(2);
      this.glow.setAlpha(0.8);
      this.s.tweens.add({ targets: this.glow, scale: 3.6, duration: 900, yoyo: true, repeat: -1 });
      // the spirit steps up to him stay lit from now on
      for (const sp of this.s.spirits) sp.timer = 9999;
    }
    this.emitProgress();
  }

  onShrineLit(count) {
    if (this.phase !== 2) return;
    this.s.soot.explode(30, this.sprite.x, this.sprite.y);
    if (count >= 4) this.startPhase(3);
  }

  // ---------------------------------------------------------------- attacks

  updateGust(dt) {
    this.gustTimer -= dt;
    if (this.gustTimer <= 0 && this.gust <= 0) {
      this.gust = 1.6;
      this.gustTimer = 6 + Math.random() * 2;
      audio.play('dash');
      this.s.cameras.main.shake(400, 0.004);
    }
    if (this.gust > 0) {
      this.gust -= dt;
      // a wing beat blows Wick away from the centre
      const pl = this.s.player;
      const dir = pl.x < this.home.x ? -1 : 1;
      pl.x += dir * 150 * dt;
      if (Math.random() < 0.6) this.s.dust.explode(1, pl.x - dir * 40, pl.y - 30);
    }
  }

  updateSwoop(dt) {
    const s = this.s, sp = this.sprite, pl = s.player;
    if (!this.swoop) {
      this.swoopTimer -= dt;
      if (this.swoopTimer < 0.9 && this.swoopTimer + dt >= 0.9) audio.play('growl');
      if (this.swoopTimer < 0.9) sp.y -= 40 * dt; // rising before the dive warns the player
      if (this.swoopTimer <= 0) {
        const fromLeft = pl.x > this.home.x;
        this.swoop = { dir: fromLeft ? 1 : -1, y: pl.y - 40 };
        sp.setPosition(fromLeft ? -200 : s.worldW + 200, this.swoop.y);
        sp.setFlipX(!fromLeft);
        audio.play('roar');
      }
      return;
    }
    sp.x += this.swoop.dir * 720 * dt;
    if ((this.swoop.dir > 0 && sp.x > s.worldW + 220) || (this.swoop.dir < 0 && sp.x < -220)) {
      this.swoop = null;
      this.swoopTimer = 3.5 + Math.random();
      sp.setFlipX(false);
      sp.setPosition(this.home.x, -150);
    }
  }

  updateAsh(dt) {
    const s = this.s, pl = s.player;
    this.ashTimer -= dt;
    const rate = this.phase === 1 ? 0.45 : this.phase === 2 ? 0.8 : 0.35;
    if (this.ashTimer <= 0) {
      this.ashTimer = rate;
      // aim near Wick half the time so standing still is never safe
      const x = Math.random() < 0.5 ? pl.x + (Math.random() - 0.5) * 200 : TILE + Math.random() * (s.worldW - TILE * 2);
      let gy = 0;
      for (let y = TILE * 2; y < s.worldH; y += 12) if (s.solidAt(x, y)) { gy = y; break; }
      if (gy) this.flakes.push({ x, gy, y: -40, warn: 0.75, sprite: null });
    }
    this.warnings.clear();
    for (const f of this.flakes) {
      if (f.warn > 0) {
        f.warn -= dt;
        this.warnings.fillStyle(0xffa060, 0.25 + 0.25 * Math.sin(this.t * 20));
        this.warnings.fillEllipse(f.x, f.gy, 44, 12);
        if (f.warn <= 0) {
          f.y = Math.max(s.cameras.main.scrollY - 30, f.gy - 700);
          f.sprite = s.add.image(f.x, f.y, 'ashflake').setDepth(17);
        }
        continue;
      }
      f.y += 520 * dt;
      f.sprite.setPosition(f.x, f.y).setAngle(f.y);
      if (f.y >= f.gy - 6) {
        f.done = true;
        s.soot.explode(6, f.x, f.gy - 6);
        f.sprite.destroy();
      }
    }
    this.flakes = this.flakes.filter((f) => !f.done);
  }

  /** Is Wick being hit by ash or a swooping Morrow? */
  hits(box) {
    for (const f of this.flakes) {
      if (f.warn > 0 || !f.sprite) continue;
      if (Phaser.Geom.Rectangle.Overlaps(box, new Phaser.Geom.Rectangle(f.x - 11, f.y - 11, 22, 22))) return true;
    }
    if (this.swoop) {
      const sp = this.sprite;
      if (Phaser.Geom.Rectangle.Overlaps(box, new Phaser.Geom.Rectangle(sp.x - 90, sp.y - 40, 180, 80))) return true;
    }
    return false;
  }

  onPlayerRespawn() {
    for (const f of this.flakes) f.sprite?.destroy();
    this.flakes = [];
    this.ashTimer = 2;
    this.swoopTimer = Math.max(this.swoopTimer, 2.5);
  }
}
