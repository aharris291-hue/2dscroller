# Ember Hollow

A hand-painted watercolor 2D platformer about Wick, an apprentice lantern-keeper,
and Pip, the last ember of the Great Hearth.

All art, music and sound are made by code inside this project, so there are no
image or audio files to license.

## What's playable now (v0.2 prototype)

- Opening cutscene, then the **Prologue: Hearthside at Dusk**
- The "Pip" cutscene, then **Chapter 1: Whispering Woods** (3 levels)
- Mossback cutscene and the **Pip's Glow** ability, which reveals hidden spirit paths
- Embers, Memory Petals (story fragments), lantern checkpoints with Grandpa's notes,
  Gloomlings to free, mushroom springs, thorns
- Title screen, chapter select, pause menu, options, saving
- Keyboard and gamepad support

## Controls

| Action | Keyboard | Gamepad |
| --- | --- | --- |
| Move | Arrow keys or A / D | Left stick or D-pad |
| Jump (hold for higher) | Space, Z, W or Up | A |
| Glow (after Chapter 1-2) | X, C or Shift | X or Y |
| Pause | Esc or P | Start |
| Skip a cutscene | Hold Esc | Hold B |
| Fullscreen (desktop app) | F11 or Alt+Enter | |

## How to run it on your computer

You only need to do steps 1 to 3 once.

1. Install **Node.js** (the "LTS" version) from https://nodejs.org. Click through the installer.
2. On this GitHub page, click the green **Code** button, then **Download ZIP**. Unzip it somewhere easy, like your Desktop.
3. Open a terminal **in that folder**:
   - Windows: open the folder, click the address bar, type `cmd` and press Enter.
   - Mac: right-click the folder, then choose **New Terminal at Folder**.

   Then type this and press Enter (it downloads the game's building blocks; it takes a minute):

   ```bash
   npm install
   ```

4. To play in a desktop window, like it will be on Steam:

   ```bash
   npm run app
   ```

   Or, to play in your web browser:

   ```bash
   npm run dev
   ```

   Then open the link it shows (usually http://localhost:5173).

## Where things live (for editing)

| What | File |
| --- | --- |
| Story text: cutscenes, notes, Pip's lines, petals | `src/story/script.js` |
| Level layouts | `src/levels/levels.js` |
| Jump height, speed and other feel numbers | `src/config.js` |
| Character drawings | `src/art/characters.js` |
| World and background painting | `src/art/world.js` |
| Cutscene pictures | `src/art/cutscenes.js` |
| Music and sound effects | `src/game/audio.js` |

After changing a level, run `npm run check`. It proves every level can still be
finished and every ember can still be reached.

## Building for Steam (later)

`npm run dist:win`, `npm run dist:mac` and `npm run dist:linux` build the desktop
game into the `release/` folder. Steam setup (the $100 Steam Direct fee, store page,
Steamworks upload) comes once the game is further along.
