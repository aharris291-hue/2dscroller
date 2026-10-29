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
];

export const LEVELS = DEFS.map(buildLevel);
export const levelIndex = (id) => LEVELS.findIndex((l) => l.id === id);
