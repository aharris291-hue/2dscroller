import Phaser from 'phaser';
import { VIEW_W as W, VIEW_H as H } from '../config.js';
import { Controls } from '../game/input.js';
import { levelStep, go } from '../game/flow.js';
import { Menu, title } from '../ui/ui.js';
import { audio } from '../game/audio.js';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super('Pause');
  }

  create({ index }) {
    this.controls = new Controls(this);
    this.add.rectangle(0, 0, W, H, 0x120d14, 0.65).setOrigin(0);
    title(this, W / 2, 170, 'Paused', 80);
    this.menu = new Menu(this, this.controls, W / 2, 300, [
      { label: 'Resume', action: () => this.resume() },
      { label: 'Back to last lantern', action: () => { this.resume(); this.scene.get('Game').respawn(); } },
      { label: 'Restart level', action: () => this.leave(() => go(this.scene.get('Game'), { scene: 'Game', data: { index } })) },
      { label: 'Options', action: () => { this.scene.pause(); this.scene.launch('Options', { from: 'Pause' }); } },
      { label: 'Quit to title', action: () => this.leave(() => this.scene.get('Game').scene.start('Title')) },
    ], { size: 36, gap: 60 });
    audio.play('confirm');
  }

  resume() {
    this.scene.stop();
    this.scene.resume('Game');
  }

  leave(fn) {
    this.scene.stop();
    fn();
  }

  update() {
    this.controls.update();
    if (this.controls.pressed('pause') || this.controls.pressed('back')) { this.resume(); return; }
    this.menu.update();
  }
}
