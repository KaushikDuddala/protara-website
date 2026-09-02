# API Routes and Data Layer

Every API endpoint, the Supabase client layers, and how authentication works. If you change an endpoint, keep this file in sync.

## Supabase client layers (`lib/supabase/`)

| File | Export | Role |
|------|--------|------|
| `lib/supabase/server.ts` | `createClient()` (async) | **Server** SSR client (`@supabase/ssr`), backed by Next `cookies()`. Respects the user session + RLS. Used by most routes. |
| `lib/supabase/client.ts` | `createClient()` + `supabase` singleton | **Browser** client for client components (contexts, `use-products.ts`). |
| `lib/supabase/admin.ts` | `createAdminClient()` | **Service role** client (`@supabase/supabase-js` + `SUPABASE_SERVICE_ROLE_KEY`), bypasses RLS. Server-only; for privileged writes. |

Shared helpers: `lib/verify-password.ts` (`verifyAdminPassword(password) → adminName | null`, env `ADMIN_PASSWORD` first, then the `admin_credentials` table) and `lib/shipping.ts` (`SHIPPING_COST` = 9.99, `SHIPPING_LABEL`).

## Authentication model

Three independent mechanisms coexist:

1. **Customer auth (Supabase session)**: the API calls the server client's `getSession()`/`getUser()`; used by `account`, `orders`, `cadathon/signups` (POST), and `create-checkout-session` (optional metadata).
2. **Admin auth**: one shared helper, `verifyAdminPassword(password)` from `lib/verify-password.ts`:
   - Checks `ADMIN_PASSWORD` env var first (returns `"admin"`), then the `admin_credentials` table (returns the admin name for attribution in `edit_logs`). Returns `null` when neither matches.
   - Password transport varies by route: body for most CRUD, `?password=` query for lists, `x-admin-password` header for review admin.
   - The login endpoint is POST `/api/products/verify-password`.
3. **Stripe signature**: `/api/stripe-webhook` verifies the request with `stripe.webhooks.constructEvent` using env `STRIPE_WEBHOOK_SECRET` (no fallback; 500 if unset).

## Route reference

All paths are relative to `app/api/`. Use the **server** client unless stated.

### `POST /api/products/verify-password`
Verifies an admin password via the shared `verifyAdminPassword()` helper (env `ADMIN_PASSWORD` or `admin_credentials` table) → `{ success, adminName }` or 401. This is the front-end's admin login.

### `GET /api/products`
Public. Joins `products` + `product_images` (+`position`) + `product_customizations` with nested `customization_options`, maps to the flat `Product` type (see `lib/types/product.ts`). Ordered by `id` asc.

### `POST/PUT/DELETE /api/products/manage`
Admin product CRUD (password from body, checked via the shared helper).
- **POST**: insert product, then images, customizations + options, and the flattened `product_customizations_json`; logs a CREATE to `edit_logs`.
- **PUT**: diff old vs new (fields + images + customizations) and log an UPDATE edit only when changes exist; deletes + reinserts images/customizations; upserts the JSON blob.
- **DELETE**: delete product (cascades), log a DELETE edit.

### `POST /api/upload`
Admin image upload to Supabase Storage. Multipart form: `file` (required), optional `bucket` (default `"product-images"`) and `prefix`. **sharp** resizes to max 1200px wide and converts to WebP q=80; filename `{prefix}/{timestamp}-{rand}-{sanitized}.webp`. Returns `{ url }`. Uses the **admin** client.

### `POST /api/create-checkout-session`
Creates a Stripe Checkout session from `{ items }`. Builds `line_items` from `price_data` (USD, name, metadata: material, id, customizations; `unit_amount = price*100`) **plus a shipping line item using `SHIPPING_LABEL` / `SHIPPING_COST` from `lib/shipping.ts`** (name "Shipping"). Session: card payments, automatic tax, US/CA shipping addresses, promotion codes, `mode: "payment"`, success URL `/checkout-success?session_id=...`, cancel URL `/checkout-cancelled`. If signed in, sets `customer_email` + `metadata.user_id`. Returns `{ sessionId }`.

### `POST /api/stripe-webhook`
Verifies the Stripe signature (env `STRIPE_WEBHOOK_SECRET` only: 500 if unset, no hardcoded fallback). On `checkout.session.completed`: reads line items, computes subtotal/total (cents→dollars), inserts an `orders` row (`stripe_session_id`, `status: "completed"`, `shipping: SHIPPING_COST`, addresses, email, `user_id` from metadata) and an `order_items` row per non-Shipping item (filtered by `description !== SHIPPING_LABEL`). Sends an ntfy.sh push notification.

### `GET /api/orders`
Returns all `orders` for the signed-in user (`user_id = session.user.id`), `created_at` desc. 401 without a session.

### `PUT /api/account`
Updates the signed-in user's `profiles` row (name, phone, age, city, location_state, country). Age is `parseInt`-ed or null.

### Blogs: `GET/POST/PUT/DELETE /api/blogs`
- `GET`: all blogs (`created_at` desc) or single blog if `?slug=` given.
- `POST`: create blog; auto-slugifies the title (retries with `{slug}-{Date.now()}` on unique violation); optional `image_url`/`video_url`. Admin client.
- `PUT`: update by `id` (set `updated_at`, re-slugify on title change).
- `DELETE`: delete by `id` via query param.
- Admin via `ADMIN_PASSWORD` env **or** `admin_credentials`.

### Cadathon: `app/api/cadathon/`
- `GET/PUT /api/cadathon/settings`: single-row settings; GET falls back to `DEFAULT_SETTINGS`; PUT upserts (env/table admin check).
- `GET/POST/PUT/DELETE /api/cadathon/announcements`: announcements CRUD (admin via env/table; content required).
- `GET/POST /api/cadathon/signups`: POST requires a session, reads profile name, calls `geocodeLocation()` (`lib/geocode.ts`) for lat/lng, rejects duplicates (409). GET is multi-mode: `?userId=` → registered boolean; `?groupBy=state` or no params → public aggregates; `?password=` → all signups via **admin** client.

### Reviews: `app/api/reviews/`
- `POST /api/reviews`: create review (validates required fields, 1: 5 rating). Uses the **server** client; anon INSERT allowed by RLS.
- `GET /api/reviews/product/[id]`: public reviews for a product via the sanitized `public_reviews` view (no email/phone), plus stats from the `review_stats` view. Server client.
- `DELETE /api/reviews/[id]`: admin (via `x-admin-password` header, shared helper) using the **admin** client.
- `GET /api/reviews/admin/all`: all reviews (incl. contact info) grouped by `product_id` (same header auth, admin client).

### Testimonials: `app/api/testimonials/`
- `POST /api/testimonials`: public submit; forces status `"pending"`; optional product link; validates rating and ≤500 char text.
- `GET /api/testimonials`: approved testimonials enriched with product name/slug/images.
- `POST/PUT/DELETE /api/testimonials/manage`: admin (shared helper + **admin** client): list all, approve/reject (status update + UPDATE edit log), delete (+ DELETE edit log).

### `app/api/custom-print-request/`
- `POST`: insert request (type request|upload, product_name, budget, description, email, phone_number, status). Public; anon INSERT allowed by RLS. Then best-effort ntfy.sh push to `https://ntfy.sh/protara_custom_requests`.
- `GET`: all requests, timestamp desc. Admin: password via `?password=` query; uses the **admin** client (RLS hides these rows from anon).
- `DELETE`: delete by `id` + `password`. Admin guard same as GET.

### `GET/POST/DELETE /api/stem-boxes`
- `GET`: `stem_box_products` with nested `products(*)`, `created_at` desc (admin client).
- `POST`: add product (409 on unique violation).
- `DELETE`: remove by `product_id`.
- POST/DELETE require password (shared helper); GET is public.

## Supporting libraries (`lib/`)

| File | Export | Purpose |
|------|--------|---------|
| `lib/utils.ts` | `cn(...)` | `clsx` + `tailwind-merge` class combiner. |
| `lib/editLogger.ts` | `logEdit(entry)`, types `EditAction`, `EditLogEntry` | Writes to `edit_logs`. Gotcha: `record_id` is `bigint`: non-integer IDs (UUIDs) are only stored when `Number.isInteger(...)`, else null. |
| `lib/geocode.ts` | `geocodeLocation(location)` | ZIP → Zippopotam; otherwise Nominatim (with `User-Agent: ProtaraServer/1.0`). Returns `{ lat, lng, resolvedState? }` or null. |
| `lib/verify-password.ts` | `verifyAdminPassword(password)` | Shared admin auth: `ADMIN_PASSWORD` env first, else `admin_credentials` table (`maybeSingle`). Returns admin name or `null`. |
| `lib/shipping.ts` | `SHIPPING_COST`, `SHIPPING_LABEL` | Single source for the $9.99 US shipping charge used by checkout + webhook. |
| `lib/types/product.ts` | `Product`, `Customization` | Canonical product types used by API routes and the admin pages. |

## Tables touched (quick map)

`profiles` (account, cadathon signups) · `products` / `product_images` / `product_customizations` / `customization_options` / `product_customizations_json` (products routes, testimonials enrichment, stem-boxes join) · `orders` / `order_items` (orders, stripe-webhook) · `blogs` · `cadathon_settings` / `cadathon_signups` / `cadathon_announcements` · `reviews` (+`review_stats` view) · `testimonials` · `custom_print_requests` · `stem_box_products` · `edit_logs` · `admin_credentials` · Supabase Storage bucket `product-images`.

## Known friction points (fix with care)

- Admin password verification now lives in one shared helper (`lib/verify-password.ts`); don't reintroduce route-local copies.
- Review/admin routes use the `lib/supabase/` clients; don't reintroduce inline `@supabase/supabase-js` clients in routes.
- The Stripe webhook requires `STRIPE_WEBHOOK_SECRET`; there is deliberately no fallback.
- Shipping is centralized in `lib/shipping.ts`; keep the checkout line-item description equal to `SHIPPING_LABEL` (the webhook filters order items by it).