import Phaser from 'phaser';
import { VIEW_W as W, VIEW_H as H, FONT_BODY } from '../config.js';
import { LEVELS } from '../levels/levels.js';
import { PETALS } from '../story/script.js';
import { Controls } from '../game/input.js';
import { afterLevelStep, go } from '../game/flow.js';
import { title, body, panel } from '../ui/ui.js';
import { audio } from '../game/audio.js';

export class LevelEndScene extends Phaser.Scene {
  constructor() {
    super('LevelEnd');
  }

  create({ index, stats }) {
    this.index = index;
    this.controls = new Controls(this);
    const lvl = LEVELS[index];
    this.add.image(0, 0, `sky-${lvl.theme}`).setOrigin(0);
    this.add.image(0, 0, `far-${lvl.theme}`).setOrigin(0);
    this.add.rectangle(0, 0, W, H, 0x120d14, 0.35).setOrigin(0);
    panel(this, W / 2 - 400, 80, 800, 560);
    title(this, W / 2, 140, `${lvl.name}`, 56);
    body(this, W / 2, 196, 'Level complete', 24, '#7a5a3c').setOrigin(0.5);

    const t = stats.time;
    const lines = [
      ['Embers gathered', `${stats.embers} / ${stats.total}`],
      ['Memory petals', `${stats.petals.length} / ${stats.petalTotal}`],
      ['Time', `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`],
      ['Tumbles', `${stats.deaths}`],
    ];
    lines.forEach(([k, v], i) => {
      body(this, W / 2 - 300, 250 + i * 46, k, 26);
      body(this, W / 2 + 300, 250 + i * 46, v, 26, '#c8553d').setOrigin(1, 0).setFontStyle('bold');
    });
    if (stats.embers === stats.total) body(this, W / 2, 448, 'Every ember found!', 22, '#c8553d').setOrigin(0.5);

    const found = stats.petals.map((id) => PETALS[id]).filter(Boolean);
    if (found.length) {
      this.add.text(W / 2, 520, found.map((p) => `"${p}"`).join('\n'), {
        fontFamily: FONT_BODY, fontSize: '17px', color: '#6a4a5a', align: 'center', wordWrap: { width: 700 }, fontStyle: 'italic', lineSpacing: 4,
      }).setOrigin(0.5);
    }
    this.prompt = body(this, W / 2, H - 40, 'Press jump to continue', 22, '#fff6e0', { stroke: '#2a1a24', strokeThickness: 4 }).setOrigin(0.5);
    this.tweens.add({ targets: this.prompt, alpha: 0.4, duration: 700, yoyo: true, repeat: -1 });
    this.add.image(0, 0, 'paper-screen').setOrigin(0).setBlendMode(Phaser.BlendModes.MULTIPLY);
    this.cameras.main.fadeIn(600, 255, 244, 220);
    this.ready = this.time.now + 800;
  }

  update(time) {
    this.controls.update();
    const c = this.controls;
    if (time > this.ready && (c.pressed('confirm') || c.pressed('jump') || this.input.activePointer.justDown)) {
      this.ready = Infinity;
      audio.play('confirm');
      this.cameras.main.fadeOut(500, 18, 13, 20);
      this.cameras.main.once('camerafadeoutcomplete', () => go(this, afterLevelStep(this.index)));
    }
  }
}
