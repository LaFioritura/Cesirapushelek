// ═══════════════════════════════════════════════════════════════════════════════
// CESIRA PRESET LIBRARY
// Each preset maps directly to the parameters exposed in useSoundParams.
// Genre profiles and section automations are at the bottom.
// ═══════════════════════════════════════════════════════════════════════════════

// ── BASS PRESETS ──────────────────────────────────────────────────────────────
// 12 presets covering all bassMode flavours.
export const BASS_PRESETS = {
  // ── Sub / warm ──
  sub_floor:    { label: 'SUB FLOOR',    bassSubAmt: 0.92, bassFilter: 0.28, fmIdx: 0.15 },
  warm_round:   { label: 'WARM ROUND',   bassSubAmt: 0.75, bassFilter: 0.48, fmIdx: 0.20 },
  deep_pulse:   { label: 'DEEP PULSE',   bassSubAmt: 0.85, bassFilter: 0.22, fmIdx: 0.10 },
  // ── FM / digital ──
  fm_growl:     { label: 'FM GROWL',     bassSubAmt: 0.45, bassFilter: 0.62, fmIdx: 1.40 },
  fm_stab:      { label: 'FM STAB',      bassSubAmt: 0.30, bassFilter: 0.78, fmIdx: 2.20 },
  bit_crunch:   { label: 'BIT CRUNCH',   bassSubAmt: 0.20, bassFilter: 0.90, fmIdx: 2.80 },
  // ── Acid / filter ──
  acid_line:    { label: 'ACID LINE',    bassSubAmt: 0.28, bassFilter: 0.88, fmIdx: 0.45 },
  acid_dark:    { label: 'ACID DARK',    bassSubAmt: 0.40, bassFilter: 0.55, fmIdx: 0.35 },
  // ── Organic / modulated ──
  reese_neuro:  { label: 'REESE NEURO',  bassSubAmt: 0.55, bassFilter: 0.38, fmIdx: 0.60 },
  wobble_low:   { label: 'WOBBLE LOW',   bassSubAmt: 0.65, bassFilter: 0.70, fmIdx: 0.80 },
  upright_wood: { label: 'UPRIGHT WOOD', bassSubAmt: 0.80, bassFilter: 0.40, fmIdx: 0.12 },
  moog_fat:     { label: 'MOOG FAT',     bassSubAmt: 0.70, bassFilter: 0.52, fmIdx: 0.30 },
};

// ── SYNTH PRESETS ─────────────────────────────────────────────────────────────
// 12 presets, one for each synthMode and timbric context.
export const SYNTH_PRESETS = {
  // ── Pads / atmosphere ──
  velvet_pad:   { label: 'VELVET PAD',   synthFilter: 0.38, tone: 0.38, space: 0.65 },
  dark_atmo:    { label: 'DARK ATMO',    synthFilter: 0.22, tone: 0.20, space: 0.80 },
  ethereal:     { label: 'ETHEREAL',     synthFilter: 0.50, tone: 0.55, space: 0.90 },
  choir_rise:   { label: 'CHOIR RISE',   synthFilter: 0.44, tone: 0.48, space: 0.72 },
  // ── Keys / melodic ──
  glass_keys:   { label: 'GLASS KEYS',   synthFilter: 0.80, tone: 0.72, space: 0.48 },
  rhodes_warm:  { label: 'RHODES WARM',  synthFilter: 0.65, tone: 0.58, space: 0.42 },
  marimba_hit:  { label: 'MARIMBA HIT',  synthFilter: 0.85, tone: 0.80, space: 0.30 },
  vintage_juno: { label: 'VINTAGE JUNO', synthFilter: 0.60, tone: 0.52, space: 0.55 },
  // ── Leads / aggressive ──
  bright_lead:  { label: 'BRIGHT LEAD',  synthFilter: 0.92, tone: 0.82, space: 0.18 },
  acid_stab:    { label: 'ACID STAB',    synthFilter: 0.88, tone: 0.70, space: 0.22 },
  supersaw_wall:{ label: 'SUPERSAW',     synthFilter: 0.75, tone: 0.65, space: 0.35 },
  // ── Vocal / experimental ──
  vox_formant:  { label: 'VOX FORMANT',  synthFilter: 0.55, tone: 0.45, space: 0.60 },
};

// ── DRUM PRESETS ──────────────────────────────────────────────────────────────
// 10 presets covering the full decay/noise spectrum.
export const DRUM_PRESETS = {
  tight_punch:  { label: 'TIGHT PUNCH',  drumDecay: 0.20, noiseMix: 0.08 },
  iron_machine: { label: 'IRON MACHINE', drumDecay: 0.28, noiseMix: 0.22 },
  heavy_club:   { label: 'HEAVY CLUB',   drumDecay: 0.38, noiseMix: 0.18 },
  vinyl_break:  { label: 'VINYL BREAK',  drumDecay: 0.52, noiseMix: 0.45 },
  dusty_break:  { label: 'DUSTY BREAK',  drumDecay: 0.58, noiseMix: 0.42 },
  soft_analog:  { label: 'SOFT ANALOG',  drumDecay: 0.62, noiseMix: 0.12 },
  noise_burst:  { label: 'NOISE BURST',  drumDecay: 0.18, noiseMix: 0.75 },
  deep_room:    { label: 'DEEP ROOM',    drumDecay: 0.70, noiseMix: 0.20 },
  electro_snap: { label: 'ELECTRO SNAP', drumDecay: 0.15, noiseMix: 0.35 },
  jungle_chop:  { label: 'JUNGLE CHOP',  drumDecay: 0.25, noiseMix: 0.55 },
};

// ── PERFORMANCE PRESETS ───────────────────────────────────────────────────────
// 8 presets covering master/FX contexts.
export const PERFORMANCE_PRESETS = {
  club_night:    { label: 'CLUB NIGHT',    master: 0.85, drive: 0.35, compress: 0.42, space: 0.28 },
  warehouse:     { label: 'WAREHOUSE',     master: 0.90, drive: 0.52, compress: 0.55, space: 0.18 },
  deep_session:  { label: 'DEEP SESSION',  master: 0.72, drive: 0.14, compress: 0.20, space: 0.52 },
  ambient_flow:  { label: 'AMBIENT FLOW',  master: 0.62, drive: 0.08, compress: 0.12, space: 0.78 },
  radio_loud:    { label: 'RADIO LOUD',    master: 0.95, drive: 0.60, compress: 0.70, space: 0.15 },
  studio_clean:  { label: 'STUDIO CLEAN',  master: 0.78, drive: 0.05, compress: 0.10, space: 0.35 },
  live_raw:      { label: 'LIVE RAW',      master: 0.88, drive: 0.45, compress: 0.38, space: 0.22 },
  cinematic_mix: { label: 'CINEMATIC MIX', master: 0.70, drive: 0.10, compress: 0.18, space: 0.85 },
};

// ── GENRE PROFILES ────────────────────────────────────────────────────────────
// Each genre carries a recommended set of presets for all four categories.
// Applied automatically when genre changes or song arc starts.
export const GENRE_PROFILES = {
  techno: {
    bass: 'fm_growl',   synth: 'dark_atmo',    drum: 'iron_machine', perf: 'warehouse',
    grooveProfile: 'bunker', grooveAmt: 0.72, swing: 0.02, humanize: 0.004,
    space: 0.28, tone: 0.55, drive: 0.42, compress: 0.48,
  },
  house: {
    bass: 'warm_round',  synth: 'rhodes_warm',  drum: 'heavy_club',   perf: 'club_night',
    grooveProfile: 'steady', grooveAmt: 0.65, swing: 0.06, humanize: 0.008,
    space: 0.45, tone: 0.72, drive: 0.18, compress: 0.30,
  },
  ambient: {
    bass: 'deep_pulse',  synth: 'ethereal',     drum: 'deep_room',    perf: 'ambient_flow',
    grooveProfile: 'float', grooveAmt: 0.40, swing: 0.00, humanize: 0.012,
    space: 0.82, tone: 0.65, drive: 0.04, compress: 0.10,
  },
  dnb: {
    bass: 'reese_neuro', synth: 'glass_keys',   drum: 'jungle_chop',  perf: 'warehouse',
    grooveProfile: 'broken', grooveAmt: 0.68, swing: 0.04, humanize: 0.006,
    space: 0.25, tone: 0.50, drive: 0.38, compress: 0.52,
  },
  acid: {
    bass: 'acid_line',   synth: 'acid_stab',    drum: 'electro_snap', perf: 'club_night',
    grooveProfile: 'bunker', grooveAmt: 0.60, swing: 0.05, humanize: 0.005,
    space: 0.32, tone: 0.60, drive: 0.50, compress: 0.55,
  },
  industrial: {
    bass: 'bit_crunch',  synth: 'dark_atmo',    drum: 'noise_burst',  perf: 'radio_loud',
    grooveProfile: 'bunker', grooveAmt: 0.80, swing: 0.00, humanize: 0.002,
    space: 0.18, tone: 0.38, drive: 0.65, compress: 0.62,
  },
  experimental: {
    bass: 'wobble_low',  synth: 'vox_formant',  drum: 'vinyl_break',  perf: 'live_raw',
    grooveProfile: 'broken', grooveAmt: 0.55, swing: 0.08, humanize: 0.015,
    space: 0.60, tone: 0.50, drive: 0.28, compress: 0.35,
  },
  cinematic: {
    bass: 'upright_wood',synth: 'choir_rise',   drum: 'soft_analog',  perf: 'cinematic_mix',
    grooveProfile: 'float', grooveAmt: 0.45, swing: 0.03, humanize: 0.010,
    space: 0.80, tone: 0.78, drive: 0.06, compress: 0.14,
  },
};

// ── SECTION AUTOMATIONS ───────────────────────────────────────────────────────
// Delta values applied ON TOP of the current genre profile when a section fires.
// Positive = increase from current, negative = decrease.
// All values are absolute (not delta) to keep it predictable.
export const SECTION_AUTOMATIONS = {
  intro:   { space: +0.12, drive: -0.10, compress: -0.12, grooveAmt: -0.15 },
  build:   { space: -0.08, drive: +0.08, compress: +0.10, grooveAmt: +0.12 },
  drop:    { space: -0.12, drive: +0.15, compress: +0.15, grooveAmt: +0.20 },
  groove:  { space:  0.00, drive:  0.00, compress:  0.00, grooveAmt:  0.00 },
  break:   { space: +0.25, drive: -0.20, compress: -0.20, grooveAmt: -0.30 },
  tension: { space: -0.05, drive: +0.10, compress: +0.08, grooveAmt: +0.10 },
  fill:    { space: -0.05, drive: +0.12, compress: +0.05, grooveAmt: +0.15 },
  outro:   { space: +0.18, drive: -0.15, compress: -0.15, grooveAmt: -0.25 },
};

export const SOUND_PRESETS = {
  bass: BASS_PRESETS,
  synth: SYNTH_PRESETS,
  drum: DRUM_PRESETS,
  performance: PERFORMANCE_PRESETS,
};
