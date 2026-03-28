-- Hermes MVP: Supabase Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Enums
create type workout_type as enum ('easy', 'long_run', 'workout', 'recovery', 'race', 'other');

-- 2. Races table
create table races (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  race_name text not null,
  race_date date not null,
  race_distance_miles numeric(6,2) not null check (race_distance_miles > 0),
  goal_time_seconds integer,  -- nullable, optional goal
  created_at timestamptz not null default now()
);

create index races_user_idx on races (user_id, race_date asc);

-- 3. Workouts table (training sessions)
create table workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  race_id uuid references races(id) on delete set null,  -- nullable per spec
  date date not null default current_date,
  distance_miles numeric(5,2) not null check (distance_miles > 0),
  duration_seconds integer not null check (duration_seconds > 0),
  workout_type workout_type not null default 'easy',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index workouts_user_date_idx on workouts (user_id, date desc);
create index workouts_race_idx on workouts (race_id);

-- 4. Row-Level Security — Races
alter table races enable row level security;

create policy "Users can view own races"
  on races for select using (auth.uid() = user_id);

create policy "Users can insert own races"
  on races for insert with check (auth.uid() = user_id);

create policy "Users can update own races"
  on races for update using (auth.uid() = user_id);

create policy "Users can delete own races"
  on races for delete using (auth.uid() = user_id);

-- 5. Row-Level Security — Workouts
alter table workouts enable row level security;

create policy "Users can view own workouts"
  on workouts for select using (auth.uid() = user_id);

create policy "Users can insert own workouts"
  on workouts for insert with check (auth.uid() = user_id);

create policy "Users can update own workouts"
  on workouts for update using (auth.uid() = user_id);

create policy "Users can delete own workouts"
  on workouts for delete using (auth.uid() = user_id);

-- 6. Auto-update updated_at on workouts
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger workouts_updated_at
  before update on workouts
  for each row
  execute function update_updated_at();
