import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Vercel cron: runs daily to pull maintenance metrics from PropertyMeld
// Configure in vercel.json: { "crons": [{ "path": "/api/sync/propertymeld", "schedule": "0 6 * * *" }] }

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()

    // TODO: Replace with actual PropertyMeld API calls
    // PropertyMeld API docs: https://developer.propertymeld.com
    //
    // Metrics to pull:
    // - avg_days_to_close (section: maintenance)
    // - open_work_orders (section: maintenance)
    // - maintenance_spend_per_unit (section: maintenance)
    // - emergency_pct (section: maintenance)
    //
    // For each metric:
    // const { error } = await supabase
    //   .from('hdpm_dash_metric_snapshots')
    //   .insert({
    //     metric_key: 'avg_days_to_close',
    //     section: 'maintenance',
    //     value: 4.2,
    //     unit: 'days',
    //     source: 'propertymeld',
    //     period_start: '2026-03-01',
    //     period_end: '2026-03-25',
    //   })

    return NextResponse.json({ ok: true, message: 'PropertyMeld sync not yet configured' })
  } catch (error) {
    console.error('PropertyMeld sync error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
