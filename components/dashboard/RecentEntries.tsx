'use client'

import type { MetricSnapshot } from '@/types'

function formatValue(value: number, unit: string | null): string {
  if (unit === '$') return `$${value.toLocaleString()}`
  if (unit === '%') return `${value}%`
  if (unit === 'days') return `${value}d`
  return value.toLocaleString()
}

export default function RecentEntries({ entries }: { entries: MetricSnapshot[] }) {
  if (entries.length === 0) {
    return (
      <div className="card">
        <h2 className="text-lg font-bold text-ink-primary mb-4">Recent Manual Entries</h2>
        <p className="text-sm text-ink-muted">No manual entries yet.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="text-lg font-bold text-ink-primary mb-4">Recent Manual Entries</h2>
      <div className="overflow-x-auto -mx-5">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(107,171,57,0.1)]">
              <th className="text-left px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Metric</th>
              <th className="text-left px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Section</th>
              <th className="text-right px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Value</th>
              <th className="text-left px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Date</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => (
              <tr key={entry.id} className="border-b border-[rgba(107,171,57,0.05)]">
                <td className="px-5 py-2.5 text-ink-primary font-medium">
                  {entry.metric_key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </td>
                <td className="px-5 py-2.5 text-ink-secondary capitalize">{entry.section}</td>
                <td className="px-5 py-2.5 text-right text-ink-primary tabular-nums">
                  {formatValue(entry.value, entry.unit)}
                </td>
                <td className="px-5 py-2.5 text-ink-muted tabular-nums">
                  {new Date(entry.captured_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
