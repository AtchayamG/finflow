export function Gauge({ score, band, min = 300, max = 900 }: { score: number; band: string; min?: number; max?: number }) {
  const clamped = Math.max(min, Math.min(max, score))
  const pct = (clamped - min) / (max - min)
  const dash = Math.round(pct * 188)
  return (
    <div className="viz-gauge">
      <svg viewBox="0 0 160 100" role="img" aria-label={`Credit score ${score}`}>
        <path className="gauge-track" d="M22 82a58 58 0 0 1 116 0" />
        <path className={`gauge-fill ${band.toLowerCase()}`} d="M22 82a58 58 0 0 1 116 0" strokeDasharray={`${dash} ${188 - dash}`} />
        <text x="80" y="66" textAnchor="middle" className="gauge-score">{score}</text>
        <text x="80" y="84" textAnchor="middle" className="gauge-band">{band}</text>
      </svg>
    </div>
  )
}
