import React from 'react';
import { GENRES } from '../music/core';

const SECTION_COLORS = {
  drop:'#ff2244', break:'#4488ff', build:'#ffaa00', groove:'#00cc66',
  tension:'#ff6622', fill:'#cc00ff', intro:'#44ffcc', outro:'#888899',
};

export default function SongView({
  genre, gc, songArc, arcIdx, songActive,
  startSongArc, stopSongArc, currentSectionName,
  SECTIONS, triggerSection, modeName, arpeMode, bpm, sectionColors,
}) {
  const gd       = GENRES[genre] || GENRES.techno;
  const allColors = sectionColors || SECTION_COLORS;

  return (
    <div className="song-view">
      {/* ── Left column ────────────────────────────────────────────────── */}
      <div style={{ display:'flex', flexDirection:'column', gap:8, width:250, flexShrink:0 }}>
        {/* Genre card */}
        <div className="song-genre-card" style={{ borderColor: `${gc}22` }}>
          <div className="song-genre-card__name" style={{ color: gc }}>{genre}</div>
          <div className="song-genre-card__desc">{gd.description}</div>
          <div className="song-genre-card__grid">
            {[
              { l:'BPM RANGE', v:`${gd.bpm[0]}–${gd.bpm[1]}` },
              { l:'CURRENT',   v:`${bpm} bpm` },
              { l:'MODE',      v:modeName },
              { l:'ARP',       v:arpeMode },
              { l:'DENSITY',   v:`${Math.round(gd.density*100)}%` },
              { l:'CHAOS',     v:`${Math.round(gd.chaos*100)}%` },
              { l:'NOISE',     v:gd.noiseColor },
              { l:'BASS',      v:gd.bassMode },
            ].map(({ l, v }) => (
              <div key={l}>
                <div className="song-meta-item__label">{l}</div>
                <div className="song-meta-item__val">{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Arc control */}
        <button className={`arc-btn${songActive?' active':''}`}
          onClick={songActive ? stopSongArc : startSongArc}>
          {songActive ? '■ STOP ARC' : '▶ START ARC'}
        </button>

        {/* Arc progress */}
        {songActive && (
          <div className="arc-progress">
            <div className="arc-progress__label">Arc Progress</div>
            <div className="arc-progress__pips">
              {songArc.map((s, i) => {
                const color = allColors[s] || '#fff';
                return (
                  <div key={i}
                    className={`arc-pip-badge${i===arcIdx?' current':i<arcIdx?' past':''}`}
                    style={{ '--sect-color': color }}>
                    {s}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Right column: section library ───────────────────────────────── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8, minWidth:0 }}>
        <div className="section-library__title">Section Library — Click to Trigger</div>

        <div className="section-library__grid">
          {Object.entries(SECTIONS).map(([name, data]) => {
            const color  = allColors[name] || '#fff';
            const active = currentSectionName === name;
            return (
              <button key={name}
                className={`section-card${active?' active':''}`}
                style={{ '--sect-color': color }}
                onClick={() => triggerSection(name)}>
                <div className="section-card__name">{name}</div>
                <div className="section-card__stats">
                  {`k:${Math.round(data.kM*100)}% h:${Math.round(data.hM*100)}%`}<br/>
                  {`b:${Math.round(data.bM*100)}% sy:${Math.round(data.syM*100)}%`}<br/>
                  {`len:${data.lb}x vel:${data.vel}`}<br/>
                  {`${data.bars} bars`}
                </div>
              </button>
            );
          })}
        </div>

        {/* Session info */}
        <div className="session-info">
          <div className="session-info__label">Current Session</div>
          <div className="session-info__grid">
            {[
              { l:'GENRE',   v:genre },
              { l:'SECTION', v:currentSectionName },
              { l:'MODE',    v:modeName },
              { l:'ARP',     v:arpeMode },
              { l:'STATUS',  v:songActive ? `arc[${arcIdx+1}/${songArc.length}]` : 'manual' },
            ].map(({ l, v }) => (
              <div key={l}>
                <div className="session-info-item__label">{l}</div>
                <div className="session-info-item__val" style={{ color: gc }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
