import { useCallback, useEffect, useRef, useState } from 'react';
import { MAX_STEPS, clamp, grooveAccent } from '../music/core';
import { playKick, playSnare, playHat } from '../audio/voiceDrums';
import { playBass }  from '../audio/voiceBass';
import { playSynth } from '../audio/voiceSynth';

/**
 * Web Audio look-ahead sequencer.
 *
 * Instead of using setInterval (which drifts under GC pressure or when the
 * tab is hidden), this scheduler wakes up every TICK_MS and schedules all
 * events that fall within the next LOOKAHEAD_SEC window using the
 * AudioContext clock as the source of truth.
 *
 * Reference: Chris Wilson, "A Tale of Two Clocks" (html5rocks, 2013).
 */

const LOOKAHEAD_SEC = 0.12;  // schedule this far ahead of now
const TICK_MS       = 25;    // how often the scheduler runs

export function useSequencer({
  audioRef,
  getLaneGain,
  activeNodesRef,
  patterns,
  laneLen,
  bassLine,
  synthLine,
  stepRef,
  bpm,
  genre,
  modeName,
  bassStack,
  polySynth,
  tone,
  compress,
  space,
  bassFilter,
  synthFilter,
  drumDecay,
  noiseMix,
  bassSubAmt,
  fmIdx,
  swing,
  humanize,
  grooveAmt,
  grooveProfile,
  setActiveNotes,
  flashLane,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [visibleStep, setVisibleStep] = useState(-1);

  // All sequencer state lives in refs so the scheduler closure never stales.
  const isPlayingRef   = useRef(false);
  const nextBeatTimeRef = useRef(0); // AudioContext time of the next step
  const scheduledRef   = useRef([]); // [{step, time}] for UI sync

  // Mirror all props into refs so the closure always reads current values.
  const patternsRef    = useRef(patterns);
  const laneLenRef     = useRef(laneLen);
  const bassLineRef    = useRef(bassLine);
  const synthLineRef   = useRef(synthLine);
  const bpmRef         = useRef(bpm);
  const genreRef       = useRef(genre);
  const modeNameRef    = useRef(modeName);
  const bassStackRef   = useRef(bassStack);
  const polySynthRef   = useRef(polySynth);
  const toneRef        = useRef(tone);
  const compressRef    = useRef(compress);
  const spaceRef       = useRef(space);
  const bassFilterRef  = useRef(bassFilter);
  const synthFilterRef = useRef(synthFilter);
  const drumDecayRef   = useRef(drumDecay);
  const noiseMixRef    = useRef(noiseMix);
  const bassSubAmtRef  = useRef(bassSubAmt);
  const fmIdxRef       = useRef(fmIdx);
  const swingRef       = useRef(swing);
  const humanizeRef    = useRef(humanize);
  const grooveAmtRef   = useRef(grooveAmt);
  const grooveProfileRef = useRef(grooveProfile);

  // Sync all props → refs each render (cheap pointer writes).
  patternsRef.current    = patterns;
  laneLenRef.current     = laneLen;
  bassLineRef.current    = bassLine;
  synthLineRef.current   = synthLine;
  bpmRef.current         = bpm;
  genreRef.current       = genre;
  modeNameRef.current    = modeName;
  bassStackRef.current   = bassStack;
  polySynthRef.current   = polySynth;
  toneRef.current        = tone;
  compressRef.current    = compress;
  spaceRef.current       = space;
  bassFilterRef.current  = bassFilter;
  synthFilterRef.current = synthFilter;
  drumDecayRef.current   = drumDecay;
  noiseMixRef.current    = noiseMix;
  bassSubAmtRef.current  = bassSubAmt;
  fmIdxRef.current       = fmIdx;
  swingRef.current       = swing;
  humanizeRef.current    = humanize;
  grooveAmtRef.current   = grooveAmt;
  grooveProfileRef.current = grooveProfile;

  // ── Step fn (called with an AudioContext timestamp) ────────────────────────

  const scheduleStep = useCallback((step, time) => {
    const p       = patternsRef.current;
    const ll      = laneLenRef.current;
    const g       = genreRef.current;
    const stepSec = () => 60 / bpmRef.current / 4;
    const getLG   = getLaneGain.current;

    // Swing: delay odd 16th-note steps by a fraction of the step duration.
    const swingOffset = (step % 2 === 1)
      ? swingRef.current * stepSec() * 2
      : 0;

    // Humanize: tiny random timing nudge (±humanize seconds).
    const humanizeOffset = humanizeRef.current > 0
      ? (Math.random() * 2 - 1) * humanizeRef.current
      : 0;

    const t = time + swingOffset + humanizeOffset;

    // grooveAccent multiplier for each lane at this step.
    const groove = (lane) =>
      grooveAccent(grooveProfileRef.current, lane, step, grooveAmtRef.current);

    const kickStep = step % (ll.kick || 16);
    const kickCell = p.kick[kickStep];
    if (kickCell?.on) {
      playKick({ audioRef, getLaneGain: getLG, genre: g, drumDecay: drumDecayRef.current, noiseMix: noiseMixRef.current, bassSubAmt: bassSubAmtRef.current, activeNodesRef, flashLane, accent: clamp((kickCell.v ?? 1) * groove('kick'), 0, 1), time: t });
    }

    const snareStep = step % (ll.snare || 16);
    const snareCell = p.snare[snareStep];
    if (snareCell?.on) {
      playSnare({ audioRef, getLaneGain: getLG, genre: g, drumDecay: drumDecayRef.current, noiseMix: noiseMixRef.current, activeNodesRef, flashLane, accent: clamp((snareCell.v ?? 1) * groove('snare'), 0, 1), time: t });
    }

    const hatStep = step % (ll.hat || 32);
    const hatCell = p.hat[hatStep];
    if (hatCell?.on) {
      const open = (hatCell.l ?? 1) > 1.25 || (hatStep % 8 === 7 && (hatCell.v ?? 1) > 0.7);
      playHat({ audioRef, getLaneGain: getLG, genre: g, noiseMix: noiseMixRef.current, activeNodesRef, flashLane, accent: clamp((hatCell.v ?? 1) * groove('hat'), 0, 1), open, time: t });
    }

    const bassStep = step % (ll.bass || 32);
    const bassCell = p.bass[bassStep];
    if (bassCell?.on) {
      playBass({ audioRef, getLaneGain: getLG, genre: g, note: bassLineRef.current[bassStep], accent: clamp((bassCell.v ?? 1) * groove('bass'), 0, 1), time: t, lenSteps: bassCell.l ?? 1, stepSec, bassFilter: bassFilterRef.current, tone: toneRef.current, compress: compressRef.current, bassSubAmt: bassSubAmtRef.current, fmIdx: fmIdxRef.current, activeNodesRef, flashLane, modeName: modeNameRef.current, bassStack: bassStackRef.current, setActiveNotes });
    }

    const synthStep = step % (ll.synth || 32);
    const synthCell = p.synth[synthStep];
    if (synthCell?.on) {
      playSynth({ audioRef, getLaneGain: getLG, genre: g, note: synthLineRef.current[synthStep], accent: clamp((synthCell.v ?? 1) * groove('synth'), 0, 1), time: t, lenSteps: synthCell.l ?? 1, stepSec, synthFilter: synthFilterRef.current, tone: toneRef.current, compress: compressRef.current, space: spaceRef.current, activeNodesRef, flashLane, modeName: modeNameRef.current, polySynth: polySynthRef.current, setActiveNotes });
    }
  }, [audioRef, getLaneGain, activeNodesRef, flashLane, setActiveNotes]);

  // ── Scheduler loop ─────────────────────────────────────────────────────────

  const tickRef = useRef(null);

  const tick = useCallback(() => {
    if (!isPlayingRef.current || !audioRef.current) return;
    const ctx = audioRef.current.ctx;
    const now = ctx.currentTime;

    while (nextBeatTimeRef.current < now + LOOKAHEAD_SEC) {
      const step = stepRef.current % MAX_STEPS;
      scheduleStep(step, nextBeatTimeRef.current);

      // Queue for UI sync: we'll pick these up in the RAF loop.
      scheduledRef.current.push({ step, time: nextBeatTimeRef.current });

      nextBeatTimeRef.current += 60 / bpmRef.current / 4;
      stepRef.current = (stepRef.current + 1) % MAX_STEPS;
    }

    tickRef.current = setTimeout(tick, TICK_MS);
  }, [audioRef, stepRef, scheduleStep]);

  // RAF loop — reads scheduled steps and updates React state without blocking audio.
  useEffect(() => {
    let rafId;
    function rafLoop() {
      if (!audioRef.current) { rafId = requestAnimationFrame(rafLoop); return; }
      const now = audioRef.current.ctx.currentTime;
      const due = scheduledRef.current.filter(e => e.time <= now + 0.02);
      if (due.length > 0) {
        const last = due[due.length - 1];
        setVisibleStep(last.step);
        stepRef.current = (last.step + 1) % MAX_STEPS;
        scheduledRef.current = scheduledRef.current.filter(e => e.time > now + 0.02);
      }
      rafId = requestAnimationFrame(rafLoop);
    }
    rafId = requestAnimationFrame(rafLoop);
    return () => cancelAnimationFrame(rafId);
  }, [audioRef, stepRef]);

  // ── Transport ──────────────────────────────────────────────────────────────

  const start = useCallback(() => {
    if (!audioRef.current) return;
    isPlayingRef.current  = true;
    nextBeatTimeRef.current = audioRef.current.ctx.currentTime + 0.05;
    scheduledRef.current  = [];
    tickRef.current       = setTimeout(tick, 0);
    setIsPlaying(true);
  }, [audioRef, tick]);

  const stop = useCallback(() => {
    isPlayingRef.current = false;
    clearTimeout(tickRef.current);
    scheduledRef.current = [];
    setIsPlaying(false);
    setVisibleStep(-1);
  }, []);

  // Stop cleanly on unmount.
  useEffect(() => () => { isPlayingRef.current = false; clearTimeout(tickRef.current); }, []);

  return { isPlaying, visibleStep, start, stop };
}
