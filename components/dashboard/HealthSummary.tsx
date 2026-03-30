'use client'

import type { KpiCardData, StoplightStatus } from '@/types'
import clsx from 'clsx'

interface HealthSummaryProps {
  cards: KpiCardData[]
}

function RingProgress({ value, color, glowColor, label, count }: {
  value: number
  color: string
  glowColor: string
  label: string
  count: number
}) {
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="ring-progress w-full h-full" viewBox="0 0 80 80">
          <circle
            className="ring-track"
            cx="40" cy="40" r={radius}
            fill="none"
            strokeWidth="5"
          />
          <circle
            className="ring-fill"
            cx="40" cy="40" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold font-mono" style={{ color, textShadow: `0 0 10px ${glowColor}` }}>
            {Math.round(value)}%
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] font-mono" style={{ color }}>
          {label}
        </p>
        <p className="text-[10px] text-ink-muted mt-0.5">{count} metrics</p>
      </div>
    </div>
  )
}

export default function HealthSummary({ cards }: HealthSummaryProps) {
  const counts: Record<StoplightStatus, number> = { green: 0, yellow: 0, red: 0, unknown: 0 }
  for (const c of cards) counts[c.status]++

  const total = cards.length
  const lastUpdated = cards.reduce((latest, c) => {
    if (!c.last_updated) return latest
    return !latest || c.last_updated > latest ? c.last_updated : latest
  }, '' as string)

  const overallStatus: StoplightStatus =
    counts.red > 0 ? 'red' :
    counts.yellow > 0 ? 'yellow' :
    counts.green > 0 ? 'green' : 'unknown'

  const statusLabel: Record<StoplightStatus, string> = {
    green: 'ALL SYSTEMS CLEAR',
    yellow: 'NEEDS ATTENTION',
    red: 'ACTION REQUIRED',
    unknown: 'AWAITING DATA',
  }

  return (
    <div className="card relative overflow-hidden animate-fade-in">
      {/* Top gradient accent */}
      <div className={clsx(
        'absolute top-0 left-0 right-0 h-[2px]',
        {
          'bg-gradient-to-r from-status-green/0 via-status-green to-status-green/0': overallStatus === 'green',
          'bg-gradient-to-r from-status-yellow/0 via-status-yellow to-status-yellow/0': overallStatus === 'yellow',
          'bg-gradient-to-r from-status-red/0 via-status-red to-status-red/0': overallStatus === 'red',
          'bg-gradient-to-r from-ink-muted/0 via-ink-muted to-ink-muted/0': overallStatus === 'unknown',
        }
      )} />

      <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
        {/* Overall status */}
        <div className="flex items-center gap-4">
          <div className={clsx(
            'w-3 h-3 rounded-full shrink-0',
            `status-dot-${overallStatus}`
          )} />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] font-mono text-ink-primary">
              {statusLabel[overallStatus]}
            </p>
            <p className="text-[11px] text-ink-muted mt-0.5">
              {total} metrics tracked across {Object.values(counts).filter(v => v > 0).length} status levels
            </p>
          </div>
        </div>

        {/* Ring indicators */}
        <div className="flex items-center gap-6 lg:gap-8">
          {counts.green > 0 && (
            <RingProgress
              value={(counts.green / total) * 100}
              color="#34d399"
              glowColor="rgba(52,211,153,0.4)"
              label="Green"
              count={counts.green}
            />
          )}
          {counts.yellow > 0 && (
            <RingProgress
              value={(counts.yellow / total) * 100}
              color="#fbbf24"
              glowColor="rgba(251,191,36,0.4)"
              label="Caution"
              count={counts.yellow}
            />
          )}
          {counts.red > 0 && (
            <RingProgress
              value={(counts.red / total) * 100}
              color="#f87171"
              glowColor="rgba(248,113,113,0.4)"
              label="Critical"
              count={counts.red}
            />
          )}
        </div>

        {/* Last sync */}
        {lastUpdated && (
          <div className="lg:ml-auto text-right">
            <p className="text-[9px] text-ink-muted uppercase tracking-[0.2em] font-mono">Last Sync</p>
            <p className="text-xs text-ink-secondary mt-1 tabular-nums font-mono">
              {new Date(lastUpdated).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
