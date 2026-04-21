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
    bpm: [128, 140], kick: 'every4', swing: 0.02, atmosphere: 'dark industrial',
    kickFreq: 80, kickEnd: 30, kickDecay: 0.22, noiseColor: 'brown',
    modes: ['phrygian', 'minor'], density: 0.72, chaos: 0.35,
    bassMode: 'fm', synthMode: 'lead',
    fxProfile: { drive: 0.3, space: 0.4, tone: 0.6 },
    hatPattern: '16th', description: 'Dark mechanical pulse',
  },
  house: {
    bpm: [120, 130], kick: 'every4', swing: 0.06, atmosphere: 'warm Chicago',
    kickFreq: 90, kickEnd: 40, kickDecay: 0.2, noiseColor: 'pink',
    modes: ['dorian', 'mixo'], density: 0.65, chaos: 0.28,
    bassMode: 'sub', synthMode: 'rhodes',
    fxProfile: { drive: 0.1, space: 0.55, tone: 0.8 },
    hatPattern: 'offbeat', description: 'Warm soulful groove',
  },
  ambient: {
    bpm: [70, 90], kick: 'sparse', swing: 0.0, atmosphere: 'oceanic',
    kickFreq: 60, kickEnd: 25, kickDecay: 0.35, noiseColor: 'pink',
    modes: ['lydian', 'dorian'], density: 0.25, chaos: 0.55,
    bassMode: 'drone', synthMode: 'pad',
    fxProfile: { drive: 0.0, space: 0.9, tone: 0.7 },
    hatPattern: 'sparse', description: 'Textural spatial sound',
  },
  dnb: {
    bpm: [160, 180], kick: 'syncopated', swing: 0.04, atmosphere: 'jungle pressure',
    kickFreq: 95, kickEnd: 35, kickDecay: 0.14, noiseColor: 'white',
    modes: ['minor', 'dorian'], density: 0.78, chaos: 0.55,
    bassMode: 'reese', synthMode: 'glass',
    fxProfile: { drive: 0.35, space: 0.3, tone: 0.5 },
    hatPattern: 'breakbeat', description: 'Fast broken jungle',
  },
  acid: {
    bpm: [125, 138], kick: 'every4', swing: 0.05, atmosphere: '303 acid',
    kickFreq: 85, kickEnd: 32, kickDecay: 0.18, noiseColor: 'white',
    modes: ['phrygian', 'chroma'], density: 0.68, chaos: 0.65,
    bassMode: 'acid303', synthMode: 'stab',
    fxProfile: { drive: 0.45, space: 0.35, tone: 0.4 },
    hatPattern: '16th', description: 'Squelching resonant acid',
  },
  industrial: {
    bpm: [130, 150], kick: 'every4', swing: 0.0, atmosphere: 'concrete noise',
    kickFreq: 70, kickEnd: 28, kickDecay: 0.28, noiseColor: 'brown',
    modes: ['chroma', 'phrygian'], density: 0.8, chaos: 0.75,
    bassMode: 'moog', synthMode: 'air',
    fxProfile: { drive: 0.55, space: 0.25, tone: 0.35 },
    hatPattern: 'noise', description: 'Harsh mechanical noise',
  },
  experimental: {
    bpm: [80, 160], kick: 'irregular', swing: 0.08, atmosphere: 'avant-garde',
    kickFreq: 100, kickEnd: 45, kickDecay: 0.25, noiseColor: 'pink',
    modes: ['chroma', 'lydian'], density: 0.45, chaos: 0.88,
    bassMode: 'wet', synthMode: 'vox',
    fxProfile: { drive: 0.2, space: 0.7, tone: 0.6 },
    hatPattern: 'random', description: 'Unpredictable textural',
  },
  cinematic: {
    bpm: [85, 110], kick: 'sparse', swing: 0.03, atmosphere: 'epic orchestral',
    kickFreq: 75, kickEnd: 30, kickDecay: 0.32, noiseColor: 'pink',
    modes: ['minor', 'lydian'], density: 0.38, chaos: 0.35,
    bassMode: 'upright', synthMode: 'ether',
    fxProfile: { drive: 0.05, space: 0.85, tone: 0.85 },
    hatPattern: 'sparse', description: 'Dramatic cinematic score',
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
// Builds a line of `steps` notes with:
//   - 8-note motif (double the previous 4) for more musical variety
//   - Progressive variation: motif transforms slightly each time it repeats
//   - Tension/resolution: penultimate chord → leading tone, first chord → root
//   - Contrapuntal offset option: if isCounterpoint, hit off-beats vs the motif
//   - Voice leading ±1-2 scale steps with chord-tone bias
//   - Passing tones scaled by chaos parameter
//   - Note lengths driven by section lenBias
//
export function buildMelodicLine(
  pool, chordProgression, steps, chaos, arpeMode, lenBias, startNote,
  isCounterpoint = false,
) {
  const line     = mkNotes(pool[0]);
  const lengths  = Array(steps).fill(1);
  const chordLen = Math.max(1, Math.floor(steps / chordProgression.length));

  // ── Build 8-note motif ───────────────────────────────────────────────────────
  const firstPool = chordNotes(chordProgression[0], pool);
  const startIdx  = startNote ? Math.max(0, pool.indexOf(startNote)) : 0;
  let   prev      = pool[clamp(startIdx, 0, pool.length - 1)];

  const MOTIF_LEN = 8;
  const motif     = [];

  for (let m = 0; m < MOTIF_LEN; m++) {
    const r = rnd();
    if (r < 0.08) {
      // Rest (held) — keep prev
      motif.push(prev);
    } else if (r < 0.22) {
      // Exact repeat
      motif.push(prev);
    } else if (r < 0.55) {
      // Arp-based movement on chord tones
      const arpNote = arp(firstPool, arpeMode, m);
      const nearest = pool.reduce((best, n) =>
        Math.abs(pool.indexOf(n) - pool.indexOf(arpNote)) <
        Math.abs(pool.indexOf(best) - pool.indexOf(arpNote)) ? n : best
      , firstPool[0] || pool[0]);
      prev = nearest;
      motif.push(nearest);
    } else {
      // Step-wise voice lead within first chord
      const stepped = voiceLead(prev, firstPool);
      prev = stepped;
      motif.push(stepped);
    }
  }

  // ── Build variation of motif (shift each note ±1 scale degree) ────────────
  // Used on second and subsequent repetitions of the motif for development.
  const motifVariant = motif.map(n => {
    const idx = pool.indexOf(n);
    if (idx === -1) return n;
    const delta = rnd() < 0.5 ? 1 : -1;
    return pool[clamp(idx + delta, 0, pool.length - 1)];
  });

  let lastNote     = motif[0] || pool[0];
  let motifRepeat  = 0; // counts how many full motif cycles we've done

  for (let i = 0; i < steps; i++) {
    const ci    = Math.floor(i / chordLen) % chordProgression.length;
    const chord = chordProgression[ci];
    const cn    = chordNotes(chord, pool);
    if (!cn.length) { line[i] = lastNote; continue; }

    // Track motif repetitions for progressive variation
    if (i > 0 && i % MOTIF_LEN === 0) motifRepeat++;
    const useVariant = motifRepeat >= 2 && rnd() < 0.5;
    const activMotif = useVariant ? motifVariant : motif;

    // Contrapuntal offset: synth hits where bass doesn't and vice versa
    const motifPos       = i % MOTIF_LEN;
    const isMotifBeat    = motifPos % 2 === 0;
    const contraSkip     = isCounterpoint && isMotifBeat && rnd() < 0.55;

    const isPreResolution = ci === chordProgression.length - 2;
    const isResolution    = ci === 0 && i >= chordLen;

    let note;
    const r = rnd();

    if (contraSkip) {
      // In counterpoint mode, prefer off-beat positions — use voice lead
      note = voiceLead(lastNote, cn);
    } else if (isResolution && r < 0.65) {
      // Resolution: move toward root of first chord
      const root = chordNotes(chordProgression[0], pool)[0] || pool[0];
      note = pool.reduce((best, n) =>
        Math.abs(pool.indexOf(n) - pool.indexOf(root)) <
        Math.abs(pool.indexOf(best) - pool.indexOf(root)) ? n : best
      , lastNote);
    } else if (isPreResolution && r < 0.50) {
      // Tension: one step above resolution root (leading tone)
      const resRoot = chordNotes(chordProgression[0], pool)[0] || pool[0];
      const resIdx  = pool.indexOf(resRoot);
      note = pool[clamp(resIdx + 1, 0, pool.length - 1)];
    } else if (r < 0.60) {
      // Motif (or variant) transposed to current chord
      const motifNote = activMotif[motifPos];
      note = cn.reduce((best, n) =>
        Math.abs(pool.indexOf(n) - pool.indexOf(motifNote)) <
        Math.abs(pool.indexOf(best) - pool.indexOf(motifNote)) ? n : best
      , arp(cn, arpeMode, i));
    } else if (r < 0.60 + chaos * 0.22) {
      // Passing / chromatic (chaos-scaled)
      note = pick(pool);
    } else {
      // Voice lead ±1-2 from last, staying on chord tone
      note = voiceLead(lastNote, cn);
    }

    line[i]  = note;
    lastNote = note;

    // Note lengths
    const lr = rnd();
    let   l  = lenBias;
    if      (lr < 0.40) l = lenBias;
    else if (lr < 0.60) l = lenBias * 2;
    else if (lr < 0.78) l = Math.max(0.5, lenBias * 0.5);
    else                l = Math.min(lenBias * 3, 8);
    lengths[i] = l;
  }

  // Tile to MAX_STEPS
  for (let i = steps; i < MAX_STEPS; i++) {
    line[i] = line[i % Math.max(1, steps)];
  }

  return { line, lengths, lastNote };
}

export function buildSection(genre, sectionName, modeName, progression, arpeMode, prevBass, sectionIndex = 0) {
  const sec  = SECTIONS[sectionName] || SECTIONS.groove;
  const gd   = GENRES[genre];
  const grooveName =
    gd.density > 0.65 && gd.chaos > 0.4 ? 'bunker'
    : gd.chaos > 0.6                     ? 'broken'
    : gd.density < 0.4                   ? 'float'
    :                                      'steady';

  const groove  = GROOVE_MAPS[grooveName];
  const mode    = MODES[modeName] || MODES.minor;
  const density = gd.density;
  const chaos   = gd.chaos;
  const noiseMix = clamp(chaos * 0.5 + density * 0.2, 0.05, 0.6);

  // ── Tonal transposition between sections ────────────────────────────────────
  // Drop sections shift up 3 semitones (minor third) for intensity.
  // Tension shifts up 2 (whole step). Outro shifts down 2 to resolve.
  // Other sections alternate +0 / +5 semitones every other occurrence.
  const sectionTranspose = {
    drop:    3,
    tension: 2,
    outro:   -2,
    build:   sectionIndex % 2 === 0 ? 0 : 5,
    groove:  sectionIndex % 3 === 0 ? 0 : sectionIndex % 3 === 1 ? 3 : 7,
    break:   0,
    intro:   0,
    fill:    0,
  };
  const semitones = sectionTranspose[sectionName] ?? 0;

  // Transpose pool if needed
  const bp = semitones === 0 ? mode.b : mode.b.map(n => transposeNote(n, semitones));
  const sp = semitones === 0 ? mode.s : mode.s.map(n => transposeNote(n, semitones));

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

  const bassLb =
    sec.lb * (sectionName === 'break' ? 2.5 : sectionName === 'drop' ? 0.8 : 1);
  const synthLb =
    sec.lb * (sectionName === 'break' ? 3 : sectionName === 'ambient' ? 4 : 1.2);

  const { line: bassLine, lengths: bassLengths, lastNote: lastBassNote } = buildMelodicLine(
    bp, progression, laneLen.bass, chaos, arpeMode, bassLb, prevBass,
  );

  const { line: synthLine, lengths: synthLengths } = buildMelodicLine(
    sp, progression, laneLen.synth, chaos * 0.7, arpeMode, synthLb, null,
    true, // counterpoint: synth prefers off-beats relative to bass motif
  );

  const phraseW = [1, 0.75, 0.92, 0.68]; // phrase weight per 8-step segment

  const p = {
    kick: mkSteps(), snare: mkSteps(),
    hat: mkSteps(), bass: mkSteps(), synth: mkSteps(),
  };

  // ── Euclidean rhythm helper ────────────────────────────────────────────────
  // Distributes `hits` evenly across `steps` (Bjorklund algorithm).
  function euclidean(hits, steps) {
    if (hits <= 0) return Array(steps).fill(false);
    if (hits >= steps) return Array(steps).fill(true);
    let pattern = Array.from({ length: steps }, (_, i) =>
      Math.floor((i * hits) / steps) > Math.floor(((i - 1) * hits) / steps)
    );
    return pattern;
  }

  // ── Genre-specific kick patterns (2 bars = 32 steps at 16 per bar) ─────────
  // Each is a 16-step boolean template. Bar 2 may vary from bar 1.
  const KICK_PATTERNS = {
    // 4-on-the-floor variants
    every4:      [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    every4ghost: [1,0,0,0, 1,0,0,1, 1,0,0,0, 1,0,1,0], // with ghost hits
    // Syncopated / pushed
    push:        [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,1,0],
    techno2:     [1,0,0,0, 1,0,0,0, 1,0,1,0, 1,0,0,0],
    // Sparse
    sparse:      [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    cinematic:   [1,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0],
    // Breakbeat / syncopated
    dnb:         [1,0,0,0, 0,0,1,0, 0,0,1,0, 0,1,0,0],
    jungle:      [1,0,0,1, 0,0,0,0, 1,0,0,0, 0,0,1,0],
    // Triplet feel
    halftime:    [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,1,0,0],
    // Acid / irregular
    acid:        [1,0,0,0, 1,0,1,0, 1,0,0,0, 1,1,0,0],
  };

  // Pick kick pattern based on genre + section
  function pickKickPattern(genre, sectionName) {
    const map = {
      techno:      ['every4', 'every4ghost', 'techno2'],
      house:       ['every4', 'every4ghost', 'every4'],
      ambient:     ['sparse', 'cinematic', 'sparse'],
      dnb:         ['dnb', 'jungle', 'dnb'],
      acid:        ['acid', 'every4ghost', 'acid'],
      industrial:  ['every4', 'techno2', 'every4ghost'],
      experimental:['push', 'halftime', 'dnb'],
      cinematic:   ['cinematic', 'sparse', 'halftime'],
    };
    const options = map[genre] || ['every4'];
    // Sections influence pattern choice
    if (sectionName === 'drop' || sectionName === 'groove') {
      return options[0]; // most active
    }
    if (sectionName === 'break' || sectionName === 'outro') {
      return options[Math.min(2, options.length - 1)]; // most sparse
    }
    return pick(options);
  }

  // ── Snare patterns ─────────────────────────────────────────────────────────
  const SNARE_PATTERNS = {
    backbeat:    [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0], // beats 2 & 4
    backbeatAlt: [0,0,0,0, 1,0,0,0, 0,0,1,0, 1,0,0,0], // 2 & 4 + ghost
    breakbeat:   [0,0,1,0, 0,1,0,0, 1,0,0,1, 0,0,1,0],
    halftime:    [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0], // snare on 3 only
    sparse:      [0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0],
    dnb:         [0,0,1,0, 0,0,0,1, 0,1,0,0, 0,1,0,0],
  };

  function pickSnarePattern(genre, sectionName) {
    const map = {
      techno:      ['backbeat', 'backbeatAlt'],
      house:       ['backbeat', 'backbeatAlt'],
      ambient:     ['sparse', 'halftime'],
      dnb:         ['dnb', 'breakbeat'],
      acid:        ['backbeat', 'backbeatAlt'],
      industrial:  ['backbeat', 'backbeatAlt'],
      experimental:['breakbeat', 'dnb'],
      cinematic:   ['halftime', 'sparse'],
    };
    if (sectionName === 'break') return 'halftime';
    if (sectionName === 'fill')  return 'breakbeat';
    const opts = map[genre] || ['backbeat'];
    return pick(opts);
  }

  // ── Build kick & snare from patterns ──────────────────────────────────────
  const kickPat  = KICK_PATTERNS[pickKickPattern(genre, sectionName)] || KICK_PATTERNS.every4;
  const snarePat = SNARE_PATTERNS[pickSnarePattern(genre, sectionName)] || SNARE_PATTERNS.backbeat;
  const ll_k     = laneLen.kick;
  const ll_s     = laneLen.snare;

  for (let i = 0; i < ll_k; i++) {
    const pos  = i % 16;
    const bar  = Math.floor(i / 16);
    const pb   = Math.floor(i / 8) % 4;
    const pw   = phraseW[pb];
    let hit    = kickPat[pos];

    // Bar 2 variation: occasionally syncopate or add anticipation
    if (bar % 2 === 1 && sectionName !== 'drop') {
      // Add a kick anticipation on step 14 (one step before bar line) ~30% of the time
      if (pos === 14 && rnd() < 0.30 + chaos * 0.2) hit = true;
      // Occasional extra kick on step 10
      if (pos === 10 && gd.kick !== 'sparse' && rnd() < 0.22 + chaos * 0.15) hit = true;
    }

    // Fill: last bar (bar 3 of 4) gets denser kick
    if (pb === 3 && sectionName !== 'break') {
      if (pos === 6 && rnd() < 0.35 + chaos * 0.2) hit = true;
      if (pos === 14 && rnd() < 0.45) hit = true;
    }

    // Ghost notes: quiet hits between main beats
    const isGhost = !hit && (pos % 2 === 1) && rnd() < noiseMix * 0.12;

    if (hit || isGhost) {
      p.kick[i].on = true;
      const vel = isGhost
        ? clamp(0.28 + rnd() * 0.15, 0.2, 0.42)
        : clamp(velCurve(sec.vel, i, ll_k, pw) * sec.kM, 0.35, 1);
      p.kick[i].v = vel;
      p.kick[i].p = clamp(sec.pb + rnd() * (1 - sec.pb), sec.pb, 1);
    }
  }

  // Guarantee kick on beat 1 of every bar unless section says don't
  if (sectionName !== 'break' && sectionName !== 'outro') {
    for (let i = 0; i < ll_k; i += 16) { p.kick[i].on = true; p.kick[i].v = 1; }
  }

  for (let i = 0; i < ll_s; i++) {
    const pos = i % 16;
    const bar = Math.floor(i / 16);
    const pb  = Math.floor(i / 8) % 4;
    const pw  = phraseW[pb];
    let hit   = snarePat[pos];

    // Ghost snare: very quiet hits between main snare beats
    const isGhost = !hit && (pos % 2 === 0) && pos !== 0 && pos !== 8
      && rnd() < 0.10 + chaos * 0.08;

    // Anticipation: snare slightly early before bar 2 or 4
    if (pos === 15 && bar % 2 === 0 && rnd() < 0.18 + chaos * 0.1) hit = true;

    // Fill density boost on last bar
    if (pb === 3 && rnd() < 0.30 + chaos * 0.20) hit = hit || (pos % 2 === 0 && pos !== 0);

    if (hit || isGhost) {
      p.snare[i].on = true;
      const vel = isGhost
        ? clamp(0.20 + rnd() * 0.12, 0.18, 0.35)
        : clamp(velCurve(sec.vel, i, ll_s, pw) * sec.sM, 0.35, 1);
      p.snare[i].v = vel;
      p.snare[i].p = clamp(sec.pb + rnd() * (1 - sec.pb), sec.pb, 1);
    }
  }

  // ── Hat: euclidean + genre + roll + build crescendo ────────────────────────
  const ll_h = laneLen.hat;
  const hatP = gd.hatPattern;

  // Base hit count — euclidean distribution
  const baseHits = hatP === '16th'      ? ll_h
    : hatP === 'offbeat'                ? Math.floor(ll_h / 2)
    : hatP === 'breakbeat'              ? Math.floor(ll_h * (0.42 + chaos * 0.18))
    : hatP === 'noise'                  ? Math.floor(ll_h * (0.50 + chaos * 0.20))
    : hatP === 'sparse'                 ? Math.floor(ll_h * 0.16)
    :                                    Math.floor(ll_h * (0.34 + density * 0.22));

  const hatEuc = euclidean(Math.round(baseHits), ll_h);

  // Build crescendo: density multiplier ramps from 0.5 → 1.0 across 4 bars
  const isBuild = sectionName === 'build';
  const isTension = sectionName === 'tension';

  for (let i = 0; i < ll_h; i++) {
    const pos    = i % 16;
    const bar    = Math.floor(i / 16); // which bar within the lane
    const totalBars = Math.floor(ll_h / 16);
    const pb     = Math.floor(i / 8) % 4;
    const pw     = phraseW[pb];

    // Build crescendo: probability scales with progress through the section
    const buildRamp = isBuild
      ? clamp(0.4 + (bar / Math.max(1, totalBars - 1)) * 0.6, 0.4, 1.0)
      : 1.0;

    let hit = hatP === 'offbeat' ? (i % 2 === 1) : hatEuc[i];

    // In build sections, add hats that weren't there if ramp is high
    if (isBuild && !hit && bar >= 2 && rnd() < (buildRamp - 0.4) * 0.8) hit = true;

    // Tension: dense hats with rolls on last bar
    if (isTension && !hit && pos % 2 === 1 && rnd() < 0.35 + chaos * 0.2) hit = true;

    // Hat roll: in the last bar of any section, add rapid hats toward the end
    // This simulates the "rush" before a section change
    const isLastBar = bar === totalBars - 1;
    const rollZone  = pos >= 10; // last 6 steps of bar
    if (isLastBar && rollZone && !hit) {
      // Probability increases toward end of bar
      const rollProb = 0.15 + ((pos - 10) / 5) * (0.55 + chaos * 0.25);
      if (rnd() < rollProb * buildRamp) hit = true;
    }

    // Open hat: on step 8 of each bar (& sometimes 14) with velocity accent
    const isOpen = hit && (
      (pos === 8 && rnd() < 0.30 + density * 0.15) ||
      (pos === 14 && rnd() < 0.18 + chaos * 0.12)
    );

    // Ghost hat: quiet hits filling gaps
    const isGhost = !hit && (pos % 4 !== 0) && rnd() < 0.05 + noiseMix * 0.05;

    if (hit || isGhost) {
      p.hat[i].on = true;
      // Velocity: ghosts are quiet, accents on beat 1 of each bar are loud,
      // roll notes have a slight crescendo within the roll
      let vel;
      if (isGhost) {
        vel = clamp(0.15 + rnd() * 0.10, 0.12, 0.26);
      } else if (isLastBar && rollZone) {
        vel = clamp(0.45 + ((pos - 10) / 5) * 0.35, 0.40, 0.85) * accent;
      } else {
        vel = clamp(velCurve(sec.vel, i, ll_h, pw) * sec.hM * buildRamp, 0.28, 1) * accent;
      }
      p.hat[i].v = vel;
      p.hat[i].p = isOpen ? 1 : clamp(sec.pb + rnd() * (1 - sec.pb), sec.pb, 1);
    }
  }

  // ── Bass & synth rhythmic placement ───────────────────────────────────────
  const bar_b = 16;
  for (const lane of ['bass', 'synth']) {
    const ll = laneLen[lane];
    const lm = lane === 'bass' ? sec.bM : sec.syM;
    const maxD = lane === 'bass' ? 0.55 : 0.45;

    for (let i = 0; i < ll; i++) {
      const pos = i % bar_b;
      const pb  = Math.floor(i / 8) % 4;
      const pw  = phraseW[pb];
      let hit   = false;

      if (lane === 'bass') {
        // Bass: strong beat anchors + approach notes
        const isAnchor  = pos === 0 || pos === 8;
        const isApproach = pos === 14 || pos === 6; // one before anchor
        const isMid     = pos === 4 || pos === 12;
        const prob = isAnchor ? 0.88 * lm
          : isApproach ? 0.35 * lm * chaos
          : isMid      ? 0.55 * lm
          : (groove.bB + density * 0.12) * pw * 0.6;
        hit = rnd() < Math.min(prob, maxD);
      } else {
        // Synth: off-beat preference (counterpoint), avoid kick beats
        const kickBeat   = kickPat[pos % 16];
        const isOffBeat  = pos % 2 === 1;
        const isPhrase   = pos === 2 || pos === 6 || pos === 10 || pos === 14;
        const penaltyIfKick = kickBeat ? 0.5 : 1;
        const prob = isPhrase ? 0.65 * lm * penaltyIfKick
          : isOffBeat ? (groove.syB + density * 0.10) * pw * 0.55 * penaltyIfKick
          : 0.08 * lm;
        hit = (rnd() < Math.min(prob, maxD) && (!kickBeat || rnd() < 0.3))
          || (pb === 3 && rnd() < 0.18 + chaos * 0.12);
      }

      if (hit) {
        p[lane][i].on  = true;
        p[lane][i].v   = clamp(velCurve(sec.vel, i, ll, phraseW[Math.floor(i/8)%4]), 0.22, 1);
        p[lane][i].p   = clamp(sec.pb + rnd() * (1 - sec.pb), sec.pb, 1);
        p[lane][i].l   = lane === 'bass' ? (bassLengths[i] || sec.lb) : (synthLengths[i] || sec.lb);
      }
    }
  }

  // ── Tie held notes ─────────────────────────────────────────────────────────
  for (const lane of ['bass', 'synth']) {
    const ll = laneLen[lane];
    for (let i = 0; i < ll; i++) {
      if (p[lane][i].on && p[lane][i].l > 1) {
        const holdEnd = Math.min(ll - 1, i + Math.floor(p[lane][i].l));
        for (let j = i + 1; j <= holdEnd; j++) {
          p[lane][j].tied = true; p[lane][j].on = false;
        }
      }
    }
  }

  // ── Chaos mutations on drums (after pattern is set) ────────────────────────
  // Only touch non-anchor steps to preserve the rhythmic skeleton.
  const mutations = Math.floor(chaos * 4);
  for (let m = 0; m < mutations; m++) {
    const ln  = pick(['hat', 'snare']);
    const ll  = laneLen[ln];
    const pos = Math.floor(rnd() * ll);
    // Skip anchor positions
    if (pos % 16 === 0 || pos % 16 === 4 || pos % 16 === 12) continue;
    p[ln][pos].on = !p[ln][pos].on;
    if (p[ln][pos].on) p[ln][pos].v = 0.35 + rnd() * 0.3;
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