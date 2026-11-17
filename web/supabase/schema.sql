-- Shakai Academy members site. Paste this whole file into
-- Supabase > SQL Editor > New query, then press Run. Safe to run again.

-- One row per member. Tier is set by the Stripe webhook, never by the member.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  tier text not null default 'free' check (tier in ('free', 'beginner', 'intermediate', 'pro')),
  stripe_customer_id text unique,
  stripe_subscription_id text,
  subscription_status text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
drop policy if exists "Members read their own profile" on public.profiles;
create policy "Members read their own profile" on public.profiles
  for select using (auth.uid() = id);

-- Make a profile automatically when someone signs up.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Which Mux videos belong to which lesson. One row per camera angle.
-- lesson_code like 'B5.1', angle like 'Side' or 'Barber''s view',
-- mux_playback_id from the Mux asset page. Trim every angle of a lesson to the
-- same start so switching cameras lands on the same moment.
-- sort decides the button order (lowest first, and the one that plays first).
create table if not exists public.videos (
  lesson_code text not null,
  angle text not null default 'Side',
  sort integer not null default 0,
  mux_playback_id text not null,
  duration_seconds integer,
  created_at timestamptz not null default now(),
  primary key (lesson_code, angle)
);

-- Upgrade from the first version (one video per lesson). Safe to run again.
alter table public.videos add column if not exists angle text not null default 'Side';
alter table public.videos add column if not exists sort integer not null default 0;
do $$
begin
  if exists (
    select 1 from information_schema.key_column_usage
    where table_schema = 'public' and table_name = 'videos' and constraint_name = 'videos_pkey'
    group by constraint_name having count(*) = 1
  ) then
    alter table public.videos drop constraint videos_pkey;
    alter table public.videos add primary key (lesson_code, angle);
  end if;
end $$;

alter table public.videos enable row level security;
-- Playback IDs are useless without a signed token from the site, so anyone may read them.
drop policy if exists "Anyone can read video ids" on public.videos;
create policy "Anyone can read video ids" on public.videos for select using (true);

-- Lessons each member has marked as done.
create table if not exists public.progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_code text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_code)
);

alter table public.progress enable row level security;
drop policy if exists "Members manage their own progress" on public.progress;
create policy "Members manage their own progress" on public.progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
