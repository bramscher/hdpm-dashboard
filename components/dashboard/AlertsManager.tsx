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
        <div className="rounded-xl bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.2)] px-4 py-2.5 text-sm text-status-red">
          {error}
        </div>
      )}

      {isCeo && (
        <div>
          {!showCreate ? (
            <button
              onClick={() => setShowCreate(true)}
              className="btn-neon"
            >
              + New Alert Rule
            </button>
          ) : (
            <form onSubmit={handleCreate} className="card space-y-4 max-w-lg">
              <h3 className="text-sm font-semibold text-ink-primary">Create Alert Rule</h3>

              <div>
                <label htmlFor="alert_metric" className="block text-xs font-medium text-ink-secondary mb-1.5">Metric</label>
                <select id="alert_metric" name="metric_key" required className="block w-full px-3 py-2.5 text-sm">
                  <option value="">Select metric...</option>
                  {metricKeys.map(k => (
                    <option key={k} value={k}>
                      {k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="alert_condition" className="block text-xs font-medium text-ink-secondary mb-1.5">Condition</label>
                  <select id="alert_condition" name="condition" required className="block w-full px-3 py-2.5 text-sm">
                    <option value="below">Falls below</option>
                    <option value="above">Goes above</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="alert_threshold" className="block text-xs font-medium text-ink-secondary mb-1.5">Threshold</label>
                  <input
                    id="alert_threshold"
                    name="threshold"
                    type="number"
                    step="any"
                    required
                    className="block w-full px-3 py-2.5 text-sm"
                    placeholder="90"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-neon disabled:opacity-50"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-xl border border-[rgba(107,171,57,0.15)] px-5 py-2 text-sm text-ink-secondary hover:bg-surface-elevated transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {rules.length === 0 ? (
        <div className="card">
          <p className="text-sm text-ink-muted">No alert rules configured yet.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(107,171,57,0.1)]">
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Metric</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Condition</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Threshold</th>
                <th className="text-center px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Status</th>
                {isCeo && (
                  <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {rules.map(rule => (
                <tr key={rule.id} className="border-b border-[rgba(107,171,57,0.05)]">
                  <td className="px-4 py-3 text-ink-primary font-medium">
                    {rule.metric_key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </td>
                  <td className="px-4 py-3 text-ink-secondary">
                    {rule.condition === 'below' ? 'Falls below' : 'Goes above'}
                  </td>
                  <td className="px-4 py-3 text-right text-ink-primary tabular-nums font-medium">
                    {rule.threshold}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={clsx(
                      'inline-flex items-center px-2.5 py-0.5 rounded-lg text-[9px] font-semibold uppercase tracking-wider',
                      rule.is_active
                        ? 'bg-[rgba(52,211,153,0.1)] text-status-green border border-[rgba(52,211,153,0.2)]'
                        : 'bg-[rgba(107,114,128,0.1)] text-ink-muted border border-[rgba(107,114,128,0.15)]'
                    )}>
                      {rule.is_active ? 'Active' : 'Paused'}
                    </span>
                  </td>
                  {isCeo && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleToggle(rule)}
                          className="text-[11px] text-ink-muted hover:text-ink-primary transition-colors"
                        >
                          {rule.is_active ? 'Pause' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
                          className="text-[11px] text-ink-muted hover:text-status-red transition-colors"
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
