-- Row-level security for HDPM Dashboard tables

-- Enable RLS on all tables
alter table hdpm_dash_user_roles enable row level security;
alter table hdpm_dash_metric_snapshots enable row level security;
alter table hdpm_dash_kpi_targets enable row level security;
alter table hdpm_dash_alert_rules enable row level security;

-- User roles: users can read their own role
create policy "Users can read own role"
  on hdpm_dash_user_roles for select
  using (auth.uid() = user_id);

-- Metric snapshots: users can read metrics for sections their role can access
-- This uses a function to check section visibility per role
create or replace function hdpm_dash_visible_sections(user_role text)
returns text[] language sql immutable as $$
  select case user_role
    when 'ceo'     then array['portfolio', 'financial', 'maintenance', 'growth', 'retention', 'people']
    when 'manager' then array['portfolio', 'maintenance', 'growth', 'retention']
    when 'viewer'  then array['portfolio']
    else array[]::text[]
  end;
$$;

create policy "Users can read metrics for their visible sections"
  on hdpm_dash_metric_snapshots for select
  using (
    section = any(
      hdpm_dash_visible_sections(
        (select role from hdpm_dash_user_roles where user_id = auth.uid())
      )
    )
  );

-- KPI targets: all authenticated users can read
create policy "Authenticated users can read targets"
  on hdpm_dash_kpi_targets for select
  using (auth.role() = 'authenticated');

-- Alert rules: all authenticated users can read
create policy "Authenticated users can read alert rules"
  on hdpm_dash_alert_rules for select
  using (auth.role() = 'authenticated');

-- Service role bypasses RLS for sync routes (insert/update)
-- No insert/update policies needed for end users — writes happen via service role only
