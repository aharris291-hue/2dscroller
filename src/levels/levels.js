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
    width: 190, height: 18, outro: 'END_DEMO',
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
];

export const LEVELS = DEFS.map(buildLevel);
export const levelIndex = (id) => LEVELS.findIndex((l) => l.id === id);
