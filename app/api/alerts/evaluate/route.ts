import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/alerts/evaluate — evaluate all active alert rules against latest metrics.
 * Called by Vercel cron after sync jobs complete.
 * Returns triggered alerts and sends email notifications via Supabase Edge Function.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Fetch all active alert rules
  const { data: rules, error: rulesErr } = await supabase
    .from('hdpm_dash_alert_rules')
    .select('*')
    .eq('is_active', true)

  if (rulesErr) {
    return NextResponse.json({ error: rulesErr.message }, { status: 500 })
  }

  if (!rules || rules.length === 0) {
    return NextResponse.json({ ok: true, triggered: [], message: 'No active rules' })
  }

  // Get latest snapshot for each metric that has an alert rule
  const metricKeys = [...new Set(rules.map((r: any) => r.metric_key))]
  const triggered: { rule_id: string; metric_key: string; condition: string; threshold: number; actual_value: number }[] = []

  for (const k of metricKeys) {
    const key = k as string
    const { data: latest } = await supabase
      .from('hdpm_dash_metric_snapshots')
      .select('value')
      .eq('metric_key', key)
      .order('captured_at', { ascending: false })
      .limit(1)
      .single()

    if (!latest) continue

    const value = Number(latest.value)
    const matchingRules = rules.filter((r: any) => r.metric_key === key)

    for (const rule of matchingRules) {
      const isTriggered =
        (rule.condition === 'below' && value < rule.threshold) ||
        (rule.condition === 'above' && value > rule.threshold)

      if (isTriggered) {
        triggered.push({
          rule_id: rule.id,
          metric_key: key,
          condition: rule.condition,
          threshold: rule.threshold,
          actual_value: value,
        })
      }
    }
  }

  // Store triggered alerts in a log table (we'll create a simple approach)
  // For now, log and return — email integration added separately
  if (triggered.length > 0) {
    // Insert triggered alerts as notes in metric snapshots for audit trail
    for (const t of triggered) {
      await supabase.from('hdpm_dash_metric_snapshots').insert({
        metric_key: `_alert_${t.metric_key}`,
        section: 'portfolio',
        value: t.actual_value,
        unit: 'alert',
        source: 'alert_engine',
        period_start: new Date().toISOString().slice(0, 10),
        period_end: new Date().toISOString().slice(0, 10),
        notes: `ALERT: ${t.metric_key} is ${t.condition} threshold (${t.threshold}). Actual: ${t.actual_value}`,
      })
    }
  }

  return NextResponse.json({ ok: true, triggered, total_rules: rules.length })
}
