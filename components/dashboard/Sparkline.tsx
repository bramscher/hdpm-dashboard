'use client'

import { LineChart, Line, ResponsiveContainer, YAxis, Area, AreaChart } from 'recharts'
import type { StoplightStatus } from '@/types'

const STATUS_COLORS: Record<StoplightStatus, { stroke: string; fill: string }> = {
  green:   { stroke: '#34d399', fill: 'url(#sparkGreen)' },
  yellow:  { stroke: '#fbbf24', fill: 'url(#sparkYellow)' },
  red:     { stroke: '#f87171', fill: 'url(#sparkRed)' },
  unknown: { stroke: '#6b7280', fill: 'url(#sparkGray)' },
}

interface SparklineProps {
  data: { date: string; value: number }[]
  status: StoplightStatus
}

export default function Sparkline({ data, status }: SparklineProps) {
  if (data.length < 2) return null

  const { stroke, fill } = STATUS_COLORS[status]

  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="sparkGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="sparkYellow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="sparkRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f87171" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="sparkGray" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6b7280" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#6b7280" stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Area
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={1.5}
            fill={fill}
            dot={false}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
