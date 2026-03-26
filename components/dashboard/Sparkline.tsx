'use client'

import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'
import type { StoplightStatus } from '@/types'

const STATUS_COLORS: Record<StoplightStatus, string> = {
  green: '#16a34a',
  yellow: '#ca8a04',
  red: '#dc2626',
  unknown: '#9ca3af',
}

interface SparklineProps {
  data: { date: string; value: number }[]
  status: StoplightStatus
}

export default function Sparkline({ data, status }: SparklineProps) {
  if (data.length < 2) return null

  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Line
            type="monotone"
            dataKey="value"
            stroke={STATUS_COLORS[status]}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
