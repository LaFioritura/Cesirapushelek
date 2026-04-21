export const LANE_CLR={kick:'#ff4444',snare:'#ffaa00',hat:'#ffdd00',bass:'#00ccff',synth:'#cc88ff'};
export const GENRE_CLR={
  techno:'#ff2244',house:'#ff8800',ambient:'#44ffcc',dnb:'#ff4400',
  acid:'#aaff00',industrial:'#aaaaaa',experimental:'#ff44ff',cinematic:'#4488ff'
};


export const SOUND_PRESETS={
  bass:{
    sub_floor:{label:'SUB FLOOR',bassMode:'sub',bassFilter:0.38,bassSubAmt:0.92,drive:0.06,compress:0.24,tone:0.48},
    acid_pressure:{label:'ACID PRESSURE',bassMode:'bit',bassFilter:0.72,bassSubAmt:0.36,drive:0.42,compress:0.32,tone:0.42,fmIdx:0.86},
    fm_metal:{label:'FM METAL',bassMode:'fm',bassFilter:0.62,bassSubAmt:0.28,drive:0.26,compress:0.38,tone:0.44,fmIdx:1.08},
    drift_drone:{label:'DRIFT DRONE',bassMode:'drone',bassFilter:0.56,bassSubAmt:0.62,drive:0.1,compress:0.18,tone:0.66},
    fold_grit:{label:'FOLD GRIT',bassMode:'fold',bassFilter:0.68,bassSubAmt:0.34,drive:0.48,compress:0.4,tone:0.36},
    wet_orbit:{label:'WET ORBIT',bassMode:'wet',bassFilter:0.48,bassSubAmt:0.5,drive:0.22,compress:0.24,tone:0.7},
    pulse_body:{label:'PULSE BODY',bassMode:'pulse',bassFilter:0.58,bassSubAmt:0.44,drive:0.18,compress:0.28,tone:0.56},
    saw_motion:{label:'SAW MOTION',bassMode:'saw',bassFilter:0.64,bassSubAmt:0.3,drive:0.3,compress:0.34,tone:0.52},
  },
  synth:{
    velvet_pad:{label:'VELVET PAD',synthMode:'pad',synthFilter:0.64,space:0.72,tone:0.68,drive:0.08,polySynth:true},
    neon_lead:{label:'NEON LEAD',synthMode:'lead',synthFilter:0.72,space:0.28,tone:0.74,drive:0.22,polySynth:false},
    glass_bell:{label:'GLASS BELL',synthMode:'glass',synthFilter:0.78,space:0.54,tone:0.82,drive:0.06,polySynth:true},
    air_organ:{label:'AIR ORGAN',synthMode:'organ',synthFilter:0.52,space:0.34,tone:0.62,drive:0.12,polySynth:true,fmIdx:0.72},
    string_machine:{label:'STRING MACHINE',synthMode:'strings',synthFilter:0.68,space:0.66,tone:0.7,drive:0.08,polySynth:true},
    choir_mist:{label:'CHOIR MIST',synthMode:'choir',synthFilter:0.58,space:0.76,tone:0.66,drive:0.04,polySynth:true},
    star_noise:{label:'STAR NOISE',synthMode:'star',synthFilter:0.8,space:0.62,tone:0.86,drive:0.14,polySynth:true},
    cinematic_air:{label:'CINEMATIC AIR',synthMode:'air',synthFilter:0.6,space:0.84,tone:0.74,drive:0.02,polySynth:true,fmIdx:0.54},
    mist_pluck:{label:'MIST PLUCK',synthMode:'mist',synthFilter:0.44,space:0.46,tone:0.58,drive:0.12,polySynth:false},
    bell_shard:{label:'BELL SHARD',synthMode:'bell',synthFilter:0.82,space:0.48,tone:0.8,drive:0.04,polySynth:true},
  },
  drum:{
    tight_punch:{label:'TIGHT PUNCH',drumDecay:0.32,noiseMix:0.12,compress:0.18,drive:0.1},
    warehouse:{label:'WAREHOUSE',drumDecay:0.48,noiseMix:0.22,compress:0.28,drive:0.18},
    broken_air:{label:'BROKEN AIR',drumDecay:0.58,noiseMix:0.34,compress:0.24,drive:0.12,swing:0.06},
    industrial_haze:{label:'INDUSTRIAL HAZE',drumDecay:0.64,noiseMix:0.42,compress:0.34,drive:0.28},
    dusty_tape:{label:'DUSTY TAPE',drumDecay:0.44,noiseMix:0.28,compress:0.22,drive:0.16,tone:0.58},
    crisp_club:{label:'CRISP CLUB',drumDecay:0.26,noiseMix:0.1,compress:0.26,drive:0.08,tone:0.68},
  },
  performance:{
    club_night:{label:'CLUB NIGHT',genre:'techno',grooveAmt:0.7,swing:0.03,space:0.26,tone:0.56,drive:0.18,compress:0.28},
    acid_run:{label:'ACID RUN',genre:'acid',grooveAmt:0.76,swing:0.06,space:0.24,tone:0.42,drive:0.38,compress:0.3},
    jungle_grid:{label:'JUNGLE GRID',genre:'dnb',grooveAmt:0.74,swing:0.05,space:0.22,tone:0.52,drive:0.2,compress:0.24},
    ambient_bloom:{label:'AMBIENT BLOOM',genre:'ambient',grooveAmt:0.42,swing:0.0,space:0.88,tone:0.72,drive:0.02,compress:0.16},
    cinematic_rise:{label:'CINEMATIC RISE',genre:'cinematic',grooveAmt:0.5,swing:0.02,space:0.82,tone:0.76,drive:0.04,compress:0.18},
    industrial_drive:{label:'INDUSTRIAL DRIVE',genre:'industrial',grooveAmt:0.78,swing:0.0,space:0.18,tone:0.34,drive:0.48,compress:0.36},
  }
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
