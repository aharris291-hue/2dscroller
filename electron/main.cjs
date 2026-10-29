// Desktop wrapper: runs the built game (dist/) in its own window.
// This is what gets uploaded to Steam.
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Let music start without a click, like a normal desktop game.
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 640,
    minHeight: 360,
    backgroundColor: '#120d14',
    autoHideMenuBar: true,
    title: 'Ember Hollow',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.setMenu(null);
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  // F11 or Alt+Enter toggles fullscreen, as players expect.
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11' || (input.alt && input.key === 'Enter')) {
      win.setFullScreen(!win.isFullScreen());
      event.preventDefault();
    }
  });
}

ipcMain.handle('set-fullscreen', (e, on) => BrowserWindow.fromWebContents(e.sender)?.setFullScreen(!!on));
ipcMain.handle('quit', () => app.quit());

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
