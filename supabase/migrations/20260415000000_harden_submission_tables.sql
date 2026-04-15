-- ============================================================================
-- Enable RLS on the customer-submission tables
-- ----------------------------------------------------------------------------
-- `custom_print_requests` and `testimonials` are created by earlier migrations.
-- Both carry PII (email / phone / contact) but shipped with RLS disabled, so
-- any anon client could read or mutate them. This migration turns on RLS using
-- policies modelled on the rest of the schema:
--
--   custom_print_requests: anon inserts (public form), service-role reads/writes
--   testimonials:          anon inserts, service-role writes, public reads only
--                          the approved rows (via a status filter)
-- ============================================================================

alter table custom_print_requests enable row level security;
alter table testimonials enable row level security;

-- ----------------------------------------------------------------------------
-- custom_print_requests
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- testimonials
-- ----------------------------------------------------------------------------
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