import Phaser from 'phaser';
import { createCharacterTextures } from '../art/characters.js';
import { createPropTextures } from '../art/world.js';
import { createThornwolfTextures } from '../art/thornwolf.js';
import { createCaveTextures } from '../art/caves.js';
import { addSheet } from '../art/paint.js';
import { TILE } from '../config.js';
import { save } from '../game/save.js';
import { setFullscreen } from '../game/platform.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    createCharacterTextures(this);
    createPropTextures(this);
    createThornwolfTextures(this);
    createCaveTextures(this);
    addSheet(this, 'collide', TILE, TILE, 2, () => {});
    if (save.data.settings.fullscreen) setFullscreen(this.game, true, true);
    this.scene.start('Title');
  }
}
