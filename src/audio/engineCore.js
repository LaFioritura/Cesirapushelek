import { clamp, rnd, GENRES } from '../music/core';

export const driveCurve = (node, amt) => {
  const k = 2 + clamp(amt, 0, 1) * 60;
  const s = 512;
  const c = new Float32Array(s);
  for (let i = 0; i < s; i += 1) {
    const x = (i * 2) / s - 1;
    c[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
  }
  node.curve = c;
  node.oversample = '2x';
};

export const identityCurve = (node) => {
  const c = new Float32Array(512);
  for (let i = 0; i < 512; i += 1) {
    c[i] = (i * 2) / 512 - 1;
  }
  node.curve = c;
};

export const reverbIR = (ctx, dur = 1.2, dec = 2.6) => {
  const sr = ctx.sampleRate;
  const l = Math.floor(sr * dur);
  const b = ctx.createBuffer(2, l, sr);

  for (let ch = 0; ch < 2; ch += 1) {
    const d = b.getChannelData(ch);
    for (let i = 0; i < l; i += 1) {
      d[i] = (rnd() * 2 - 1) * Math.pow(1 - i / l, dec);
    }
  }

  return b;
};

export async function initAudioEngine({
  audioRef,
  analyserRef,
  setIsReady,
  setStatus,
}) {
  if (audioRef.current) {
    await audioRef.current.ctx.resume();
    setIsReady?.(true);
    return audioRef.current;
  }

  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;

  const ctx = new Ctx({ sampleRate: 44100, latencyHint: 'interactive' });

  const bus = ctx.createGain();
  bus.gain.value = 0.68;

  const preD = ctx.createWaveShaper();
  identityCurve(preD);

  const toneF = ctx.createBiquadFilter();
  toneF.type = 'lowpass';
  toneF.frequency.value = 16000;
  toneF.Q.value = 0.35;

  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -24;
  comp.knee.value = 18;
  comp.ratio.value = 3;
  comp.attack.value = 0.008;
  comp.release.value = 0.22;

  const lim = ctx.createDynamicsCompressor();
  lim.threshold.value = -3;
  lim.knee.value = 0;
  lim.ratio.value = 20;
  lim.attack.value = 0.001;
  lim.release.value = 0.04;

  const dry = ctx.createGain();
  const wet = ctx.createGain();
  dry.gain.value = 1;
  wet.gain.value = 0;

  const spl = ctx.createChannelSplitter(2);
  const mrg = ctx.createChannelMerger(2);

  const lDly = ctx.createDelay(0.5);
  const rDly = ctx.createDelay(0.5);
  const fb = ctx.createGain();
  const dlyT = ctx.createBiquadFilter();

  dlyT.type = 'lowpass';
  dlyT.frequency.value = 4500;
  fb.gain.value = 0.15;

  const chorus = ctx.createGain();
  chorus.gain.value = 0;

  const cD1 = ctx.createDelay(0.025);
  const cD2 = ctx.createDelay(0.031);

  const rev = ctx.createConvolver();
  rev.buffer = reverbIR(ctx);

  const revW = ctx.createGain();
  revW.gain.value = 0;

  const out = ctx.createGain();
  out.gain.value = 0.88;

  const an = ctx.createAnalyser();
  an.fftSize = 256;
  an.smoothingTimeConstant = 0.8;

  const dest = ctx.createMediaStreamDestination();

  bus.connect(preD);
  preD.connect(toneF);
  toneF.connect(comp);

  comp.connect(dry);
  comp.connect(wet);
  comp.connect(cD1);
  comp.connect(cD2);
  comp.connect(rev);

  cD1.connect(chorus);
  cD2.connect(chorus);

  rev.connect(revW);

  wet.connect(spl);
  spl.connect(lDly, 0);
  spl.connect(rDly, 1);

  rDly.connect(dlyT);
  dlyT.connect(fb);
  fb.connect(lDly);

  lDly.connect(mrg, 0, 0);
  rDly.connect(mrg, 0, 1);

  mrg.connect(wet);

  dry.connect(out);
  wet.connect(out);
  chorus.connect(out);
  revW.connect(out);

  out.connect(lim);
  lim.connect(an);
  lim.connect(ctx.destination);
  lim.connect(dest);

  const engine = {
    ctx,
    bus,
    preD,
    toneF,
    comp,
    lim,
    dry,
    wet,
    lDly,
    rDly,
    fb,
    chorus,
    revW,
    out,
    an,
    dest,
  };

  audioRef.current = engine;
  analyserRef.current = an;

  setIsReady?.(true);
  setStatus?.('Audio online');

  return engine;
}

export function applyFxNow({
  audioRef,
  space,
  tone,
  drive,
  compress,
  master,
  genre,
}) {
  const a = audioRef.current;
  if (!a) return;

  const now = a.ctx.currentTime;
  const fx = GENRES[genre]?.fxProfile || GENRES.techno.fxProfile;

  driveCurve(a.preD, clamp(fx.drive * 0.4 + drive * 0.1, 0, 0.38));

  a.toneF.frequency.linearRampToValueAtTime(
    clamp(1800 + 12000 * fx.tone * tone, 600, 19000),
    now + 0.08,
  );

  a.lDly.delayTime.linearRampToValueAtTime(
    clamp(0.02 + space * 0.08, 0.01, 0.45),
    now + 0.08,
  );

  a.rDly.delayTime.linearRampToValueAtTime(
    clamp(0.03 + space * 0.1, 0.01, 0.45),
    now + 0.08,
  );

  a.fb.gain.linearRampToValueAtTime(
    clamp(0.06 + space * 0.2, 0.03, 0.4),
    now + 0.08,
  );

  a.wet.gain.linearRampToValueAtTime(
    clamp(space * 0.18, 0, 0.25),
    now + 0.08,
  );

  a.dry.gain.linearRampToValueAtTime(
    clamp(0.95 - space * 0.08, 0.72, 0.97),
    now + 0.08,
  );

  a.chorus.gain.linearRampToValueAtTime(
    clamp(space * 0.08, 0, 0.14),
    now + 0.12,
  );

  a.revW.gain.linearRampToValueAtTime(
    clamp(fx.space * space * 0.22, 0, 0.28),
    now + 0.14,
  );

  a.out.gain.linearRampToValueAtTime(master, now + 0.06);

  a.comp.threshold.value = clamp(-20 - compress * 12, -32, -6);
  a.comp.ratio.value = clamp(2 + compress * 5, 1.5, 8);
}

export function makeLaneGainGetter(audioRef, laneGainsRef) {
  return function getLaneGain(lane) {
    const a = audioRef.current;
    if (!a) return null;

    if (!laneGainsRef.current[lane]) {
      const g = a.ctx.createGain();
      g.gain.value = 1;
      g.connect(a.bus);
      laneGainsRef.current[lane] = g;
    }

    return laneGainsRef.current[lane];
  };
}