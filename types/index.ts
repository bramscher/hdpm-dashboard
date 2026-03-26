// ─── User / Auth ────────────────────────────────────────────────────────────

export type UserRole = 'ceo' | 'manager' | 'viewer'

export interface UserRoleRecord {
  user_id: string
  role: UserRole
  display_name: string | null
  created_at: string
}

// ─── KPI / Metrics ───────────────────────────────────────────────────────────

export type MetricSection =
  | 'portfolio'
  | 'financial'
  | 'maintenance'
  | 'growth'
  | 'retention'
  | 'people'

export type StoplightStatus = 'green' | 'yellow' | 'red' | 'unknown'

export interface MetricSnapshot {
  id: string
  metric_key: string
  section: MetricSection
  value: number
  unit: string | null          // '%', 'days', '$', 'count', etc.
  source: string               // 'appfolio' | 'propertymeld' | 'quickbooks' | 'manual'
  captured_at: string          // ISO timestamp
  period_start: string         // ISO date — start of the period this value covers
  period_end: string           // ISO date
  notes: string | null
}

export interface KpiTarget {
  id: string
  metric_key: string
  green_threshold: number
  yellow_threshold: number
  // Values BELOW yellow_threshold are red
  // Direction: 'higher_better' | 'lower_better'
  direction: 'higher_better' | 'lower_better'
  target_value: number | null
  updated_at: string
  updated_by: string | null
}

export interface AlertRule {
  id: string
  metric_key: string
  condition: 'below' | 'above'
  threshold: number
  notify_email: boolean
  is_active: boolean
  created_at: string
}

// ─── Dashboard view types ────────────────────────────────────────────────────

export interface KpiCardData {
  metric_key: string
  label: string
  section: MetricSection
  current_value: number | null
  previous_value: number | null      // prior period for trend arrow
  target_value: number | null
  status: StoplightStatus
  unit: string | null
  source: string
  sparkline: { date: string; value: number }[]  // last 90 days
  last_updated: string | null
}

export interface SectionSummary {
  section: MetricSection
  label: string
  worst_status: StoplightStatus
  metrics: KpiCardData[]
  visible_to: UserRole[]
}

// ─── Section visibility config ───────────────────────────────────────────────

export const SECTION_CONFIG: Record<MetricSection, { label: string; visible_to: UserRole[] }> = {
  portfolio:   { label: 'Portfolio health',     visible_to: ['ceo', 'manager', 'viewer'] },
  maintenance: { label: 'Maintenance',          visible_to: ['ceo', 'manager'] },
  financial:   { label: 'Financial',            visible_to: ['ceo'] },
  growth:      { label: 'Growth & sales',       visible_to: ['ceo', 'manager'] },
  retention:   { label: 'Owner retention',      visible_to: ['ceo', 'manager'] },
  people:      { label: 'People',               visible_to: ['ceo'] },
}
