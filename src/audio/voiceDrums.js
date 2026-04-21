import { clamp, rnd, GENRES } from '../music/core';
import { driveCurve } from './engineCore';

export const ss = (node, time) => {
  try {
    node.start(time);
  } catch {}
};

export const st = (node, time) => {
  try {
    node.stop(time);
  } catch {}
};

export const gc = (src, nodes, ms) => {
  const fn = () => {
    [src, ...nodes].forEach((n) => {
      try {
        n.disconnect();
      } catch {}
    });
  };

  src.onended = fn;
  setTimeout(fn, ms);
};

export const noiseBuffer = (audioRef, len = 0.22, amt = 1, color = 'white') => {
  const a = audioRef.current;
  if (!a) return null;

  const sr = a.ctx.sampleRate;
  const b = a.ctx.createBuffer(1, Math.floor(sr * len), sr);
  const d = b.getChannelData(0);

  if (color === 'white') {
    for (let i = 0; i < d.length; i += 1) d[i] = (rnd() * 2 - 1) * amt;
    return b;
  }

  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let b3 = 0;
  let b4 = 0;
  let b5 = 0;

  for (let i = 0; i < d.length; i += 1) {
    const w = rnd() * 2 - 1;

    if (color === 'pink') {
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.310486;
      b4 = 0.55 * b4 + w * 0.532952;
      b5 = -0.7616 * b5 - w * 0.016898;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + w * 0.5362) * amt * 0.11;
    } else {
      b0 = 0.99 * b0 + w * 0.01;
      d[i] = b0 * amt * 3;
    }
  }

  return b;
};

export const trackNode = (activeNodesRef, ms) => {
  activeNodesRef.current += 1;
  setTimeout(() => {
    activeNodesRef.current = Math.max(0, activeNodesRef.current - 1);
  }, ms + 80);
};

export const nodeGuard = (activeNodesRef, limit = 90) => activeNodesRef.current < limit;

export function playKick({
  audioRef,
  getLaneGain,
  genre,
  drumDecay,
  noiseMix,
  bassSubAmt,
  activeNodesRef,
  flashLane,
  accent = 1,
  time,
}) {
  if (!nodeGuard(activeNodesRef)) return;
  const a = audioRef.current;
  if (!a) return;

  const out = getLaneGain('kick');
  if (!out) return;

  const gd = GENRES[genre] || GENRES.techno;
  const kf = gd.kickFreq || 90;
  const ke = gd.kickEnd || 35;
  const et = 0.08 + drumDecay * 0.12;
  const dt = 0.16 + drumDecay * 0.22;

  const body = a.ctx.createOscillator();
  const bG = a.ctx.createGain();

  const sub = a.ctx.createOscillator();
  const sG = a.ctx.createGain();

  const click = a.ctx.createBufferSource();
  const cG = a.ctx.createGain();

  const mG = a.ctx.createGain();
  const sh = a.ctx.createWaveShaper();

  body.type = 'sine';
  body.frequency.setValueAtTime(kf, time);
  body.frequency.exponentialRampToValueAtTime(Math.max(20, ke), time + et);

  sub.type = 'sine';
  sub.frequency.setValueAtTime(kf * 0.5, time);
  sub.frequency.exponentialRampToValueAtTime(Math.max(18, ke * 0.5), time + et);

  const cb = a.ctx.createBuffer(1, Math.floor(a.ctx.sampleRate * 0.004), a.ctx.sampleRate);
  const cd = cb.getChannelData(0);
  for (let i = 0; i < cd.length; i += 1) cd[i] = rnd() * 2 - 1;
  click.buffer = cb;

  driveCurve(sh, 0.05 + noiseMix * 0.08);

  bG.gain.setValueAtTime(0, time);
  bG.gain.linearRampToValueAtTime(0.82 * accent, time + 0.001);
  bG.gain.exponentialRampToValueAtTime(0.001, time + dt);

  sG.gain.setValueAtTime(0, time);
  sG.gain.linearRampToValueAtTime(0.5 * accent * bassSubAmt, time + 0.002);
  sG.gain.exponentialRampToValueAtTime(0.001, time + dt);

  cG.gain.setValueAtTime(0.16 + noiseMix * 0.1, time);
  cG.gain.exponentialRampToValueAtTime(0.001, time + 0.012);

  mG.gain.value = 0.98;

  body.connect(bG);
  sub.connect(sG);
  click.connect(cG);

  bG.connect(mG);
  sG.connect(mG);
  cG.connect(sh);
  sh.connect(mG);

  mG.connect(out);

  ss(body, time);
  ss(sub, time);
  ss(click, time);

  st(body, time + dt + 0.02);
  st(sub, time + dt + 0.02);
  st(click, time + 0.02);

  gc(click, [body, sub, bG, sG, cG, mG, sh], 400);

  trackNode(activeNodesRef, 400);
  flashLane?.('kick', 1);
}

export function playSnare({
  audioRef,
  getLaneGain,
  genre,
  drumDecay,
  noiseMix,
  activeNodesRef,
  flashLane,
  accent = 1,
  time,
}) {
  if (!nodeGuard(activeNodesRef)) return;
  const a = audioRef.current;
  if (!a) return;

  const out = getLaneGain('snare');
  if (!out) return;

  const gd = GENRES[genre] || GENRES.techno;
  const nColor = gd.noiseColor || 'white';

  const noise = a.ctx.createBufferSource();
  const nG = a.ctx.createGain();
  const nHP = a.ctx.createBiquadFilter();
  const nBP = a.ctx.createBiquadFilter();

  const tone1 = a.ctx.createOscillator();
  const tone2 = a.ctx.createOscillator();
  const t1G = a.ctx.createGain();
  const t2G = a.ctx.createGain();

  const mix = a.ctx.createGain();
  const sh = a.ctx.createWaveShaper();

  noise.buffer = noiseBuffer(a ? { current: a } : audioRef, 0.18 + drumDecay * 0.16, 1, nColor);

  nHP.type = 'highpass';
  nHP.frequency.value = 1400 + noiseMix * 2200;
  nBP.type = 'bandpass';
  nBP.frequency.value = 2200 + noiseMix * 1200;
  nBP.Q.value = 0.8;

  tone1.type = 'triangle';
  tone2.type = 'sine';
  tone1.frequency.setValueAtTime(180, time);
  tone2.frequency.setValueAtTime(330, time);
  tone1.frequency.exponentialRampToValueAtTime(110, time + 0.06);
  tone2.frequency.exponentialRampToValueAtTime(170, time + 0.05);

  nG.gain.setValueAtTime(0.001, time);
  nG.gain.linearRampToValueAtTime((0.62 + noiseMix * 0.25) * accent, time + 0.001);
  nG.gain.exponentialRampToValueAtTime(0.001, time + 0.11 + drumDecay * 0.12);

  t1G.gain.setValueAtTime(0.001, time);
  t1G.gain.linearRampToValueAtTime(0.28 * accent, time + 0.001);
  t1G.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

  t2G.gain.setValueAtTime(0.001, time);
  t2G.gain.linearRampToValueAtTime(0.14 * accent, time + 0.001);
  t2G.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

  driveCurve(sh, clamp(0.04 + noiseMix * 0.12, 0.03, 0.22));
  mix.gain.value = 0.9;

  noise.connect(nHP);
  nHP.connect(nBP);
  nBP.connect(nG);
  nG.connect(sh);

  tone1.connect(t1G);
  tone2.connect(t2G);

  t1G.connect(mix);
  t2G.connect(mix);
  sh.connect(mix);
  mix.connect(out);

  ss(noise, time);
  ss(tone1, time);
  ss(tone2, time);

  st(noise, time + 0.24 + drumDecay * 0.1);
  st(tone1, time + 0.1);
  st(tone2, time + 0.08);

  gc(noise, [tone1, tone2, nG, nHP, nBP, t1G, t2G, mix, sh], 500);

  trackNode(activeNodesRef, 500);
  flashLane?.('snare', 1);
}

export function playHat({
  audioRef,
  getLaneGain,
  genre,
  noiseMix,
  activeNodesRef,
  flashLane,
  accent = 1,
  open = false,
  time,
}) {
  if (!nodeGuard(activeNodesRef)) return;
  const a = audioRef.current;
  if (!a) return;

  const out = getLaneGain('hat');
  if (!out) return;

  const gd = GENRES[genre] || GENRES.techno;
  const nColor = gd.noiseColor || 'white';

  const noise = a.ctx.createBufferSource();
  const nG = a.ctx.createGain();
  const hp = a.ctx.createBiquadFilter();
  const bp = a.ctx.createBiquadFilter();
  const sh = a.ctx.createWaveShaper();
  const mix = a.ctx.createGain();

  noise.buffer = noiseBuffer(a ? { current: a } : audioRef, open ? 0.22 : 0.08, 1, nColor);

  hp.type = 'highpass';
  hp.frequency.value = open ? 5500 : 7000;

  bp.type = 'bandpass';
  bp.frequency.value = open ? 9000 : 10500;
  bp.Q.value = open ? 0.9 : 1.2;

  const dur = open ? 0.16 : 0.045;
  nG.gain.setValueAtTime(0.001, time);
  nG.gain.linearRampToValueAtTime((0.22 + noiseMix * 0.18) * accent, time + 0.001);
  nG.gain.exponentialRampToValueAtTime(0.001, time + dur);

  driveCurve(sh, clamp(0.02 + noiseMix * 0.05, 0.02, 0.14));
  mix.gain.value = open ? 0.58 : 0.42;

  noise.connect(hp);
  hp.connect(bp);
  bp.connect(nG);
  nG.connect(sh);
  sh.connect(mix);
  mix.connect(out);

  ss(noise, time);
  st(noise, time + dur + 0.02);

  gc(noise, [nG, hp, bp, sh, mix], open ? 350 : 220);

  trackNode(activeNodesRef, open ? 350 : 220);
  flashLane?.('hat', open ? 0.9 : 0.65);
}