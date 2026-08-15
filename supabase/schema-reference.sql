-- ============================================================================
-- Protara Printing - Reference schema
-- ----------------------------------------------------------------------------
-- Consolidated, idempotent DDL for the Supabase Postgres database. This file
-- describes the current schema as it exists in production. It is safe to run
-- in full against an empty database (e.g. `psql` or the Supabase SQL editor).
--
-- New incremental changes belong in supabase/migrations/, not in this file.
-- Tables not mirrored here (testimonials, custom_print_requests, cadathon
-- geocode columns) are defined in supabase/migrations/.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- Products catalog
-- ----------------------------------------------------------------------------
create table if not exists products (
  id                  bigserial primary key,
  slug                text unique,
  name                text not null,
  price               numeric(10,2) not null,
  material            text,
  category            text,
  description         text,
  detailed_description text,
  specifications      jsonb,
  metadata            jsonb,
  community_designed  boolean default false,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create table if not exists product_images (
  id          bigserial primary key,
  product_id  bigint not null references products(id) on delete cascade,
  url         text not null,
  alt_text    text,
  position    integer default 0,
  created_at  timestamptz default now()
);

create table if not exists product_customizations (
  id          bigserial primary key,
  product_id  bigint not null references products(id) on delete cascade,
  type        text not null,
  label       text,
  created_at  timestamptz default now()
);

create table if not exists customization_options (
  id                 bigserial primary key,
  customization_id   bigint not null references product_customizations(id) on delete cascade,
  option_value       text not null,
  price_delta        numeric(10,2) default 0,
  metadata           jsonb,
  position           integer default 0
);

-- Flat JSON copy of each product's customizations for fast reads.
create table if not exists product_customizations_json (
  product_id    bigint primary key references products(id) on delete cascade,
  customizations jsonb not null,
  updated_at    timestamptz default now()
);

create index if not exists idx_product_category on products(category);
create index if not exists idx_images_product on product_images(product_id);
create index if not exists idx_customizations_product on product_customizations(product_id);
create index if not exists idx_options_customization on customization_options(customization_id);


-- ----------------------------------------------------------------------------
-- Accounts: profiles, orders, order_items
-- ----------------------------------------------------------------------------
create table if not exists profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  name            text,
  phone           text,
  age             integer,
  location_state  text,
  city            text,
  country         text default 'United States',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table if not exists orders (
  id                bigserial primary key,
  user_id           uuid references profiles(id) on delete set null,
  stripe_session_id text unique,
  status            text default 'pending',
  subtotal          numeric(10,2),
  shipping          numeric(10,2) default 9.99,
  total             numeric(10,2),
  shipping_name     text,
  shipping_address  jsonb,
  customer_email    text,
  created_at        timestamptz default now()
);

create table if not exists order_items (
  id              bigserial primary key,
  order_id        bigint not null references orders(id) on delete cascade,
  product_id      bigint,
  product_name    text,
  quantity        integer default 1,
  unit_price      numeric(10,2),
  material        text,
  image_url       text
);

create index if not exists idx_orders_user_id on orders(user_id);
create index if not exists idx_orders_created_at on orders(created_at desc);
create index if not exists idx_order_items_order_id on order_items(order_id);
create index if not exists idx_profiles_created_at on profiles(created_at desc);

alter table profiles enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

drop policy if exists "Users can read own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Service role can read all profiles" on profiles;

create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Service role can read all profiles"
  on profiles for select
  using (auth.jwt() ->> 'role' = 'service_role');

drop policy if exists "Users can read own orders" on orders;
drop policy if exists "Service role can manage orders" on orders;

create policy "Users can read own orders"
  on orders for select
  using (auth.uid() = user_id);

create policy "Service role can manage orders"
  on orders for all
  using (auth.jwt() ->> 'role' = 'service_role');

drop policy if exists "Users can read own order items" on order_items;
drop policy if exists "Service role can manage order items" on order_items;

create policy "Users can read own order items"
  on order_items for select
  using (
    order_id in (select id from orders where user_id = auth.uid())
  );

create policy "Service role can manage order items"
  on order_items for all
  using (auth.jwt() ->> 'role' = 'service_role');

-- Create a profile row automatically when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data ->> 'name');
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();


-- ----------------------------------------------------------------------------
-- Admin: audit log and credential store
-- ----------------------------------------------------------------------------
create table if not exists edit_logs (
  id              bigserial primary key,
  admin_name      text not null,
  action          text not null,
  table_name      text not null,
  record_id       bigint,
  record_name     text,
  changes         jsonb,
  created_at      timestamptz default now()
);

create index if not exists idx_edit_logs_admin_name on edit_logs(admin_name);
create index if not exists idx_edit_logs_created_at on edit_logs(created_at desc);
create index if not exists idx_edit_logs_action on edit_logs(action);
create index if not exists idx_edit_logs_table_name on edit_logs(table_name);

create table if not exists admin_credentials (
  id              bigserial primary key,
  name            text not null unique,
  password        text not null,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_admin_credentials_name on admin_credentials(name);

-- The default admin credential below is a placeholder; replace it in the
-- Supabase dashboard before going live.
insert into admin_credentials (name, password)
values ('founders', 'enderhatersunited')
on conflict (name) do nothing;


-- ----------------------------------------------------------------------------
-- Blog
-- ----------------------------------------------------------------------------
create table if not exists blogs (
  id serial primary key,
  title text not null,
  slug text not null unique,
  content text not null,
  image_url text default '',
  video_url text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table blogs enable row level security;

drop policy if exists "Public read blogs" on blogs;
create policy "Public read blogs"
  on blogs for select
  using (true);

drop policy if exists "Admin write blogs" on blogs;
create policy "Admin write blogs"
  on blogs for all
  using (true)
  with check (true);


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


-- ----------------------------------------------------------------------------
-- Reviews
-- ----------------------------------------------------------------------------
create table if not exists reviews (
  id              bigserial primary key,
  product_id      bigint not null references products(id) on delete cascade,
  title           text not null,
  description     text not null,
  rating          smallint not null check (rating >= 1 and rating <= 5),
  name            text not null default 'Anonymous',
  email           text not null,
  phone_number    text not null,
  item_bought     text not null,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_reviews_product on reviews(product_id);
create index if not exists idx_reviews_created_at on reviews(created_at desc);

create or replace view review_stats as
select
  product_id,
  count(*) as total_reviews,
  round(avg(rating)::numeric, 2) as average_rating,
  max(created_at) as latest_review_date
from reviews
group by product_id;

-- Sanitized projection without contact details (email, phone_number) for the
-- public product page. Views resolve with the owner's privileges, so anon can
-- read only the columns this view exposes.
create or replace view public_reviews as
select
  id,
  product_id,
  title,
  description,
  rating,
  name,
  item_bought,
  created_at,
  updated_at
from reviews;

grant select on review_stats to anon, authenticated;
grant select on public_reviews to anon, authenticated;

alter table reviews enable row level security;

drop policy if exists "Public insert reviews" on reviews;
create policy "Public insert reviews"
  on reviews for insert
  with check (true);

drop policy if exists "Service role read reviews" on reviews;
create policy "Service role read reviews"
  on reviews for select
  using (auth.jwt() ->> 'role' = 'service_role');

drop policy if exists "Service role update reviews" on reviews;
create policy "Service role update reviews"
  on reviews for update
  using (auth.jwt() ->> 'role' = 'service_role')
  with check (auth.jwt() ->> 'role' = 'service_role');

drop policy if exists "Service role delete reviews" on reviews;
create policy "Service role delete reviews"
  on reviews for delete
  using (auth.jwt() ->> 'role' = 'service_role');


-- ----------------------------------------------------------------------------
-- STEM box products
-- ----------------------------------------------------------------------------
create table if not exists stem_box_products (
  id          bigserial primary key,
  product_id  bigint not null references products(id) on delete cascade,
  created_at  timestamptz default now(),
  unique(product_id)
);

create index if not exists idx_stem_box_products on stem_box_products(product_id);


-- ----------------------------------------------------------------------------
-- Row level security for the remaining public/admin tables
-- ----------------------------------------------------------------------------
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_customizations enable row level security;
alter table customization_options enable row level security;
alter table product_customizations_json enable row level security;
alter table edit_logs enable row level security;
alter table admin_credentials enable row level security;

-- Public reads on the catalog; writes are enforced at the API layer.
create policy "Allow public read access to products"
  on products for select
  using (true);

create policy "Allow authenticated admins to insert products"
  on products for insert
  with check (true);

create policy "Allow authenticated admins to update products"
  on products for update
  using (true)
  with check (true);

create policy "Allow authenticated admins to delete products"
  on products for delete
  using (true);

create policy "Allow public read access to product images"
  on product_images for select
  using (true);

create policy "Allow authenticated admins to manage product images"
  on product_images for insert
  with check (true);

create policy "Allow authenticated admins to update product images"
  on product_images for update
  using (true)
  with check (true);

create policy "Allow authenticated admins to delete product images"
  on product_images for delete
  using (true);

create policy "Allow public read access to product customizations"
  on product_customizations for select
  using (true);

create policy "Allow authenticated admins to manage customizations"
  on product_customizations for insert
  with check (true);

create policy "Allow authenticated admins to update customizations"
  on product_customizations for update
  using (true)
  with check (true);

create policy "Allow authenticated admins to delete customizations"
  on product_customizations for delete
  using (true);

create policy "Allow public read access to customization options"
  on customization_options for select
  using (true);

create policy "Allow authenticated admins to manage customization options"
  on customization_options for insert
  with check (true);

create policy "Allow authenticated admins to update customization options"
  on customization_options for update
  using (true)
  with check (true);

create policy "Allow authenticated admins to delete customization options"
  on customization_options for delete
  using (true);

create policy "Allow public read access to customizations JSON"
  on product_customizations_json for select
  using (true);

create policy "Allow authenticated admins to manage customizations JSON"
  on product_customizations_json for insert
  with check (true);

create policy "Allow authenticated admins to update customizations JSON"
  on product_customizations_json for update
  using (true)
  with check (true);

create policy "Allow authenticated admins to delete customizations JSON"
  on product_customizations_json for delete
  using (true);

-- Edit logs are append-only audit records.
create policy "Allow authenticated admins to read edit logs"
  on edit_logs for select
  using (true);

create policy "Allow system to insert edit logs"
  on edit_logs for insert
  with check (true);

create policy "Prevent updates to edit logs"
  on edit_logs for update
  using (false);

create policy "Prevent deletes of edit logs"
  on edit_logs for delete
  using (false);

-- Credentials are only readable to support the password verification API.
create policy "Allow anon to read admin credentials for verification"
  on admin_credentials for select
  using (true);

create policy "Prevent unauthorized inserts to admin credentials"
  on admin_credentials for insert
  with check (false);

create policy "Prevent unauthorized updates to admin credentials"
  on admin_credentials for update
  using (false);

create policy "Prevent unauthorized deletes from admin credentials"
  on admin_credentials for delete
  using (false);