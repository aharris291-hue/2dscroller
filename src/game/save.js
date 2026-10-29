// Progress and settings are stored in the browser's localStorage, which the
// desktop (Electron) build keeps on disk between sessions.

const KEY = 'ember-hollow-save-v1';

const DEFAULTS = {
  unlocked: 1, // how many levels can be picked from the chapter menu
  levels: {}, // id -> { embers, total, petals: [ids], bestTime, deaths }
  petals: [], // every Memory Petal ever found
  glow: false, // has Pip's Glow been learned
  seen: {}, // cutscenes already watched
  settings: { music: 0.6, sfx: 0.8, fullscreen: true, textSpeed: 1 },
};

let data = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw);
      return { ...structuredClone(DEFAULTS), ...d, settings: { ...DEFAULTS.settings, ...d.settings } };
    }
  } catch (e) {
    console.warn('Could not read save data', e);
  }
  return structuredClone(DEFAULTS);
}

export const save = {
  get data() { return data; },
  write() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { console.warn('Could not save', e); }
  },
  reset() {
    const settings = data.settings;
    data = structuredClone(DEFAULTS);
    data.settings = settings;
    this.write();
  },
  hasProgress() { return Object.keys(data.levels).length > 0 || data.seen.C1; },
};
