import Phaser from 'phaser';
import { VIEW_W as W, VIEW_H as H, FONT_BODY } from '../config.js';
import { NOTES, PETALS, CHAPTER_NAMES } from '../story/script.js';
import { save } from '../game/save.js';
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
    this.card.add([this.cardBg, this.cardTitle, this.cardText]);

    const game = this.scene.get('Game');
    game.events.on('note', this.onNote, this);
    game.events.on('petal', this.onPetal, this);
    game.events.on('tick', this.refresh, this);
    this.events.once('shutdown', () => {
      game.events.off('note', this.onNote, this);
      game.events.off('petal', this.onPetal, this);
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
    this.card.setAlpha(0).setY(20);
    this.tweens.add({ targets: this.card, alpha: 1, y: 0, duration: 300, hold: 5200, yoyo: true });
  }

  onNote(i) {
    this.showCard("Grandpa's note", `"${NOTES[i % NOTES.length]}"`, '#7a5a3c');
  }

  onPetal(id) {
    this.showCard('A memory petal', PETALS[id] || '', '#b8607a');
  }

  refresh() {
    const s = this.stats;
    this.emberText.setText(`${s.embers} / ${s.total}`);
    this.petalIcons.forEach((p, i) => p.setAlpha(i < s.petals.length ? 1 : 0.25));
    this.glowHint.setText(save.data.glow && this.level.pip !== false ? 'Glow: X / C / Y button' : '');
  }
}
