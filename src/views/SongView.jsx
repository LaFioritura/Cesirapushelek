import React from 'react';
import { GENRES } from '../music/core';

export default function SongView({
  genre,
  gc,
  songArc,
  arcIdx,
  songActive,
  startSongArc,
  stopSongArc,
  currentSectionName,
  SONG_ARCS,
  SECTIONS,
  triggerSection,
  modeName,
  arpeMode,
  bpm,
  compact,
  phone,
}) {
  void SONG_ARCS;

  const SECTION_COLORS = {
    drop: '#ff2244',
    break: '#4488ff',
    build: '#ffaa00',
    groove: '#00cc66',
    tension: '#ff6622',
    fill: '#cc00ff',
    intro: '#44ffcc',
    outro: '#aaaaaa',
  };

  const gd = GENRES[genre];

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: compact ? 'column' : 'row',
        gap: 8,
        padding: phone ? '8px' : '6px 12px 12px 12px',
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* LEFT — Genre info + arc control */}
      <div
        style={{
          width: compact ? '100%' : 260,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          flexShrink: 0,
        }}
      >
        {/* Genre card */}
        <div
          style={{
            padding: 16,
            borderRadius: 8,
            border: `1px solid ${gc}33`,
            background: `${gc}08`,
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: gc,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            {genre}
          </div>

          <div
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.96)',
              letterSpacing: '0.08em',
              marginBottom: 8,
            }}
          >
            {gd.description}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {[
              { l: 'BPM', v: `${gd.bpm[0]}–${gd.bpm[1]}` },
              { l: 'CURRENT', v: bpm },
              { l: 'MODE', v: modeName },
              { l: 'ARP', v: arpeMode },
              { l: 'DENSITY', v: `${Math.round(gd.density * 100)}%` },
              { l: 'CHAOS', v: `${Math.round(gd.chaos * 100)}%` },
              { l: 'NOISE', v: gd.noiseColor },
              { l: 'BASS', v: gd.bassMode },
            ].map(({ l, v }) => (
              <div key={l}>
                <div
                  style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.96)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  {l}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.96)',
                    fontFamily: 'Space Mono,monospace',
                  }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Arc control */}
        <button
          onClick={songActive ? stopSongArc : startSongArc}
          style={{
            padding: '12px',
            borderRadius: 6,
            border: `1px solid ${songActive ? '#ff2244' : gc}`,
            background: songActive ? 'rgba(255,34,68,0.12)' : `${gc}18`,
            color: songActive ? '#ff2244' : gc,
            fontSize: 10,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'Space Mono,monospace',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            boxShadow: songActive
              ? '0 0 16px rgba(255,34,68,0.3)'
              : `0 0 16px ${gc}33`,
          }}
        >
          {songActive ? '■ STOP ARC' : '▶ START ARC'}
        </button>

        {songActive && (
          <div
            style={{
              padding: 10,
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.96)',
                letterSpacing: '0.12em',
                marginBottom: 6,
                textTransform: 'uppercase',
              }}
            >
              ARC PROGRESS
            </div>

            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {songArc.map((s, i) => {
                const sc = SECTION_COLORS[s] || '#ffffff';
                return (
                  <div
                    key={i}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 3,
                      background:
                        i === arcIdx
                          ? `${sc}33`
                          : i < arcIdx
                            ? `${sc}11`
                            : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${
                        i === arcIdx
                          ? sc
                          : i < arcIdx
                            ? `${sc}44`
                            : 'rgba(255,255,255,0.06)'
                      }`,
                      color:
                        i === arcIdx
                          ? sc
                          : i < arcIdx
                            ? `${sc}88`
                            : 'rgba(255,255,255,0.95)',
                      fontSize: 10,
                      fontFamily: 'Space Mono,monospace',
                      fontWeight: 700,
                      transition: 'all 0.2s',
                    }}
                  >
                    {s}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT — Section library + direct trigger */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div
          style={{
            fontSize: 10,
            color: 'rgba(255,255,255,0.96)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          SECTION LIBRARY — CLICK TO TRIGGER
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: phone ? 'repeat(2,1fr)' : 'repeat(4,1fr)',
            gap: 6,
          }}
        >
          {Object.entries(SECTIONS).map(([name, data]) => {
            const sc = SECTION_COLORS[name] || '#ffffff';
            const isActive = currentSectionName === name;

            return (
              <button
                key={name}
                onClick={() => triggerSection(name)}
                style={{
                  padding: '18px 12px',
                  borderRadius: 6,
                  border: `1px solid ${isActive ? sc : `${sc}33`}`,
                  background: isActive ? `${sc}18` : `${sc}06`,
                  color: isActive ? sc : `${sc}88`,
                  cursor: 'pointer',
                  fontFamily: 'Space Mono,monospace',
                  textAlign: 'left',
                  transition: 'all 0.1s',
                  boxShadow: isActive ? `0 0 16px ${sc}44` : 'none',
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}
                >
                  {name}
                </div>

                <div style={{ fontSize: 10, opacity: 0.7, lineHeight: 1.6 }}>
                  {`k:${Math.round(data.kM * 100)}% h:${Math.round(data.hM * 100)}%`}
                  <br />
                  {`b:${Math.round(data.bM * 100)}% sy:${Math.round(data.syM * 100)}%`}
                  <br />
                  {`len:${data.lb}x vel:${data.vel}`}
                  <br />
                  {`${data.bars} bars`}
                </div>
              </button>
            );
          })}
        </div>

        {/* Current section info */}
        <div
          style={{
            padding: 12,
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.02)',
            marginTop: 4,
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.96)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            CURRENT SESSION
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: phone ? 'repeat(2,1fr)' : 'repeat(5,1fr)',
              gap: 8,
            }}
          >
            {[
              { l: 'GENRE', v: genre },
              { l: 'SECTION', v: currentSectionName },
              { l: 'MODE', v: modeName },
              { l: 'ARP', v: arpeMode },
              { l: 'STATUS', v: songActive ? `arc[${arcIdx + 1}/${songArc.length}]` : 'manual' },
            ].map(({ l, v }) => (
              <div key={l}>
                <div
                  style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.96)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginBottom: 2,
                  }}
                >
                  {l}
                </div>

                <div
                  style={{
                    fontSize: 10,
                    color: gc,
                    fontFamily: 'Space Mono,monospace',
                    fontWeight: 700,
                  }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}