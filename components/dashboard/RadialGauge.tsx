'use client'

import type { StoplightStatus } from '@/types'

const STATUS_COLORS: Record<StoplightStatus, { stroke: string; glow: string }> = {
  green:   { stroke: '#34d399', glow: 'rgba(52,211,153,0.35)' },
  yellow:  { stroke: '#fbbf24', glow: 'rgba(251,191,36,0.35)' },
  red:     { stroke: '#f87171', glow: 'rgba(248,113,113,0.35)' },
  unknown: { stroke: '#6b7280', glow: 'rgba(107,114,128,0.2)' },
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
  const { stroke, glow } = STATUS_COLORS[status]
  const pct = Math.min((value / max) * 100, 100)
  const radius = 48
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="card card-enter flex flex-col items-center justify-center py-7 px-4 cursor-pointer group">
      <div className="relative w-[120px] h-[120px]">
        <svg className="w-full h-full" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id={`rg-${label.replace(/\W/g, '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.4} />
              <stop offset="50%" stopColor={stroke} stopOpacity={1} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0.6} />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle
            cx="55" cy="55" r={radius}
            fill="none"
            strokeWidth="4"
            stroke="rgba(255,255,255,0.03)"
            strokeLinecap="round"
          />
          {/* Fill */}
          <circle
            cx="55" cy="55" r={radius}
            fill="none"
            strokeWidth="4"
            stroke={`url(#rg-${label.replace(/\W/g, '')})`}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-[1.5s] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ filter: `drop-shadow(0 0 10px ${glow})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-[22px] font-bold tabular-nums tracking-tight transition-all duration-500 group-hover:scale-105"
            style={{ color: stroke, textShadow: `0 0 20px ${glow}` }}
          >
            {formatDisplay(value, unit)}
          </span>
          {unit && (
            <span className="text-[8px] font-mono text-[#5c5878] uppercase tracking-[0.2em] mt-0.5">
              {unit === '$' ? 'USD' : unit === '%' ? 'PCT' : unit}
            </span>
          )}
        </div>
      </div>
      <p className="text-[10px] font-semibold text-[#a09cb8] uppercase tracking-[0.14em] mt-4 text-center leading-tight">
        {label}
      </p>
      {subtitle && (
        <p className="text-[9px] text-[#5c5878] font-mono mt-1 tracking-wider">{subtitle}</p>
      )}
    </div>
  )
}
