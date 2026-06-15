type BarRow = { label: string; value: number; tone?: string }

export function BarsH({ rows }: { rows: BarRow[] }) {
  const max = Math.max(...rows.map((row) => row.value), 1)
  return (
    <div className="viz-bars">
      {rows.map((row) => (
        <div className="bar-row" key={row.label}>
          <span>{row.label}</span>
          <div><i className={row.tone ?? 'teal'} style={{ width: `${Math.max(8, (row.value / max) * 100)}%` }} /></div>
          <b>{row.value}</b>
        </div>
      ))}
    </div>
  )
}
