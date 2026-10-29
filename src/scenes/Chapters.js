import Phaser from 'phaser';
import { VIEW_W as W, VIEW_H as H } from '../config.js';
import { LEVELS } from '../levels/levels.js';
import { Controls } from '../game/input.js';
import { save } from '../game/save.js';
import { levelStep, go } from '../game/flow.js';
import { Menu, title, body } from '../ui/ui.js';

const fmtTime = (t) => (Number.isFinite(t) ? `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}` : '--');

export class ChaptersScene extends Phaser.Scene {
  constructor() {
    super('Chapters');
  }

  create() {
    this.controls = new Controls(this);
    this.add.image(0, 0, 'sky-village').setOrigin(0).setAlpha(0.5);
    this.add.rectangle(0, 0, W, H, 0x120d14, 0.6).setOrigin(0);
    title(this, W / 2, 90, 'Chapters', 72);
    const items = LEVELS.map((l, i) => {
      const locked = i >= save.data.unlocked;
      const rec = save.data.levels[l.id];
      const label = `${l.id === 'P' ? 'Prologue' : l.id}  ${locked ? '???' : l.name}`;
      return { label, disabled: locked, action: () => go(this, levelStep(i)), rec };
    });
    items.push({ label: 'Back', action: () => this.scene.start('Title') });
    this.menu = new Menu(this, this.controls, W / 2, 200, items, { size: 34, gap: 64 });
    this.detail = body(this, W / 2, H - 70, '', 22, '#f6dcc0').setOrigin(0.5);
    this.add.image(0, 0, 'paper-screen').setOrigin(0).setBlendMode(Phaser.BlendModes.MULTIPLY);
  }

  update() {
    this.controls.update();
    if (this.controls.pressed('back')) { this.scene.start('Title'); return; }
    this.menu.update();
    const it = this.menu.items[this.menu.index];
    const r = it.rec;
    this.detail.setText(it.disabled ? 'Finish the level before to unlock this one.'
      : r ? `Embers ${r.embers} / ${r.total}     Memory petals ${r.petals.length} / ${r.petalTotal}     Best time ${fmtTime(r.bestTime)}`
        : it.rec === undefined && it.label !== 'Back' ? 'Not finished yet.' : '');
  }
}
