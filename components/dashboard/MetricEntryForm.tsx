'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { MetricSection } from '@/types'

const SECTIONS: { value: MetricSection; label: string }[] = [
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'financial', label: 'Financial' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'growth', label: 'Growth & Sales' },
  { value: 'retention', label: 'Owner Retention' },
  { value: 'people', label: 'People' },
]

const UNITS = ['%', '$', 'days', 'count', 'score', 'months']

export default function MetricEntryForm({ metricKeys }: { metricKeys: string[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const form = new FormData(e.currentTarget)
    const payload = {
      metric_key: form.get('metric_key'),
      section: form.get('section'),
      value: Number(form.get('value')),
      unit: form.get('unit'),
      period_start: form.get('period_start'),
      period_end: form.get('period_end'),
      notes: form.get('notes') || null,
    }

    const res = await fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const body = await res.json()
      setError(body.error ?? 'Failed to save metric')
      return
    }

    setSuccess(true)
    ;(e.target as HTMLFormElement).reset()
    startTransition(() => router.refresh())
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <h2 className="text-lg font-bold text-ink-primary">Add Metric</h2>

      {error && (
        <div className="rounded-xl bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.2)] px-4 py-2.5 text-sm text-status-red">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-[rgba(52,211,153,0.08)] border border-[rgba(52,211,153,0.2)] px-4 py-2.5 text-sm text-status-green">
          Metric saved successfully
        </div>
      )}

      <div>
        <label htmlFor="metric_key" className="block text-xs font-medium text-ink-secondary mb-1.5">
          Metric Key
        </label>
        <input
          id="metric_key"
          name="metric_key"
          list="metric-keys"
          required
          className="block w-full px-3 py-2.5 text-sm"
          placeholder="e.g. owner_nps_score"
        />
        <datalist id="metric-keys">
          {metricKeys.map(k => <option key={k} value={k} />)}
        </datalist>
      </div>

      <div>
        <label htmlFor="section" className="block text-xs font-medium text-ink-secondary mb-1.5">
          Section
        </label>
        <select id="section" name="section" required className="block w-full px-3 py-2.5 text-sm">
          <option value="">Select section...</option>
          {SECTIONS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="value" className="block text-xs font-medium text-ink-secondary mb-1.5">
            Value
          </label>
          <input
            id="value"
            name="value"
            type="number"
            step="any"
            required
            className="block w-full px-3 py-2.5 text-sm"
            placeholder="95.2"
          />
        </div>
        <div>
          <label htmlFor="unit" className="block text-xs font-medium text-ink-secondary mb-1.5">
            Unit
          </label>
          <select id="unit" name="unit" required className="block w-full px-3 py-2.5 text-sm">
            <option value="">Select...</option>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="period_start" className="block text-xs font-medium text-ink-secondary mb-1.5">
            Period Start
          </label>
          <input
            id="period_start"
            name="period_start"
            type="date"
            required
            defaultValue={today}
            className="block w-full px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor="period_end" className="block text-xs font-medium text-ink-secondary mb-1.5">
            Period End
          </label>
          <input
            id="period_end"
            name="period_end"
            type="date"
            required
            defaultValue={today}
            className="block w-full px-3 py-2.5 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-xs font-medium text-ink-secondary mb-1.5">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          className="block w-full px-3 py-2.5 text-sm"
          placeholder="Any context about this metric..."
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="btn-neon w-full disabled:opacity-50"
      >
        {isPending ? 'Saving...' : 'Save Metric'}
      </button>
    </form>
  )
}
