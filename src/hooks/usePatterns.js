import { useCallback, useRef, useState } from 'react';
import {
  MAX_STEPS, CHORD_PROGS, MODES, chordNotes, mkSteps, mkNotes, buildSection, pick, rnd,
} from '../music/core';
import { buildHistorySnapshot, pushHistory, popHistory, restoreHistorySnapshot } from '../utils/history';
import { buildSceneSnapshot, saveSceneAtIndex, loadSceneAtIndex, restoreSceneSnapshot } from '../utils/scenes';
import { buildProjectJSON, downloadProjectJSON, parseProjectJSON } from '../utils/projectIO';

const DEFAULT_LANE_LEN = { kick: 16, snare: 16, hat: 32, bass: 32, synth: 32 };

function emptyPatterns() {
  return { kick: mkSteps(), snare: mkSteps(), hat: mkSteps(), bass: mkSteps(), synth: mkSteps() };
}

/**
 * Owns all sequencer data: patterns, melodic lines, lane lengths,
 * undo history, scene slots, and project import/export.
 *
 * Also exposes `regenerateSection` which is the primary way to change
 * the musical content without touching the audio engine.
 */
export function usePatterns({ genre, modeName, arpeMode, setCurrentSectionName }) {
  const [patterns,  setPatterns]  = useState(emptyPatterns);
  const [bassLine,  setBassLine]  = useState(() => mkNotes('C2'));
  const [synthLine, setSynthLine] = useState(() => mkNotes('C4'));
  const [laneLen,   setLaneLen]   = useState(DEFAULT_LANE_LEN);
  const [history,   setHistory]   = useState([]);
  const [savedScenes, setSavedScenes] = useState(() => Array(6).fill(null));

  // stepRef is written by useSequencer; kept here as the authoritative
  // cursor so regenerating a section can reset it.
  const stepRef = useRef(0);

  // ── Snapshot helpers ───────────────────────────────────────────────────────

  const captureSnapshot = useCallback(() =>
    buildHistorySnapshot({ patterns, bassLine, synthLine, laneLen, genre, modeName, arpeMode }),
  [patterns, bassLine, synthLine, laneLen, genre, modeName, arpeMode]);

  const pushUndo = useCallback(() => {
    setHistory(prev => pushHistory(prev, captureSnapshot(), 32));
  }, [captureSnapshot]);

  const undo = useCallback(() => {
    setHistory(prev => {
      const { nextHistory, snapshot } = popHistory(prev);
      if (snapshot) {
        restoreHistorySnapshot(snapshot, {
          setPatterns, setBassLine, setSynthLine, setLaneLen,
          setGenre: () => {}, setBpm: () => {}, // genre/bpm owned by App
          setModeName: () => {}, setArpeMode: () => {},
          setCurrentSectionName,
        });
        stepRef.current = 0;
      }
      return nextHistory;
    });
  }, [setCurrentSectionName]);

  // ── Pattern mutations ──────────────────────────────────────────────────────

  const toggleCell = useCallback((lane, idx) => {
    pushUndo();
    setPatterns(prev => {
      const next = { ...prev, [lane]: [...prev[lane]] };
      next[lane][idx] = { ...next[lane][idx], on: !next[lane][idx].on };
      return next;
    });
  }, [pushUndo]);

  const setNote = useCallback((lane, idx, note) => {
    pushUndo();
    const setter = lane === 'bass' ? setBassLine : setSynthLine;
    setter(prev => Object.assign([...prev], { [idx]: note }));
  }, [pushUndo]);

  const clearPatterns = useCallback(() => {
    pushUndo();
    setPatterns(emptyPatterns());
    stepRef.current = 0;
  }, [pushUndo]);

  // lastBass tracks the final bass note of each section for voice continuity.
  const lastBassRef    = useRef('C2');
  const sectionIndexRef = useRef(0); // counts how many times each section name has been triggered

  // ── Section generation ─────────────────────────────────────────────────────

  const regenerateSection = useCallback((sectionName) => {
    pushUndo();
    const progPool    = CHORD_PROGS[modeName] || CHORD_PROGS.minor;
    const progression = pick(progPool);
    sectionIndexRef.current += 1;
    const result = buildSection(
      genre, sectionName, modeName, progression, arpeMode,
      lastBassRef.current, sectionIndexRef.current,
    );
    lastBassRef.current = result.lastBass || lastBassRef.current;
    setPatterns(result.patterns);
    setBassLine(result.bassLine);
    setSynthLine(result.synthLine);
    setLaneLen(result.laneLen);
    setCurrentSectionName(sectionName);
    stepRef.current = 0;
  }, [genre, modeName, arpeMode, setCurrentSectionName, pushUndo]);

  // ── Scenes ─────────────────────────────────────────────────────────────────

  const buildSnapshot = useCallback((extra) =>
    buildSceneSnapshot({
      patterns, bassLine, synthLine, laneLen, genre, modeName, arpeMode, ...extra,
    }),
  [patterns, bassLine, synthLine, laneLen, genre, modeName, arpeMode]);

  const saveScene = useCallback((idx, extra) => {
    setSavedScenes(prev => saveSceneAtIndex(prev, idx, buildSnapshot(extra)));
  }, [buildSnapshot]);

  const loadScene = useCallback((idx) => {
    const scene = loadSceneAtIndex(savedScenes, idx);
    if (!scene) return null;
    restoreSceneSnapshot(scene, {
      setPatterns, setBassLine, setSynthLine, setLaneLen,
      setCurrentSectionName,
      // These setters are passed as no-ops here; App passes the real ones
      // via the returned `loadedScene` object and applies them itself.
      setGenre: () => {}, setBpm: () => {},
      setModeName: () => {}, setArpeMode: () => {},
      setMaster: () => {}, setSpace: () => {}, setTone: () => {},
      setDrive: () => {}, setCompress: () => {},
      setGrooveAmt: () => {}, setSwing: () => {}, setHumanize: () => {},
      setNoiseMix: () => {}, setBassFilter: () => {}, setSynthFilter: () => {},
      setDrumDecay: () => {}, setBassSubAmt: () => {}, setFmIdx: () => {},
      setBassPreset: () => {}, setSynthPreset: () => {}, setDrumPreset: () => {},
      setPerformancePreset: () => {}, setPolySynth: () => {}, setBassStack: () => {},
      setGrooveProfile: () => {},
    });
    stepRef.current = 0;
    return scene; // caller (App) applies the non-pattern fields
  }, [savedScenes, setCurrentSectionName]);

  // ── Mutation actions ───────────────────────────────────────────────────────

  /**
   * Flip 3–5 random drum hits, avoiding beat-1 of each bar.
   */
  // Apply autonomous evolution result from the engine
  const applyEvolution = useCallback(({ patterns: p, bassLine: bl, synthLine: sl }) => {
    setPatterns(p);
    setBassLine(bl);
    setSynthLine(sl);
  }, []);

  const mutate = useCallback(() => {
    pushUndo();
    setPatterns(prev => {
      const next = { kick: [...prev.kick], snare: [...prev.snare], hat: [...prev.hat], bass: [...prev.bass], synth: [...prev.synth] };
      const drumLanes = ['kick', 'snare', 'hat'];
      const flips = 3 + Math.floor(rnd() * 3);
      for (let i = 0; i < flips; i++) {
        const lane = drumLanes[Math.floor(rnd() * drumLanes.length)];
        const ll   = next[lane].length;
        const idx  = Math.floor(rnd() * ll);
        if (idx % 16 === 0) continue; // protect bar-1 downbeat
        next[lane][idx] = { ...next[lane][idx], on: !next[lane][idx].on };
      }
      return next;
    });
  }, [pushUndo]);

  /**
   * Remove roughly 30 % of non-essential drum hits (keeps beats 0, 4, 8, 12).
   */
  const thinOut = useCallback(() => {
    pushUndo();
    setPatterns(prev => {
      const next = { ...prev };
      for (const lane of ['kick', 'snare', 'hat']) {
        next[lane] = prev[lane].map((cell, i) => {
          const essential = i % 4 === 0;
          if (!cell.on || essential) return cell;
          return rnd() < 0.35 ? { ...cell, on: false } : cell;
        });
      }
      return next;
    });
  }, [pushUndo]);

  /**
   * Add hits on empty steps with ~20 % probability, weighted toward off-beats.
   */
  const thicken = useCallback(() => {
    pushUndo();
    setPatterns(prev => {
      const next = { ...prev };
      for (const lane of ['kick', 'snare', 'hat']) {
        next[lane] = prev[lane].map((cell, i) => {
          if (cell.on) return cell;
          const offBeat  = i % 2 === 1;
          const prob     = offBeat ? 0.22 : 0.1;
          return rnd() < prob ? { ...cell, on: true, v: 0.55 + rnd() * 0.3, p: 0.6 } : cell;
        });
      }
      return next;
    });
  }, [pushUndo]);

  /**
   * Pick a new chord progression and redistribute active melody notes
   * to fit the new harmony without touching the rhythm pattern.
   */
  const reharmonize = useCallback(() => {
    pushUndo();
    const progPool    = CHORD_PROGS[modeName] || CHORD_PROGS.minor;
    const newProg     = progPool[Math.floor(rnd() * progPool.length)];
    const mode        = MODES[modeName] || MODES.minor;
    const chordLen    = 8; // steps per chord

    const remap = (line, pool) => line.map((note, i) => {
      const ci    = Math.floor(i / chordLen) % newProg.length;
      const cn    = chordNotes(newProg[ci], pool);
      if (!cn.length) return note;
      // Pick chord note closest to current note by scale index.
      const curIdx = pool.indexOf(note);
      return cn.reduce((best, n) =>
        Math.abs(pool.indexOf(n) - curIdx) < Math.abs(pool.indexOf(best) - curIdx) ? n : best
      , cn[0]);
    });

    setBassLine(prev  => remap(prev,  mode.b));
    setSynthLine(prev => remap(prev,  mode.s));
  }, [modeName, pushUndo]);

  /**
   * Cycle the arpeggio mode: up → down → updown → outside → up.
   * Returns the new mode name so App can sync its state.
   */
  const ARPE_CYCLE = ['up', 'down', 'updown', 'outside'];
  const shiftArp = useCallback((currentArpeMode, setArpeMode) => {
    const idx  = ARPE_CYCLE.indexOf(currentArpeMode);
    const next = ARPE_CYCLE[(idx + 1) % ARPE_CYCLE.length];
    setArpeMode(next);
  }, []);

  /**
   * Randomize notes on active synth steps within the current mode.
   */
  const randomizeSynthNotes = useCallback(() => {
    pushUndo();
    const pool = (MODES[modeName] || MODES.minor).s;
    setSynthLine(prev => prev.map((note, i) => {
      // Only randomize if the synth step is active.
      return note !== null ? pick(pool) : note;
    }));
  }, [modeName, pushUndo]);

  /**
   * Randomize notes on active bass steps within the current mode.
   */
  const randomizeBassNotes = useCallback(() => {
    pushUndo();
    const pool = (MODES[modeName] || MODES.minor).b;
    setBassLine(prev => prev.map(() => pick(pool)));
  }, [modeName, pushUndo]);

  /**
   * Shift all melody notes up by one scale degree (wraps at top of pool).
   */
  const shiftNotesUp = useCallback(() => {
    pushUndo();
    const mode = MODES[modeName] || MODES.minor;
    const shift = (line, pool) => line.map(note => {
      const i = pool.indexOf(note);
      return i === -1 ? note : pool[Math.min(i + 1, pool.length - 1)];
    });
    setBassLine(prev  => shift(prev, mode.b));
    setSynthLine(prev => shift(prev, mode.s));
  }, [modeName, pushUndo]);

  /**
   * Shift all melody notes down by one scale degree (wraps at bottom of pool).
   */
  const shiftNotesDown = useCallback(() => {
    pushUndo();
    const mode = MODES[modeName] || MODES.minor;
    const shift = (line, pool) => line.map(note => {
      const i = pool.indexOf(note);
      return i === -1 ? note : pool[Math.max(i - 1, 0)];
    });
    setBassLine(prev  => shift(prev, mode.b));
    setSynthLine(prev => shift(prev, mode.s));
  }, [modeName, pushUndo]);

  // ── Project I/O ────────────────────────────────────────────────────────────

  const exportProject = useCallback(({ bpm, currentSectionName, projectName }) => {
    const project = buildProjectJSON({
      patterns, bassLine, synthLine, laneLen, bpm, genre, modeName, arpeMode, currentSectionName,
    });
    downloadProjectJSON(project, `${projectName || 'cesira-project'}.json`);
  }, [patterns, bassLine, synthLine, laneLen, genre, modeName, arpeMode]);

  const importProject = useCallback(async (file) => {
    if (!file) return null;
    const json = await parseProjectJSON(file);
    const { meta = {}, data = {} } = json;
    if (data.patterns)  setPatterns(data.patterns);
    if (data.bassLine)  setBassLine(data.bassLine);
    if (data.synthLine) setSynthLine(data.synthLine);
    if (data.laneLen)   setLaneLen(data.laneLen);
    stepRef.current = 0;
    return meta; // caller applies bpm, genre, modeName, etc.
  }, []);

  return {
    patterns, bassLine, synthLine, laneLen,
    stepRef, historyLen: history.length, savedScenes,
    applyEvolution,
    undo, toggleCell, setNote, clearPatterns, regenerateSection,
    saveScene, loadScene, exportProject, importProject,
    mutate, thinOut, thicken, reharmonize, shiftArp,
    randomizeSynthNotes, randomizeBassNotes, shiftNotesUp, shiftNotesDown,
  };
}
