import { clamp, rnd, GENRES, MODES, NOTE_FREQ, NOTE_MIDI, transposeNote } from '../music/core';

// ── Polyphony helper ───────────────────────────────────────────────────────────
export function getVoiceNotes({ baseNote, lane = 'synth', modeName, polySynth, bassStack }) {
  const mode = MODES[modeName] || MODES.minor;
  const pool = lane === 'bass' ? mode.b : mode.s;
  const idx  = pool.indexOf(baseNote);
  if (lane === 'bass') {
    if (!bassStack) return [baseNote];
    const fifth = idx > -1 ? pool[Math.min(idx+4, pool.length-1)] : transposeNote(baseNote, 7);
    return [...new Set([baseNote, fifth])];
  }
  if (!polySynth) return [baseNote];
  if (idx === -1) return [...new Set([baseNote, transposeNote(baseNote,4), transposeNote(baseNote,7)])];
  return [...new Set([pool[idx], pool[Math.min(idx+2,pool.length-1)], pool[Math.min(idx+4,pool.length-1)]])];
}

function cleanup(nodes, ms) {
  const fn = () => nodes.forEach(n => { try { n.disconnect(); } catch {} });
  setTimeout(fn, ms + 80);
  const src = nodes.find(n => typeof n.onended !== 'undefined');
  if (src) src.onended = fn;
}
function releaseNode(ref, ms) {
  ref.current += 1;
  setTimeout(() => { ref.current = Math.max(0, ref.current-1); }, ms+80);
}

// ── Moog-style ladder filter emulation ────────────────────────────────────────
// Four cascaded 1-pole filters in series with feedback — approximates resonance.
function makeLadder(ctx, cutoff, resonance) {
  const stages = [0,1,2,3].map(() => {
    const f = ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=cutoff; f.Q.value=0.5; return f;
  });
  stages[0].connect(stages[1]); stages[1].connect(stages[2]); stages[2].connect(stages[3]);
  // Feedback gain simulates resonance
  const fb = ctx.createGain(); fb.gain.value = clamp(resonance * 0.85, 0, 0.95);
  stages[3].connect(fb); fb.connect(stages[0].frequency); // mod frequency as resonance
  return { input: stages[0], output: stages[3], stages, fb };
}

// ── BASS VOICE ─────────────────────────────────────────────────────────────────
export function playBassVoice({
  audioRef, getLaneGain, genre, note, accent, time,
  lenSteps=1, stepSec, bassFilter, tone, compress,
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

  // Procedural timbric variation — each note gets slightly different filter character
  // This is what makes the bass feel alive instead of mechanical
  const filterJitter = (Math.random() * 0.16) - 0.08; // ±8% of bassFilter
  const qJitter      = (Math.random() * 0.8) - 0.4;   // ±0.4 Q
  const gainJitter   = 1.0 + (Math.random() * 0.08) - 0.04; // ±4% gain

  // Shared master envelope
  const g = a.ctx.createGain();
  g.gain.setValueAtTime(0, time);
  g.gain.linearRampToValueAtTime(0.60 * accent * gainJitter, time + atk);
  g.gain.setValueAtTime(0.60 * accent * gainJitter, time + rel * 0.28);
  g.gain.exponentialRampToValueAtTime(0.0001, time + rel);
  g.connect(dest);

  // Shared filter with per-note variation
  const fil = a.ctx.createBiquadFilter();
  fil.type = 'lowpass';
  fil.frequency.setValueAtTime(
    clamp(60 + (bassFilter + filterJitter) * 3800 + tone * 700, 60, 18000), time
  );
  fil.Q.value = clamp(0.4 + compress * 2.5 + qJitter, 0.1, 8);
  fil.connect(g);

  // ── acid303 ──────────────────────────────────────────────────────────────────
  // Sawtooth → filter with fast accent envelope on cutoff, slide portamento.
  if (mode === 'acid303') {
    const osc = a.ctx.createOscillator(); osc.type='sawtooth'; osc.frequency.value=f;
    // Slide: portamento from prev freq if set on cell
    const targetF = f;
    osc.frequency.setValueAtTime(targetF * 0.97, time);
    osc.frequency.linearRampToValueAtTime(targetF, time + 0.025);

    const acidFil = a.ctx.createBiquadFilter(); acidFil.type='lowpass'; acidFil.Q.value = 3 + compress*6;
    // Accent envelope on filter cutoff — the 303 signature
    const baseCut = 200 + bassFilter * 400;
    const peakCut = 800 + tone * 6000;
    acidFil.frequency.setValueAtTime(baseCut, time);
    acidFil.frequency.linearRampToValueAtTime(peakCut * accent, time + 0.008);
    acidFil.frequency.exponentialRampToValueAtTime(baseCut, time + rel * 0.5);

    const sub = a.ctx.createOscillator(); sub.type='sine'; sub.frequency.value=f*0.5;
    const sG  = a.ctx.createGain(); sG.gain.value = bassSubAmt * 0.35;
    osc.connect(acidFil); acidFil.connect(g);
    sub.connect(sG); sG.connect(g);
    fil.disconnect(g); // bypass shared filter

    [osc,sub].forEach(o=>{ try{o.start(time);}catch{} try{o.stop(time+rel+0.05);}catch{} });
    cleanup([osc,sub,acidFil,sG,g], ms); return;
  }

  // ── moog ─────────────────────────────────────────────────────────────────────
  // Sawtooth into ladder filter emulation — thick and resonant.
  if (mode === 'moog') {
    const osc = a.ctx.createOscillator(); osc.type='sawtooth'; osc.frequency.value=f;
    const sub = a.ctx.createOscillator(); sub.type='sine'; sub.frequency.value=f*0.5;
    const sG  = a.ctx.createGain(); sG.gain.value=bassSubAmt*0.4;
    const ladder = makeLadder(a.ctx, 80+bassFilter*3000+tone*1200, 0.35+compress*0.5);
    // Filter envelope
    ladder.stages.forEach(s => {
      s.frequency.setValueAtTime(80+bassFilter*800, time);
      s.frequency.linearRampToValueAtTime(300+bassFilter*3000+tone*1200, time+0.04);
      s.frequency.exponentialRampToValueAtTime(80+bassFilter*400, time+rel*0.7);
    });
    osc.connect(ladder.input); sub.connect(sG); sG.connect(ladder.input);
    ladder.output.connect(g); fil.disconnect(g);
    [osc,sub].forEach(o=>{ try{o.start(time);}catch{} try{o.stop(time+rel+0.05);}catch{} });
    cleanup([osc,sub,sG,...ladder.stages,ladder.fb,g], ms); return;
  }

  // ── upright ───────────────────────────────────────────────────────────────────
  // Karplus-Strong with body resonance — acoustic double-bass feel.
  if (mode === 'upright') {
    const bufLen = Math.max(2, Math.floor(a.ctx.sampleRate / f));
    const buf    = a.ctx.createBuffer(1, bufLen, a.ctx.sampleRate);
    const bd     = buf.getChannelData(0);
    for (let i=0; i<bufLen; i++) bd[i] = rnd()*2-1;
    const src = a.ctx.createBufferSource(); src.buffer=buf; src.loop=true;
    const dly = a.ctx.createDelay(0.05); dly.delayTime.value = 1/f;
    const fb  = a.ctx.createGain(); fb.gain.value = 0.975 - tone*0.04;
    const lp  = a.ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=1800+tone*2000;
    // Body: add low resonance peak
    const body = a.ctx.createBiquadFilter(); body.type='peaking';
    body.frequency.value = f * 2.8; body.gain.value = 6; body.Q.value = 2;
    src.connect(dly); dly.connect(lp); lp.connect(fb); fb.connect(dly); lp.connect(body); body.connect(fil);
    try{src.start(time);}catch{} try{src.stop(time+0.025);}catch{}
    const plDur = Math.max(0.4, rel*1.5);
    cleanup([src,dly,fb,lp,body,fil,g], plDur*1000+100); return;
  }

  // ── electro ───────────────────────────────────────────────────────────────────
  // Square wave + fast pitch envelope + portamento → punchy electro bass.
  if (mode === 'electro') {
    const osc = a.ctx.createOscillator(); osc.type='square'; osc.frequency.value=f;
    osc.frequency.setValueAtTime(f*2.5, time);
    osc.frequency.exponentialRampToValueAtTime(f, time+0.02);
    const sub = a.ctx.createOscillator(); sub.type='sine'; sub.frequency.value=f*0.5;
    const sG  = a.ctx.createGain(); sG.gain.value=bassSubAmt*0.55;
    osc.connect(fil); sub.connect(sG); sG.connect(fil);
    [osc,sub].forEach(o=>{ try{o.start(time);}catch{} try{o.stop(time+rel+0.05);}catch{} });
    cleanup([osc,sub,sG,fil,g], ms); return;
  }

  // ── tabla ─────────────────────────────────────────────────────────────────────
  // Short FM percussive bass hit — Indian tabla-ish.
  if (mode === 'tabla') {
    const shortRel = Math.min(rel, 0.18 + bassFilter*0.15);
    const car = a.ctx.createOscillator(); car.type='sine'; car.frequency.setValueAtTime(f*3,time); car.frequency.exponentialRampToValueAtTime(f,time+0.025);
    const mod = a.ctx.createOscillator(); mod.type='sine'; mod.frequency.value=f*4.1;
    const mG  = a.ctx.createGain(); mG.gain.setValueAtTime(f*2.5*fmIdx,time); mG.gain.exponentialRampToValueAtTime(f*0.1,time+shortRel*0.4);
    g.gain.setValueAtTime(0,time); g.gain.linearRampToValueAtTime(0.7*accent,time+0.001); g.gain.exponentialRampToValueAtTime(0.001,time+shortRel);
    mod.connect(mG); mG.connect(car.frequency); car.connect(fil);
    [car,mod].forEach(o=>{ try{o.start(time);}catch{} try{o.stop(time+shortRel+0.05);}catch{} });
    cleanup([car,mod,mG,fil,g], shortRel*1000+100); return;
  }

  // ── pluck ─────────────────────────────────────────────────────────────────────
  if (mode === 'pluck') {
    const bufLen = Math.max(2, Math.floor(a.ctx.sampleRate/f));
    const plkBuf = a.ctx.createBuffer(1, bufLen, a.ctx.sampleRate);
    const pd = plkBuf.getChannelData(0);
    for (let i=0; i<bufLen; i++) pd[i]=rnd()*2-1;
    const src = a.ctx.createBufferSource(); src.buffer=plkBuf; src.loop=true;
    const dly = a.ctx.createDelay(0.05); dly.delayTime.value=1/f;
    const fb  = a.ctx.createGain(); fb.gain.value=0.980-tone*0.06;
    const lp  = a.ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=3000+tone*4000;
    src.connect(dly); dly.connect(lp); lp.connect(fb); fb.connect(dly); lp.connect(fil);
    try{src.start(time);}catch{} try{src.stop(time+0.025);}catch{}
    const plDur = Math.max(0.3, rel*1.4+bassFilter*0.8);
    cleanup([src,dly,fb,lp,fil,g], plDur*1000+100); return;
  }

  // ── wobble ────────────────────────────────────────────────────────────────────
  if (mode === 'wobble') {
    const osc = a.ctx.createOscillator(); osc.type='sawtooth'; osc.frequency.value=f;
    const sub = a.ctx.createOscillator(); sub.type='sine'; sub.frequency.value=f*0.5;
    const sG  = a.ctx.createGain(); sG.gain.value=bassSubAmt*0.4;
    const lfo = a.ctx.createOscillator(); lfo.type='sine'; lfo.frequency.value=2+bassFilter*12;
    const lfoG= a.ctx.createGain(); lfoG.gain.value=1500+tone*2000;
    fil.frequency.setValueAtTime(400+tone*800,time);
    lfo.connect(lfoG); lfoG.connect(fil.frequency);
    osc.connect(fil); sub.connect(sG); sG.connect(fil);
    [osc,sub,lfo].forEach(o=>{ try{o.start(time);}catch{} try{o.stop(time+rel+0.05);}catch{} });
    cleanup([osc,sub,sG,lfo,lfoG,fil,g], ms); return;
  }

  // ── reese ─────────────────────────────────────────────────────────────────────
  if (mode === 'reese') {
    const o1 = a.ctx.createOscillator(); o1.type='sawtooth'; o1.frequency.value=f;
    const o2 = a.ctx.createOscillator(); o2.type='sawtooth'; o2.frequency.value=f*1.018;
    const o3 = a.ctx.createOscillator(); o3.type='sine'; o3.frequency.value=f*0.499;
    const sG = a.ctx.createGain(); sG.gain.value=0.3;
    const rf = a.ctx.createBiquadFilter(); rf.type='lowpass'; rf.Q.value=2+compress*4;
    rf.frequency.setValueAtTime(80+bassFilter*200,time);
    rf.frequency.linearRampToValueAtTime(400+bassFilter*3000+tone*1000,time+rel*0.6);
    o1.connect(rf); o2.connect(rf); o3.connect(sG); sG.connect(rf); rf.connect(g);
    fil.disconnect(g);
    [o1,o2,o3].forEach(o=>{ try{o.start(time);}catch{} try{o.stop(time+rel+0.05);}catch{} });
    cleanup([o1,o2,o3,sG,rf,g], ms); return;
  }

  // ── fm / bit ──────────────────────────────────────────────────────────────────
  if (mode === 'fm' || mode === 'bit') {
    const ratio = mode==='bit' ? 1.99 : 2.0;
    const car = a.ctx.createOscillator(); car.type=mode==='bit'?'square':'sine'; car.frequency.value=f;
    const mod = a.ctx.createOscillator(); mod.type='sine'; mod.frequency.value=f*ratio;
    const mG  = a.ctx.createGain();
    mG.gain.setValueAtTime(f*fmIdx*(mode==='bit'?3:1.5),time);
    mG.gain.exponentialRampToValueAtTime(Math.max(6,f*0.22),time+rel*0.7);
    mod.connect(mG); mG.connect(car.frequency); car.connect(fil);
    [car,mod].forEach(o=>{ try{o.start(time);}catch{} try{o.stop(time+rel+0.05);}catch{} });
    cleanup([car,mod,mG,fil,g], ms); return;
  }

  // ── fold / wet ────────────────────────────────────────────────────────────────
  if (mode === 'fold' || mode === 'wet') {
    const car  = a.ctx.createOscillator(); car.type=mode==='fold'?'sawtooth':'triangle'; car.frequency.value=f;
    const ring = a.ctx.createOscillator(); ring.type='sine'; ring.frequency.value=f*1.5;
    const sub  = a.ctx.createOscillator(); sub.type='sine'; sub.frequency.value=f*0.5;
    const rm   = a.ctx.createGain(); rm.gain.value=0.18+compress*0.10;
    const rg   = a.ctx.createGain(); rg.gain.value=0.7;
    const sG   = a.ctx.createGain(); sG.gain.value=bassSubAmt*0.38;
    ring.connect(rm); rm.connect(rg.gain); car.connect(rg); rg.connect(fil); sub.connect(sG); sG.connect(fil);
    [car,ring,sub].forEach(o=>{ try{o.start(time);}catch{} try{o.stop(time+rel+0.05);}catch{} });
    cleanup([car,ring,sub,rm,rg,sG,fil,g], ms); return;
  }

  // ── default: sub / grit / drone / saw / pulse ─────────────────────────────────
  const types = { sub:'sine', grit:'sawtooth', drone:'sawtooth', saw:'sawtooth', pulse:'square' };
  const o1 = a.ctx.createOscillator(); o1.type=types[mode]||'sawtooth'; o1.frequency.value=f;
  const o2 = a.ctx.createOscillator(); o2.type='sine'; o2.frequency.value=f*(mode==='drone'?1.008:1.004);
  const sG = a.ctx.createGain(); sG.gain.value=bassSubAmt*(mode==='sub'?0.85:0.3);
  if (mode==='drone'||mode==='sub') {
    const lfo=a.ctx.createOscillator(); lfo.frequency.value=mode==='drone'?0.3:0.8;
    const lg=a.ctx.createGain(); lg.gain.value=mode==='drone'?80:20;
    lfo.connect(lg); lg.connect(fil.frequency);
    try{lfo.start(time);}catch{} try{lfo.stop(time+rel+0.1);}catch{}
    cleanup([lfo,lg], ms+200);
  }
  o1.connect(fil); o2.connect(sG); sG.connect(fil);
  [o1,o2].forEach(o=>{ try{o.start(time);}catch{} try{o.stop(time+rel+0.05);}catch{} });
  cleanup([o1,o2,sG,fil,g], ms);
}

// ── PUBLIC API ─────────────────────────────────────────────────────────────────
export function playBass({
  audioRef, getLaneGain, genre, note, accent, time, lenSteps=1, stepSec,
  bassFilter, tone, compress, bassSubAmt, fmIdx, activeNodesRef,
  flashLane, modeName, bassStack, setActiveNotes, midiRef,
}) {
  const notes = Array.isArray(note)
    ? note
    : getVoiceNotes({ baseNote: note, lane:'bass', modeName, bassStack });
  const va = accent / Math.sqrt(Math.max(1, notes.length));
  notes.forEach((v,i) => playBassVoice({
    audioRef, getLaneGain, genre, note:v, accent:va,
    time:time+i*0.002, lenSteps, stepSec,
    bassFilter, tone, compress, bassSubAmt, fmIdx, activeNodesRef,
  }));
  setActiveNotes?.((p) => ({ ...p, bass: notes.join(' · ') }));
  flashLane?.('bass', 1);
  if (midiRef?.current) {
    const out = [...midiRef.current.outputs.values()][0];
    if (out) {
      const v = Math.round(clamp(accent,0,1)*127);
      const relMs = Math.max(40, clamp(stepSec()*lenSteps*0.90,0.04,6)*860);
      notes.forEach(n => { out.send([0x93,NOTE_MIDI[n]||48,v]); setTimeout(()=>out.send([0x83,NOTE_MIDI[n]||48,0]),relMs); });
    }
  }
}
