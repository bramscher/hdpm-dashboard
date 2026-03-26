import { createClient } from '@/lib/supabase/server'
import { getKpiCardsForRole, getUserRole } from '@/lib/kpi'
import { redirect } from 'next/navigation'
import { SECTION_CONFIG } from '@/types'
import type { MetricSection, UserRole } from '@/types'
import SectionGroup from '@/components/dashboard/SectionGroup'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = await getUserRole(user.id) ?? 'viewer'
  const cards = await getKpiCardsForRole(role)

  // Group cards by section, preserving config order
  const visibleSections = (Object.entries(SECTION_CONFIG) as [MetricSection, typeof SECTION_CONFIG[MetricSection]][])
    .filter(([, cfg]) => cfg.visible_to.includes(role as UserRole))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">KPI overview across all operations</p>
      </div>

      {visibleSections.map(([section, cfg]) => (
        <SectionGroup
          key={section}
          sectionKey={section}
          label={cfg.label}
          cards={cards.filter(c => c.section === section)}
        />
      ))}
    </div>
  )
}
