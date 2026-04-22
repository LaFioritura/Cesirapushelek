import { useCallback, useEffect, useRef, useState } from 'react';
import { MAX_STEPS, clamp, grooveAccent, evolveSection } from '../music/core';
import { playKick, playSnare, playHat } from '../audio/voiceDrums';
import { playBass }  from '../audio/voiceBass';
import { playSynth } from '../audio/voiceSynth';

/**
 * Web Audio look-ahead sequencer.
 *
 * Key architectural rule: the setTimeout tick loop must NEVER reference
 * React state or useCallback closures — only refs. This prevents the loop
 * from breaking when React re-renders and recreates callbacks.
 *
 * - scheduleStep: plain function inside a ref, reads all state from refs
 * - tick: plain function inside a ref, no React dependencies
 * - evolution: runs in RAF loop only, where setState is safe
 */

const LOOKAHEAD_SEC = 0.12;
const TICK_MS       = 25;

export function useSequencer({
  audioRef, getLaneGain, activeNodesRef,
  patterns, laneLen, bassLine, synthLine, stepRef,
  bpm, genre, modeName, bassStack, polySynth,
  tone, compress, space, bassFilter, synthFilter,
  drumDecay, noiseMix, bassSubAmt, fmIdx,
  swing, humanize, grooveAmt, grooveProfile,
  setActiveNotes, flashLane,
  onEvolve, currentSectionName,
}) {
  const [isPlaying,   setIsPlaying]   = useState(false);
  const [visibleStep, setVisibleStep] = useState(-1);

  // ── All mutable state lives in refs — never captured by closures ───────────
  const isPlayingRef      = useRef(false);
  const nextBeatTimeRef   = useRef(0);
  const scheduledRef      = useRef([]);
  const tickTimerRef      = useRef(null);

  // Props mirrored into refs each render
  const patternsRef       = useRef(patterns);
  const laneLenRef        = useRef(laneLen);
  const bassLineRef       = useRef(bassLine);
  const synthLineRef      = useRef(synthLine);
  const bpmRef            = useRef(bpm);
  const genreRef          = useRef(genre);
  const modeNameRef       = useRef(modeName);
  const bassStackRef      = useRef(bassStack);
  const polySynthRef      = useRef(polySynth);
  const toneRef           = useRef(tone);
  const compressRef       = useRef(compress);
  const spaceRef          = useRef(space);
  const bassFilterRef     = useRef(bassFilter);
  const synthFilterRef    = useRef(synthFilter);
  const drumDecayRef      = useRef(drumDecay);
  const noiseMixRef       = useRef(noiseMix);
  const bassSubAmtRef     = useRef(bassSubAmt);
  const fmIdxRef          = useRef(fmIdx);
  const swingRef          = useRef(swing);
  const humanizeRef       = useRef(humanize);
  const grooveAmtRef      = useRef(grooveAmt);
  const grooveProfileRef  = useRef(grooveProfile);
  const onEvolveRef       = useRef(onEvolve);
  const currentSectionRef = useRef(currentSectionName);
  const flashLaneRef      = useRef(flashLane);
  const setActiveNotesRef = useRef(setActiveNotes);

  // Sync all props → refs on every render (cheap pointer writes)
  patternsRef.current      = patterns;
  laneLenRef.current       = laneLen;
  bassLineRef.current      = bassLine;
  synthLineRef.current     = synthLine;
  bpmRef.current           = bpm;
  genreRef.current         = genre;
  modeNameRef.current      = modeName;
  bassStackRef.current     = bassStack;
  polySynthRef.current     = polySynth;
  toneRef.current          = tone;
  compressRef.current      = compress;
  spaceRef.current         = space;
  bassFilterRef.current    = bassFilter;
  synthFilterRef.current   = synthFilter;
  drumDecayRef.current     = drumDecay;
  noiseMixRef.current      = noiseMix;
  bassSubAmtRef.current    = bassSubAmt;
  fmIdxRef.current         = fmIdx;
  swingRef.current         = swing;
  humanizeRef.current      = humanize;
  grooveAmtRef.current     = grooveAmt;
  grooveProfileRef.current = grooveProfile;
  onEvolveRef.current      = onEvolve;
  currentSectionRef.current= currentSectionName;
  flashLaneRef.current     = flashLane;
  setActiveNotesRef.current= setActiveNotes;

  // ── scheduleStep — stable ref, reads everything from refs ─────────────────
  const scheduleStepRef = useRef(null);
  scheduleStepRef.current = (step, time) => {
    const p      = patternsRef.current;
    const ll     = laneLenRef.current;
    const g      = genreRef.current;
    const getLG  = getLaneGain.current;
    if (!getLG || !audioRef.current) return;

    const fl     = flashLaneRef.current;
    const san    = setActiveNotesRef.current;
    const stepSec = () => 60 / bpmRef.current / 4;
    const swing  = swingRef.current * stepSec() * 2;
    const hum    = humanizeRef.current;
    const odd    = step % 2 === 1;
    const jit    = () => hum > 0 ? (Math.random() * 2 - 1) * hum : 0;

    const tKick  = time + (odd ? swing * 0.35 : 0) + jit() * 0.5;
    const tSnare = time + (odd ? swing * 0.55 : 0) + jit() * 0.7;
    const tHat   = time + (odd ? swing        : 0) + jit();
    const tBass  = time + (odd ? swing * 0.40 : 0) + jit() * 0.6;
    const tSynth = time + (odd ? swing * 0.70 : 0) + jit();

    const groove = (lane) =>
      grooveAccent(grooveProfileRef.current, lane, step, grooveAmtRef.current);

    // Kick
    const ks = step % (ll.kick || 16);
    if (p.kick[ks]?.on)
      playKick({ audioRef, getLaneGain: getLG, genre: g,
        drumDecay: drumDecayRef.current, noiseMix: noiseMixRef.current,
        bassSubAmt: bassSubAmtRef.current, activeNodesRef, flashLane: fl,
        accent: clamp((p.kick[ks].v ?? 1) * groove('kick'), 0, 1), time: tKick });

    // Snare
    const ss = step % (ll.snare || 16);
    if (p.snare[ss]?.on)
      playSnare({ audioRef, getLaneGain: getLG, genre: g,
        drumDecay: drumDecayRef.current, noiseMix: noiseMixRef.current,
        activeNodesRef, flashLane: fl,
        accent: clamp((p.snare[ss].v ?? 1) * groove('snare'), 0, 1), time: tSnare });

    // Hat
    const hs = step % (ll.hat || 32);
    if (p.hat[hs]?.on) {
      const open = (p.hat[hs].l ?? 1) > 1.25 || (p.hat[hs].p ?? 0) >= 1
        || (hs % 8 === 7 && (p.hat[hs].v ?? 1) > 0.7);
      playHat({ audioRef, getLaneGain: getLG, genre: g,
        noiseMix: noiseMixRef.current, activeNodesRef, flashLane: fl,
        accent: clamp((p.hat[hs].v ?? 1) * groove('hat'), 0, 1), open, time: tHat });
    }

    // Bass
    const bs = step % (ll.bass || 32);
    if (p.bass[bs]?.on)
      playBass({ audioRef, getLaneGain: getLG, genre: g,
        note: bassLineRef.current[bs], lenSteps: p.bass[bs].l ?? 1,
        accent: clamp((p.bass[bs].v ?? 1) * groove('bass'), 0, 1),
        time: tBass, stepSec,
        bassFilter: bassFilterRef.current, tone: toneRef.current,
        compress: compressRef.current, bassSubAmt: bassSubAmtRef.current,
        fmIdx: fmIdxRef.current, activeNodesRef, flashLane: fl,
        modeName: modeNameRef.current, bassStack: bassStackRef.current,
        setActiveNotes: san });

    // Synth
    const ys = step % (ll.synth || 32);
    if (p.synth[ys]?.on)
      playSynth({ audioRef, getLaneGain: getLG, genre: g,
        note: synthLineRef.current[ys], lenSteps: p.synth[ys].l ?? 1,
        accent: clamp((p.synth[ys].v ?? 1) * groove('synth'), 0, 1),
        time: tSynth, stepSec,
        synthFilter: synthFilterRef.current, tone: toneRef.current,
        compress: compressRef.current, space: spaceRef.current,
        activeNodesRef, flashLane: fl,
        modeName: modeNameRef.current, polySynth: polySynthRef.current,
        setActiveNotes: san });
  };

  // ── tick — stable ref, never recreated ────────────────────────────────────
  const tickFnRef = useRef(null);
  tickFnRef.current = () => {
    if (!isPlayingRef.current || !audioRef.current) return;
    try {
      const ctx = audioRef.current.ctx;
      const now = ctx.currentTime;

      while (nextBeatTimeRef.current < now + LOOKAHEAD_SEC) {
        const step = stepRef.current % MAX_STEPS;
        scheduleStepRef.current(step, nextBeatTimeRef.current);
        scheduledRef.current.push({ step, time: nextBeatTimeRef.current });
        nextBeatTimeRef.current += 60 / bpmRef.current / 4;
        stepRef.current = (stepRef.current + 1) % MAX_STEPS;
      }
    } catch (e) {
      console.warn('[tick] error caught, continuing:', e?.message);
    }
    tickTimerRef.current = setTimeout(() => tickFnRef.current(), TICK_MS);
  };

  // ── RAF loop — UI sync + autonomous evolution (safe to setState here) ─────
  useEffect(() => {
    let rafId;
    let lastEvolvedBar = -1;

    const loop = () => {
      if (audioRef.current) {
        const now = audioRef.current.ctx.currentTime;
        const due = scheduledRef.current.filter(e => e.time <= now + 0.02);
        if (due.length > 0) {
          const last = due[due.length - 1];
          setVisibleStep(last.step);
          stepRef.current = (last.step + 1) % MAX_STEPS;
          scheduledRef.current = scheduledRef.current.filter(e => e.time > now + 0.02);

          // Autonomous evolution every 2 bars — RAF is safe for setState
          const bar = Math.floor(last.step / 32);
          if (last.step % 32 === 0 && bar !== lastEvolvedBar && onEvolveRef.current) {
            lastEvolvedBar = bar;
            try {
              const evolved = evolveSection(
                patternsRef.current, bassLineRef.current, synthLineRef.current,
                laneLenRef.current, genreRef.current, currentSectionRef.current, 0.5,
              );
              onEvolveRef.current(evolved);
            } catch (e) {
              // Never let evolution crash the RAF loop
              console.warn('evolveSection error:', e);
            }
          }
        }
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — loop reads everything from refs

  // ── Transport ──────────────────────────────────────────────────────────────
  const start = useCallback(() => {
    if (!audioRef.current) return;
    isPlayingRef.current    = true;
    nextBeatTimeRef.current = audioRef.current.ctx.currentTime + 0.05;
    scheduledRef.current    = [];
    stepRef.current         = stepRef.current; // keep position (don't reset on resume)
    tickTimerRef.current    = setTimeout(() => tickFnRef.current(), 0);
    setIsPlaying(true);
  }, [audioRef, stepRef]);

  const stop = useCallback(() => {
    isPlayingRef.current = false;
    clearTimeout(tickTimerRef.current);
    scheduledRef.current = [];
    setIsPlaying(false);
    setVisibleStep(-1);
  }, []);

  useEffect(() => () => {
    isPlayingRef.current = false;
    clearTimeout(tickTimerRef.current);
  }, []);

  return { isPlaying, visibleStep, start, stop };
}
