import React, { useState } from 'react';
import { MAX_STEPS, MODES, SECTIONS } from '../music/core';
import { SOUND_PRESETS } from '../music/presets';
import PresetSelect from '../components/PresetSelect';

const LANE_CLR = {
  kick: '#ff4444',
  snare: '#ffaa00',
  hat: '#ffdd00',
  bass: '#00ccff',
  synth: '#cc88ff',
};

const navBtn = {
  padding: '1px 5px',
  borderRadius: 2,
  border: '1px solid rgba(255,255,255,0.09)',
  background: 'rgba(255,255,255,0.03)',
  color: 'rgba(255,255,255,0.96)',
  fontSize: 10,
  cursor: 'pointer',
  fontFamily: 'Space Mono,monospace',
};

export default function StudioView({
  genre,
  gc,
  patterns,
  bassLine,
  synthLine,
  laneLen,
  step,
  page,
  setPage,
  toggleCell,
  setNote,
  modeName,
  laneVU,
  space,
  setSpace,
  tone,
  setTone,
  noiseMix,
  setNoiseMix,
  drive,
  setDrive,
  compress,
  setCompress,
  bassFilter,
  setBassFilter,
  synthFilter,
  setSynthFilter,
  drumDecay,
  setDrumDecay,
  bassSubAmt,
  setBassSubAmt,
  fmIdx,
  setFmIdx,
  master,
  setMaster,
  swing,
  setSwing,
  humanize,
  setHumanize,
  grooveAmt,
  setGrooveAmt,
  grooveProfile,
  setGrooveProfile,
  regenerateSection,
  currentSectionName,
  undoLen,
  undo,
  recState,
  startRec,
  stopRec,
  recordings,
  exportJSON,
  importRef,
  importJSON,
  savedScenes,
  saveScene,
  loadScene,
  projectName,
  setProjectName,
  clearPattern,
  polySynth,
  setPolySynth,
  bassStack,
  setBassStack,
  bassPreset,
  synthPreset,
  drumPreset,
  performancePreset,
  applyBassPreset,
  applySynthPreset,
  applyDrumPreset,
  applyPerformancePreset,
  compact,
  phone,
}) {
  void projectName;
  void setProjectName;

  const [tab, setTab] = useState('mixer');
  const [noteEditLane, setNoteEditLane] = useState('bass');

  const visibleStart = page * 16;
  const visibleEnd = Math.min(visibleStart + 16, MAX_STEPS);
  const visIdx = Array.from({ length: visibleEnd - visibleStart }, (_, i) => visibleStart + i);
  const mode = MODES[modeName] || MODES.minor;
  const notePool = noteEditLane === 'bass' ? mode.b : mode.s;

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: compact ? 'column' : 'row',
        gap: 5,
        padding: phone ? '8px' : '5px 7px 8px 7px',
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* LEFT — Grid editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
        {/* Grid header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, height: 20, flexShrink: 0 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.96)', letterSpacing: '0.1em' }}>
            {genre.toUpperCase()} · {modeName.toUpperCase()} · {currentSectionName.toUpperCase()}
          </span>
          <div style={{ flex: 1 }} />
          <button
            onClick={undo}
            disabled={undoLen === 0}
            style={{ ...navBtn, opacity: undoLen > 0 ? 1 : 0.3, fontSize: 10 }}
          >
            ↩ ({undoLen})
          </button>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{ ...navBtn, opacity: page === 0 ? 0.3 : 1 }}
          >
            ‹
          </button>
          <span
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.96)',
              fontFamily: 'Space Mono,monospace',
            }}
          >
            pg {page + 1}/4
          </span>
          <button
            onClick={() => setPage((p) => Math.min(3, p + 1))}
            disabled={page === 3}
            style={{ ...navBtn, opacity: page === 3 ? 0.3 : 1 }}
          >
            ›
          </button>
        </div>

        {/* Lane grids */}
        {['kick', 'snare', 'hat', 'bass', 'synth'].map((lane) => {
          const lc = LANE_CLR[lane];
          const ll = laneLen[lane] || 16;
          const vu = laneVU[lane] || 0;

          return (
            <div
              key={lane}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'stretch',
                gap: 4,
                minHeight: 0,
              }}
            >
              <div
                style={{
                  width: 36,
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 1,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: lc,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  {lane}
                </span>

                <div
                  style={{
                    height: 2,
                    borderRadius: 1,
                    background: 'rgba(255,255,255,0.05)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${vu * 100}%`,
                      background: lc,
                      borderRadius: 1,
                      transition: 'width 0.04s',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${visIdx.length},1fr)`,
                  gap: 1.5,
                  alignItems: 'stretch',
                }}
              >
                {visIdx.map((idx) => {
                  if (idx >= ll) {
                    return (
                      <div
                        key={idx}
                        style={{
                          borderRadius: 2,
                          background: 'rgba(255,255,255,0.015)',
                          opacity: 0.4,
                        }}
                      />
                    );
                  }

                  const sd = patterns[lane][idx];
                  const on = sd.on;
                  const isActive = step === idx;
                  const isBeat = idx % 4 === 0;
                  const isBar = idx % 16 === 0;

                  return (
                    <button
                      key={idx}
                      onClick={() => toggleCell(lane, idx)}
                      style={{
                        borderRadius: 2,
                        border: `1px solid ${
                          isActive
                            ? lc
                            : isBar
                              ? `${lc}38`
                              : isBeat
                                ? 'rgba(255,255,255,0.07)'
                                : 'rgba(255,255,255,0.03)'
                        }`,
                        background: isActive ? `${lc}77` : on ? `${lc}66` : 'rgba(255,255,255,0.02)',
                        cursor: 'pointer',
                        transition: 'background 0.03s',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Note editor row */}
        <div
          style={{
            flexShrink: 0,
            borderTop: '1px solid rgba(255,255,255,0.05)',
            paddingTop: 4,
          }}
        >
          <div style={{ display: 'flex', gap: 4, marginBottom: 3, alignItems: 'center' }}>
            <span
              style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.96)',
                letterSpacing: '0.12em',
              }}
            >
              NOTES
            </span>

            {['bass', 'synth'].map((l) => (
              <button
                key={l}
                onClick={() => setNoteEditLane(l)}
                style={{
                  ...navBtn,
                  border: `1px solid ${noteEditLane === l ? LANE_CLR[l] : 'rgba(255,255,255,0.1)'}`,
                  color: noteEditLane === l ? LANE_CLR[l] : 'rgba(255,255,255,0.97)',
                  fontSize: 10,
                }}
              >
                {l}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${visIdx.length},1fr)`, gap: 1.5 }}>
            {visIdx.map((idx) => {
              const lc = LANE_CLR[noteEditLane];
              const isOn = noteEditLane === 'bass' ? patterns.bass[idx]?.on : patterns.synth[idx]?.on;
              const curNote = noteEditLane === 'bass' ? bassLine[idx] : synthLine[idx];
              const cur = notePool.indexOf(curNote);

              return (
                <div key={idx} style={{ opacity: isOn ? 1 : 0.2 }}>
                  <button
                    disabled={!isOn}
                    onClick={() => {
                      if (!isOn) return;
                      const next = notePool[(cur + 1) % notePool.length];
                      setNote(noteEditLane, idx, next);
                    }}
                    style={{
                      width: '100%',
                      padding: '2px 0',
                      borderRadius: 2,
                      border: `1px solid ${isOn ? `${lc}44` : 'rgba(255,255,255,0.04)'}`,
                      background: isOn ? `${lc}1a` : 'rgba(255,255,255,0.01)',
                      color: isOn ? lc : 'rgba(255,255,255,0.94)',
                      fontSize: 10,
                      cursor: isOn ? 'pointer' : 'default',
                      fontFamily: 'Space Mono,monospace',
                      textAlign: 'center',
                    }}
                  >
                    {curNote || '—'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT — Controls */}
      <div
        style={{
          width: compact ? '100%' : 178,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          flexShrink: 0,
          borderLeft: compact ? 'none' : '1px solid rgba(255,255,255,0.05)',
          borderTop: compact ? '1px solid rgba(255,255,255,0.05)' : 'none',
        }}
      >
        {/* Tabs + preset bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4, alignItems: 'flex-end' }}>
          <PresetSelect
            label="BASS"
            value={bassPreset}
            options={SOUND_PRESETS.bass}
            onChange={applyBassPreset}
            accent="#22d3ee"
            compact
          />
          <PresetSelect
            label="SYNTH"
            value={synthPreset}
            options={SOUND_PRESETS.synth}
            onChange={applySynthPreset}
            accent={gc}
            compact
          />
          <PresetSelect
            label="DRUM"
            value={drumPreset}
            options={SOUND_PRESETS.drum}
            onChange={applyDrumPreset}
            accent="#ffb347"
            compact
          />
          <PresetSelect
            label="PERF"
            value={performancePreset}
            options={SOUND_PRESETS.performance}
            onChange={applyPerformancePreset}
            accent="#7ee787"
            compact
          />

          <button
            onClick={clearPattern}
            style={{
              padding: '4px 8px',
              borderRadius: 3,
              border: '1px solid rgba(255,80,80,0.3)',
              background: 'rgba(255,80,80,0.08)',
              color: '#ff8a8a',
              fontSize: 10,
              cursor: 'pointer',
              fontFamily: 'Space Mono,monospace',
            }}
          >
            CLEAR
          </button>

          <button
            onClick={() => setPolySynth((v) => !v)}
            style={{
              padding: '4px 8px',
              borderRadius: 3,
              border: `1px solid ${polySynth ? gc : 'rgba(255,255,255,0.08)'}`,
              background: polySynth ? `${gc}18` : 'rgba(255,255,255,0.03)',
              color: polySynth ? gc : 'rgba(255,255,255,0.97)',
              fontSize: 10,
              cursor: 'pointer',
              fontFamily: 'Space Mono,monospace',
            }}
          >
            SYNTH POLY
          </button>

          <button
            onClick={() => setBassStack((v) => !v)}
            style={{
              padding: '4px 8px',
              borderRadius: 3,
              border: '1px solid rgba(34,211,238,0.25)',
              background: bassStack ? 'rgba(34,211,238,0.12)' : 'rgba(255,255,255,0.03)',
              color: bassStack ? '#22d3ee' : 'rgba(255,255,255,0.97)',
              fontSize: 10,
              cursor: 'pointer',
              fontFamily: 'Space Mono,monospace',
            }}
          >
            BASS STACK
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
          {['mixer', 'synth', 'session'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: '5px 0',
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: '0.1em',
                border: 'none',
                background: 'transparent',
                color: tab === t ? gc : 'rgba(255,255,255,0.94)',
                cursor: 'pointer',
                borderBottom: tab === t ? `2px solid ${gc}` : '2px solid transparent',
                textTransform: 'uppercase',
                fontFamily: 'Space Mono,monospace',
                transition: 'color 0.1s',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '6px 7px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {tab === 'mixer' && (
            <>
              {[
                { l: 'MASTER', v: master, s: setMaster, c: '#ffffff' },
                { l: 'SPACE', v: space, s: setSpace, c: '#44ffcc' },
                { l: 'TONE', v: tone, s: setTone, c: '#22d3ee' },
                { l: 'NOISE', v: noiseMix, s: setNoiseMix, c: '#aaaaaa' },
                { l: 'DRIVE', v: drive, s: setDrive, c: '#ff8844' },
                { l: 'COMPRESS', v: compress, s: setCompress, c: '#ffaa44' },
                { l: 'BASS FILTER', v: bassFilter, s: setBassFilter, c: LANE_CLR.bass },
                { l: 'SYNTH FILTER', v: synthFilter, s: setSynthFilter, c: LANE_CLR.synth },
                { l: 'DRUM DECAY', v: drumDecay, s: setDrumDecay, c: LANE_CLR.kick },
                { l: 'BASS SUB', v: bassSubAmt, s: setBassSubAmt, c: LANE_CLR.bass },
                { l: 'SWING', v: swing, s: setSwing, min: 0, max: 0.25, c: '#aa88ff' },
                { l: 'HUMANIZE', v: humanize, s: setHumanize, min: 0, max: 0.05, c: '#88aaff' },
                { l: 'GROOVE AMT', v: grooveAmt, s: setGrooveAmt, c: '#ffdd00' },
                { l: 'FM INDEX', v: fmIdx, s: setFmIdx, min: 0, max: 3, c: '#cc88ff' },
              ].map(({ l, v, s, c, min = 0, max = 1 }) => (
                <div key={l}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 0 }}>
                    <span
                      style={{
                        fontSize: 10,
                        letterSpacing: '0.08em',
                        color: 'rgba(255,255,255,0.96)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {l}
                    </span>
                    <span style={{ fontSize: 10, color: c, fontFamily: 'Space Mono,monospace' }}>
                      {(((v - min) / (max - min)) * 100).toFixed(0)}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={(max - min) / 200}
                    value={v}
                    onChange={(e) => s(Number(e.target.value))}
                    style={{ width: '100%', accentColor: c, color: c, height: 12 }}
                  />
                </div>
              ))}

              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.96)',
                    letterSpacing: '0.1em',
                    marginBottom: 2,
                    textTransform: 'uppercase',
                  }}
                >
                  GROOVE PROFILE
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  {['steady', 'broken', 'bunker', 'float'].map((gp) => (
                    <button
                      key={gp}
                      onClick={() => setGrooveProfile(gp)}
                      style={{
                        padding: '3px',
                        borderRadius: 2,
                        border: `1px solid ${grooveProfile === gp ? gc : 'rgba(255,255,255,0.08)'}`,
                        background: grooveProfile === gp ? `${gc}18` : 'rgba(255,255,255,0.02)',
                        color: grooveProfile === gp ? gc : 'rgba(255,255,255,0.96)',
                        fontSize: 9.5,
                        cursor: 'pointer',
                        fontFamily: 'Space Mono,monospace',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {gp}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'synth' && (
            <>
              <div
                style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.96)',
                  letterSpacing: '0.1em',
                  marginBottom: 2,
                  textTransform: 'uppercase',
                }}
              >
                SECTION GENERATOR
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                {Object.keys(SECTIONS).map((sec) => (
                  <button
                    key={sec}
                    onClick={() => regenerateSection(sec)}
                    style={{
                      padding: '5px 3px',
                      borderRadius: 2,
                      border: `1px solid ${currentSectionName === sec ? gc : 'rgba(255,255,255,0.08)'}`,
                      background: currentSectionName === sec ? `${gc}18` : 'rgba(255,255,255,0.02)',
                      color: currentSectionName === sec ? gc : 'rgba(255,255,255,0.97)',
                      fontSize: 10,
                      cursor: 'pointer',
                      fontFamily: 'Space Mono,monospace',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {sec}
                  </button>
                ))}
              </div>

              <div
                style={{
                  marginTop: 3,
                  fontSize: 9.5,
                  color: 'rgba(255,255,255,0.96)',
                  lineHeight: 1.5,
                }}
              >
                Click to regenerate with that section&apos;s feel.
              </div>
            </>
          )}

          {tab === 'session' && (
            <>
              <button
                onClick={recState === 'idle' ? startRec : stopRec}
                style={{
                  padding: '7px',
                  borderRadius: 3,
                  border: `1px solid ${recState === 'recording' ? '#ff2244' : 'rgba(255,255,255,0.12)'}`,
                  background: recState === 'recording' ? 'rgba(255,34,68,0.12)' : 'rgba(255,255,255,0.03)',
                  color: recState === 'recording' ? '#ff2244' : 'rgba(255,255,255,0.55)',
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'Space Mono,monospace',
                  letterSpacing: '0.1em',
                  textAlign: 'center',
                }}
              >
                {recState === 'recording' ? '■ STOP REC' : '● REC'}
              </button>

              {recordings.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    padding: '3px 5px',
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <audio src={r.url} controls style={{ flex: 1, height: 22, filter: 'invert(1)', opacity: 0.65 }} />
                  <a
                    href={r.url}
                    download={r.name}
                    style={{
                      color: gc,
                      fontSize: 9.5,
                      textDecoration: 'none',
                      fontFamily: 'Space Mono,monospace',
                    }}
                  >
                    DL
                  </a>
                </div>
              ))}

              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

              <div
                style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.96)',
                  letterSpacing: '0.12em',
                  marginBottom: 2,
                  textTransform: 'uppercase',
                }}
              >
                SCENES (6)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 3 }}>
                {savedScenes.map((sc, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <button
                      onClick={() => loadScene(i)}
                      style={{
                        padding: '5px',
                        borderRadius: 3,
                        border: `1px solid ${sc ? `${gc}44` : 'rgba(255,255,255,0.08)'}`,
                        background: sc ? `${gc}0d` : 'rgba(255,255,255,0.02)',
                        color: sc ? gc : 'rgba(255,255,255,0.95)',
                        fontSize: 10,
                        cursor: 'pointer',
                        fontFamily: 'Space Mono,monospace',
                        textAlign: 'center',
                      }}
                    >
                      S{i + 1}
                      {sc ? ' ◆' : ''}
                    </button>

                    <button
                      onClick={() => saveScene(i)}
                      style={{
                        padding: '2px',
                        borderRadius: 2,
                        border: '1px solid rgba(255,255,255,0.07)',
                        background: 'rgba(255,255,255,0.02)',
                        color: 'rgba(255,255,255,0.96)',
                        fontSize: 10,
                        cursor: 'pointer',
                        fontFamily: 'Space Mono,monospace',
                        textAlign: 'center',
                      }}
                    >
                      SAVE
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

              <button
                onClick={exportJSON}
                style={{
                  padding: '7px',
                  borderRadius: 3,
                  border: `1px solid ${gc}44`,
                  background: `${gc}0d`,
                  color: gc,
                  fontSize: 10,
                  cursor: 'pointer',
                  fontFamily: 'Space Mono,monospace',
                  letterSpacing: '0.1em',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                }}
              >
                EXPORT JSON
              </button>

              <button
                onClick={() => importRef.current?.click()}
                style={{
                  padding: '7px',
                  borderRadius: 3,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.03)',
                  color: 'rgba(255,255,255,0.96)',
                  fontSize: 10,
                  cursor: 'pointer',
                  fontFamily: 'Space Mono,monospace',
                  letterSpacing: '0.1em',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                }}
              >
                IMPORT JSON
              </button>

              <input
                ref={importRef}
                type="file"
                accept=".json"
                onChange={importJSON}
                style={{ display: 'none' }}
              />

              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '2px 0' }} />

              <div
                style={{
                  fontSize: 9.5,
                  color: 'rgba(255,255,255,0.96)',
                  lineHeight: 1.7,
                  letterSpacing: '0.06em',
                }}
              >
                SHORTCUTS
                <br />
                SPACE = play/stop
                <br />
                A=drop S=break D=build
                <br />
                F=groove G=tension H=fill
                <br />
                M=mutate R=regen P=autopilot
                <br />
                T=tap tempo Z=undo
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}