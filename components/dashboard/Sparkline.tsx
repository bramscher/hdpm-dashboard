'use client'

import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts'
import type { StoplightStatus } from '@/types'

const STATUS_COLORS: Record<StoplightStatus, { stroke: string; id: string; color: string }> = {
  green:   { stroke: '#34d399', id: 'spkGreen',  color: '52,211,153' },
  yellow:  { stroke: '#fbbf24', id: 'spkYellow', color: '251,191,36' },
  red:     { stroke: '#f87171', id: 'spkRed',    color: '248,113,113' },
  unknown: { stroke: '#6b7280', id: 'spkGray',   color: '107,114,128' },
}

interface SparklineProps {
  data: { date: string; value: number }[]
  status: StoplightStatus
}

export default function Sparkline({ data, status }: SparklineProps) {
  if (data.length < 2) return null

  const { stroke, id, color } = STATUS_COLORS[status]

  return (
    <div className="h-14 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={`rgb(${color})`} stopOpacity={0.2} />
              <stop offset="100%" stopColor={`rgb(${color})`} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Area
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={1.5}
            fill={`url(#${id})`}
            dot={false}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
