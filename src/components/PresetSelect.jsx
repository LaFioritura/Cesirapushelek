import React from 'react';
export default function PresetSelect({label,value,options,onChange,accent='#ffffff',compact=false}){
  return(
    <label style={{display:'flex',flexDirection:'column',gap:2,minWidth:compact?112:124}}>
      <span style={{fontSize:10,color:'rgba(255,255,255,0.96)',letterSpacing:'0.12em',textTransform:'uppercase'}}>{label}</span>
      <select value={value} onChange={e=>onChange(e.target.value)} style={{background:'rgba(255,255,255,0.04)',border:`1px solid ${accent}33`,color:accent,borderRadius:4,padding:compact?'4px 6px':'5px 7px',fontSize:10,fontFamily:'Space Mono,monospace',outline:'none'}}>
        {Object.entries(options).map(([key,preset])=><option key={key} value={key} style={{color:'#111',background:'#f2f2f2'}}>{preset.label}</option>)}
      </select>
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDIO VIEW — detailed editor
// ─────────────────────────────────────────────────────────────────────────────
