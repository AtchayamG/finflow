import { Fragment } from 'react'

type HeatCell = { row: string; col: string; value: number }

export function Heatmap({ rows, cols, cells }: { rows: string[]; cols: string[]; cells: HeatCell[] }) {
  const max = Math.max(...cells.map((cell) => cell.value), 1)
  const valueFor = (row: string, col: string) => cells.find((cell) => cell.row === row && cell.col === col)?.value ?? 0
  return (
    <div className="viz-heatmap" style={{ gridTemplateColumns: `72px repeat(${cols.length}, 1fr)` }}>
      <span />
      {cols.map((col) => <b key={col}>{col}</b>)}
      {rows.map((row) => (
        <Fragment key={row}>
          <b>{row}</b>
          {cols.map((col) => {
            const value = valueFor(row, col)
            const level = Math.ceil((value / max) * 5)
            return <i key={`${row}-${col}`} className={`heat-${level}`} title={`${row} ${col}: ${value}`} />
          })}
        </Fragment>
      ))}
    </div>
  )
}
