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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Manual Entries</h2>
        <p className="text-sm text-gray-500">No manual entries yet.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Manual Entries</h2>
      <div className="overflow-x-auto -mx-4 sm:-mx-6">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-4 sm:px-6 py-2 font-medium text-gray-500">Metric</th>
              <th className="text-left px-4 sm:px-6 py-2 font-medium text-gray-500">Section</th>
              <th className="text-right px-4 sm:px-6 py-2 font-medium text-gray-500">Value</th>
              <th className="text-left px-4 sm:px-6 py-2 font-medium text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.map(entry => (
              <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 sm:px-6 py-2 text-gray-900 font-medium">
                  {entry.metric_key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </td>
                <td className="px-4 sm:px-6 py-2 text-gray-500 capitalize">{entry.section}</td>
                <td className="px-4 sm:px-6 py-2 text-right text-gray-900 tabular-nums">
                  {formatValue(entry.value, entry.unit)}
                </td>
                <td className="px-4 sm:px-6 py-2 text-gray-500">
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
