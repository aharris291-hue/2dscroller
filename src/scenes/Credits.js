import Phaser from 'phaser';
import { VIEW_W as W, VIEW_H as H, FONT_BODY } from '../config.js';
import { CREDITS } from '../story/script.js';
import { ensureBackground } from '../art/world.js';
import { Controls } from '../game/input.js';
import { audio } from '../game/audio.js';
import { title } from '../ui/ui.js';

export class CreditsScene extends Phaser.Scene {
  constructor() {
    super('Credits');
  }

  create() {
    this.controls = new Controls(this);
    ensureBackground(this, 'festival');
    this.add.image(0, 0, 'sky-festival').setOrigin(0);
    this.far = this.add.tileSprite(0, 0, W, H, 'far-festival').setOrigin(0);
    this.mid = this.add.tileSprite(0, 40, W, H, 'mid-festival').setOrigin(0);
    this.add.particles(0, 0, 'dot', {
      x: { min: 0, max: W }, y: H + 10, lifespan: 9000, speedY: { min: -60, max: -25 }, speedX: { min: -10, max: 10 },
      scale: { start: 1.4, end: 0.2 }, tint: 0xffd27a, frequency: 140, blendMode: 'ADD',
    });
    this.add.rectangle(0, 0, W, H, 0x120d14, 0.35).setOrigin(0);
    // credits roll upward
    this.roll = this.add.container(W / 2, H + 40);
    let y = 0;
    for (const [kind, text] of CREDITS) {
      const t = kind === 'title' ? title(this, 0, y, text, 72, '#ffe6b0')
        : kind === 'head' ? title(this, 0, y, text, 32, '#ffd27a')
          : this.add.text(0, y, text, { fontFamily: FONT_BODY, fontSize: '22px', color: '#f6ecd6', align: 'center' }).setOrigin(0.5);
      this.roll.add(t);
      y += kind === 'title' ? 110 : kind === 'head' ? 54 : kind === 'gap' ? 40 : 34;
    }
    this.rollHeight = y;
    this.add.image(0, 0, 'paper-screen').setOrigin(0).setBlendMode(Phaser.BlendModes.MULTIPLY);
    this.cameras.main.fadeIn(1200, 18, 13, 20);
    audio.playMusic('credits');
    this.done = false;
  }

  update(time, delta) {
    this.controls.update();
    this.far.tilePositionX = time * 0.004;
    this.mid.tilePositionX = time * 0.01;
    const speed = this.controls.down('confirm') || this.controls.down('jump') ? 220 : 55;
    this.roll.y -= (speed * delta) / 1000;
    const finished = this.roll.y < -this.rollHeight + H / 2 - 40;
    if ((finished || this.controls.pressed('back')) && !this.done) {
      this.done = true;
      this.cameras.main.fadeOut(1500, 18, 13, 20);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Title'));
    }
  }
}
