import { clamp, rnd, GENRES } from '../music/core';
import { driveCurve } from './engineCore';

const ss = (n, t) => { try { n.start(t); } catch {} };
const st = (n, t) => { try { n.stop(t);  } catch {} };

function cleanup(nodes, ms) {
  const fn = () => nodes.forEach(n => { try { n.disconnect(); } catch {} });
  setTimeout(fn, ms + 80);
  // Only AudioScheduledSourceNode (oscillators, buffer sources) have onended
  const src = nodes.find(n => typeof n.onended !== 'undefined');
  if (src) src.onended = fn;
}
function track(ref, ms) {
  ref.current += 1;
  setTimeout(() => { ref.current = Math.max(0, ref.current - 1); }, ms + 80);
}
function guard(ref, limit = 90) { return ref.current < limit; }

export function noiseBuffer(ctx, dur = 0.22, amt = 1, color = 'white') {
  const sr  = ctx.sampleRate;
  const buf = ctx.createBuffer(1, Math.floor(sr * dur), sr);
  const d   = buf.getChannelData(0);
  if (color === 'white') {
    for (let i = 0; i < d.length; i++) d[i] = (rnd() * 2 - 1) * amt;
    return buf;
  }
  let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0;
  for (let i = 0; i < d.length; i++) {
    const w = rnd() * 2 - 1;
    if (color === 'pink') {
      b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
      b2=0.969*b2+w*0.153852;   b3=0.8665*b3+w*0.310486;
      b4=0.55*b4+w*0.532952;    b5=-0.7616*b5-w*0.016898;
      d[i] = (b0+b1+b2+b3+b4+b5+w*0.5362)*amt*0.11;
    } else { b0=0.99*b0+w*0.01; d[i]=b0*amt*3; }
  }
  return buf;
}

// ── KICK ──────────────────────────────────────────────────────────────────────
export function playKick({ audioRef, getLaneGain, genre, drumDecay, noiseMix,
  bassSubAmt, activeNodesRef, flashLane, accent = 1, time }) {
  if (!guard(activeNodesRef)) return;
  const a = audioRef.current; if (!a) return;
  const out = getLaneGain('kick'); if (!out) return;

  const gd  = GENRES[genre] || GENRES.techno;
  const kf  = gd.kickFreq || 80;
  const ke  = gd.kickEnd  || 30;
  const env = 0.06 + drumDecay * 0.10;
  const dec = 0.14 + drumDecay * 0.28;

  const body  = a.ctx.createOscillator();
  const sub   = a.ctx.createOscillator();
  const punch = a.ctx.createOscillator();
  const bG = a.ctx.createGain();
  const sG = a.ctx.createGain();
  const pG = a.ctx.createGain();

  const clickBuf = a.ctx.createBuffer(1, Math.floor(a.ctx.sampleRate * 0.004), a.ctx.sampleRate);
  const cd = clickBuf.getChannelData(0);
  for (let i = 0; i < cd.length; i++) cd[i] = rnd() * 2 - 1;
  const click = a.ctx.createBufferSource(); click.buffer = clickBuf;
  const cG    = a.ctx.createGain();
  const drive = a.ctx.createWaveShaper();
  const mG    = a.ctx.createGain();
  driveCurve(drive, 0.04 + noiseMix * 0.10);

  body.type  = 'sine';
  body.frequency.setValueAtTime(kf * 2.2, time);
  body.frequency.exponentialRampToValueAtTime(Math.max(18, ke), time + env);
  sub.type   = 'sine';
  sub.frequency.setValueAtTime(kf * 0.5, time);
  sub.frequency.exponentialRampToValueAtTime(Math.max(15, ke * 0.5), time + env);
  punch.type = 'triangle';
  punch.frequency.setValueAtTime(kf * 4, time);
  punch.frequency.exponentialRampToValueAtTime(kf, time + 0.015);

  bG.gain.setValueAtTime(0, time);
  bG.gain.linearRampToValueAtTime(0.88 * accent, time + 0.001);
  bG.gain.exponentialRampToValueAtTime(0.001, time + dec);
  sG.gain.setValueAtTime(0, time);
  sG.gain.linearRampToValueAtTime(0.55 * accent * bassSubAmt, time + 0.002);
  sG.gain.exponentialRampToValueAtTime(0.001, time + dec);
  pG.gain.setValueAtTime(0.22 * accent, time);
  pG.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
  cG.gain.setValueAtTime(0.18 + noiseMix * 0.12, time);
  cG.gain.exponentialRampToValueAtTime(0.001, time + 0.010);
  mG.gain.value = 0.96;

  body.connect(bG); bG.connect(mG);
  sub.connect(sG);  sG.connect(mG);
  punch.connect(pG);pG.connect(mG);
  click.connect(cG);cG.connect(drive);drive.connect(mG);
  mG.connect(out);

  ss(body, time); ss(sub, time); ss(punch, time); ss(click, time);
  st(body, time+dec+0.02); st(sub, time+dec+0.02); st(punch, time+0.03); st(click, time+0.02);

  const ms = (dec + 0.1) * 1000;
  cleanup([body, sub, punch, click, bG, sG, pG, cG, drive, mG], ms);
  track(activeNodesRef, ms);
  flashLane?.('kick', 1);
}

// ── SNARE ────────────────────────────────────────────────────────────────────
export function playSnare({ audioRef, getLaneGain, genre, drumDecay, noiseMix,
  activeNodesRef, flashLane, accent = 1, time, rimshot = false }) {
  if (!guard(activeNodesRef)) return;
  const a = audioRef.current; if (!a) return;
  const out = getLaneGain('snare'); if (!out) return;

  if (rimshot) {
    const o1 = a.ctx.createOscillator(); o1.type = 'square'; o1.frequency.value = 400;
    const o2 = a.ctx.createOscillator(); o2.type = 'sine';   o2.frequency.value = 820;
    const g  = a.ctx.createGain();
    g.gain.setValueAtTime(0.45 * accent, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.038);
    o1.connect(g); o2.connect(g); g.connect(out);
    ss(o1, time); ss(o2, time); st(o1, time+0.05); st(o2, time+0.05);
    cleanup([o1, o2, g], 120); track(activeNodesRef, 120);
    flashLane?.('snare', 0.6); return;
  }

  const gd     = GENRES[genre] || GENRES.techno;
  const nColor = gd.noiseColor || 'white';
  const nDur   = 0.10 + drumDecay * 0.14;
  const noise  = a.ctx.createBufferSource();
  noise.buffer = noiseBuffer(a.ctx, nDur + 0.06, 1, nColor);
  const nHP = a.ctx.createBiquadFilter(); nHP.type='highpass'; nHP.frequency.value=1200+noiseMix*2400;
  const nBP = a.ctx.createBiquadFilter(); nBP.type='bandpass'; nBP.frequency.value=2400+noiseMix*1400; nBP.Q.value=0.7;
  const nG  = a.ctx.createGain();
  const t1  = a.ctx.createOscillator(); t1.type='triangle'; t1.frequency.setValueAtTime(195,time); t1.frequency.exponentialRampToValueAtTime(115,time+0.065);
  const t2  = a.ctx.createOscillator(); t2.type='sine';     t2.frequency.setValueAtTime(340,time); t2.frequency.exponentialRampToValueAtTime(175,time+0.055);
  const t1G = a.ctx.createGain(); const t2G = a.ctx.createGain();
  const sh  = a.ctx.createWaveShaper(); driveCurve(sh, clamp(0.05+noiseMix*0.14,0.03,0.25));
  const mix = a.ctx.createGain(); mix.gain.value = 0.88;

  nG.gain.setValueAtTime(0.001,time); nG.gain.linearRampToValueAtTime((0.65+noiseMix*0.28)*accent,time+0.001); nG.gain.exponentialRampToValueAtTime(0.001,time+nDur);
  t1G.gain.setValueAtTime(0.001,time); t1G.gain.linearRampToValueAtTime(0.30*accent,time+0.001); t1G.gain.exponentialRampToValueAtTime(0.001,time+0.085);
  t2G.gain.setValueAtTime(0.001,time); t2G.gain.linearRampToValueAtTime(0.15*accent,time+0.001); t2G.gain.exponentialRampToValueAtTime(0.001,time+0.055);

  noise.connect(nHP); nHP.connect(nBP); nBP.connect(nG); nG.connect(sh);
  t1.connect(t1G); t2.connect(t2G);
  t1G.connect(mix); t2G.connect(mix); sh.connect(mix); mix.connect(out);

  ss(noise,time); ss(t1,time); ss(t2,time);
  st(noise,time+nDur+0.02); st(t1,time+0.10); st(t2,time+0.08);

  const ms = (nDur+0.15)*1000;
  cleanup([noise,t1,t2,nG,nHP,nBP,t1G,t2G,sh,mix], ms);
  track(activeNodesRef, ms);
  flashLane?.('snare', 1);
}

// ── CLAP ──────────────────────────────────────────────────────────────────────
export function playClap({ audioRef, getLaneGain, noiseMix,
  activeNodesRef, flashLane, accent = 1, time }) {
  if (!guard(activeNodesRef)) return;
  const a = audioRef.current; if (!a) return;
  const out = getLaneGain('snare'); if (!out) return;

  const offsets = [0, 0.008, 0.016, 0.028];
  const nodes   = [];
  offsets.forEach(off => {
    const buf = noiseBuffer(a.ctx, 0.05, 1, 'white');
    const src = a.ctx.createBufferSource(); src.buffer = buf;
    const bp  = a.ctx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=1100+noiseMix*600; bp.Q.value=0.9;
    const g   = a.ctx.createGain();
    g.gain.setValueAtTime(0.38*accent, time+off);
    g.gain.exponentialRampToValueAtTime(0.001, time+off+0.06);
    src.connect(bp); bp.connect(g); g.connect(out);
    ss(src, time+off); st(src, time+off+0.07);
    nodes.push(src, bp, g);
  });
  setTimeout(() => nodes.forEach(n => { try { n.disconnect(); } catch {} }), 280);
  track(activeNodesRef, 280);
  flashLane?.('snare', 0.85);
}

// ── HIHAT ────────────────────────────────────────────────────────────────────
export function playHat({ audioRef, getLaneGain, genre, noiseMix,
  activeNodesRef, flashLane, accent = 1, open = false, time }) {
  if (!guard(activeNodesRef)) return;
  const a = audioRef.current; if (!a) return;
  const out = getLaneGain('hat'); if (!out) return;

  const gd     = GENRES[genre] || GENRES.techno;
  const nColor = gd.noiseColor || 'white';
  const dur    = open ? 0.18 + noiseMix * 0.12 : 0.04 + noiseMix * 0.02;

  // Metallic model: 6 square oscillators (TR-909 style)
  const freqs = [205.3, 369.9, 437.0, 523.0, 612.3, 785.1];
  const oscG  = a.ctx.createGain(); oscG.gain.value = 0.07;
  const oscNodes = freqs.map(f => {
    const o = a.ctx.createOscillator(); o.type='square'; o.frequency.value=f*(open?1.0:1.02);
    o.connect(oscG); ss(o,time); st(o,time+dur+0.01); return o;
  });

  const noise = a.ctx.createBufferSource();
  noise.buffer = noiseBuffer(a.ctx, dur+0.04, 1, nColor);
  const hp = a.ctx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=open?5000:6500;
  const bp = a.ctx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=open?8500:10000; bp.Q.value=open?0.8:1.1;
  const nG = a.ctx.createGain();
  nG.gain.setValueAtTime(0.001,time); nG.gain.linearRampToValueAtTime((0.25+noiseMix*0.20)*accent,time+0.001); nG.gain.exponentialRampToValueAtTime(0.001,time+dur);
  const sh = a.ctx.createWaveShaper(); driveCurve(sh, clamp(0.02+noiseMix*0.06,0.01,0.15));
  const mix = a.ctx.createGain(); mix.gain.value = open?0.52:0.40;

  noise.connect(hp); hp.connect(bp); bp.connect(nG); nG.connect(sh); sh.connect(mix);
  oscG.connect(mix); mix.connect(out);
  ss(noise,time); st(noise,time+dur+0.02);

  const ms = (dur+0.1)*1000;
  const all = [...oscNodes, noise, oscG, hp, bp, nG, sh, mix];
  setTimeout(() => all.forEach(n => { try { n.disconnect(); } catch {} }), ms+80);
  track(activeNodesRef, ms);
  flashLane?.('hat', open?0.88:0.62);
}

// ── TOM ───────────────────────────────────────────────────────────────────────
export function playTom({ audioRef, getLaneGain, activeNodesRef,
  flashLane, accent = 1, time, freq = 120, decay = 0.25 }) {
  if (!guard(activeNodesRef)) return;
  const a = audioRef.current; if (!a) return;
  const out = getLaneGain('kick'); if (!out) return;

  const body  = a.ctx.createOscillator(); body.type='sine';
  body.frequency.setValueAtTime(freq*2, time);
  body.frequency.exponentialRampToValueAtTime(Math.max(20, freq*0.8), time+decay*0.3);
  const bG = a.ctx.createGain();
  bG.gain.setValueAtTime(0,time); bG.gain.linearRampToValueAtTime(0.75*accent,time+0.002); bG.gain.exponentialRampToValueAtTime(0.001,time+decay);

  const noise = a.ctx.createBufferSource();
  noise.buffer = noiseBuffer(a.ctx, 0.02, 0.4, 'white');
  const nG = a.ctx.createGain();
  nG.gain.setValueAtTime(0.3*accent,time); nG.gain.exponentialRampToValueAtTime(0.001,time+0.025);

  const mix = a.ctx.createGain(); mix.gain.value=0.88;
  body.connect(bG); noise.connect(nG); bG.connect(mix); nG.connect(mix); mix.connect(out);
  ss(body,time); ss(noise,time); st(body,time+decay+0.02); st(noise,time+0.03);

  const ms = (decay+0.1)*1000;
  cleanup([body, noise, bG, nG, mix], ms);
  track(activeNodesRef, ms);
  flashLane?.('kick', 0.7);
}

// ── RIDE ──────────────────────────────────────────────────────────────────────
export function playRide({ audioRef, getLaneGain, activeNodesRef,
  flashLane, accent = 1, time }) {
  if (!guard(activeNodesRef)) return;
  const a = audioRef.current; if (!a) return;
  const out = getLaneGain('hat'); if (!out) return;

  const freqs = [432.5, 528.0, 648.0, 793.5];
  const mix   = a.ctx.createGain(); mix.gain.value = 0.36 * accent;
  const oscNodes = freqs.map(f => {
    const o = a.ctx.createOscillator(); o.type='square'; o.frequency.value=f;
    o.connect(mix); ss(o,time); st(o,time+0.55); return o;
  });
  const env = a.ctx.createGain();
  env.gain.setValueAtTime(0.001,time); env.gain.linearRampToValueAtTime(1,time+0.002); env.gain.exponentialRampToValueAtTime(0.001,time+0.5);
  const hp = a.ctx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=4000;
  mix.connect(env); env.connect(hp); hp.connect(out);

  const ms = 650;
  setTimeout(() => [...oscNodes,mix,env,hp].forEach(n => { try { n.disconnect(); } catch {} }), ms);
  track(activeNodesRef, ms);
  flashLane?.('hat', 0.5);
}

// ── PERCUSSION (FM blip) ──────────────────────────────────────────────────────
export function playPerc({ audioRef, getLaneGain, activeNodesRef,
  flashLane, accent = 1, time, freq = 800, decay = 0.08, fmRatio = 2.1 }) {
  if (!guard(activeNodesRef)) return;
  const a = audioRef.current; if (!a) return;
  const out = getLaneGain('snare'); if (!out) return;

  const car = a.ctx.createOscillator(); car.type='sine'; car.frequency.value=freq;
  const mod = a.ctx.createOscillator(); mod.type='sine'; mod.frequency.value=freq*fmRatio;
  const mG  = a.ctx.createGain();
  mG.gain.setValueAtTime(freq*1.5,time); mG.gain.exponentialRampToValueAtTime(1,time+decay*0.5);
  const env = a.ctx.createGain();
  env.gain.setValueAtTime(0.5*accent,time); env.gain.exponentialRampToValueAtTime(0.001,time+decay);

  mod.connect(mG); mG.connect(car.frequency); car.connect(env); env.connect(out);
  ss(car,time); ss(mod,time); st(car,time+decay+0.02); st(mod,time+decay+0.02);

  const ms = (decay+0.05)*1000;
  cleanup([car,mod,mG,env], ms);
  track(activeNodesRef, ms);
  flashLane?.('snare', 0.5);
}
