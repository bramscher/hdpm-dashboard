'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { AlertRule } from '@/types'
import clsx from 'clsx'

interface AlertsManagerProps {
  initialRules: AlertRule[]
  metricKeys: string[]
  isCeo: boolean
}

export default function AlertsManager({ initialRules, metricKeys, isCeo }: AlertsManagerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [rules, setRules] = useState(initialRules)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)

    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric_key: form.get('metric_key'),
        condition: form.get('condition'),
        threshold: Number(form.get('threshold')),
        notify_email: true,
      }),
    })

    if (!res.ok) {
      const body = await res.json()
      setError(body.error ?? 'Failed to create alert')
      return
    }

    const { data } = await res.json()
    setRules(prev => [data, ...prev])
    setShowCreate(false)
    ;(e.target as HTMLFormElement).reset()
    startTransition(() => router.refresh())
  }

  async function handleToggle(rule: AlertRule) {
    const res = await fetch('/api/alerts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: rule.id, is_active: !rule.is_active }),
    })
    if (res.ok) {
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, is_active: !r.is_active } : r))
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch('/api/alerts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setRules(prev => prev.filter(r => r.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Create form */}
      {isCeo && (
        <div>
          {!showCreate ? (
            <button
              onClick={() => setShowCreate(true)}
              className="rounded-md bg-hdpm-dark px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-hdpm-green transition-colors"
            >
              + New Alert Rule
            </button>
          ) : (
            <form onSubmit={handleCreate} className="card space-y-4 max-w-lg">
              <h3 className="text-sm font-semibold text-gray-900">Create Alert Rule</h3>

              <div>
                <label htmlFor="alert_metric" className="block text-sm font-medium text-gray-700">Metric</label>
                <select
                  id="alert_metric"
                  name="metric_key"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Select metric…</option>
                  {metricKeys.map(k => (
                    <option key={k} value={k}>
                      {k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="alert_condition" className="block text-sm font-medium text-gray-700">Condition</label>
                  <select
                    id="alert_condition"
                    name="condition"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="below">Falls below</option>
                    <option value="above">Goes above</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="alert_threshold" className="block text-sm font-medium text-gray-700">Threshold</label>
                  <input
                    id="alert_threshold"
                    name="threshold"
                    type="number"
                    step="any"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    placeholder="90"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-md bg-hdpm-dark px-4 py-2 text-sm font-medium text-white hover:bg-hdpm-green transition-colors disabled:opacity-50"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Rules table */}
      {rules.length === 0 ? (
        <div className="card">
          <p className="text-sm text-gray-500">No alert rules configured yet.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto -mx-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-2 font-medium text-gray-500">Metric</th>
                <th className="text-left px-4 py-2 font-medium text-gray-500">Condition</th>
                <th className="text-right px-4 py-2 font-medium text-gray-500">Threshold</th>
                <th className="text-center px-4 py-2 font-medium text-gray-500">Status</th>
                {isCeo && (
                  <th className="text-right px-4 py-2 font-medium text-gray-500">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rules.map(rule => (
                <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {rule.metric_key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rule.condition === 'below' ? 'Falls below' : 'Goes above'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 tabular-nums">
                    {rule.threshold}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={clsx(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide',
                      rule.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-500'
                    )}>
                      {rule.is_active ? 'Active' : 'Paused'}
                    </span>
                  </td>
                  {isCeo && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggle(rule)}
                          className="text-xs text-gray-500 hover:text-gray-900 transition"
                        >
                          {rule.is_active ? 'Pause' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
                          className="text-xs text-red-400 hover:text-red-600 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
