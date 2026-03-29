import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { startOfMonth, format } from 'date-fns'

// Vercel cron: runs daily at 6 AM UTC
// Pulls maintenance metrics from PropertyMeld API

const MELD_BASE = 'https://app.propertymeld.com/api/v2'

function meldHeaders() {
  return {
    Authorization: `Api-Key ${process.env.PROPERTYMELD_API_KEY}`,
    Accept: 'application/json',
  }
}

async function meldGet(path: string, params?: Record<string, string>) {
  const url = new URL(`${MELD_BASE}${path}`)
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  }
  const res = await fetch(url.toString(), { headers: meldHeaders() })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PropertyMeld API ${res.status}: ${text}`)
  }
  return res.json()
}

/** Paginate through all results for a given endpoint */
async function meldGetAll(path: string, params?: Record<string, string>): Promise<any[]> {
  const all: any[] = []
  let url: string | null = `${MELD_BASE}${path}`
  const searchParams = new URLSearchParams(params)

  while (url) {
    const fullUrl: string = url.includes('?') ? url : `${url}?${searchParams.toString()}`
    const res: Response = await fetch(fullUrl, { headers: meldHeaders() })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`PropertyMeld API ${res.status}: ${text}`)
    }
    const data: any = await res.json()
    const results = data.results ?? data.data ?? data
    if (Array.isArray(results)) all.push(...results)
    url = data.next ?? null
  }
  return all
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.PROPERTYMELD_API_KEY) {
    return NextResponse.json({ error: 'PropertyMeld API key not configured' }, { status: 500 })
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
      section: 'maintenance',
      value,
      unit,
      source: 'propertymeld',
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
    // Fetch all melds (work orders) created this month
    const melds = await meldGetAll('/melds/', {
      created_after: periodStart,
      created_before: periodEnd,
      organization: process.env.PROPERTYMELD_ORG_ID ?? '',
    })

    // ── avg_days_to_close ─────────────────────────────────────────────────
    const closedMelds = melds.filter((m: any) => m.status === 'completed' || m.status === 'closed')
    let avgDaysToClose = 0
    if (closedMelds.length > 0) {
      const totalDays = closedMelds.reduce((sum: number, m: any) => {
        const created = new Date(m.created_at ?? m.created)
        const closed = new Date(m.completed_at ?? m.closed_at ?? m.updated_at)
        const days = (closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
        return sum + Math.max(0, days)
      }, 0)
      avgDaysToClose = Math.round((totalDays / closedMelds.length) * 10) / 10
    }
    await insertMetric('avg_days_to_close', avgDaysToClose, 'days')

    // ── open_work_orders ──────────────────────────────────────────────────
    // Fetch currently open melds (not filtered by date — current snapshot)
    const openMelds = await meldGetAll('/melds/', {
      status: 'open',
      organization: process.env.PROPERTYMELD_ORG_ID ?? '',
    })
    await insertMetric('open_work_orders', openMelds.length, 'count')

    // ── maintenance_spend_per_unit ────────────────────────────────────────
    // Total spend from closed melds this month, divided by unit count
    const totalSpend = closedMelds.reduce((sum: number, m: any) => {
      return sum + Number(m.total_cost ?? m.actual_cost ?? m.cost ?? 0)
    }, 0)
    // Get unit count from org stats or fall back to melds' unique units
    const uniqueUnits = new Set(melds.map((m: any) => m.unit_id ?? m.property_id).filter(Boolean))
    const unitCount = uniqueUnits.size || 1
    const spendPerUnit = Math.round(totalSpend / unitCount)
    await insertMetric('maintenance_spend_per_unit', spendPerUnit, '$')

    // ── emergency_pct ─────────────────────────────────────────────────────
    const emergencyMelds = melds.filter(
      (m: any) => m.priority === 'emergency' || m.is_emergency === true
    )
    const emergencyPct = melds.length > 0
      ? Math.round((emergencyMelds.length / melds.length) * 1000) / 10
      : 0
    await insertMetric('emergency_pct', emergencyPct, '%')

    return NextResponse.json({
      ok: true,
      inserted,
      stats: { total_melds: melds.length, closed: closedMelds.length, open: openMelds.length },
      errors: errors.length ? errors : undefined,
    })
  } catch (error) {
    console.error('PropertyMeld sync error:', error)
    return NextResponse.json(
      { error: 'Sync failed', detail: String(error), partial_inserts: inserted },
      { status: 500 }
    )
  }
}
