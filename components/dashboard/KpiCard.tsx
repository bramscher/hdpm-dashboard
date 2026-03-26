'use client'

import type { KpiCardData } from '@/types'
import Sparkline from './Sparkline'
import clsx from 'clsx'

function formatValue(value: number | null, unit: string | null): string {
  if (value === null) return '—'
  if (unit === '$') return `$${value.toLocaleString()}`
  if (unit === '%') return `${value}%`
  if (unit === 'days') return `${value}d`
  return value.toLocaleString()
}

function trendArrow(current: number | null, previous: number | null) {
  if (current === null || previous === null) return null
  if (current > previous) return '↑'
  if (current < previous) return '↓'
  return '→'
}

export default function KpiCard({ card }: { card: KpiCardData }) {
  const arrow = trendArrow(card.current_value, card.previous_value)

  return (
    <div className="card flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 truncate">{card.label}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-0.5">
            {formatValue(card.current_value, card.unit)}
            {arrow && (
              <span className={clsx('ml-1.5 text-sm font-medium', {
                'text-green-600': arrow === '↑',
                'text-red-600': arrow === '↓',
                'text-gray-400': arrow === '→',
              })}>
                {arrow}
              </span>
            )}
          </p>
        </div>

        {/* Status badge */}
        <span className={clsx(
          'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide shrink-0',
          `stoplight-${card.status}`
        )}>
          {card.status}
        </span>
      </div>

      {/* Target */}
      {card.target_value !== null && (
        <p className="text-[11px] text-gray-400">
          Target: {formatValue(card.target_value, card.unit)}
        </p>
      )}

      {/* Sparkline */}
      <Sparkline data={card.sparkline} status={card.status} />
    </div>
  )
}
