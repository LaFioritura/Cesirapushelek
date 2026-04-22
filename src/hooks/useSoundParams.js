import { useCallback, useState } from 'react';
import {
  BASS_PRESETS, SYNTH_PRESETS, DRUM_PRESETS, PERFORMANCE_PRESETS,
  GENRE_PROFILES, SECTION_AUTOMATIONS,
} from '../music/presets';

/**
 * Owns all synthesis/FX parameter state and preset application logic.
 * Keeps these separate from pattern state so each area re-renders independently.
 */
export function useSoundParams() {
  const [master,   setMaster]   = useState(0.8);
  const [space,    setSpace]    = useState(0.3);
  const [tone,     setTone]     = useState(0.5);
  const [drive,    setDrive]    = useState(0.2);
  const [compress, setCompress] = useState(0.25);

  const [grooveAmt,  setGrooveAmt]  = useState(0.5);
  const [swing,      setSwing]      = useState(0.03);
  const [humanize,   setHumanize]   = useState(0.0);

  const [noiseMix,    setNoiseMix]    = useState(0.15);
  const [bassFilter,  setBassFilter]  = useState(0.55);
  const [synthFilter, setSynthFilter] = useState(0.65);
  const [drumDecay,   setDrumDecay]   = useState(0.35);
  const [bassSubAmt,  setBassSubAmt]  = useState(0.6);
  const [fmIdx,       setFmIdx]       = useState(0.8);

  const [polySynth,     setPolySynth]     = useState(true);
  const [bassStack,     setBassStack]     = useState(false);
  const [grooveProfile, setGrooveProfile] = useState('steady');

  const [bassPreset,        setBassPreset]        = useState('sub_floor');
  const [synthPreset,       setSynthPreset]       = useState('velvet_pad');
  const [drumPreset,        setDrumPreset]        = useState('tight_punch');
  const [performancePreset, setPerformancePreset] = useState('club_night');

  const applyBassPreset = useCallback((name) => {
    const p = BASS_PRESETS[name];
    if (!p) return;
    setBassPreset(name);
    if (p.bassSubAmt !== undefined) setBassSubAmt(p.bassSubAmt);
    if (p.bassFilter !== undefined) setBassFilter(p.bassFilter);
    if (p.fmIdx      !== undefined) setFmIdx(p.fmIdx);
  }, []);

  const applySynthPreset = useCallback((name) => {
    const p = SYNTH_PRESETS[name];
    if (!p) return;
    setSynthPreset(name);
    if (p.synthFilter !== undefined) setSynthFilter(p.synthFilter);
    if (p.tone        !== undefined) setTone(p.tone);
    if (p.space       !== undefined) setSpace(p.space);
  }, []);

  const applyDrumPreset = useCallback((name) => {
    const p = DRUM_PRESETS[name];
    if (!p) return;
    setDrumPreset(name);
    if (p.drumDecay !== undefined) setDrumDecay(p.drumDecay);
    if (p.noiseMix  !== undefined) setNoiseMix(p.noiseMix);
  }, []);

  const applyPerformancePreset = useCallback((name) => {
    const p = PERFORMANCE_PRESETS[name];
    if (!p) return;
    setPerformancePreset(name);
    if (p.master   !== undefined) setMaster(p.master);
    if (p.drive    !== undefined) setDrive(p.drive);
    if (p.compress !== undefined) setCompress(p.compress);
    if (p.space    !== undefined) setSpace(p.space);
  }, []);

  // Apply full genre profile — sets all params to match the genre DNA.
  const applyGenreProfile = useCallback((genre) => {
    const p = GENRE_PROFILES[genre];
    if (!p) return;
    // Presets
    if (p.bass)  applyBassPreset(p.bass);
    if (p.synth) applySynthPreset(p.synth);
    if (p.drum)  applyDrumPreset(p.drum);
    if (p.perf)  applyPerformancePreset(p.perf);
    // Timing / groove
    if (p.grooveProfile !== undefined) setGrooveProfile(p.grooveProfile);
    if (p.grooveAmt     !== undefined) setGrooveAmt(p.grooveAmt);
    if (p.swing         !== undefined) setSwing(p.swing);
    if (p.humanize      !== undefined) setHumanize(p.humanize);
    // FX
    if (p.space    !== undefined) setSpace(p.space);
    if (p.tone     !== undefined) setTone(p.tone);
    if (p.drive    !== undefined) setDrive(p.drive);
    if (p.compress !== undefined) setCompress(p.compress);
  }, [applyBassPreset, applySynthPreset, applyDrumPreset, applyPerformancePreset]);

  // Apply section delta — nudges FX params based on section character.
  // Called every time a section is triggered, on top of the base genre profile.
  const applySectionAutomation = useCallback((sectionName) => {
    const delta = SECTION_AUTOMATIONS[sectionName];
    if (!delta) return;
    if (delta.space    !== undefined) setSpace(prev    => Math.max(0, Math.min(1, prev    + delta.space)));
    if (delta.drive    !== undefined) setDrive(prev    => Math.max(0, Math.min(1, prev    + delta.drive)));
    if (delta.compress !== undefined) setCompress(prev => Math.max(0, Math.min(1, prev    + delta.compress)));
    if (delta.grooveAmt!== undefined) setGrooveAmt(prev=> Math.max(0, Math.min(1, prev   + delta.grooveAmt)));
  }, []);

  // Bulk restore — used by scene load.
  const restoreParams = useCallback((snap) => {
    if (!snap) return;
    if (snap.master   !== undefined) setMaster(snap.master);
    if (snap.space    !== undefined) setSpace(snap.space);
    if (snap.tone     !== undefined) setTone(snap.tone);
    if (snap.drive    !== undefined) setDrive(snap.drive);
    if (snap.compress !== undefined) setCompress(snap.compress);
    if (snap.grooveAmt  !== undefined) setGrooveAmt(snap.grooveAmt);
    if (snap.swing      !== undefined) setSwing(snap.swing);
    if (snap.humanize   !== undefined) setHumanize(snap.humanize);
    if (snap.noiseMix   !== undefined) setNoiseMix(snap.noiseMix);
    if (snap.bassFilter !== undefined) setBassFilter(snap.bassFilter);
    if (snap.synthFilter !== undefined) setSynthFilter(snap.synthFilter);
    if (snap.drumDecay  !== undefined) setDrumDecay(snap.drumDecay);
    if (snap.bassSubAmt !== undefined) setBassSubAmt(snap.bassSubAmt);
    if (snap.fmIdx      !== undefined) setFmIdx(snap.fmIdx);
    if (snap.polySynth  !== undefined) setPolySynth(snap.polySynth);
    if (snap.bassStack  !== undefined) setBassStack(snap.bassStack);
    if (snap.grooveProfile !== undefined) setGrooveProfile(snap.grooveProfile);
    if (snap.bassPreset)        setBassPreset(snap.bassPreset);
    if (snap.synthPreset)       setSynthPreset(snap.synthPreset);
    if (snap.drumPreset)        setDrumPreset(snap.drumPreset);
    if (snap.performancePreset) setPerformancePreset(snap.performancePreset);
  }, []);

  return {
    // FX / master
    master, setMaster, space, setSpace, tone, setTone,
    drive, setDrive, compress, setCompress,
    // Timing
    grooveAmt, setGrooveAmt, swing, setSwing, humanize, setHumanize,
    // Voice params
    noiseMix, setNoiseMix, bassFilter, setBassFilter,
    synthFilter, setSynthFilter, drumDecay, setDrumDecay,
    bassSubAmt, setBassSubAmt, fmIdx, setFmIdx,
    // Poly / stack
    polySynth, setPolySynth, bassStack, setBassStack,
    grooveProfile, setGrooveProfile,
    // Presets
    bassPreset, synthPreset, drumPreset, performancePreset,
    applyBassPreset, applySynthPreset, applyDrumPreset, applyPerformancePreset,
    // Genre / section automation
    applyGenreProfile, applySectionAutomation,
    // Bulk restore
    restoreParams,
  };
}
