// SCENE SAVE / LOAD ENGINE

export function cloneSceneData(data) {
  return JSON.parse(JSON.stringify(data));
}

export function buildSceneSnapshot({
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
}) {
  return cloneSceneData({
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
}

export function saveSceneAtIndex(scenes, index, snapshot) {
  const next = [...scenes];
  next[index] = cloneSceneData(snapshot);
  return next;
}

export function loadSceneAtIndex(scenes, index) {
  const scene = scenes[index];
  if (!scene) return null;
  return cloneSceneData(scene);
}

export function restoreSceneSnapshot(snapshot, setters) {
  if (!snapshot || !setters) return;

  const {
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
  } = setters;

  if (snapshot.patterns && setPatterns) setPatterns(snapshot.patterns);
  if (snapshot.bassLine && setBassLine) setBassLine(snapshot.bassLine);
  if (snapshot.synthLine && setSynthLine) setSynthLine(snapshot.synthLine);
  if (snapshot.laneLen && setLaneLen) setLaneLen(snapshot.laneLen);

  if (snapshot.genre && setGenre) setGenre(snapshot.genre);
  if (typeof snapshot.bpm === 'number' && setBpm) setBpm(snapshot.bpm);
  if (snapshot.modeName && setModeName) setModeName(snapshot.modeName);
  if (snapshot.arpeMode && setArpeMode) setArpeMode(snapshot.arpeMode);
  if (snapshot.currentSectionName && setCurrentSectionName) {
    setCurrentSectionName(snapshot.currentSectionName);
  }

  if (typeof snapshot.master === 'number' && setMaster) setMaster(snapshot.master);
  if (typeof snapshot.space === 'number' && setSpace) setSpace(snapshot.space);
  if (typeof snapshot.tone === 'number' && setTone) setTone(snapshot.tone);
  if (typeof snapshot.drive === 'number' && setDrive) setDrive(snapshot.drive);
  if (typeof snapshot.compress === 'number' && setCompress) setCompress(snapshot.compress);
  if (typeof snapshot.grooveAmt === 'number' && setGrooveAmt) setGrooveAmt(snapshot.grooveAmt);
  if (typeof snapshot.swing === 'number' && setSwing) setSwing(snapshot.swing);
  if (typeof snapshot.humanize === 'number' && setHumanize) setHumanize(snapshot.humanize);
  if (typeof snapshot.noiseMix === 'number' && setNoiseMix) setNoiseMix(snapshot.noiseMix);
  if (typeof snapshot.bassFilter === 'number' && setBassFilter) setBassFilter(snapshot.bassFilter);
  if (typeof snapshot.synthFilter === 'number' && setSynthFilter) setSynthFilter(snapshot.synthFilter);
  if (typeof snapshot.drumDecay === 'number' && setDrumDecay) setDrumDecay(snapshot.drumDecay);
  if (typeof snapshot.bassSubAmt === 'number' && setBassSubAmt) setBassSubAmt(snapshot.bassSubAmt);
  if (typeof snapshot.fmIdx === 'number' && setFmIdx) setFmIdx(snapshot.fmIdx);

  if (snapshot.bassPreset && setBassPreset) setBassPreset(snapshot.bassPreset);
  if (snapshot.synthPreset && setSynthPreset) setSynthPreset(snapshot.synthPreset);
  if (snapshot.drumPreset && setDrumPreset) setDrumPreset(snapshot.drumPreset);
  if (snapshot.performancePreset && setPerformancePreset) {
    setPerformancePreset(snapshot.performancePreset);
  }

  if (typeof snapshot.polySynth === 'boolean' && setPolySynth) setPolySynth(snapshot.polySynth);
  if (typeof snapshot.bassStack === 'boolean' && setBassStack) setBassStack(snapshot.bassStack);
  if (snapshot.grooveProfile && setGrooveProfile) setGrooveProfile(snapshot.grooveProfile);
}