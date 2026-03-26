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
      <div className="flex items-center gap-2 section-header">
        <span className={clsx(
          'inline-block w-2 h-2 rounded-full',
          {
            'bg-green-500': worst === 'green',
            'bg-yellow-500': worst === 'yellow',
            'bg-red-500': worst === 'red',
            'bg-gray-400': worst === 'unknown',
          }
        )} />
        {label}
      </div>

      {cards.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No metrics available yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(card => (
            <KpiCard key={card.metric_key} card={card} />
          ))}
        </div>
      )}
    </section>
  )
}
