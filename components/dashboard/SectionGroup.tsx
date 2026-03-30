import type { KpiCardData, StoplightStatus } from '@/types'
import KpiCard from './KpiCard'
import clsx from 'clsx'

function worstStatus(cards: KpiCardData[]): StoplightStatus {
  const priority: StoplightStatus[] = ['red', 'yellow', 'unknown', 'green']
  for (const s of priority) {
    if (cards.some(c => c.status === s)) return s
  }
  return 'unknown'
}

interface SectionGroupProps {
  label: string
  sectionKey: string
  cards: KpiCardData[]
}

export default function SectionGroup({ label, sectionKey, cards }: SectionGroupProps) {
  const worst = worstStatus(cards)

  return (
    <section id={sectionKey}>
      <div className="flex items-center gap-3 section-header">
        <span className={clsx(
          'inline-block w-2 h-2 rounded-full shrink-0',
          `status-dot-${worst}`
        )} />
        <span>{label}</span>
        <span className="text-ink-muted/50 text-[10px] ml-1">
          {cards.length} {cards.length === 1 ? 'metric' : 'metrics'}
        </span>
      </div>

      {cards.length === 0 ? (
        <div className="card">
          <p className="text-sm text-ink-muted italic">No metrics available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <KpiCard key={card.metric_key} card={card} index={i} />
          ))}
        </div>
      )}
    </section>
  )
}
