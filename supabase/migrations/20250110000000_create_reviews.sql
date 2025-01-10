-- ============================================================================
-- Reviews - products reviews table with RLS + sanitized public views
-- ----------------------------------------------------------------------------
-- Standalone migration for the `reviews` table, its indexes, the
-- `review_stats` / `public_reviews` views + grants, and RLS. Idempotent
-- (CREATE TABLE IF NOT EXISTS / DROP POLICY IF EXISTS) so re-running is
-- safe. The base-schema migration must run first so `products(id)` resolves.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- Reviews (with RLS + sanitized public view)
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
