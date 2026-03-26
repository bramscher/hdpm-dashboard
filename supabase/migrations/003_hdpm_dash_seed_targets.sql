-- Seed KPI targets with initial thresholds for HDPM
-- These can be adjusted in the database as business needs evolve

insert into hdpm_dash_kpi_targets (metric_key, green_threshold, yellow_threshold, direction, target_value) values
  -- Portfolio health
  ('occupancy_rate',           95,   90,   'higher_better', 97),
  ('total_units_managed',     500,  400,   'higher_better', 600),
  ('avg_rent_per_unit',      1200, 1000,   'higher_better', 1400),
  ('lease_renewal_rate',       85,   75,   'higher_better', 90),

  -- Financial
  ('monthly_revenue',      150000, 120000, 'higher_better', 175000),
  ('net_operating_income',  80000,  60000, 'higher_better', 100000),
  ('accounts_receivable_days', 15,    25,  'lower_better',  10),
  ('management_fee_pct',       8,     7,   'higher_better', 10),

  -- Maintenance
  ('avg_days_to_close',        5,    10,   'lower_better',   3),
  ('open_work_orders',        20,    40,   'lower_better',  10),
  ('maintenance_spend_per_unit', 50, 100,  'lower_better',  30),
  ('emergency_pct',             5,   10,   'lower_better',   2),

  -- Growth & sales
  ('new_units_this_month',     10,    5,   'higher_better', 15),
  ('pipeline_value',       100000, 50000,  'higher_better', 150000),
  ('avg_days_to_lease',        21,   35,   'lower_better',  14),
  ('marketing_cost_per_lead',  50,   80,   'lower_better',  30),

  -- Owner retention
  ('owner_retention_rate',     95,   90,   'higher_better', 98),
  ('owner_nps_score',          50,   30,   'higher_better', 70),
  ('avg_owner_tenure_months',  36,   24,   'higher_better', 48),

  -- People
  ('employee_count',           25,   20,   'higher_better', 30),
  ('employee_turnover_pct',    10,   20,   'lower_better',   5),
  ('avg_tickets_per_tech',     15,   25,   'lower_better',  10)
on conflict (metric_key) do nothing;
