import React, { useCallback, useEffect, useRef, useState } from 'react';
import './index.css';

import { GENRE_NAMES, SECTIONS, buildSong } from './music/core';

import { useAudio }       from './hooks/useAudio';
import { usePatterns }    from './hooks/usePatterns';
import { useSequencer }   from './hooks/useSequencer';
import { useSoundParams } from './hooks/useSoundParams';

import PerformView from './views/PerformView';
import StudioView  from './views/StudioView';
import SongView    from './views/SongView';

const SECTION_COLORS = {
  drop:'#ff2244', break:'#4488ff', build:'#ffaa00', groove:'#00cc66',
  tension:'#ff6622', fill:'#cc00ff', intro:'#44ffcc', outro:'#888899',
};

export default function App() {
  const [genre,              setGenre]              = useState('techno');
  const [bpm,                setBpm]                = useState(128);
  const [modeName,           setModeName]           = useState('minor');
  const [arpeMode,           setArpeMode]           = useState('up');
  const [currentSectionName, setCurrentSectionName] = useState('groove');
  const [view,               setView]               = useState('perform');
  const [page,               setPage]               = useState(0);
  const [projectName,        setProjectName]        = useState('cesira-session');

  const [songArc,    setSongArc]    = useState([]);
  const [arcIdx,     setArcIdx]     = useState(0);
  const [songActive, setSongActive] = useState(false);

  const [laneVU,      setLaneVU]      = useState({ kick:0, snare:0, hat:0, bass:0, synth:0 });
  const [activeNotes, setActiveNotes] = useState({ bass:'—', synth:'—' });

  const activeNodesRef = useRef(0);
  const importRef      = useRef(null);

  // ── Domain hooks ───────────────────────────────────────────────────────────
  const sound = useSoundParams();

  const audio = useAudio({
    space: sound.space, tone: sound.tone, drive: sound.drive,
    compress: sound.compress, master: sound.master, genre,
  });

  const pat = usePatterns({ genre, modeName, arpeMode, setCurrentSectionName });

  // ── VU flash ──────────────────────────────────────────────────────────────
  const flashLane = useCallback((lane, value = 1) => {
    setLaneVU(prev => ({ ...prev, [lane]: Math.max(prev[lane], value) }));
    setTimeout(() => setLaneVU(prev => ({ ...prev, [lane]: Math.max(0, prev[lane] * 0.35) })), 70);
  }, []);

  // ── Sequencer ──────────────────────────────────────────────────────────────
  const seq = useSequencer({
    audioRef: audio.audioRef, getLaneGain: audio.getLaneGain,
    activeNodesRef, patterns: pat.patterns, laneLen: pat.laneLen,
    bassLine: pat.bassLine, synthLine: pat.synthLine, stepRef: pat.stepRef,
    bpm, genre, modeName,
    bassStack: sound.bassStack, polySynth: sound.polySynth,
    tone: sound.tone, compress: sound.compress, space: sound.space,
    bassFilter: sound.bassFilter, synthFilter: sound.synthFilter,
    drumDecay: sound.drumDecay, noiseMix: sound.noiseMix,
    bassSubAmt: sound.bassSubAmt, fmIdx: sound.fmIdx,
    swing: sound.swing, humanize: sound.humanize,
    grooveAmt: sound.grooveAmt, grooveProfile: sound.grooveProfile,
    setActiveNotes, flashLane,
  });

  // ── Transport ──────────────────────────────────────────────────────────────
  const toggleTransport = useCallback(async () => {
    if (!audio.isReady) await audio.ensureEngine();
    else await audio.resumeContext();
    seq.isPlaying ? seq.stop() : seq.start();
  }, [audio, seq]);

  // Apply genre profile automatically when genre changes.
  useEffect(() => {
    sound.applyGenreProfile(genre);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genre]);

  // Section trigger — generates pattern AND applies section automation.
  // Declared early so keyboard shortcuts and song arc can reference it.
  const triggerSection = useCallback((name) => {
    pat.regenerateSection(name);
    sound.applySectionAutomation(name);
  }, [pat, sound]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const SECTION_KEYS = { a:'drop', s:'break', d:'build', f:'groove', g:'tension', h:'fill' };
    const onKey = e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      const k = e.key.toLowerCase();
      if (k === ' ')   { e.preventDefault(); toggleTransport(); }
      if (k === 'z')   pat.undo();
      if (k === 'm')   pat.mutate();
      if (k === 'r')   triggerSection(currentSectionName);
      if (SECTION_KEYS[k]) triggerSection(SECTION_KEYS[k]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleTransport, pat, currentSectionName]);

  // ── Song arc ───────────────────────────────────────────────────────────────
  const startSongArc = useCallback(() => {
    const song = buildSong(genre);
    setSongArc(song.arc); setArcIdx(0); setSongActive(true);
    setModeName(song.modeName); setArpeMode(song.arpeMode); setBpm(song.bpm);
    triggerSection(song.arc[0] || 'groove');
  }, [genre, triggerSection]);

  const stopSongArc = useCallback(() => setSongActive(false), []);

  // Advance arc every 128 steps.
  useEffect(() => {
    if (!songActive || !seq.isPlaying || songArc.length === 0) return;
    const s = pat.stepRef.current;
    if (s > 0 && s % 128 === 0) {
      const next = arcIdx + 1;
      if (next >= songArc.length) { setSongActive(false); return; }
      setArcIdx(next);
      triggerSection(songArc[next]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seq.visibleStep]);

  // ── Scene management ───────────────────────────────────────────────────────
  const loadScene = useCallback((idx) => {
    const scene = pat.loadScene(idx);
    if (!scene) return;
    if (scene.genre)              setGenre(scene.genre);
    if (scene.bpm)                setBpm(scene.bpm);
    if (scene.modeName)           setModeName(scene.modeName);
    if (scene.arpeMode)           setArpeMode(scene.arpeMode);
    if (scene.currentSectionName) setCurrentSectionName(scene.currentSectionName);
    sound.restoreParams(scene);
  }, [pat, sound]);

  const saveScene = useCallback((idx) => {
    pat.saveScene(idx, {
      bpm, genre, modeName, arpeMode, currentSectionName,
      master: sound.master, space: sound.space, tone: sound.tone,
      drive: sound.drive, compress: sound.compress, grooveAmt: sound.grooveAmt,
      swing: sound.swing, humanize: sound.humanize, noiseMix: sound.noiseMix,
      bassFilter: sound.bassFilter, synthFilter: sound.synthFilter,
      drumDecay: sound.drumDecay, bassSubAmt: sound.bassSubAmt, fmIdx: sound.fmIdx,
      bassPreset: sound.bassPreset, synthPreset: sound.synthPreset,
      drumPreset: sound.drumPreset, performancePreset: sound.performancePreset,
      polySynth: sound.polySynth, bassStack: sound.bassStack,
      grooveProfile: sound.grooveProfile,
    });
  }, [pat, bpm, genre, modeName, arpeMode, currentSectionName, sound]);

  // ── Project I/O ────────────────────────────────────────────────────────────
  const exportProject = useCallback(() => {
    pat.exportProject({ bpm, currentSectionName, projectName });
  }, [pat, bpm, currentSectionName, projectName]);

  const handleImport = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const meta = await pat.importProject(file);
      if (meta.bpm)                setBpm(meta.bpm);
      if (meta.genre)              setGenre(meta.genre);
      if (meta.modeName)           setModeName(meta.modeName);
      if (meta.arpeMode)           setArpeMode(meta.arpeMode);
      if (meta.currentSectionName) setCurrentSectionName(meta.currentSectionName);
    } finally { e.target.value = ''; }
  }, [pat]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const sectionColor = SECTION_COLORS[currentSectionName] ?? '#ffffff';

  // Actions object passed to views.
  const perfActions = {
    drop:    () => triggerSection('drop'),
    break:   () => triggerSection('break'),
    build:   () => triggerSection('build'),
    groove:  () => triggerSection('groove'),
    tension: () => triggerSection('tension'),
    fill:    () => triggerSection('fill'),
    intro:   () => triggerSection('intro'),
    outro:   () => triggerSection('outro'),
    mutate:          pat.mutate,
    thinOut:         pat.thinOut,
    thicken:         pat.thicken,
    reharmonize:     pat.reharmonize,
    shiftArp:        () => pat.shiftArp(arpeMode, setArpeMode),
    randomizeNotes:  pat.randomizeSynthNotes,
    randomizeBass:   pat.randomizeBassNotes,
    shiftNotesUp:    pat.shiftNotesUp,
    shiftNotesDown:  pat.shiftNotesDown,
    clear:           pat.clearPatterns,
    regen:           () => triggerSection(currentSectionName),
  };

  // Props passed to views — explicit, no giant spread.
  const gridProps = {
    patterns: pat.patterns, bassLine: pat.bassLine, synthLine: pat.synthLine,
    laneLen: pat.laneLen, step: seq.visibleStep, page, setPage,
    toggleCell: pat.toggleCell, setNote: pat.setNote,
    modeName, laneVU, activeNotes, isPlaying: seq.isPlaying,
  };

  const sectionProps = {
    genre, currentSectionName, sectionColor, sectionColors: SECTION_COLORS,
    songArc, arcIdx, songActive, arpeMode, modeName,
    regenerateSection: triggerSection,
    perfActions,
  };

  const sceneProps = { savedScenes: pat.savedScenes, saveScene, loadScene };

  return (
    <div className="app-shell">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="g-header">
        <div className="g-header__logo">
          <span className="g-header__logo-mark">◆</span>
          <span className="g-header__logo-name">CESIRA</span>
          <span className="g-header__logo-ver">V2</span>
        </div>

        <nav className="g-nav">
          {['perform','studio','song'].map(v => (
            <button key={v} className={`g-nav__btn${view===v?' active':''}`} onClick={() => setView(v)}>{v}</button>
          ))}
        </nav>

        <div className="g-transport">
          <select value={genre} onChange={e => setGenre(e.target.value)} className="g-transport__genre-select">
            {GENRE_NAMES.map(g => <option key={g} value={g}>{g.toUpperCase()}</option>)}
          </select>

          <div className="g-transport__bpm">
            <button className="g-transport__bpm-btn" onClick={() => setBpm(b => Math.max(60,b-1))}>−</button>
            <div className="g-transport__bpm-body">
              <span className="g-transport__bpm-val">{bpm}</span>
              <span className="g-transport__bpm-lbl">BPM</span>
            </div>
            <button className="g-transport__bpm-btn" onClick={() => setBpm(b => Math.min(220,b+1))}>+</button>
          </div>

          <span className="g-transport__status">
            {audio.isReady ? '● audio' : '○ idle'} · {audio.status}
          </span>

          <button className={`play-btn${seq.isPlaying?' playing':''}`} onClick={toggleTransport}>
            {seq.isPlaying ? '■' : '▶'}
          </button>
        </div>
      </header>

      {/* ── Views ───────────────────────────────────────────────────────────── */}
      <div className="view-root">
        {view === 'perform' && (
          <PerformView
            {...gridProps}
            {...sectionProps}
            {...sceneProps}
            master={sound.master}       setMaster={sound.setMaster}
            space={sound.space}         setSpace={sound.setSpace}
            tone={sound.tone}           setTone={sound.setTone}
            drive={sound.drive}         setDrive={sound.setDrive}
            grooveAmt={sound.grooveAmt} setGrooveAmt={sound.setGrooveAmt}
            swing={sound.swing}         setSwing={sound.setSwing}
          />
        )}

        {view === 'studio' && (
          <StudioView
            genre={genre}
            {...gridProps}
            {...sectionProps}
            {...sceneProps}
            master={sound.master}           setMaster={sound.setMaster}
            space={sound.space}             setSpace={sound.setSpace}
            tone={sound.tone}               setTone={sound.setTone}
            drive={sound.drive}             setDrive={sound.setDrive}
            compress={sound.compress}       setCompress={sound.setCompress}
            grooveAmt={sound.grooveAmt}     setGrooveAmt={sound.setGrooveAmt}
            swing={sound.swing}             setSwing={sound.setSwing}
            humanize={sound.humanize}       setHumanize={sound.setHumanize}
            noiseMix={sound.noiseMix}       setNoiseMix={sound.setNoiseMix}
            bassFilter={sound.bassFilter}   setBassFilter={sound.setBassFilter}
            synthFilter={sound.synthFilter} setSynthFilter={sound.setSynthFilter}
            drumDecay={sound.drumDecay}     setDrumDecay={sound.setDrumDecay}
            bassSubAmt={sound.bassSubAmt}   setBassSubAmt={sound.setBassSubAmt}
            fmIdx={sound.fmIdx}             setFmIdx={sound.setFmIdx}
            polySynth={sound.polySynth}     setPolySynth={sound.setPolySynth}
            bassStack={sound.bassStack}     setBassStack={sound.setBassStack}
            grooveProfile={sound.grooveProfile} setGrooveProfile={sound.setGrooveProfile}
            bassPreset={sound.bassPreset}           applyBassPreset={sound.applyBassPreset}
            synthPreset={sound.synthPreset}         applySynthPreset={sound.applySynthPreset}
            drumPreset={sound.drumPreset}           applyDrumPreset={sound.applyDrumPreset}
            performancePreset={sound.performancePreset} applyPerformancePreset={sound.applyPerformancePreset}
            historyLen={pat.historyLen}   undo={pat.undo}
            clearPattern={pat.clearPatterns}
            recState={audio.recState}     recordings={audio.recordings}
            startRec={() => audio.startRecording(projectName)}
            stopRec={audio.stopRecording}
            exportJSON={exportProject}
            importRef={importRef}         importJSON={handleImport}
            projectName={projectName}     setProjectName={setProjectName}
          />
        )}

        {view === 'song' && (
          <SongView
            genre={genre} bpm={bpm}
            {...sectionProps}
            {...sceneProps}
            SECTIONS={SECTIONS}
            triggerSection={triggerSection}
            startSongArc={startSongArc}
            stopSongArc={stopSongArc}
          />
        )}
      </div>

      <input ref={importRef} type="file" accept=".json" onChange={handleImport} style={{ display:'none' }} />
    </div>
  );
}
