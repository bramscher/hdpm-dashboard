import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { startOfMonth, format } from 'date-fns'

// Vercel cron: runs daily at 6 AM UTC
// Pulls financial metrics from QuickBooks Online API (supplements AppFolio financials)

const QB_BASE = 'https://quickbooks.api.intuit.com'

/**
 * QuickBooks uses OAuth 2.0. We store a long-lived refresh token in env vars
 * and exchange it for a short-lived access token on each sync run.
 * The new refresh token is persisted back to Supabase so it stays fresh.
 */
async function getAccessToken(supabase: any): Promise<string> {
  // First check if we have a cached token that hasn't expired
  const { data: tokenRow } = await supabase
    .from('hdpm_dash_metric_snapshots')
    .select('notes')
    .eq('metric_key', '_qb_token_cache')
    .order('captured_at', { ascending: false })
    .limit(1)
    .single()

  // Always refresh — tokens are short-lived (1 hour)
  const credentials = Buffer.from(
    `${process.env.QUICKBOOKS_CLIENT_ID}:${process.env.QUICKBOOKS_CLIENT_SECRET}`
  ).toString('base64')

  const refreshToken = process.env.QUICKBOOKS_REFRESH_TOKEN
  if (!refreshToken) throw new Error('QUICKBOOKS_REFRESH_TOKEN not set')

  const res = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`QuickBooks token refresh failed ${res.status}: ${text}`)
  }

  const tokens = await res.json()

  // Log new refresh token — in production, persist this securely
  // (Vercel env vars can be updated via API, or store in Supabase)
  if (tokens.refresh_token && tokens.refresh_token !== refreshToken) {
    console.log('QuickBooks refresh token rotated — update QUICKBOOKS_REFRESH_TOKEN env var')
  }

  return tokens.access_token
}

async function qbQuery(accessToken: string, query: string): Promise<any> {
  const realmId = process.env.QUICKBOOKS_REALM_ID
  if (!realmId) throw new Error('QUICKBOOKS_REALM_ID not set')

  const url = `${QB_BASE}/v3/company/${realmId}/query?query=${encodeURIComponent(query)}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`QuickBooks query failed ${res.status}: ${text}`)
  }

  return res.json()
}

async function qbReport(accessToken: string, reportName: string, params: Record<string, string>): Promise<any> {
  const realmId = process.env.QUICKBOOKS_REALM_ID
  if (!realmId) throw new Error('QUICKBOOKS_REALM_ID not set')

  const url = new URL(`${QB_BASE}/v3/company/${realmId}/reports/${reportName}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`QuickBooks report failed ${res.status}: ${text}`)
  }

  return res.json()
}

/** Extract a summary value from a QBO report by row title */
function extractReportValue(report: any, rowTitle: string): number {
  const rows = report?.Rows?.Row ?? []
  for (const row of rows) {
    const header = row?.Header?.ColData?.[0]?.value ?? row?.Summary?.ColData?.[0]?.value ?? ''
    if (header.toLowerCase().includes(rowTitle.toLowerCase())) {
      const val = row?.Summary?.ColData?.[1]?.value ?? row?.Header?.ColData?.[1]?.value
      return Number(val) || 0
    }
    // Check sub-rows
    if (row?.Rows?.Row) {
      for (const sub of row.Rows.Row) {
        const subHeader = sub?.ColData?.[0]?.value ?? ''
        if (subHeader.toLowerCase().includes(rowTitle.toLowerCase())) {
          return Number(sub?.ColData?.[1]?.value) || 0
        }
      }
    }
  }
  return 0
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.QUICKBOOKS_CLIENT_ID || !process.env.QUICKBOOKS_CLIENT_SECRET || !process.env.QUICKBOOKS_REALM_ID) {
    return NextResponse.json({ error: 'QuickBooks credentials not configured' }, { status: 500 })
  }

  const supabase = createServiceClient()
  const now = new Date()
  const periodStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const periodEnd = format(now, 'yyyy-MM-dd')
  const errors: string[] = []
  const inserted: string[] = []

  async function insertMetric(metric_key: string, value: number, unit: string) {
    const { error } = await supabase.from('hdpm_dash_metric_snapshots').insert({
      metric_key,
      section: 'financial',
      value,
      unit,
      source: 'quickbooks',
      period_start: periodStart,
      period_end: periodEnd,
    })
    if (error) {
      errors.push(`${metric_key}: ${error.message}`)
    } else {
      inserted.push(metric_key)
    }
  }

  try {
    const accessToken = await getAccessToken(supabase)

    // ── Profit & Loss report ──────────────────────────────────────────────
    const pnl = await qbReport(accessToken, 'ProfitAndLoss', {
      start_date: periodStart,
      end_date: periodEnd,
      accounting_method: 'Accrual',
    })

    const totalIncome = extractReportValue(pnl, 'Total Income') || extractReportValue(pnl, 'Gross Profit')
    const totalExpenses = extractReportValue(pnl, 'Total Expenses')
    const netIncome = extractReportValue(pnl, 'Net Income') || (totalIncome - totalExpenses)

    await insertMetric('monthly_revenue', Math.round(totalIncome), '$')
    await insertMetric('net_operating_income', Math.round(netIncome), '$')

    // ── Accounts Receivable aging ─────────────────────────────────────────
    const arAging = await qbReport(accessToken, 'AgedReceivableDetail', {
      report_date: periodEnd,
    })

    // Compute weighted average days outstanding from AR aging buckets
    const arRows = arAging?.Rows?.Row ?? []
    let totalAR = 0
    let weightedDays = 0
    const bucketDays: Record<string, number> = {
      'current': 7, '1 - 30': 15, '31 - 60': 45, '61 - 90': 75, '91 and over': 120,
    }
    for (const row of arRows) {
      if (row?.Summary?.ColData) {
        const cols = row.Summary.ColData
        const bucket = cols[0]?.value?.toLowerCase() ?? ''
        const amount = Number(cols[cols.length - 1]?.value) || 0
        const days = Object.entries(bucketDays).find(([k]) => bucket.includes(k))?.[1] ?? 0
        totalAR += amount
        weightedDays += amount * days
      }
    }
    const avgARDays = totalAR > 0 ? Math.round(weightedDays / totalAR) : 0
    await insertMetric('accounts_receivable_days', avgARDays, 'days')

    return NextResponse.json({
      ok: true,
      inserted,
      errors: errors.length ? errors : undefined,
    })
  } catch (error) {
    console.error('QuickBooks sync error:', error)
    return NextResponse.json(
      { error: 'Sync failed', detail: String(error), partial_inserts: inserted },
      { status: 500 }
    )
  }
}
