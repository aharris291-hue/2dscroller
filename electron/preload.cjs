// Exposes a tiny, safe API to the game for desktop-only features.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  setFullscreen: (on) => ipcRenderer.invoke('set-fullscreen', on),
  quit: () => ipcRenderer.invoke('quit'),
});
