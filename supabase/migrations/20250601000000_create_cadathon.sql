-- ============================================================================
-- Cadathon - settings, signups, announcements
-- ----------------------------------------------------------------------------
-- Standalone migration for the cadathon feature tables, their indexes, RLS,
-- and the seeded default settings row (banner off, Jul 1-11 2026 dates).
-- Idempotent (CREATE TABLE IF NOT EXISTS / DROP POLICY IF EXISTS) so
-- re-running is safe.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- Cadathon: settings, signups, announcements
-- ----------------------------------------------------------------------------
create table if not exists cadathon_settings (
  id                bigserial primary key,
  banner_enabled    boolean default false,
  start_date        timestamptz,
  end_date          timestamptz,
  prize_pool        text default '$200 Prize Pool',
  discord_link      text default '',
  registration_open boolean default false,
  minimum_signups   integer default 0,
  model_link_1      text default '',
  model_link_2      text default '',
  model_link_3      text default '',
  game_description  text default '',
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

insert into cadathon_settings (banner_enabled, start_date, end_date, registration_open)
select false, '2026-07-01 12:00:00+00', '2026-07-11 12:00:00+00', false
where not exists (select 1 from cadathon_settings);

create table if not exists cadathon_signups (
  id              bigserial primary key,
  user_id         uuid references profiles(id) on delete set null,
  name            text not null,
  phone           text,
  email           text not null,
  age             integer,
  location_state  text,
  city            text,
  country         text default 'United States',
  lat             double precision,
  lng             double precision,
  created_at      timestamptz default now()
);

create index if not exists idx_cadathon_signups_email on cadathon_signups(email);
create index if not exists idx_cadathon_signups_location on cadathon_signups(location_state);
create index if not exists idx_cadathon_signups_user_id on cadathon_signups(user_id);

alter table cadathon_settings enable row level security;
alter table cadathon_signups enable row level security;

drop policy if exists "Public read settings" on cadathon_settings;
drop policy if exists "Admin write settings" on cadathon_settings;

create policy "Public read settings"
  on cadathon_settings for select
  using (true);

create policy "Admin write settings"
  on cadathon_settings for all
  using (auth.jwt() ->> 'role' = 'service_role');

drop policy if exists "Users can insert own signup" on cadathon_signups;
drop policy if exists "Users can read own signup" on cadathon_signups;
drop policy if exists "Public read location state" on cadathon_signups;
drop policy if exists "Admin read all signups" on cadathon_signups;

create policy "Users can insert own signup"
  on cadathon_signups for insert
  with check (
    auth.uid() = user_id
    and exists (select 1 from cadathon_settings where registration_open = true)
  );

create policy "Users can read own signup"
  on cadathon_signups for select
  using (auth.uid() = user_id);

create policy "Public read location state"
  on cadathon_signups for select
  using (true);

create policy "Admin read all signups"
  on cadathon_signups for all
  using (auth.jwt() ->> 'role' = 'service_role');

create table if not exists cadathon_announcements (
  id serial primary key,
  title text not null default '',
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table cadathon_announcements enable row level security;

drop policy if exists "Public read announcements" on cadathon_announcements;
create policy "Public read announcements"
  on cadathon_announcements for select
  using (true);

drop policy if exists "Admin write announcements" on cadathon_announcements;
create policy "Admin write announcements"
  on cadathon_announcements for all
  using (auth.jwt() ->> 'role' = 'service_role');
