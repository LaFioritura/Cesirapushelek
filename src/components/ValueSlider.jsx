export default function ValueSlider({
  label,
  value,
  setValue,
  color = '#ffffff',
  min = 0,
  max = 1,
  step,
  compact = false,
}) {
  const resolvedStep = step ?? ((max - min) / 200);
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 1 : 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 0 }}>
        <span
          style={{
            fontSize: 10,
            letterSpacing: '0.08em',
            color: 'rgba(255,255,255,0.96)',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>

        <span
          style={{
            fontSize: 10,
            color,
            fontFamily: 'Space Mono,monospace',
          }}
        >
          {pct.toFixed(0)}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={resolvedStep}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        style={{
          width: '100%',
          accentColor: color,
          color,
          height: 12,
        }}
      />
    </div>
  );
}