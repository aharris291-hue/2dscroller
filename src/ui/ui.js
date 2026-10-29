// Small shared UI pieces: styled text, menus, speech bubbles, paper panels.

import { FONT_TITLE, FONT_BODY } from '../config.js';
import { audio } from '../game/audio.js';

export const INK_CSS = '#3a2630';
export const PAPER_CSS = '#f6ecd6';

export function title(scene, x, y, str, size = 64, color = '#fff6e0') {
  return scene.add.text(x, y, str, {
    fontFamily: FONT_TITLE, fontSize: `${size}px`, color,
    stroke: '#2a1a24', strokeThickness: Math.max(3, size / 10),
    shadow: { offsetX: 0, offsetY: 3, color: '#000000', blur: 12, fill: true, stroke: true },
  }).setOrigin(0.5);
}

export function body(scene, x, y, str, size = 22, color = INK_CSS, opts = {}) {
  return scene.add.text(x, y, str, { fontFamily: FONT_BODY, fontSize: `${size}px`, color, lineSpacing: 4, ...opts });
}

/** A soft paper panel drawn with Graphics. */
export function panel(scene, x, y, w, h, { alpha = 0.95, radius = 18, fill = 0xf6ecd6, line = 0x3a2630 } = {}) {
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.25 * alpha);
  g.fillRoundedRect(x + 4, y + 6, w, h, radius);
  g.fillStyle(fill, alpha);
  g.fillRoundedRect(x, y, w, h, radius);
  g.lineStyle(3, line, 0.8 * alpha);
  g.strokeRoundedRect(x, y, w, h, radius);
  return g;
}

/**
 * Vertical menu driven by Controls, also clickable with a mouse.
 * items: [{ label, action, adjust?(dir), get?() }]
 */
export class Menu {
  constructor(scene, controls, x, y, items, { size = 34, gap = 54, color = '#fff6e0', active = '#ffd27a' } = {}) {
    this.scene = scene;
    this.controls = controls;
    this.items = items;
    this.index = 0;
    this.color = color;
    this.activeColor = active;
    this.texts = items.map((item, i) => {
      const t = title(scene, x, y + i * gap, '', size, color).setInteractive({ useHandCursor: true });
      t.on('pointerover', () => this.select(i));
      t.on('pointerdown', () => { this.select(i); this.activate(); });
      return t;
    });
    this.refresh();
  }

  label(i) {
    const it = this.items[i];
    return it.get ? `${it.label}:  ${it.get()}` : it.label;
  }

  refresh() {
    this.texts.forEach((t, i) => {
      const on = i === this.index;
      t.setText(on ? `~  ${this.label(i)}  ~` : this.label(i));
      t.setColor(this.items[i].disabled ? '#8a7a80' : on ? this.activeColor : this.color);
      t.setScale(on ? 1.06 : 1);
    });
  }

  select(i) {
    if (i === this.index) return;
    this.index = i;
    audio.play('select');
    this.refresh();
  }

  activate() {
    const it = this.items[this.index];
    if (it.disabled) return;
    if (it.adjust) { it.adjust(1); audio.play('select'); this.refresh(); return; }
    audio.play('confirm');
    it.action?.();
  }

  update() {
    const c = this.controls;
    const n = this.items.length;
    if (c.pressed('down')) this.select((this.index + 1) % n);
    if (c.pressed('up')) this.select((this.index + n - 1) % n);
    const it = this.items[this.index];
    if (it.adjust && (c.pressed('left') || c.pressed('right'))) {
      it.adjust(c.pressed('left') ? -1 : 1);
      audio.play('select');
      this.refresh();
    } else if (c.pressed('confirm')) this.activate();
  }

  destroy() { this.texts.forEach((t) => t.destroy()); }
}

/** A speech bubble that follows a game object and fades away. */
export class Bubble {
  constructor(scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0).setDepth(60).setVisible(false);
    this.bg = scene.add.graphics();
    this.text = body(scene, 0, 0, '', 17, INK_CSS, { wordWrap: { width: 300 }, align: 'center' }).setOrigin(0.5, 1);
    this.container.add([this.bg, this.text]);
    this.timer = 0;
    this.target = null;
  }

  show(target, str, seconds = 2.8, offsetY = -60) {
    this.target = target;
    this.offsetY = offsetY;
    this.text.setText(str);
    const w = this.text.width + 28, h = this.text.height + 18;
    this.bg.clear();
    this.bg.fillStyle(0xfff8ea, 0.95);
    this.bg.fillRoundedRect(-w / 2, -h - 4, w, h, 12);
    this.bg.fillTriangle(-8, -5, 8, -5, 0, 6);
    this.bg.lineStyle(2, 0x3a2630, 0.7);
    this.bg.strokeRoundedRect(-w / 2, -h - 4, w, h, 12);
    this.text.setPosition(0, -13);
    this.timer = seconds;
    this.container.setVisible(true).setAlpha(0);
    this.scene.tweens.add({ targets: this.container, alpha: 1, duration: 150 });
  }

  update(dt) {
    if (!this.container.visible) return;
    if (this.target) this.container.setPosition(this.target.x, this.target.y + this.offsetY);
    this.timer -= dt;
    if (this.timer < 0.3) this.container.setAlpha(Math.max(0, this.timer / 0.3));
    if (this.timer <= 0) this.container.setVisible(false);
  }

  get active() { return this.container.visible; }
}
