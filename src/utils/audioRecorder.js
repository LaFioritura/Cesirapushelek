// AUDIO RECORDING ENGINE

export function makeRecorderFilename(projectName = 'cesira-session', ext = 'webm') {
  const safe = String(projectName || 'cesira-session')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const stamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .replace('Z', '');

  return `${safe || 'cesira-session'}_${stamp}.${ext}`;
}

export function pickRecorderMimeType() {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
  ];

  for (const type of types) {
    try {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    } catch {}
  }

  return '';
}

export function createAudioRecorder({ mediaStream, projectName = 'cesira-session' }) {
  if (!mediaStream) {
    throw new Error('Missing media stream for recorder');
  }

  if (!window.MediaRecorder) {
    throw new Error('MediaRecorder is not supported in this browser');
  }

  const mimeType = pickRecorderMimeType();
  const chunks = [];

  const recorder = mimeType
    ? new MediaRecorder(mediaStream, { mimeType })
    : new MediaRecorder(mediaStream);

  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  const finalize = () =>
    new Promise((resolve, reject) => {
      recorder.onstop = () => {
        try {
          const usedMime = recorder.mimeType || mimeType || 'audio/webm';
          const ext = usedMime.includes('ogg')
            ? 'ogg'
            : usedMime.includes('mp4')
              ? 'm4a'
              : 'webm';

          const blob = new Blob(chunks, { type: usedMime });
          const url = URL.createObjectURL(blob);
          const name = makeRecorderFilename(projectName, ext);

          resolve({
            blob,
            url,
            name,
            mimeType: usedMime,
            size: blob.size,
            createdAt: Date.now(),
          });
        } catch (err) {
          reject(err);
        }
      };

      recorder.onerror = (err) => reject(err);
    });

  return {
    recorder,
    start() {
      chunks.length = 0;
      recorder.start(250);
    },
    async stop() {
      const done = finalize();
      recorder.stop();
      return done;
    },
  };
}

export function revokeRecordingUrl(recording) {
  try {
    if (recording?.url) URL.revokeObjectURL(recording.url);
  } catch {}
}