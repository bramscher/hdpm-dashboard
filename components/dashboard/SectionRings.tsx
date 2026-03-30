'use client'

import type { KpiCardData, MetricSection, StoplightStatus } from '@/types'
import { SECTION_CONFIG } from '@/types'

const RING_COLORS: Record<string, { stroke: string; glow: string }> = {
  portfolio:   { stroke: '#34d399', glow: 'rgba(52,211,153,0.4)' },
  financial:   { stroke: '#22d3ee', glow: 'rgba(34,211,238,0.4)' },
  maintenance: { stroke: '#a78bfa', glow: 'rgba(167,139,250,0.4)' },
  growth:      { stroke: '#f472b6', glow: 'rgba(244,114,182,0.4)' },
  retention:   { stroke: '#fbbf24', glow: 'rgba(251,191,36,0.4)' },
  people:      { stroke: '#fb923c', glow: 'rgba(251,146,60,0.4)' },
}

interface SectionRingsProps {
  cards: KpiCardData[]
  visibleSections: MetricSection[]
}

export default function SectionRings({ cards, visibleSections }: SectionRingsProps) {
  return (
    <div className="card card-enter">
      <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-ink-muted font-mono mb-6">
        Section Health
      </h3>
      <div className="flex flex-wrap items-center justify-around gap-6">
        {visibleSections.map(section => {
          const sectionCards = cards.filter(c => c.section === section)
          const greenCount = sectionCards.filter(c => c.status === 'green').length
          const total = sectionCards.length
          const pct = total > 0 ? (greenCount / total) * 100 : 0
          const { stroke, glow } = RING_COLORS[section] ?? RING_COLORS.portfolio
          const label = SECTION_CONFIG[section]?.label ?? section

          const radius = 28
          const circumference = 2 * Math.PI * radius
          const offset = circumference - (pct / 100) * circumference

          return (
            <div key={section} className="flex flex-col items-center gap-2">
              <div className="relative w-[72px] h-[72px]">
                <svg className="w-full h-full" viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="36" cy="36" r={radius}
                    fill="none"
                    strokeWidth="5"
                    stroke="rgba(140,120,255,0.06)"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="36" cy="36" r={radius}
                    fill="none"
                    strokeWidth="5"
                    stroke={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{
                      filter: `drop-shadow(0 0 6px ${glow})`,
                      transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-sm font-extrabold tabular-nums font-mono"
                    style={{ color: stroke, textShadow: `0 0 8px ${glow}` }}
                  >
                    {Math.round(pct)}%
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-ink-muted font-mono text-center leading-tight">
                {label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Timeline dots */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {visibleSections.map((section, i) => {
          const { stroke } = RING_COLORS[section] ?? RING_COLORS.portfolio
          return (
            <div key={section} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: stroke, boxShadow: `0 0 6px ${stroke}` }}
              />
              {i < visibleSections.length - 1 && (
                <div className="w-8 h-[1px] bg-[rgba(140,120,255,0.15)]" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
