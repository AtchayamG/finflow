import type { ReactNode } from 'react'

export function StatTile({ icon, label, value, delta, tone = 'teal' }: { icon: ReactNode; label: string; value: string | number; delta: string; tone?: string }) {
  return (
    <section className={`stat-tile ${tone}`}>
      <div className="stat-icon">{icon}</div>
      <span>{label}</span>
      <b>{value}</b>
      <small>{delta}</small>
    </section>
  )
}
