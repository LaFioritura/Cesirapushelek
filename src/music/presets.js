// ═══════════════════════════════════════════════════════════════════════════════
// CESIRA — PRESET LIBRARY  (DNB · ACID · AMBIENT)
// ═══════════════════════════════════════════════════════════════════════════════

// ── BASS PRESETS ──────────────────────────────────────────────────────────────
export const BASS_PRESETS = {
  // DNB
  reese_dark:    { label:'REESE DARK',    bassSubAmt:0.55, bassFilter:0.30, fmIdx:0.60 },
  reese_bright:  { label:'REESE BRIGHT',  bassSubAmt:0.45, bassFilter:0.55, fmIdx:0.80 },
  reese_neuro:   { label:'REESE NEURO',   bassSubAmt:0.35, bassFilter:0.72, fmIdx:1.20 },
  sub_roller:    { label:'SUB ROLLER',    bassSubAmt:0.90, bassFilter:0.22, fmIdx:0.15 },
  wobble_dnb:    { label:'WOBBLE DNB',    bassSubAmt:0.60, bassFilter:0.65, fmIdx:0.90 },
  pluck_dnb:     { label:'PLUCK DNB',     bassSubAmt:0.70, bassFilter:0.50, fmIdx:0.20 },
  // ACID
  acid_classic:  { label:'ACID CLASSIC',  bassSubAmt:0.25, bassFilter:0.90, fmIdx:0.40 },
  acid_dark:     { label:'ACID DARK',     bassSubAmt:0.38, bassFilter:0.60, fmIdx:0.35 },
  acid_bright:   { label:'ACID BRIGHT',   bassSubAmt:0.18, bassFilter:0.95, fmIdx:0.55 },
  acid_fat:      { label:'ACID FAT',      bassSubAmt:0.50, bassFilter:0.78, fmIdx:0.45 },
  acid_slide:    { label:'ACID SLIDE',    bassSubAmt:0.30, bassFilter:0.85, fmIdx:0.30 },
  // AMBIENT
  drone_deep:    { label:'DRONE DEEP',    bassSubAmt:0.88, bassFilter:0.18, fmIdx:0.10 },
  drone_warm:    { label:'DRONE WARM',    bassSubAmt:0.80, bassFilter:0.35, fmIdx:0.12 },
  upright_wood:  { label:'UPRIGHT WOOD',  bassSubAmt:0.78, bassFilter:0.40, fmIdx:0.10 },
  pad_bass:      { label:'PAD BASS',      bassSubAmt:0.70, bassFilter:0.28, fmIdx:0.08 },
};

// ── SYNTH PRESETS ─────────────────────────────────────────────────────────────
export const SYNTH_PRESETS = {
  // DNB
  glass_tight:   { label:'GLASS TIGHT',   synthFilter:0.85, tone:0.78, space:0.30 },
  glass_warm:    { label:'GLASS WARM',    synthFilter:0.72, tone:0.62, space:0.45 },
  stab_hard:     { label:'STAB HARD',     synthFilter:0.95, tone:0.85, space:0.15 },
  stab_soft:     { label:'STAB SOFT',     synthFilter:0.78, tone:0.68, space:0.28 },
  reese_synth:   { label:'REESE SYNTH',   synthFilter:0.60, tone:0.50, space:0.35 },
  // ACID
  acid_lead:     { label:'ACID LEAD',     synthFilter:0.92, tone:0.80, space:0.18 },
  acid_pad:      { label:'ACID PAD',      synthFilter:0.68, tone:0.55, space:0.40 },
  acid_stab:     { label:'ACID STAB',     synthFilter:0.88, tone:0.72, space:0.22 },
  square_lead:   { label:'SQUARE LEAD',   synthFilter:0.90, tone:0.75, space:0.20 },
  // AMBIENT
  ether_deep:    { label:'ETHER DEEP',    synthFilter:0.35, tone:0.45, space:0.92 },
  ether_bright:  { label:'ETHER BRIGHT',  synthFilter:0.55, tone:0.65, space:0.85 },
  velvet_pad:    { label:'VELVET PAD',    synthFilter:0.30, tone:0.38, space:0.88 },
  dark_atmo:     { label:'DARK ATMO',     synthFilter:0.20, tone:0.25, space:0.95 },
  choir_soft:    { label:'CHOIR SOFT',    synthFilter:0.42, tone:0.52, space:0.80 },
  rhodes_warm:   { label:'RHODES WARM',   synthFilter:0.60, tone:0.58, space:0.55 },
};

// ── DRUM PRESETS ──────────────────────────────────────────────────────────────
export const DRUM_PRESETS = {
  // DNB
  jungle_tight:  { label:'JUNGLE TIGHT',  drumDecay:0.18, noiseMix:0.50 },
  jungle_dusty:  { label:'JUNGLE DUSTY',  drumDecay:0.28, noiseMix:0.62 },
  dnb_clinical:  { label:'DNB CLINICAL',  drumDecay:0.14, noiseMix:0.30 },
  dnb_heavy:     { label:'DNB HEAVY',     drumDecay:0.22, noiseMix:0.42 },
  // ACID
  acid_snap:     { label:'ACID SNAP',     drumDecay:0.14, noiseMix:0.28 },
  acid_punch:    { label:'ACID PUNCH',    drumDecay:0.22, noiseMix:0.18 },
  acid_heavy:    { label:'ACID HEAVY',    drumDecay:0.30, noiseMix:0.22 },
  // AMBIENT
  soft_bloom:    { label:'SOFT BLOOM',    drumDecay:0.70, noiseMix:0.12 },
  deep_room:     { label:'DEEP ROOM',     drumDecay:0.65, noiseMix:0.18 },
  ghost_hit:     { label:'GHOST HIT',     drumDecay:0.50, noiseMix:0.25 },
};

// ── PERFORMANCE PRESETS ───────────────────────────────────────────────────────
export const PERFORMANCE_PRESETS = {
  // DNB
  dnb_floor:     { label:'DNB FLOOR',     master:0.88, drive:0.38, compress:0.50, space:0.25 },
  dnb_raw:       { label:'DNB RAW',       master:0.90, drive:0.50, compress:0.45, space:0.20 },
  // ACID
  acid_club:     { label:'ACID CLUB',     master:0.86, drive:0.48, compress:0.52, space:0.28 },
  acid_warehouse:{ label:'ACID WARE',     master:0.92, drive:0.55, compress:0.58, space:0.18 },
  // AMBIENT
  ambient_deep:  { label:'AMBIENT DEEP',  master:0.65, drive:0.04, compress:0.12, space:0.90 },
  ambient_wide:  { label:'AMBIENT WIDE',  master:0.70, drive:0.06, compress:0.10, space:0.95 },
};

// ── GENRE PROFILES ────────────────────────────────────────────────────────────
export const GENRE_PROFILES = {
  dnb: {
    bass:'reese_dark', synth:'glass_tight', drum:'jungle_tight', perf:'dnb_floor',
    grooveProfile:'broken', grooveAmt:0.70, swing:0.04, humanize:0.005,
    space:0.28, tone:0.52, drive:0.38, compress:0.50,
  },
  acid: {
    bass:'acid_classic', synth:'acid_stab', drum:'acid_snap', perf:'acid_club',
    grooveProfile:'bunker', grooveAmt:0.62, swing:0.055, humanize:0.005,
    space:0.30, tone:0.55, drive:0.48, compress:0.52,
  },
  ambient: {
    bass:'drone_deep', synth:'ether_deep', drum:'soft_bloom', perf:'ambient_deep',
    grooveProfile:'float', grooveAmt:0.38, swing:0.00, humanize:0.012,
    space:0.92, tone:0.68, drive:0.03, compress:0.10,
  },
};

// ── SECTION AUTOMATIONS ───────────────────────────────────────────────────────
export const SECTION_AUTOMATIONS = {
  intro:   { space:+0.10, drive:-0.08, compress:-0.10, grooveAmt:-0.12 },
  build:   { space:-0.06, drive:+0.08, compress:+0.10, grooveAmt:+0.10 },
  drop:    { space:-0.10, drive:+0.14, compress:+0.14, grooveAmt:+0.18 },
  groove:  { space: 0.00, drive: 0.00, compress: 0.00, grooveAmt: 0.00 },
  break:   { space:+0.22, drive:-0.18, compress:-0.18, grooveAmt:-0.25 },
  tension: { space:-0.04, drive:+0.10, compress:+0.08, grooveAmt:+0.08 },
  fill:    { space:-0.04, drive:+0.10, compress:+0.05, grooveAmt:+0.12 },
  outro:   { space:+0.16, drive:-0.14, compress:-0.14, grooveAmt:-0.22 },
};

export const SOUND_PRESETS = {
  bass: BASS_PRESETS,
  synth: SYNTH_PRESETS,
  drum: DRUM_PRESETS,
  performance: PERFORMANCE_PRESETS,
};
