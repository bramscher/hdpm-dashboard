# HDPM Dashboard

CEO operations dashboard for High Desert Property Management. Built with Next.js 14 (App Router), Supabase, and Tailwind CSS. Deployed on Vercel.

## Stack

- **Next.js 14** — App Router, TypeScript
- **Supabase** — shared instance with `hdpm-web`, namespaced as `hdpm_dash_*`
- **Auth** — Microsoft Entra ID (Azure AD) via Supabase OAuth
- **Tailwind CSS** — styling
- **Recharts** — sparklines and trend charts
- **Vercel** — hosting + cron jobs for data sync

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in values
cp .env.example .env.local

# 3. Run migrations against your Supabase instance
# (migrations in supabase/migrations/ — run via Supabase CLI or dashboard)

# 4. Start dev server
npm run dev
```

## Environment variables

See `.env.example`. The only required values are:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side sync routes only)

## Microsoft login setup

1. In Azure portal → App registrations → your app → Redirect URIs, add:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `http://localhost:3000/api/auth/callback` (dev)
   - `https://hdpm-dashboard.vercel.app/api/auth/callback` (prod)
2. In Supabase dashboard → Auth → Providers → Azure: paste Client ID + Secret
3. That's it — both `hdpm-web` and `hdpm-dashboard` share the same Azure app registration

## Role-based access

| Role      | Sections visible                                          |
|-----------|-----------------------------------------------------------|
| `ceo`     | All sections (portfolio, financial, maintenance, growth, retention, people) |
| `manager` | Portfolio, maintenance, growth, retention                 |
| `viewer`  | Portfolio only                                            |

Roles are set in the `hdpm_dash_user_roles` table. RLS enforces access at the database level.

## What still needs building

The following files need to be completed (scaffold is ready, logic needed):

- `app/(dashboard)/dashboard/page.tsx` — main dashboard server page
- `components/dashboard/Sidebar.tsx`
- `components/dashboard/KpiCard.tsx`
- `components/dashboard/Sparkline.tsx`
- `components/dashboard/SectionGroup.tsx`
- `app/api/sync/appfolio/route.ts`
- `app/api/sync/propertymeld/route.ts`
- `app/api/sync/quickbooks/route.ts`
- `supabase/migrations/001_hdpm_dash_schema.sql`
- `supabase/migrations/002_hdpm_dash_rls.sql`
- `supabase/migrations/003_hdpm_dash_seed_targets.sql`

## Repo structure

```
hdpm-dashboard/
├── app/
│   ├── (auth)/login/        # Microsoft login page
│   ├── (dashboard)/         # Protected dashboard routes
│   ├── api/auth/callback/   # OAuth callback
│   └── api/sync/            # Vercel cron sync routes (AppFolio, Meld, QB)
├── components/dashboard/    # KPI cards, sparklines, sidebar
├── lib/
│   ├── supabase/            # Client, server, middleware helpers
│   └── kpi.ts               # Data fetching + stoplight logic
├── supabase/migrations/     # SQL migrations (hdpm_dash_* tables + RLS)
└── types/index.ts           # Shared TypeScript types
```
