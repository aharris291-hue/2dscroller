import Phaser from 'phaser';
import { VIEW_W as W, VIEW_H as H, FONT_BODY } from '../config.js';
import { CUTSCENES, SPEAKERS } from '../story/script.js';
import { shotTexture, portraitTexture } from '../art/cutscenes.js';
import { Controls } from '../game/input.js';
import { audio } from '../game/audio.js';
import { save } from '../game/save.js';
import { go } from '../game/flow.js';
import { title, body, panel } from '../ui/ui.js';

const BLIP = { wick: 620, grandpa: 330, pip: 900, mossback: 180, narrator: 480 };

export class CutsceneScene extends Phaser.Scene {
  constructor() {
    super('Cutscene');
  }

  create({ id, next = null, overlay = false }) {
    this.id = id;
    this.next = next;
    this.overlay = overlay;
    this.steps = CUTSCENES[id];
    this.stepIndex = -1;
    this.controls = new Controls(this);
    // Phaser reuses this scene object, so clear everything left from the last cutscene.
    this.skipHold = 0;
    this.skipStart = 0;
    this.finished = false;
    this.waiting = false;
    this.waitUntil = 0;
    this.typing = false;
    if (overlay) this.scene.sleep('Hud');
    audio.playMusic('cutscene');

    this.add.rectangle(0, 0, W, H, 0x120d14).setOrigin(0);
    this.shotA = this.add.image(W / 2, H / 2, '__DEFAULT').setAlpha(0);
    this.shotB = this.add.image(W / 2, H / 2, '__DEFAULT').setAlpha(0);
    this.current = this.shotA;

    // letterbox bars
    this.add.rectangle(0, 0, W, 54, 0x120d14).setOrigin(0).setDepth(5);
    this.add.rectangle(0, H - 54, W, 54, 0x120d14).setOrigin(0).setDepth(5);

    // dialogue box
    this.box = this.add.container(0, 0).setDepth(10).setAlpha(0);
    this.box.add(panel(this, 150, H - 214, W - 300, 150, { alpha: 0.96 }));
    this.portrait = this.add.image(212, H - 140, '__DEFAULT').setScale(0.8);
    this.nameText = title(this, 290, H - 210, '', 28, '#fff6e0').setOrigin(0, 0.5);
    this.lineText = this.add.text(290, H - 180, '', {
      fontFamily: FONT_BODY, fontSize: '25px', color: '#3a2630', wordWrap: { width: W - 500 }, lineSpacing: 6,
    });
    this.arrow = title(this, W - 180, H - 82, '>', 26, '#c8553d');
    this.tweens.add({ targets: this.arrow, x: W - 172, duration: 400, yoyo: true, repeat: -1 });
    this.box.add([this.portrait, this.nameText, this.lineText, this.arrow]);

    this.titleText = title(this, W / 2, H / 2 - 20, '', 96, '#ffe6b0').setDepth(12).setAlpha(0);
    this.subText = body(this, W / 2, H / 2 + 60, '', 24, '#f6dcc0').setOrigin(0.5).setDepth(12).setAlpha(0);
    this.skipText = body(this, W - 20, 16, 'Hold Esc / B to skip', 15, '#a89aa8').setOrigin(1, 0).setDepth(12);

    this.add.image(0, 0, 'paper-screen').setOrigin(0).setDepth(20).setBlendMode(Phaser.BlendModes.MULTIPLY);
    this.cameras.main.fadeIn(500, 18, 13, 20);
    this.advance();
  }

  advance() {
    this.stepIndex++;
    if (this.stepIndex >= this.steps.length) { this.finish(); return; }
    const s = this.steps[this.stepIndex];
    this.typing = false;
    if (s.shot) {
      this.showShot(s.shot);
      this.advance();
    } else if (s.say) {
      this.showLine(s.say, s.text);
    } else if (s.title) {
      this.tweens.add({ targets: this.box, alpha: 0, duration: 200 });
      this.titleText.setText(s.title);
      this.subText.setText(s.sub || '');
      this.tweens.add({ targets: [this.titleText, this.subText], alpha: 1, duration: 900 });
      audio.play('lantern');
      this.waitUntil = this.time.now + 1200;
    } else if (s.wait) {
      this.tweens.add({ targets: this.box, alpha: 0, duration: 200 });
      this.time.delayedCall(s.wait, () => this.advance());
      this.waiting = true;
    }
  }

  showShot(name) {
    const key = shotTexture(this, name);
    const next = this.current === this.shotA ? this.shotB : this.shotA;
    next.setTexture(key).setAlpha(0).setScale(1.06).setDepth(1);
    this.current.setDepth(0);
    this.tweens.add({ targets: next, alpha: 1, duration: 700 });
    // slow push-in, like a camera drifting over a painting
    this.tweens.add({ targets: next, scale: 1.0, duration: 9000, ease: 'Sine.out' });
    this.current = next;
  }

  showLine(who, text) {
    const sp = SPEAKERS[who];
    this.waiting = false;
    this.box.setAlpha(1);
    const narr = who === 'narrator';
    this.portrait.setVisible(!narr);
    if (!narr) this.portrait.setTexture(portraitTexture(this, who));
    this.nameText.setText(sp.name).setColor(sp.color === '#6a5a70' ? '#fff6e0' : '#fff6e0');
    this.nameText.setStroke(sp.color, 8);
    const x = narr ? 190 : 290;
    this.nameText.setX(x);
    this.lineText.setX(x).setY(narr ? H - 190 : H - 180);
    this.lineText.setWordWrapWidth(W - x - 210);
    this.lineText.setFontStyle(narr ? 'italic' : 'normal');
    this.fullText = text;
    this.shown = 0;
    this.typing = true;
    this.blip = BLIP[who];
    this.lineText.setText('');
    this.arrow.setVisible(false);
  }

  update(time, delta) {
    this.controls.update();
    const c = this.controls;
    if (c.down('back')) {
      const now = performance.now();
      this.skipStart ||= now;
      this.skipHold = now - this.skipStart;
      this.skipText.setText(`Skipping${'.'.repeat(1 + Math.floor(this.skipHold / 250))}`);
      if (this.skipHold > 700) { this.finish(); return; }
    } else if (this.skipStart) { this.skipStart = 0; this.skipHold = 0; this.skipText.setText('Hold Esc / B to skip'); }

    if (this.typing) {
      const speed = 45 * save.data.settings.textSpeed;
      const before = Math.floor(this.shown);
      this.shown += (delta / 1000) * speed;
      const n = Math.min(this.fullText.length, Math.floor(this.shown));
      if (n > before && n % 3 === 0) audio.play('blip', { freq: this.blip });
      this.lineText.setText(this.fullText.slice(0, n));
      if (n >= this.fullText.length) { this.typing = false; this.arrow.setVisible(true); }
    }
    const go1 = c.pressed('confirm') || c.pressed('jump') || this.input.activePointer.justDown;
    if (go1 && !this.waiting) {
      if (this.typing) {
        this.typing = false;
        this.lineText.setText(this.fullText);
        this.arrow.setVisible(true);
      } else if (!this.waitUntil || time > this.waitUntil) {
        this.waitUntil = 0;
        if (this.titleText.alpha > 0) this.tweens.add({ targets: [this.titleText, this.subText], alpha: 0, duration: 300 });
        this.advance();
      }
    }
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    save.data.seen[this.id] = true;
    save.write();
    this.cameras.main.fadeOut(500, 18, 13, 20);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      if (this.overlay) {
        this.events.emit('cutscene-done');
        this.scene.wake('Hud');
        this.scene.resume('Game');
        this.scene.stop();
      } else if (this.next) go(this, this.next);
      else this.scene.start('Title');
    });
  }
}
