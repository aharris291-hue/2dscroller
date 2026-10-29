// Things that differ between the desktop app (Electron) and a web browser.
export const desktop = typeof window !== 'undefined' ? window.desktop || null : null;

export function setFullscreen(game, on, startup = false) {
  if (desktop) {
    desktop.setFullscreen(on);
    return;
  }
  if (startup) return; // browsers only allow fullscreen after a click or key press
  try {
    if (on) game.scale.startFullscreen();
    else game.scale.stopFullscreen();
  } catch (e) {
    console.warn('Fullscreen not available', e);
  }
}

export function quitGame() {
  if (desktop) desktop.quit();
}
