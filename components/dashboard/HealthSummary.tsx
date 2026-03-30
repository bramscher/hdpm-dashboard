import type { KpiCardData, StoplightStatus } from '@/types'
import clsx from 'clsx'

interface HealthSummaryProps {
  cards: KpiCardData[]
}

export default function HealthSummary({ cards }: HealthSummaryProps) {
  const counts: Record<StoplightStatus, number> = { green: 0, yellow: 0, red: 0, unknown: 0 }
  for (const c of cards) counts[c.status]++

  const total = cards.length
  const lastUpdated = cards.reduce((latest, c) => {
    if (!c.last_updated) return latest
    return !latest || c.last_updated > latest ? c.last_updated : latest
  }, '' as string)

  const overallStatus: StoplightStatus =
    counts.red > 0 ? 'red' :
    counts.yellow > 0 ? 'yellow' :
    counts.green > 0 ? 'green' : 'unknown'

  const statusLabel: Record<StoplightStatus, string> = {
    green: 'All Clear',
    yellow: 'Needs Attention',
    red: 'Action Required',
    unknown: 'Awaiting Data',
  }

  return (
    <div className="card flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
      {/* Overall health */}
      <div className="flex items-center gap-3">
        <div className={clsx(
          'w-10 h-10 rounded-full flex items-center justify-center',
          {
            'bg-green-100': overallStatus === 'green',
            'bg-yellow-100': overallStatus === 'yellow',
            'bg-red-100': overallStatus === 'red',
            'bg-gray-100': overallStatus === 'unknown',
          }
        )}>
          <div className={clsx(
            'w-4 h-4 rounded-full',
            {
              'bg-green-500': overallStatus === 'green',
              'bg-yellow-500': overallStatus === 'yellow',
              'bg-red-500': overallStatus === 'red',
              'bg-gray-400': overallStatus === 'unknown',
            }
          )} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{statusLabel[overallStatus]}</p>
          <p className="text-xs text-gray-500">{total} metrics tracked</p>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="flex items-center gap-4 text-sm">
        {counts.green > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-600">{counts.green} green</span>
          </span>
        )}
        {counts.yellow > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-gray-600">{counts.yellow} yellow</span>
          </span>
        )}
        {counts.red > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-gray-600">{counts.red} red</span>
          </span>
        )}
        {counts.unknown > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="text-gray-600">{counts.unknown} pending</span>
          </span>
        )}
      </div>

      {/* Last sync */}
      {lastUpdated && (
        <div className="sm:ml-auto text-xs text-gray-400">
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  )
}
