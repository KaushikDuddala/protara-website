# Architecture

How the Protara front-end is put together: stack, rendering model, directory map, providers, and data flow. Read this before touching anything structural.

## Tech stack

| Concern | Technology | Notes |
|---------|-----------|-------|
| Framework | **Next.js 15** (App Router) | Turbopack dev server (`npm run dev --turbopack`) |
| UI | **React 19** | |
| Language | **TypeScript** (strict) | |
| Styling | **Tailwind CSS 3** + `@tailwindcss/typography` + `tailwindcss-animate` | Custom dark theme ("Cinematic Industrial") |
| UI primitives | **shadcn/ui** ("default" style, neutral base) on **Radix UI** | 13 kept primitives in `components/ui/` |
| Icons | **lucide-react** | |
| Backend | **Supabase** | Auth, Postgres database, Storage |
| Payments | **Stripe** | Checkout sessions + webhook |
| Animation | **GSAP + Lenis** (scroll), **Framer Motion** (in-page motion) | |
| Analytics | **@vercel/analytics** | Rendered in root layout |
| Image processing | **sharp** | Upload route resizes to WebP |
| Fonts | **Space Grotesk** (headings), **Inter** (body) via `next/font/google` | |

## Rendering model

The site is **predominantly client-rendered**. Every page file carries `"use client"` except for three server components:

- `app/layout.tsx`: the root layout
- `app/contact/page.tsx`: the contact page (static cards)
- `app/components/cadathon-participant-map.tsx`: a static world-map image

Consequences for anyone making changes:

- Pages fetch data with **`fetch()` calls to the app's own `/api/*` routes** from client components; they do **not** import the Supabase browser client directly (the one exception is `hooks/use-products.ts`, which queries three Supabase tables directly).
- There is **no `not-found.tsx`, `error.tsx`, `loading.tsx`, or `template.tsx`** anywhere. Routes rely on graceful in-component fallbacks.
- `next.config.mjs` sets `images: { unoptimized: true }`: no Next image optimization; plain `<img>` / backgrounds are expected.

## Directory map

```
.
├── agents/                  ← reference docs for AI agents
├── app/                     ← App Router: pages, layouts, API routes, app-level components
│   ├── api/                 ← all route handlers (see API.md)
│   ├── components/          ← page-level / feature components (see ROUTES.md)
│   ├── admin/               ← password-gated dashboard pages + admin layout
│   ├── blog/[slug]/         ← blog post pages
│   ├── outreach/stem-boxes/ ← STEM box kit page
│   ├── product/[id]/        ← product detail page
│   ├── globals.css          ← global styles, design tokens, utilities
│   └── layout.tsx           ← root layout (providers, nav, fonts)
├── components/              ← shared components
│   ├── interactions/        ← cursor-view.tsx
│   ├── ui/                  ← shadcn/ui primitives (13 files)
│   └── smooth-scroll.tsx    ← Lenis + GSAP scroll wrapper
├── contexts/                ← React context providers (auth, cart)
├── hooks/                   ← custom React hooks (products, reduced motion, pin progress)
├── lib/                     ← utilities & integrations
│   ├── supabase/            ← client, server, admin clients
│   ├── types/               ← shared TypeScript types (product.ts)
│   ├── editLogger.ts        ← audit-log writer
│   ├── geocode.ts           ← cadathon geocoding helper
│   └── utils.ts             ← cn() class merging
├── public/                  ← static assets (placeholder.svg, cadathon map, banner, terms.html)
├── supabase/                ← schema-reference.sql, migrations/, README.md
├── middleware.ts            ← session refresh + /account route protection
├── next.config.mjs          ← images.unoptimized only
├── tailwind.config.ts       ← theme tokens, keyframes, plugins
├── postcss.config.mjs       ← tailwindcss only
└── package.json             ← npm scripts, dependencies
```

## Providers and global wrappers

Everything is composed in `app/layout.tsx` (server component):

```
<html class="dark">
  <body class="[--font-heading][--font-body] font-body">
    <Analytics />
    <SmoothScroll>              ← Lenis smooth scrolling + GSAP ScrollTrigger sync
      <AuthProvider>            ← Supabase session, profile, signIn/signOut/etc.
        <HackathonBanner />     ← fixed cadathon countdown banner
        <CartProvider>          ← cart state + localStorage persistence, Navigation inside
          <Navigation />
          {children}
        </CartProvider>
      </AuthProvider>
    </SmoothScroll>
    <CursorView />              ← custom cursor dot + ring overlay
  </body>
</html>
```

Notes:

- The `dark` class is hardcoded on `<html>`; there is no theme switching (next-themes is not installed).
- Fonts are loaded via `next/font/google` and exposed as CSS variables `--font-heading` (Space Grotesk) and `--font-body` (Inter). `body` uses `font-body`.
- `SmoothScroll` **skips Lenis on the home page** (native snap scrolling) and when `prefers-reduced-motion` is active.
- `CursorView` hides on coarse pointers and reduced motion.

## Data flow

1. **Pages** (client components) call `useAuth()`, `useCart()`, `useProducts()`, or plain `fetch()` to `/api/*`.
2. **API routes** (server) use one of three Supabase access layers (see `API.md` / `lib/supabase/`):
   - `lib/supabase/server.ts`: SSR client respecting the user session and RLS (most routes).
   - `lib/supabase/client.ts`: browser singleton (contexts, hooks).
   - `lib/supabase/admin.ts`: service-role client that bypasses RLS (privileged writes).
3. **Supabase Postgres** holds all data; RLS is the second layer of protection (see `DATABASE.md`).
4. **Stripe** handles payments: `/api/create-checkout-session` builds a checkout session; `/api/stripe-webhook` inserts `orders`/`order_items` on successful payment.

## Middleware (`middleware.ts`)

Runs on every request except static assets (`_next/static`, `_next/image`, favicon, image file extensions).

- **Session refresh**: creates an SSR Supabase client, calls `auth.getUser()`, propagates any rotation cookies to both request and response. Works a lot like the cookie-handling in `lib/supabase/server.ts`.
- **Route protection**: all paths are public except `/account` (and sub-routes), which redirects to `/signin?redirect=<path>` when the user is not signed in. Note: `/checkout`, `/cadathon`, `/api`, etc. are public.
- **Production cookies**: in `NODE_ENV === "production"`, Supabase auth cookies are re-set with `httpOnly`, `secure`, `sameSite: "lax"`, `maxAge: 7 days`.

## Config files

- `next.config.mjs`: only `images: { unoptimized: true }`. Build-time typecheck/ESLint are **not** disabled; a lint/type error fails `npm run build`.
- `postcss.config.mjs`: `tailwindcss` only (no `autoprefixer`).
- `tailwind.config.ts`: dark-mode `["class"]`, content globs, container settings, and the custom theme tokens documented in `DESIGN.md`.
- `package.json` scripts: `build`, `dev` (turbopack), `lint`, `start`.

## Anti-patterns to preserve or avoid

- **Don't add** `loading.tsx`/`error.tsx` conventions implied but currently absent without checking intent.
- **Keep the internal-API pattern**: client components should call `/api/*`, not hit Supabase directly, except through the established hooks.
- **Keep shipping consistent**: $9.99 shipping is hardcoded in both `/api/create-checkout-session` and `/api/stripe-webhook`: if you change shipping, change both.
- **Don't reintroduce** the removed 3D/`ScrollScene` system or the deleted Radix primitives; they were intentionally pruned.