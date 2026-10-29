// All sound is synthesized live with the Web Audio API: gentle piano-like
// music and soft sound effects. No audio files needed.

import { save } from './save.js';

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

// Chords are [root midi note, 'maj' | 'min' | 'sus']; each lasts one bar.
const SONGS = {
  title: { bpm: 72, chords: [[57, 'min'], [53, 'maj'], [48, 'maj'], [55, 'maj']], seed: 3, melody: 0.55, pad: true },
  village: { bpm: 84, chords: [[53, 'maj'], [48, 'maj'], [50, 'min'], [46, 'maj'], [53, 'maj'], [48, 'maj'], [46, 'maj'], [48, 'sus']], seed: 11, melody: 0.7, pad: true },
  woods: { bpm: 96, chords: [[48, 'maj'], [55, 'maj'], [57, 'min'], [53, 'maj'], [48, 'maj'], [55, 'maj'], [53, 'maj'], [55, 'sus']], seed: 21, melody: 0.75, pad: true },
  boss: { bpm: 126, chords: [[57, 'min'], [53, 'maj'], [55, 'maj'], [52, 'maj']], seed: 41, melody: 0.85, pad: true, drums: true },
  caves: { bpm: 80, chords: [[50, 'min'], [53, 'maj'], [48, 'maj'], [45, 'min'], [50, 'min'], [46, 'maj'], [48, 'sus'], [45, 'maj']], seed: 61, melody: 0.6, pad: true },
  cart: { bpm: 144, chords: [[52, 'min'], [48, 'maj'], [55, 'maj'], [50, 'maj']], seed: 71, melody: 0.9, pad: false, drums: true },
  flood: { bpm: 132, chords: [[50, 'min'], [46, 'maj'], [53, 'maj'], [45, 'maj']], seed: 81, melody: 0.85, pad: true, drums: true },
  cutscene: { bpm: 60, chords: [[50, 'min'], [46, 'maj'], [53, 'maj'], [48, 'maj']], seed: 5, melody: 0.35, pad: true },
};
const TRIADS = { maj: [0, 4, 7], min: [0, 3, 7], sus: [0, 5, 7] };

class Audio {
  constructor() {
    this.ctx = null;
    this.song = null;
    this.timer = null;
  }

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.connect(this.ctx.destination);
    // A simple shared reverb makes everything sound softer and roomier.
    this.reverb = this.ctx.createConvolver();
    this.reverb.buffer = this.impulse(2.4);
    const wet = this.ctx.createGain();
    wet.gain.value = 0.35;
    this.reverb.connect(wet).connect(this.master);
    this.musicBus = this.ctx.createGain();
    this.sfxBus = this.ctx.createGain();
    for (const bus of [this.musicBus, this.sfxBus]) { bus.connect(this.master); bus.connect(this.reverb); }
    this.noise = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.applySettings();
  }

  resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  applySettings() {
    if (!this.ctx) return;
    const s = save.data.settings;
    this.musicBus.gain.value = s.music * 0.5;
    this.sfxBus.gain.value = s.sfx * 0.7;
  }

  impulse(seconds) {
    const rate = this.ctx.sampleRate, len = rate * seconds;
    const buf = this.ctx.createBuffer(2, len, rate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    return buf;
  }

  // ---------------------------------------------------------- instruments

  /** A soft tone: oscillator(s) through a gain envelope. */
  tone({ freq, type = 'sine', at = 0, dur = 0.3, vol = 0.2, attack = 0.005, slide = 0, bus = this.sfxBus, detune = 0, filter = 0 }) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + at;
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), t + dur);
    osc.detune.value = detune;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = osc.connect(g);
    if (filter) {
      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = filter;
      node = g.connect(f);
      node.connect(bus);
    } else g.connect(bus);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  piano(note, at, dur, vol, bus = this.musicBus) {
    const f = midi(note);
    this.tone({ freq: f, type: 'triangle', at, dur, vol, attack: 0.008, bus, filter: 2400 });
    this.tone({ freq: f * 2, type: 'sine', at, dur: dur * 0.6, vol: vol * 0.25, attack: 0.008, bus });
  }

  pad(notes, at, dur, vol) {
    for (const n of notes) {
      for (const det of [-7, 7]) this.tone({ freq: midi(n), type: 'sawtooth', at, dur, vol: vol / notes.length, attack: dur * 0.35, bus: this.musicBus, detune: det, filter: 900 });
    }
  }

  bell(note, at = 0, vol = 0.15) {
    const f = midi(note);
    this.tone({ freq: f, at, dur: 1.2, vol });
    this.tone({ freq: f * 2.76, at, dur: 0.4, vol: vol * 0.3 });
    this.tone({ freq: f * 5.4, at, dur: 0.15, vol: vol * 0.15 });
  }

  whoosh({ at = 0, dur = 0.2, vol = 0.15, from = 600, to = 2000, q = 1, bus = this.sfxBus } = {}) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + at;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass'; f.Q.value = q;
    f.frequency.setValueAtTime(from, t);
    f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + dur * 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(bus);
    src.start(t, Math.random() * 0.5, dur + 0.05);
  }

  // ---------------------------------------------------------- sound effects

  play(name, opt = {}) {
    if (!this.ctx) return;
    switch (name) {
      case 'jump': this.whoosh({ dur: 0.18, vol: 0.12, from: 500, to: 1800 }); this.tone({ freq: 330, slide: 1.6, dur: 0.12, vol: 0.05 }); break;
      case 'land': this.tone({ freq: 140, slide: 0.5, dur: 0.1, vol: 0.12 }); this.whoosh({ dur: 0.08, vol: 0.05, from: 300, to: 200 }); break;
      case 'ember': {
        const step = opt.combo || 0;
        const scale = [76, 79, 81, 84, 86, 88, 91];
        this.bell(scale[Math.min(step, scale.length - 1)], 0, 0.09);
        break;
      }
      case 'free':
        this.tone({ freq: 220, slide: 0.4, dur: 0.15, vol: 0.18 });
        [72, 76, 79, 84].forEach((n, i) => this.bell(n, 0.06 + i * 0.06, 0.07));
        break;
      case 'hurt':
        this.tone({ freq: 300, type: 'triangle', slide: 0.3, dur: 0.6, vol: 0.2 });
        this.whoosh({ dur: 0.5, vol: 0.12, from: 1200, to: 200 });
        break;
      case 'lantern': [60, 64, 67, 72].forEach((n, i) => this.piano(n, i * 0.08, 1.6, 0.12, this.sfxBus)); break;
      case 'glow': [72, 76, 79, 83, 86].forEach((n, i) => this.tone({ freq: midi(n), at: i * 0.05, dur: 0.9, vol: 0.06 })); this.whoosh({ dur: 0.7, vol: 0.06, from: 2000, to: 6000, q: 4 }); break;
      case 'spring': this.tone({ freq: 180, slide: 3, dur: 0.35, vol: 0.18 }); break;
      case 'petal': [79, 83, 86, 91].forEach((n, i) => this.bell(n, i * 0.09, 0.08)); break;
      case 'select': this.tone({ freq: 880, dur: 0.06, vol: 0.05 }); break;
      case 'confirm': this.tone({ freq: 660, slide: 1.5, dur: 0.15, vol: 0.08 }); break;
      case 'blip': this.tone({ freq: opt.freq || 520, type: 'triangle', dur: 0.04, vol: 0.025 }); break;
      case 'complete': [60, 64, 67, 72, 76, 79, 84].forEach((n, i) => this.bell(n, i * 0.09, 0.08)); break;
      case 'growl':
        this.tone({ freq: 70, type: 'sawtooth', dur: 0.7, vol: 0.12, attack: 0.1, slide: 0.8, filter: 400 });
        this.whoosh({ dur: 0.6, vol: 0.08, from: 200, to: 120, q: 3 });
        break;
      case 'roar':
        this.tone({ freq: 110, type: 'sawtooth', dur: 0.8, vol: 0.18, attack: 0.05, slide: 0.6, filter: 700 });
        this.whoosh({ dur: 0.7, vol: 0.14, from: 900, to: 250, q: 1 });
        break;
      case 'howl': this.tone({ freq: 300, type: 'triangle', dur: 1.4, vol: 0.12, attack: 0.3, slide: 1.6 }); this.tone({ freq: 450, type: 'sine', at: 0.2, dur: 1.2, vol: 0.06, attack: 0.3, slide: 1.4 }); break;
      case 'thud': this.tone({ freq: 90, dur: 0.35, vol: 0.3, slide: 0.4 }); this.whoosh({ dur: 0.25, vol: 0.12, from: 400, to: 120 }); break;
      case 'bramble': this.whoosh({ dur: 0.12, vol: 0.06, from: 2500, to: 900, q: 2 }); break;
      case 'dash': this.whoosh({ dur: 0.22, vol: 0.16, from: 800, to: 4000, q: 1.5 }); this.tone({ freq: 520, slide: 2, dur: 0.18, vol: 0.06 }); break;
      case 'splash': this.whoosh({ dur: 0.5, vol: 0.18, from: 1500, to: 300, q: 0.8 }); break;
      case 'hop': this.tone({ freq: 160, slide: 1.8, dur: 0.12, vol: 0.06 }); break;
      default:
    }
  }

  // ---------------------------------------------------------- music

  playMusic(name) {
    if (!this.ctx || this.song === name) return;
    this.stopMusic();
    const song = SONGS[name];
    if (!song) return;
    this.song = name;
    this.bar = 0;
    this.nextBar = this.ctx.currentTime + 0.2;
    let seed = song.seed;
    this.rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    this.timer = setInterval(() => this.schedule(song), 100);
  }

  stopMusic() {
    clearInterval(this.timer);
    this.timer = null;
    this.song = null;
  }

  schedule(song) {
    const beat = 60 / song.bpm;
    const barLen = beat * 4;
    while (this.nextBar < this.ctx.currentTime + 1.0) {
      const at = this.nextBar - this.ctx.currentTime;
      const [root, kind] = song.chords[this.bar % song.chords.length];
      const triad = TRIADS[kind].map((i) => root + i);
      if (song.pad) this.pad(triad.map((n) => n + 12), at, barLen * 1.1, 0.05);
      // bass + broken-chord left hand
      this.piano(root - 12, at, barLen, 0.1);
      const arp = [triad[0], triad[1], triad[2], triad[1] + 12, triad[2], triad[1], triad[0] + 12, triad[2]];
      arp.forEach((n, i) => this.piano(n, at + i * beat / 2, beat * 1.5, 0.045));
      // a wandering melody built from chord tones and the major pentatonic
      const pool = [...triad.map((n) => n + 24), triad[0] + 26, triad[0] + 33];
      for (let i = 0; i < 4; i++) {
        if (this.rand() > song.melody) continue;
        const n = pool[Math.floor(this.rand() * pool.length)];
        const len = this.rand() < 0.3 ? beat * 2 : beat;
        this.piano(n, at + i * beat + (this.rand() < 0.25 ? beat / 2 : 0), len * 1.6, 0.06);
      }
      if (song.drums) {
        for (let i = 0; i < 4; i++) {
          if (i % 2 === 0) this.tone({ freq: 120, at: at + i * beat, dur: 0.3, vol: 0.22, slide: 0.35, bus: this.musicBus });
          this.whoosh({ at: at + i * beat + beat / 2, dur: 0.06, vol: 0.05, from: 6000, to: 8000, q: 1, bus: this.musicBus });
        }
      }
      this.bar++;
      this.nextBar += barLen;
    }
  }
}

export const audio = new Audio();
