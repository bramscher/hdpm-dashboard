'use client'

import type { KpiCardData, StoplightStatus } from '@/types'
import Sparkline from './Sparkline'
import clsx from 'clsx'

function formatValue(value: number | null, unit: string | null): string {
  if (value === null) return '\u2014'
  if (unit === '$') {
    if (value >= 1000) return `$${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`
    return `$${value.toLocaleString()}`
  }
  if (unit === '%') return `${value}%`
  if (unit === 'days') return `${value}d`
  if (unit === 'months') return `${value}mo`
  return value.toLocaleString()
}

function trendArrow(current: number | null, previous: number | null) {
  if (current === null || previous === null) return null
  if (current > previous) return { arrow: '\u2191', dir: 'up' as const }
  if (current < previous) return { arrow: '\u2193', dir: 'down' as const }
  return { arrow: '\u2192', dir: 'flat' as const }
}

function trendPercent(current: number | null, previous: number | null): string | null {
  if (current === null || previous === null || previous === 0) return null
  const pct = ((current - previous) / previous) * 100
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`
}

const GLOW_MAP: Record<StoplightStatus, string> = {
  green: 'hover:shadow-[0_0_30px_rgba(52,211,153,0.12),0_8px_32px_rgba(0,0,0,0.3)]',
  yellow: 'hover:shadow-[0_0_30px_rgba(251,191,36,0.12),0_8px_32px_rgba(0,0,0,0.3)]',
  red: 'hover:shadow-[0_0_30px_rgba(248,113,113,0.12),0_8px_32px_rgba(0,0,0,0.3)]',
  unknown: 'hover:shadow-[0_0_30px_rgba(140,120,255,0.08),0_8px_32px_rgba(0,0,0,0.3)]',
}

const ACCENT_BORDER: Record<StoplightStatus, string> = {
  green: 'hover:border-[rgba(52,211,153,0.3)]',
  yellow: 'hover:border-[rgba(251,191,36,0.3)]',
  red: 'hover:border-[rgba(248,113,113,0.3)]',
  unknown: 'hover:border-[rgba(140,120,255,0.2)]',
}

export default function KpiCard({ card, index = 0 }: { card: KpiCardData; index?: number }) {
  const trend = trendArrow(card.current_value, card.previous_value)
  const pctChange = trendPercent(card.current_value, card.previous_value)

  return (
    <div
      className={clsx(
        'card card-enter cursor-pointer flex flex-col gap-4',
        GLOW_MAP[card.status],
        ACCENT_BORDER[card.status]
      )}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* Top accent line */}
      <div className={clsx(
        'absolute top-0 left-4 right-4 h-[1px]',
        {
          'bg-gradient-to-r from-transparent via-status-green/40 to-transparent': card.status === 'green',
          'bg-gradient-to-r from-transparent via-status-yellow/40 to-transparent': card.status === 'yellow',
          'bg-gradient-to-r from-transparent via-status-red/40 to-transparent': card.status === 'red',
          'bg-gradient-to-r from-transparent via-neon-purple/20 to-transparent': card.status === 'unknown',
        }
      )} />

      {/* Header: label + status */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-[0.12em] leading-tight font-mono">
          {card.label}
        </p>
        <span className={clsx(
          'inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider shrink-0',
          `stoplight-${card.status}`
        )}>
          {card.status}
        </span>
      </div>

      {/* Value + trend */}
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className={clsx(
            'text-3xl font-bold tracking-tight',
            {
              'text-ink-primary': card.status === 'unknown',
              'text-status-green': card.status === 'green',
              'text-status-yellow': card.status === 'yellow',
              'text-status-red': card.status === 'red',
            }
          )}
          style={{
            textShadow: card.status === 'green' ? '0 0 20px rgba(52,211,153,0.3)' :
                         card.status === 'yellow' ? '0 0 20px rgba(251,191,36,0.3)' :
                         card.status === 'red' ? '0 0 20px rgba(248,113,113,0.3)' : 'none'
          }}
          >
            {formatValue(card.current_value, card.unit)}
          </p>
          {card.target_value !== null && (
            <p className="text-[10px] text-ink-muted mt-1 font-mono">
              TARGET {formatValue(card.target_value, card.unit)}
            </p>
          )}
        </div>

        {trend && pctChange && (
          <div className={clsx(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold tabular-nums font-mono',
            {
              'bg-[rgba(52,211,153,0.1)] text-status-green border border-[rgba(52,211,153,0.2)]': trend.dir === 'up',
              'bg-[rgba(248,113,113,0.1)] text-status-red border border-[rgba(248,113,113,0.2)]': trend.dir === 'down',
              'bg-[rgba(140,120,255,0.08)] text-ink-muted border border-[rgba(140,120,255,0.15)]': trend.dir === 'flat',
            }
          )}>
            <span className="text-[10px]">{trend.arrow}</span>
            <span>{pctChange}</span>
          </div>
        )}
      </div>

      {/* Sparkline */}
      <div className="mt-auto pt-1">
        <Sparkline data={card.sparkline} status={card.status} />
      </div>
    </div>
  )
}
