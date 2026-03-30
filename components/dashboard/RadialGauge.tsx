'use client'

import type { StoplightStatus } from '@/types'

const STATUS_COLORS: Record<StoplightStatus, { stroke: string; glow: string; track: string }> = {
  green:   { stroke: '#34d399', glow: 'rgba(52,211,153,0.4)',  track: 'rgba(52,211,153,0.08)' },
  yellow:  { stroke: '#fbbf24', glow: 'rgba(251,191,36,0.4)',  track: 'rgba(251,191,36,0.08)' },
  red:     { stroke: '#f87171', glow: 'rgba(248,113,113,0.4)', track: 'rgba(248,113,113,0.08)' },
  unknown: { stroke: '#6b7280', glow: 'rgba(107,114,128,0.2)', track: 'rgba(107,114,128,0.08)' },
}

interface RadialGaugeProps {
  value: number
  max: number
  label: string
  unit: string | null
  status: StoplightStatus
  subtitle?: string
}

function formatDisplay(value: number, unit: string | null): string {
  if (unit === '$') {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(value >= 100000 ? 0 : 1)}k`
    return `$${value.toLocaleString()}`
  }
  if (unit === '%') return `${value}`
  if (unit === 'days') return `${value}`
  return value.toLocaleString()
}

export default function RadialGauge({ value, max, label, unit, status, subtitle }: RadialGaugeProps) {
  const { stroke, glow, track } = STATUS_COLORS[status]
  const pct = Math.min((value / max) * 100, 100)
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="card card-enter flex flex-col items-center justify-center py-6 px-4 cursor-pointer">
      <div className="relative w-[130px] h-[130px]">
        <svg className="w-full h-full" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            strokeWidth="8"
            stroke={track}
            strokeLinecap="round"
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id={`gauge-${label.replace(/\s/g, '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.6} />
              <stop offset="100%" stopColor={stroke} />
            </linearGradient>
          </defs>
          {/* Fill */}
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            strokeWidth="8"
            stroke={`url(#gauge-${label.replace(/\s/g, '')})`}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              filter: `drop-shadow(0 0 8px ${glow})`,
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-2xl font-extrabold tabular-nums"
            style={{ color: stroke, textShadow: `0 0 16px ${glow}` }}
          >
            {formatDisplay(value, unit)}
          </span>
          {unit && (
            <span className="text-[10px] font-mono text-ink-muted uppercase tracking-widest mt-0.5">
              {unit === '$' ? 'USD' : unit === '%' ? 'PERCENT' : unit}
            </span>
          )}
        </div>
      </div>
      <p className="text-[11px] font-semibold text-ink-secondary uppercase tracking-[0.12em] mt-3 text-center">
        {label}
      </p>
      {subtitle && (
        <p className="text-[10px] text-ink-muted font-mono mt-0.5">{subtitle}</p>
      )}
    </div>
  )
}
