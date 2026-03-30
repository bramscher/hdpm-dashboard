import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/kpi'
import { redirect } from 'next/navigation'
import AlertsManager from '@/components/dashboard/AlertsManager'

export default async function AlertsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = await getUserRole(user.id) ?? 'viewer'
  if (role === 'viewer') redirect('/dashboard')

  // Fetch existing alert rules
  const { data: rules } = await supabase
    .from('hdpm_dash_alert_rules')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch metric keys for the create form
  const { data: targets } = await supabase
    .from('hdpm_dash_kpi_targets')
    .select('metric_key')
    .order('metric_key')

  const metricKeys = (targets ?? []).map((t: { metric_key: string }) => t.metric_key)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Alert Rules</h1>
        <p className="text-sm text-gray-500 mt-1">
          Get notified when KPIs cross critical thresholds
        </p>
      </div>

      <AlertsManager
        initialRules={rules ?? []}
        metricKeys={metricKeys}
        isCeo={role === 'ceo'}
      />
    </div>
  )
}
