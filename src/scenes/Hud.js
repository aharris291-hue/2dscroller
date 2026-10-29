import Phaser from 'phaser';
import { VIEW_W as W, VIEW_H as H, FONT_BODY } from '../config.js';
import { NOTES, PETALS, CHAPTER_NAMES } from '../story/script.js';
import { save } from '../game/save.js';
import { Controls } from '../game/input.js';
import { title, body, panel } from '../ui/ui.js';

export class HudScene extends Phaser.Scene {
  constructor() {
    super('Hud');
  }

  create({ level, stats }) {
    this.stats = stats;
    this.level = level;
    // ember counter
    this.add.image(46, 44, 'soft').setScale(1.4).setTint(0xffb050).setAlpha(0.6).setBlendMode('ADD');
    this.add.sprite(46, 44, 'ember').play('ember-flicker').setScale(1.3);
    this.emberText = title(this, 76, 44, '', 34).setOrigin(0, 0.5);
    // petal slots
    this.petalIcons = [];
    for (let i = 0; i < stats.petalTotal; i++) {
      this.petalIcons.push(this.add.image(54 + i * 34, 92, 'petal', 0).setScale(0.75).setAlpha(0.25));
    }
    // boss levels: four shrine lanterns to light instead of petals to find
    this.shrineIcons = [];
    if (level.boss) {
      for (let i = 0; i < 4; i++) this.shrineIcons.push(this.add.image(W / 2 - 75 + i * 50, 46, 'shrine', 0).setScale(0.42).setAlpha(0.5));
    }
    this.glowHint = body(this, W - 24, 24, '', 17, '#fff6e0', { stroke: '#2a1a24', strokeThickness: 4 }).setOrigin(1, 0);

    // level banner
    const banner = this.add.container(W / 2, 120).setAlpha(0);
    banner.add(title(this, 0, 0, level.name, 58));
    banner.add(body(this, 0, 48, CHAPTER_NAMES[level.chapter] || '', 22, '#f6dcc0', { stroke: '#2a1a24', strokeThickness: 4 }).setOrigin(0.5));
    this.tweens.add({ targets: banner, alpha: 1, y: 130, duration: 800, delay: 300, hold: 2200, yoyo: true });

    // notes and memories pop up as paper cards at the bottom
    this.card = this.add.container(0, 0).setAlpha(0);
    this.cardBg = this.add.graphics();
    this.cardTitle = title(this, W / 2, H - 168, '', 26, '#fff6e0');
    this.cardText = this.add.text(W / 2, H - 112, '', {
      fontFamily: FONT_BODY, fontSize: '22px', color: '#3a2630', align: 'center', wordWrap: { width: 760 }, fontStyle: 'italic',
    }).setOrigin(0.5);
    this.cardHint = body(this, W / 2 + 410, H - 60, 'Enter / Down / B to close', 15, '#8a7a80').setOrigin(1, 1);
    this.card.add([this.cardBg, this.cardTitle, this.cardText, this.cardHint]);
    this.cardOpen = false;
    this.controls = new Controls(this);

    const game = this.scene.get('Game');
    game.events.on('note', this.onNote, this);
    game.events.on('petal', this.onPetal, this);
    game.events.on('shrine', this.onShrine, this);
    game.events.on('progress', this.onProgress, this);
    game.events.on('tick', this.refresh, this);
    this.events.once('shutdown', () => {
      game.events.off('note', this.onNote, this);
      game.events.off('petal', this.onPetal, this);
      game.events.off('shrine', this.onShrine, this);
      game.events.off('progress', this.onProgress, this);
      game.events.off('tick', this.refresh, this);
    });
    this.refresh();
  }

  showCard(heading, text, color) {
    this.cardBg.clear();
    const g = this.cardBg;
    g.fillStyle(0x000000, 0.2); g.fillRoundedRect(W / 2 - 430 + 4, H - 190 + 6, 860, 140, 18);
    g.fillStyle(0xf6ecd6, 0.96); g.fillRoundedRect(W / 2 - 430, H - 190, 860, 140, 18);
    g.lineStyle(3, 0x3a2630, 0.8); g.strokeRoundedRect(W / 2 - 430, H - 190, 860, 140, 18);
    this.cardTitle.setText(heading).setStroke(color, 8);
    this.cardText.setText(text);
    this.tweens.killTweensOf(this.card);
    this.cardTimer?.remove();
    this.card.setAlpha(0).setY(20);
    this.cardOpen = true;
    // Long enough to read (about 30 ms per letter), then it fades by itself.
    const hold = Math.min(4500, 2000 + text.length * 30);
    this.tweens.add({ targets: this.card, alpha: 1, y: 0, duration: 250 });
    this.cardTimer = this.time.delayedCall(250 + hold, () => this.hideCard());
  }

  hideCard() {
    if (!this.cardOpen) return;
    this.cardOpen = false;
    this.cardTimer?.remove();
    this.tweens.killTweensOf(this.card);
    this.tweens.add({ targets: this.card, alpha: 0, y: 20, duration: 200 });
  }

  onNote(i) {
    if (i === undefined || i === null) return;
    this.showCard("Grandpa's note", `"${NOTES[i % NOTES.length]}"`, '#7a5a3c');
  }

  /** Boss-phase banner: a label and, optionally, a progress bar (0..1). */
  onProgress(label, value) {
    if (!this.progLabel) {
      this.progLabel = title(this, W / 2, 100, '', 26, '#fff6e0');
      this.progBar = this.add.graphics();
    }
    this.progLabel.setText(label);
    this.progBar.clear();
    if (value === null || value === undefined) return;
    this.progBar.fillStyle(0x1a1020, 0.6); this.progBar.fillRoundedRect(W / 2 - 160, 120, 320, 12, 6);
    this.progBar.fillStyle(0xffc070, 1); this.progBar.fillRoundedRect(W / 2 - 160, 120, 320 * value, 12, 6);
  }

  onShrine(count) {
    this.shrineIcons.forEach((icon, i) => {
      if (i < count && icon.frame.name !== 1) {
        icon.setFrame(1).setAlpha(1);
        this.tweens.add({ targets: icon, scale: 0.6, duration: 160, yoyo: true });
      }
    });
  }

  onPetal(id) {
    this.showCard('A memory petal', PETALS[id] || '', '#b8607a');
  }

  update() {
    this.controls.update();
    if (this.cardOpen && this.controls.pressed('dismiss')) this.hideCard();
  }

  refresh() {
    const s = this.stats;
    this.emberText.setText(`${s.embers} / ${s.total}`);
    this.petalIcons.forEach((p, i) => p.setAlpha(i < s.petals.length ? 1 : 0.25));
    this.glowHint.setText((save.data.glow || this.level.boss) && this.level.pip !== false ? 'Glow: X / C / Y button' : '');
  }
}
