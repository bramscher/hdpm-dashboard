import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/kpi'
import { redirect } from 'next/navigation'
import MetricEntryForm from '@/components/dashboard/MetricEntryForm'
import RecentEntries from '@/components/dashboard/RecentEntries'

export default async function MetricsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = await getUserRole(user.id) ?? 'viewer'
  if (role === 'viewer') redirect('/dashboard')

  // Fetch known metric keys from targets table for autocomplete
  const { data: targets } = await supabase
    .from('hdpm_dash_kpi_targets')
    .select('metric_key')
    .order('metric_key')

  const metricKeys = (targets ?? []).map((t: { metric_key: string }) => t.metric_key)

  // Fetch recent manual entries
  const { data: recentEntries } = await supabase
    .from('hdpm_dash_metric_snapshots')
    .select('*')
    .eq('source', 'manual')
    .order('captured_at', { ascending: false })
    .limit(20)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manual Metric Entry</h1>
        <p className="text-sm text-gray-500 mt-1">
          Enter KPIs for sections without API integrations (growth, retention, people)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MetricEntryForm metricKeys={metricKeys} />
        <RecentEntries entries={recentEntries ?? []} />
      </div>
    </div>
  )
}
