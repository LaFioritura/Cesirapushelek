import { clamp, GENRES, NOTE_FREQ } from '../music/core';
import { getVoiceNotes } from './voiceBass';

function simpleNoiseBuffer(ctx, dur = 0.04, gain = 1) {
  const sr = ctx.sampleRate;
  const b = ctx.createBuffer(1, Math.floor(sr * dur), sr);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i += 1) d[i] = (Math.random() * 2 - 1) * gain;
  return b;
}

function releaseActiveNode(activeNodesRef, ms) {
  activeNodesRef.current += 1;
  setTimeout(() => {
    activeNodesRef.current = Math.max(0, activeNodesRef.current - 1);
  }, ms + 80);
}

export function playSynthVoice({
  audioRef,
  getLaneGain,
  genre,
  note,
  accent,
  time,
  lenSteps = 1,
  stepSec,
  synthFilter,
  tone,
  compress,
  space,
  activeNodesRef,
}) {
  if (!audioRef.current) return;
  if (activeNodesRef?.current >= 90) return;

  const a = audioRef.current;
  const f = NOTE_FREQ[note] || 440;
  const dur = clamp(stepSec() * lenSteps * 0.92, 0.04, 6);
  const mode = GENRES[genre]?.synthMode || 'lead';
  const cleanMs = (dur + 1.5) * 1000;
  const dest = getLaneGain('synth') || a.bus;

  releaseActiveNode(activeNodesRef, cleanMs);

  if (mode === 'glass' || mode === 'bell') {
    const rel = Math.max(0.3, dur * 1.2 + space * 2);

    const src = a.ctx.createBufferSource();
    src.buffer = simpleNoiseBuffer(a.ctx, 0.04, 1);

    const delay = a.ctx.createDelay(0.05);
    delay.delayTime.value = 1 / f;

    const fb = a.ctx.createGain();
    fb.gain.value = 0.97 - tone * 0.15;

    const lp = a.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2000 + tone * 6000;

    const g = a.ctx.createGain();
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(0.55 * accent, time + 0.001);
    g.gain.exponentialRampToValueAtTime(0.001, time + rel);

    src.connect(delay);
    delay.connect(lp);
    lp.connect(fb);
    fb.connect(delay);
    lp.connect(g);
    g.connect(dest);

    const cleanup = () => {
      [src, delay, fb, lp, g].forEach((n) => {
        try { n.disconnect(); } catch {}
      });
    };

    src.onended = cleanup;
    setTimeout(cleanup, cleanMs);

    try { src.start(time); } catch {}
    try { src.stop(time + 0.04); } catch {}
    return;
  }

  if (mode === 'pad' || mode === 'choir' || mode === 'mist') {
    const atk = 0.06 + dur * 0.08;
    const rel = Math.max(atk + 0.1, dur * 0.9 + space * 0.5);

    const o1 = a.ctx.createOscillator();
    const o2 = a.ctx.createOscillator();
    const o3 = a.ctx.createOscillator();

    o1.type = 'sawtooth';
    o2.type = 'sawtooth';
    o3.type = 'sine';

    o1.frequency.value = f;
    o2.frequency.value = f * 1.012;
    o3.frequency.value = f * 0.995;

    const mix = a.ctx.createGain();
    mix.gain.value = 0.33;

    const fil = a.ctx.createBiquadFilter();
    fil.type = 'lowpass';
    fil.frequency.setValueAtTime(300 + tone * 2000, time);
    fil.frequency.linearRampToValueAtTime(800 + tone * 5000, time + atk * 2);
    fil.Q.value = 0.4 + compress * 1.5;

    const g = a.ctx.createGain();
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(0.38 * accent, time + atk);
    g.gain.setValueAtTime(0.38 * accent, time + Math.max(atk + 0.01, dur * 0.6));
    g.gain.exponentialRampToValueAtTime(0.001, time + rel);

    o1.connect(mix);
    o2.connect(mix);
    o3.connect(mix);
    mix.connect(fil);
    fil.connect(g);
    g.connect(dest);

    const cleanup = () => {
      [o1, o2, o3, mix, fil, g].forEach((n) => {
        try { n.disconnect(); } catch {}
      });
    };

    o1.onended = cleanup;
    setTimeout(cleanup, cleanMs);

    try { o1.start(time); o2.start(time); o3.start(time); } catch {}
    try { o1.stop(time + rel + 0.1); o2.stop(time + rel + 0.1); o3.stop(time + rel + 0.1); } catch {}
    return;
  }

  {
    const atk =
      mode === 'lead' || mode === 'mist'
        ? 0.004
        : mode === 'strings' || mode === 'air'
          ? 0.03
          : 0.01;

    const rel =
      mode === 'lead'
        ? Math.max(0.08, dur * 0.5)
        : mode === 'organ'
          ? Math.max(0.12, dur * 0.75)
          : Math.max(0.18, dur * 0.95 + space * 0.4);

    const o1 = a.ctx.createOscillator();
    const o2 = a.ctx.createOscillator();
    const sub = a.ctx.createOscillator();

    const types = {
      lead: 'sawtooth',
      organ: 'square',
      air: 'triangle',
      strings: 'sawtooth',
      star: 'triangle',
      mist: 'triangle',
    };

    o1.type = types[mode] || 'sawtooth';
    o2.type = mode === 'organ' ? 'square' : 'sawtooth';
    sub.type = 'sine';

    o1.frequency.value = f;
    o2.frequency.value = f * 1.008;
    sub.frequency.value = f * 0.5;

    const mix = a.ctx.createGain();
    mix.gain.value = mode === 'lead' ? 0.22 : 0.28;

    const subG = a.ctx.createGain();
    subG.gain.value = mode === 'strings' ? 0.08 : 0.12;

    const fil = a.ctx.createBiquadFilter();
    fil.type = mode === 'star' ? 'bandpass' : 'lowpass';
    fil.frequency.setValueAtTime(400 + synthFilter * 2800 + tone * 1200, time);
    fil.frequency.linearRampToValueAtTime(800 + synthFilter * 5000 + tone * 1800, time + atk * 6);
    fil.Q.value =
      mode === 'lead'
        ? 1.4 + compress * 2
        : mode === 'star'
          ? 3.2
          : 0.5 + compress * 1.4;

    const g = a.ctx.createGain();
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime((mode === 'lead' ? 0.26 : 0.34) * accent, time + atk);
    g.gain.setValueAtTime((mode === 'lead' ? 0.26 : 0.34) * accent, time + Math.max(atk + 0.02, dur * 0.45));
    g.gain.exponentialRampToValueAtTime(0.001, time + rel);

    o1.connect(mix);
    o2.connect(mix);
    sub.connect(subG);
    mix.connect(fil);
    subG.connect(fil);
    fil.connect(g);
    g.connect(dest);

    const cleanup = () => {
      [o1, o2, sub, mix, subG, fil, g].forEach((n) => {
        try { n.disconnect(); } catch {}
      });
    };

    o1.onended = cleanup;
    setTimeout(cleanup, cleanMs);

    try { o1.start(time); o2.start(time); sub.start(time); } catch {}
    try { o1.stop(time + rel + 0.12); o2.stop(time + rel + 0.12); sub.stop(time + rel + 0.12); } catch {}
  }
}

export function playSynth({
  audioRef,
  getLaneGain,
  genre,
  note,
  accent,
  time,
  lenSteps = 1,
  stepSec,
  synthFilter,
  tone,
  compress,
  space,
  activeNodesRef,
  flashLane,
  modeName,
  polySynth,
  setActiveNotes,
}) {
  const notes = Array.isArray(note)
    ? note
    : getVoiceNotes({
        baseNote: note,
        lane: 'synth',
        modeName,
        polySynth,
      });

  const voiceAccent = accent / Math.sqrt(Math.max(1, notes.length));

  notes.forEach((voice, idx) => {
    playSynthVoice({
      audioRef,
      getLaneGain,
      genre,
      note: voice,
      accent: voiceAccent,
      time: time + idx * 0.002,
      lenSteps,
      stepSec,
      synthFilter,
      tone,
      compress,
      space,
      activeNodesRef,
    });
  });

  setActiveNotes?.((p) => ({ ...p, synth: notes.join(' · ') }));
  flashLane?.('synth', 1);
}