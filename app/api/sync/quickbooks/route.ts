import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Vercel cron: runs daily to pull financial metrics from QuickBooks
// Configure in vercel.json: { "crons": [{ "path": "/api/sync/quickbooks", "schedule": "0 6 * * *" }] }

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()

    // TODO: Replace with actual QuickBooks API calls
    // QuickBooks API: uses OAuth 2.0, query via /v3/company/{companyId}/query
    //
    // Metrics to pull (supplement AppFolio financials):
    // - monthly_revenue (section: financial) — cross-check with AppFolio
    // - net_operating_income (section: financial)
    // - accounts_receivable_days (section: financial)
    //
    // For each metric:
    // const { error } = await supabase
    //   .from('hdpm_dash_metric_snapshots')
    //   .insert({
    //     metric_key: 'monthly_revenue',
    //     section: 'financial',
    //     value: 162000,
    //     unit: '$',
    //     source: 'quickbooks',
    //     period_start: '2026-03-01',
    //     period_end: '2026-03-25',
    //   })

    return NextResponse.json({ ok: true, message: 'QuickBooks sync not yet configured' })
  } catch (error) {
    console.error('QuickBooks sync error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
