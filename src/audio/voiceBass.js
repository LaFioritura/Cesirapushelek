import { clamp, rnd, GENRES, MODES, NOTE_FREQ, NOTE_MIDI, transposeNote } from '../music/core';

// ── Polyphony helper ───────────────────────────────────────────────────────────
export function getVoiceNotes({ baseNote, lane = 'synth', modeName, polySynth, bassStack }) {
  const mode = MODES[modeName] || MODES.minor;
  const pool = lane === 'bass' ? mode.b : mode.s;
  const idx  = pool.indexOf(baseNote);

  if (lane === 'bass') {
    if (!bassStack) return [baseNote];
    const fifth = idx > -1 ? pool[Math.min(idx + 4, pool.length - 1)] : transposeNote(baseNote, 7);
    return [...new Set([baseNote, fifth])];
  }
  if (!polySynth) return [baseNote];
  if (idx === -1) return [...new Set([baseNote, transposeNote(baseNote, 4), transposeNote(baseNote, 7)])];
  return [...new Set([pool[idx], pool[Math.min(idx+2, pool.length-1)], pool[Math.min(idx+4, pool.length-1)]])];
}

// ── Shared cleanup ─────────────────────────────────────────────────────────────
function cleanup(nodes, ms) {
  const fn = () => nodes.forEach(n => { try { n.disconnect(); } catch {} });
  setTimeout(fn, ms + 80);
}
function releaseNode(ref, ms) {
  ref.current += 1;
  setTimeout(() => { ref.current = Math.max(0, ref.current - 1); }, ms + 80);
}

// ── BASS VOICE ────────────────────────────────────────────────────────────────
//
// Modes (driven by genre.bassMode):
//   sub     — clean sine + sub, LFO on filter (warm, deep)
//   grit    — sawtooth + sub, mild drive (d'n'b, techno)
//   drone   — detuned saw pair, slow LFO (ambient, cinematic)
//   saw     — single saw, punchy
//   pulse   — square + sub (acid-ish)
//   fm      — carrier + modulator, modIndex sweeps (dark techno)
//   bit     — square carrier + near-2x modulator (industrial, acid)
//   fold    — sawtooth + ring-mod (experimental)
//   wet     — triangle + slow ring (ambient, experimental)
//   pluck   — Karplus-Strong model (percussive attack + fast decay)
//   wobble  — saw + LFO on filter at audio rate (dubstep-ish)
//   reese   — two detuned saws, filter glide (neuro)
//
export function playBassVoice({
  audioRef, getLaneGain, genre, note, accent, time,
  lenSteps = 1, stepSec, bassFilter, tone, compress,
  bassSubAmt, fmIdx, activeNodesRef,
}) {
  if (!audioRef.current) return;
  if (activeNodesRef?.current >= 90) return;

  const a    = audioRef.current;
  const f    = NOTE_FREQ[note] || 110;
  const dur  = clamp(stepSec() * lenSteps * 0.90, 0.04, 6);
  const atk  = Math.min(0.008, dur * 0.05);
  const rel  = Math.max(0.04, dur * 0.86);
  const mode = GENRES[genre]?.bassMode || 'sub';
  const dest = getLaneGain('bass') || a.bus;
  const ms   = (rel + 0.3) * 1000;
  releaseNode(activeNodesRef, ms);

  // Master envelope + filter shared by all modes
  const fil = a.ctx.createBiquadFilter();
  fil.type = 'lowpass';
  fil.frequency.setValueAtTime(clamp(60 + bassFilter * 3800 + tone * 700, 60, 18000), time);
  fil.Q.value = 0.4 + compress * 2.5;

  const g = a.ctx.createGain();
  g.gain.setValueAtTime(0, time);
  g.gain.linearRampToValueAtTime(0.60 * accent, time + atk);
  g.gain.setValueAtTime(0.60 * accent, time + rel * 0.28);
  g.gain.exponentialRampToValueAtTime(0.0001, time + rel);

  fil.connect(g); g.connect(dest);

  // ── MODE IMPLEMENTATIONS ───────────────────────────────────────────────────

  if (mode === 'pluck') {
    // Karplus-Strong: noise burst → delay with feedback → decays naturally
    const bufLen = Math.max(2, Math.floor(a.ctx.sampleRate / f));
    const plkBuf = a.ctx.createBuffer(1, bufLen, a.ctx.sampleRate);
    const pd = plkBuf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) pd[i] = rnd() * 2 - 1;

    const src = a.ctx.createBufferSource(); src.buffer = plkBuf; src.loop = true;
    const dly = a.ctx.createDelay(0.05); dly.delayTime.value = 1 / f;
    const fb  = a.ctx.createGain(); fb.gain.value = 0.980 - tone * 0.06;
    const lp  = a.ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=3000+tone*4000;

    src.connect(dly); dly.connect(lp); lp.connect(fb); fb.connect(dly); lp.connect(fil);
    ss(src, time); st(src, time + 0.025);

    const plDur = Math.max(0.3, rel * 1.4 + bassFilter * 0.8);
    cleanup([src, dly, fb, lp, fil, g], plDur * 1000 + 100);
    return;
  }

  if (mode === 'wobble') {
    // Saw + LFO on filter cutoff — rate increases with bassFilter
    const osc = a.ctx.createOscillator(); osc.type='sawtooth'; osc.frequency.value=f;
    const sub = a.ctx.createOscillator(); sub.type='sine';     sub.frequency.value=f*0.5;
    const sG  = a.ctx.createGain(); sG.gain.value = bassSubAmt * 0.4;

    const lfo   = a.ctx.createOscillator(); lfo.type='sine';
    lfo.frequency.value = 2 + bassFilter * 12; // 2–14 Hz
    const lfoG  = a.ctx.createGain(); lfoG.gain.value = 1500 + tone * 2000;
    fil.frequency.setValueAtTime(400 + tone * 800, time);
    lfo.connect(lfoG); lfoG.connect(fil.frequency);

    osc.connect(fil); sub.connect(sG); sG.connect(fil);
    ss(osc,time); ss(sub,time); ss(lfo,time);
    st(osc,time+rel+0.05); st(sub,time+rel+0.05); st(lfo,time+rel+0.05);
    cleanup([osc,sub,sG,lfo,lfoG,fil,g], ms);
    return;
  }

  if (mode === 'reese') {
    // Two detuned saws, filter sweeps from closed to open over note duration
    const o1 = a.ctx.createOscillator(); o1.type='sawtooth'; o1.frequency.value=f;
    const o2 = a.ctx.createOscillator(); o2.type='sawtooth'; o2.frequency.value=f*1.018;
    const o3 = a.ctx.createOscillator(); o3.type='sine';     o3.frequency.value=f*0.499;
    const sG = a.ctx.createGain(); sG.gain.value = 0.3;

    const reeseFilter = a.ctx.createBiquadFilter();
    reeseFilter.type='lowpass'; reeseFilter.Q.value = 2 + compress * 4;
    reeseFilter.frequency.setValueAtTime(80 + bassFilter * 200, time);
    reeseFilter.frequency.linearRampToValueAtTime(400 + bassFilter * 3000 + tone * 1000, time + rel * 0.6);

    o1.connect(reeseFilter); o2.connect(reeseFilter); o3.connect(sG); sG.connect(reeseFilter);
    reeseFilter.connect(g); // bypass shared fil for reese
    // disconnect shared fil from g, connect reeseFilter directly
    try { fil.disconnect(g); } catch {}

    ss(o1,time); ss(o2,time); ss(o3,time);
    st(o1,time+rel+0.05); st(o2,time+rel+0.05); st(o3,time+rel+0.05);
    cleanup([o1,o2,o3,sG,reeseFilter,g], ms);
    return;
  }

  if (mode === 'fm' || mode === 'bit') {
    const ratio = mode === 'bit' ? 1.99 : 2.0;
    const car = a.ctx.createOscillator(); car.type = mode==='bit' ? 'square' : 'sine'; car.frequency.value=f;
    const mod = a.ctx.createOscillator(); mod.type='sine'; mod.frequency.value=f*ratio;
    const mG  = a.ctx.createGain();
    mG.gain.setValueAtTime(f * fmIdx * (mode==='bit'?3:1.5), time);
    mG.gain.exponentialRampToValueAtTime(Math.max(6, f*0.22), time+rel*0.7);
    mod.connect(mG); mG.connect(car.frequency); car.connect(fil);
    ss(car,time); ss(mod,time); st(car,time+rel+0.05); st(mod,time+rel+0.05);
    cleanup([car,mod,mG,fil,g], ms); return;
  }

  if (mode === 'fold' || mode === 'wet') {
    const car  = a.ctx.createOscillator(); car.type = mode==='fold'?'sawtooth':'triangle'; car.frequency.value=f;
    const ring = a.ctx.createOscillator(); ring.type='sine'; ring.frequency.value=f*1.5;
    const sub  = a.ctx.createOscillator(); sub.type='sine';  sub.frequency.value=f*0.5;
    const rm   = a.ctx.createGain(); rm.gain.value=0.18+compress*0.10;
    const rg   = a.ctx.createGain(); rg.gain.value=0.7;
    const sG   = a.ctx.createGain(); sG.gain.value=bassSubAmt*0.38;
    ring.connect(rm); rm.connect(rg.gain);
    car.connect(rg); rg.connect(fil); sub.connect(sG); sG.connect(fil);
    ss(car,time); ss(ring,time); ss(sub,time);
    st(car,time+rel+0.05); st(ring,time+rel+0.05); st(sub,time+rel+0.05);
    cleanup([car,ring,sub,rm,rg,sG,fil,g], ms); return;
  }

  // Default: sub, grit, drone, saw, pulse
  const types = { sub:'sine', grit:'sawtooth', drone:'sawtooth', saw:'sawtooth', pulse:'square' };
  const o1 = a.ctx.createOscillator(); o1.type = types[mode] || 'sawtooth'; o1.frequency.value=f;
  const o2 = a.ctx.createOscillator(); o2.type='sine'; o2.frequency.value=f*(mode==='drone'?1.008:1.004);
  const sG = a.ctx.createGain(); sG.gain.value = bassSubAmt*(mode==='sub'?0.85:0.3);

  // Slow LFO on filter for drone/sub
  if (mode==='drone'||mode==='sub') {
    const lfo = a.ctx.createOscillator(); lfo.frequency.value = mode==='drone'?0.3:0.8;
    const lg  = a.ctx.createGain(); lg.gain.value = mode==='drone'?80:20;
    lfo.connect(lg); lg.connect(fil.frequency);
    ss(lfo,time); st(lfo,time+rel+0.1);
    cleanup([lfo,lg], ms+200);
  }

  o1.connect(fil); o2.connect(sG); sG.connect(fil);
  ss(o1,time); ss(o2,time); st(o1,time+rel+0.05); st(o2,time+rel+0.05);
  cleanup([o1,o2,sG,fil,g], ms);
}

// ── PUBLIC API ─────────────────────────────────────────────────────────────────
export function playBass({
  audioRef, getLaneGain, genre, note, accent, time, lenSteps = 1, stepSec,
  bassFilter, tone, compress, bassSubAmt, fmIdx, activeNodesRef,
  flashLane, modeName, bassStack, setActiveNotes, midiRef,
}) {
  const notes = Array.isArray(note)
    ? note
    : getVoiceNotes({ baseNote: note, lane: 'bass', modeName, bassStack });

  const voiceAccent = accent / Math.sqrt(Math.max(1, notes.length));
  notes.forEach((v, i) => playBassVoice({
    audioRef, getLaneGain, genre, note: v, accent: voiceAccent,
    time: time + i * 0.002, lenSteps, stepSec,
    bassFilter, tone, compress, bassSubAmt, fmIdx, activeNodesRef,
  }));

  setActiveNotes?.((p) => ({ ...p, bass: notes.join(' · ') }));
  flashLane?.('bass', 1);

  // MIDI out (optional)
  if (midiRef?.current) {
    const out = [...midiRef.current.outputs.values()][0];
    if (out) {
      const v = Math.round(clamp(accent, 0, 1) * 127);
      const relMs = Math.max(40, clamp(stepSec() * lenSteps * 0.90, 0.04, 6) * 860);
      notes.forEach(n => {
        out.send([0x93, NOTE_MIDI[n] || 48, v]);
        setTimeout(() => out.send([0x83, NOTE_MIDI[n] || 48, 0]), relMs);
      });
    }
  }
}
