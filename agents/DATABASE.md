# Database

Everything about the Postgres database behind the site: the schema source of truth, migrations, seed data, Row Level Security, and storage. The deployed database lives on **Supabase**.

## Files

- `supabase/schema-reference.sql`: an idempotent (`CREATE TABLE IF NOT EXISTS`, `DROP POLICY IF EXISTS`) **mirror** of the production schema for reference/fresh-setup fallback (Supabase SQL editor or `psql`). Contains tables, indexes, the triggers, views, seed rows, and RLS.
- `supabase/migrations/`: incremental, timestamped migrations; the authoritative apply path (`supabase db reset`, `supabase db push`). **New database changes belong here**, never in `schema-reference.sql`. After adding a migration, also update `schema-reference.sql` so the mirror stays in sync.
- `supabase/README.md`: RLS explanations, apply instructions, troubleshooting, security notes.

## Migrations

| File | Creates / changes |
|------|-------------------|
| `20240815000000_create_base_schema.sql` | Full base schema (idempotent): `products` catalog + customizations/options/JSON tables + indexes, `profiles`/`orders`/`order_items` (+ RLS, `handle_new_user()` trigger), `edit_logs`/`admin_credentials` (+ RLS, placeholder row), `blogs` (+ RLS), and RLS for those tables. |
| `20241005000000_seed_products.sql` | Seeds the 6 launch products + images + customizations (see Seed data below). Idempotent (`ON CONFLICT DO NOTHING`), then aligns sequences with `setval`. |
| `20241215000000_create_custom_print_requests.sql` | `custom_print_requests` table: UUID PK, type check (`request\|upload`), product_name, budget, description (NOT NULL), email, phone_number, `timestamp`, status check (`pending\|reviewing\|responded\|completed`), `created_at`/`updated_at`. `update_updated_at_column()` trigger function + trigger. |
| `20250110000000_create_reviews.sql` | `reviews` table + `public_reviews`/`review_stats` views + grants, with RLS and indexes. Public INSERT (with check true); SELECT/UPDATE/DELETE service-role only via the views for anon reads. |
| `20250215000000_create_testimonials.sql` | `testimonials`: UUID PK, customer_name, rating (1: 5 check), testimonial, verified_purchase (default false), `product_id bigint REFERENCES products(id)`, `contact`, `timestamp`, status check (`pending\|approved\|rejected`), timestamps. Uses `ADD COLUMN IF NOT EXISTS` for product_id/contact on older installs. Re-creates the `update_updated_at_column()` function + its trigger. |
| `20250601000000_create_cadathon.sql` | `cadathon_settings`/`cadathon_signups`/`cadathon_announcements` (RLS + default settings row, banner off, Jul 1: 11 2026 dates). Signups insert only while `registration_open`, user reads own, public read for the map. |
| `20250715000000_create_stem_box_products.sql` | `stem_box_products` join table (product_id FK → products, unique). RLS not enabled (exposes only product FKs). |
| `20260110000000_add_cadathon_geocode.sql` | Adds `lat` / `lng` (`double precision`) to `cadathon_signups`. |
| `20260415000000_harden_submission_tables.sql` | Enables RLS on `custom_print_requests` (anon INSERT; service-role reads/writes) and `testimonials` (anon INSERT; service-role writes; public SELECT limited to `status = 'approved'`). |

A greenfield `supabase db reset` builds the whole database from these 9 migrations in order. The base-schema migration is ordered before the testimonials migration so its `REFERENCES products(id)` resolves.

## Tables

### Product catalog

| Table | Columns |
|-------|---------|
| `products` | `id bigserial PK`, `slug text unique`, `name text not null`, `price numeric(10,2) not null`, `material text`, `category text`, `description text`, `detailed_description text`, `specifications jsonb`, `metadata jsonb`, `community_designed boolean default false`, `created_at`, `updated_at` |
| `product_images` | `id bigserial PK`, `product_id bigint FK → products ON DELETE CASCADE`, `url text not null`, `alt_text text`, `position integer default 0`, `created_at` |
| `product_customizations` | `id bigserial PK`, `product_id bigint FK → products ON DELETE CASCADE`, `type text not null`, `label text`, `created_at` |
| `customization_options` | `id bigserial PK`, `customization_id bigint FK → product_customizations ON DELETE CASCADE`, `option_value text not null`, `price_delta numeric(10,2) default 0`, `metadata jsonb`, `position integer default 0` |
| `product_customizations_json` | `product_id bigint PK FK → products ON DELETE CASCADE`, `customizations jsonb not null`, `updated_at` |

The JSON table is a denormalized copy of a product's customizations for fast reads; `POST/PUT /api/products/manage` keeps it in sync.

### Accounts & orders

| Table | Columns |
|-------|---------|
| `profiles` | `id uuid PK FK → auth.users ON DELETE CASCADE`, `name`, `phone`, `age integer`, `location_state`, `city`, `country text default 'United States'`, `created_at`, `updated_at` |
| `orders` | `id bigserial PK`, `user_id uuid FK → profiles ON DELETE SET NULL`, `stripe_session_id text unique`, `status text default 'pending'`, `subtotal numeric(10,2)`, `shipping numeric(10,2) default 9.99`, `total numeric(10,2)`, `shipping_name`, `shipping_address jsonb`, `customer_email`, `created_at` |
| `order_items` | `id bigserial PK`, `order_id bigint FK → orders ON DELETE CASCADE`, `product_id bigint`, `product_name text`, `quantity integer default 1`, `unit_price numeric(10,2)`, `material text`, `image_url text` |

**Important**: a `profiles` row is **auto-created on signup** by trigger `on_auth_user_created` → function `handle_new_user()` (`security definer`), which inserts `(id, new.raw_user_meta_data ->> 'name')` into `profiles`. Don't rely on manual profile creation.

### Admin / audit

| Table | Columns |
|-------|---------|
| `edit_logs` | `id bigserial PK`, `admin_name text not null`, `action text not null` (CREATE/UPDATE/DELETE), `table_name text not null`, `record_id bigint`, `record_name text`, `changes jsonb`, `created_at` |
| `admin_credentials` | `id bigserial PK`, `name text not null unique`, `password text not null` (plain text!), `created_at`, `updated_at` |

`admin_credentials` ships with a placeholder row `('founders', 'enderhatersunited')` (`ON CONFLICT (name) DO NOTHING`). **Replace this before going live**: passwords are stored in plaintext.

### Content & community

| Table | Columns |
|-------|---------|
| `blogs` | `id serial PK`, `title text not null`, `slug text not null unique`, `content text not null`, `image_url text default ''`, `video_url text default ''`, `created_at`, `updated_at` |
| `cadathon_settings` | single row: `banner_enabled`, `start_date`, `end_date`, `prize_pool text`, `discord_link`, `registration_open`, `minimum_signups integer`, `model_link_1..3`, `game_description`, timestamps. Seeded with a default row (banner off, Jul 1: 11 2026 dates) |
| `cadathon_signups` | `id bigserial PK`, `user_id uuid FK → profiles ON DELETE SET NULL`, `name not null`, `phone`, `email not null`, `age integer`, `location_state`, `city`, `country default 'United States'`, `lat double precision`, `lng double precision`, `created_at`. Geocoded on signup by `lib/geocode.ts` |
| `cadathon_announcements` | `id serial PK`, `title text default ''`, `content text not null`, timestamps |
| `reviews` | `id bigserial PK`, `product_id bigint FK → products ON DELETE CASCADE`, `title not null`, `description not null`, `rating smallint check 1..5`, `name not null default 'Anonymous'`, `email not null`, `phone_number not null`, `item_bought not null`, timestamps. Public reads go through the `public_reviews` view (no contact fields). |
| `stem_box_products` | `id bigserial PK`, `product_id bigint FK → products ON DELETE CASCADE`, `created_at`, `unique(product_id)` |
| `custom_print_requests` | (migration-only, see above): UUID PK, type, product_name, budget, description, email, phone_number, timestamp, status, created_at/updated_at |
| `testimonials` | (migration-only, see above): UUID PK, customer_name, rating, testimonial, verified_purchase, product_id FK, contact, timestamp, status, created_at/updated_at |

## Views

- `review_stats`: `SELECT product_id, count(*) AS total_reviews, round(avg(rating):numeric, 2) AS average_rating, max(created_at) AS latest_review_date FROM reviews GROUP BY product_id`. Read by `GET /api/reviews/product/[id]`.
- `public_reviews`: sanitized projection of `reviews` (drops `email` and `phone_number`) so anon reads never expose contact PII. Reads resolve with the owner (postgres) privileges. Read by `GET /api/reviews/product/[id]`.

## Row Level Security (RLS)

RLS is **enabled** on: `products`, `product_images`, `product_customizations`, `customization_options`, `product_customizations_json`, `profiles`, `orders`, `order_items`, `edit_logs`, `admin_credentials`, `blogs`, `cadathon_settings`, `cadathon_signups`, `cadathon_announcements`, `reviews`, `custom_print_requests`, `testimonials`. 

**Not** enabled: `stem_box_products` (join-only table; exposed rows are just product FKs).

Summary by table:

| Table | Policy model |
|-------|--------------|
| **Product catalog** (products, images, customizations, options, JSON) | SELECT public; INSERT/UPDATE/DELETE **`USING (true)`**: writes are unrestricted at the DB level and secured only by the API's `verifyAdminPassword()`. |
| `profiles` | Users read/update/insert **own row** (`auth.uid() = id`); service role reads all. |
| `orders` / `order_items` | Users read own (items via subquery on orders); service role manages all. |
| `edit_logs` | SELECT allowed; INSERT allowed (append); UPDATE/DELETE denied (`USING (false)`): immutable audit trail. |
| `admin_credentials` | SELECT allowed (for password verification); INSERT/UPDATE/DELETE denied: managed only via the Supabase dashboard. |
| `blogs` / `cadathon_announcements` | Public SELECT; admin ALL. |
| `cadathon_settings` | Public SELECT; service-role ALL. |
| `cadathon_signups` | User insert **own** row: and **only while `registration_open`** (subquery on `cadathon_settings`); user reads own; public reads (for the map); service-role ALL. |
| `reviews` | Public INSERT (with check true); SELECT/UPDATE/DELETE **service-role only**: anon reads go through the `public_reviews` view. |
| `testimonials` | Public INSERT; public SELECT limited to `status = 'approved'`; UPDATE/DELETE service-role. |
| `custom_print_requests` | Public INSERT (customer form); SELECT/UPDATE/DELETE service-role. |

**Security model recap**: RLS is the *second* layer; the API's shared `lib/verify-password.ts` helper (env `ADMIN_PASSWORD` **or** `admin_credentials` table) is the *primary* auth for admin operations. Public/front-end data is readable by anon keys; privileged writes go through the login flow or the service-role client.

## Indexes

Non-default/foreign-key indexes (all created via `schema-reference.sql`): `products(category)`; `product_images(product_id)`; `product_customizations(product_id)`; `customization_options(customization_id)`; `orders(user_id)`, `orders(created_at desc)`; `order_items(order_id)`; `profiles(created_at desc)`; `edit_logs(admin_name, created_at desc, action, table_name)`; `admin_credentials(name)`; `cadathon_signups(email, location_state, user_id)`; `reviews(product_id, created_at desc)`; `stem_box_products(product_id)`. Migration-only tables index `timestamp` and `status`.

## Seed data

- **Products** (migration `20241005000000_seed_products.sql`): 6 products with explicit IDs, images (27 total), customizations, and JSON blobs (idempotent):

| ID | Product | Price | Notes |
|----|---------|-------|-------|
| 1 | Karambit Foldable Fidget Toy | $8.99 | Pin type, hilt + blade colors |
| 2 | Deathly Hallows Rotating Keychain | $3.49 | Color options |
| 3 | Chess Piece Set | $14.99 | No customizations |
| 4 | Avocado Keychain | $2.99 | Food Lounge collab (fundraiser) |
| 5 | Food Lounge Logo Keychain | $2.99 | Food Lounge collab (fundraiser) |
| 6 | Hexagon Fidget | $5.99 | Color + Size (Large +$2) |

- **Settings**: default `cadathon_settings` row (schema-reference).
- **Admin**: default `admin_credentials` row (schema-reference).

## Supabase Storage

- Bucket: **`product-images`** (referenced by `/api/upload`, the admin product/edit publishing features).
- `/api/upload` takes `multipart/form-data`, resizes via `sharp` to ≤1200px WebP q=80, and writes `{prefix}/{timestamp}-{rand}-{sanitized}.webp` with `upsert: false`.
- Images are served as public URLs (postimg.cc URLs for the seeded products; uploaded files use the Supabase public URL). Public assets like the cadathon map live in `public/`.

## Applying changes

1. Add a migration file `supabase/migrations/<timestamp>_<name>.sql` for the change.
2. Mirror it (idempotently) into `supabase/schema-reference.sql` for fresh setups.
3. To deploy: `supabase db push` / dashboard SQL editor. See `supabase/README.md` for details.