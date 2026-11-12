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

-- Which Mux video belongs to which lesson. Add a row when a video is ready:
-- lesson_code like 'B5.1', mux_playback_id from the Mux asset page.
create table if not exists public.videos (
  lesson_code text primary key,
  mux_playback_id text not null,
  duration_seconds integer,
  created_at timestamptz not null default now()
);

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
