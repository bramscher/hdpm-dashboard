import { createClient } from '@/lib/supabase/server'
import type { KpiCardData, MetricSection, MetricSnapshot, KpiTarget, StoplightStatus, UserRole } from '@/types'
import { SECTION_CONFIG } from '@/types'
import { subDays, formatISO } from 'date-fns'

export function computeStatus(
  value: number,
  target: KpiTarget | undefined
): StoplightStatus {
  if (!target) return 'unknown'
  const { green_threshold, yellow_threshold, direction } = target
  if (direction === 'higher_better') {
    if (value >= green_threshold) return 'green'
    if (value >= yellow_threshold) return 'yellow'
    return 'red'
  } else {
    // lower_better (e.g. vacancy rate, days to close, AR)
    if (value <= green_threshold) return 'green'
    if (value <= yellow_threshold) return 'yellow'
    return 'red'
  }
}

export async function getKpiCardsForRole(role: UserRole): Promise<KpiCardData[]> {
  const supabase = await createClient()

  // Determine which sections this role can see
  const visibleSections = (Object.entries(SECTION_CONFIG) as [MetricSection, typeof SECTION_CONFIG[MetricSection]][])
    .filter(([, cfg]) => cfg.visible_to.includes(role))
    .map(([section]) => section)

  const since90 = formatISO(subDays(new Date(), 90), { representation: 'date' })

  // Fetch snapshots for visible sections
  const { data: snapshots } = await supabase
    .from('hdpm_dash_metric_snapshots')
    .select('*')
    .in('section', visibleSections)
    .gte('captured_at', since90)
    .order('captured_at', { ascending: true })

  // Fetch targets
  const { data: targets } = await supabase
    .from('hdpm_dash_kpi_targets')
    .select('*')

  if (!snapshots) return []

  const targetMap = new Map((targets ?? []).map((t: KpiTarget) => [t.metric_key, t]))

  // Group by metric_key
  const byKey = new Map<string, MetricSnapshot[]>()
  for (const s of snapshots as MetricSnapshot[]) {
    if (!byKey.has(s.metric_key)) byKey.set(s.metric_key, [])
    byKey.get(s.metric_key)!.push(s)
  }

  const cards: KpiCardData[] = []
  for (const [key, snaps] of byKey) {
    const sorted = [...snaps].sort((a, b) =>
      new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime()
    )
    const latest = sorted[sorted.length - 1]
    const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null
    const target = targetMap.get(key)

    cards.push({
      metric_key: key,
      label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      section: latest.section,
      current_value: latest.value,
      previous_value: previous?.value ?? null,
      target_value: target?.target_value ?? null,
      status: computeStatus(latest.value, target),
      unit: latest.unit,
      source: latest.source,
      sparkline: sorted.map(s => ({ date: s.captured_at, value: s.value })),
      last_updated: latest.captured_at,
    })
  }

  return cards
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('hdpm_dash_user_roles')
    .select('role')
    .eq('user_id', userId)
    .single()
  return (data?.role as UserRole) ?? null
}
