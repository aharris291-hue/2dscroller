// Core numbers that the whole game shares.
export const VIEW_W = 1280;
export const VIEW_H = 720;
export const TILE = 48;

// Player movement, in pixels and seconds. Tuned so a standard jump clears
// 4 tiles across and 3 tiles up comfortably (see tools/check-levels.mjs).
export const PHYS = {
  gravity: 2600,
  fallGravityBonus: 1100, // extra pull while falling makes jumps feel snappy
  runSpeed: 330,
  groundAccel: 3200,
  groundDecel: 3600,
  airAccel: 2000,
  airDecel: 900,
  jumpSpeed: 960,
  jumpCut: 0.45, // velocity kept when jump is released early
  coyoteTime: 0.1,
  jumpBuffer: 0.12,
  maxFall: 1100,
  springSpeed: 1500,
  stompBounce: 700,
  dashSpeed: 900,
  dashTime: 0.19, // about 3.5 tiles
  glideFall: 110, // fall speed while gliding with Wren's feather
  windLift: 340, // how fast an updraft carries a glider upward
};

export const FONT_TITLE = '"Patrick Hand", "Comic Sans MS", cursive';
export const FONT_BODY = '"Nunito", "Segoe UI", sans-serif';
