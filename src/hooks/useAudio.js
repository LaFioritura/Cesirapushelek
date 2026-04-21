import { useRef, useEffect, useCallback, useState } from 'react';
import { initAudioEngine, applyFxNow, makeLaneGainGetter } from '../audio/engineCore';
import { createAudioRecorder, revokeRecordingUrl } from '../utils/audioRecorder';

/**
 * Manages the Web Audio engine lifecycle, FX parameters, lane gains,
 * and audio recording. Returns stable refs and callbacks.
 */
export function useAudio({ space, tone, drive, compress, master, genre }) {
  const audioRef       = useRef(null);
  const analyserRef    = useRef(null);
  const laneGainsRef   = useRef({});
  const getLaneGainRef = useRef(null);
  const recorderRef    = useRef(null);

  const [isReady,    setIsReady]    = useState(false);
  const [status,     setStatus]     = useState('idle');
  const [recState,   setRecState]   = useState('idle');
  const [recordings, setRecordings] = useState([]);

  // Build getLaneGain once on mount.
  useEffect(() => {
    getLaneGainRef.current = makeLaneGainGetter(audioRef, laneGainsRef);
  }, []);

  // Revoke object URLs on unmount to avoid memory leaks.
  useEffect(() => () => recordings.forEach(revokeRecordingUrl), [recordings]);

  // Re-apply FX whenever any parameter changes, but only after engine is up.
  useEffect(() => {
    if (!audioRef.current) return;
    applyFxNow({ audioRef, space, tone, drive, compress, master, genre });
  }, [space, tone, drive, compress, master, genre]);

  const ensureEngine = useCallback(async () => {
    const engine = await initAudioEngine({
      audioRef, analyserRef,
      setIsReady, setStatus,
    });
    if (!engine) return null;
    applyFxNow({ audioRef, space, tone, drive, compress, master, genre });
    return engine;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genre]); // FX params are read from refs inside applyFxNow

  const resumeContext = useCallback(async () => {
    if (audioRef.current?.ctx?.state === 'suspended') {
      await audioRef.current.ctx.resume();
    }
  }, []);

  const startRecording = useCallback(async (projectName) => {
    const engine = await ensureEngine();
    if (!engine?.dest?.stream) return;
    try {
      const rec = createAudioRecorder({ mediaStream: engine.dest.stream, projectName });
      recorderRef.current = rec;
      rec.start();
      setRecState('recording');
    } catch {
      setRecState('idle');
    }
  }, [ensureEngine]);

  const stopRecording = useCallback(async () => {
    if (!recorderRef.current) return;
    try {
      const recording = await recorderRef.current.stop();
      setRecordings(prev => [recording, ...prev].slice(0, 12));
    } finally {
      recorderRef.current = null;
      setRecState('idle');
    }
  }, []);

  return {
    audioRef,
    analyserRef,
    getLaneGain: getLaneGainRef,
    isReady,
    status,
    recState,
    recordings,
    ensureEngine,
    resumeContext,
    startRecording,
    stopRecording,
  };
}
