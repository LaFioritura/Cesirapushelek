import React, { useState } from 'react';
import { MAX_STEPS, MODES, SECTIONS } from '../music/core';
import { SOUND_PRESETS } from '../music/presets';

const LANE_CLR = { kick:'#ff4444', snare:'#ffaa00', hat:'#ffdd00', bass:'#00ccff', synth:'#cc88ff' };

function MacroSlider({ label, v, s, c, min=0, max=1 }) {
  const pct = (((v - min) / (max - min)) * 100).toFixed(0);
  return (
    <div className="macro-slider" style={{ '--macro-color': c }}>
      <div className="macro-slider__head">
        <span className="macro-slider__label">{label}</span>
        <span className="macro-slider__val">{pct}</span>
      </div>
      <input type="range" min={min} max={max} step={(max-min)/200} value={v}
        onChange={e => s(Number(e.target.value))} style={{ color: c }} />
    </div>
  );
}

export default function StudioView({
  genre, gc, patterns, bassLine, synthLine, laneLen,
  step, page, setPage, toggleCell, setNote, modeName, laneVU,
  space, setSpace, tone, setTone, noiseMix, setNoiseMix,
  drive, setDrive, compress, setCompress,
  bassFilter, setBassFilter, synthFilter, setSynthFilter,
  drumDecay, setDrumDecay, bassSubAmt, setBassSubAmt, fmIdx, setFmIdx,
  master, setMaster, swing, setSwing, humanize, setHumanize,
  grooveAmt, setGrooveAmt, grooveProfile, setGrooveProfile,
  regenerateSection, currentSectionName,
  undoLen, undo, recState, startRec, stopRec, recordings,
  exportJSON, importRef, importJSON,
  savedScenes, saveScene, loadScene,
  projectName, setProjectName, clearPattern,
  polySynth, setPolySynth, bassStack, setBassStack,
  bassPreset, synthPreset, drumPreset, performancePreset,
  applyBassPreset, applySynthPreset, applyDrumPreset, applyPerformancePreset,
  compact, phone,
}) {
  void projectName; void setProjectName;

  const [tab,          setTab]          = useState('mixer');
  const [noteEditLane, setNoteEditLane] = useState('bass');

  const visStart  = page * 16;
  const visEnd    = Math.min(visStart + 16, MAX_STEPS);
  const visIdx    = Array.from({ length: visEnd - visStart }, (_, i) => visStart + i);
  const cols      = visIdx.length;
  const mode      = MODES[modeName] || MODES.minor;
  const notePool  = noteEditLane === 'bass' ? mode.b : mode.s;

  return (
    <div className="view-root">
      {/* ── Left: grid editor ────────────────────────────────────────────── */}
      <div className="grid-area">
        {/* Topbar */}
        <div className="grid-topbar">
          <span className="grid-topbar__info">{genre.toUpperCase()} · {modeName.toUpperCase()} · {currentSectionName.toUpperCase()}</span>
          <div className="grid-topbar__spacer" />
          <button className="grid-nav__btn" onClick={undo} disabled={undoLen===0}
            style={{ width:'auto', padding:'0 8px', opacity: undoLen>0?1:0.3 }}>
            ↩ ({undoLen})
          </button>
          <nav className="grid-nav">
            <button className="grid-nav__btn" onClick={() => setPage(p => Math.max(0,p-1))} disabled={page===0}>‹</button>
            <span className="grid-nav__page">pg {page+1}/4</span>
            <button className="grid-nav__btn" onClick={() => setPage(p => Math.min(3,p+1))} disabled={page===3}>›</button>
          </nav>
        </div>

        {/* Lane rows */}
        {['kick','snare','hat','bass','synth'].map(lane => {
          const lc = LANE_CLR[lane];
          const ll = laneLen[lane] || 16;
          const vu = laneVU[lane]  || 0;
          return (
            <div key={lane} className="lane-row">
              <div className="lane-label" style={{ '--lane-color': lc }}>
                <span className="lane-label__name">{lane}</span>
                <div className="lane-vu">
                  <div className="lane-vu__fill" style={{ width:`${vu*100}%` }} />
                </div>
              </div>
              <div className="step-grid" style={{ gridTemplateColumns:`repeat(${cols},1fr)`, '--lane-color':lc }}>
                {visIdx.map(idx => {
                  if (idx >= ll) return <div key={idx} className="step-cell inactive" />;
                  const sd     = patterns[lane][idx];
                  const on     = sd.on;
                  const active = step === idx;
                  const isBeat = idx % 4  === 0;
                  const isBar  = idx % 16 === 0;
                  let cls = 'step-cell';
                  if (isBar)    cls += ' bar';
                  else if (isBeat) cls += ' beat';
                  if (on)     cls += ' on';
                  if (active) cls += ' playing';
                  return <button key={idx} className={cls} onClick={() => toggleCell(lane, idx)} />;
                })}
              </div>
            </div>
          );
        })}

        {/* Note editor */}
        <div style={{ borderTop:'1px solid var(--c-border)', paddingTop:6, flexShrink:0 }}>
          <div style={{ display:'flex', gap:5, marginBottom:4, alignItems:'center' }}>
            <span style={{ fontSize:9, letterSpacing:'0.14em', color:'var(--c-text-dim)', textTransform:'uppercase' }}>NOTES</span>
            {['bass','synth'].map(l => (
              <button key={l} onClick={() => setNoteEditLane(l)}
                style={{
                  padding:'2px 7px', borderRadius:3, fontSize:9, fontFamily:'var(--font-mono)',
                  border:`1px solid ${noteEditLane===l ? LANE_CLR[l] : 'var(--c-border-md)'}`,
                  background: noteEditLane===l ? `${LANE_CLR[l]}18` : 'transparent',
                  color: noteEditLane===l ? LANE_CLR[l] : 'var(--c-text-dim)',
                  cursor:'pointer', textTransform:'uppercase',
                }}>
                {l}
              </button>
            ))}
          </div>
          <div className="note-row" style={{ gridTemplateColumns:`repeat(${cols},1fr)`, '--lane-color': LANE_CLR[noteEditLane] }}>
            {visIdx.map(idx => {
              const isOn   = noteEditLane === 'bass' ? patterns.bass[idx]?.on : patterns.synth[idx]?.on;
              const curNote = noteEditLane === 'bass' ? bassLine[idx] : synthLine[idx];
              const cur    = notePool.indexOf(curNote);
              return (
                <button key={idx}
                  className={`note-cell${isOn ? ' active-step' : ''}`}
                  disabled={!isOn}
                  onClick={() => {
                    if (!isOn) return;
                    setNote(noteEditLane, idx, notePool[(cur + 1) % notePool.length]);
                  }}>
                  {curNote || '—'}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Right panel ──────────────────────────────────────────────────── */}
      <div className="studio-right">
        {/* Preset bar */}
        <div className="preset-bar">
          {[
            { label:'BASS', value:bassPreset, opts:SOUND_PRESETS.bass, onChange:applyBassPreset, c:'#22d3ee' },
            { label:'SYNTH', value:synthPreset, opts:SOUND_PRESETS.synth, onChange:applySynthPreset, c:gc },
            { label:'DRUM', value:drumPreset, opts:SOUND_PRESETS.drum, onChange:applyDrumPreset, c:'#ffb347' },
            { label:'PERF', value:performancePreset, opts:SOUND_PRESETS.performance, onChange:applyPerformancePreset, c:'#7ee787' },
          ].map(({ label, value, opts, onChange, c }) => (
            <div key={label} className="preset-group">
              <span className="preset-group__label">{label}</span>
              <select value={value} onChange={e => onChange(e.target.value)} style={{ '--preset-color':c }}>
                {Object.entries(opts).map(([k, p]) => (
                  <option key={k} value={k} style={{ color:'#111', background:'#f2f2f2' }}>{p.label}</option>
                ))}
              </select>
            </div>
          ))}
          <div style={{ display:'flex', gap:4, alignItems:'flex-end' }}>
            <button className={`toggle-pill${polySynth?' on':''}`}
              style={{ '--pill-color': gc }} onClick={() => setPolySynth(v => !v)}>
              POLY
            </button>
            <button className={`toggle-pill${bassStack?' on':''}`}
              style={{ '--pill-color': '#22d3ee' }} onClick={() => setBassStack(v => !v)}>
              STACK
            </button>
            <button className="toggle-pill" style={{ '--pill-color':'#ff8a8a', borderColor:'rgba(255,80,80,0.3)', color:'#ff8a8a', background:'rgba(255,80,80,0.06)' }}
              onClick={clearPattern}>
              CLEAR
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-bar">
          {['mixer','synth','session'].map(t => (
            <button key={t} className={`tab-bar__btn${tab===t?' active':''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {/* Tab content */}
        <div className="tab-content">
          {tab === 'mixer' && (
            <>
              {[
                { label:'MASTER',       v:master,     s:setMaster,     c:'#ffffff' },
                { label:'SPACE',        v:space,      s:setSpace,      c:'#44ffcc' },
                { label:'TONE',         v:tone,       s:setTone,       c:'#22d3ee' },
                { label:'NOISE',        v:noiseMix,   s:setNoiseMix,   c:'#aaaaaa' },
                { label:'DRIVE',        v:drive,      s:setDrive,      c:'#ff8844' },
                { label:'COMPRESS',     v:compress,   s:setCompress,   c:'#ffaa44' },
                { label:'BASS FILTER',  v:bassFilter, s:setBassFilter, c:LANE_CLR.bass },
                { label:'SYNTH FILTER', v:synthFilter, s:setSynthFilter, c:LANE_CLR.synth },
                { label:'DRUM DECAY',   v:drumDecay,  s:setDrumDecay,  c:LANE_CLR.kick },
                { label:'BASS SUB',     v:bassSubAmt, s:setBassSubAmt, c:LANE_CLR.bass },
                { label:'SWING',        v:swing,      s:setSwing,      c:'#aa88ff', min:0, max:0.25 },
                { label:'HUMANIZE',     v:humanize,   s:setHumanize,   c:'#88aaff', min:0, max:0.05 },
                { label:'GROOVE AMT',   v:grooveAmt,  s:setGrooveAmt,  c:'#ffdd00' },
                { label:'FM INDEX',     v:fmIdx,      s:setFmIdx,      c:'#cc88ff', min:0, max:3 },
              ].map(p => <MacroSlider key={p.label} {...p} />)}

              <div>
                <span className="sidebar__label" style={{ marginBottom:5, display:'block' }}>Groove Profile</span>
                <div className="groove-grid">
                  {['steady','broken','bunker','float'].map(gp => (
                    <button key={gp} className={`groove-btn${grooveProfile===gp?' active':''}`}
                      onClick={() => setGrooveProfile(gp)}>{gp}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'synth' && (
            <>
              <span className="sidebar__label">Section Generator</span>
              <div className="sec-gen-grid">
                {Object.keys(SECTIONS).map(sec => (
                  <button key={sec} className={`sec-gen-btn${currentSectionName===sec?' active':''}`}
                    onClick={() => regenerateSection(sec)}>{sec}</button>
                ))}
              </div>
              <p style={{ fontSize:9, color:'var(--c-text-mute)', lineHeight:1.6, marginTop:4 }}>
                Click to regenerate with that section's feel.
              </p>
            </>
          )}

          {tab === 'session' && (
            <>
              <button className={`rec-btn${recState==='recording'?' recording':''}`}
                onClick={recState === 'idle' ? startRec : stopRec}>
                {recState === 'recording' ? '■ STOP REC' : '● REC'}
              </button>

              {recordings.map((r, i) => (
                <div key={i} className="recording-item">
                  <audio src={r.url} controls />
                  <a href={r.url} download={r.name}>DL</a>
                </div>
              ))}

              <div className="divider" />
              <span className="sidebar__label">Scenes (6)</span>
              <div className="scene-grid">
                {savedScenes.map((sc, i) => (
                  <div key={i} className="scene-cell">
                    <button className={`scene-btn${sc?' filled':''}`} onClick={() => loadScene(i)}>
                      S{i+1}{sc?'◆':''}
                    </button>
                    <button className="scene-save" onClick={() => saveScene(i)}>SAVE</button>
                  </div>
                ))}
              </div>

              <div className="divider" />
              <button className="io-btn export" onClick={exportJSON}>EXPORT JSON</button>
              <button className="io-btn" onClick={() => importRef.current?.click()}>IMPORT JSON</button>
              <input ref={importRef} type="file" accept=".json" onChange={importJSON} style={{ display:'none' }} />

              <div className="divider" />
              <div className="shortcuts-text">
                SHORTCUTS<br/>
                SPACE = play/stop<br/>
                A=drop S=break D=build<br/>
                F=groove G=tension H=fill<br/>
                Z=undo
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
