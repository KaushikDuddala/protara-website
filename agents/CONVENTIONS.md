# Conventions: How to Build Things

Standards every change must follow. These mirror `CONTRIBUTING.md` and the observed patterns in the codebase. When in doubt, match the surrounding file: existing code is the best spec.

## Environment and commands

- Package manager: the repository uses **npm**. Install with `npm install`.
- Verify before finishing: `npx tsc --noEmit` (must be clean), `npm run build` (must succeed: lint and type errors fail the build), `npm run lint`.
- Prettier is the configured formatter. No Prettier config lives in the repo; follow the existing formatting (2-space indent, no semicolons **not enforced**: actually match the file you edit).

## File naming and organization

- **Kebab-case** filenames everywhere (e.g. `use-pin-progress.ts`, `product-showcase.tsx`). Hook+types that are siblings stay colocated (`hooks/use-products.ts`).
- Keep type names aligned with filenames (`hooks/use-products.ts` exports `Product`/`Customization` used app-wide).
- Directory purpose (see `ARCHITECTURE.md` for the full map):
  - `app/`: pages, layouts, API routes, **page-specific** components.
  - `app/components/`: feature components tied to a route/page.
  - `components/`: shared components; primitives in `components/ui/`.
  - `contexts/`: providers (`auth-context.tsx`, `cart-context.tsx`).
  - `hooks/`: reusable hooks; return boolean/object directly (e.g. `useReducedMotion() → boolean`).
  - `lib/`: integrations, supabase clients, shared types, utilities.
  - `supabase/migrations/`: DB schema changes; mirror idempotently into `supabase/schema-reference.sql`.

## TypeScript and doc conventions

- **TypeScript strict**. Type everything; avoid `any` (existing code already avoids it).
- **Every exported non-component function must have a TSDoc comment** with `@param` (names + expectations) and `@returns`. Follow the existing style in `lib/geocode.ts`, `lib/editLogger.ts`, `hooks/*`.
- **Every React component declares a `Props` interface** (or inline object type) with per-prop comments, plus a block comment above the component explaining its purpose (see `components/smooth-scroll.tsx`, `contexts/cart-context.tsx`).
- **Import order** (blank lines between groups):
  1. React / Node stdlib / type-only imports
  2. external libraries (`next`, `@supabase/...`, `lucide-react`, `stripe`)
  3. local modules: `@/...` aliases (components, contexts, hooks, lib)
  4. JSON / static assets
- Use the `@/` path alias for local imports (configured in the project).

## Component structure

- State variables (`useState`/`useReducer`) declared at the top; effects (`useEffect`) just before the `return`. Hook calls at the top of the component.
- Keep handlers small and named (`handleAddToCart`, etc.).
- Extract shared logic to hooks/utilities rather than duplicating across pages: dedupe wins.

## Comment style

- Explain **why**, not what. No mirroring-the-code comments, no AI-sounding prose, no fanfare.
- Remove commented-out code; don't introduce new commented-out blocks.
- `TODO:` / `FIXME:` are fine when they point at a concrete next step.
- No emojis in code/comments unless the surrounding file already uses them.

## Data and state rules

- **Client components fetch from `/api/*`**: not Supabase directly: except through the established hooks (`useProducts`, auth/cart contexts).
- Prefer the **server** Supabase client (`lib/supabase/server.ts`) in API routes; the **admin** client (`lib/supabase/admin.ts`) only for service-role operations that RLS would block; the **browser** client (`lib/supabase/client.ts`) only in client code.
- **Do not add RLS bypasses casually.** Writes for the product catalog are deliberately guarded at the API layer (`verifyAdminPassword`); keep that reality in mind.
- Cart items merge on `id + color`; `localStorage` key is `"protara-cart"`. Don't change the persistence contract without migrating stored carts.
- `edit_logs.record_id` is `bigint`: the logger (`lib/editLogger.ts`) coerces to `Number` and stores `null` for non-integer ids. Keep books.
- Shipping ($9.99) lives in `lib/shipping.ts` (`SHIPPING_COST` / `SHIPPING_LABEL`); both checkout and the webhook read it: don't hardcode the amount or label elsewhere.

## Authentication rules

- Customer auth flows go through `useAuth()` methods; never talk to `supabase.auth` directly in page code.
- Admin auth goes through the shared `lib/verify-password.ts` helper (env `ADMIN_PASSWORD` first, then `admin_credentials` table). Transport the password the way the existing route does: body for most CRUD, `?password=` for some lists, `x-admin-password` header for review admin.
- Never log passwords or secrets. The webhook secret and Stripe keys are env-only (`STRIPE_WEBHOOK_SECRET` has no fallback).

## Design compliance

- Use the design tokens (`molten`, `resonance`, `obsidian`, `chrome`, `steel`) as Tailwind utilities; don't introduce arbitrary hex colors.
- Respect `prefers-reduced-motion` (use `useReducedMotion` in JS; the global CSS already kills animations).
- Decorative elements: `aria-hidden` + `pointer-events-none`; interactive elements need visible focus.
- On the home page, honor native scroll-snap; don't re-add Lenis there.

## Accessibility checklist (before you call it done)

- Keyboard operable + visible focus.
- Color is never the only signal (add labels/icons/borders).
- `alt`/`aria-label` for images and icon-only buttons.
- Motion respects reduced-motion.
- Contrast maintained (steel/chrome on void/obsidian).

## Review checklist

- `npx tsc --noEmit` clean.
- `npm run build` succeeds.
- No unused imports, no dead code, no commented-out code.
- New DB changes: migration added AND mirrored into `schema-reference.sql`.
- API changes reflected in `agents/API.md` / `agents/DATABASE.md` if the surface changed.
- If a doc in `agents/` no longer matches code, fix the doc as part of the change.