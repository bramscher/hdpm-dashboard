import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/kpi'
import type { MetricSection } from '@/types'

const VALID_SECTIONS: MetricSection[] = ['portfolio', 'financial', 'maintenance', 'growth', 'retention', 'people']
const VALID_UNITS = ['%', '$', 'days', 'count', 'score', 'months']

/** GET /api/metrics — fetch recent snapshots (auth required) */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = await getUserRole(user.id) ?? 'viewer'
  const section = request.nextUrl.searchParams.get('section')
  const days = parseInt(request.nextUrl.searchParams.get('days') ?? '90', 10)

  const since = new Date()
  since.setDate(since.getDate() - days)

  let query = supabase
    .from('hdpm_dash_metric_snapshots')
    .select('*')
    .gte('captured_at', since.toISOString())
    .order('captured_at', { ascending: false })

  if (section && VALID_SECTIONS.includes(section as MetricSection)) {
    query = query.eq('section', section)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, role })
}

/** POST /api/metrics — manually insert a metric snapshot (ceo/manager only) */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = await getUserRole(user.id) ?? 'viewer'
  if (role === 'viewer') {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const body = await request.json()
  const { metric_key, section, value, unit, period_start, period_end, notes } = body

  // Validate required fields
  if (!metric_key || !section || value === undefined || value === null || !unit || !period_start || !period_end) {
    return NextResponse.json({ error: 'Missing required fields: metric_key, section, value, unit, period_start, period_end' }, { status: 400 })
  }

  if (!VALID_SECTIONS.includes(section)) {
    return NextResponse.json({ error: `Invalid section. Must be one of: ${VALID_SECTIONS.join(', ')}` }, { status: 400 })
  }

  if (!VALID_UNITS.includes(unit)) {
    return NextResponse.json({ error: `Invalid unit. Must be one of: ${VALID_UNITS.join(', ')}` }, { status: 400 })
  }

  const numericValue = Number(value)
  if (isNaN(numericValue)) {
    return NextResponse.json({ error: 'Value must be a number' }, { status: 400 })
  }

  const { data, error } = await supabase.from('hdpm_dash_metric_snapshots').insert({
    metric_key,
    section,
    value: numericValue,
    unit,
    source: 'manual',
    period_start,
    period_end,
    notes: notes ?? null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, data })
}