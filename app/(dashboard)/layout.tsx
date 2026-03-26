import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/kpi'
import { redirect } from 'next/navigation'
import { SECTION_CONFIG } from '@/types'
import type { MetricSection, UserRole } from '@/types'
import Sidebar from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = await getUserRole(user.id) ?? 'viewer'
  const visibleSections = (Object.entries(SECTION_CONFIG) as [MetricSection, typeof SECTION_CONFIG[MetricSection]][])
    .filter(([, cfg]) => cfg.visible_to.includes(role as UserRole))
    .map(([key, cfg]) => ({ key, label: cfg.label }))

  return (
    <div className="flex min-h-screen">
      <Sidebar
        sections={visibleSections}
        userEmail={user.email ?? ''}
        role={role}
      />
      <main className="flex-1 ml-56 p-8 max-w-7xl">
        {children}
      </main>
    </div>
  )
}
