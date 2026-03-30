'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface DonutSegment {
  name: string
  value: number
  color: string
  glow: string
}

interface DonutChartProps {
  data: DonutSegment[]
  title: string
  centerLabel?: string
  centerValue?: string
}

export default function DonutChart({ data, title, centerLabel, centerValue }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="card card-enter h-full flex flex-col">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#5c5878] font-mono mb-4">{title}</h3>

      <div className="flex-1 flex items-center gap-6 min-h-[180px]">
        {/* Donut */}
        <div className="relative w-[160px] h-[160px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {data.map((d, i) => (
                  <filter key={i} id={`glow-${i}`}>
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feFlood floodColor={d.color} floodOpacity="0.4" result="color" />
                    <feComposite in="color" in2="blur" operator="in" result="shadow" />
                    <feMerge>
                      <feMergeNode in="shadow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                ))}
              </defs>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
                animationBegin={200}
                animationDuration={1200}
                animationEasing="ease-out"
              >
                {data.map((d, i) => (
                  <Cell
                    key={d.name}
                    fill={d.color}
                    style={{ filter: `drop-shadow(0 0 8px ${d.glow})` }}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'rgba(18, 16, 42, 0.9)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  backdropFilter: 'blur(12px)',
                  fontSize: '11px',
                  fontFamily: 'Space Mono',
                  color: '#f0eff8',
                  padding: '8px 12px',
                }}
                formatter={(value: number) => [`${value}`, '']}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center text */}
          {centerValue && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-[#f0eff8] tabular-nums">{centerValue}</span>
              {centerLabel && (
                <span className="text-[8px] font-mono text-[#5c5878] uppercase tracking-[0.2em] mt-0.5">{centerLabel}</span>
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          {data.map(d => {
            const pct = total > 0 ? ((d.value / total) * 100).toFixed(0) : '0'
            return (
              <div key={d.name} className="flex items-center gap-3">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: d.color, boxShadow: `0 0 8px ${d.glow}` }}
                />
                <span className="text-[11px] text-[#a09cb8] truncate flex-1">{d.name}</span>
                <span
                  className="text-[11px] font-bold font-mono tabular-nums shrink-0"
                  style={{ color: d.color }}
                >
                  {pct}%
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
