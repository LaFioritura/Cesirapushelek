import { useCallback, useRef, useState } from 'react';
import { MAX_STEPS, CHORD_PROGS, mkSteps, mkNotes, buildSection } from '../music/core';
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

  // ── Section generation ─────────────────────────────────────────────────────

  const regenerateSection = useCallback((sectionName) => {
    pushUndo();
    const progPool   = CHORD_PROGS[modeName] || CHORD_PROGS.minor;
    const result     = buildSection(genre, sectionName, modeName, progPool[0], arpeMode, 'C2');
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
    patterns,
    bassLine,
    synthLine,
    laneLen,
    stepRef,
    historyLen: history.length,
    savedScenes,
    undo,
    toggleCell,
    setNote,
    clearPatterns,
    regenerateSection,
    saveScene,
    loadScene,
    exportProject,
    importProject,
  };
}
