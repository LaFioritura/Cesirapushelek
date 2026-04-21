// PROJECT IMPORT / EXPORT ENGINE

export function buildProjectJSON({
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
  return {
    version: 1,
    meta: {
      bpm,
      genre,
      modeName,
      arpeMode,
      currentSectionName,
      createdAt: Date.now(),
    },
    data: {
      patterns,
      bassLine,
      synthLine,
      laneLen,
    },
  };
}

export function downloadProjectJSON(project, filename = 'cesira-project.json') {
  const blob = new Blob([JSON.stringify(project, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

export function parseProjectJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);

        if (!json?.data) {
          reject('Invalid project file');
          return;
        }

        resolve(json);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = reject;
    reader.readAsText(file);
  });
}