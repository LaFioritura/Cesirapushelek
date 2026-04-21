import { clamp, GENRES, NOTE_FREQ } from '../music/core';
import { getVoiceNotes } from './voiceBass';

function noiseBuffer(ctx, dur = 0.04) {
  const b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}
function cleanup(nodes, ms) {
  const fn = () => nodes.forEach(n => { try { n.disconnect(); } catch {} });
  setTimeout(fn, ms + 80);
  if (nodes[0]) nodes[0].onended = fn;
}
function releaseNode(ref, ms) {
  ref.current += 1;
  setTimeout(() => { ref.current = Math.max(0, ref.current - 1); }, ms + 80);
}

// ── SYNTH VOICE ───────────────────────────────────────────────────────────────
//
// Modes (driven by genre.synthMode):
//   lead     — sawtooth + sub, tight envelope, resonant filter
//   organ    — square + harmonics, medium release
//   air      — triangle, slow attack, airy
//   strings  — detuned saws, slow attack/release
//   star     — bandpass triangle (plucky bell-like)
//   mist     — triangle fog, very slow
//   glass    — Karplus-Strong (bell/glass resonator)
//   pad      — 3 detuned saws, long attack, chorus-like
//   choir    — aliased saws with formant filter
//   ether    — additive sines (overtone series)
//   rhodes   — FM piano (carrier + modulator with pitch-scaled index)
//   supersaw — 7 detuned oscillators (trance/club)
//   mono     — single saw + portamento-like pitch slide
//
export function playSynthVoice({
  audioRef, getLaneGain, genre, note, accent, time,
  lenSteps = 1, stepSec, synthFilter, tone, compress, space, activeNodesRef,
}) {
  if (!audioRef.current) return;
  if (activeNodesRef?.current >= 90) return;

  const a    = audioRef.current;
  const f    = NOTE_FREQ[note] || 440;
  const dur  = clamp(stepSec() * lenSteps * 0.92, 0.04, 6);
  const mode = GENRES[genre]?.synthMode || 'lead';
  const ms   = (dur + 2.0) * 1000;
  const dest = getLaneGain('synth') || a.bus;
  releaseNode(activeNodesRef, ms);

  // ── GLASS / BELL (Karplus-Strong) ─────────────────────────────────────────
  if (mode === 'glass' || mode === 'bell') {
    const rel  = Math.max(0.4, dur * 1.3 + space * 2.5);
    const src  = a.ctx.createBufferSource(); src.buffer = noiseBuffer(a.ctx, 0.04);
    const dly  = a.ctx.createDelay(0.05); dly.delayTime.value = 1 / f;
    const fb   = a.ctx.createGain(); fb.gain.value = clamp(0.97 - tone * 0.12, 0.80, 0.98);
    const lp   = a.ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=1800+tone*7000;
    const env  = a.ctx.createGain();
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(0.50 * accent, time + 0.001);
    env.gain.exponentialRampToValueAtTime(0.001, time + rel);
    src.connect(dly); dly.connect(lp); lp.connect(fb); fb.connect(dly); lp.connect(env); env.connect(dest);
    try { src.start(time); } catch {}; try { src.stop(time + 0.04); } catch {};
    cleanup([src, dly, fb, lp, env], rel * 1000 + 200); return;
  }

  // ── ETHER (additive overtone series) ──────────────────────────────────────
  if (mode === 'ether') {
    const rel    = Math.max(0.4, dur * 1.1 + space * 1.5);
    const ratios = [1, 2, 3, 4, 5, 6];
    const gains  = [0.5, 0.25, 0.14, 0.08, 0.05, 0.03];
    const mix    = a.ctx.createGain(); mix.gain.value = 0.32 * accent;
    const env    = a.ctx.createGain();
    const atk    = 0.08 + dur * 0.06;
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(1, time + atk);
    env.gain.setValueAtTime(1, time + Math.max(atk + 0.01, dur * 0.5));
    env.gain.exponentialRampToValueAtTime(0.001, time + rel);
    const oscs = ratios.map((r, i) => {
      const o = a.ctx.createOscillator(); o.type='sine'; o.frequency.value = f * r;
      const g = a.ctx.createGain(); g.gain.value = gains[i];
      o.connect(g); g.connect(mix);
      try { o.start(time); } catch {}; try { o.stop(time + rel + 0.1); } catch {};
      return [o, g];
    });
    mix.connect(env); env.connect(dest);
    const allNodes = oscs.flat().concat([mix, env]);
    cleanup(allNodes, rel * 1000 + 200); return;
  }

  // ── RHODES (FM piano) ─────────────────────────────────────────────────────
  if (mode === 'rhodes') {
    const atk  = 0.003;
    const rel  = Math.max(0.15, dur * 0.8 + space * 0.6);
    const car  = a.ctx.createOscillator(); car.type='sine'; car.frequency.value=f;
    const mod  = a.ctx.createOscillator(); mod.type='sine'; mod.frequency.value=f*2.756;
    const mIdx = (f * 0.5) * (0.8 + tone * 0.8); // pitch-scaled modulation
    const mG   = a.ctx.createGain();
    mG.gain.setValueAtTime(mIdx, time);
    mG.gain.exponentialRampToValueAtTime(mIdx * 0.1, time + rel * 0.5);
    const env  = a.ctx.createGain();
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(0.42 * accent, time + atk);
    env.gain.setValueAtTime(0.42 * accent, time + Math.max(atk + 0.01, dur * 0.35));
    env.gain.exponentialRampToValueAtTime(0.001, time + rel);
    // Subtle tremolo
    const trem = a.ctx.createOscillator(); trem.frequency.value = 5 + tone * 2;
    const tG   = a.ctx.createGain(); tG.gain.value = 0.04;
    trem.connect(tG); tG.connect(env.gain);
    mod.connect(mG); mG.connect(car.frequency); car.connect(env); env.connect(dest);
    [car,mod,trem].forEach(o => { try { o.start(time); } catch {}; try { o.stop(time+rel+0.15); } catch {}; });
    cleanup([car,mod,trem,mG,tG,env], rel*1000+200); return;
  }

  // ── SUPERSAW (7 detuned oscs) ─────────────────────────────────────────────
  if (mode === 'supersaw') {
    const atk  = 0.01 + dur * 0.02;
    const rel  = Math.max(0.12, dur * 0.7 + space * 0.5);
    const detunes = [-0.12, -0.08, -0.04, 0, 0.04, 0.08, 0.12];
    const mix  = a.ctx.createGain(); mix.gain.value = 0.16;
    const fil  = a.ctx.createBiquadFilter(); fil.type='lowpass';
    fil.frequency.setValueAtTime(300 + synthFilter * 2000 + tone * 1500, time);
    fil.frequency.linearRampToValueAtTime(600 + synthFilter * 6000 + tone * 2000, time + atk * 4);
    fil.Q.value = 0.5 + compress * 1.5;
    const env  = a.ctx.createGain();
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(0.30 * accent, time + atk);
    env.gain.setValueAtTime(0.30 * accent, time + Math.max(atk+0.01, dur*0.55));
    env.gain.exponentialRampToValueAtTime(0.001, time + rel);
    const oscs = detunes.map(dt => {
      const o = a.ctx.createOscillator(); o.type='sawtooth';
      o.frequency.value = f * Math.pow(2, dt / 12);
      o.connect(mix);
      try { o.start(time); } catch {}; try { o.stop(time+rel+0.1); } catch {};
      return o;
    });
    mix.connect(fil); fil.connect(env); env.connect(dest);
    cleanup([...oscs, mix, fil, env], rel*1000+200); return;
  }

  // ── PAD / CHOIR / MIST (3-osc detuned) ──────────────────────────────────
  if (mode === 'pad' || mode === 'choir' || mode === 'mist') {
    const atk  = 0.08 + dur * 0.10;
    const rel  = Math.max(atk + 0.15, dur * 0.95 + space * 0.8);
    const o1   = a.ctx.createOscillator(); o1.type='sawtooth'; o1.frequency.value=f;
    const o2   = a.ctx.createOscillator(); o2.type='sawtooth'; o2.frequency.value=f*1.014;
    const o3   = a.ctx.createOscillator(); o3.type='sine';     o3.frequency.value=f*0.994;

    // Formant filter for choir
    const fil  = a.ctx.createBiquadFilter();
    fil.type   = mode === 'choir' ? 'bandpass' : 'lowpass';
    fil.frequency.setValueAtTime(350 + tone * 2200, time);
    fil.frequency.linearRampToValueAtTime(900 + tone * 5500, time + atk * 2);
    fil.Q.value = mode === 'choir' ? 1.8 + compress * 2 : 0.4 + compress * 1.4;

    const mix  = a.ctx.createGain(); mix.gain.value = 0.33;
    const env  = a.ctx.createGain();
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(0.36 * accent, time + atk);
    env.gain.setValueAtTime(0.36 * accent, time + Math.max(atk+0.01, dur*0.65));
    env.gain.exponentialRampToValueAtTime(0.001, time + rel);

    o1.connect(mix); o2.connect(mix); o3.connect(mix); mix.connect(fil); fil.connect(env); env.connect(dest);
    [o1,o2,o3].forEach(o => { try { o.start(time); } catch {}; try { o.stop(time+rel+0.12); } catch {}; });
    cleanup([o1,o2,o3,mix,fil,env], rel*1000+200); return;
  }

  // ── DEFAULT (lead, organ, air, strings, star, mono) ─────────────────────
  const atk  = mode==='lead'||mode==='mono' ? 0.004
              : mode==='strings'||mode==='air' ? 0.04
              : 0.012;
  const rel  = mode==='lead'||mode==='mono' ? Math.max(0.08, dur*0.55)
              : mode==='organ'              ? Math.max(0.14, dur*0.80)
              :                              Math.max(0.22, dur*1.0 + space*0.5);

  const types = { lead:'sawtooth', organ:'square', air:'triangle', strings:'sawtooth', star:'triangle', mono:'sawtooth' };
  const o1 = a.ctx.createOscillator(); o1.type = types[mode] || 'sawtooth'; o1.frequency.value=f;
  const o2 = a.ctx.createOscillator(); o2.type = mode==='organ'?'square':'sawtooth'; o2.frequency.value=f*1.008;
  const sub = a.ctx.createOscillator(); sub.type='sine'; sub.frequency.value=f*0.5;

  const mix = a.ctx.createGain(); mix.gain.value = mode==='lead'?0.22:0.28;
  const sG  = a.ctx.createGain(); sG.gain.value  = mode==='strings'?0.08:0.12;

  const fil = a.ctx.createBiquadFilter();
  fil.type  = mode==='star' ? 'bandpass' : 'lowpass';
  fil.frequency.setValueAtTime(400 + synthFilter*3000 + tone*1200, time);
  fil.frequency.linearRampToValueAtTime(800 + synthFilter*5500 + tone*2000, time + atk*6);
  fil.Q.value = mode==='lead' ? 1.6+compress*2.2
               : mode==='star' ? 3.5
               : 0.5+compress*1.4;

  // Vibrato for strings/air
  if (mode==='strings' || mode==='air') {
    const vibOsc = a.ctx.createOscillator(); vibOsc.frequency.value = 5.5 + tone * 1.5;
    const vibG   = a.ctx.createGain(); vibG.gain.value = f * 0.008;
    vibOsc.connect(vibG); vibG.connect(o1.frequency); vibG.connect(o2.frequency);
    try { vibOsc.start(time + 0.08); } catch {}; try { vibOsc.stop(time+rel+0.1); } catch {};
    cleanup([vibOsc, vibG], rel*1000+200);
  }

  const env = a.ctx.createGain();
  const peak = (mode==='lead'?0.26:0.34) * accent;
  env.gain.setValueAtTime(0, time);
  env.gain.linearRampToValueAtTime(peak, time + atk);
  env.gain.setValueAtTime(peak, time + Math.max(atk+0.02, dur*0.45));
  env.gain.exponentialRampToValueAtTime(0.001, time + rel);

  o1.connect(mix); o2.connect(mix); sub.connect(sG); mix.connect(fil); sG.connect(fil); fil.connect(env); env.connect(dest);
  [o1,o2,sub].forEach(o => { try { o.start(time); } catch {}; try { o.stop(time+rel+0.12); } catch {}; });
  cleanup([o1,o2,sub,mix,sG,fil,env], rel*1000+200);
}

// ── PUBLIC API ─────────────────────────────────────────────────────────────────
export function playSynth({
  audioRef, getLaneGain, genre, note, accent, time, lenSteps = 1, stepSec,
  synthFilter, tone, compress, space, activeNodesRef,
  flashLane, modeName, polySynth, setActiveNotes,
}) {
  const notes = Array.isArray(note)
    ? note
    : getVoiceNotes({ baseNote: note, lane: 'synth', modeName, polySynth });

  const voiceAccent = accent / Math.sqrt(Math.max(1, notes.length));
  notes.forEach((v, i) => playSynthVoice({
    audioRef, getLaneGain, genre, note: v, accent: voiceAccent,
    time: time + i * 0.002, lenSteps, stepSec,
    synthFilter, tone, compress, space, activeNodesRef,
  }));

  setActiveNotes?.((p) => ({ ...p, synth: notes.join(' · ') }));
  flashLane?.('synth', 1);
}
