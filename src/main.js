import Phaser from 'phaser';
import '@fontsource/patrick-hand/400.css';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/400-italic.css';
import '@fontsource/nunito/700.css';
import { VIEW_W, VIEW_H, PHYS } from './config.js';
import { BootScene } from './scenes/Boot.js';
import { TitleScene } from './scenes/Title.js';
import { CutsceneScene } from './scenes/Cutscene.js';
import { GameScene } from './scenes/Game.js';
import { HudScene } from './scenes/Hud.js';
import { PauseScene } from './scenes/Pause.js';
import { OptionsScene } from './scenes/Options.js';
import { ChaptersScene } from './scenes/Chapters.js';
import { LevelEndScene } from './scenes/LevelEnd.js';

async function start() {
  // Make sure the fonts are ready before any text is drawn.
  await Promise.all([
    document.fonts.load('40px "Patrick Hand"'),
    document.fonts.load('20px "Nunito"'),
    document.fonts.load('italic 20px "Nunito"'),
    document.fonts.load('bold 20px "Nunito"'),
  ]).catch(() => {});

  window.game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: VIEW_W,
    height: VIEW_H,
    backgroundColor: '#120d14',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: 'arcade', arcade: { gravity: { y: PHYS.gravity }, debug: false, tileBias: 32 } },
    input: { gamepad: true },
    scene: [BootScene, TitleScene, CutsceneScene, GameScene, HudScene, PauseScene, OptionsScene, ChaptersScene, LevelEndScene],
  });
}

start();
