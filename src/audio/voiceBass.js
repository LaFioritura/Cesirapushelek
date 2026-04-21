import {
  clamp,
  GENRES,
  MODES,
  NOTE_FREQ,
  NOTE_MIDI,
  transposeNote,
} from '../music/core';

export function getVoiceNotes({
  baseNote,
  lane = 'synth',
  modeName,
  polySynth,
  bassStack,
}) {
  const mode = MODES[modeName] || MODES.minor;
  const pool = lane === 'bass' ? mode.b : mode.s;
  const idx = pool.indexOf(baseNote);

  if (lane === 'bass') {
    if (!bassStack) return [baseNote];
    const fifth = idx > -1 ? pool[Math.min(idx + 4, pool.length - 1)] : transposeNote(baseNote, 7);
    return [...new Set([baseNote, fifth])];
  }

  if (!polySynth) return [baseNote];

  if (idx === -1) {
    return [...new Set([baseNote, transposeNote(baseNote, 4), transposeNote(baseNote, 7)])];
  }

  return [
    ...new Set([
      pool[idx],
      pool[Math.min(idx + 2, pool.length - 1)],
      pool[Math.min(idx + 4, pool.length - 1)],
    ]),
  ];
}

export function playBassVoice({
  audioRef,
  getLaneGain,
  genre,
  note,
  accent,
  time,
  lenSteps = 1,
  stepSec,
  bassFilter,
  tone,
  compress,
  bassSubAmt,
  fmIdx,
  activeNodesRef,
}) {
  if (!audioRef.current) return;
  if (activeNodesRef?.current >= 90) return;

  const a = audioRef.current;
  const f = NOTE_FREQ[note] || 110;
  const dur = clamp(stepSec() * lenSteps * 0.92, 0.04, 6);
  const atk = Math.min(0.008, dur * 0.05);
  const rel = Math.max(0.04, dur * 0.88);
  const mode = GENRES[genre]?.bassMode || 'sub';
  const g = a.ctx.createGain();
  const fil = a.ctx.createBiquadFilter();

  fil.type = 'lowpass';
  fil.frequency.setValueAtTime(60 + bassFilter * 3500 + tone * 600, time);
  fil.Q.value = 0.5 + compress * 3;

  g.gain.setValueAtTime(0, time);
  g.gain.linearRampToValueAtTime(0.58 * accent, time + atk);
  g.gain.setValueAtTime(0.58 * accent, time + rel * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, time + rel);

  const dest = getLaneGain('bass') || a.bus;
  const cleanMs = (rel + 0.3) * 1000;

  activeNodesRef.current += 1;
  const releaseNode = () => {
    activeNodesRef.current = Math.max(0, activeNodesRef.current - 1);
  };
  setTimeout(releaseNode, cleanMs + 80);

  if (mode === 'fm' || mode === 'bit') {
    const idx = fmIdx * (mode === 'bit' ? 3 : 1.5);

    const car = a.ctx.createOscillator();
    const mod = a.ctx.createOscillator();
    const mg = a.ctx.createGain();

    car.type = mode === 'bit' ? 'square' : 'sine';
    mod.type = 'sine';

    car.frequency.value = f;
    mod.frequency.value = f * (mode === 'bit' ? 1.99 : 2);

    mg.gain.setValueAtTime(f * idx, time);
    mg.gain.exponentialRampToValueAtTime(Math.max(6, f * 0.25), time + rel * 0.7);

    mod.connect(mg);
    mg.connect(car.frequency);

    car.connect(fil);
    fil.connect(g);
    g.connect(dest);

    const cleanup = () => {
      [car, mod, mg, fil, g].forEach((n) => {
        try { n.disconnect(); } catch {}
      });
      releaseNode();
    };

    car.onended = cleanup;
    setTimeout(cleanup, cleanMs);

    try { car.start(time); mod.start(time); } catch {}
    try { car.stop(time + rel + 0.05); mod.stop(time + rel + 0.05); } catch {}
  } else if (mode === 'fold' || mode === 'wet') {
    const car = a.ctx.createOscillator();
    const ring = a.ctx.createOscillator();
    const rm = a.ctx.createGain();
    const rg = a.ctx.createGain();
    const sub = a.ctx.createOscillator();
    const sg = a.ctx.createGain();

    car.type = mode === 'fold' ? 'sawtooth' : 'triangle';
    ring.type = 'sine';
    sub.type = 'sine';

    car.frequency.value = f;
    ring.frequency.value = f * 1.5;
    sub.frequency.value = f * 0.5;

    rm.gain.value = 0.18 + compress * 0.1;
    rg.gain.value = 0.7;
    sg.gain.value = bassSubAmt * 0.38;

    ring.connect(rm);
    rm.connect(rg.gain);

    car.connect(rg);
    rg.connect(fil);
    sub.connect(sg);
    sg.connect(fil);
    fil.connect(g);
    g.connect(dest);

    const cleanup = () => {
      [car, ring, rm, rg, sub, sg, fil, g].forEach((n) => {
        try { n.disconnect(); } catch {}
      });
      releaseNode();
    };

    car.onended = cleanup;
    setTimeout(cleanup, cleanMs);

    try { car.start(time); ring.start(time); sub.start(time); } catch {}
    try { car.stop(time + rel + 0.05); ring.stop(time + rel + 0.05); sub.stop(time + rel + 0.05); } catch {}
  } else {
    const o1 = a.ctx.createOscillator();
    const o2 = a.ctx.createOscillator();
    const types = {
      sub: 'sine',
      grit: 'sawtooth',
      drone: 'sawtooth',
      saw: 'sawtooth',
      pulse: 'square',
    };

    o1.type = types[mode] || 'sawtooth';
    o2.type = 'sine';
    o1.frequency.value = f;
    o2.frequency.value = f * 1.005;

    const sg = a.ctx.createGain();
    sg.gain.value = bassSubAmt * (mode === 'sub' ? 0.85 : 0.3);

    const lfo = a.ctx.createOscillator();
    const lg = a.ctx.createGain();
    lfo.frequency.value = 0.5;
    lg.gain.value = mode === 'drone' ? 30 : 5;

    lfo.connect(lg);
    lg.connect(fil.frequency);

    o1.connect(fil);
    o2.connect(sg);
    sg.connect(fil);
    fil.connect(g);
    g.connect(dest);

    const cleanup = () => {
      [o1, o2, lfo, sg, fil, g, lg].forEach((n) => {
        try { n.disconnect(); } catch {}
      });
      releaseNode();
    };

    o1.onended = cleanup;
    setTimeout(cleanup, cleanMs);

    try { o1.start(time); o2.start(time); lfo.start(time); } catch {}
    try { o1.stop(time + rel + 0.05); o2.stop(time + rel + 0.05); lfo.stop(time + rel + 0.05); } catch {}
  }
}

export function playBass({
  audioRef,
  getLaneGain,
  genre,
  note,
  accent,
  time,
  lenSteps = 1,
  stepSec,
  bassFilter,
  tone,
  compress,
  bassSubAmt,
  fmIdx,
  activeNodesRef,
  flashLane,
  modeName,
  bassStack,
  setActiveNotes,
  midiRef,
}) {
  const notes = Array.isArray(note)
    ? note
    : getVoiceNotes({
        baseNote: note,
        lane: 'bass',
        modeName,
        bassStack,
      });

  const voiceAccent = accent / Math.sqrt(Math.max(1, notes.length));

  notes.forEach((voice, idx) => {
    playBassVoice({
      audioRef,
      getLaneGain,
      genre,
      note: voice,
      accent: voiceAccent,
      time: time + idx * 0.002,
      lenSteps,
      stepSec,
      bassFilter,
      tone,
      compress,
      bassSubAmt,
      fmIdx,
      activeNodesRef,
    });
  });

  setActiveNotes?.((p) => ({ ...p, bass: notes.join(' · ') }));
  flashLane?.('bass', 1);

  if (midiRef?.current) {
    const out = [...midiRef.current.outputs.values()][0];
    if (out) {
      const v = Math.round(clamp(accent, 0, 1) * 127);
      const rel = Math.max(0.04, clamp(stepSec() * lenSteps * 0.92, 0.04, 6) * 0.88);
      notes.forEach((n) => {
        out.send([0x93, NOTE_MIDI[n] || 48, v]);
        setTimeout(() => out.send([0x83, NOTE_MIDI[n] || 48, 0]), rel * 1000);
      });
    }
  }
}