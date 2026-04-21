import React from 'react';
import { MAX_STEPS } from '../music/core';

const LANE_CLR  = { kick:'#ff4444', snare:'#ffaa00', hat:'#ffdd00', bass:'#00ccff', synth:'#cc88ff' };
const SECTS     = ['drop','break','build','groove','tension','fill','intro','outro'];
const SHORTCUT  = { drop:'A', break:'S', build:'D', groove:'F', tension:'G', fill:'H' };

function MacroSlider({ label, v, s, c, min = 0, max = 1 }) {
  const pct = (((v - min) / (max - min)) * 100).toFixed(0);
  return (
    <div className="macro-slider" style={{ '--macro-color': c }}>
      <div className="macro-slider__head">
        <span className="macro-slider__label">{label}</span>
        <span className="macro-slider__val">{pct}</span>
      </div>
      <input type="range" min={min} max={max} step={0.01} value={v}
        onChange={e => s(Number(e.target.value))} style={{ color: c }} />
    </div>
  );
}

export default function PerformView({
  // Grid
  patterns, bassLine, synthLine, laneLen, step, page, setPage,
  toggleCell, modeName, laneVU, activeNotes, isPlaying,
  // Section
  genre, currentSectionName, sectionColor, sectionColors,
  songArc, arcIdx, arpeMode, perfActions, regenerateSection,
  // Scenes
  savedScenes, saveScene, loadScene,
  // Macros
  master, setMaster, space, setSpace, tone, setTone,
  drive, setDrive, grooveAmt, setGrooveAmt, swing, setSwing,
}) {
  const sc       = sectionColor || '#fff';
  const visStart = page * 16;
  const visEnd   = Math.min(visStart + 16, MAX_STEPS);
  const visIdx   = Array.from({ length: visEnd - visStart }, (_, i) => visStart + i);
  const cols     = visIdx.length;

  return (
    <div className="view-root">
      {/* ── Left sidebar ─────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar__section">
          <span className="sidebar__label">Sections</span>
          {SECTS.map(sec => {
            const color  = sectionColors?.[sec] || '#fff';
            const active = currentSectionName === sec;
            return (
              <button key={sec}
                className={`sect-pad${active ? ' active' : ''}`}
                style={{ '--sect-color': color }}
                onClick={() => perfActions[sec]?.()}>
                <span>{sec}</span>
                {SHORTCUT[sec] && <span className="sect-pad__key">[{SHORTCUT[sec]}]</span>}
              </button>
            );
          })}
        </div>

        <div className="sidebar__section">
          <span className="sidebar__label">Actions</span>
          {[
            { label: 'MUTATE',    fn: perfActions.mutate,         key: 'M' },
            { label: 'THIN OUT',  fn: perfActions.thinOut },
            { label: 'THICKEN',   fn: perfActions.thicken },
            { label: 'REHARM',    fn: perfActions.reharmonize },
            { label: 'ARP →',     fn: perfActions.shiftArp },
            { label: 'REGEN',     fn: perfActions.regen,          key: 'R' },
            { label: 'RND SYNTH', fn: perfActions.randomizeNotes },
            { label: 'RND BASS',  fn: perfActions.randomizeBass },
            { label: 'NOTES ↑',   fn: perfActions.shiftNotesUp },
            { label: 'NOTES ↓',   fn: perfActions.shiftNotesDown },
            { label: 'CLEAR',     fn: perfActions.clear },
          ].map(({ label, fn, key }) => (
            <button key={label} className="action-btn" onClick={fn}>
              <span>{label}</span>
              {key && <span className="action-btn__key">[{key}]</span>}
            </button>
          ))}
        </div>
      </aside>

      {/* ── Center: grid ─────────────────────────────────────────────────── */}
      <div className="grid-area">
        <div className="grid-topbar">
          <div style={{ color: sc, textShadow:`0 0 18px ${sc}44`, fontSize:13, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase' }}>
            {currentSectionName}
          </div>
          <div className="sect-indicator__divider" />
          <span className="grid-topbar__info">{genre} · {modeName} · arp:{arpeMode}</span>

          {songArc.length > 0 && (
            <div className="arc-track">
              {songArc.map((s, i) => {
                const segColor = sectionColors?.[s] || '#fff';
                return (
                  <div key={i}
                    className={`arc-pip${i===arcIdx?' current':i<arcIdx?' done':''}`}
                    style={{ width: i===arcIdx?20:10, background: i===arcIdx ? segColor : i<arcIdx ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)' }}
                  />
                );
              })}
            </div>
          )}

          <div className="grid-topbar__spacer" />
          <nav className="grid-nav">
            <button className="grid-nav__btn" onClick={() => setPage(p => Math.max(0,p-1))} disabled={page===0}>‹</button>
            <span className="grid-nav__page">{page+1}/4</span>
            <button className="grid-nav__btn" onClick={() => setPage(p => Math.min(3,p+1))} disabled={page===3}>›</button>
          </nav>
        </div>

        {['kick','snare','hat','bass','synth'].map(lane => {
          const lc      = LANE_CLR[lane];
          const ll      = laneLen[lane] || 16;
          const vu      = laneVU[lane]  || 0;
          const hasNote = lane === 'bass' || lane === 'synth';
          return (
            <div key={lane} className="lane-row">
              <div className="lane-label" style={{ '--lane-color': lc }}>
                <span className="lane-label__name">{lane}</span>
                <div className="lane-vu">
                  <div className="lane-vu__fill" style={{ width:`${vu*100}%` }} />
                </div>
                {hasNote && <div className="lane-note">{activeNotes[lane]}</div>}
              </div>
              <div className="step-grid" style={{ gridTemplateColumns:`repeat(${cols},1fr)`, '--lane-color':lc }}>
                {visIdx.map(idx => {
                  if (idx >= ll) return <div key={idx} className="step-cell inactive" />;
                  const sd      = patterns[lane][idx];
                  const isBeat  = idx % 4  === 0;
                  const isBar   = idx % 16 === 0;
                  let cls = 'step-cell';
                  if (isBar)         cls += ' bar';
                  else if (isBeat)   cls += ' beat';
                  if (sd.on)         cls += ' on';
                  if (sd.tied)       cls += ' tied';
                  if (step===idx && isPlaying) cls += ' playing';
                  return <button key={idx} className={cls} onClick={() => toggleCell(lane, idx)} />;
                })}
              </div>
            </div>
          );
        })}

        {/* Note hint row */}
        <div className="note-labels-row" style={{ gridTemplateColumns:`repeat(${cols},1fr)`, marginLeft:46 }}>
          {visIdx.map(idx => {
            const note = patterns.bass[idx]?.on ? bassLine[idx]
                       : patterns.synth[idx]?.on ? synthLine[idx]
                       : null;
            return (
              <div key={idx} className="note-labels-row__cell">
                {note ? note.replace(/[0-9]/g,'') : ''}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right sidebar ────────────────────────────────────────────────── */}
      <aside className="sidebar sidebar--right">
        <div className="sidebar__section">
          <span className="sidebar__label">Macros</span>
          {[
            { label:'MASTER', v:master,   s:setMaster,   c:'#ffffff' },
            { label:'SPACE',  v:space,    s:setSpace,    c:'#44ffcc' },
            { label:'TONE',   v:tone,     s:setTone,     c:'#22d3ee' },
            { label:'DRIVE',  v:drive,    s:setDrive,    c:'#ff8844' },
            { label:'GROOVE', v:grooveAmt, s:setGrooveAmt, c:'#ffdd00' },
            { label:'SWING',  v:swing,    s:setSwing,    c:'#aa88ff', min:0, max:0.25 },
          ].map(p => <MacroSlider key={p.label} {...p} />)}
        </div>

        <div className="sidebar__section" style={{ flex:1 }}>
          <span className="sidebar__label">Scenes</span>
          <div className="scene-grid">
            {savedScenes.map((scene, i) => (
              <div key={i} className="scene-cell">
                <button className={`scene-btn${scene?' filled':''}`} onClick={() => loadScene(i)}>
                  S{i+1}{scene?'◆':''}
                </button>
                <button className="scene-save" onClick={() => saveScene(i)}>SAVE</button>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
