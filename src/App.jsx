import React, { useEffect, useRef, useState } from 'react';

import {
  MAX_STEPS,
  CHORD_PROGS,
  SECTIONS,
  mkSteps,
  mkNotes,
  buildSection,
  buildSong,
} from './music/core';

import {
  BASS_PRESETS,
  SYNTH_PRESETS,
  DRUM_PRESETS,
  PERFORMANCE_PRESETS,
} from './music/presets';

import PerformView from './views/PerformView';
import StudioView from './views/StudioView';
import SongView from './views/SongView';

import {
  initAudioEngine,
  applyFxNow,
  makeLaneGainGetter,
} from './audio/engineCore';

import { playKick, playSnare, playHat } from './audio/voiceDrums';
import { playBass } from './audio/voiceBass';
import { playSynth } from './audio/voiceSynth';

import {
  buildProjectJSON,
  downloadProjectJSON,
  parseProjectJSON,
} from './utils/projectIO';

import {
  createAudioRecorder,
  revokeRecordingUrl,
} from './utils/audioRecorder';

import {
  buildHistorySnapshot,
  pushHistory,
  popHistory,
  restoreHistorySnapshot,
} from './utils/history';

import {
  buildSceneSnapshot,
  saveSceneAtIndex,
  loadSceneAtIndex,
  restoreSceneSnapshot,
} from './utils/scenes';

export default function App() {
  const [genre, setGenre] = useState('techno');
  const [bpm, setBpm] = useState(128);

  const [patterns, setPatterns] = useState({
    kick: mkSteps(),
    snare: mkSteps(),
    hat: mkSteps(),
    bass: mkSteps(),
    synth: mkSteps(),
  });

  const [bassLine, setBassLine] = useState(mkNotes('C2'));
  const [synthLine, setSynthLine] = useState(mkNotes('C4'));

  const [laneLen, setLaneLen] = useState({
    kick: 16,
    snare: 16,
    hat: 32,
    bass: 32,
    synth: 32,
  });

  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [page, setPage] = useState(0);

  const [modeName, setModeName] = useState('minor');
  const [arpeMode, setArpeMode] = useState('up');
  const [currentSectionName, setCurrentSectionName] = useState('groove');

  const [songArc, setSongArc] = useState([]);
  const [arcIdx, setArcIdx] = useState(0);
  const [songActive, setSongActive] = useState(false);

  const [master, setMaster] = useState(0.8);
  const [space, setSpace] = useState(0.3);
  const [tone, setTone] = useState(0.5);
  const [drive, setDrive] = useState(0.2);
  const [compress, setCompress] = useState(0.25);

  const [grooveAmt, setGrooveAmt] = useState(0.5);
  const [swing, setSwing] = useState(0.03);
  const [humanize, setHumanize] = useState(0.0);
  const [autopilotIntensity, setAutopilotIntensity] = useState(0.5);

  const [noiseMix, setNoiseMix] = useState(0.15);
  const [bassFilter, setBassFilter] = useState(0.55);
  const [synthFilter, setSynthFilter] = useState(0.65);
  const [drumDecay, setDrumDecay] = useState(0.35);
  const [bassSubAmt, setBassSubAmt] = useState(0.6);
  const [fmIdx, setFmIdx] = useState(0.8);

  const [savedScenes, setSavedScenes] = useState(Array(6).fill(null));

  const [bassPreset, setBassPreset] = useState('sub_floor');
  const [synthPreset, setSynthPreset] = useState('velvet_pad');
  const [drumPreset, setDrumPreset] = useState('tight_punch');
  const [performancePreset, setPerformancePreset] = useState('club_night');

  const [polySynth, setPolySynth] = useState(true);
  const [bassStack, setBassStack] = useState(false);
  const [grooveProfile, setGrooveProfile] = useState('steady');

  const [view, setView] = useState('perform');
  const [projectName, setProjectName] = useState('cesira-session');

  const [isAudioReady, setIsAudioReady] = useState(false);
  const [status, setStatus] = useState('Idle');

  const [laneVU, setLaneVU] = useState({
    kick: 0,
    snare: 0,
    hat: 0,
    bass: 0,
    synth: 0,
  });

  const [activeNotes, setActiveNotes] = useState({
    bass: '—',
    synth: '—',
  });

  const [history, setHistory] = useState([]);
  const [recState, setRecState] = useState('idle');
  const [recordings, setRecordings] = useState([]);

  const importRef = useRef(null);

  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const laneGainsRef = useRef({});
  const getLaneGainRef = useRef(null);
  const activeNodesRef = useRef(0);
  const stepRef = useRef(0);
  const recorderRef = useRef(null);

  const gc = '#ffffff';

  useEffect(() => {
    getLaneGainRef.current = makeLaneGainGetter(audioRef, laneGainsRef);
  }, []);

  useEffect(() => {
    return () => {
      recordings.forEach(revokeRecordingUrl);
    };
  }, [recordings]);

  const ensureAudio = async () => {
    const engine = await initAudioEngine({
      audioRef,
      analyserRef,
      setIsReady: setIsAudioReady,
      setStatus,
    });

    if (!engine) return null;

    applyFxNow({
      audioRef,
      space,
      tone,
      drive,
      compress,
      master,
      genre,
    });

    return engine;
  };

  useEffect(() => {
    if (!audioRef.current) return;

    applyFxNow({
      audioRef,
      space,
      tone,
      drive,
      compress,
      master,
      genre,
    });
  }, [space, tone, drive, compress, master, genre]);

  const stepSec = () => (60 / bpm) / 4;

  const captureSnapshot = () =>
    buildHistorySnapshot({
      patterns,
      bassLine,
      synthLine,
      laneLen,
      bpm,
      genre,
      modeName,
      arpeMode,
      currentSectionName,
    });

  const pushUndo = () => {
    const snap = captureSnapshot();
    setHistory((prev) => pushHistory(prev, snap, 32));
  };

  const flashLane = (lane, value = 1) => {
    setLaneVU((prev) => ({ ...prev, [lane]: Math.max(prev[lane], value) }));
    setTimeout(() => {
      setLaneVU((prev) => ({ ...prev, [lane]: Math.max(0, prev[lane] * 0.35) }));
    }, 70);
  };

  useEffect(() => {
    if (!isPlaying) return;
    if (!audioRef.current) return;

    const intervalMs = stepSec() * 1000;

    const interval = setInterval(() => {
      const current = stepRef.current;
      const now = audioRef.current.ctx.currentTime;

      const kickStep = current % (laneLen.kick || 16);
      const kickCell = patterns.kick[kickStep];
      if (kickCell?.on) {
        playKick({
          audioRef,
          getLaneGain: getLaneGainRef.current,
          genre,
          drumDecay,
          noiseMix,
          bassSubAmt,
          activeNodesRef,
          flashLane,
          accent: kickCell.v ?? 1,
          time: now,
        });
      }

      const snareStep = current % (laneLen.snare || 16);
      const snareCell = patterns.snare[snareStep];
      if (snareCell?.on) {
        playSnare({
          audioRef,
          getLaneGain: getLaneGainRef.current,
          genre,
          drumDecay,
          noiseMix,
          activeNodesRef,
          flashLane,
          accent: snareCell.v ?? 1,
          time: now,
        });
      }

      const hatStep = current % (laneLen.hat || 32);
      const hatCell = patterns.hat[hatStep];
      if (hatCell?.on) {
        const open =
          (hatCell.l ?? 1) > 1.25 ||
          (hatStep % 8 === 7 && (hatCell.v ?? 1) > 0.7);

        playHat({
          audioRef,
          getLaneGain: getLaneGainRef.current,
          genre,
          noiseMix,
          activeNodesRef,
          flashLane,
          accent: hatCell.v ?? 1,
          open,
          time: now,
        });
      }

      const bassStep = current % (laneLen.bass || 32);
      const bassCell = patterns.bass[bassStep];
      if (bassCell?.on) {
        playBass({
          audioRef,
          getLaneGain: getLaneGainRef.current,
          genre,
          note: bassLine[bassStep],
          accent: bassCell.v ?? 1,
          time: now,
          lenSteps: bassCell.l ?? 1,
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
        });
      }

      const synthStep = current % (laneLen.synth || 32);
      const synthCell = patterns.synth[synthStep];
      if (synthCell?.on) {
        playSynth({
          audioRef,
          getLaneGain: getLaneGainRef.current,
          genre,
          note: synthLine[synthStep],
          accent: synthCell.v ?? 1,
          time: now,
          lenSteps: synthCell.l ?? 1,
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
        });
      }

      const next = (current + 1) % MAX_STEPS;
      stepRef.current = next;
      setStep(next);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [
    isPlaying,
    bpm,
    patterns,
    laneLen,
    genre,
    drumDecay,
    noiseMix,
    bassSubAmt,
    bassLine,
    synthLine,
    bassFilter,
    synthFilter,
    tone,
    compress,
    space,
    fmIdx,
    modeName,
    bassStack,
    polySynth,
  ]);

  const toggleCell = (lane, idx) => {
    pushUndo();
    setPatterns((p) => {
      const next = { ...p };
      next[lane] = [...next[lane]];
      next[lane][idx] = { ...next[lane][idx], on: !next[lane][idx].on };
      return next;
    });
  };

  const setNote = (lane, idx, note) => {
    pushUndo();
    if (lane === 'bass') {
      setBassLine((prev) => {
        const next = [...prev];
        next[idx] = note;
        return next;
      });
    } else if (lane === 'synth') {
      setSynthLine((prev) => {
        const next = [...prev];
        next[idx] = note;
        return next;
      });
    }
  };

  const regenerateSection = (name) => {
    pushUndo();
    const mode = modeName;
    const progPool = CHORD_PROGS[mode] || CHORD_PROGS.minor;
    const progression = progPool[0];

    const result = buildSection(
      genre,
      name,
      mode,
      progression,
      arpeMode,
      'C2',
    );

    setPatterns(result.patterns);
    setBassLine(result.bassLine);
    setSynthLine(result.synthLine);
    setLaneLen(result.laneLen);
    setCurrentSectionName(name);
    stepRef.current = 0;
    setStep(0);
    setActiveNotes({ bass: '—', synth: '—' });
  };

  const triggerSection = (name) => regenerateSection(name);

  const startSongArc = () => {
    const s = buildSong(genre);
    setSongArc(s.arc);
    setArcIdx(0);
    setSongActive(true);
    setModeName(s.modeName);
    setArpeMode(s.arpeMode);
    setBpm(s.bpm);
    setCurrentSectionName(s.arc[0] || 'groove');
  };

  const stopSongArc = () => setSongActive(false);

  const perfActions = {
    drop: () => triggerSection('drop'),
    break: () => triggerSection('break'),
    build: () => triggerSection('build'),
    groove: () => triggerSection('groove'),
    tension: () => triggerSection('tension'),
    fill: () => triggerSection('fill'),
    intro: () => triggerSection('intro'),
    outro: () => triggerSection('outro'),
    mutate: () => {},
    thinOut: () => {},
    thicken: () => {},
    reharmonize: () => {},
    shiftArp: () => {},
    randomizeNotes: () => {},
    randomizeBass: () => {},
    shiftNotesUp: () => {},
    shiftNotesDown: () => {},
    clear: () => {
      pushUndo();
      setPatterns({
        kick: mkSteps(),
        snare: mkSteps(),
        hat: mkSteps(),
        bass: mkSteps(),
        synth: mkSteps(),
      });
      setActiveNotes({ bass: '—', synth: '—' });
    },
  };

  const saveScene = (i) => {
    const scene = buildSceneSnapshot({
      patterns,
      bassLine,
      synthLine,
      laneLen,
      genre,
      bpm,
      modeName,
      arpeMode,
      currentSectionName,
      master,
      space,
      tone,
      drive,
      compress,
      grooveAmt,
      swing,
      humanize,
      noiseMix,
      bassFilter,
      synthFilter,
      drumDecay,
      bassSubAmt,
      fmIdx,
      bassPreset,
      synthPreset,
      drumPreset,
      performancePreset,
      polySynth,
      bassStack,
      grooveProfile,
    });

    setSavedScenes((prev) => saveSceneAtIndex(prev, i, scene));
  };

  const loadScene = (i) => {
    const scene = loadSceneAtIndex(savedScenes, i);
    if (!scene) return;

    restoreSceneSnapshot(scene, {
      setPatterns,
      setBassLine,
      setSynthLine,
      setLaneLen,
      setGenre,
      setBpm,
      setModeName,
      setArpeMode,
      setCurrentSectionName,
      setMaster,
      setSpace,
      setTone,
      setDrive,
      setCompress,
      setGrooveAmt,
      setSwing,
      setHumanize,
      setNoiseMix,
      setBassFilter,
      setSynthFilter,
      setDrumDecay,
      setBassSubAmt,
      setFmIdx,
      setBassPreset,
      setSynthPreset,
      setDrumPreset,
      setPerformancePreset,
      setPolySynth,
      setBassStack,
      setGrooveProfile,
    });

    stepRef.current = 0;
    setStep(0);
    setActiveNotes({ bass: '—', synth: '—' });
  };

  const clearPattern = () => {
    pushUndo();
    setPatterns({
      kick: mkSteps(),
      snare: mkSteps(),
      hat: mkSteps(),
      bass: mkSteps(),
      synth: mkSteps(),
    });
    stepRef.current = 0;
    setStep(0);
    setActiveNotes({ bass: '—', synth: '—' });
  };

  const exportJSON = () => {
    const project = buildProjectJSON({
      patterns,
      bassLine,
      synthLine,
      laneLen,
      bpm,
      genre,
      modeName,
      arpeMode,
      currentSectionName,
    });

    downloadProjectJSON(project, `${projectName || 'cesira-project'}.json`);
  };

  const importJSON = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const json = await parseProjectJSON(file);
      const meta = json.meta || {};
      const data = json.data || {};

      if (data.patterns) setPatterns(data.patterns);
      if (data.bassLine) setBassLine(data.bassLine);
      if (data.synthLine) setSynthLine(data.synthLine);
      if (data.laneLen) setLaneLen(data.laneLen);

      if (typeof meta.bpm === 'number') setBpm(meta.bpm);
      if (meta.genre) setGenre(meta.genre);
      if (meta.modeName) setModeName(meta.modeName);
      if (meta.arpeMode) setArpeMode(meta.arpeMode);
      if (meta.currentSectionName) setCurrentSectionName(meta.currentSectionName);

      stepRef.current = 0;
      setStep(0);
      setActiveNotes({ bass: '—', synth: '—' });
    } finally {
      e.target.value = '';
    }
  };

  const undo = () => {
    const { nextHistory, snapshot } = popHistory(history);
    if (!snapshot) return;

    setHistory(nextHistory);

    restoreHistorySnapshot(snapshot, {
      setPatterns,
      setBassLine,
      setSynthLine,
      setLaneLen,
      setBpm,
      setGenre,
      setModeName,
      setArpeMode,
      setCurrentSectionName,
    });

    stepRef.current = 0;
    setStep(0);
    setActiveNotes({ bass: '—', synth: '—' });
  };

  const startRec = async () => {
    const engine = await ensureAudio();
    if (!engine?.dest?.stream) return;

    try {
      const rec = createAudioRecorder({
        mediaStream: engine.dest.stream,
        projectName,
      });

      recorderRef.current = rec;
      rec.start();
      setRecState('recording');
    } catch {
      setRecState('idle');
    }
  };

  const stopRec = async () => {
    if (!recorderRef.current) return;

    try {
      const recording = await recorderRef.current.stop();
      setRecordings((prev) => [recording, ...prev].slice(0, 12));
    } finally {
      recorderRef.current = null;
      setRecState('idle');
    }
  };

  const applyBassPreset = (name) => {
    const p = BASS_PRESETS[name];
    if (!p) return;
    setBassPreset(name);
    if (p.bassSubAmt !== undefined) setBassSubAmt(p.bassSubAmt);
    if (p.bassFilter !== undefined) setBassFilter(p.bassFilter);
    if (p.fmIdx !== undefined) setFmIdx(p.fmIdx);
  };

  const applySynthPreset = (name) => {
    const p = SYNTH_PRESETS[name];
    if (!p) return;
    setSynthPreset(name);
    if (p.synthFilter !== undefined) setSynthFilter(p.synthFilter);
    if (p.tone !== undefined) setTone(p.tone);
    if (p.space !== undefined) setSpace(p.space);
  };

  const applyDrumPreset = (name) => {
    const p = DRUM_PRESETS[name];
    if (!p) return;
    setDrumPreset(name);
    if (p.drumDecay !== undefined) setDrumDecay(p.drumDecay);
    if (p.noiseMix !== undefined) setNoiseMix(p.noiseMix);
  };

  const applyPerformancePreset = (name) => {
    const p = PERFORMANCE_PRESETS[name];
    if (!p) return;
    setPerformancePreset(name);
    if (p.master !== undefined) setMaster(p.master);
    if (p.drive !== undefined) setDrive(p.drive);
    if (p.compress !== undefined) setCompress(p.compress);
    if (p.space !== undefined) setSpace(p.space);
  };

  const toggleTransport = async () => {
    if (!isAudioReady) {
      await ensureAudio();
    } else if (audioRef.current?.ctx?.state === 'suspended') {
      await audioRef.current.ctx.resume();
    }

    if (!isPlaying) {
      stepRef.current = step;
    }

    setIsPlaying((p) => !p);
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', gap: 6, padding: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        {['perform', 'studio', 'song'].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: '4px 8px',
              border: '1px solid #333',
              background: view === v ? '#111' : '#000',
              color: '#fff',
              fontSize: 10,
              cursor: 'pointer',
              fontFamily: 'Space Mono,monospace',
              textTransform: 'uppercase',
            }}
          >
            {v}
          </button>
        ))}

        <button
          onClick={toggleTransport}
          style={{
            padding: '4px 8px',
            border: '1px solid #333',
            background: isPlaying ? '#111' : '#000',
            color: '#fff',
            fontSize: 10,
            cursor: 'pointer',
            fontFamily: 'Space Mono,monospace',
          }}
        >
          {isPlaying ? 'STOP' : 'PLAY'}
        </button>

        <div
          style={{
            marginLeft: 'auto',
            fontSize: 10,
            color: 'rgba(255,255,255,0.7)',
            fontFamily: 'Space Mono,monospace',
          }}
        >
          {status} · {isAudioReady ? 'audio ready' : 'audio idle'}
        </div>
      </div>

      {view === 'perform' && (
        <PerformView
          genre={genre}
          gc={gc}
          isPlaying={isPlaying}
          currentSectionName={currentSectionName}
          laneVU={laneVU}
          patterns={patterns}
          bassLine={bassLine}
          synthLine={synthLine}
          laneLen={laneLen}
          step={step}
          page={page}
          setPage={setPage}
          activeNotes={activeNotes}
          arpeMode={arpeMode}
          modeName={modeName}
          autopilot={false}
          autopilotIntensity={autopilotIntensity}
          setAutopilotIntensity={setAutopilotIntensity}
          perfActions={perfActions}
          regenerateSection={regenerateSection}
          savedScenes={savedScenes}
          saveScene={saveScene}
          loadScene={loadScene}
          master={master}
          setMaster={setMaster}
          space={space}
          setSpace={setSpace}
          tone={tone}
          setTone={setTone}
          drive={drive}
          setDrive={setDrive}
          grooveAmt={grooveAmt}
          setGrooveAmt={setGrooveAmt}
          swing={swing}
          setSwing={setSwing}
          toggleCell={toggleCell}
          songArc={songArc}
          arcIdx={arcIdx}
          songActive={songActive}
          setNote={setNote}
          bassPreset={bassPreset}
          synthPreset={synthPreset}
          drumPreset={drumPreset}
          performancePreset={performancePreset}
          applyBassPreset={applyBassPreset}
          applySynthPreset={applySynthPreset}
          applyDrumPreset={applyDrumPreset}
          applyPerformancePreset={applyPerformancePreset}
          compact={false}
          phone={false}
        />
      )}

      {view === 'studio' && (
        <StudioView
          genre={genre}
          gc={gc}
          patterns={patterns}
          bassLine={bassLine}
          synthLine={synthLine}
          laneLen={laneLen}
          step={step}
          page={page}
          setPage={setPage}
          toggleCell={toggleCell}
          setNote={setNote}
          modeName={modeName}
          laneVU={laneVU}
          space={space}
          setSpace={setSpace}
          tone={tone}
          setTone={setTone}
          noiseMix={noiseMix}
          setNoiseMix={setNoiseMix}
          drive={drive}
          setDrive={setDrive}
          compress={compress}
          setCompress={setCompress}
          bassFilter={bassFilter}
          setBassFilter={setBassFilter}
          synthFilter={synthFilter}
          setSynthFilter={setSynthFilter}
          drumDecay={drumDecay}
          setDrumDecay={setDrumDecay}
          bassSubAmt={bassSubAmt}
          setBassSubAmt={setBassSubAmt}
          fmIdx={fmIdx}
          setFmIdx={setFmIdx}
          master={master}
          setMaster={setMaster}
          swing={swing}
          setSwing={setSwing}
          humanize={humanize}
          setHumanize={setHumanize}
          grooveAmt={grooveAmt}
          setGrooveAmt={setGrooveAmt}
          grooveProfile={grooveProfile}
          setGrooveProfile={setGrooveProfile}
          regenerateSection={regenerateSection}
          currentSectionName={currentSectionName}
          undoLen={history.length}
          undo={undo}
          recState={recState}
          startRec={startRec}
          stopRec={stopRec}
          recordings={recordings}
          exportJSON={exportJSON}
          importRef={importRef}
          importJSON={importJSON}
          savedScenes={savedScenes}
          saveScene={saveScene}
          loadScene={loadScene}
          projectName={projectName}
          setProjectName={setProjectName}
          clearPattern={clearPattern}
          polySynth={polySynth}
          setPolySynth={setPolySynth}
          bassStack={bassStack}
          setBassStack={setBassStack}
          bassPreset={bassPreset}
          synthPreset={synthPreset}
          drumPreset={drumPreset}
          performancePreset={performancePreset}
          applyBassPreset={applyBassPreset}
          applySynthPreset={applySynthPreset}
          applyDrumPreset={applyDrumPreset}
          applyPerformancePreset={applyPerformancePreset}
          compact={false}
          phone={false}
        />
      )}

      {view === 'song' && (
        <SongView
          genre={genre}
          gc={gc}
          songArc={songArc}
          arcIdx={arcIdx}
          songActive={songActive}
          startSongArc={startSongArc}
          stopSongArc={stopSongArc}
          currentSectionName={currentSectionName}
          SONG_ARCS={[]}
          SECTIONS={SECTIONS}
          triggerSection={triggerSection}
          modeName={modeName}
          arpeMode={arpeMode}
          bpm={bpm}
          compact={false}
          phone={false}
        />
      )}
    </div>
  );
}