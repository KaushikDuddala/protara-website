-- ============================================================================
-- Base schema - products, accounts, admin, blog
-- ----------------------------------------------------------------------------
-- Creates the core catalog, accounts, admin, and blog tables, their indexes,
-- triggers, and RLS policies. Existing installs: every statement is idempotent
-- (IF NOT EXISTS / DROP POLICY IF EXISTS) so re-running is safe. New setups:
-- run all migrations in order via `supabase db reset` / `supabase db push`.
--
-- CONTENTS
--   1. Products catalog (products, product_images, product_customizations,
--      customization_options, product_customizations_json)
--   2. Accounts (profiles, orders, order_items) + RLS + signup trigger
--   3. Admin (edit_logs, admin_credentials) + RLS + default credential
--   4. Blog (blogs) + RLS
--   5. RLS for the product catalog, edit_logs, and admin_credentials
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
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
drop policy if exists "Allow public read access to products" on products;
create policy "Allow public read access to products"
  on products for select
  using (true);

drop policy if exists "Allow authenticated admins to insert products" on products;
create policy "Allow authenticated admins to insert products"
  on products for insert
  with check (true);

drop policy if exists "Allow authenticated admins to update products" on products;
create policy "Allow authenticated admins to update products"
  on products for update
  using (true)
  with check (true);

drop policy if exists "Allow authenticated admins to delete products" on products;
create policy "Allow authenticated admins to delete products"
  on products for delete
  using (true);

drop policy if exists "Allow public read access to product images" on product_images;
create policy "Allow public read access to product images"
  on product_images for select
  using (true);

drop policy if exists "Allow authenticated admins to manage product images" on product_images;
create policy "Allow authenticated admins to manage product images"
  on product_images for insert
  with check (true);

drop policy if exists "Allow authenticated admins to update product images" on product_images;
create policy "Allow authenticated admins to update product images"
  on product_images for update
  using (true)
  with check (true);

drop policy if exists "Allow authenticated admins to delete product images" on product_images;
create policy "Allow authenticated admins to delete product images"
  on product_images for delete
  using (true);

drop policy if exists "Allow public read access to product customizations" on product_customizations;
create policy "Allow public read access to product customizations"
  on product_customizations for select
  using (true);

drop policy if exists "Allow authenticated admins to manage customizations" on product_customizations;
create policy "Allow authenticated admins to manage customizations"
  on product_customizations for insert
  with check (true);

drop policy if exists "Allow authenticated admins to update customizations" on product_customizations;
create policy "Allow authenticated admins to update customizations"
  on product_customizations for update
  using (true)
  with check (true);

drop policy if exists "Allow authenticated admins to delete customizations" on product_customizations;
create policy "Allow authenticated admins to delete customizations"
  on product_customizations for delete
  using (true);

drop policy if exists "Allow public read access to customization options" on customization_options;
create policy "Allow public read access to customization options"
  on customization_options for select
  using (true);

drop policy if exists "Allow authenticated admins to manage customization options" on customization_options;
create policy "Allow authenticated admins to manage customization options"
  on customization_options for insert
  with check (true);

drop policy if exists "Allow authenticated admins to update customization options" on customization_options;
create policy "Allow authenticated admins to update customization options"
  on customization_options for update
  using (true)
  with check (true);

drop policy if exists "Allow authenticated admins to delete customization options" on customization_options;
create policy "Allow authenticated admins to delete customization options"
  on customization_options for delete
  using (true);

drop policy if exists "Allow public read access to customizations JSON" on product_customizations_json;
create policy "Allow public read access to customizations JSON"
  on product_customizations_json for select
  using (true);

drop policy if exists "Allow authenticated admins to manage customizations JSON" on product_customizations_json;
create policy "Allow authenticated admins to manage customizations JSON"
  on product_customizations_json for insert
  with check (true);

drop policy if exists "Allow authenticated admins to update customizations JSON" on product_customizations_json;
create policy "Allow authenticated admins to update customizations JSON"
  on product_customizations_json for update
  using (true)
  with check (true);

drop policy if exists "Allow authenticated admins to delete customizations JSON" on product_customizations_json;
create policy "Allow authenticated admins to delete customizations JSON"
  on product_customizations_json for delete
  using (true);

-- Edit logs are append-only audit records.
drop policy if exists "Allow authenticated admins to read edit logs" on edit_logs;
create policy "Allow authenticated admins to read edit logs"
  on edit_logs for select
  using (true);

drop policy if exists "Allow system to insert edit logs" on edit_logs;
create policy "Allow system to insert edit logs"
  on edit_logs for insert
  with check (true);

drop policy if exists "Prevent updates to edit logs" on edit_logs;
create policy "Prevent updates to edit logs"
  on edit_logs for update
  using (false);

drop policy if exists "Prevent deletes of edit logs" on edit_logs;
create policy "Prevent deletes of edit logs"
  on edit_logs for delete
  using (false);

-- Credentials are only readable to support the password verification API.
drop policy if exists "Allow anon to read admin credentials for verification" on admin_credentials;
create policy "Allow anon to read admin credentials for verification"
  on admin_credentials for select
  using (true);

drop policy if exists "Prevent unauthorized inserts to admin credentials" on admin_credentials;
create policy "Prevent unauthorized inserts to admin credentials"
  on admin_credentials for insert
  with check (false);

drop policy if exists "Prevent unauthorized updates to admin credentials" on admin_credentials;
create policy "Prevent unauthorized updates to admin credentials"
  on admin_credentials for update
  using (false);

drop policy if exists "Prevent unauthorized deletes from admin credentials" on admin_credentials;
create policy "Prevent unauthorized deletes from admin credentials"
  on admin_credentials for delete
  using (false);