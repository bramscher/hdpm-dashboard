import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/kpi'
import { redirect } from 'next/navigation'
import { SECTION_CONFIG } from '@/types'
import type { MetricSection, UserRole } from '@/types'
import DashboardShell from '@/components/dashboard/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = await getUserRole(user.id) ?? 'viewer'
  const visibleSections = (Object.entries(SECTION_CONFIG) as [MetricSection, typeof SECTION_CONFIG[MetricSection]][])
    .filter(([, cfg]) => cfg.visible_to.includes(role as UserRole))
    .map(([key, cfg]) => ({ key, label: cfg.label }))

  return (
    <DashboardShell
      sections={visibleSections}
      userEmail={user.email ?? ''}
      role={role}
    >
      {children}
    </DashboardShell>
  )
}
