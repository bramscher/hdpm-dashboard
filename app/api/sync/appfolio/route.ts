import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Vercel cron: runs daily to pull portfolio + financial metrics from AppFolio
// Configure in vercel.json: { "crons": [{ "path": "/api/sync/appfolio", "schedule": "0 6 * * *" }] }

export async function GET(request: NextRequest) {
  // Verify cron secret in production
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()

    // TODO: Replace with actual AppFolio API calls
    // AppFolio API docs: https://help.appfolio.com/s/article/API-Overview
    //
    // Metrics to pull:
    // - occupancy_rate (section: portfolio)
    // - total_units_managed (section: portfolio)
    // - avg_rent_per_unit (section: portfolio)
    // - lease_renewal_rate (section: portfolio)
    // - monthly_revenue (section: financial)
    // - net_operating_income (section: financial)
    // - accounts_receivable_days (section: financial)
    // - management_fee_pct (section: financial)
    //
    // For each metric:
    // const { error } = await supabase
    //   .from('hdpm_dash_metric_snapshots')
    //   .insert({
    //     metric_key: 'occupancy_rate',
    //     section: 'portfolio',
    //     value: 96.5,
    //     unit: '%',
    //     source: 'appfolio',
    //     period_start: '2026-03-01',
    //     period_end: '2026-03-25',
    //   })

    return NextResponse.json({ ok: true, message: 'AppFolio sync not yet configured' })
  } catch (error) {
    console.error('AppFolio sync error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
