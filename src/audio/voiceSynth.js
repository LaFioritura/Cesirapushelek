import { clamp, GENRES, NOTE_FREQ } from '../music/core';
import { getVoiceNotes } from './voiceBass';

function mkNoiseBuf(ctx, dur=0.04) {
  const b=ctx.createBuffer(1,Math.floor(ctx.sampleRate*dur),ctx.sampleRate);
  const d=b.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; return b;
}
function cleanup(nodes, ms) {
  const fn=()=>nodes.forEach(n=>{try{n.disconnect();}catch{}});
  setTimeout(fn,ms+80); if(nodes[0]) nodes[0].onended=fn;
}
function releaseNode(ref,ms) { ref.current+=1; setTimeout(()=>{ref.current=Math.max(0,ref.current-1);},ms+80); }

// ── SYNTH VOICE ────────────────────────────────────────────────────────────────
//
// Modes: glass, bell, ether, rhodes, supersaw, pad, choir, mist,
//        stab, vox, flute, marimba, vintage,
//        lead, organ, air, strings, star, mono
//
export function playSynthVoice({
  audioRef, getLaneGain, genre, note, accent, time,
  lenSteps=1, stepSec, synthFilter, tone, compress, space, activeNodesRef,
}) {
  if (!audioRef.current) return;
  if (activeNodesRef?.current >= 90) return;
  const a   = audioRef.current;
  const f   = NOTE_FREQ[note] || 440;
  const dur = clamp(stepSec()*lenSteps*0.92, 0.04, 6);
  const mode= GENRES[genre]?.synthMode || 'lead';
  const ms  = (dur+2.0)*1000;
  const dest= getLaneGain('synth') || a.bus;
  releaseNode(activeNodesRef, ms);

  // ── glass / bell (Karplus-Strong) ─────────────────────────────────────────
  if (mode==='glass'||mode==='bell') {
    const rel=Math.max(0.4,dur*1.3+space*2.5);
    const src=a.ctx.createBufferSource(); src.buffer=mkNoiseBuf(a.ctx,0.04);
    const dly=a.ctx.createDelay(0.05); dly.delayTime.value=1/f;
    const fb=a.ctx.createGain(); fb.gain.value=clamp(0.97-tone*0.12,0.80,0.98);
    const lp=a.ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=1800+tone*7000;
    const env=a.ctx.createGain();
    env.gain.setValueAtTime(0,time); env.gain.linearRampToValueAtTime(0.50*accent,time+0.001); env.gain.exponentialRampToValueAtTime(0.001,time+rel);
    src.connect(dly); dly.connect(lp); lp.connect(fb); fb.connect(dly); lp.connect(env); env.connect(dest);
    try{src.start(time);}catch{} try{src.stop(time+0.04);}catch{}
    cleanup([src,dly,fb,lp,env], rel*1000+200); return;
  }

  // ── ether (additive overtone series) ──────────────────────────────────────
  if (mode==='ether') {
    const rel=Math.max(0.5,dur*1.2+space*2);
    const ratios=[1,2,3,4,5,6,7,8];
    const gains =[0.5,0.22,0.12,0.07,0.04,0.025,0.015,0.008];
    const mix=a.ctx.createGain(); mix.gain.value=0.28*accent;
    const env=a.ctx.createGain(); const atk=0.10+dur*0.08;
    env.gain.setValueAtTime(0,time); env.gain.linearRampToValueAtTime(1,time+atk);
    env.gain.setValueAtTime(1,time+Math.max(atk+0.01,dur*0.5)); env.gain.exponentialRampToValueAtTime(0.001,time+rel);
    const oscs=ratios.map((r,i)=>{
      const o=a.ctx.createOscillator(); o.type='sine'; o.frequency.value=f*r;
      const g=a.ctx.createGain(); g.gain.value=gains[i];
      o.connect(g); g.connect(mix);
      try{o.start(time);}catch{} try{o.stop(time+rel+0.1);}catch{} return [o,g];
    });
    mix.connect(env); env.connect(dest);
    cleanup(oscs.flat().concat([mix,env]), rel*1000+200); return;
  }

  // ── rhodes (FM piano) ──────────────────────────────────────────────────────
  if (mode==='rhodes') {
    const atk=0.003; const rel=Math.max(0.18,dur*0.85+space*0.7);
    const car=a.ctx.createOscillator(); car.type='sine'; car.frequency.value=f;
    const mod=a.ctx.createOscillator(); mod.type='sine'; mod.frequency.value=f*2.756;
    const mIdx=(f*0.5)*(0.8+tone*0.8);
    const mG=a.ctx.createGain(); mG.gain.setValueAtTime(mIdx,time); mG.gain.exponentialRampToValueAtTime(mIdx*0.1,time+rel*0.5);
    const env=a.ctx.createGain();
    env.gain.setValueAtTime(0,time); env.gain.linearRampToValueAtTime(0.42*accent,time+atk);
    env.gain.setValueAtTime(0.42*accent,time+Math.max(atk+0.01,dur*0.35)); env.gain.exponentialRampToValueAtTime(0.001,time+rel);
    const trem=a.ctx.createOscillator(); trem.frequency.value=5+tone*2;
    const tG=a.ctx.createGain(); tG.gain.value=0.035;
    trem.connect(tG); tG.connect(env.gain);
    mod.connect(mG); mG.connect(car.frequency); car.connect(env); env.connect(dest);
    [car,mod,trem].forEach(o=>{try{o.start(time);}catch{} try{o.stop(time+rel+0.15);}catch{}});
    cleanup([car,mod,trem,mG,tG,env], rel*1000+200); return;
  }

  // ── supersaw (7 detuned oscs) ──────────────────────────────────────────────
  if (mode==='supersaw') {
    const atk=0.01+dur*0.02; const rel=Math.max(0.12,dur*0.75+space*0.6);
    const detunes=[-0.12,-0.08,-0.04,0,0.04,0.08,0.12];
    const mix=a.ctx.createGain(); mix.gain.value=0.15;
    const fil=a.ctx.createBiquadFilter(); fil.type='lowpass';
    fil.frequency.setValueAtTime(300+synthFilter*2000+tone*1500,time);
    fil.frequency.linearRampToValueAtTime(600+synthFilter*6000+tone*2000,time+atk*4);
    fil.Q.value=0.5+compress*1.5;
    const env=a.ctx.createGain();
    env.gain.setValueAtTime(0,time); env.gain.linearRampToValueAtTime(0.30*accent,time+atk);
    env.gain.setValueAtTime(0.30*accent,time+Math.max(atk+0.01,dur*0.55)); env.gain.exponentialRampToValueAtTime(0.001,time+rel);
    const oscs=detunes.map(dt=>{
      const o=a.ctx.createOscillator(); o.type='sawtooth'; o.frequency.value=f*Math.pow(2,dt/12);
      o.connect(mix); try{o.start(time);}catch{} try{o.stop(time+rel+0.1);}catch{} return o;
    });
    mix.connect(fil); fil.connect(env); env.connect(dest);
    cleanup([...oscs,mix,fil,env], rel*1000+200); return;
  }

  // ── stab (percussive chord stab) ───────────────────────────────────────────
  if (mode==='stab') {
    const stabRel=Math.min(dur*0.4, 0.12+tone*0.08);
    const freqs=[f, f*1.2599, f*1.4983]; // root + minor third + fifth
    const mix=a.ctx.createGain(); mix.gain.value=0.28;
    const fil=a.ctx.createBiquadFilter(); fil.type='lowpass';
    fil.frequency.setValueAtTime(1200+synthFilter*4000,time); fil.frequency.exponentialRampToValueAtTime(400+synthFilter*800,time+stabRel); fil.Q.value=1+compress*2;
    const env=a.ctx.createGain();
    env.gain.setValueAtTime(0.50*accent,time); env.gain.exponentialRampToValueAtTime(0.001,time+stabRel);
    const oscs=freqs.map(fq=>{
      const o=a.ctx.createOscillator(); o.type='sawtooth'; o.frequency.value=fq;
      o.connect(mix); try{o.start(time);}catch{} try{o.stop(time+stabRel+0.02);}catch{} return o;
    });
    mix.connect(fil); fil.connect(env); env.connect(dest);
    cleanup([...oscs,mix,fil,env], stabRel*1000+100); return;
  }

  // ── vox (formant vocal synthesis) ─────────────────────────────────────────
  if (mode==='vox') {
    const atk=0.05+dur*0.06; const rel=Math.max(atk+0.1,dur*0.9+space*0.6);
    const osc=a.ctx.createOscillator(); osc.type='sawtooth'; osc.frequency.value=f;
    // Three formants for vowel /a/ → /e/ transition
    const F1 = [{f:800,g:0},{f:600,g:8}];  // first formant
    const F2 = [{f:1200,g:0},{f:2200,g:8}]; // second formant
    const F3 = [{f:2800,g:0},{f:3000,g:4}]; // third formant
    const formants=[F1,F2,F3].map(([s,e])=>{
      const bp=a.ctx.createBiquadFilter(); bp.type='bandpass'; bp.Q.value=8;
      bp.frequency.setValueAtTime(s.f,time); bp.frequency.linearRampToValueAtTime(e.f,time+rel*0.5);
      bp.gain.setValueAtTime(s.g,time); bp.gain.linearRampToValueAtTime(e.g,time+rel*0.4);
      osc.connect(bp); return bp;
    });
    const mix=a.ctx.createGain(); mix.gain.value=0.2;
    formants.forEach(bp=>bp.connect(mix));
    const env=a.ctx.createGain();
    env.gain.setValueAtTime(0,time); env.gain.linearRampToValueAtTime(0.4*accent,time+atk);
    env.gain.setValueAtTime(0.4*accent,time+Math.max(atk+0.01,dur*0.6)); env.gain.exponentialRampToValueAtTime(0.001,time+rel);
    mix.connect(env); env.connect(dest);
    try{osc.start(time);}catch{} try{osc.stop(time+rel+0.12);}catch{}
    cleanup([osc,...formants,mix,env], rel*1000+200); return;
  }

  // ── flute (breathy airy oscillator + noise) ────────────────────────────────
  if (mode==='flute') {
    const atk=0.06+dur*0.08; const rel=Math.max(atk+0.08,dur*0.88+space*0.4);
    const osc=a.ctx.createOscillator(); osc.type='sine'; osc.frequency.value=f;
    // Breath noise layer
    const nBuf=a.ctx.createBufferSource(); nBuf.buffer=mkNoiseBuf(a.ctx,dur+0.2);
    const nHP=a.ctx.createBiquadFilter(); nHP.type='highpass'; nHP.frequency.value=f*0.8;
    const nBP=a.ctx.createBiquadFilter(); nBP.type='bandpass'; nBP.frequency.value=f*1.1; nBP.Q.value=4;
    const nG=a.ctx.createGain();
    nG.gain.setValueAtTime(0.12+tone*0.08,time); nG.gain.linearRampToValueAtTime(0.04+tone*0.02,time+atk*2);
    // Vibrato (delayed onset)
    const vib=a.ctx.createOscillator(); vib.frequency.value=5.8+tone*1.2;
    const vG=a.ctx.createGain(); vG.gain.value=f*0.006;
    vib.connect(vG); vG.connect(osc.frequency);
    const env=a.ctx.createGain();
    env.gain.setValueAtTime(0,time); env.gain.linearRampToValueAtTime(0.32*accent,time+atk); env.gain.setValueAtTime(0.32*accent,time+Math.max(atk+0.01,dur*0.7)); env.gain.exponentialRampToValueAtTime(0.001,time+rel);
    const mix=a.ctx.createGain(); mix.gain.value=1;
    osc.connect(mix); nBuf.connect(nHP); nHP.connect(nBP); nBP.connect(nG); nG.connect(mix); mix.connect(env); env.connect(dest);
    [osc,nBuf,vib].forEach(o=>{try{o.start(time);}catch{} try{o.stop(time+rel+0.12);}catch{}});
    cleanup([osc,nBuf,vib,nHP,nBP,nG,vG,mix,env], rel*1000+200); return;
  }

  // ── marimba (FM resonator) ─────────────────────────────────────────────────
  if (mode==='marimba') {
    const stabRel=Math.max(0.12, 0.4+tone*0.4+space*0.3);
    const car=a.ctx.createOscillator(); car.type='sine'; car.frequency.value=f;
    const mod=a.ctx.createOscillator(); mod.type='sine'; mod.frequency.value=f*3.5;
    const mG=a.ctx.createGain(); mG.gain.setValueAtTime(f*0.8,time); mG.gain.exponentialRampToValueAtTime(0.001,time+stabRel*0.15);
    // Second partial
    const p2=a.ctx.createOscillator(); p2.type='sine'; p2.frequency.value=f*4;
    const p2G=a.ctx.createGain(); p2G.gain.setValueAtTime(0.25,time); p2G.gain.exponentialRampToValueAtTime(0.001,time+stabRel*0.4);
    const env=a.ctx.createGain();
    env.gain.setValueAtTime(0.55*accent,time); env.gain.exponentialRampToValueAtTime(0.001,time+stabRel);
    mod.connect(mG); mG.connect(car.frequency); car.connect(env); p2.connect(p2G); p2G.connect(env); env.connect(dest);
    [car,mod,p2].forEach(o=>{try{o.start(time);}catch{} try{o.stop(time+stabRel+0.05);}catch{}});
    cleanup([car,mod,p2,mG,p2G,env], stabRel*1000+100); return;
  }

  // ── vintage (Juno-106 style: saw + sub + chorus) ───────────────────────────
  if (mode==='vintage') {
    const atk=0.008; const rel=Math.max(0.14,dur*0.75+space*0.5);
    const osc=a.ctx.createOscillator(); osc.type='sawtooth'; osc.frequency.value=f;
    const sub=a.ctx.createOscillator(); sub.type='square'; sub.frequency.value=f*0.5;
    const sG=a.ctx.createGain(); sG.gain.value=0.3;
    const fil=a.ctx.createBiquadFilter(); fil.type='lowpass';
    fil.frequency.setValueAtTime(400+synthFilter*3000+tone*1200,time);
    fil.frequency.linearRampToValueAtTime(800+synthFilter*5000,time+atk*8); fil.Q.value=0.6+compress*1.8;
    // Chorus: two short delays
    const d1=a.ctx.createDelay(0.025); d1.delayTime.value=0.007+tone*0.004;
    const d2=a.ctx.createDelay(0.025); d2.delayTime.value=0.013+tone*0.004;
    const cG=a.ctx.createGain(); cG.gain.value=0.4;
    const env=a.ctx.createGain();
    env.gain.setValueAtTime(0,time); env.gain.linearRampToValueAtTime(0.32*accent,time+atk);
    env.gain.setValueAtTime(0.32*accent,time+Math.max(atk+0.01,dur*0.5)); env.gain.exponentialRampToValueAtTime(0.001,time+rel);
    osc.connect(fil); sub.connect(sG); sG.connect(fil); fil.connect(env);
    fil.connect(d1); fil.connect(d2); d1.connect(cG); d2.connect(cG); cG.connect(env);
    env.connect(dest);
    [osc,sub].forEach(o=>{try{o.start(time);}catch{} try{o.stop(time+rel+0.12);}catch{}});
    cleanup([osc,sub,sG,fil,d1,d2,cG,env], rel*1000+200); return;
  }

  // ── pad / choir / mist ─────────────────────────────────────────────────────
  if (mode==='pad'||mode==='choir'||mode==='mist') {
    const atk=0.09+dur*0.10; const rel=Math.max(atk+0.15,dur*0.95+space*0.8);
    const o1=a.ctx.createOscillator(); o1.type='sawtooth'; o1.frequency.value=f;
    const o2=a.ctx.createOscillator(); o2.type='sawtooth'; o2.frequency.value=f*1.014;
    const o3=a.ctx.createOscillator(); o3.type='sine'; o3.frequency.value=f*0.994;
    const fil=a.ctx.createBiquadFilter();
    fil.type=mode==='choir'?'bandpass':'lowpass';
    fil.frequency.setValueAtTime(350+tone*2200,time); fil.frequency.linearRampToValueAtTime(900+tone*5500,time+atk*2);
    fil.Q.value=mode==='choir'?1.8+compress*2:0.4+compress*1.4;
    const mix=a.ctx.createGain(); mix.gain.value=0.33;
    const env=a.ctx.createGain();
    env.gain.setValueAtTime(0,time); env.gain.linearRampToValueAtTime(0.36*accent,time+atk);
    env.gain.setValueAtTime(0.36*accent,time+Math.max(atk+0.01,dur*0.65)); env.gain.exponentialRampToValueAtTime(0.001,time+rel);
    [o1,o2,o3].forEach(o=>{o.connect(mix); try{o.start(time);}catch{} try{o.stop(time+rel+0.12);}catch{}});
    mix.connect(fil); fil.connect(env); env.connect(dest);
    cleanup([o1,o2,o3,mix,fil,env], rel*1000+200); return;
  }

  // ── default: lead / organ / air / strings / star / mono ───────────────────
  const atk = mode==='lead'||mode==='mono'?0.004 : mode==='strings'||mode==='air'?0.04 : 0.012;
  const rel  = mode==='lead'||mode==='mono'?Math.max(0.08,dur*0.55) : mode==='organ'?Math.max(0.14,dur*0.80) : Math.max(0.22,dur*1.0+space*0.5);
  const types= {lead:'sawtooth',organ:'square',air:'triangle',strings:'sawtooth',star:'triangle',mono:'sawtooth'};
  const o1=a.ctx.createOscillator(); o1.type=types[mode]||'sawtooth'; o1.frequency.value=f;
  const o2=a.ctx.createOscillator(); o2.type=mode==='organ'?'square':'sawtooth'; o2.frequency.value=f*1.008;
  const sub=a.ctx.createOscillator(); sub.type='sine'; sub.frequency.value=f*0.5;
  const mix=a.ctx.createGain(); mix.gain.value=mode==='lead'?0.22:0.28;
  const sG=a.ctx.createGain(); sG.gain.value=mode==='strings'?0.08:0.12;
  const fil=a.ctx.createBiquadFilter(); fil.type=mode==='star'?'bandpass':'lowpass';
  fil.frequency.setValueAtTime(400+synthFilter*3000+tone*1200,time); fil.frequency.linearRampToValueAtTime(800+synthFilter*5500+tone*2000,time+atk*6);
  fil.Q.value=mode==='lead'?1.6+compress*2.2:mode==='star'?3.5:0.5+compress*1.4;
  if (mode==='strings'||mode==='air') {
    const vib=a.ctx.createOscillator(); vib.frequency.value=5.5+tone*1.5;
    const vG=a.ctx.createGain(); vG.gain.value=f*0.008;
    vib.connect(vG); vG.connect(o1.frequency); vG.connect(o2.frequency);
    try{vib.start(time+0.08);}catch{} try{vib.stop(time+rel+0.1);}catch{}
    cleanup([vib,vG], rel*1000+200);
  }
  const env=a.ctx.createGain(); const peak=(mode==='lead'?0.26:0.34)*accent;
  env.gain.setValueAtTime(0,time); env.gain.linearRampToValueAtTime(peak,time+atk);
  env.gain.setValueAtTime(peak,time+Math.max(atk+0.02,dur*0.45)); env.gain.exponentialRampToValueAtTime(0.001,time+rel);
  o1.connect(mix); o2.connect(mix); sub.connect(sG); mix.connect(fil); sG.connect(fil); fil.connect(env); env.connect(dest);
  [o1,o2,sub].forEach(o=>{try{o.start(time);}catch{} try{o.stop(time+rel+0.12);}catch{}});
  cleanup([o1,o2,sub,mix,sG,fil,env], rel*1000+200);
}

// ── PUBLIC API ─────────────────────────────────────────────────────────────────
export function playSynth({
  audioRef, getLaneGain, genre, note, accent, time, lenSteps=1, stepSec,
  synthFilter, tone, compress, space, activeNodesRef,
  flashLane, modeName, polySynth, setActiveNotes,
}) {
  const notes = Array.isArray(note)
    ? note
    : getVoiceNotes({ baseNote:note, lane:'synth', modeName, polySynth });
  const va = accent/Math.sqrt(Math.max(1,notes.length));
  notes.forEach((v,i) => playSynthVoice({
    audioRef, getLaneGain, genre, note:v, accent:va,
    time:time+i*0.002, lenSteps, stepSec,
    synthFilter, tone, compress, space, activeNodesRef,
  }));
  setActiveNotes?.((p)=>({...p, synth:notes.join(' · ')}));
  flashLane?.('synth', 1);
}
