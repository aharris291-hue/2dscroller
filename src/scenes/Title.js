import Phaser from 'phaser';
import { VIEW_W, VIEW_H } from '../config.js';
import { ensureBackground } from '../art/world.js';
import { Controls } from '../game/input.js';
import { audio } from '../game/audio.js';
import { save } from '../game/save.js';
import { desktop, quitGame } from '../game/platform.js';
import { levelStep, go } from '../game/flow.js';
import { Menu, title, body } from '../ui/ui.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    ensureBackground(this, 'village');
    this.controls = new Controls(this);
    this.add.image(0, 0, 'sky-village').setOrigin(0);
    this.far = this.add.tileSprite(0, 0, VIEW_W, VIEW_H, 'far-village').setOrigin(0);
    this.fog = this.add.tileSprite(0, 0, VIEW_W, VIEW_H, 'fog-village').setOrigin(0).setAlpha(0.5);
    this.mid = this.add.tileSprite(0, 40, VIEW_W, VIEW_H, 'mid-village').setOrigin(0);
    this.add.particles(0, 0, 'dot', {
      x: { min: 0, max: VIEW_W }, y: { min: 200, max: VIEW_H }, lifespan: 7000,
      speedY: { min: -20, max: -6 }, speedX: { min: -8, max: 8 }, scale: { start: 1, end: 0 },
      tint: 0xffd27a, frequency: 120, blendMode: 'ADD',
    });

    // Wick and Pip on a hill, looking toward the Hearth.
    const hill = this.add.graphics();
    hill.fillStyle(0x2d2233, 1);
    hill.fillEllipse(250, VIEW_H + 40, 760, 260);
    this.add.image(230, VIEW_H - 86, 'soft').setScale(3.5).setTint(0xffc070).setAlpha(0.35).setBlendMode('ADD');
    this.add.sprite(220, VIEW_H - 62, 'wick').setOrigin(0.5, 124 / 128).setScale(1.1).play('wick-idle');
    this.pip = this.add.sprite(170, VIEW_H - 170, 'pip').play('pip-float');
    this.add.image(170, VIEW_H - 170, 'soft').setScale(2.2).setTint(0xff9a40).setAlpha(0.5).setBlendMode('ADD');

    const logo = title(this, VIEW_W / 2 + 140, 150, 'Ember Hollow', 110, '#ffe6b0');
    this.tweens.add({ targets: logo, y: 158, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    title(this, VIEW_W / 2 + 140, 232, 'a lantern-keeper\'s journey', 30, '#f6dcc0');

    const hasSave = save.hasProgress();
    const items = [];
    if (hasSave) items.push({ label: 'Continue', action: () => this.start(this.continueIndex()) });
    items.push({ label: hasSave ? 'New Game' : 'Begin', action: () => this.newGame() });
    items.push({ label: 'Chapters', action: () => this.scene.start('Chapters') });
    items.push({ label: 'Options', action: () => this.openOptions() });
    if (desktop) items.push({ label: 'Quit', action: () => quitGame() });
    this.menu = new Menu(this, this.controls, VIEW_W / 2 + 140, 340, items, { size: 38, gap: 58 });

    body(this, VIEW_W - 16, VIEW_H - 14, 'v0.2 prototype', 14, '#f6dcc0').setOrigin(1, 1).setAlpha(0.7);
    this.add.image(0, 0, 'paper-screen').setOrigin(0).setBlendMode(Phaser.BlendModes.MULTIPLY);
    this.cameras.main.fadeIn(800, 18, 13, 20);

    // Browsers block sound until the player interacts with the page.
    const wake = () => { audio.resume(); audio.playMusic('title'); };
    this.input.keyboard.on('keydown', wake);
    this.input.on('pointerdown', wake);
    if (this.input.gamepad) this.input.gamepad.on('down', wake);
    wake();
  }

  continueIndex() {
    return Math.min(save.data.unlocked, 4) - 1;
  }

  newGame() {
    save.reset();
    this.start(0);
  }

  start(index) {
    this.menu.destroy();
    this.cameras.main.fadeOut(600, 18, 13, 20);
    this.cameras.main.once('camerafadeoutcomplete', () => go(this, levelStep(index)));
  }

  openOptions() {
    this.scene.pause();
    this.scene.launch('Options', { from: 'Title' });
  }

  update(time) {
    this.controls.update();
    this.far.tilePositionX = time * 0.004;
    this.fog.tilePositionX = time * 0.012;
    this.mid.tilePositionX = time * 0.01;
    this.menu?.update();
  }
}
