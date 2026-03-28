# Hermes

Minimal race-training log for a small cohort. Each user sets a target race and logs training sessions toward it.

## Stack

Next.js 14 (App Router) → Supabase (Auth + Postgres + RLS) → Tailwind CSS → Vercel

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. **SQL Editor** → paste and run `supabase-migration.sql`
3. **Authentication → Providers** → ensure Email is enabled
4. **Settings → API** → copy project URL and anon key

### 2. Local dev

```bash
npm install
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

### 3. Deploy to Vercel

Push to GitHub → import in Vercel → add env vars → deploy.

### 4. Invite users

Users sign up at `/login`, or invite via Supabase Dashboard → Authentication → Users → Invite.

## Data model

**races**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| race_name | text | |
| race_date | date | |
| race_distance_miles | numeric(6,2) | |
| goal_time_seconds | integer | nullable |
| created_at | timestamptz | |

**workouts**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| race_id | uuid | FK → races, nullable |
| date | date | |
| distance_miles | numeric(5,2) | |
| duration_seconds | integer | |
| workout_type | enum | easy, long_run, workout, recovery, race, other |
| notes | text | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | auto-trigger |

## Features (MVP)

- Email/password auth
- Create/delete target race (5K, 10K, half, marathon, custom)
- Race countdown + total sessions/miles stats
- Full CRUD on training sessions
- Auto-computed pace display
- 7-day mileage + time summaries
- RLS: each user sees only their own data
- Mobile-first layout
