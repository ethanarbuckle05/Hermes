# Hermes

## Stack
- Next.js 14 (App Router)
- Supabase Auth + Postgres with Row Level Security (RLS)
- Tailwind CSS
- Deploying to Vercel

## Database
Two tables: `races` and `workouts`.

## Conventions
- Distances in **miles** (not km)
- Pace displayed as **M:SS /mi**
- Duration stored as **seconds** (integer)
- Dates stored as **YYYY-MM-DD**, parsed with `T12:00:00` to avoid timezone shift
