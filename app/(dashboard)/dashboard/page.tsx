// TEMP: auth bypass with mock data for local UI preview
import { SECTION_CONFIG } from '@/types'
import type { KpiCardData, MetricSection, UserRole } from '@/types'
import HealthSummary from '@/components/dashboard/HealthSummary'
import RadialGauge from '@/components/dashboard/RadialGauge'
import TrendChart from '@/components/dashboard/TrendChart'
import HorizontalBars from '@/components/dashboard/HorizontalBars'
import SectionRings from '@/components/dashboard/SectionRings'
import KpiCard from '@/components/dashboard/KpiCard'

function generateSparkline(base: number, variance: number, points = 30) {
  return Array.from({ length: points }, (_, i) => ({
    date: new Date(Date.now() - (points - i) * 86400000).toISOString(),
    value: base + (Math.sin(i * 0.5) * variance) + (Math.random() * variance * 0.3),
  }))
}

const MOCK_CARDS: KpiCardData[] = [
  // Portfolio
  { metric_key: 'occupancy_rate', label: 'Occupancy Rate', section: 'portfolio', current_value: 94.2, previous_value: 93.8, target_value: 95, status: 'yellow', unit: '%', source: 'appfolio', sparkline: generateSparkline(94, 2), last_updated: new Date().toISOString() },
  { metric_key: 'total_units_managed', label: 'Total Units', section: 'portfolio', current_value: 847, previous_value: 842, target_value: 850, status: 'yellow', unit: 'count', source: 'appfolio', sparkline: generateSparkline(840, 10), last_updated: new Date().toISOString() },
  { metric_key: 'avg_rent_per_unit', label: 'Avg Rent', section: 'portfolio', current_value: 1485, previous_value: 1460, target_value: 1500, status: 'yellow', unit: '$', source: 'appfolio', sparkline: generateSparkline(1470, 30), last_updated: new Date().toISOString() },
  { metric_key: 'lease_renewal_rate', label: 'Lease Renewal', section: 'portfolio', current_value: 78, previous_value: 75, target_value: 80, status: 'yellow', unit: '%', source: 'appfolio', sparkline: generateSparkline(76, 4), last_updated: new Date().toISOString() },
  // Financial
  { metric_key: 'monthly_revenue', label: 'Monthly Revenue', section: 'financial', current_value: 127500, previous_value: 125000, target_value: 130000, status: 'yellow', unit: '$', source: 'quickbooks', sparkline: generateSparkline(126000, 3000), last_updated: new Date().toISOString() },
  { metric_key: 'net_operating_income', label: 'Net Operating Income', section: 'financial', current_value: 68200, previous_value: 65800, target_value: 70000, status: 'yellow', unit: '$', source: 'quickbooks', sparkline: generateSparkline(67000, 2000), last_updated: new Date().toISOString() },
  { metric_key: 'management_fee_pct', label: 'Mgmt Fee %', section: 'financial', current_value: 8.5, previous_value: 8.5, target_value: 8, status: 'green', unit: '%', source: 'quickbooks', sparkline: generateSparkline(8.5, 0.3), last_updated: new Date().toISOString() },
  { metric_key: 'accounts_receivable_days', label: 'AR Days', section: 'financial', current_value: 22, previous_value: 25, target_value: 15, status: 'red', unit: 'days', source: 'quickbooks', sparkline: generateSparkline(23, 3), last_updated: new Date().toISOString() },
  // Maintenance
  { metric_key: 'avg_days_to_close', label: 'Days to Close', section: 'maintenance', current_value: 3.2, previous_value: 3.8, target_value: 3, status: 'yellow', unit: 'days', source: 'propertymeld', sparkline: generateSparkline(3.5, 0.8), last_updated: new Date().toISOString() },
  { metric_key: 'open_work_orders', label: 'Open Work Orders', section: 'maintenance', current_value: 42, previous_value: 48, target_value: 30, status: 'red', unit: 'count', source: 'propertymeld', sparkline: generateSparkline(45, 8), last_updated: new Date().toISOString() },
  { metric_key: 'maintenance_spend_per_unit', label: 'Maint $/Unit', section: 'maintenance', current_value: 85, previous_value: 92, target_value: 75, status: 'yellow', unit: '$', source: 'propertymeld', sparkline: generateSparkline(88, 8), last_updated: new Date().toISOString() },
  { metric_key: 'emergency_pct', label: 'Emergency %', section: 'maintenance', current_value: 8, previous_value: 10, target_value: 5, status: 'yellow', unit: '%', source: 'propertymeld', sparkline: generateSparkline(9, 2), last_updated: new Date().toISOString() },
  // Growth
  { metric_key: 'new_units_this_month', label: 'New Units', section: 'growth', current_value: 5, previous_value: 3, target_value: 8, status: 'yellow', unit: 'count', source: 'manual', sparkline: generateSparkline(4, 2), last_updated: new Date().toISOString() },
  { metric_key: 'pipeline_value', label: 'Pipeline Value', section: 'growth', current_value: 245000, previous_value: 210000, target_value: 300000, status: 'yellow', unit: '$', source: 'manual', sparkline: generateSparkline(220000, 30000), last_updated: new Date().toISOString() },
  { metric_key: 'avg_days_to_lease', label: 'Days to Lease', section: 'growth', current_value: 18, previous_value: 21, target_value: 14, status: 'yellow', unit: 'days', source: 'appfolio', sparkline: generateSparkline(19, 3), last_updated: new Date().toISOString() },
  { metric_key: 'marketing_cost_per_lead', label: 'Cost/Lead', section: 'growth', current_value: 32, previous_value: 35, target_value: 25, status: 'red', unit: '$', source: 'manual', sparkline: generateSparkline(33, 4), last_updated: new Date().toISOString() },
  // Retention
  { metric_key: 'owner_retention_rate', label: 'Owner Retention', section: 'retention', current_value: 96, previous_value: 95, target_value: 95, status: 'green', unit: '%', source: 'manual', sparkline: generateSparkline(95.5, 1), last_updated: new Date().toISOString() },
  { metric_key: 'owner_nps_score', label: 'Owner NPS', section: 'retention', current_value: 72, previous_value: 68, target_value: 70, status: 'green', unit: 'score', source: 'manual', sparkline: generateSparkline(70, 4), last_updated: new Date().toISOString() },
  { metric_key: 'avg_owner_tenure_months', label: 'Avg Tenure', section: 'retention', current_value: 38, previous_value: 37, target_value: 36, status: 'green', unit: 'months', source: 'manual', sparkline: generateSparkline(37, 2), last_updated: new Date().toISOString() },
  // People
  { metric_key: 'employee_count', label: 'Headcount', section: 'people', current_value: 24, previous_value: 23, target_value: 25, status: 'yellow', unit: 'count', source: 'manual', sparkline: generateSparkline(23, 1), last_updated: new Date().toISOString() },
  { metric_key: 'employee_turnover_pct', label: 'Turnover', section: 'people', current_value: 12, previous_value: 15, target_value: 10, status: 'yellow', unit: '%', source: 'manual', sparkline: generateSparkline(13, 2), last_updated: new Date().toISOString() },
  { metric_key: 'avg_tickets_per_tech', label: 'Tickets/Tech', section: 'people', current_value: 8.5, previous_value: 9.2, target_value: 8, status: 'yellow', unit: 'count', source: 'manual', sparkline: generateSparkline(8.8, 1), last_updated: new Date().toISOString() },
]

export default async function DashboardPage() {
  const role: UserRole = 'ceo'
  const cards = MOCK_CARDS

  const visibleSections = (Object.entries(SECTION_CONFIG) as [MetricSection, typeof SECTION_CONFIG[MetricSection]][])
    .filter(([, cfg]) => cfg.visible_to.includes(role))
    .map(([section]) => section)

  // Pick hero metrics for radial gauges
  const heroKeys = ['occupancy_rate', 'monthly_revenue', 'net_operating_income', 'total_units_managed']
  const heroCards = heroKeys.map(k => cards.find(c => c.metric_key === k)!).filter(Boolean)

  // Financial trend lines
  const financialCards = cards.filter(c => c.section === 'financial')

  // Maintenance metrics for horizontal bars
  const maintenanceCards = cards.filter(c => c.section === 'maintenance')

  // Growth cards for individual KPI tiles
  const growthCards = cards.filter(c => c.section === 'growth')

  // Retention + People for secondary bar chart
  const retentionPeopleCards = [...cards.filter(c => c.section === 'retention'), ...cards.filter(c => c.section === 'people')]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-primary tracking-tight">
            Dashboard
            <span className="ml-2 text-sm font-mono font-normal text-neon-cyan/60 tracking-widest">LIVE</span>
          </h1>
          <p className="text-sm text-ink-muted mt-1">KPI overview across all HDPM operations</p>
        </div>
      </div>

      {/* Row 1: Radial Gauges — hero metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {heroCards.map(card => (
          <RadialGauge
            key={card.metric_key}
            value={card.current_value ?? 0}
            max={card.target_value ? card.target_value * 1.15 : (card.current_value ?? 100)}
            label={card.label}
            unit={card.unit}
            status={card.status}
            subtitle={card.target_value ? `Target: ${card.unit === '$' ? '$' : ''}${card.target_value.toLocaleString()}${card.unit === '%' ? '%' : ''}` : undefined}
          />
        ))}
      </div>

      {/* Row 2: Large trend chart + horizontal bar chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <TrendChart
            cards={financialCards.slice(0, 3)}
            title="Financial Trends — 30 Day"
          />
        </div>
        <div className="lg:col-span-2">
          <HorizontalBars
            cards={maintenanceCards}
            title="Maintenance Metrics"
          />
        </div>
      </div>

      {/* Row 3: Growth KPI tiles + Retention/People bars */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 grid grid-cols-2 gap-4">
          {growthCards.map((card, i) => (
            <KpiCard key={card.metric_key} card={card} index={i} />
          ))}
        </div>
        <div className="lg:col-span-2">
          <HorizontalBars
            cards={retentionPeopleCards}
            title="Retention & People"
          />
        </div>
      </div>

      {/* Row 4: Section health rings + summary */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <SectionRings cards={cards} visibleSections={visibleSections} />
        </div>
        <div className="lg:col-span-2">
          <HealthSummary cards={cards} />
        </div>
      </div>
    </div>
  )
}
