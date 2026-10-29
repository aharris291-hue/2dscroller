// The levels, in play order. Each `build` script places ground, platforms,
// collectibles and enemies (see builder.js for the coordinate rules).
// Run `npm run check` after editing to make sure every level can be finished.

import { buildLevel } from './builder.js';

const DEFS = [
  {
    id: 'P', chapter: 0, name: 'Hearthside at Dusk', theme: 'village', hush: 0.3, music: 'village',
    width: 150, height: 18, intro: 'C1', outro: 'C2', pip: false,
    build(L) {
      L.ground(0, 14, 3); L.start(3, 3);
      L.deco('house', 8, 3);
      L.sign(5, 3, 'Arrow keys or A / D to run');
      L.embers(9, 4, 3);
      L.sign(12, 3, 'Space, Z or the A button to jump. Hold it to jump higher!');
      L.ground(14, 6, 4);
      L.ground(20, 6, 5);
      L.embers(21, 7, 3);
      L.embers(26, 8, 3);
      L.ground(29, 12, 3);
      L.deco('fence', 33, 3);
      L.sleeper(35, 3, '...the bread\'s... rising... don\'t let it...', 0);
      L.lantern(38, 3, 0);
      L.ground(41, 15, 3);
      L.plat(42, 5, 3); L.plat(46, 7, 3);
      L.embers(46, 8, 3);
      L.deco('house', 50, 3);
      L.petal(43, 6, 'p-1');
      L.embers(56, 6, 3);
      L.ground(59, 16, 3);
      L.sign(60, 3, 'Bounce on mushrooms to fly up high!');
      L.spring(63, 3);
      L.plat(64, 10, 4);
      L.embers(64, 11, 3);
      L.petal(67, 11, 'p-2');
      L.thorns(70, 3, 2);
      L.embers(70, 6, 2);
      L.ground(75, 4, 5); L.ground(79, 4, 7); L.ground(83, 10, 9);
      L.embers(76, 6, 2); L.embers(80, 8, 2);
      L.lantern(86, 9, 3);
      L.sleeper(90, 9, '...five more minutes... the festival can wait...', 1);
      L.embers(93, 11, 2);
      L.ground(95, 4, 7);
      L.ground(101, 4, 8);
      L.embers(99, 11, 2);
      L.petal(103, 11, 'p-3');
      L.ground(107, 5, 6);
      L.embers(105, 10, 2);
      L.ground(112, 38, 3);
      L.sleeper(116, 3, '...so many lanterns... so pretty...', 2);
      L.deco('tree', 120, 3);
      L.thorns(124, 3, 3);
      L.embers(124, 6, 3);
      L.plat(130, 5, 3); L.plat(134, 7, 3);
      L.embers(130, 6, 3); L.embers(134, 8, 3);
      L.deco('tower', 144, 3);
      L.exit(144, 3);
    },
  },
  {
    id: '1-1', chapter: 1, name: 'The Cedar Road', theme: 'woods', hush: 0.25, music: 'woods',
    width: 170, height: 18,
    build(L) {
      L.ground(0, 16, 3); L.start(2, 3);
      L.deco('tree', 6, 3); L.deco('statue', 10, 3);
      L.embers(7, 4, 3);
      L.sign(11, 3, 'Gloomlings are just cold. Bounce on their heads to set them free!');
      L.gloom(14, 3);
      L.ground(16, 8, 4);
      L.gloom(21, 4);
      L.embers(24, 7, 3);
      L.ground(27, 15, 3);
      L.lantern(30, 3, 1);
      L.deco('tree', 34, 3);
      L.plat(35, 6, 3); L.embers(35, 7, 3);
      L.gloom(38, 3);
      L.block(41, 3, 1, 2);
      L.ground(42, 10, 3);
      L.hopper(47, 3);
      L.plat(53, 4, 2); L.embers(53, 6, 2);
      L.ground(57, 12, 3);
      L.spring(60, 3);
      L.plat(61, 10, 5); L.embers(61, 11, 4); L.petal(65, 11, '1-1a');
      L.gloom(64, 3);
      L.thorns(66, 3, 2);
      L.ground(69, 6, 5); L.ground(75, 6, 7);
      L.embers(70, 6, 3); L.embers(76, 8, 3);
      L.lantern(77, 7, 4);
      L.ground(81, 20, 2);
      L.gloom(85, 2); L.gloom(92, 2);
      L.thorns(88, 2, 2); L.embers(88, 5, 2);
      L.deco('statue', 95, 2); L.deco('tree', 97, 2);
      L.hopper(98, 2);
      L.block(103, 3, 2, 1); L.block(108, 4, 2, 1); L.block(113, 3, 2, 1);
      L.embers(103, 5, 2); L.embers(108, 6, 2); L.embers(113, 5, 2);
      L.petal(108, 9, '1-1b');
      L.ground(117, 20, 2);
      L.lantern(119, 2, 5);
      L.gloom(124, 2); L.hopper(132, 2);
      L.plat(126, 4, 3); L.plat(131, 6, 3);
      L.embers(126, 5, 3); L.embers(131, 7, 3);
      L.ground(137, 33, 2);
      L.thorns(140, 2, 3); L.embers(140, 5, 3);
      L.gloom(146, 2); L.gloom(151, 2);
      L.petal(149, 6, '1-1c');
      L.deco('shrine', 158, 2);
      L.exit(164, 2);
    },
  },
  {
    id: '1-2', chapter: 1, name: 'Shrine of Stone Sprites', theme: 'woods', hush: 0.3, music: 'woods',
    width: 180, height: 18,
    build(L) {
      L.ground(0, 30, 3); L.start(2, 3);
      L.deco('statue', 6, 3); L.deco('statue', 9, 3); L.deco('statue', 12, 3); L.deco('tree', 15, 3);
      L.embers(5, 4, 4);
      L.gloom(17, 3); L.gloom(24, 3);
      L.petal(20, 7, '1-2a');
      L.ground(30, 6, 5); L.ground(36, 8, 4);
      L.embers(31, 6, 3);
      L.lantern(37, 4, 2);
      L.hopper(41, 4);
      L.embers(44, 7, 3);
      L.ground(47, 25, 3);
      L.deco('mossback', 60, 3);
      L.trigger(56, 'C3');
      L.sign(66, 3, 'Press X, C or the Y button to Glow. Hidden spirit paths will appear!');
      L.spirit(73, 4, 3); L.spirit(78, 4, 2);
      L.embers(73, 5, 3); L.embers(78, 5, 2);
      L.ground(81, 14, 3);
      L.lantern(83, 3, 4);
      L.gloom(87, 3);
      L.spirit(89, 5, 2); L.spirit(92, 7, 2);
      L.ground(95, 4, 9);
      L.embers(95, 10, 4); L.petal(97, 12, '1-2b');
      L.ground(99, 20, 3);
      L.hopper(104, 3); L.gloom(110, 3);
      L.thorns(113, 3, 3); L.embers(113, 6, 3);
      L.plat(121, 4, 2); L.spirit(125, 5, 2); L.plat(129, 4, 2);
      L.embers(121, 5, 2); L.embers(125, 6, 2); L.embers(129, 5, 2);
      L.ground(133, 47, 3);
      L.lantern(135, 3, 0);
      L.gloom(140, 3); L.gloom(146, 3);
      L.spring(150, 3);
      L.spirit(152, 10, 4); L.embers(152, 11, 3); L.petal(155, 11, '1-2c');
      L.deco('shrine', 168, 3);
      L.exit(175, 3);
    },
  },
  {
    id: '1-3', chapter: 1, name: 'The Bramble Hollow', theme: 'woods', hush: 0.5, music: 'woods',
    width: 190, height: 18, outro: 'C4a',
    build(L) {
      L.ground(0, 12, 3); L.start(2, 3);
      L.deco('bigtree', 6, 3);
      L.ground(12, 10, 1); L.thorns(12, 1, 10);
      L.block(14, 3); L.block(17, 4); L.block(20, 3);
      L.embers(14, 5); L.embers(17, 6); L.embers(20, 5);
      L.ground(22, 10, 3);
      L.lantern(24, 3, 2);
      L.gloom(26, 3); L.hopper(29, 3);
      L.spirit(33, 4, 2); L.spirit(37, 6, 2); L.spirit(41, 5, 2);
      L.embers(33, 5, 2); L.embers(37, 7, 2); L.embers(41, 6, 2);
      L.petal(37, 9, '1-3a');
      L.ground(45, 10, 3);
      L.gloom(50, 3);
      L.ground(55, 6, 6);
      L.lantern(57, 6, 7);
      L.ground(61, 30, 1); L.thorns(61, 1, 30);
      L.plat(62, 5, 3); L.plat(67, 6, 2); L.spirit(71, 5, 3);
      L.plat(76, 7, 2); L.spirit(80, 6, 3); L.plat(85, 5, 3);
      L.embers(62, 6, 3); L.embers(67, 7, 2); L.embers(71, 6, 3); L.embers(80, 7, 3); L.embers(85, 6, 3);
      L.petal(76, 10, '1-3b');
      L.ground(91, 12, 4);
      L.lantern(93, 4, 6);
      L.hopper(96, 4); L.gloom(99, 4);
      L.spring(102, 4);
      L.spirit(104, 11, 3); L.petal(105, 12, '1-3c');
      L.ground(103, 26, 4);
      L.thorns(108, 4, 3); L.embers(108, 7, 3);
      L.gloom(113, 4); L.gloom(118, 4); L.hopper(122, 4);
      L.thorns(125, 4, 2); L.embers(125, 7, 2);
      L.ground(129, 4, 6); L.ground(133, 4, 8);
      L.embers(130, 7, 2); L.embers(134, 9, 2);
      L.ground(137, 23, 4);
      L.lantern(139, 4, 3);
      L.gloom(145, 4); L.thorns(150, 4, 2); L.gloom(155, 4);
      L.spirit(161, 5, 3); L.spirit(166, 6, 2);
      L.embers(161, 6, 3); L.embers(166, 7, 2);
      L.ground(170, 20, 4);
      L.deco('shrine', 182, 4);
      L.exit(185, 4);
    },
  },
  {
    id: '1-F', chapter: 1, name: 'The Thornwolf', theme: 'woods', hush: 0.55, music: 'boss',
    width: 28, height: 18, outro: 'C4', boss: 'thornwolf',
    build(L) {
      L.ground(0, 28, 3);
      L.fill(0, 3, 1, 15); L.fill(27, 3, 1, 15); // walls he crashes into
      L.start(4, 3);
      L.boss(21, 3);
      L.deco('bigtree', 3, 3); L.deco('shrine', 13, 3); L.deco('statue', 9, 3); L.deco('statue', 18, 3);
      L.plat(2, 5, 4); L.shrine(3, 6);
      L.plat(22, 5, 4); L.shrine(24, 6);
      L.plat(7, 8, 3); L.shrine(8, 9);
      L.plat(18, 8, 3); L.shrine(19, 9);
      L.spring(13, 3);
      L.plat(11, 10, 6); L.embers(11, 11, 6);
      L.embers(6, 4, 2); L.embers(20, 4, 2);
    },
  },
  {
    id: '2-1', chapter: 2, name: 'The Crystal Lift', theme: 'caves', hush: 0.35, dark: 0.82, music: 'caves',
    width: 170, height: 18, intro: 'C5',
    build(L) {
      L.ceil(0, 170, 2);
      L.ground(0, 20, 3); L.start(3, 3);
      L.deco('shack', 7, 3);
      L.nell(13, 3, ["Don't follow me. And don't touch my lifts."]);
      L.crystal(17, 3);
      L.sign(15, 3, "It's dark down here. Crystals, lanterns and Pip's Glow light the way.");
      L.embers(5, 4, 3);
      L.gloom(18, 3);
      L.mover(21, 3, 3, 4, 0, 70);
      L.embers(22, 6, 3);
      L.ground(29, 15, 3);
      L.crystal(31, 3); L.lantern(33, 3, 1);
      L.deco('beam', 36, 3, { h: 4 });
      L.hopper(37, 3);
      L.petal(39, 6, '2-1a');
      L.mover(42, 3, 2, 0, 5, 60);
      L.ground(44, 10, 9);
      L.embers(44, 10, 4); L.drip(48, 15);
      L.crystal(50, 9); L.petal(52, 11, '2-1b');
      L.ground(54, 20, 3);
      L.gloom(58, 3); L.drip(61, 15); L.drip(64, 15);
      L.embers(59, 4, 6);
      L.lantern(66, 3, 2);
      L.deco('beam', 70, 3, { h: 5 });
      L.mover(75, 4, 3, 4, 0, 80);
      L.mover(83, 6, 3, 3, 0, 70);
      L.embers(76, 7, 3); L.embers(84, 9, 3);
      L.petal(80, 9, '2-1c');
      L.ground(90, 20, 3);
      L.crystal(92, 3);
      L.hopper(96, 3); L.gloom(102, 3);
      L.thorns(106, 3, 2); L.embers(106, 6, 2);
      L.ground(110, 30, 3);
      L.lantern(115, 3, 3);
      L.drip(120, 15); L.drip(123, 15); L.drip(126, 15);
      L.embers(120, 4, 7);
      L.spring(130, 3); L.plat(131, 10, 4); L.embers(131, 11, 4);
      L.gloom(136, 3);
      L.ground(140, 30, 3);
      L.crystal(150, 3); L.deco('beam', 156, 3, { h: 4 });
      L.gloom(146, 3); L.hopper(154, 3);
      L.exit(165, 3);
    },
  },
  {
    id: '2-2', chapter: 2, name: 'Mine Cart Rush', theme: 'caves', hush: 0.3, dark: 0.55, music: 'cart',
    width: 262, height: 18, mode: 'cart', cartSpeed: 320, outro: 'C5b',
    build(L) {
      L.ceil(0, 262, 2);
      L.rail(0, 3, 30); L.start(3, 4);
      L.sign(6, 4, 'The cart rolls by itself. Jump over gaps, thorns and Gloomlings!');
      L.embers(10, 5, 5); L.embers(20, 6, 3);
      L.rail(33, 3, 20); L.embers(30, 6, 3);
      L.gloom(42, 4);
      L.crystal(46, 4);
      L.rail(55, 4, 20); L.embers(53, 7, 2);
      L.lantern(58, 5, 1);
      L.petal(66, 8, '2-2a');
      L.rail(78, 3, 25); L.embers(75, 7, 3);
      L.thorns(88, 4, 2); L.embers(88, 7, 2);
      L.gloom(97, 4);
      L.rail(105, 5, 15); L.embers(103, 8, 2);
      L.lantern(108, 6, 4);
      L.gloom(115, 6);
      L.crystal(112, 6);
      L.rail(123, 3, 30); L.embers(120, 7, 3);
      L.thorns(133, 4, 2); L.thorns(143, 4, 2);
      L.embers(133, 7, 2); L.embers(143, 7, 2);
      L.petal(138, 8, '2-2b');
      L.rail(156, 4, 12); L.embers(153, 7, 3);
      L.rail(171, 3, 40); L.embers(168, 7, 3);
      L.lantern(174, 4, 6);
      L.thorns(185, 4, 2); L.gloom(195, 4); L.thorns(205, 4, 3);
      L.embers(185, 7, 2); L.embers(205, 7, 3);
      L.crystal(190, 4);
      L.petal(198, 8, '2-2c');
      L.rail(214, 4, 48); L.embers(211, 7, 3);
      L.gloom(225, 5); L.thorns(235, 5, 2);
      L.exit(252, 5);
    },
  },
  {
    id: '2-3', chapter: 2, name: 'The Drowned Gallery', theme: 'caves', hush: 0.4, dark: 0.72, music: 'caves',
    width: 180, height: 18, dash: true, outro: 'C5c',
    build(L) {
      L.ceil(0, 180, 2);
      L.ground(0, 16, 3); L.start(3, 3);
      L.sign(8, 3, 'Water ahead! Jump, then press Shift, V or the gamepad X to Ember Dash across.');
      L.embers(4, 4, 4);
      L.ground(16, 6, 1); L.water(16, 1, 6, 2);
      L.embers(17, 6, 4);
      L.ground(22, 10, 3);
      L.crystal(24, 3); L.lantern(26, 3, 4);
      L.gloom(29, 3);
      L.ground(32, 10, 1); L.water(32, 1, 10, 2);
      L.block(36, 3, 2, 1); L.embers(36, 5, 2);
      L.ground(42, 14, 3);
      L.drip(46, 15); L.drip(49, 15);
      L.hopper(52, 3);
      L.ground(56, 16, 1); L.water(56, 1, 16, 2);
      L.mover(57, 4, 3, 9, 0, 90);
      L.embers(58, 7, 3); L.embers(66, 7, 3);
      L.petal(62, 9, '2-3a');
      L.ground(72, 14, 3);
      L.lantern(75, 3, 5);
      L.gloom(79, 3);
      L.crystal(83, 3);
      L.ground(86, 4, 6);
      L.ground(90, 13, 1); L.water(90, 1, 13, 2);
      L.plat(96, 5, 3); L.embers(96, 6, 3); L.petal(97, 9, '2-3b');
      L.ground(103, 15, 3);
      L.drip(106, 15); L.gloom(108, 3);
      L.lantern(112, 3, 6);
      L.ground(118, 24, 1); L.water(118, 1, 24, 2);
      L.block(121, 3); L.block(127, 4); L.block(133, 3); L.block(138, 4);
      L.embers(121, 5); L.embers(127, 6); L.embers(133, 5); L.embers(138, 6);
      L.petal(130, 8, '2-3c');
      L.crystal(124, 3);
      L.ground(142, 38, 3);
      L.hopper(150, 3); L.gloom(156, 3);
      L.crystal(160, 3); L.deco('beam', 166, 3, { h: 4 });
      L.exit(172, 3);
    },
  },
  {
    id: '2-F', chapter: 2, name: 'The Flood', theme: 'caves', hush: 0.45, dark: 0.6, music: 'flood',
    width: 24, height: 64, dash: true, mode: 'flood', floodSpeed: 30, outro: 'C6',
    build(L) {
      // Climb zig-zagging planks before the water catches up. Two boulders block
      // the way: light the crystal switch with Glow and Nell smashes the boulder.
      L.fill(0, 0, 1, 64); L.fill(23, 0, 1, 64); L.ceil(0, 24, 3);
      L.ground(0, 24, 3); L.start(4, 3);
      L.nell(9, 3, ["The water's coming! Climb, candle-kid! I'll clear the rocks!"]);
      L.lantern(6, 3, 7);
      L.plat(8, 5, 4); L.plat(14, 8, 4); L.plat(19, 11, 3);
      L.plat(13, 13, 4); L.plat(7, 15, 4);
      L.embers(8, 6, 3); L.embers(14, 9, 3); L.embers(13, 14, 3);
      L.petal(20, 14, '2-Fa');
      // shelf A, blocked by boulder a
      L.plat(1, 18, 15);
      L.lantern(3, 19, 3);
      L.switchCrystal(6, 19, 'a'); L.boulder(10, 19, 'a'); L.fill(8, 21, 6, 1);
      L.plat(18, 21, 3); L.crystal(19, 22);
      L.plat(14, 24, 4); L.plat(8, 27, 4); L.plat(2, 30, 4);
      L.embers(14, 25, 3); L.embers(8, 28, 3);
      // shelf B
      L.plat(1, 33, 14);
      L.lantern(9, 34, 5); L.petal(3, 35, '2-Fb');
      L.plat(17, 35, 3); L.plat(21, 38, 2); L.plat(15, 40, 4); L.plat(9, 42, 4); L.plat(3, 44, 4);
      L.embers(17, 36, 3); L.embers(15, 41, 3); L.embers(9, 43, 3);
      L.drip(12, 46);
      // shelf C, blocked by boulder b
      L.plat(1, 47, 15);
      L.lantern(2, 48, 0);
      L.switchCrystal(5, 48, 'b'); L.boulder(9, 48, 'b'); L.fill(7, 50, 6, 1);
      L.plat(18, 50, 3); L.plat(13, 53, 3); L.plat(7, 56, 4);
      L.embers(18, 51, 3); L.embers(13, 54, 3);
      L.petal(20, 53, '2-Fc'); L.crystal(19, 51);
      L.exit(8, 57);
    },
  },
  {
    id: '3-1', chapter: 3, name: 'Windless Steps', theme: 'cliffs', hush: 0.35, music: 'cliffs',
    width: 180, height: 20, dash: true, intro: 'C6b',
    build(L) {
      L.ground(0, 14, 4); L.start(3, 4);
      L.deco('flags', 1, 4, { w: 8 }); L.deco('birds', 8, 4);
      L.embers(5, 5, 4);
      L.sign(11, 4, 'Crumbling ledges fall away soon after you land. Keep moving!');
      L.crumble(16, 4, 2); L.embers(16, 6, 2);
      L.ground(21, 10, 4);
      L.lantern(23, 4, 1); L.bat(26, 7, 2);
      L.ground(31, 4, 6); L.ground(35, 4, 8);
      L.deco('birds', 32, 6, { n: 2 });
      L.crumble(41, 8, 2); L.crumble(45, 7, 1);
      L.bat(43, 11, 3); L.petal(42, 11, '3-1a');
      L.ground(48, 12, 6);
      L.lantern(50, 6, 4); L.hopper(55, 6);
      L.embers(61, 9, 4);
      L.ground(66, 14, 6);
      L.deco('birds', 68, 6); L.deco('flags', 70, 6, { w: 8 });
      L.bat(71, 9, 2); L.gloom(75, 6);
      L.crumble(81, 5, 2); L.crumble(85, 4, 2); L.crumble(89, 3, 2); L.crumble(93, 4, 2);
      L.embers(81, 7, 2); L.embers(85, 6, 2); L.embers(89, 5, 2); L.embers(93, 6, 2);
      L.bat(87, 8, 3); L.petal(91, 7, '3-1b');
      L.ground(97, 15, 4);
      L.lantern(99, 4, 6);
      L.gloom(104, 4); L.bat(108, 8, 2);
      L.spring(111, 4); L.plat(112, 11, 4);
      L.ground(117, 8, 12); L.embers(117, 13, 4); L.petal(121, 14, '3-1c');
      L.deco('birds', 119, 12, { n: 4 });
      L.ground(125, 10, 4);
      L.crumble(136, 5, 2); L.embers(136, 7, 2);
      L.ground(140, 40, 4);
      L.bat(132, 7, 3); L.gloom(145, 4); L.hopper(150, 4); L.bat(155, 7, 2);
      L.deco('birds', 160, 4); L.deco('flags', 162, 4, { w: 8 });
      L.exit(174, 4);
    },
  },
  {
    id: '3-2', chapter: 3, name: 'The Sky Post Office', theme: 'cliffs', hush: 0.3, music: 'cliffs',
    width: 150, height: 26, dash: true, glideFrom: 52,
    build(L) {
      L.ground(0, 20, 4); L.start(3, 4);
      L.deco('birds', 8, 4); L.embers(6, 5, 4);
      L.bat(14, 7, 2);
      L.plat(20, 6, 3); L.plat(25, 9, 3); L.plat(30, 12, 3);
      L.embers(20, 7, 3); L.embers(25, 10, 3); L.embers(30, 13, 3);
      L.ground(34, 30, 15);
      L.deco('postoffice', 47, 15, { h: 300 });
      L.lantern(36, 15, 7); L.bat(41, 18, 3);
      L.deco('birds', 44, 15, { n: 4 });
      L.trigger(52, 'C7');
      L.sign(57, 15, 'Hold jump while falling to glide. Glide into rising wind to soar!');
      L.embers(64, 15, 3); L.embers(68, 13, 3); L.embers(72, 11, 3);
      L.updraft(68, 4, 3, 14); L.petal(69, 19, '3-2a');
      L.ground(76, 8, 10);
      L.lantern(78, 10, 4); L.gloom(81, 10);
      L.crumble(88, 9, 2); L.crumble(94, 8, 2);
      L.bat(91, 13, 3); L.petal(97, 12, '3-2b');
      L.ground(100, 10, 8); L.gloom(105, 8);
      L.plat(108, 10, 2); L.ground(110, 4, 12);
      L.embers(114, 12, 3); L.embers(118, 9, 3);
      L.updraft(118, 4, 3, 10); L.petal(119, 16, '3-2c');
      L.ground(124, 26, 4);
      L.deco('flags', 130, 4, { w: 8 }); L.hopper(134, 4);
      L.exit(144, 4);
    },
  },
  {
    id: '3-3', chapter: 3, name: 'Kite Fields', theme: 'cliffs', hush: 0.25, music: 'cliffs',
    width: 190, height: 22, dash: true, glide: true, outro: 'C7b',
    build(L) {
      L.ground(0, 12, 4); L.start(3, 4);
      L.deco('kitepole', 6, 4);
      L.sign(9, 4, 'Glide into the rising wind to soar. Flying kites make good stepping stones!');
      L.updraft(13, 4, 2, 8); L.embers(13, 7, 1, 0, 2);
      L.plat(16, 12, 4); L.embers(16, 13, 4);
      L.kite(22, 10, 3, 6, 0, 70);
      L.kite(34, 12, 3, 0, 3, 50);
      L.plat(40, 16, 3); L.bat(44, 18, 3);
      L.embers(23, 12, 3); L.embers(34, 17, 3);
      L.ground(50, 10, 4);
      L.lantern(52, 4, 3); L.gloom(56, 4); L.hopper(58, 4);
      L.updraft(61, 4, 2, 12);
      L.kite(64, 15, 3, 5, 0, 80); L.petal(66, 19, '3-3a');
      L.kite(75, 13, 3, 0, 4, 60);
      L.plat(80, 18, 3); L.embers(80, 19, 3);
      L.ground(84, 8, 8);
      L.lantern(86, 8, 5); L.bat(90, 11, 2);
      L.ground(92, 40, 4);
      L.deco('kitepole', 94, 4);
      L.gloom(96, 4); L.hopper(102, 4);
      L.updraft(106, 4, 2, 14);
      L.kite(110, 17, 3, 6, 0, 90); L.embers(111, 19, 3);
      L.updraft(120, 4, 2, 13); L.petal(122, 19, '3-3b');
      L.kite(124, 16, 3, 0, 3, 60);
      L.ground(132, 6, 10);
      L.lantern(134, 10, 6);
      L.crumble(140, 9, 2); L.crumble(145, 10, 2); L.crumble(150, 9, 2);
      L.embers(140, 11, 2); L.embers(145, 12, 2); L.embers(150, 11, 2);
      L.bat(146, 13, 3);
      L.ground(155, 35, 4);
      L.updraft(159, 4, 2, 6); L.petal(160, 9, '3-3c');
      L.gloom(165, 4); L.hopper(172, 4); L.deco('kitepole', 178, 4);
      L.exit(184, 4);
    },
  },
  {
    id: '3-F', chapter: 3, name: 'The Storm Stair', theme: 'storm', hush: 0.4, music: 'storm',
    width: 26, height: 70, dash: true, glide: true, outro: 'C8',
    build(L) {
      L.fill(0, 0, 1, 70); L.fill(25, 0, 1, 70); L.ceil(0, 26, 2);
      L.ground(0, 26, 3); L.start(4, 3);
      L.lantern(6, 3, 6);
      L.sign(9, 3, 'Ride the storm winds upward. Watch for the warning flicker before lightning strikes!');
      L.updraft(12, 3, 3, 12); L.embers(13, 6, 1, 0, 3);
      L.plat(16, 15, 4); L.embers(16, 16, 4);
      L.bolt(20, 16, 30, 3.2);
      L.plat(9, 18, 4); L.petal(20, 18, '3-Fa');
      L.crumble(3, 21, 3);
      L.updraft(5, 22, 2, 14); L.embers(5, 26, 1, 0, 3);
      L.bat(12, 30, 3);
      L.plat(9, 36, 4);
      L.lantern(10, 37, 3);
      L.bolt(13, 37, 52, 3);
      L.plat(15, 39, 4); L.embers(15, 40, 4);
      L.bat(18, 45, 3);
      L.crumble(20, 42, 3);
      L.updraft(22, 43, 2, 12); L.petal(23, 57, '3-Fb');
      L.plat(15, 55, 4);
      L.bolt(14, 56, 66, 3.4);
      L.crumble(9, 57, 3); L.embers(9, 59, 3);
      L.plat(3, 60, 4);
      L.lantern(4, 61, 5); L.petal(2, 64, '3-Fc');
      L.plat(9, 63, 4);
      L.exit(11, 64);
    },
  },
  {
    id: '4-1', chapter: 4, name: 'The Root Halls', theme: 'heart', hush: 0.6, dark: 0.82, fade: true, music: 'heart',
    width: 200, height: 22, dash: true, glide: true, intro: 'C9a',
    build(L) {
      L.ceil(0, 200, 2);
      L.ground(0, 16, 3); L.start(3, 3); L.lantern(5, 3, 7);
      L.sign(8, 3, 'The Hush is smothering your lantern. Lit lanterns and embers bring the light back.');
      L.embers(9, 4, 4);
      L.echo(12, 'grandpa', "A lantern's not for seeing, Wicklet. It's so others can see you.");
      L.gloom(14, 3);
      L.spirit(17, 5, 3); L.spirit(22, 6, 3);
      L.embers(17, 6, 3); L.petal(23, 9, '4-1a');
      L.ground(26, 12, 3);
      L.bat(30, 7, 3); L.lantern(32, 3, 3);
      L.crumble(39, 4, 2); L.crumble(44, 5, 2);
      L.embers(39, 6, 2); L.embers(44, 7, 2);
      L.echo(43, 'mossback', 'Little light... the forest remembers you. Remind... the rest.');
      L.ground(49, 12, 3);
      L.hopper(54, 3); L.lantern(58, 3, 2);
      L.mover(62, 3, 3, 6, 0, 80); L.embers(63, 6, 3);
      L.echo(64, 'nell', "Go get 'em, candle-kid. And come back, okay?");
      L.ground(72, 14, 3);
      L.gloom(76, 3); L.bat(80, 7, 2);
      L.updraft(87, 3, 2, 10); L.embers(87, 6, 1, 0, 2);
      L.echo(86, 'wren', "Wind remembers where it's been, dear. Ride it home.");
      L.ground(90, 10, 11);
      L.lantern(92, 11, 6); L.petal(95, 14, '4-1b');
      L.ground(100, 7, 1); L.thorns(100, 1, 7);
      L.ground(107, 10, 11);
      L.embers(101, 13, 5);
      L.ground(117, 30, 3);
      L.gloom(120, 3); L.gloom(126, 3); L.hopper(132, 3);
      L.lantern(136, 3, 1);
      L.spring(140, 3); L.plat(141, 10, 4); L.petal(143, 12, '4-1c');
      L.spirit(149, 5, 3); L.spirit(154, 6, 3);
      L.embers(149, 6, 3); L.embers(154, 7, 3);
      L.bat(156, 9, 3);
      L.ground(160, 40, 3);
      L.gloom(170, 3); L.hopper(178, 3); L.lantern(184, 3, 3);
      L.exit(194, 3);
    },
  },
  {
    id: '4-2', chapter: 4, name: 'Hall of Sleepers', theme: 'heart', hush: 0.55, dark: 0.7, music: 'heart',
    width: 180, height: 20, dash: true, glide: true,
    build(L) {
      L.ceil(0, 180, 2);
      L.ground(0, 60, 3); L.start(3, 3); L.lantern(5, 3, 4);
      L.sleeper(12, 3, '...warm... it used to be so warm...', 0);
      L.sleeper(20, 3, '...is it spring yet...?', 1);
      L.deco('statue', 9, 3); L.deco('statue', 23, 3);
      L.gloom(16, 3); L.gloom(25, 3); L.gloom(28, 3);
      L.embers(14, 4, 4);
      L.plat(32, 5, 4); L.plat(38, 7, 4);
      L.embers(32, 6, 3); L.embers(38, 8, 3);
      L.bat(35, 11, 3); L.petal(40, 10, '4-2a');
      L.gloom(44, 3); L.gloom(47, 3); L.hopper(50, 3);
      L.trigger(57, 'C9');
      L.sign(61, 3, 'Glow now sings! Every Gloomling nearby will calm down.');
      L.lantern(63, 3, 0);
      L.ground(60, 40, 3);
      L.sleeper(67, 3, '...someone is singing...', 2);
      L.gloom(70, 3); L.gloom(72, 3); L.gloom(74, 3); L.gloom(76, 3); L.hopper(78, 3);
      L.ceil(82, 14, 11);
      L.gloom(85, 3); L.gloom(88, 3); L.gloom(91, 3); L.gloom(94, 3); L.bat(89, 6, 3);
      L.embers(84, 4, 10);
      L.spirit(101, 5, 3); L.spirit(106, 6, 3); L.petal(107, 9, '4-2b');
      L.ground(111, 30, 3);
      L.lantern(113, 3, 4);
      L.gloom(118, 3); L.gloom(120, 3); L.gloom(122, 3); L.gloom(124, 3); L.gloom(126, 3); L.hopper(128, 3);
      L.bat(122, 7, 3);
      L.sleeper(132, 3, '...thank you, little light...', 0);
      L.mover(141, 3, 3, 0, 6, 60);
      L.ground(144, 10, 10); L.petal(150, 12, '4-2c'); L.embers(145, 11, 4);
      L.ground(154, 26, 3);
      L.gloom(158, 3); L.gloom(162, 3); L.hopper(166, 3);
      L.exit(174, 3);
    },
  },
  {
    id: '4-3', chapter: 4, name: "Ash's Dream", theme: 'dream', hush: 0, music: 'dream',
    width: 170, height: 24, dash: true, glide: true, intro: 'C9b', outro: 'C9c',
    build(L) {
      L.ground(0, 10, 4); L.start(3, 4);
      L.echo(6, 'ash', 'Little spark. Do you remember the valley when it was young?');
      L.embers(5, 5, 4);
      L.fill(13, 6, 5, 1); L.fill(21, 8, 4, 1);
      L.embers(14, 8, 3); L.embers(21, 10, 3);
      L.updraft(27, 4, 2, 12); L.embers(27, 8, 1, 0, 3);
      L.fill(31, 14, 6, 1);
      L.echo(33, 'morrow', 'Ash. Tell me the names of the stars again.');
      L.mover(39, 13, 3, 6, 0, 70);
      L.fill(50, 12, 6, 1); L.petal(52, 15, '4-3a');
      L.spirit(58, 14, 3); L.spirit(63, 16, 3);
      L.fill(68, 17, 8, 1);
      L.echo(70, 'ash', 'Do not be afraid of endings, my dear.');
      L.lantern(71, 18, 4);
      L.embers(78, 16, 3); L.embers(82, 13, 3); L.petal(80, 12, '4-3b');
      L.fill(86, 8, 8, 1);
      L.updraft(96, 3, 2, 14);
      L.fill(100, 18, 6, 1);
      L.echo(102, 'morrow', 'Everything that burns goes out. Not you. Not you.');
      L.mover(108, 18, 3, 0, -6, 60);
      L.fill(113, 12, 6, 1);
      L.crumble(121, 13, 2); L.crumble(126, 14, 2);
      L.fill(131, 15, 6, 1); L.petal(127, 18, '4-3c');
      L.lantern(133, 16, 2);
      L.embers(138, 14, 3); L.embers(142, 10, 3);
      L.ground(146, 24, 4);
      L.echo(150, 'ash', '...Little spark. Go. Find the keeper.');
      L.exit(164, 4);
    },
  },
  {
    id: '4-F', chapter: 4, name: 'Morrow, the Ashen Moth', theme: 'heart', hush: 0.45, music: 'morrow',
    width: 30, height: 20, dash: true, glide: true, boss: 'morrow', skipResults: true, intro: 'C10a', outro: 'C10',
    build(L) {
      L.fill(0, 3, 1, 17); L.fill(29, 3, 1, 17);
      L.ground(0, 30, 3); L.start(4, 3);
      L.boss(14, 12);
      L.plat(3, 5, 4); L.shrine(4, 6, 'rootlantern');
      L.plat(23, 5, 4); L.shrine(25, 6, 'rootlantern');
      L.plat(8, 8, 3); L.shrine(9, 9, 'rootlantern');
      L.plat(19, 8, 3); L.shrine(20, 9, 'rootlantern');
      // spirit steps that appear when he opens his wings
      L.spirit(13, 10, 3);
      L.embers(11, 4, 2); L.embers(17, 4, 2);
    },
  },
  {
    id: 'E', chapter: 5, name: 'The Lantern Festival', theme: 'festival', hush: 0, music: 'festival',
    width: 120, height: 18, pip: false, skipResults: true, intro: 'C11', outro: 'END',
    build(L) {
      L.ground(0, 120, 3); L.start(3, 3);
      L.deco('house', 8, 3); L.deco('mossback', 22, 3); L.deco('house', 40, 3); L.deco('tree', 52, 3);
      L.deco('house', 70, 3); L.deco('fence', 84, 3); L.deco('house', 92, 3);
      L.sign(6, 3, 'Light every lantern on the way to the tower.');
      L.npc(14, 3, 'nell', "Took you long enough, candle-kid! Mum, say hi. MUM. SAY HI.", { scale: 0.55, originY: 140 / 144 });
      L.npc(17, 3, 'nellmum', 'Hello, little keeper. Thank you for the lantern.', { scale: 0.55, originY: 140 / 144, flip: true });
      L.npc(30, 3, 'wolf-calm', '(Haru thumps his tail, and all the cedars rustle.)', { scale: 0.5, originY: 232 / 240 });
      L.npc(48, 3, 'wren', 'Your letter was delivered, dear. In person. I watched.', { scale: 0.45, originY: 156 / 160 });
      for (const lx of [11, 25, 37, 50, 63, 76, 89]) L.lantern(lx, 3);
      L.embers(20, 4, 3); L.embers(44, 5, 3); L.embers(68, 4, 3); L.embers(86, 5, 3);
      L.npc(104, 3, 'grandpa-stand', 'There she is. Keeper Wick.', { scale: 0.55, originY: 166 / 170, flip: true });
      L.npc(109, 7, 'smallmoth', '(A small grey moth circles the tower lantern, careful not to get too close.)', { scale: 1, originY: 0.5 });
      L.deco('tower', 112, 3, { lit: true });
      L.exit(112, 3);
    },
  },
];

export const LEVELS = DEFS.map(buildLevel);
export const levelIndex = (id) => LEVELS.findIndex((l) => l.id === id);
