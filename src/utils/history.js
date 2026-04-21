// HISTORY / UNDO ENGINE

export function cloneSnapshot(snapshot) {
  return JSON.parse(JSON.stringify(snapshot));
}

export function buildHistorySnapshot({
  patterns,
  bassLine,
  synthLine,
  laneLen,
  bpm,
  genre,
  modeName,
  arpeMode,
  currentSectionName,
}) {
  return cloneSnapshot({
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
}

export function pushHistory(history, snapshot, limit = 32) {
  const next = [...history, cloneSnapshot(snapshot)];
  if (next.length > limit) {
    return next.slice(next.length - limit);
  }
  return next;
}

export function popHistory(history) {
  if (!history.length) {
    return {
      nextHistory: history,
      snapshot: null,
    };
  }

  const nextHistory = history.slice(0, -1);
  const snapshot = cloneSnapshot(history[history.length - 1]);

  return {
    nextHistory,
    snapshot,
  };
}

export function restoreHistorySnapshot(snapshot, setters) {
  if (!snapshot || !setters) return;

  const {
    setPatterns,
    setBassLine,
    setSynthLine,
    setLaneLen,
    setBpm,
    setGenre,
    setModeName,
    setArpeMode,
    setCurrentSectionName,
  } = setters;

  if (snapshot.patterns && setPatterns) setPatterns(snapshot.patterns);
  if (snapshot.bassLine && setBassLine) setBassLine(snapshot.bassLine);
  if (snapshot.synthLine && setSynthLine) setSynthLine(snapshot.synthLine);
  if (snapshot.laneLen && setLaneLen) setLaneLen(snapshot.laneLen);
  if (typeof snapshot.bpm === 'number' && setBpm) setBpm(snapshot.bpm);
  if (snapshot.genre && setGenre) setGenre(snapshot.genre);
  if (snapshot.modeName && setModeName) setModeName(snapshot.modeName);
  if (snapshot.arpeMode && setArpeMode) setArpeMode(snapshot.arpeMode);
  if (snapshot.currentSectionName && setCurrentSectionName) {
    setCurrentSectionName(snapshot.currentSectionName);
  }
}