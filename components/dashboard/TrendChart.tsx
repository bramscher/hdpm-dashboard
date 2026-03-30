'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { KpiCardData } from '@/types'

interface TrendChartProps {
  cards: KpiCardData[]
  title: string
}

const SERIES_COLORS = [
  { stroke: '#34d399', fill: 'rgba(52,211,153,0.15)' },
  { stroke: '#22d3ee', fill: 'rgba(34,211,238,0.12)' },
  { stroke: '#a78bfa', fill: 'rgba(167,139,250,0.12)' },
  { stroke: '#fbbf24', fill: 'rgba(251,191,36,0.10)' },
]

export default function TrendChart({ cards, title }: TrendChartProps) {
  // Merge sparkline data from multiple cards into a unified timeline
  const dateMap = new Map<string, Record<string, number>>()

  cards.forEach((card, idx) => {
    for (const point of card.sparkline) {
      const date = point.date.slice(0, 10)
      if (!dateMap.has(date)) dateMap.set(date, {})
      dateMap.get(date)![`s${idx}`] = point.value
    }
  })

  const data = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({ date, ...values }))

  return (
    <div className="card card-enter h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-ink-muted font-mono">{title}</h3>
        <div className="flex items-center gap-3">
          {cards.map((card, i) => (
            <span key={card.metric_key} className="flex items-center gap-1.5 text-[10px] text-ink-muted">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: SERIES_COLORS[i % SERIES_COLORS.length].stroke,
                  boxShadow: `0 0 4px ${SERIES_COLORS[i % SERIES_COLORS.length].stroke}`,
                }}
              />
              {card.label}
            </span>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              {cards.map((_, i) => (
                <linearGradient key={i} id={`trendFill${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={SERIES_COLORS[i % SERIES_COLORS.length].stroke} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={SERIES_COLORS[i % SERIES_COLORS.length].stroke} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,120,255,0.06)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#5f5b7a', fontSize: 10, fontFamily: 'Space Mono' }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(140,120,255,0.1)' }}
              tickFormatter={(d: string) => {
                const date = new Date(d)
                return `${date.getMonth() + 1}/${date.getDate()}`
              }}
              interval={Math.floor(data.length / 6)}
            />
            <YAxis
              tick={{ fill: '#5f5b7a', fontSize: 10, fontFamily: 'Space Mono' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(22, 20, 50, 0.9)',
                border: '1px solid rgba(140,120,255,0.2)',
                borderRadius: '12px',
                backdropFilter: 'blur(12px)',
                fontSize: '11px',
                fontFamily: 'Space Mono',
                color: '#eeedf5',
              }}
              labelFormatter={(d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            {cards.map((card, i) => (
              <Area
                key={card.metric_key}
                type="monotone"
                dataKey={`s${i}`}
                name={card.label}
                stroke={SERIES_COLORS[i % SERIES_COLORS.length].stroke}
                fill={`url(#trendFill${i})`}
                strokeWidth={2}
                dot={false}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
