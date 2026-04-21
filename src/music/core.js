export const MAX_STEPS = 64;
export const PAGE = 16;
export const SCHED = 0.14;
export const LOOK = 20;
export const UNDO = 32;

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const rnd = () => Math.random();
export const pick = (a) => a[Math.floor(rnd() * a.length)];
export const lerp = (a, b, t) => a + (b - a) * t;

// ─── GENRE DNA ────────────────────────────────────────────────────────────────
export const GENRES = {
  techno: {
    bpm: [128, 140],
    kick: 'every4',
    swing: 0.02,
    atmosphere: 'dark industrial',
    kickFreq: 80,
    kickEnd: 30,
    kickDecay: 0.22,
    noiseColor: 'brown',
    modes: ['phrygian', 'minor'],
    density: 0.72,
    chaos: 0.35,
    bassMode: 'fm',
    synthMode: 'lead',
    fxProfile: { drive: 0.3, space: 0.4, tone: 0.6 },
    hatPattern: '16th',
    description: 'Dark mechanical pulse',
  },
  house: {
    bpm: [120, 130],
    kick: 'every4',
    swing: 0.06,
    atmosphere: 'warm Chicago',
    kickFreq: 90,
    kickEnd: 40,
    kickDecay: 0.2,
    noiseColor: 'pink',
    modes: ['dorian', 'mixo'],
    density: 0.65,
    chaos: 0.28,
    bassMode: 'sub',
    synthMode: 'rhodes',
    fxProfile: { drive: 0.1, space: 0.55, tone: 0.8 },
    hatPattern: 'offbeat',
    description: 'Warm soulful groove',
  },
  ambient: {
    bpm: [70, 90],
    kick: 'sparse',
    swing: 0.0,
    atmosphere: 'oceanic',
    kickFreq: 60,
    kickEnd: 25,
    kickDecay: 0.35,
    noiseColor: 'pink',
    modes: ['lydian', 'dorian'],
    density: 0.25,
    chaos: 0.55,
    bassMode: 'drone',
    synthMode: 'pad',
    fxProfile: { drive: 0.0, space: 0.9, tone: 0.7 },
    hatPattern: 'sparse',
    description: 'Textural spatial sound',
  },
  dnb: {
    bpm: [160, 180],
    kick: 'syncopated',
    swing: 0.04,
    atmosphere: 'jungle pressure',
    kickFreq: 95,
    kickEnd: 35,
    kickDecay: 0.14,
    noiseColor: 'white',
    modes: ['minor', 'dorian'],
    density: 0.78,
    chaos: 0.55,
    bassMode: 'grit',
    synthMode: 'glass',
    fxProfile: { drive: 0.35, space: 0.3, tone: 0.5 },
    hatPattern: 'breakbeat',
    description: 'Fast broken jungle',
  },
  acid: {
    bpm: [125, 138],
    kick: 'every4',
    swing: 0.05,
    atmosphere: '303 acid',
    kickFreq: 85,
    kickEnd: 32,
    kickDecay: 0.18,
    noiseColor: 'white',
    modes: ['phrygian', 'chroma'],
    density: 0.68,
    chaos: 0.65,
    bassMode: 'bit',
    synthMode: 'mist',
    fxProfile: { drive: 0.45, space: 0.35, tone: 0.4 },
    hatPattern: '16th',
    description: 'Squelching resonant acid',
  },
  industrial: {
    bpm: [130, 150],
    kick: 'every4',
    swing: 0.0,
    atmosphere: 'concrete noise',
    kickFreq: 70,
    kickEnd: 28,
    kickDecay: 0.28,
    noiseColor: 'brown',
    modes: ['chroma', 'phrygian'],
    density: 0.8,
    chaos: 0.75,
    bassMode: 'fold',
    synthMode: 'air',
    fxProfile: { drive: 0.55, space: 0.25, tone: 0.35 },
    hatPattern: 'noise',
    description: 'Harsh mechanical noise',
  },
  experimental: {
    bpm: [80, 160],
    kick: 'irregular',
    swing: 0.08,
    atmosphere: 'avant-garde',
    kickFreq: 100,
    kickEnd: 45,
    kickDecay: 0.25,
    noiseColor: 'pink',
    modes: ['chroma', 'lydian'],
    density: 0.45,
    chaos: 0.88,
    bassMode: 'wet',
    synthMode: 'supersaw',
    fxProfile: { drive: 0.2, space: 0.7, tone: 0.6 },
    hatPattern: 'random',
    description: 'Unpredictable textural',
  },
  cinematic: {
    bpm: [85, 110],
    kick: 'sparse',
    swing: 0.03,
    atmosphere: 'epic orchestral',
    kickFreq: 75,
    kickEnd: 30,
    kickDecay: 0.32,
    noiseColor: 'pink',
    modes: ['minor', 'lydian'],
    density: 0.38,
    chaos: 0.35,
    bassMode: 'drone',
    synthMode: 'ether',
    fxProfile: { drive: 0.05, space: 0.85, tone: 0.85 },
    hatPattern: 'sparse',
    description: 'Dramatic cinematic score',
  },
};

export const GENRE_NAMES = Object.keys(GENRES);

// ─── MUSICAL THEORY ───────────────────────────────────────────────────────────
export const MODES = {
  minor: {
    b: ['C2', 'D2', 'Eb2', 'F2', 'G2', 'Ab2', 'Bb2', 'C3', 'D3', 'Eb3'],
    s: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5', 'D5', 'Eb5'],
  },
  phrygian: {
    b: ['C2', 'Db2', 'Eb2', 'F2', 'G2', 'Ab2', 'Bb2', 'C3', 'Db3', 'Eb3'],
    s: ['C4', 'Db4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5', 'Db5', 'Eb5'],
  },
  dorian: {
    b: ['C2', 'D2', 'Eb2', 'F2', 'G2', 'A2', 'Bb2', 'C3', 'D3', 'Eb3'],
    s: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'A4', 'Bb4', 'C5', 'D5', 'Eb5'],
  },
  chroma: {
    b: ['C2', 'Db2', 'D2', 'Eb2', 'E2', 'F2', 'G2', 'Ab2', 'A2', 'Bb2'],
    s: ['C4', 'Db4', 'D4', 'Eb4', 'E4', 'F4', 'G4', 'Ab4', 'A4', 'Bb4'],
  },
  mixo: {
    b: ['C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'Bb2', 'C3', 'D3', 'E3'],
    s: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'Bb4', 'C5', 'D5', 'E5'],
  },
  lydian: {
    b: ['C2', 'D2', 'E2', 'F#2', 'G2', 'A2', 'B2', 'C3', 'D3', 'E3'],
    s: ['C4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'],
  },
};

export const CHORD_PROGS = {
  minor: [
    [{ r: 0, t: 2, f: 4 }, { r: 5, t: 0, f: 2 }, { r: 3, t: 5, f: 0 }, { r: 4, t: 0, f: 2 }],
    [{ r: 0, t: 2, f: 4 }, { r: 3, t: 5, f: 0 }, { r: 4, t: 0, f: 2 }, { r: 0, t: 2, f: 4 }],
    [{ r: 0, t: 2, f: 4 }, { r: 0, t: 2, f: 4 }, { r: 3, t: 5, f: 0 }, { r: 3, t: 5, f: 0 }],
    [{ r: 0, t: 2, f: 4 }, { r: 4, t: 0, f: 2 }, { r: 3, t: 5, f: 0 }, { r: 6, t: 1, f: 3 }],
  ],
  phrygian: [
    [{ r: 0, t: 1, f: 3 }, { r: 1, t: 3, f: 5 }, { r: 3, t: 5, f: 0 }, { r: 1, t: 3, f: 5 }],
    [{ r: 0, t: 1, f: 3 }, { r: 0, t: 1, f: 3 }, { r: 1, t: 3, f: 5 }, { r: 1, t: 3, f: 5 }],
  ],
  dorian: [
    [{ r: 0, t: 2, f: 4 }, { r: 5, t: 0, f: 2 }, { r: 3, t: 5, f: 0 }, { r: 4, t: 0, f: 2 }],
    [{ r: 0, t: 2, f: 4 }, { r: 4, t: 6, f: 1 }, { r: 3, t: 5, f: 0 }, { r: 0, t: 2, f: 4 }],
  ],
  mixo: [
    [{ r: 0, t: 2, f: 4 }, { r: 6, t: 1, f: 3 }, { r: 4, t: 6, f: 1 }, { r: 0, t: 2, f: 4 }],
    [{ r: 0, t: 2, f: 4 }, { r: 0, t: 2, f: 4 }, { r: 6, t: 1, f: 3 }, { r: 6, t: 1, f: 3 }],
  ],
  lydian: [
    [{ r: 0, t: 2, f: 4 }, { r: 3, t: 5, f: 0 }, { r: 4, t: 6, f: 1 }, { r: 2, t: 4, f: 6 }],
  ],
  chroma: [
    [{ r: 0, t: 1, f: 4 }, { r: 3, t: 6, f: 1 }, { r: 7, t: 2, f: 5 }, { r: 4, t: 9, f: 2 }],
    [{ r: 0, t: 3, f: 6 }, { r: 1, t: 4, f: 7 }, { r: 2, t: 5, f: 8 }, { r: 0, t: 3, f: 6 }],
  ],
};

export const SECTIONS = {
  intro:   { kM: 0.3, sM: 0.2, hM: 0.4, bM: 0.5, syM: 0.6, vel: 'rise',   pb: 0.45, lb: 3,   bars: 4 },
  build:   { kM: 0.7, sM: 0.6, hM: 1.0, bM: 0.9, syM: 0.8, vel: 'rise',   pb: 0.6,  lb: 1.5, bars: 4 },
  drop:    { kM: 1.3, sM: 1.1, hM: 0.9, bM: 1.2, syM: 0.8, vel: 'accent', pb: 0.85, lb: 1,   bars: 8 },
  groove:  { kM: 1.0, sM: 1.0, hM: 1.0, bM: 1.0, syM: 0.9, vel: 'groove', pb: 0.72, lb: 1.2, bars: 8 },
  break:   { kM: 0.1, sM: 0.3, hM: 0.2, bM: 0.4, syM: 1.5, vel: 'flat',   pb: 0.4,  lb: 4,   bars: 4 },
  tension: { kM: 0.5, sM: 0.7, hM: 1.4, bM: 1.0, syM: 1.1, vel: 'accent', pb: 0.55, lb: 1.5, bars: 4 },
  outro:   { kM: 0.4, sM: 0.3, hM: 0.3, bM: 0.3, syM: 0.4, vel: 'fall',   pb: 0.35, lb: 2.5, bars: 4 },
  fill:    { kM: 1.6, sM: 1.5, hM: 0.6, bM: 0.7, syM: 0.4, vel: 'accent', pb: 0.75, lb: 0.5, bars: 2 },
};

export const SONG_ARCS = [
  ['intro', 'build', 'drop', 'groove', 'break', 'build', 'drop', 'outro'],
  ['intro', 'groove', 'tension', 'drop', 'break', 'drop', 'outro'],
  ['build', 'drop', 'groove', 'fill', 'drop', 'break', 'outro'],
  ['intro', 'tension', 'build', 'drop', 'groove', 'drop', 'outro'],
  ['groove', 'groove', 'break', 'tension', 'drop', 'groove', 'outro'],
];

export const GROOVE_MAPS = {
  steady: { kB: 0.22, sB: 0.16, hB: 0.58, bB: 0.22, syB: 0.12 },
  broken: { kB: 0.28, sB: 0.14, hB: 0.46, bB: 0.28, syB: 0.18 },
  bunker: { kB: 0.34, sB: 0.1,  hB: 0.34, bB: 0.24, syB: 0.14 },
  float:  { kB: 0.16, sB: 0.12, hB: 0.5,  bB: 0.18, syB: 0.28 },
};

export const NOTE_FREQ = {
  C2: 65.41, Db2: 69.3, D2: 73.42, Eb2: 77.78, E2: 82.41, F2: 87.31, 'F#2': 92.5, G2: 98, Ab2: 103.83, A2: 110, Bb2: 116.54, B2: 123.47,
  C3: 130.81, Db3: 138.59, D3: 146.83, Eb3: 155.56, E3: 164.81, F3: 174.61, G3: 196, A3: 220, Bb3: 233.08, B3: 246.94,
  C4: 261.63, Db4: 277.18, D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23, 'F#4': 370, G4: 392, Ab4: 415.3, A4: 440, Bb4: 466.16, B4: 493.88,
  C5: 523.25, Db5: 554.37, D5: 587.33, Eb5: 622.25, F5: 698.46, G5: 783.99, A5: 880,
};

export const NOTE_MIDI = {
  C2: 36, D2: 38, Eb2: 39, E2: 40, F2: 41, 'F#2': 42, G2: 43, Ab2: 44, A2: 45, Bb2: 46,
  C3: 48, D3: 50, Eb3: 51, G3: 55, A3: 57,
  C4: 60, D4: 62, Eb4: 63, E4: 64, F4: 65, G4: 67, Ab4: 68, A4: 69, Bb4: 70,
  C5: 72, D5: 74, Eb5: 75, G5: 79, A5: 81,
};

export const CHROMA = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export const parseNoteName = (n) => {
  const m = String(n || '').match(/^([A-G](?:b|#)?)(-?\d+)$/);
  return m ? { name: m[1], oct: Number(m[2]) } : null;
};

export const transposeNote = (note, semitones) => {
  const parsed = parseNoteName(note);
  if (!parsed) return note;
  const idx = CHROMA.indexOf(parsed.name);
  if (idx === -1) return note;
  const abs = (parsed.oct * 12) + idx + semitones;
  const nextIdx = ((abs % 12) + 12) % 12;
  const nextOct = Math.floor(abs / 12);
  return `${CHROMA[nextIdx]}${nextOct}`;
};

export const mkSteps = () =>
  Array.from({ length: MAX_STEPS }, () => ({ on: false, p: 1, v: 1, l: 1 }));

export const mkNotes = (d = 'C2') =>
  Array.from({ length: MAX_STEPS }, () => d);

// ─── MUSIC GENERATION ENGINE ──────────────────────────────────────────────────
export function chordNotes(chord, pool) {
  const n = pool.length;
  return [pool[chord.r % n], pool[chord.t % n], pool[chord.f % n]].filter(Boolean);
}

export function voiceLead(cur, pool) {
  if (!pool.length) return cur;
  const i = pool.indexOf(cur);
  if (i === -1) return pool[Math.floor(rnd() * pool.length)];
  const r = rnd();
  if (r < 0.5) return pool[Math.min(i + 1, pool.length - 1)];
  if (r < 0.78) return pool[Math.max(i - 1, 0)];
  return pool[clamp(i + (rnd() < 0.5 ? 2 : -2), 0, pool.length - 1)];
}

export function arp(notes, mode, step) {
  if (!notes || !notes.length) return 'C4';
  const n = notes.length;
  switch (mode) {
    case 'up':
      return notes[step % n];
    case 'down':
      return notes[n - 1 - (step % n)];
    case 'updown': {
      const p = Math.max(1, n * 2 - 2);
      const s = step % p;
      return s < n ? notes[s] : notes[p - s];
    }
    case 'outside': {
      const s = step % n;
      return s % 2 === 0 ? notes[Math.floor(s / 2)] : notes[n - 1 - Math.floor(s / 2)];
    }
    default:
      return notes[step % n];
  }
}

export function velCurve(type, i, total, pw) {
  const t = i / total;
  switch (type) {
    case 'rise':
      return clamp(0.3 + t * 0.7 * pw, 0.2, 1);
    case 'fall':
      return clamp(0.95 - t * 0.6, 0.15, 1);
    case 'accent':
      return i % 4 === 0 ? clamp(0.88 + pw * 0.12, 0.65, 1) : clamp(0.48 + pw * 0.28, 0.25, 0.82);
    case 'groove':
      return i % 8 === 0 ? 0.95 : i % 4 === 0 ? 0.76 : i % 2 === 0 ? 0.6 : 0.42 + rnd() * 0.18;
    case 'flat':
      return clamp(0.55 + pw * 0.2, 0.38, 0.82);
    default:
      return clamp(0.45 + pw * 0.55, 0.28, 1);
  }
}

// ─── MELODIC PHRASE BUILDER ───────────────────────────────────────────────────
//
// Builds a line of `steps` notes that:
//   - derives a 4-note motif from the first chord, starting from startNote
//   - applies arp() to chord tones at each step for the chosen arpeMode
//   - uses voice leading (±1–2 steps in scale) for smooth motion
//   - introduces passing tones via chaos probability
//   - varies note lengths (note: short, long, held) driven by section lb
//   - tiles the result to fill MAX_STEPS
//
export function buildMelodicLine(pool, chordProgression, steps, chaos, arpeMode, lenBias, startNote) {
  const line     = mkNotes(pool[0]);
  const lengths  = Array(steps).fill(1);
  const chordLen = Math.max(1, Math.floor(steps / chordProgression.length));

  // Build motif anchored to startNote
  const firstPool = chordNotes(chordProgression[0], pool);
  const startIdx  = startNote ? Math.max(0, pool.indexOf(startNote)) : 0;
  let   prev      = pool[clamp(startIdx, 0, pool.length - 1)];

  const MOTIF_LEN = 4;
  const motif     = [];

  for (let m = 0; m < MOTIF_LEN; m++) {
    const r = rnd();
    if (r < 0.10) {
      // Rest — repeat previous (held)
      motif.push(prev);
    } else if (r < 0.25) {
      // Repeat
      motif.push(prev);
    } else {
      // Move to nearest chord tone using arp mode
      const arpNote = arp(firstPool, arpeMode, m);
      const nearest = pool.reduce((best, n) =>
        Math.abs(pool.indexOf(n) - pool.indexOf(arpNote)) <
        Math.abs(pool.indexOf(best) - pool.indexOf(arpNote)) ? n : best
      , firstPool[0] || pool[0]);
      prev = nearest;
      motif.push(nearest);
    }
  }

  let lastNote = motif[0] || pool[0];

  for (let i = 0; i < steps; i++) {
    const ci    = Math.floor(i / chordLen) % chordProgression.length;
    const chord = chordProgression[ci];
    const cn    = chordNotes(chord, pool);
    if (!cn.length) { line[i] = lastNote; continue; }

    // Tension: on the penultimate chord, bias toward scale degrees that
    // want to resolve (7th → root, 4th → 3rd).
    const isPreResolution = ci === chordProgression.length - 2;
    const isResolution    = ci === 0 && i > 0;

    let note;
    const r = rnd();

    if (isResolution && r < 0.6) {
      // Resolution — move toward root of first chord
      const root = chordNotes(chordProgression[0], pool)[0] || pool[0];
      note = pool.reduce((best, n) =>
        Math.abs(pool.indexOf(n) - pool.indexOf(root)) <
        Math.abs(pool.indexOf(best) - pool.indexOf(root)) ? n : best
      , lastNote);
    } else if (isPreResolution && r < 0.45) {
      // Tension — pick a note one scale step above the resolution target
      const resRoot = chordNotes(chordProgression[0], pool)[0] || pool[0];
      const resIdx  = pool.indexOf(resRoot);
      note = pool[clamp(resIdx + 1, 0, pool.length - 1)];
    } else if (r < 0.65) {
      // Motif transposed to current chord via nearest chord tone
      const motifNote = motif[i % MOTIF_LEN];
      note = cn.reduce((best, n) =>
        Math.abs(pool.indexOf(n) - pool.indexOf(motifNote)) <
        Math.abs(pool.indexOf(best) - pool.indexOf(motifNote)) ? n : best
      , arp(cn, arpeMode, i));
    } else if (r < 0.65 + chaos * 0.20) {
      // Passing tone / chromatic approach (chaos-scaled)
      note = pick(pool);
    } else {
      // Voice lead ±1–2 from last note, staying in chord
      note = voiceLead(lastNote, cn);
    }

    line[i]   = note;
    lastNote  = note;

    // Note lengths: section drives the bias
    const lr = rnd();
    let   l  = lenBias;
    if      (lr < 0.42) l = lenBias;
    else if (lr < 0.62) l = lenBias * 2;
    else if (lr < 0.80) l = Math.max(0.5, lenBias * 0.5);
    else                l = Math.min(lenBias * 3, 8);
    lengths[i] = l;
  }

  // Tile to MAX_STEPS
  for (let i = steps; i < MAX_STEPS; i++) {
    line[i] = line[i % Math.max(1, steps)];
  }

  return { line, lengths, lastNote };
}

export function buildSection(genre, sectionName, modeName, progression, arpeMode, prevBass) {
  const sec  = SECTIONS[sectionName] || SECTIONS.groove;
  const gd   = GENRES[genre];
  const grooveName =
    gd.density > 0.65 && gd.chaos > 0.4 ? 'bunker'
    : gd.chaos > 0.6                     ? 'broken'
    : gd.density < 0.4                   ? 'float'
    :                                      'steady';

  const groove = GROOVE_MAPS[grooveName];
  const mode   = MODES[modeName] || MODES.minor;
  const bp     = mode.b;
  const sp     = mode.s;

  const laneLen = { kick: 16, snare: 16, hat: 32, bass: 32, synth: 32 };
  if (genre === 'dnb') {
    laneLen.hat = 48;
    laneLen.bass = 32;
    laneLen.synth = 64;
  }
  if (genre === 'ambient') {
    laneLen.kick = 32;
    laneLen.bass = 64;
    laneLen.synth = 64;
  }
  if (genre === 'acid') {
    laneLen.bass = 16;
    laneLen.synth = 32;
  }
  if (genre === 'cinematic') {
    laneLen.bass = 64;
    laneLen.synth = 64;
  }

  const density = gd.density;
  const chaos = gd.chaos;

  const bassLb =
    sec.lb * (sectionName === 'break' ? 2.5 : sectionName === 'drop' ? 0.8 : 1);
  const synthLb =
    sec.lb * (sectionName === 'break' ? 3 : sectionName === 'ambient' ? 4 : 1.2);

  const { line: bassLine, lengths: bassLengths, lastNote: lastBassNote } = buildMelodicLine(
    bp, progression, laneLen.bass, chaos, arpeMode, bassLb, prevBass,
  );

  const { line: synthLine, lengths: synthLengths } = buildMelodicLine(
    sp, progression, laneLen.synth, chaos * 0.7, arpeMode, synthLb, null,
  );

  const p = {
    kick: mkSteps(),
    snare: mkSteps(),
    hat: mkSteps(),
    bass: mkSteps(),
    synth: mkSteps(),
  };

  const bar = 16;
  const phraseW = [1, 0.75, 0.92, 0.68];

  for (const lane of ['kick', 'snare', 'hat', 'bass', 'synth']) {
    const ll = laneLen[lane];
    const lmKey =
      lane === 'kick'
        ? 'kM'
        : lane === 'snare'
          ? 'sM'
          : lane === 'hat'
            ? 'hM'
            : lane === 'bass'
              ? 'bM'
              : 'syM';

    const lm = sec[lmKey] || 1;
    const dm = density * lm;
    const maxDensity = lane === 'bass' ? 0.55 : lane === 'synth' ? 0.45 : 1.0;

    for (let i = 0; i < ll; i += 1) {
      const pos = i % bar;
      const pb = Math.floor(i / 8) % 4;
      const strong = pos === 0 || pos === 8;
      const bb = pos === 4 || pos === 12;
      const ob = pos % 2 === 1;
      const pw = phraseW[pb];
      let hit = false;

      if (lane === 'kick') {
        if (gd.kick === 'every4' && pos % 4 === 0) hit = true;
        else if (gd.kick === 'syncopated' && (pos === 0 || pos === 10 || pos === 14)) hit = true;
        else if (gd.kick === 'sparse' && (pos === 0 || pos === 12)) hit = true;
        else if (gd.kick === 'irregular') hit = pos === 0 || (rnd() < dm * 0.3 * pw);
        else if (strong || rnd() < (groove.kB + dm * 0.18) * pw) hit = true;
      } else if (lane === 'snare') {
        if (gd.hatPattern === 'breakbeat') {
          hit = rnd() < (groove.sB + dm * 0.15) * (1 + pb * 0.2);
        } else if (bb || rnd() < (groove.sB + dm * 0.08 + (bb ? 0.28 : 0)) * (1.05 - pw * 0.16)) {
          hit = true;
        }
      } else if (lane === 'hat') {
        const hatP = gd.hatPattern;
        if (hatP === '16th') hit = true;
        else if (hatP === 'offbeat') hit = ob;
        else if (hatP === 'breakbeat') hit = rnd() < (groove.hB + dm * 0.22) * (0.8 + pw * 0.25);
        else if (hatP === 'noise') hit = rnd() < 0.55 + dm * 0.18;
        else if (hatP === 'sparse') hit = rnd() < 0.2 + dm * 0.1;
        else hit = rnd() < (groove.hB + dm * 0.18) * (0.82 + pw * 0.22);

        if (hit && rnd() < chaos * 0.3) p.hat[i].p = 0.45 + rnd() * 0.4;
      } else if (lane === 'bass') {
        const phraseAnchor = pos === 0 || pos === 4 || pos === 8 || pos === 12;
        const prob = phraseAnchor ? 0.82 * lm : (groove.bB + dm * 0.12) * pw * 0.7;
        hit = rnd() < Math.min(prob, maxDensity);
      } else if (lane === 'synth') {
        const phraseOn = pos === 2 || pos === 6 || pos === 10 || pos === 14;
        const prob = phraseOn ? 0.65 * lm : (groove.syB + dm * 0.08) * pw * 0.5;
        hit = (rnd() < Math.min(prob, maxDensity) && !strong)
          || (pb === 3 && rnd() < 0.18 + chaos * 0.15);
      }

      if (hit) {
        p[lane][i].on = true;
        p[lane][i].p = clamp(sec.pb + rnd() * (1 - sec.pb), sec.pb, 1);
        p[lane][i].v = clamp(velCurve(sec.vel, i, ll, pw), 0.22, 1);

        if (lane === 'bass') p[lane][i].l = bassLengths[i] || sec.lb;
        else if (lane === 'synth') p[lane][i].l = synthLengths[i] || sec.lb;
        else p[lane][i].l = 1;
      }
    }
  }

  for (let i = 0; i < laneLen.kick; i += 16) {
    p.kick[i].on = true;
  }

  if (gd.kick !== 'sparse' && sectionName !== 'break') {
    for (let i = 0; i < laneLen.snare; i += 16) {
      if (i + 4 < laneLen.snare) p.snare[i + 4].on = true;
      if (i + 12 < laneLen.snare) p.snare[i + 12].on = true;
    }
  }

  for (const lane of ['bass', 'synth']) {
    const ll = laneLen[lane];
    for (let i = 0; i < ll; i += 1) {
      if (p[lane][i].on && p[lane][i].l > 1) {
        const holdEnd = Math.min(ll - 1, i + Math.floor(p[lane][i].l));
        for (let j = i + 1; j <= holdEnd; j += 1) {
          p[lane][j].tied = true;
          p[lane][j].on = false;
        }
      }
    }
  }

  const mp = Math.floor(chaos * 5);
  for (let m = 0; m < mp; m += 1) {
    const ln = pick(['kick', 'snare', 'hat']);
    const ll = laneLen[ln];
    const pos = Math.floor(rnd() * ll);

    if (ln === 'hat') {
      p.hat[pos].on = !p.hat[pos].on;
    } else if (ln === 'kick') {
      if (pos % 4 !== 0) p.kick[pos].on = rnd() < 0.35 + chaos * 0.18;
    } else {
      p.snare[pos].on = !p.snare[pos].on && pos % 4 !== 0;
    }
  }

  const lb = lastBassNote || bassLine[laneLen.bass - 1] || bp[0];

  return {
    patterns: p,
    bassLine,
    synthLine,
    laneLen,
    lastBass: lb,
  };
}

export function buildSong(genre) {
  const gd = GENRES[genre];
  const modeName = pick(gd.modes);
  const progPool = CHORD_PROGS[modeName] || CHORD_PROGS.minor;
  const progression = pick(progPool);
  const arpeMode = pick(['up', 'down', 'updown', 'outside']);
  const bpm = Math.round(gd.bpm[0] + rnd() * (gd.bpm[1] - gd.bpm[0]));
  const arc = pick(SONG_ARCS);

  const sections = arc.map((name) => ({
    name,
    modeName,
    progression,
    arpeMode,
    genre,
  }));

  return {
    genre,
    modeName,
    progression,
    arpeMode,
    bpm,
    arc,
    sections,
    currentSection: 0,
  };
}

// ─── GROOVE ACCENT TABLE ──────────────────────────────────────────────────────
export function grooveAccent(profile, lane, step, amount) {
  const pos = step % 16;

  const T = {
    steady: {
      kick:  [1.2, 1, 0.92, 0.96, 1, 0.94, 0.98, 0.96, 1.18, 0.98, 0.92, 0.96, 1.02, 0.96, 0.98, 0.96],
      snare: [0.92, 0.9, 0.92, 0.9, 1.16, 0.92, 0.92, 0.9, 0.92, 0.9, 0.92, 0.9, 1.12, 0.92, 0.92, 0.9],
      hat:   [0.92, 1.02, 0.9, 1.04, 0.94, 1.02, 0.9, 1.06, 0.92, 1.02, 0.9, 1.04, 0.94, 1.02, 0.9, 1.08],
      bass:  [1.1, 0.96, 0.98, 1.02, 0.96, 0.94, 1, 1.04, 1.08, 0.96, 0.98, 1.02, 0.96, 0.94, 1, 1.04],
      synth: [0.96, 1, 1.04, 1, 0.96, 1, 1.08, 1, 0.96, 1, 1.04, 1, 0.96, 1, 1.12, 1],
    },
    broken: {
      kick:  [1.22, 0.88, 1.04, 0.84, 0.96, 1.06, 0.9, 1.02, 1.14, 0.86, 1.08, 0.82, 0.94, 1.04, 0.9, 1.06],
      snare: [0.88, 0.94, 0.9, 1, 1.12, 0.9, 0.96, 0.9, 0.88, 1, 0.9, 0.96, 1.1, 0.88, 1, 0.92],
      hat:   [0.84, 1.08, 0.9, 1.14, 0.86, 1.02, 0.92, 1.12, 0.84, 1.08, 0.9, 1.14, 0.86, 1.02, 0.92, 1.16],
      bass:  [1.06, 0.94, 1.1, 0.88, 1, 0.94, 1.08, 0.9, 1.04, 0.94, 1.1, 0.88, 1, 0.94, 1.08, 0.92],
      synth: [0.92, 1.04, 1.12, 0.9, 0.94, 1.08, 1.14, 0.88, 0.92, 1.04, 1.1, 0.9, 0.94, 1.08, 1.16, 0.86],
    },
    bunker: {
      kick:  [1.28, 0.92, 0.94, 0.9, 1.02, 0.92, 0.94, 0.9, 1.24, 0.92, 0.94, 0.9, 1.04, 0.92, 0.94, 0.9],
      snare: [0.9, 0.9, 0.92, 0.9, 1.08, 0.9, 0.92, 0.9, 0.9, 0.9, 0.92, 0.9, 1.06, 0.9, 0.92, 0.9],
      hat:   [0.88, 0.98, 0.9, 1.02, 0.88, 0.98, 0.9, 1.04, 0.88, 0.98, 0.9, 1.02, 0.88, 0.98, 0.9, 1.06],
      bass:  [1.16, 0.94, 0.96, 1, 1.04, 0.94, 0.96, 1.02, 1.14, 0.94, 0.96, 1, 1.06, 0.94, 0.96, 1.04],
      synth: [0.9, 0.98, 1.02, 0.96, 0.9, 0.98, 1.06, 0.96, 0.9, 0.98, 1.02, 0.96, 0.9, 0.98, 1.1, 0.96],
    },
    float: {
      kick:  [1.12, 0.98, 0.94, 0.98, 1.0, 1.0, 0.94, 1.0, 1.08, 0.98, 0.94, 0.98, 1.0, 1.0, 0.94, 1.02],
      snare: [0.96, 0.94, 0.96, 0.94, 1.08, 0.96, 0.96, 0.94, 0.96, 0.94, 0.96, 0.94, 1.06, 0.96, 0.96, 0.94],
      hat:   [0.96, 1.0, 0.98, 1.02, 0.96, 1.0, 0.98, 1.04, 0.96, 1.0, 0.98, 1.02, 0.96, 1.0, 0.98, 1.06],
      bass:  [1.04, 0.98, 1.0, 1.02, 1.0, 0.98, 1.0, 1.02, 1.04, 0.98, 1.0, 1.02, 1.0, 0.98, 1.0, 1.04],
      synth: [0.98, 1.0, 1.02, 1.0, 0.98, 1.0, 1.04, 1.0, 0.98, 1.0, 1.02, 1.0, 0.98, 1.0, 1.06, 1.0],
    },
  };

  const table = T[profile] || T.steady;
  const laneTable = table[lane] || table.kick;
  const base = laneTable[pos] || 1;
  return lerp(1, base, clamp(amount, 0, 1));
}