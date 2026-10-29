// The Thornwolf boss. He is never beaten by force: each shrine lantern Wick
// lights with Pip's Glow loosens the brambles, and after four he remembers
// who he is. Each lantern also makes him a little more desperate.

import Phaser from 'phaser';
import { WOLF_FRAMES as F } from '../art/thornwolf.js';
import { audio } from './audio.js';

// Index = number of lanterns lit.
const CHARGE_SPEED = [460, 520, 590, 650];
const WINDUP = [0.75, 0.62, 0.52, 0.45];
const IDLE = [1.1, 0.9, 0.75, 0.6];
const LEAP_UP = 900;

// What he growls as the brambles loosen (from the story bible).
const LINES = [
  'The warm ones... TAKE.',
  'The fire takes... the forest...',
  'Why... do you... keep shining...?',
];

export class Thornwolf {
  constructor(scene, x, y) {
    this.scene = scene;
    this.lit = 0;
    this.dir = -1;
    const s = scene.physics.add.sprite(x, y, 'wolf-0', F.stand).setOrigin(170 / 360, 232 / 240).setScale(0.7).setDepth(16);
    s.body.setSize(190, 104).setOffset(85, 128);
    s.setFlipX(true);
    this.sprite = s;
    this.eyeGlow = scene.add.image(x, y, 'soft').setBlendMode(Phaser.BlendModes.ADD).setTint(0xff5a2a).setScale(0.7).setAlpha(0).setDepth(17);
    this.setState('intro', 1.8);
  }

  get stage() { return Math.min(this.lit, 3); }

  setState(name, time = 0) {
    this.state = name;
    this.timer = time;
    this.t = 0;
  }

  frame(f) {
    const key = this.state === 'calm' ? 'wolf-calm' : `wolf-${this.stage}`;
    if (this.sprite.texture.key !== key || this.sprite.frame.name !== f) this.sprite.setTexture(key, key === 'wolf-calm' ? 0 : f);
  }

  face(x) {
    this.dir = x < this.sprite.x ? -1 : 1;
    this.sprite.setFlipX(this.dir < 0);
  }

  /** Is touching him dangerous right now? */
  harmful() {
    return ['idle', 'windup', 'charge', 'leap'].includes(this.state);
  }

  update(dt, player) {
    const s = this.sprite, b = s.body;
    this.timer -= dt;
    this.t += dt;
    const sc = this.scene;
    switch (this.state) {
      case 'intro':
        b.setVelocityX(0);
        this.frame(F.stand);
        if (this.t < dt * 2) { sc.bubble.show(s, LINES[0], 2.6, -150); audio.play('growl'); }
        if (this.timer <= 0) this.setState('idle', 0.6);
        break;
      case 'idle':
        b.setVelocityX(0);
        this.face(player.x);
        this.frame(F.stand);
        if (this.timer <= 0) {
          this.next = this.lit >= 2 && Math.random() < 0.5 ? 'pounce' : 'charge';
          this.setState('windup', WINDUP[this.stage]);
          audio.play('growl');
        }
        break;
      case 'windup':
        b.setVelocityX(0);
        this.frame(F.crouch);
        if (this.timer <= 0) {
          if (this.next === 'pounce') this.leap(player);
          else { this.setState('charge', 4); audio.play('roar'); }
        }
        break;
      case 'charge': {
        b.setVelocityX(this.dir * CHARGE_SPEED[this.stage]);
        this.frame(Math.floor(this.t * 10) % 2 ? F.runA : F.runB);
        if (Math.random() < 0.4) sc.dust.explode(2, s.x - this.dir * 50, s.y);
        const hitWall = (this.dir < 0 && b.blocked.left) || (this.dir > 0 && b.blocked.right);
        if (hitWall) {
          b.setVelocityX(0);
          sc.cameras.main.shake(260, 0.012);
          sc.dust.explode(20, s.x + this.dir * 60, s.y - 30);
          audio.play('thud');
          this.setState('stun', 1.3 - this.stage * 0.12);
        } else if (this.timer <= 0) this.setState('idle', IDLE[this.stage]);
        break;
      }
      case 'leap':
        this.frame(F.leap);
        if (this.t > 0.15 && b.blocked.down) this.land();
        break;
      case 'stun':
        b.setVelocityX(0);
        this.frame(F.stun);
        if (this.timer <= 0) this.setState('idle', IDLE[this.stage]);
        break;
      case 'flinch':
        b.setVelocityX(0);
        this.frame(F.stun);
        if (this.timer <= 0) this.setState('idle', IDLE[this.stage]);
        break;
      case 'calm':
        b.setVelocityX(0);
        this.frame(0);
        break;
      default:
    }
    // glowing eyes give a warning before he attacks
    const head = { x: s.x + this.dir * 72, y: s.y - 92 };
    this.eyeGlow.setPosition(head.x, head.y).setAlpha(this.state === 'windup' ? 0.6 + Math.sin(this.t * 30) * 0.3 : 0);
  }

  leap(player) {
    const s = this.sprite;
    const flight = (2 * LEAP_UP) / this.scene.physics.world.gravity.y;
    const vx = Phaser.Math.Clamp((player.x - s.x) / flight, -620, 620);
    this.face(player.x);
    s.body.setVelocity(vx, -LEAP_UP);
    audio.play('roar');
    this.setState('leap', 3);
  }

  land() {
    const s = this.sprite;
    s.body.setVelocityX(0);
    this.scene.cameras.main.shake(200, 0.01);
    this.scene.dust.explode(18, s.x, s.y);
    audio.play('thud');
    if (this.lit >= 3) this.scene.thornWave(s.x, s.y);
    this.setState('idle', IDLE[this.stage]);
  }

  /** Called by the level each time a shrine lantern is lit. */
  onShrineLit(count) {
    this.lit = count;
    const s = this.sprite;
    s.body.setVelocityX(0);
    if (count >= 4) {
      this.setState('calm');
      this.eyeGlow.setAlpha(0);
      return;
    }
    this.scene.soot.explode(30, s.x, s.y - 60);
    this.scene.bubble.show(s, LINES[Math.min(count, LINES.length - 1)], 2.6, -150);
    audio.play('howl');
    if (this.state !== 'leap') this.setState('flinch', 1.2);
  }

  /** After Wick tumbles, give her a moment and move away from where she reappears. */
  onPlayerRespawn(at) {
    if (this.state === 'calm') return;
    const s = this.sprite;
    if (Math.abs(s.x - at.x) < 400) {
      const far = at.x < this.scene.worldW / 2 ? this.scene.worldW - 240 : 240;
      s.body.reset(far, s.y);
    }
    this.face(at.x);
    this.setState('idle', 2);
  }

  /** Turn into Haru, curled up asleep. */
  sleep() {
    const s = this.sprite;
    s.setTexture('wolf-sleep', 0).setOrigin(170 / 360, 152 / 160);
    s.body.enable = false;
    this.state = 'sleep';
  }
}
