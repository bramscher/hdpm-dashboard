-- HDPM Dashboard schema
-- All tables namespaced with hdpm_dash_ to coexist with hdpm-web tables

-- User roles
create table if not exists hdpm_dash_user_roles (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  role     text not null default 'viewer' check (role in ('ceo', 'manager', 'viewer')),
  display_name text,
  created_at timestamptz not null default now()
);

-- Metric snapshots — one row per metric per capture period
create table if not exists hdpm_dash_metric_snapshots (
  id           uuid primary key default gen_random_uuid(),
  metric_key   text not null,
  section      text not null check (section in ('portfolio', 'financial', 'maintenance', 'growth', 'retention', 'people')),
  value        numeric not null,
  unit         text,                -- '%', 'days', '$', 'count'
  source       text not null,       -- 'appfolio', 'propertymeld', 'quickbooks', 'manual'
  captured_at  timestamptz not null default now(),
  period_start date not null,
  period_end   date not null,
  notes        text,
  created_at   timestamptz not null default now()
);

create index if not exists idx_snapshots_section_captured
  on hdpm_dash_metric_snapshots (section, captured_at desc);

create index if not exists idx_snapshots_metric_key
  on hdpm_dash_metric_snapshots (metric_key, captured_at desc);

-- KPI targets — one row per metric defining green/yellow/red thresholds
create table if not exists hdpm_dash_kpi_targets (
  id               uuid primary key default gen_random_uuid(),
  metric_key       text not null unique,
  green_threshold  numeric not null,
  yellow_threshold numeric not null,
  direction        text not null default 'higher_better' check (direction in ('higher_better', 'lower_better')),
  target_value     numeric,
  updated_at       timestamptz not null default now(),
  updated_by       uuid references auth.users(id)
);

-- Alert rules
create table if not exists hdpm_dash_alert_rules (
  id           uuid primary key default gen_random_uuid(),
  metric_key   text not null,
  condition    text not null check (condition in ('below', 'above')),
  threshold    numeric not null,
  notify_email boolean not null default true,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);
