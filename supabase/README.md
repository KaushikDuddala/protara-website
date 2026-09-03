# Supabase

Database schema, migration, and Row Level Security (RLS) files for the Protara Printing Supabase project.

## Files

- **`schema-reference.sql`**: a consolidated, idempotent (`IF NOT EXISTS`) **mirror** of the current schema: tables, indexes, triggers, views, RLS policies, and seed data. Safe to run against an empty database (e.g. the Supabase SQL editor) to rebuild a schema, but it is **not** applied directly.
- **`migrations/`**: incremental, timestamped migrations. This is the authoritative apply path: `supabase db reset` / `supabase db push`. Apply new database changes here, never in `schema-reference.sql`.
- **`.temp/`**: local Supabase CLI artifacts. Never commit anything from this directory (already gitignored).

## Row Level Security (RLS)

RLS policies control who can access what data in your Supabase database. The policies are configured to:

- **Public access**: Customers can read product information and submit reviews, testimonials, and custom print requests
- **Write access**: Enforced at the API layer (password verification); admins manage products through the API only
- **Private submissions**: `testimonials` (public reads limited to `approved` rows), `custom_print_requests`, and `reviews` contact fields are only readable with the service role
- **Audit logs**: Append-only: reads allowed, updates/deletes denied
- **Admin credentials**: Protected from app-level tampering (managed via the Supabase dashboard)

### Policy Structure

#### Read Access (SELECT)

- **Products & Images**: Public (everyone can view)
- **Customizations**: Public (needed for product display)
- **Edit Logs**: Deferred to API authentication
- **Admin Credentials**: API-only (for authentication)

#### Write Access (INSERT, UPDATE, DELETE)

- **Products related tables**: Admin-only (enforced via API authentication)
- **Edit Logs**: System-only (append-only, no updates/deletes)
- **Admin Credentials**: Disabled (managed via Supabase dashboard only)
- **Reviews / Testimonials / Custom Print Requests**: Public INSERT (customer submissions); all other SQL restricted to the service role

## How Authentication Works

1. User submits password via `/api/products/verify-password`
2. The API confirms the password via the `admin_credentials` table (allowed by RLS policy) or the `ADMIN_PASSWORD` env var: shared helper `lib/verify-password.ts`
3. If the password matches, the admin name is returned
4. The API uses this admin name to create/update/delete products
5. Changes are logged to the `edit_logs` table with admin attribution

> **Note**: RLS allows the API to perform operations through the Supabase anon key. The actual authentication layer is enforced by the API's `verifyAdminPassword()` helper.

## Applying the Schema

A fresh database is fully built by running the migrations in order: `supabase db reset` (local) or `supabase db push` (remote). `schema-reference.sql` mirrors the end state for reference and can be run idempotently against an empty database as a fallback.

### Verifying RLS is Enabled

1. In the Supabase dashboard, go to **Authentication → Policies**
2. Select each table and verify policies are present:
   - `products`, `product_images`, `product_customizations`, `customization_options`, `product_customizations_json`
   - `edit_logs`, `admin_credentials`
   - `profiles`, `orders`, `order_items`
   - `blogs`, `cadathon_*`, `review_stats`/`public_reviews` (views), `stem_box_products`
   - `reviews`, `testimonials`, `custom_print_requests`

Each should show the expected read/write policies.

## Troubleshooting

### "Permission denied" errors

1. Check that RLS is enabled on the table (visible as a toggle in the Supabase dashboard)
2. Verify the policies are listed under the table's Policies tab
3. Ensure you're using the correct Supabase keys in `.env.local`

### Edit logs not appearing

1. Verify the `edit_logs` table exists
2. Check that the INSERT policy on `edit_logs` is enabled
3. Look at API logs to see whether `logEdit()` is being called

### Can't update admin credentials

This is intentional! To add new admins:

1. Go to the Supabase dashboard
2. Navigate to the `admin_credentials` table
3. Manually insert a new row with name and password
4. Never modify via the API

## Security Notes

- RLS policies add a **second layer** of protection after API authentication
- The API's `verifyAdminPassword()` helper (table or `ADMIN_PASSWORD` env var) is the **primary** authentication mechanism
- PII (review contact info, testimonial contact, custom print request email/phone) is only readable by the service role; the public surface for reviews is the sanitized `public_reviews` view
- Even if an attacker bypasses the API, RLS prevents unauthorized database access
- Passwords in `admin_credentials` are stored in **plain text** (consider hashing them for production)

For production, consider:

1. Hashing passwords with bcrypt
2. Adding rate limiting to password verification
3. Using Supabase auth instead of a custom password system
4. Enabling database audit logging