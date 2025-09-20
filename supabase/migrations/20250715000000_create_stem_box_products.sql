-- ============================================================================
-- STEM box products - join table
-- ----------------------------------------------------------------------------
-- Standalone migration for the `stem_box_products` join table (product_id
-- FK -> products, unique). Idempotent (CREATE TABLE IF NOT EXISTS) so
-- re-running is safe. RLS is not enabled here; rows are just product FKs.
-- ============================================================================


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
