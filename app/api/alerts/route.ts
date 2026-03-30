import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/kpi'

/** GET /api/alerts — list all alert rules */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = await getUserRole(user.id) ?? 'viewer'
  if (role === 'viewer') {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('hdpm_dash_alert_rules')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}

/** POST /api/alerts — create a new alert rule */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = await getUserRole(user.id) ?? 'viewer'
  if (role !== 'ceo') {
    return NextResponse.json({ error: 'Only CEO can manage alerts' }, { status: 403 })
  }

  const body = await request.json()
  const { metric_key, condition, threshold, notify_email } = body

  if (!metric_key || !condition || threshold === undefined) {
    return NextResponse.json({ error: 'Missing required fields: metric_key, condition, threshold' }, { status: 400 })
  }

  if (!['below', 'above'].includes(condition)) {
    return NextResponse.json({ error: 'Condition must be "below" or "above"' }, { status: 400 })
  }

  const { data, error } = await supabase.from('hdpm_dash_alert_rules').insert({
    metric_key,
    condition,
    threshold: Number(threshold),
    notify_email: notify_email ?? true,
    is_active: true,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, data })
}

/** PATCH /api/alerts — update an alert rule (toggle active, update threshold) */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = await getUserRole(user.id) ?? 'viewer'
  if (role !== 'ceo') {
    return NextResponse.json({ error: 'Only CEO can manage alerts' }, { status: 403 })
  }

  const body = await request.json()
  const { id, ...updates } = body

  if (!id) {
    return NextResponse.json({ error: 'Missing alert rule id' }, { status: 400 })
  }

  // Only allow specific fields to be updated
  const allowed: Record<string, unknown> = {}
  if ('is_active' in updates) allowed.is_active = updates.is_active
  if ('threshold' in updates) allowed.threshold = Number(updates.threshold)
  if ('condition' in updates) allowed.condition = updates.condition
  if ('notify_email' in updates) allowed.notify_email = updates.notify_email

  const { data, error } = await supabase
    .from('hdpm_dash_alert_rules')
    .update(allowed)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, data })
}

/** DELETE /api/alerts — delete an alert rule */
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = await getUserRole(user.id) ?? 'viewer'
  if (role !== 'ceo') {
    return NextResponse.json({ error: 'Only CEO can manage alerts' }, { status: 403 })
  }

  const { id } = await request.json()
  if (!id) {
    return NextResponse.json({ error: 'Missing alert rule id' }, { status: 400 })
  }

  const { error } = await supabase
    .from('hdpm_dash_alert_rules')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}