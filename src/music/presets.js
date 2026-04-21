export const BASS_PRESETS = {
  sub_floor: {
    label: 'SUB FLOOR',
    bassSubAmt: 0.9,
    bassFilter: 0.3,
    fmIdx: 0.2,
  },
  fm_growl: {
    label: 'FM GROWL',
    bassSubAmt: 0.5,
    bassFilter: 0.6,
    fmIdx: 1.2,
  },
  acid_line: {
    label: 'ACID LINE',
    bassSubAmt: 0.3,
    bassFilter: 0.85,
    fmIdx: 0.4,
  },
  warm_round: {
    label: 'WARM ROUND',
    bassSubAmt: 0.7,
    bassFilter: 0.5,
    fmIdx: 0.25,
  },
};

export const SYNTH_PRESETS = {
  velvet_pad: {
    label: 'VELVET PAD',
    synthFilter: 0.4,
    tone: 0.4,
    space: 0.6,
  },
  glass_keys: {
    label: 'GLASS KEYS',
    synthFilter: 0.8,
    tone: 0.7,
    space: 0.5,
  },
  bright_lead: {
    label: 'BRIGHT LEAD',
    synthFilter: 0.9,
    tone: 0.8,
    space: 0.2,
  },
  dark_atmo: {
    label: 'DARK ATMO',
    synthFilter: 0.3,
    tone: 0.25,
    space: 0.7,
  },
};

export const DRUM_PRESETS = {
  tight_punch: {
    label: 'TIGHT PUNCH',
    drumDecay: 0.25,
    noiseMix: 0.1,
  },
  dusty_break: {
    label: 'DUSTY BREAK',
    drumDecay: 0.5,
    noiseMix: 0.4,
  },
  heavy_club: {
    label: 'HEAVY CLUB',
    drumDecay: 0.35,
    noiseMix: 0.2,
  },
  soft_analog: {
    label: 'SOFT ANALOG',
    drumDecay: 0.6,
    noiseMix: 0.15,
  },
};

export const PERFORMANCE_PRESETS = {
  club_night: {
    label: 'CLUB NIGHT',
    master: 0.85,
    drive: 0.35,
    compress: 0.4,
    space: 0.3,
  },
  deep_session: {
    label: 'DEEP SESSION',
    master: 0.7,
    drive: 0.15,
    compress: 0.2,
    space: 0.5,
  },
  warehouse: {
    label: 'WAREHOUSE',
    master: 0.9,
    drive: 0.5,
    compress: 0.5,
    space: 0.2,
  },
  ambient_flow: {
    label: 'AMBIENT FLOW',
    master: 0.65,
    drive: 0.1,
    compress: 0.15,
    space: 0.7,
  },
};

export const SOUND_PRESETS = {
  bass: BASS_PRESETS,
  synth: SYNTH_PRESETS,
  drum: DRUM_PRESETS,
  performance: PERFORMANCE_PRESETS,
};