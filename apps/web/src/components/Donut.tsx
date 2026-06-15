type Segment = { label: string; value: number; tone?: string }

export function Donut({ label, value, segments }: { label: string; value: string | number; segments: Segment[] }) {
  const total = Math.max(segments.reduce((sum, item) => sum + item.value, 0), 1)
  const arcs = segments.map((segment, index) => {
    const dash = (segment.value / total) * 264
    const prior = segments.slice(0, index).reduce((sum, item) => sum + (item.value / total) * 264, 0)
    return { ...segment, dash, offset: 25 - prior }
  })
  return (
    <div className="viz-donut">
      <svg viewBox="0 0 120 120" role="img" aria-label={label}>
        <circle className="donut-track" cx="60" cy="60" r="42" />
        {arcs.map((segment) => <circle key={segment.label} className={`donut-arc ${segment.tone ?? 'teal'}`} cx="60" cy="60" r="42" strokeDasharray={`${segment.dash} ${264 - segment.dash}`} strokeDashoffset={segment.offset} />)}
        <text x="60" y="56" textAnchor="middle" className="donut-value">{value}</text>
        <text x="60" y="74" textAnchor="middle" className="donut-label">{label}</text>
      </svg>
      <div className="legend">
        {segments.map((item) => <span key={item.label}><i className={item.tone ?? 'teal'} />{item.label}<b>{item.value}</b></span>)}
      </div>
    </div>
  )
}
