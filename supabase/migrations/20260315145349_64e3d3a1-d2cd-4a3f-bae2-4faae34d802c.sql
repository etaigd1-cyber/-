-- Core tables for cross-device room sync
create extension if not exists pgcrypto;

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  room_code text not null unique,
  phase text not null default 'lobby',
  game_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rooms_room_code_format check (room_code ~ '^[0-9]{6}$')
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  player_id uuid not null,
  player_state jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (room_id, player_id)
);

create index if not exists idx_rooms_room_code on public.rooms(room_code);
create index if not exists idx_players_room_id on public.players(room_id);

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Helper functions used by policies
create or replace function public.is_valid_room_code(_room_code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.rooms r
    where r.room_code = _room_code
  );
$$;

create or replace function public.room_exists(_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.rooms r
    where r.id = _room_id
  );
$$;

create trigger update_rooms_updated_at
before update on public.rooms
for each row
execute function public.update_updated_at_column();

create trigger update_players_updated_at
before update on public.players
for each row
execute function public.update_updated_at_column();

alter table public.rooms enable row level security;
alter table public.players enable row level security;

-- Public room access by valid room code (no auth required)
create policy "Public can read rooms"
on public.rooms
for select
to anon, authenticated
using (public.is_valid_room_code(room_code));

create policy "Public can create room"
on public.rooms
for insert
to anon, authenticated
with check (room_code ~ '^[0-9]{6}$');

create policy "Public can update room state"
on public.rooms
for update
to anon, authenticated
using (public.is_valid_room_code(room_code))
with check (public.is_valid_room_code(room_code));

-- Player access scoped to valid existing room
create policy "Public can read players in rooms"
on public.players
for select
to anon, authenticated
using (public.room_exists(room_id));

create policy "Public can insert players in rooms"
on public.players
for insert
to anon, authenticated
with check (public.room_exists(room_id));

create policy "Public can update players in rooms"
on public.players
for update
to anon, authenticated
using (public.room_exists(room_id))
with check (public.room_exists(room_id));

create policy "Public can delete players in rooms"
on public.players
for delete
to anon, authenticated
using (public.room_exists(room_id));

alter table public.rooms replica identity full;
alter table public.players replica identity full;

-- Realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'players'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
  END IF;
END $$;