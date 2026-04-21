import React from 'react';
import { LANE_CLR } from '../music/presets';
export default function PerformView({genre,gc,isPlaying,currentSectionName,laneVU,patterns,bassLine,synthLine,laneLen,step,page,setPage,activeNotes,arpeMode,modeName,autopilot,autopilotIntensity,setAutopilotIntensity,perfActions,regenerateSection,savedScenes,saveScene,loadScene,master,setMaster,space,setSpace,tone,setTone,drive,setDrive,grooveAmt,setGrooveAmt,swing,setSwing,toggleCell,songArc,arcIdx,songActive,setNote,bassPreset,synthPreset,drumPreset,performancePreset,applyBassPreset,applySynthPreset,applyDrumPreset,applyPerformancePreset,compact,phone}){
  const SECTION_COLORS={drop:'#ff2244',break:'#4488ff',build:'#ffaa00',groove:'#00cc66',tension:'#ff6622',fill:'#cc00ff',intro:'#44ffcc',outro:'#aaaaaa'};
  const sc=SECTION_COLORS[currentSectionName]||gc;
  const visibleStart=page*16,visibleEnd=Math.min(visibleStart+16,MAX_STEPS);
  const visIdx=Array.from({length:visibleEnd-visibleStart},(_,i)=>visibleStart+i);
  const SECTS=['drop','break','build','groove','tension','fill','intro','outro'];
  const shortcut={drop:'A',break:'S',build:'D',groove:'F',tension:'G',fill:'H'};

  return(
    <div style={{flex:1,display:'flex',flexDirection:compact?'column':'row',gap:6,padding:phone?'8px':'5px 7px 8px 7px',minHeight:0,overflowY:'auto',overflowX:'hidden'}}>

      {/* LEFT — Section triggers + autopilot */}
      <div style={{width:compact?'100%':118,display:'flex',flexDirection:'column',gap:3,flexShrink:0}}>
        {/* Section pads */}
        <div style={{fontSize:10,color:'rgba(255,255,255,0.96)',letterSpacing:'0.18em',marginBottom:1,textTransform:'uppercase'}}>SECTIONS</div>
        {SECTS.map(sec=>{
          const scl=SECTION_COLORS[sec]||'#ffffff';
          const isActive=currentSectionName===sec;
          return(
            <button key={sec} onClick={()=>perfActions[sec]?perfActions[sec]():null} style={{
              padding:'6px 6px',borderRadius:4,border:`1px solid ${isActive?scl:scl+'33'}`,
              background:isActive?`${scl}22`:`${scl}08`,
              color:isActive?scl:`${scl}88`,
              fontSize:10,fontWeight:700,cursor:'pointer',
              fontFamily:'Space Mono,monospace',letterSpacing:'0.1em',
              textTransform:'uppercase',transition:'all 0.08s',
              boxShadow:isActive?`0 0 8px ${scl}44`:'none',
              display:'flex',justifyContent:'space-between',alignItems:'center',
            }}>
              <span>{sec}</span>
              {shortcut[sec]&&<span style={{fontSize:10,opacity:0.4}}>[{shortcut[sec]}]</span>}
            </button>
          );
        })}

        {/* Actions */}
        <div style={{fontSize:10,color:'rgba(255,255,255,0.96)',letterSpacing:'0.18em',marginTop:3,textTransform:'uppercase'}}>ACTIONS</div>
        {[
          {label:'MUTATE',fn:perfActions.mutate,key:'M',tip:'flip drum hits'},
          {label:'THIN',fn:perfActions.thinOut,tip:'sparse out'},
          {label:'THICKEN',fn:perfActions.thicken,tip:'add hits'},
          {label:'REHARM',fn:perfActions.reharmonize,tip:'new chords'},
          {label:'ARP→',fn:perfActions.shiftArp,tip:'change pattern'},
          {label:'REGEN',fn:()=>regenerateSection(currentSectionName),key:'R',tip:'full rebuild'},
          {label:'RND SYNTH',fn:perfActions.randomizeNotes,tip:'random notes'},
          {label:'RND BASS',fn:perfActions.randomizeBass,tip:'random bass'},
          {label:'NOTES ↑',fn:perfActions.shiftNotesUp,tip:'shift up'},
          {label:'NOTES ↓',fn:perfActions.shiftNotesDown,tip:'shift down'},
          {label:'CLEAR',fn:perfActions.clear,tip:'clear all lanes'},
        ].map(({label,fn,key,tip})=>(
          <button key={label} onClick={fn} title={tip} style={{
            padding:'4px 6px',borderRadius:3,border:'1px solid rgba(255,255,255,0.08)',
            background:'rgba(255,255,255,0.02)',color:'rgba(255,255,255,0.96)',
            fontSize:10,fontWeight:700,cursor:'pointer',fontFamily:'Space Mono,monospace',
            letterSpacing:'0.06em',display:'flex',justifyContent:'space-between',alignItems:'center',
          }}>
            <span>{label}</span>
            {key&&<span style={{fontSize:10,opacity:0.35}}>[{key}]</span>}
          </button>
        ))}
      </div>

      {/* CENTER — Grid + VU */}
      <div style={{flex:1,display:'flex',flexDirection:'column',gap:4,minWidth:0,order:compact?1:2}}>

        {/* Section indicator + info bar */}
        <div style={{display:'flex',alignItems:'center',flexWrap:'wrap',gap:8,minHeight:22,flexShrink:0}}>
          <div style={{fontSize:13,fontWeight:700,color:sc,letterSpacing:'0.16em',textTransform:'uppercase',textShadow:`0 0 16px ${sc}55`}}>
            {currentSectionName.toUpperCase()}
          </div>
          <div style={{width:1,height:12,background:'rgba(255,255,255,0.08)'}}/>
          <span style={{fontSize:10,color:'rgba(255,255,255,0.96)',letterSpacing:'0.08em'}}>{genre} · {modeName} · arp:{arpeMode}</span>
          <div style={{flex:1}}/>
          {songArc.length>0&&(
            <div style={{display:'flex',gap:2,alignItems:'center'}}>
              {songArc.map((s,i)=>(
                <div key={i} style={{width:i===arcIdx?22:14,height:4,borderRadius:2,background:i===arcIdx?SECTION_COLORS[s]||gc:i<arcIdx?'rgba(255,255,255,0.92)':'rgba(255,255,255,0.05)',transition:'all 0.2s'}}/>
              ))}
            </div>
          )}
          <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} style={{...navBtn,opacity:page===0?0.3:1,padding:'1px 5px',fontSize:10}}>‹</button>
          <span style={{fontSize:10,color:'rgba(255,255,255,0.96)',fontFamily:'Space Mono,monospace'}}>{page+1}/4</span>
          <button onClick={()=>setPage(p=>Math.min(3,p+1))} disabled={page===3} style={{...navBtn,opacity:page===3?0.3:1,padding:'1px 5px',fontSize:10}}>›</button>
        </div>

        {/* Lane rows with VU + grid */}
        {['kick','snare','hat','bass','synth'].map(lane=>{
          const lc=LANE_CLR[lane];
          const ll=laneLen[lane]||16;
          const vu=laneVU[lane]||0;
          return(
            <div key={lane} style={{flex:1,display:'flex',alignItems:'stretch',gap:5,minHeight:0}}>
              {/* Lane label + VU */}
              <div style={{width:38,flexShrink:0,display:'flex',flexDirection:'column',justifyContent:'center',gap:1}}>
                <span style={{fontSize:10,fontWeight:700,color:lc,letterSpacing:'0.14em',textTransform:'uppercase'}}>{lane}</span>
                <div style={{height:3,borderRadius:2,background:'rgba(255,255,255,0.05)',overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${vu*100}%`,background:lc,borderRadius:2,transition:'width 0.04s',boxShadow:`0 0 4px ${lc}`}}/>
                </div>
                {(lane==='bass'||lane==='synth')&&(
                  <span style={{fontSize:9.5,color:'rgba(255,255,255,0.96)',letterSpacing:'0.04em'}}>{activeNotes[lane]}</span>
                )}
              </div>
              {/* Step grid */}
              <div style={{flex:1,display:'grid',gridTemplateColumns:`repeat(${visIdx.length},1fr)`,gap:1.5,alignItems:'stretch'}}>
                {visIdx.map(idx=>{
                  if(idx>=ll)return<div key={idx} style={{borderRadius:2,background:'rgba(255,255,255,0.015)',opacity:0.25}}/>;
                  const sd=patterns[lane][idx];
                  const on=sd.on,isActive=step===idx&&isPlaying;
                  const isTied=sd.tied;
                  const isBeat=idx%4===0,isBar=idx%16===0;
                  return(
                    <button key={idx} onClick={()=>toggleCell(lane,idx)} style={{
                      borderRadius:isTied?'1px 2px 2px 1px':'2px',
                      borderTop:`1px solid ${isActive?lc:isBar?`${lc}44`:isBeat?'rgba(255,255,255,0.07)':'rgba(255,255,255,0.03)'}`,
                      borderRight:`1px solid ${isActive?lc:isBar?`${lc}44`:isBeat?'rgba(255,255,255,0.07)':'rgba(255,255,255,0.03)'}`,
                      borderBottom:`1px solid ${isActive?lc:isBar?`${lc}44`:isBeat?'rgba(255,255,255,0.07)':'rgba(255,255,255,0.03)'}`,
                      borderLeft:isTied?`2px solid ${lc}44`:`1px solid ${isActive?lc:isBar?`${lc}44`:isBeat?'rgba(255,255,255,0.07)':'rgba(255,255,255,0.03)'}`,
                      background:isActive?`${lc}88`:isTied?`${lc}1a`:on?`${lc}${Math.round(clamp((sd.p||1),0.3,1)*255).toString(16).padStart(2,'0')}`:'rgba(255,255,255,0.02)',
                      boxShadow:isActive?`0 0 7px ${lc}77`:on&&!isTied?`0 0 2px ${lc}22`:'none',
                      cursor:'pointer',transition:'background 0.03s',
                    }}/>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Note info row */}
        <div style={{display:'flex',gap:1.5,flexShrink:0,height:12}}>
          {visIdx.map(idx=>{
            const bn=bassLine[idx],sn=synthLine[idx];
            const hasBass=patterns.bass[idx]?.on;
            const hasSynth=patterns.synth[idx]?.on;
            return(
              <div key={idx} style={{flex:1,textAlign:'center'}}>
                {(hasBass||hasSynth)&&<span style={{fontSize:6,color:'rgba(255,255,255,0.96)',fontFamily:'Space Mono,monospace'}}>{hasBass?bn.replace(/[0-9]/g,''):sn.replace(/[0-9]/g,'')}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT — Macro knobs + scenes */}
      <div style={{width:compact?'100%':118,display:'flex',flexDirection:'column',gap:4,flexShrink:0,order:compact?3:3}}>
        {/* Main macro faders */}
        <div style={{fontSize:10,color:'rgba(255,255,255,0.96)',letterSpacing:'0.18em',textTransform:'uppercase',marginBottom:1}}>MACROS</div>
        {[
          {label:'MASTER',v:master,s:setMaster,c:'#ffffff'},
          {label:'SPACE',v:space,s:setSpace,c:'#44ffcc'},
          {label:'TONE',v:tone,s:setTone,c:'#22d3ee'},
          {label:'DRIVE',v:drive,s:setDrive,c:'#ff8844'},
          {label:'GROOVE',v:grooveAmt,s:setGrooveAmt,c:'#ffdd00'},
          {label:'SWING',v:swing,s:setSwing,min:0,max:0.25,c:'#aa88ff'},
          {label:'AUTO INT',v:autopilotIntensity,s:setAutopilotIntensity,c:gc},
        ].map(({label,v,s,c,min=0,max=1})=>(
          <div key={label} style={{display:'flex',flexDirection:'column',gap:1}}>
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <span style={{fontSize:10,letterSpacing:'0.08em',color:'rgba(255,255,255,0.96)',textTransform:'uppercase'}}>{label}</span>
              <span style={{fontSize:10,color:c,fontFamily:'Space Mono,monospace'}}>{((v-min)/(max-min)*100).toFixed(0)}</span>
            </div>
            <input type="range" min={min} max={max} step={0.01} value={v} onChange={e=>s(Number(e.target.value))} style={{width:'100%',color:c,accentColor:c,height:12}}/>
          </div>
        ))}

        <div style={{flex:1}}/>

        {/* Scenes */}
        <div style={{fontSize:10,color:'rgba(255,255,255,0.96)',letterSpacing:'0.18em',textTransform:'uppercase',marginBottom:1}}>SCENES</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:2}}>
          {savedScenes.map((sc,i)=>(
            <div key={i} style={{display:'flex',flexDirection:'column',gap:1}}>
              <button onClick={()=>loadScene(i)} style={{
                padding:'4px 2px',borderRadius:2,border:`1px solid ${sc?gc+'44':'rgba(255,255,255,0.07)'}`,
                background:sc?`${gc}0e`:'rgba(255,255,255,0.015)',
                color:sc?gc:'rgba(255,255,255,0.94)',
                fontSize:10,fontWeight:700,cursor:'pointer',fontFamily:'Space Mono,monospace',
                textAlign:'center',
              }}>
                S{i+1}{sc?'◆':''}
              </button>
              <button onClick={()=>saveScene(i)} style={{padding:'1px',borderRadius:2,border:'1px solid rgba(255,255,255,0.05)',background:'rgba(255,255,255,0.015)',color:'rgba(255,255,255,0.96)',fontSize:9.5,cursor:'pointer',fontFamily:'Space Mono,monospace',textAlign:'center'}}>SAVE</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const navBtn={padding:'1px 5px',borderRadius:2,border:'1px solid rgba(255,255,255,0.09)',background:'rgba(255,255,255,0.03)',color:'rgba(255,255,255,0.96)',fontSize:10,cursor:'pointer',fontFamily:'Space Mono,monospace'};

