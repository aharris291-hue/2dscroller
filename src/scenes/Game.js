import Phaser from 'phaser';
import { TILE, PHYS, VIEW_W, VIEW_H } from '../config.js';
import { LEVELS } from '../levels/levels.js';
import { THEMES, ensureBackground, paintTerrain } from '../art/world.js';
import { Controls } from '../game/input.js';
import { audio } from '../game/audio.js';
import { save } from '../game/save.js';
import { Bubble } from '../ui/ui.js';
import { PIP_BARKS, WICK_BARKS, CUTSCENES, SPEAKERS } from '../story/script.js';
import { Thornwolf } from '../game/thornwolf.js';
import { CaveSystems } from '../game/cave.js';
import { CliffSystems } from '../game/cliffs.js';
import { HeartSystems } from '../game/heart.js';
import { MorrowBoss } from '../game/morrow.js';
import { afterLevelStep, go } from '../game/flow.js';

const approach = (v, target, step) => (v < target ? Math.min(v + step, target) : Math.max(v - step, target));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create({ index = 0 }) {
    this.index = index;
    this.level = LEVELS[index];
    const L = this.level;
    this.theme = THEMES[L.theme];
    this.rows = L.grid.length;
    this.cols = L.grid[0].length;
    this.worldW = this.cols * TILE;
    this.worldH = this.rows * TILE;
    this.hasPip = L.pip !== false;
    this.controls = new Controls(this);
    this.stats = { embers: 0, total: 0, petals: [], petalTotal: 0, time: 0, deaths: 0 };
    this.fired = new Set();
    this.frozen = false;
    this.dead = false;
    this.completed = false;
    this.combo = 0;
    this.comboTimer = 0;
    this.glowCooldown = 0;
    this.castTimer = 0;
    this.dashTime = 0;
    this.dashReady = true;
    this.dashCooldown = 0;
    this.facing = 1;
    this.wasGround = true;
    this.airTime = 0;
    this.coyote = 0;
    this.jumpBuffer = 0;
    this.jumpHeld = false;

    this.buildBackground();
    this.buildTerrain();
    this.buildEntities();
    this.buildPlayer();
    this.buildAtmosphere();
    if (L.boss) this.buildBoss();
    this.cave = new CaveSystems(this);
    this.cliffs = new CliffSystems(this);
    this.heart = new HeartSystems(this);
    this.gliding = false;
    this.feather = this.add.image(0, 0, 'feather').setScale(0.7).setDepth(21).setVisible(false);
    if (L.dark) this.near.setDepth(43);
    if (L.mode === 'cart') {
      // ride higher so Wick shows above the rim of the cart
      this.player.body.setOffset(43, 80);
      this.player.y -= 21;
    }

    this.bubble = new Bubble(this);
    this.pipBubble = new Bubble(this);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.worldW, this.worldH);
    cam.startFollow(this.player, true, 0.09, 0.1);
    cam.setDeadzone(80, 90);
    cam.fadeIn(500, 18, 13, 20);

    this.scene.launch('Hud', { level: L, stats: this.stats });
    this.events.once('shutdown', () => {
      this.scene.stop('Hud');
      this.game.events.off('blur', this.onBlur, this);
    });
    this.game.events.on('blur', this.onBlur, this);
    audio.playMusic(L.music);
  }

  onBlur() {
    if (this.scene.isActive() && !this.completed) this.openPause();
  }

  // ------------------------------------------------------------ building

  buildBackground() {
    const t = this.level.theme;
    const hush = this.level.hush;
    ensureBackground(this, t);
    this.sky = this.add.image(0, 0, `sky-${t}`).setOrigin(0).setScrollFactor(0).setDepth(-10);
    this.far = this.add.tileSprite(0, 0, VIEW_W, VIEW_H, `far-${t}`).setOrigin(0).setScrollFactor(0).setDepth(-9);
    this.fogFar = this.add.tileSprite(0, 0, VIEW_W, VIEW_H, `fog-${t}`).setOrigin(0).setScrollFactor(0).setDepth(-8).setAlpha(0.4 + hush);
    this.mid = this.add.tileSprite(0, 0, VIEW_W, VIEW_H, `mid-${t}`).setOrigin(0).setScrollFactor(0).setDepth(-7);
    this.fogNear = this.add.tileSprite(0, 0, VIEW_W, VIEW_H, `fog-${t}`).setOrigin(0).setScrollFactor(0).setDepth(45).setAlpha(hush * 0.55);
    this.near = this.add.tileSprite(0, 40, VIEW_W, VIEW_H, `near-${t}`).setOrigin(0).setScrollFactor(0).setDepth(50).setAlpha(0.75);
    // keep dreamy background islands from being mistaken for platforms
    if (t === 'dream') { this.mid.setAlpha(0.45); this.near.setAlpha(0.3); }
  }

  buildTerrain() {
    const L = this.level;
    if (!L._painted) L._painted = paintTerrain(this, L, this.theme);
    for (const { key, x } of L._painted.back) this.add.image(x, 0, key).setOrigin(0).setDepth(10);

    // An invisible tilemap does the collision work.
    const data = L.grid.map((row) => [...row].map((ch) => (ch === '#' || ch === 'B' ? 0 : ch === '=' || ch === 'r' || ch === 'c' ? 1 : -1)));
    const map = this.make.tilemap({ data, tileWidth: TILE, tileHeight: TILE });
    const tiles = map.addTilesetImage('collide', 'collide', TILE, TILE, 0, 0);
    this.layer = map.createLayer(0, tiles, 0, 0).setVisible(false);
    this.layer.setCollision([0]);
    this.layer.forEachTile((t) => { if (t.index === 1) t.setCollision(false, false, true, false); });
    this.physics.world.setBounds(0, -400, this.worldW, this.worldH + 800);
    this.physics.world.checkCollision.down = false;

    // Thorns are simple hurt-boxes.
    this.hazards = [];
    L.grid.forEach((row, r) => [...row].forEach((ch, c) => {
      if (ch === '^') this.hazards.push(new Phaser.Geom.Rectangle(c * TILE + 8, r * TILE + 20, TILE - 16, TILE - 20));
    }));

    // Spirit platforms: one sprite per run of '~' tiles.
    this.spirits = [];
    this.spiritGroup = this.physics.add.staticGroup();
    L.grid.forEach((row, r) => {
      let c = 0;
      while (c < row.length) {
        if (row[c] !== '~') { c++; continue; }
        const start = c;
        while (row[c] === '~') c++;
        const w = (c - start) * TILE;
        const ts = this.add.tileSprite(start * TILE, r * TILE, w, 20, 'spiritplank').setOrigin(0).setDepth(12);
        this.spiritGroup.add(ts);
        ts.body.checkCollision.down = false;
        ts.body.checkCollision.left = false;
        ts.body.checkCollision.right = false;
        ts.body.enable = false;
        this.spirits.push({ sprite: ts, timer: 0 });
      }
    });
  }

  /** Bottom-centre world position for an entity standing at tile (x, y). */
  feet(e) {
    return { x: e.x * TILE + TILE / 2, y: (this.rows - e.y) * TILE };
  }

  buildEntities() {
    const L = this.level;
    this.embers = [];
    this.petals = [];
    this.lanterns = [];
    this.shrines = [];
    this.dynHazards = [];
    this.boss = null;
    this.signs = [];
    this.sleepers = [];
    this.springs = [];
    this.triggers = [];
    this.enemies = this.physics.add.group();

    for (const e of L.entities) {
      const p = this.feet(e);
      switch (e.type) {
        case 'start': this.startPos = p; break;
        case 'ember': {
          const s = this.add.sprite(p.x, p.y - TILE / 2, 'ember').play({ key: 'ember-flicker', startFrame: Math.floor(Math.random() * 6) }).setDepth(15);
          this.tweens.add({ targets: s, y: s.y - 6, duration: 900 + Math.random() * 300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
          this.embers.push(s);
          this.stats.total++;
          break;
        }
        case 'petal': {
          const already = save.data.petals.includes(e.id);
          const s = this.add.sprite(p.x, p.y - TILE / 2, 'petal').play('petal-shine').setDepth(15).setAlpha(already ? 0.45 : 1);
          this.tweens.add({ targets: s, y: s.y - 8, angle: 12, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
          s.petalId = e.id;
          this.petals.push(s);
          this.stats.petalTotal++;
          break;
        }
        case 'lantern': {
          const s = this.add.sprite(p.x, p.y + 2, 'lantern', 0).setOrigin(0.5, 1).setScale(0.6).setDepth(11);
          s.note = e.note;
          this.lanterns.push(s);
          break;
        }
        case 'sign': {
          const s = this.add.image(p.x, p.y + 4, 'sign').setOrigin(0.5, 1).setScale(0.8).setDepth(11);
          s.text = e.text;
          this.signs.push(s);
          break;
        }
        case 'sleeper': {
          const s = this.add.image(p.x, p.y + 4, 'sleeper', e.look % 3).setOrigin(0.5, 1).setDepth(11);
          s.line = e.line;
          const z = this.add.text(p.x + 14, p.y - 50, 'z', { fontFamily: 'Patrick Hand', fontSize: '22px', color: '#e8e0f0' }).setDepth(11);
          this.tweens.add({ targets: z, y: z.y - 26, x: z.x + 10, alpha: 0, duration: 2200, repeat: -1 });
          this.sleepers.push(s);
          break;
        }
        case 'spring': {
          const s = this.add.sprite(p.x, p.y + 4, 'mushroom', 0).setOrigin(0.5, 1).setScale(0.75).setDepth(13);
          this.springs.push(s);
          break;
        }
        case 'exit': {
          const glow = this.add.image(p.x, p.y - 80, 'soft').setScale(5).setAlpha(0.35).setBlendMode(Phaser.BlendModes.ADD).setTint(0xffe0a0).setDepth(9);
          this.tweens.add({ targets: glow, alpha: 0.55, scale: 5.5, duration: 1600, yoyo: true, repeat: -1 });
          this.exit = this.add.image(p.x, p.y + 4, 'gate').setOrigin(0.5, 1).setScale(0.8).setDepth(9);
          break;
        }
        case 'trigger': this.triggers.push({ x: e.x * TILE, event: e.event, who: e.who, text: e.text }); break;
        case 'boss': this.bossPos = p; break;
        case 'shrine': {
          const s = this.add.sprite(p.x, p.y + 2, e.skin || 'shrine', 0).setOrigin(0.5, 1).setScale(0.75).setDepth(11);
          this.shrines.push(s);
          break;
        }
        case 'gloomling': {
          const s = this.enemies.create(p.x, p.y, 'gloomling').setOrigin(0.5, 92 / 96).setScale(0.5).setDepth(14);
          s.body.setSize(52, 50).setOffset(22, 42);
          s.play({ key: 'gloomling-walk', startFrame: Math.floor(Math.random() * 4) });
          s.kind = 'gloomling';
          s.dir = -1;
          break;
        }
        case 'bat': {
          const s = this.enemies.create(p.x, p.y - TILE / 2, 'gloombat').setScale(0.7).setDepth(14);
          s.body.setAllowGravity(false).setSize(44, 36).setOffset(28, 16);
          s.play({ key: 'gloombat-fly', startFrame: Math.floor(Math.random() * 2) });
          s.kind = 'bat';
          s.home = { x: p.x, y: p.y - TILE / 2 };
          s.range = (e.range ?? 3) * TILE;
          s.vrange = (e.vrange ?? 0.6) * TILE;
          s.phase = Math.random() * Math.PI * 2;
          s.t = 0;
          break;
        }
        case 'hopper': {
          const s = this.enemies.create(p.x, p.y, 'hopper', 0).setOrigin(0.5, 92 / 96).setScale(0.5).setDepth(14);
          s.body.setSize(60, 44).setOffset(18, 48);
          s.kind = 'hopper';
          s.hopTimer = 1 + Math.random();
          break;
        }
        default:
      }
    }
    this.physics.add.collider(this.enemies, this.layer, null, (en) => en.kind !== 'bat');
    this.checkpoint = { ...this.startPos };
  }

  buildPlayer() {
    const { x, y } = this.startPos;
    this.player = this.physics.add.sprite(x, y, 'wick', 0).setOrigin(0.5, 124 / 128).setScale(0.58).setDepth(20);
    // body size is in un-scaled frame pixels: 42x80 becomes about 24x46 in the world
    this.player.body.setSize(42, 80).setOffset(43, 44);
    // Only falling speed is limited (in updatePlayer); mushrooms need to launch faster than that.
    this.player.body.setMaxVelocity(2000, 3000);
    this.player.play('wick-idle');
    this.physics.add.collider(this.player, this.layer);
    this.physics.add.collider(this.player, this.spiritGroup);
    this.physics.add.overlap(this.player, this.enemies, (pl, en) => this.onEnemy(en));

    this.lanternGlow = this.add.image(x, y, 'soft').setBlendMode(Phaser.BlendModes.ADD).setTint(0xffc070).setScale(3.2).setAlpha(0.22 + this.level.hush * 0.25).setDepth(19);

    if (this.hasPip) {
      this.pip = this.add.sprite(x - 30, y - 80, 'pip').play('pip-float').setScale(0.55).setDepth(22);
      this.pipGlow = this.add.image(x, y, 'soft').setBlendMode(Phaser.BlendModes.ADD).setTint(0xff9a40).setScale(1.8).setAlpha(0.45).setDepth(21);
    }
  }

  buildAtmosphere() {
    const th = this.theme;
    // drifting motes of light
    this.add.particles(0, 0, 'dot', {
      x: { min: 0, max: this.worldW }, y: { min: 0, max: this.worldH },
      lifespan: 6000, speedX: { min: -12, max: 12 }, speedY: { min: -18, max: -4 },
      scale: { start: 0.9, end: 0 }, alpha: { start: 0.9, end: 0 },
      tint: th.particle, frequency: 90, blendMode: 'ADD',
    }).setDepth(25);
    if (this.level.theme === 'woods') {
      this.add.particles(0, 0, 'leaf', {
        x: { min: 0, max: this.worldW }, y: -10,
        lifespan: 12000, speedY: { min: 25, max: 50 }, speedX: { min: -30, max: 10 },
        rotate: { min: 0, max: 360 }, scale: { min: 0.6, max: 1.1 },
        tint: [0x9ccf6a, 0xd8c060, 0x6fa64c], frequency: 160, alpha: 0.85,
      }).setDepth(26);
    }
    // Camera colour grading: the Hush drains colour from the world.
    const cam = this.cameras.main;
    if (cam.postFX) {
      const cm = cam.postFX.addColorMatrix();
      cm.saturate(-this.level.hush * 0.55);
    }
    this.paper = this.add.image(0, 0, 'paper-screen').setOrigin(0).setScrollFactor(0).setDepth(100).setBlendMode(Phaser.BlendModes.MULTIPLY);

    this.dust = this.add.particles(0, 0, 'dot', {
      speed: { min: 20, max: 90 }, angle: { min: 200, max: 340 }, lifespan: 450,
      scale: { start: 1.6, end: 0 }, alpha: { start: 0.6, end: 0 }, tint: 0xe8dcc4, emitting: false,
    }).setDepth(21);
    this.sparkle = this.add.particles(0, 0, 'dot', {
      speed: { min: 60, max: 200 }, lifespan: 600, scale: { start: 1.4, end: 0 },
      tint: [0xffd27a, 0xffffff, 0xff9a40], blendMode: 'ADD', emitting: false,
    }).setDepth(23);
    this.soot = this.add.particles(0, 0, 'soot', {
      speed: { min: 60, max: 220 }, lifespan: 700, scale: { start: 1.2, end: 0 }, alpha: { start: 0.9, end: 0 },
      gravityY: -100, emitting: false,
    }).setDepth(23);
  }

  // ------------------------------------------------------------ update

  update(time, delta) {
    const dt = Math.min(delta / 1000, 0.1);
    this.controls.update();
    this.updateParallax();
    this.bubble.update(dt);
    this.pipBubble.update(dt);

    if (this.controls.pressed('pause') && !this.completed) { this.openPause(); return; }
    if (!this.frozen && !this.dead) {
      this.stats.time += dt;
      this.updatePlayer(dt);
      this.updateGlow(dt);
      this.checkPickups(dt);
      this.checkHazards();
      this.checkTriggers();
    }
    this.updateEnemies(dt);
    if (this.boss && !this.frozen && !this.completed) this.boss.update(dt, this.player);
    this.cave.update(dt);
    this.cliffs.update(dt);
    this.heart.update(dt);
    if (this.morrow) this.morrow.update(dt);
    this.updateCompanions(time / 1000);
    this.events.emit('tick');
  }

  updateParallax() {
    const cam = this.cameras.main;
    const sx = cam.scrollX, sy = cam.scrollY;
    const vy = (sy - (this.worldH - VIEW_H));
    this.far.tilePositionX = sx * 0.12;
    this.far.y = -vy * 0.05;
    this.fogFar.tilePositionX = sx * 0.2 + this.time.now * 0.008;
    this.mid.tilePositionX = sx * 0.35;
    this.mid.y = -vy * 0.15;
    this.fogNear.tilePositionX = sx * 0.6 + this.time.now * 0.02;
    this.near.tilePositionX = sx * 1.3;
    this.near.y = 120 - vy * 1.1;
  }

  updatePlayer(dt) {
    const c = this.controls;
    const pl = this.player;
    const b = pl.body;
    const onGround = b.blocked.down || b.touching.down;

    if (onGround) {
      if (!this.wasGround && this.airTime > 0.2) {
        this.dust.explode(8, pl.x, pl.y);
        audio.play('land');
      }
      this.coyote = PHYS.coyoteTime;
      this.airTime = 0;
    } else {
      this.coyote -= dt;
      this.airTime += dt;
    }
    this.wasGround = onGround;
    this.jumpBuffer = c.pressed('jump') ? PHYS.jumpBuffer : this.jumpBuffer - dt;

    // Ember Dash: a short burst through the air, once per jump.
    const cart = this.level.mode === 'cart';
    const canDash = (save.data.dash || this.level.dash) && this.hasPip && !cart;
    this.dashCooldown -= dt;
    if (onGround) this.dashReady = true;
    if (this.dashTime > 0) {
      this.dashTime -= dt;
      b.setVelocity(this.facing * PHYS.dashSpeed, 0);
      this.sparkle.explode(2, pl.x - this.facing * 12, pl.y - 26);
      if (this.dashTime <= 0) {
        b.setAllowGravity(true);
        b.setVelocityX(this.facing * PHYS.runSpeed);
      }
      if (pl.anims.currentAnim?.key !== 'wick-jump') pl.play('wick-jump');
      return;
    }
    if (canDash && c.pressed('dash') && this.dashReady && this.dashCooldown <= 0) {
      this.dashTime = PHYS.dashTime;
      this.dashReady = false;
      this.dashCooldown = 0.3;
      b.setAllowGravity(false);
      b.setVelocity(this.facing * PHYS.dashSpeed, 0);
      this.jumpHeld = false;
      audio.play('dash');
      if (this.pip) this.tweens.add({ targets: this.pip, scale: 0.9, duration: 90, yoyo: true });
      return;
    }

    // In the mine cart Wick always rolls forward; she can only jump.
    const dir = cart ? 1 : (c.down('right') ? 1 : 0) - (c.down('left') ? 1 : 0);
    const accel = dir !== 0
      ? (onGround ? PHYS.groundAccel : PHYS.airAccel)
      : (onGround ? PHYS.groundDecel : PHYS.airDecel);
    const vx = approach(b.velocity.x, dir * (cart ? this.level.cartSpeed || 320 : PHYS.runSpeed), accel * dt);
    b.setVelocityX(vx);
    if (dir) {
      this.facing = dir;
      pl.setFlipX(dir < 0);
    }

    if (this.jumpBuffer > 0 && this.coyote > 0) {
      b.setVelocityY(-PHYS.jumpSpeed);
      this.jumpBuffer = 0;
      this.coyote = 0;
      this.jumpHeld = true;
      this.dust.explode(6, pl.x, pl.y);
      audio.play('jump');
    }
    if (this.jumpHeld && !c.down('jump')) {
      if (b.velocity.y < 0) b.setVelocityY(b.velocity.y * PHYS.jumpCut);
      this.jumpHeld = false;
    }
    if (b.velocity.y >= 0) this.jumpHeld = false;
    b.setGravityY(b.velocity.y > 0 ? PHYS.fallGravityBonus : 0);
    if (b.velocity.y > PHYS.maxFall) b.setVelocityY(PHYS.maxFall);

    // Feather Glide: hold jump while falling to drift down slowly. Wind updrafts lift a glider.
    const canGlide = (save.data.glide || this.level.glide) && this.hasPip && !cart;
    const wind = this.cliffs.windAt(pl.x, pl.y - 20);
    this.gliding = canGlide && !onGround && c.down('jump') && (b.velocity.y > 0 || (wind && !this.jumpHeld));
    // Gravity itself is changed (not just the speed) so gliding feels the same at any frame rate.
    if (this.gliding) {
      if (wind) {
        b.setGravityY(-PHYS.gravity - 1400);
        if (b.velocity.y < -PHYS.windLift) b.setVelocityY(-PHYS.windLift);
      } else {
        b.setGravityY(-PHYS.gravity + 250);
        if (b.velocity.y > PHYS.glideFall) b.setVelocityY(PHYS.glideFall);
      }
    } else if (wind && !onGround) {
      b.setGravityY(-900);
    }
    this.feather.setVisible(this.gliding);
    if (this.gliding) this.feather.setPosition(pl.x + this.facing * 6, pl.y - 74).setRotation(Math.sin(this.time.now / 160) * 0.25);

    // animation
    let anim;
    if (this.castTimer > 0) { this.castTimer -= dt; anim = 'wick-cast'; }
    else if (this.gliding) anim = 'wick-cast';
    else if (!onGround) anim = b.velocity.y < 0 ? 'wick-jump' : 'wick-fall';
    else if (Math.abs(vx) > 30 && !cart) anim = 'wick-run';
    else anim = 'wick-idle';
    if (pl.anims.currentAnim?.key !== anim) pl.play(anim);

    if (pl.y > this.worldH + 80) this.hurt(true);
  }

  updateGlow(dt) {
    this.glowCooldown -= dt;
    const learned = (save.data.glow || !!this.level.boss || this.level.chapter > 1) && this.hasPip;
    if (learned && this.controls.pressed('glow') && this.glowCooldown <= 0) {
      this.glowCooldown = 1.2;
      this.castTimer = 0.35;
      audio.play('glow');
      const ring = this.add.image(this.pip.x, this.pip.y, 'soft').setBlendMode(Phaser.BlendModes.ADD).setTint(0x9affc8).setScale(0.5).setDepth(24);
      this.tweens.add({ targets: ring, scale: 14, alpha: 0, duration: 700, onComplete: () => ring.destroy() });
      this.cameras.main.flash(120, 200, 255, 220, false);
      for (const s of this.spirits) {
        const sp = s.sprite;
        const cx = Phaser.Math.Clamp(this.player.x, sp.x, sp.x + sp.width);
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, cx, sp.y) < 460) s.timer = 6;
      }
      for (const sh of this.shrines) {
        if (!sh.lit && Phaser.Math.Distance.Between(this.player.x, this.player.y, sh.x, sh.y - 30) < 140) this.lightShrine(sh);
      }
      this.cave.onGlow(this.player.x, this.player.y);
      if (save.data.song || this.level.song) this.hearthsong();
      this.cave.boost = 2.5;
      if (Math.random() < 0.5) this.pipSay('glow');
    }
    for (const s of this.spirits) {
      s.timer -= dt;
      const on = s.timer > 0;
      s.sprite.body.enable = on;
      let alpha = learned ? 0.16 : 0.05;
      if (on) alpha = s.timer < 1.2 ? (Math.floor(s.timer * 8) % 2 ? 0.35 : 0.95) : 0.95;
      s.sprite.setAlpha(alpha);
    }
  }

  updateCompanions(t) {
    const pl = this.player;
    this.lanternGlow.setPosition(pl.x + this.facing * 8, pl.y - 26);
    if (!this.pip) return;
    const tx = pl.x - this.facing * 26, ty = pl.y - 78 + Math.sin(t * 3) * 6;
    this.pip.x += (tx - this.pip.x) * 0.1;
    this.pip.y += (ty - this.pip.y) * 0.1;
    this.pip.setVisible(pl.visible);
    this.pipGlow.setPosition(this.pip.x, this.pip.y).setVisible(pl.visible);
    this.pipGlow.setScale(1.7 + Math.sin(t * 9) * 0.1);
  }

  updateEnemies(dt) {
    for (const e of this.enemies.getChildren()) {
      if (e.freed || !e.body) continue;
      const b = e.body;
      if (e.kind === 'bat') {
        if (!this.frozen) e.t += dt;
        const nx = e.home.x + Math.sin(e.t * 0.9 + e.phase) * e.range;
        const ny = e.home.y + Math.sin(e.t * 1.8 + e.phase) * e.vrange;
        e.setFlipX(nx < e.x);
        e.setPosition(nx, ny);
        b.setVelocity(0, 0);
        continue;
      }
      if (e.kind === 'gloomling') {
        if (this.frozen) { b.setVelocityX(0); continue; }
        if (b.blocked.left) e.dir = 1;
        else if (b.blocked.right) e.dir = -1;
        else if (b.blocked.down && !this.solidAt(e.x + e.dir * 20, e.y + 6)) e.dir *= -1;
        b.setVelocityX(e.dir * 55);
        e.setFlipX(e.dir < 0);
      } else if (e.kind === 'hopper') {
        const ground = b.blocked.down;
        if (ground) {
          b.setVelocityX(0);
          if (this.frozen) { e.setFrame(0); continue; }
          e.hopTimer -= dt;
          e.setFrame(e.hopTimer < 0.3 ? 1 : 0);
          if (e.hopTimer <= 0) {
            const dx = this.player.x - e.x;
            let dir = Math.abs(dx) < 420 ? Math.sign(dx) : (Math.random() < 0.5 ? -1 : 1);
            if (!this.solidAt(e.x + dir * 70, e.y + 6)) dir = -dir;
            b.setVelocity(dir * 110, -640);
            e.setFlipX(dir < 0);
            e.hopTimer = 1.4 + Math.random() * 0.8;
            if (Math.abs(dx) < 500) audio.play('hop');
          }
        } else e.setFrame(2);
      }
      if (e.y > this.worldH + 100) e.destroy();
    }
  }

  solidAt(x, y) {
    const c = Math.floor(x / TILE), r = Math.floor(y / TILE);
    if (c < 0 || c >= this.cols || r < 0 || r >= this.rows) return false;
    return '#B=rc'.includes(this.level.grid[r][c]);
  }

  // ------------------------------------------------------------ interactions

  checkPickups(dt) {
    const pl = this.player;
    const px = pl.x, py = pl.y - 22;
    this.comboTimer -= dt;
    if (this.comboTimer <= 0) this.combo = 0;

    for (let i = this.embers.length - 1; i >= 0; i--) {
      const s = this.embers[i];
      if (Math.abs(s.x - px) < 30 && Math.abs(s.y - py) < 38) {
        this.embers.splice(i, 1);
        this.stats.embers++;
        this.heart.onEmber();
        audio.play('ember', { combo: this.combo });
        this.combo++;
        this.comboTimer = 0.7;
        this.sparkle.explode(10, s.x, s.y);
        this.tweens.killTweensOf(s);
        this.tweens.add({ targets: s, scale: 1.8, alpha: 0, y: s.y - 20, duration: 250, onComplete: () => s.destroy() });
        if (this.stats.embers === 1 || this.stats.embers % 12 === 0) this.pipSay('ember');
      }
    }
    for (let i = this.petals.length - 1; i >= 0; i--) {
      const s = this.petals[i];
      if (Math.abs(s.x - px) < 32 && Math.abs(s.y - py) < 40) {
        this.petals.splice(i, 1);
        this.stats.petals.push(s.petalId);
        audio.play('petal');
        this.sparkle.explode(20, s.x, s.y);
        this.tweens.killTweensOf(s);
        this.tweens.add({ targets: s, scale: 2.5, alpha: 0, duration: 500, onComplete: () => s.destroy() });
        this.events.emit('petal', s.petalId);
      }
    }
    for (const s of this.lanterns) {
      if (s.lit || Math.abs(s.x - px) > 36 || Math.abs(s.y - 30 - py) > 70) continue;
      s.lit = true;
      s.setFrame(1);
      const g = this.add.image(s.x + 6, s.y - 52, 'soft').setBlendMode(Phaser.BlendModes.ADD).setTint(0xffc060).setScale(3.4).setAlpha(0.5).setDepth(11);
      this.tweens.add({ targets: g, alpha: 0.7, duration: 1200, yoyo: true, repeat: -1 });
      this.checkpoint = { x: s.x, y: s.y };
      this.sparkle.explode(24, s.x + 6, s.y - 52);
      audio.play('lantern');
      this.events.emit('note', s.note);
    }
    for (const s of this.signs) {
      const near = Math.abs(s.x - px) < 70 && Math.abs(s.y - py) < 90;
      if (near && !s.shown) { this.bubble.show(s, s.text, 6, -84); }
      if (!near && s.shown && this.bubble.target === s) this.bubble.timer = Math.min(this.bubble.timer, 0.3);
      s.shown = near;
    }
    for (const s of this.sleepers) {
      const near = Math.abs(s.x - px) < 80 && Math.abs(s.y - py) < 90;
      if (near && !s.shown) this.bubble.show(s, s.line, 4, -60);
      s.shown = near;
    }
    const b = pl.body;
    for (const s of this.springs) {
      if (b.velocity.y > 0 && Math.abs(s.x - pl.x) < 34 && pl.y > s.y - 64 && pl.y < s.y - 20) {
        b.setVelocityY(-PHYS.springSpeed);
        this.jumpHeld = false;
        s.setFrame(1);
        this.time.delayedCall(160, () => s.setFrame(0));
        this.tweens.add({ targets: s, scaleX: 0.9, scaleY: 0.6, duration: 80, yoyo: true });
        audio.play('spring');
      }
    }
    if (this.exit && !this.completed && Math.abs(this.exit.x - px) < 46 && Math.abs(this.exit.y - pl.y) < 60) this.complete();
  }

  checkHazards() {
    const b = this.player.body;
    const box = new Phaser.Geom.Rectangle(b.x + 3, b.y + 4, b.width - 6, b.height - 4);
    for (const h of this.hazards) {
      if (Phaser.Geom.Rectangle.Overlaps(box, h)) { this.hurt(false); return; }
    }
    if (this.cliffs.hits(box) || this.morrow?.hits(box)) { this.hurt(false); return; }
    const hit = this.cave.hits(box);
    if (hit) { this.hurt(hit === 'water'); return; }
    const now = this.time.now;
    this.dynHazards = this.dynHazards.filter((h) => h.to > now);
    for (const h of this.dynHazards) {
      if (h.from <= now && Phaser.Geom.Rectangle.Overlaps(box, h.rect)) { this.hurt(false); return; }
    }
  }

  checkTriggers() {
    for (const t of this.triggers) {
      if (this.fired.has(t.event) || this.player.x < t.x) continue;
      this.fired.add(t.event);
      // A trigger named after a cutscene plays it in the middle of the level.
      // Abilities it unlocks (Glow, Glide) are saved by the cutscene itself.
      if (t.event === 'echo') {
        // a friend's voice, remembered
        const name = SPEAKERS[t.who]?.name || '';
        this.bubble.show(this.player, `${name}: "${t.text}"`, 5, -80);
        audio.play('petal');
        continue;
      }
      if (CUTSCENES[t.event]) {
        if (save.data.seen[t.event]) continue;
        this.playCutscene(t.event, () => this.pipSay('glow'));
      }
    }
  }

  playCutscene(id, after) {
    this.frozen = true;
    this.player.body.setVelocity(0, 0);
    this.player.play('wick-idle');
    this.scene.pause();
    this.scene.launch('Cutscene', { id, overlay: true });
    this.scene.bringToTop('Cutscene');
    // the cutscene covers the screen, so stop drawing the level underneath it
    this.scene.setVisible(false);
    const cs = this.scene.get('Cutscene');
    cs.events.once('cutscene-done', () => {
      this.scene.setVisible(true);
      this.frozen = false;
      this.controls.sync();
      audio.playMusic(this.level.music);
      after?.();
    });
  }

  onEnemy(e) {
    if (e.freed || this.dead || this.completed) return;
    const pb = this.player.body;
    if (pb.velocity.y > 40 && pb.bottom < e.body.top + 18) {
      this.freeEnemy(e);
      pb.setVelocityY(-(this.controls.down('jump') ? PHYS.stompBounce * 1.3 : PHYS.stompBounce));
      this.jumpHeld = false;
    } else {
      this.hurt(false);
    }
  }

  freeEnemy(e) {
    e.freed = true;
    e.body.enable = false;
    this.soot.explode(18, e.x, e.y - 22);
    audio.play('free');
    this.tweens.add({ targets: e, scaleX: 0.7, scaleY: 0.1, alpha: 0, duration: 220, onComplete: () => e.destroy() });
    const w = this.add.sprite(e.x, e.y - 24, 'wisp').play('wisp-float').setDepth(24).setScale(0.2);
    this.tweens.add({ targets: w, scale: 1, duration: 300, ease: 'Back.out' });
    this.tweens.add({ targets: w, y: w.y - 260, alpha: 0, duration: 2600, ease: 'Sine.in', onComplete: () => w.destroy() });
    this.tweens.add({ targets: w, x: w.x + 30, duration: 650, yoyo: true, repeat: 2, ease: 'Sine.inOut' });
    if (!save.data.seen.firstFree) {
      save.data.seen.firstFree = true;
      save.write();
      this.bubble.show(this.player, WICK_BARKS.firstFree, 4, -72);
      this.time.delayedCall(2000, () => this.pipSay('free'));
    } else if (Math.random() < 0.35) this.pipSay('free');
  }

  hurt(fell) {
    if (this.dead || this.completed) return;
    this.dead = true;
    this.stats.deaths++;
    const pl = this.player;
    audio.play('hurt');
    this.cameras.main.shake(180, 0.006);
    if (!fell) this.soot.explode(16, pl.x, pl.y - 20);
    pl.body.setVelocity(0, 0);
    pl.body.setAllowGravity(true);
    this.dashTime = 0;
    pl.body.enable = false;
    pl.setTint(0x8a7aa0);
    this.tweens.add({ targets: pl, alpha: 0, duration: 400 });
    if (fell && !save.data.seen.firstPit) {
      save.data.seen.firstPit = true;
      save.write();
    }
    this.time.delayedCall(650, () => {
      this.cameras.main.fadeOut(220, 18, 13, 20);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        pl.setPosition(this.checkpoint.x, this.checkpoint.y - 2);
        pl.clearTint().setAlpha(1);
        pl.body.enable = true;
        pl.body.reset(pl.x, pl.y);
        if (this.pip) this.pip.setPosition(pl.x - 26, pl.y - 78);
        this.cameras.main.fadeIn(300, 18, 13, 20);
        this.dead = false;
        this.coyote = 0;
        this.jumpHeld = false;
        this.tweens.add({ targets: pl, alpha: 0.4, duration: 90, yoyo: true, repeat: 3 });
        if (fell) this.pipSay('fall');
        this.boss?.onPlayerRespawn(this.checkpoint);
        this.cave.onRespawn(this.checkpoint);
        this.morrow?.onPlayerRespawn();
        this.lightPower = 1;
      });
    });
  }

  pipSay(kind) {
    if (!this.pip) return;
    const lines = (PIP_BARKS[this.level.chapter] || PIP_BARKS[1])[kind];
    if (!lines || this.pipBubble.active) return;
    this.pipBubble.show(this.pip, pick(lines), 2.2, -24);
  }

  complete() {
    this.completed = true;
    this.frozen = true;
    this.player.body.setVelocity(0, 0);
    this.player.body.setAllowGravity(false);
    this.player.play('wick-cast');
    audio.play('complete');
    if (this.exit) this.sparkle.explode(40, this.exit.x, this.exit.y - 80);
    this.recordProgress();
    this.cameras.main.fadeOut(1200, 255, 244, 220);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      if (this.level.skipResults) go(this, afterLevelStep(this.index));
      else this.scene.start('LevelEnd', { index: this.index, stats: this.stats });
    });
  }

  recordProgress() {
    const d = save.data;
    const id = this.level.id;
    const prev = d.levels[id] || { embers: 0, petals: [], bestTime: Infinity };
    d.levels[id] = {
      embers: Math.max(prev.embers, this.stats.embers),
      total: this.stats.total,
      petals: [...new Set([...prev.petals, ...this.stats.petals])],
      petalTotal: this.stats.petalTotal,
      bestTime: Math.min(prev.bestTime ?? Infinity, this.stats.time),
    };
    d.petals = [...new Set([...d.petals, ...this.stats.petals])];
    d.unlocked = Math.max(d.unlocked, this.index + 2);
    save.write();
  }

  openPause() {
    if (this.scene.isPaused()) return;
    this.scene.pause();
    this.scene.launch('Pause', { index: this.index });
  }

  // ------------------------------------------------------------ boss

  buildBoss() {
    if (this.level.boss === 'morrow') {
      this.morrow = new MorrowBoss(this, this.bossPos.x, this.bossPos.y);
      return;
    }
    this.boss = new Thornwolf(this, this.bossPos.x, this.bossPos.y);
    // He runs along the ground and ignores the wooden planks.
    this.physics.add.collider(this.boss.sprite, this.layer, null, (w, tile) => tile.index !== 1);
    this.physics.add.overlap(this.player, this.boss.sprite, () => this.onBossTouch());
    this.time.delayedCall(2200, () => this.pipBubble.show(this.pip, 'Wick! Glow by the shrine lanterns!', 3.2, -24));
  }

  onBossTouch() {
    const boss = this.boss;
    if (this.dead || this.completed || !boss.harmful()) return;
    const pb = this.player.body;
    if (pb.velocity.y > 40 && pb.bottom < boss.sprite.body.top + 22) {
      // Too big to bop, but he won't hurt Wick if she lands on his back.
      pb.setVelocityY(-PHYS.stompBounce);
      this.jumpHeld = false;
      audio.play('hop');
      return;
    }
    this.hurt(false);
  }

  lightShrine(sh) {
    sh.lit = true;
    sh.setFrame(1);
    const g = this.add.image(sh.x, sh.y - 66, 'soft').setBlendMode(Phaser.BlendModes.ADD).setTint(0xffc060).setScale(4).setAlpha(0.6).setDepth(11);
    this.tweens.add({ targets: g, alpha: 0.8, duration: 1000, yoyo: true, repeat: -1 });
    this.sparkle.explode(30, sh.x, sh.y - 66);
    audio.play('lantern');
    const count = this.shrines.filter((s) => s.lit).length;
    this.events.emit('shrine', count);
    this.boss?.onShrineLit(count);
    this.morrow?.onShrineLit(count);
    if (this.boss && count === this.shrines.length) this.calmBoss();
  }

  /** A row of thorns bursting out of the ground, travelling away from x. */
  thornWave(x, groundY) {
    audio.play('bramble');
    for (const dir of [-1, 1]) {
      for (let k = 1; k <= 9; k++) {
        const tx = Math.round((x + dir * k * TILE) / TILE) * TILE + TILE / 2;
        if (tx < TILE || tx > this.worldW - TILE || !this.solidAt(tx, groundY + 8)) continue;
        const delay = k * 85;
        const spike = this.add.image(tx, groundY + 4, 'thornburst').setOrigin(0.5, 1).setScale(1, 0).setDepth(15);
        this.tweens.add({ targets: spike, scaleY: 1, delay, duration: 90, hold: 380, yoyo: true, onComplete: () => spike.destroy() });
        this.dynHazards.push({ rect: new Phaser.Geom.Rectangle(tx - 18, groundY - 52, 36, 52), from: this.time.now + delay + 60, to: this.time.now + delay + 520 });
      }
    }
  }

  calmBoss() {
    this.frozen = true;
    this.player.body.setVelocityX(0);
    this.player.play('wick-idle');
    this.dynHazards = [];
    audio.play('howl');
    this.soot.explode(60, this.boss.sprite.x, this.boss.sprite.y - 60);
    this.time.delayedCall(1800, () => {
      this.boss.sleep();
      this.sparkle.explode(50, this.boss.sprite.x, this.boss.sprite.y - 40);
    });
    this.time.delayedCall(3600, () => this.complete());
  }

  /** Hearthsong: Pip's light rings out in a soft song that calms every Gloomling nearby. */
  hearthsong() {
    audio.play('song');
    const ring = this.add.image(this.pip.x, this.pip.y, 'soft').setBlendMode(Phaser.BlendModes.ADD).setTint(0xffd27a).setScale(0.5).setDepth(24);
    this.tweens.add({ targets: ring, scale: 20, alpha: 0, duration: 1000, onComplete: () => ring.destroy() });
    for (const e of this.enemies.getChildren()) {
      if (!e.freed && e.body && Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y) < 380) this.freeEnemy(e);
    }
  }

  /** Wick reaches the flame Morrow has been hiding: the finale's cutscene follows. */
  reachMorrow() {
    if (this.completed) return;
    this.frozen = true;
    this.player.body.setVelocity(0, 0);
    this.player.body.setAllowGravity(false);
    this.sparkle.explode(60, this.morrow.sprite.x, this.morrow.sprite.y);
    this.morrow.warnings.clear();
    this.time.delayedCall(900, () => this.complete());
  }

  /** Jump back to the most recent lantern (used by the pause menu). */
  respawn() {
    this.hurt(false);
  }
}
