'use client'

import type { KpiCardData, StoplightStatus } from '@/types'

const BAR_COLORS: { bg: string; fill: string; glow: string }[] = [
  { bg: 'rgba(52,211,153,0.08)',  fill: '#34d399', glow: 'rgba(52,211,153,0.3)' },
  { bg: 'rgba(34,211,238,0.08)',  fill: '#22d3ee', glow: 'rgba(34,211,238,0.3)' },
  { bg: 'rgba(167,139,250,0.08)', fill: '#a78bfa', glow: 'rgba(167,139,250,0.3)' },
  { bg: 'rgba(244,114,182,0.08)', fill: '#f472b6', glow: 'rgba(244,114,182,0.3)' },
  { bg: 'rgba(251,191,36,0.08)',  fill: '#fbbf24', glow: 'rgba(251,191,36,0.3)' },
  { bg: 'rgba(251,146,60,0.08)',  fill: '#fb923c', glow: 'rgba(251,146,60,0.3)' },
]

function formatCompact(value: number, unit: string | null): string {
  if (unit === '$') {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`
    return `$${value}`
  }
  if (unit === '%') return `${value}%`
  if (unit === 'days') return `${value}d`
  return `${value}`
}

interface HorizontalBarsProps {
  cards: KpiCardData[]
  title: string
}

export default function HorizontalBars({ cards, title }: HorizontalBarsProps) {
  const maxVal = Math.max(...cards.map(c => c.current_value ?? 0))

  return (
    <div className="card card-enter h-full flex flex-col">
      <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-ink-muted font-mono mb-5">{title}</h3>
      <div className="flex-1 flex flex-col justify-between gap-3">
        {cards.map((card, i) => {
          const pct = maxVal > 0 ? ((card.current_value ?? 0) / maxVal) * 100 : 0
          const colors = BAR_COLORS[i % BAR_COLORS.length]

          return (
            <div key={card.metric_key} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-ink-secondary font-medium truncate">
                  {card.label}
                </span>
                <span
                  className="text-xs font-bold tabular-nums font-mono ml-2 shrink-0"
                  style={{ color: colors.fill, textShadow: `0 0 8px ${colors.glow}` }}
                >
                  {formatCompact(card.current_value ?? 0, card.unit)}
                </span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: colors.bg }}>
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${colors.fill}88, ${colors.fill})`,
                    boxShadow: `0 0 12px ${colors.glow}`,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
