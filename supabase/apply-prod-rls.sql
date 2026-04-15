-- ============================================================================
-- Protara Printing - security hardening for the existing production DB
-- ----------------------------------------------------------------------------
-- For databases that were built out-of-band (Supabase SQL editor /
-- schema-reference.sql) and predate the migration files. Run ONCE in the
-- Supabase SQL editor (Dashboard -> SQL Editor -> New query -> paste -> Run).
-- Idempotent: safe to re-run.
--
-- This is the "live DB only" equivalent of what migrations
-- `20240815000000_create_base_schema.sql` (reviews section) and
-- `20260415000000_harden_submission_tables.sql` do on a fresh install; it skips
-- the table DDL that already exists here.
--
-- IMPORTANT: deploy the updated front-end at the same time as running this -
-- RLS immediately hides non-approved testimonials, all custom print requests,
-- and review contact fields from the anon user, and the old deployed code reads
-- those directly. Pair the push with the deploy.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- Review stats + sanitized public view
-- ----------------------------------------------------------------------------
grant select on review_stats to anon, authenticated;

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

grant select on public_reviews to anon, authenticated;


-- ----------------------------------------------------------------------------
-- Reviews
-- ----------------------------------------------------------------------------
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
-- Testimonials
-- ----------------------------------------------------------------------------
alter table testimonials enable row level security;

drop policy if exists "Public submit testimonials" on testimonials;
create policy "Public submit testimonials"
  on testimonials for insert
  with check (true);

drop policy if exists "Public read approved testimonials" on testimonials;
create policy "Public read approved testimonials"
  on testimonials for select
  using (status = 'approved');

drop policy if exists "Service role read testimonials" on testimonials;
create policy "Service role read testimonials"
  on testimonials for select
  using (auth.jwt() ->> 'role' = 'service_role');

drop policy if exists "Service role update testimonials" on testimonials;
create policy "Service role update testimonials"
  on testimonials for update
  using (auth.jwt() ->> 'role' = 'service_role')
  with check (auth.jwt() ->> 'role' = 'service_role');

drop policy if exists "Service role delete testimonials" on testimonials;
create policy "Service role delete testimonials"
  on testimonials for delete
  using (auth.jwt() ->> 'role' = 'service_role');


-- ----------------------------------------------------------------------------
-- Custom print requests
-- ----------------------------------------------------------------------------
alter table custom_print_requests enable row level security;

drop policy if exists "Public submit print request" on custom_print_requests;
create policy "Public submit print request"
  on custom_print_requests for insert
  with check (true);

drop policy if exists "Service role read print requests" on custom_print_requests;
create policy "Service role read print requests"
  on custom_print_requests for select
  using (auth.jwt() ->> 'role' = 'service_role');

drop policy if exists "Service role update print requests" on custom_print_requests;
create policy "Service role update print requests"
  on custom_print_requests for update
  using (auth.jwt() ->> 'role' = 'service_role')
  with check (auth.jwt() ->> 'role' = 'service_role');

drop policy if exists "Service role delete print requests" on custom_print_requests;
create policy "Service role delete print requests"
  on custom_print_requests for delete
  using (auth.jwt() ->> 'role' = 'service_role');