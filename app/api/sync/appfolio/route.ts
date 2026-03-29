import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

// Vercel cron: runs daily at 6 AM UTC
// Pulls portfolio + financial metrics from AppFolio API

const APPFOLIO_BASE = () =>
  `https://${process.env.APPFOLIO_SUBDOMAIN}.appfolio.com/api/v1`

function appfolioHeaders() {
  const credentials = Buffer.from(
    `${process.env.APPFOLIO_CLIENT_ID}:${process.env.APPFOLIO_CLIENT_SECRET}`
  ).toString('base64')
  return {
    Authorization: `Basic ${credentials}`,
    Accept: 'application/json',
  }
}

async function appfolioGet(path: string, params?: Record<string, string>) {
  const url = new URL(`${APPFOLIO_BASE()}${path}`)
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  }
  const res = await fetch(url.toString(), { headers: appfolioHeaders() })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`AppFolio API ${res.status}: ${text}`)
  }
  return res.json()
}

// ─── Metric computation helpers ─────────────────────────────────────────────

function computeOccupancyRate(units: any[]): number {
  if (!units.length) return 0
  const occupied = units.filter((u: any) => u.status === 'occupied').length
  return Math.round((occupied / units.length) * 1000) / 10
}

function computeAvgRent(units: any[]): number {
  const rented = units.filter((u: any) => u.market_rent != null && u.market_rent > 0)
  if (!rented.length) return 0
  const total = rented.reduce((sum: number, u: any) => sum + Number(u.market_rent), 0)
  return Math.round(total / rented.length)
}

function computeLeaseRenewalRate(leases: any[]): number {
  if (!leases.length) return 0
  const renewed = leases.filter((l: any) => l.renewal === true || l.status === 'renewed').length
  return Math.round((renewed / leases.length) * 1000) / 10
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Ensure required env vars are set
  if (!process.env.APPFOLIO_CLIENT_ID || !process.env.APPFOLIO_CLIENT_SECRET || !process.env.APPFOLIO_SUBDOMAIN) {
    return NextResponse.json({ error: 'AppFolio credentials not configured' }, { status: 500 })
  }

  const supabase = createServiceClient()
  const now = new Date()
  const periodStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const periodEnd = format(now, 'yyyy-MM-dd')
  const errors: string[] = []
  const inserted: string[] = []

  async function insertMetric(metric_key: string, section: string, value: number, unit: string) {
    const { error } = await supabase.from('hdpm_dash_metric_snapshots').insert({
      metric_key,
      section,
      value,
      unit,
      source: 'appfolio',
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
    // ── Portfolio metrics ──────────────────────────────────────────────────

    // Rent roll gives us unit-level occupancy and rent data
    const rentRoll = await appfolioGet('/reports/rent_roll.json')
    const units: any[] = rentRoll.results ?? rentRoll.data ?? []

    await insertMetric('occupancy_rate', 'portfolio', computeOccupancyRate(units), '%')
    await insertMetric('total_units_managed', 'portfolio', units.length, 'count')
    await insertMetric('avg_rent_per_unit', 'portfolio', computeAvgRent(units), '$')

    // Lease renewal rate — pull leases expiring in the prior month window
    const priorMonthStart = format(startOfMonth(subMonths(now, 1)), 'yyyy-MM-dd')
    const priorMonthEnd = format(endOfMonth(subMonths(now, 1)), 'yyyy-MM-dd')
    const leases = await appfolioGet('/reports/leases.json', {
      lease_expiration_start: priorMonthStart,
      lease_expiration_end: priorMonthEnd,
    })
    const leaseData: any[] = leases.results ?? leases.data ?? []
    await insertMetric('lease_renewal_rate', 'portfolio', computeLeaseRenewalRate(leaseData), '%')

    // ── Financial metrics ─────────────────────────────────────────────────

    // Owner statement / income report for revenue and NOI
    const income = await appfolioGet('/reports/income_statement.json', {
      period_start: periodStart,
      period_end: periodEnd,
    })

    const totalRevenue = Number(income.total_income ?? income.gross_income ?? 0)
    const totalExpenses = Number(income.total_expenses ?? income.operating_expenses ?? 0)
    const noi = totalRevenue - totalExpenses

    await insertMetric('monthly_revenue', 'financial', Math.round(totalRevenue), '$')
    await insertMetric('net_operating_income', 'financial', Math.round(noi), '$')

    // Management fee percentage — fees / revenue
    const mgmtFees = Number(income.management_fees ?? 0)
    const feePct = totalRevenue > 0
      ? Math.round((mgmtFees / totalRevenue) * 1000) / 10
      : 0
    await insertMetric('management_fee_pct', 'financial', feePct, '%')

    // Accounts receivable aging
    const aging = await appfolioGet('/reports/aged_receivables_summary.json')
    const arDays = Number(aging.weighted_average_days ?? aging.average_days_outstanding ?? 0)
    await insertMetric('accounts_receivable_days', 'financial', Math.round(arDays), 'days')

    return NextResponse.json({
      ok: true,
      inserted,
      errors: errors.length ? errors : undefined,
    })
  } catch (error) {
    console.error('AppFolio sync error:', error)
    return NextResponse.json(
      { error: 'Sync failed', detail: String(error), partial_inserts: inserted },
      { status: 500 }
    )
  }
}
