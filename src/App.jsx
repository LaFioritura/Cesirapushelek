import { useState, useEffect, useRef, useCallback } from 'react'
import './style.css'

// ── Audio Engine ────────────────────────────────────────────────────────────
class AudioEngine {
  constructor() {
    this.ctx = null
    this.masterGain = null
    this.compressor = null
    this.reverb = null
    this.delay = null
    this.initialized = false
  }

  async init() {
    if (this.initialized) return
    this.ctx = new (window.AudioContext || window.webkitAudioContext)()
    
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = 0.85

    this.compressor = this.ctx.createDynamicsCompressor()
    this.compressor.threshold.value = -18
    this.compressor.knee.value = 6
    this.compressor.ratio.value = 4
    this.compressor.attack.value = 0.003
    this.compressor.release.value = 0.15

    this.reverb = await this.createReverb(1.8)
    this.delay = this.createDelay()

    this.masterGain.connect(this.compressor)
    this.compressor.connect(this.ctx.destination)
    this.initialized = true
  }

  async createReverb(duration = 2) {
    const reverb = this.ctx.createConvolver()
    const length = this.ctx.sampleRate * duration
    const impulse = this.ctx.createBuffer(2, length, this.ctx.sampleRate)
    for (let c = 0; c < 2; c++) {
      const d = impulse.getChannelData(c)
      for (let i = 0; i < length; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 1.5)
      }
    }
    reverb.buffer = impulse
    return reverb
  }

  createDelay() {
    const delay = this.ctx.createDelay(2)
    delay.delayTime.value = 0.375
    const feedback = this.ctx.createGain()
    feedback.gain.value = 0.3
    delay.connect(feedback)
    feedback.connect(delay)
    return delay
  }

  now() { return this.ctx?.currentTime ?? 0 }

  // ── Synth voices ──────────────────────────────────────────────────────────

  playKick(time, { pitch = 60, decay = 0.45, punch = 0.8, distort = 0 } = {}) {
    const t = time ?? this.now()
    const osc = this.ctx.createOscillator()
    const env = this.ctx.createGain()
    const dist = this.ctx.createWaveShaper()
    
    const freq = 20 + pitch * 2.5
    osc.frequency.setValueAtTime(freq * 6, t)
    osc.frequency.exponentialRampToValueAtTime(freq, t + 0.04)
    
    if (distort > 0) {
      const curve = new Float32Array(256)
      for (let i = 0; i < 256; i++) {
        const x = i / 128 - 1
        curve[i] = ((Math.PI + distort * 100) * x) / (Math.PI + distort * 100 * Math.abs(x))
      }
      dist.curve = curve
    }

    env.gain.setValueAtTime(punch, t)
    env.gain.exponentialRampToValueAtTime(0.001, t + decay)

    osc.connect(distort > 0 ? dist : env)
    if (distort > 0) dist.connect(env)
    env.connect(this.masterGain)
    osc.start(t)
    osc.stop(t + decay + 0.1)
  }

  playSnare(time, { pitch = 50, decay = 0.15, snap = 0.7, noise = 0.6 } = {}) {
    const t = time ?? this.now()
    // Tonal body
    const osc = this.ctx.createOscillator()
    const oscEnv = this.ctx.createGain()
    osc.frequency.value = 100 + pitch * 2
    osc.type = 'triangle'
    oscEnv.gain.setValueAtTime(snap * 0.5, t)
    oscEnv.gain.exponentialRampToValueAtTime(0.001, t + 0.08)
    osc.connect(oscEnv)
    oscEnv.connect(this.masterGain)
    osc.start(t); osc.stop(t + 0.1)
    // Noise layer
    if (noise > 0) {
      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.4, this.ctx.sampleRate)
      const d = buf.getChannelData(0)
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
      const src = this.ctx.createBufferSource()
      src.buffer = buf
      const filter = this.ctx.createBiquadFilter()
      filter.type = 'highpass'
      filter.frequency.value = 1500
      const noiseEnv = this.ctx.createGain()
      noiseEnv.gain.setValueAtTime(noise * 0.7, t)
      noiseEnv.gain.exponentialRampToValueAtTime(0.001, t + decay)
      src.connect(filter)
      filter.connect(noiseEnv)
      noiseEnv.connect(this.masterGain)
      src.start(t); src.stop(t + decay + 0.05)
    }
  }

  playHihat(time, { open = false, decay = 0.05, pitch = 60, brightness = 0.8 } = {}) {
    const t = time ?? this.now()
    const d = open ? 0.35 + decay * 0.3 : 0.04 + decay * 0.1
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * (d + 0.05), this.ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    const src = this.ctx.createBufferSource()
    src.buffer = buf
    const hp = this.ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 5000 + pitch * 50
    const bp = this.ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 8000 + brightness * 4000
    bp.Q.value = 0.5
    const env = this.ctx.createGain()
    env.gain.setValueAtTime(0.5, t)
    env.gain.exponentialRampToValueAtTime(0.001, t + d)
    src.connect(hp); hp.connect(bp); bp.connect(env); env.connect(this.masterGain)
    src.start(t); src.stop(t + d + 0.05)
  }

  playClap(time, { decay = 0.12, tone = 0.5, spread = 0.02 } = {}) {
    const t = time ?? this.now()
    const offsets = [0, spread * 0.3, spread * 0.7, spread]
    offsets.forEach(off => {
      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.15, this.ctx.sampleRate)
      const d = buf.getChannelData(0)
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
      const src = this.ctx.createBufferSource()
      src.buffer = buf
      const bp = this.ctx.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = 900 + tone * 500
      bp.Q.value = 0.8
      const env = this.ctx.createGain()
      env.gain.setValueAtTime(0.35, t + off)
      env.gain.exponentialRampToValueAtTime(0.001, t + off + decay)
      src.connect(bp); bp.connect(env); env.connect(this.masterGain)
      src.start(t + off); src.stop(t + off + decay + 0.05)
    })
  }

  playTom(time, { pitch = 50, decay = 0.25, body = 0.8 } = {}) {
    const t = time ?? this.now()
    const osc = this.ctx.createOscillator()
    const env = this.ctx.createGain()
    const freq = 40 + pitch * 3
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq * 2.5, t)
    osc.frequency.exponentialRampToValueAtTime(freq, t + 0.02)
    env.gain.setValueAtTime(body, t)
    env.gain.exponentialRampToValueAtTime(0.001, t + decay)
    osc.connect(env); env.connect(this.masterGain)
    osc.start(t); osc.stop(t + decay + 0.05)
  }

  playCowbell(time, { pitch = 50, decay = 0.4 } = {}) {
    const t = time ?? this.now()
    const freqs = [562 + pitch * 5, 845 + pitch * 8]
    freqs.forEach(f => {
      const osc = this.ctx.createOscillator()
      const env = this.ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = f
      env.gain.setValueAtTime(0.2, t)
      env.gain.exponentialRampToValueAtTime(0.001, t + decay)
      osc.connect(env); env.connect(this.masterGain)
      osc.start(t); osc.stop(t + decay + 0.05)
    })
  }

  playPerc(time, { pitch = 60, decay = 0.08, tone = 0.5 } = {}) {
    const t = time ?? this.now()
    const osc = this.ctx.createOscillator()
    const env = this.ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(pitch * 10, t)
    osc.frequency.exponentialRampToValueAtTime(pitch * 2, t + 0.01)
    env.gain.setValueAtTime(0.6, t)
    env.gain.exponentialRampToValueAtTime(0.001, t + decay)
    osc.connect(env); env.connect(this.masterGain)
    osc.start(t); osc.stop(t + decay + 0.05)
  }

  playRide(time, { pitch = 50, decay = 0.6 } = {}) {
    const t = time ?? this.now()
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * decay, this.ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    const src = this.ctx.createBufferSource()
    src.buffer = buf
    const bp = this.ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 3000 + pitch * 40
    bp.Q.value = 2
    const env = this.ctx.createGain()
    env.gain.setValueAtTime(0.3, t)
    env.gain.exponentialRampToValueAtTime(0.001, t + decay)
    src.connect(bp); bp.connect(env); env.connect(this.masterGain)
    src.start(t); src.stop(t + decay + 0.05)
  }
}

const engine = new AudioEngine()

// ── Track definitions ────────────────────────────────────────────────────────
const TRACK_DEFS = [
  { id: 'kick',    label: 'KICK',    color: '#e85d00', play: (t, p) => engine.playKick(t, p),    params: { pitch: 60, decay: 0.45, punch: 0.8, distort: 0 } },
  { id: 'snare',   label: 'SNARE',   color: '#d4a017', play: (t, p) => engine.playSnare(t, p),   params: { pitch: 50, decay: 0.15, snap: 0.7, noise: 0.6 } },
  { id: 'clap',    label: 'CLAP',    color: '#c44569', play: (t, p) => engine.playClap(t, p),    params: { decay: 0.12, tone: 0.5, spread: 0.02 } },
  { id: 'hihat',   label: 'HH CL',  color: '#4db8c8', play: (t, p) => engine.playHihat(t, p),   params: { open: false, decay: 0.05, pitch: 60, brightness: 0.8 } },
  { id: 'openhat', label: 'HH OP',  color: '#2fa8bd', play: (t, p) => engine.playHihat(t, { ...p, open: true }), params: { decay: 0.35, pitch: 55, brightness: 0.6 } },
  { id: 'tom1',    label: 'TOM HI', color: '#7c5cbf', play: (t, p) => engine.playTom(t, p),     params: { pitch: 65, decay: 0.2, body: 0.8 } },
  { id: 'tom2',    label: 'TOM LO', color: '#6248a8', play: (t, p) => engine.playTom(t, p),     params: { pitch: 40, decay: 0.3, body: 0.9 } },
  { id: 'cowbell', label: 'CWBLL',  color: '#cc7a2e', play: (t, p) => engine.playCowbell(t, p), params: { pitch: 50, decay: 0.4 } },
  { id: 'perc',    label: 'PERC',   color: '#3eb87a', play: (t, p) => engine.playPerc(t, p),    params: { pitch: 60, decay: 0.08, tone: 0.5 } },
  { id: 'ride',    label: 'RIDE',   color: '#5580d4', play: (t, p) => engine.playRide(t, p),    params: { pitch: 50, decay: 0.6 } },
]

const STEPS = 16
const DEFAULT_BPM = 128

function makeEmptyPattern() {
  return TRACK_DEFS.map(() => Array(STEPS).fill(false))
}

// ── PRESETS ──────────────────────────────────────────────────────────────────
const PRESETS = {
  'TECHNO': [
    [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,1],
    [0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ].map(r => r.map(Boolean)),
  'TRAP': [
    [1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    [0,0,0,0,1,0,0,0,0,0,0,0,1,0,1,0],
    [1,1,0,1,1,0,1,1,1,0,1,1,1,1,0,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ].map(r => r.map(Boolean)),
  'HOUSE': [
    [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    [0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0],
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ].map(r => r.map(Boolean)),
}

// ── Components ────────────────────────────────────────────────────────────────

function Pad({ active, playing, color, onToggle }) {
  return (
    <button
      className={`pad ${active ? 'pad--on' : ''} ${playing ? 'pad--playing' : ''}`}
      style={{ '--pad-color': color }}
      onClick={onToggle}
    />
  )
}

function TrackRow({ track, pattern, currentStep, isPlaying, onToggle, onSelect, selected, volume, onVolume }) {
  return (
    <div className={`track-row ${selected ? 'track-row--selected' : ''}`}>
      <button className="track-label" onClick={onSelect} style={{ '--track-color': track.color }}>
        <span className="track-label__dot" />
        <span className="track-label__name">{track.label}</span>
      </button>
      <div className="track-pads">
        {Array.from({ length: STEPS }, (_, i) => (
          <Pad
            key={i}
            active={pattern[i]}
            playing={isPlaying && currentStep === i}
            color={track.color}
            onToggle={() => onToggle(i)}
          />
        ))}
      </div>
      <div className="track-vol">
        <input
          type="range" min="0" max="1" step="0.01"
          value={volume}
          onChange={e => onVolume(parseFloat(e.target.value))}
          className="vol-slider"
          style={{ '--track-color': track.color }}
        />
      </div>
    </div>
  )
}

function ParamKnob({ label, value, min, max, step = 0.01, onChange }) {
  const angle = ((value - min) / (max - min)) * 270 - 135
  return (
    <div className="knob-wrap">
      <div className="knob" style={{ '--angle': `${angle}deg` }}
        onPointerDown={e => {
          e.currentTarget.setPointerCapture(e.pointerId)
          const startY = e.clientY
          const startVal = value
          const move = ev => {
            const delta = (startY - ev.clientY) / 120
            const newVal = Math.min(max, Math.max(min, startVal + delta * (max - min)))
            onChange(Math.round(newVal / step) * step)
          }
          const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
          window.addEventListener('pointermove', move)
          window.addEventListener('pointerup', up)
        }}
      >
        <div className="knob__indicator" />
      </div>
      <span className="knob__label">{label}</span>
      <span className="knob__value">{typeof value === 'number' && value % 1 !== 0 ? value.toFixed(2) : value}</span>
    </div>
  )
}

function VUMeter({ level }) {
  const bars = 12
  return (
    <div className="vu-meter">
      {Array.from({ length: bars }, (_, i) => {
        const threshold = i / bars
        const lit = level > threshold
        const danger = i > bars * 0.75
        const warn = i > bars * 0.55
        return <div key={i} className={`vu-bar ${lit ? (danger ? 'vu-bar--red' : warn ? 'vu-bar--yellow' : 'vu-bar--green') : ''}`} />
      })}
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [pattern, setPattern] = useState(makeEmptyPattern)
  const [bpm, setBpm] = useState(DEFAULT_BPM)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [selectedTrack, setSelectedTrack] = useState(0)
  const [volumes, setVolumes] = useState(() => TRACK_DEFS.map(() => 0.8))
  const [muted, setMuted] = useState(() => TRACK_DEFS.map(() => false))
  const [params, setParams] = useState(() => TRACK_DEFS.map(t => ({ ...t.params })))
  const [vuLevel, setVuLevel] = useState(0)
  const [swing, setSwing] = useState(0)
  const [activePreset, setActivePreset] = useState(null)
  const [stepLength, setStepLength] = useState(STEPS)

  const schedulerRef = useRef(null)
  const stepRef = useRef(0)
  const nextTickRef = useRef(0)
  const vuRef = useRef(0)
  const patternRef = useRef(pattern)
  const bpmRef = useRef(bpm)
  const volumesRef = useRef(volumes)
  const mutedRef = useRef(muted)
  const paramsRef = useRef(params)
  const swingRef = useRef(swing)
  const stepLenRef = useRef(stepLength)

  patternRef.current = pattern
  bpmRef.current = bpm
  volumesRef.current = volumes
  mutedRef.current = muted
  paramsRef.current = params
  swingRef.current = swing
  stepLenRef.current = stepLength

  const scheduleNote = useCallback((step, time) => {
    patternRef.current.forEach((trackPat, ti) => {
      if (!trackPat[step]) return
      if (mutedRef.current[ti]) return
      const vol = volumesRef.current[ti]
      const gainNode = engine.ctx.createGain()
      gainNode.gain.value = vol
      gainNode.connect(engine.masterGain)
      TRACK_DEFS[ti].play(time, paramsRef.current[ti])
    })
    // VU animation
    const activeCount = patternRef.current.filter((tp, ti) => tp[step] && !mutedRef.current[ti]).length
    if (activeCount > 0) {
      vuRef.current = Math.min(1, activeCount / 4)
    }
  }, [])

  const runScheduler = useCallback(() => {
    const lookahead = 0.1
    const scheduleAheadTime = 0.05
    while (nextTickRef.current < engine.now() + lookahead) {
      const step = stepRef.current % stepLenRef.current
      const swingOffset = (step % 2 === 1) ? (swingRef.current * 0.04) : 0
      scheduleNote(step, nextTickRef.current + swingOffset)
      setCurrentStep(step)
      const bpsec = 60 / bpmRef.current / 4
      nextTickRef.current += bpsec
      stepRef.current++
    }
    schedulerRef.current = setTimeout(runScheduler, scheduleAheadTime * 1000)
  }, [scheduleNote])

  useEffect(() => {
    const interval = setInterval(() => {
      setVuLevel(prev => {
        const target = vuRef.current
        vuRef.current *= 0.7
        return prev * 0.85 + target * 0.15
      })
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const start = async () => {
    await engine.init()
    if (engine.ctx.state === 'suspended') await engine.ctx.resume()
    stepRef.current = 0
    nextTickRef.current = engine.now()
    runScheduler()
    setIsPlaying(true)
  }

  const stop = () => {
    clearTimeout(schedulerRef.current)
    setIsPlaying(false)
    setCurrentStep(-1)
  }

  const toggle = () => isPlaying ? stop() : start()

  const toggleStep = (trackIdx, stepIdx) => {
    setPattern(prev => {
      const next = prev.map(r => [...r])
      next[trackIdx][stepIdx] = !next[trackIdx][stepIdx]
      return next
    })
  }

  const loadPreset = (name) => {
    const p = PRESETS[name]
    if (!p) return
    setPattern(p.map(r => [...r]))
    setActivePreset(name)
  }

  const clear = () => {
    setPattern(makeEmptyPattern())
    setActivePreset(null)
  }

  const randomize = () => {
    setPattern(TRACK_DEFS.map((_, ti) =>
      Array.from({ length: STEPS }, (_, si) => {
        const density = ti === 0 ? 0.25 : ti === 1 ? 0.15 : ti === 3 ? 0.4 : 0.1
        return Math.random() < density
      })
    ))
    setActivePreset(null)
  }

  const updateParam = (paramKey, value) => {
    setParams(prev => prev.map((p, i) => i === selectedTrack ? { ...p, [paramKey]: value } : p))
  }

  const updateVolume = (ti, val) => {
    setVolumes(prev => prev.map((v, i) => i === ti ? val : v))
  }

  const toggleMute = (ti) => {
    setMuted(prev => prev.map((m, i) => i === ti ? !m : m))
  }

  const selTrack = TRACK_DEFS[selectedTrack]
  const selParams = params[selectedTrack]

  // Preview on track select
  const selectTrack = async (i) => {
    setSelectedTrack(i)
    if (!engine.initialized) await engine.init()
    if (engine.ctx.state === 'suspended') await engine.ctx.resume()
    TRACK_DEFS[i].play(null, params[i])
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header__logo">
          <span className="header__logo-mark">◆</span>
          <span className="header__logo-text">CESIRA</span>
          <span className="header__logo-ver">v2</span>
        </div>
        <div className="header__center">
          <div className="bpm-display">
            <button className="bpm-btn" onClick={() => setBpm(b => Math.max(40, b - 1))}>−</button>
            <div className="bpm-value">
              <span className="bpm-number">{bpm}</span>
              <span className="bpm-label">BPM</span>
            </div>
            <button className="bpm-btn" onClick={() => setBpm(b => Math.min(240, b + 1))}>+</button>
          </div>
          <input
            type="range" min="40" max="240" value={bpm}
            className="bpm-slider"
            onChange={e => setBpm(Number(e.target.value))}
          />
        </div>
        <div className="header__right">
          <VUMeter level={vuLevel} />
          <button className={`play-btn ${isPlaying ? 'play-btn--stop' : ''}`} onClick={toggle}>
            {isPlaying ? '■' : '▶'}
          </button>
        </div>
      </header>

      {/* Controls bar */}
      <div className="controls-bar">
        <div className="preset-group">
          <span className="controls-label">PRESET</span>
          {Object.keys(PRESETS).map(name => (
            <button
              key={name}
              className={`ctrl-btn ${activePreset === name ? 'ctrl-btn--active' : ''}`}
              onClick={() => loadPreset(name)}
            >{name}</button>
          ))}
        </div>
        <div className="controls-mid">
          <button className="ctrl-btn" onClick={randomize}>RANDOM</button>
          <button className="ctrl-btn ctrl-btn--danger" onClick={clear}>CLEAR</button>
        </div>
        <div className="controls-right">
          <span className="controls-label">STEPS</span>
          {[8, 16, 32].map(n => (
            <button
              key={n}
              className={`ctrl-btn ${stepLength === n ? 'ctrl-btn--active' : ''}`}
              onClick={() => { setStepLength(n); stepRef.current = 0 }}
            >{n}</button>
          ))}
          <span className="controls-label swing-label">SWING</span>
          <input
            type="range" min="0" max="1" step="0.01" value={swing}
            className="swing-slider"
            onChange={e => setSwing(parseFloat(e.target.value))}
          />
          <span className="swing-val">{Math.round(swing * 100)}%</span>
        </div>
      </div>

      {/* Step ruler */}
      <div className="step-ruler">
        {Array.from({ length: stepLength }, (_, i) => (
          <div
            key={i}
            className={`ruler-tick ${i % 4 === 0 ? 'ruler-tick--beat' : ''} ${currentStep === i ? 'ruler-tick--active' : ''}`}
          >
            {i % 4 === 0 ? i / 4 + 1 : ''}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid">
        {TRACK_DEFS.map((track, ti) => (
          <div key={track.id} className="track-row-wrap">
            <TrackRow
              track={track}
              pattern={pattern[ti].slice(0, stepLength)}
              currentStep={currentStep}
              isPlaying={isPlaying}
              onToggle={si => toggleStep(ti, si)}
              onSelect={() => selectTrack(ti)}
              selected={selectedTrack === ti}
              volume={volumes[ti]}
              onVolume={v => updateVolume(ti, v)}
            />
            <button
              className={`mute-btn ${muted[ti] ? 'mute-btn--muted' : ''}`}
              onClick={() => toggleMute(ti)}
              title={muted[ti] ? 'Unmute' : 'Mute'}
            >M</button>
          </div>
        ))}
      </div>

      {/* Bottom panel — synth params */}
      <div className="synth-panel">
        <div className="synth-panel__header">
          <div className="synth-panel__track-name" style={{ color: selTrack.color }}>
            <span className="synth-panel__dot" style={{ background: selTrack.color }} />
            {selTrack.label}
          </div>
          <span className="synth-panel__subtitle">SYNTHESIS PARAMETERS</span>
        </div>
        <div className="synth-panel__knobs">
          {Object.entries(selParams).map(([key, val]) => {
            if (typeof val === 'boolean') return (
              <div className="knob-wrap" key={key}>
                <button
                  className={`toggle-btn ${val ? 'toggle-btn--on' : ''}`}
                  style={{ '--track-color': selTrack.color }}
                  onClick={() => updateParam(key, !val)}
                />
                <span className="knob__label">{key.toUpperCase()}</span>
                <span className="knob__value">{val ? 'ON' : 'OFF'}</span>
              </div>
            )
            const ranges = {
              pitch: [20, 80], decay: [0.01, 1], punch: [0, 1], distort: [0, 1],
              snap: [0, 1], noise: [0, 1], tone: [0, 1], body: [0, 1],
              spread: [0, 0.1], brightness: [0, 1]
            }
            const [min, max] = ranges[key] || [0, 1]
            return (
              <ParamKnob
                key={key}
                label={key.toUpperCase()}
                value={typeof val === 'number' ? val : 0}
                min={min} max={max} step={key === 'pitch' ? 1 : 0.01}
                onChange={v => updateParam(key, v)}
              />
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <span>CESIRA DRUM MACHINE</span>
        <span>WEB AUDIO API · PROCEDURAL SYNTHESIS</span>
        <span>♦ {bpm} BPM · {stepLength} STEPS</span>
      </footer>
    </div>
  )
}
