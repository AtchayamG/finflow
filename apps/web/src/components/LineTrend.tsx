export function LineTrend({ points, label }: { points: number[]; label: string }) {
  const max = Math.max(...points, 1)
  const min = Math.min(...points)
  const span = Math.max(max - min, 1)
  const coords = points.map((point, index) => {
    const x = 8 + (index / Math.max(points.length - 1, 1)) * 184
    const y = 70 - ((point - min) / span) * 52
    return `${x},${y}`
  }).join(' ')
  return (
    <svg className="viz-line" viewBox="0 0 200 82" role="img" aria-label={label}>
      <polyline className="line-area" points={`8,74 ${coords} 192,74`} />
      <polyline className="line-stroke" points={coords} />
      {points.map((point, index) => <circle key={`${point}-${index}`} cx={8 + (index / Math.max(points.length - 1, 1)) * 184} cy={70 - ((point - min) / span) * 52} r="2.6" />)}
    </svg>
  )
}
