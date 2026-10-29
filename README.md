# Ember Hollow

A hand-painted watercolor 2D platformer about Wick, an apprentice lantern-keeper,
and Pip, the last ember of the Great Hearth.

All art, music and sound are made by code inside this project, so there are no
image or audio files to license.

## What's playable now (v1.0: the whole story)

- Opening cutscene, then the **Prologue: Hearthside at Dusk**
- The "Pip" cutscene, then **Chapter 1: Whispering Woods** (3 levels)
- **Chapter 1 finale: The Thornwolf**, a boss fight where you light four shrine lanterns
  with Pip's Glow while dodging his charges, pounces and bramble bursts
- **Chapter 2: Glimmer Caves** (4 levels): dark mines lit only by lanterns and crystals,
  mine lifts, a runaway mine cart ride, flooded galleries crossed with the **Ember Dash**,
  and a rising-flood finale where Nell smashes boulders when you light crystal switches
- **Chapter 3: Dusk Cliffs** (4 levels): crumbling ledges, gloom bats, the **Feather Glide**
  from Wren the post owl, rising wind updrafts, flying kites, and a stormy finale climb
  through lightning
- **Chapter 4: The Hollow Heart** (4 levels): the Root Halls where Wick's lantern fades,
  the **Hearthsong** that calms every Gloomling nearby, Ash's Dream, and the three-phase
  finale with **Morrow, the Ashen Moth**
- **Epilogue: The Lantern Festival** and the credits
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
| Glide (after Chapter 3-2) | Hold jump while falling | Hold A |
| Glow (after Chapter 1-2; sings after Chapter 4-2) | X or C | Y |
| Ember Dash (after Chapter 2-2) | Shift or V | X or RB |
| Close a note or petal card | Enter, Down or S | B |
| Pause | Esc or P | Start |
| Skip a cutscene | Hold Esc | Hold B |
| Fullscreen (desktop app) | F11 or Alt+Enter | |

## Install it on a Windows PC (the easy way)

No setup needed. This is like installing any other game.

1. Go to **https://github.com/aharris291-hue/2dscroller/releases**.
2. Under the newest version, click **Ember-Hollow-Setup-1.0.0.exe**. It downloads.
3. Open the file you just downloaded (it is in your **Downloads** folder).
4. Windows may show a blue box that says **"Windows protected your PC"**. That happens to
   new games that aren't "signed" yet. Click **More info**, then **Run anyway**.
5. Wait a few seconds. The game installs itself, puts an **Ember Hollow** icon on your
   desktop, and starts. Next time, just double-click that icon.

To remove it: **Start → Settings → Apps**, find **Ember Hollow**, click **Uninstall**.
Your save is kept, in case you install it again.

## How to run it from the code (for making changes)

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

### If something goes wrong

- **"Electron failed to install correctly"**: the desktop part didn't finish downloading. Type this, wait for it to finish, then run `npm run app` again:

  ```bash
  node node_modules/electron/install.js
  ```

- **It still won't start**: you can always play in your browser with `npm run dev` instead.

## Put your name in the credits

Open `src/story/script.js`, find `[Your name here]` near the `CREDITS` list, and type your name
between the quote marks.

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

## Making a new installer

You don't need your own PC for this. GitHub builds it on a Windows computer for you:

1. Change the `version` in `package.json` (for example `1.0.1`) and push that change.
2. On the GitHub page, click **Releases** (right side), then **Draft a new release**.
3. Click **Choose a tag**, type `v1.0.1` (the same number with a `v` in front), and click
   **Create new tag**. Type a title like `Ember Hollow 1.0.1`, then click **Publish release**.
4. Wait about 10 minutes (you can watch it in the **Actions** tab). Two files appear on
   that release:
   - `Ember-Hollow-Setup-1.0.1.exe`: the installer for players.
   - `Ember-Hollow-Windows-for-Steam.zip`: the game folder you upload to Steam.

You can also start a build by hand: **Actions → Build Windows game → Run workflow**.
The files then appear at the bottom of that run's page under **Artifacts**.

## Steam store images

`steam-assets/` holds the store and library images and screenshots, all painted from the
game's own art. To make them again, run `npm run dev`, then in a second terminal
`node tools/steam-art.cjs`.
