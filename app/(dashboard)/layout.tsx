// TEMP: auth bypass for local UI preview
import { SECTION_CONFIG } from '@/types'
import type { MetricSection, UserRole } from '@/types'
import DashboardShell from '@/components/dashboard/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const role: UserRole = 'ceo'
  const visibleSections = (Object.entries(SECTION_CONFIG) as [MetricSection, typeof SECTION_CONFIG[MetricSection]][])
    .filter(([, cfg]) => cfg.visible_to.includes(role))
    .map(([key, cfg]) => ({ key, label: cfg.label }))

  return (
    <DashboardShell
      sections={visibleSections}
      userEmail="craig@hdpm.com"
      role={role}
    >
      {children}
    </DashboardShell>
  )
}
