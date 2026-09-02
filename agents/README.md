# Protara Reference Docs

Reference documentation for working with the **Protara Printing** front-end. These files describe the entire codebase: what the site is, where everything lives, how the code is structured, the design system, and the database: so that an AI assistant and a new developer can find the right file and build confidently.

## What this site is

**Protara Printing** is a custom 3D printing business. The site is its storefront, portfolio, and community hub combined:

- **E-commerce**: customers browse the catalogue, customize fidget toys/keychains/chess sets, and pay via Stripe Checkout.
- **Community**: a "Cadathon": a community design competition with its own landing page, signups, participant map, announcements, and an in-app countdown banner.
- **Outreach**: a fundraising / STEM-box program for schools and food-access nonprofits (Food Lounge collaboration).
- **Content**: a blog, customer testimonials, product reviews, and a "custom print request" funnel.
- **Admin**: a password-gated dashboard for managing products, reviews, testimonials, custom requests, blog posts, cadathon settings, STEM boxes, and an edit/audit log.

The brand identity is a dark **"Cinematic Industrial"** theme: deep blacks and metallic grays with an orange (`molten`) and blue (`resonance`) accent system, techy HUD-style labels, and heavy scroll-driven animation.

## How to use these docs

Read the index of files below and open whichever is relevant to your task. If you are making a change, also read `CONVENTIONS.md` first: it defines the coding standards every change must follow (TSDoc, naming, comment style, structure). The docs are written to reflect the actual code; if you find a mismatch, correct the doc or add a note.

## AI-assisted changes

This folder is written to be read by **AI coding assistants** as well as people, so an agent can pick up the project's context quickly. Contributions produced with AI assistance follow the same bar as any other change:

- **Humans decide.** The direction of a change and its acceptance are always a person's call.
- **Humans read everything.** Every AI-assisted pull request is read in full by a human before it merges: nothing ships on an assistant's say-so.
- **Only what's needed.** AI output is included only when it is genuinely necessary for the task; speculative or unverifiable additions are left out.

For people, this folder is intentionally small enough to serve as a quick reference when starting on the codebase.

| File | What it covers |
|------|----------------|
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Tech stack, rendering model, directory map, data flow, providers, middleware, configs |
| [`ROUTES.md`](ROUTES.md) | Every page (public + admin), navigation, and the page-level components in `app/components/` |
| [`API.md`](API.md) | Every API route, the Supabase client layers, and the authentication model |
| [`COMPONENTS.md`](COMPONENTS.md) | Shared components, `components/ui` primitives, contexts, and hooks |
| [`DATABASE.md`](DATABASE.md) | Database schema, migrations, RLS policies, seed data, and Supabase Storage |
| [`DESIGN.md`](DESIGN.md) | The visual system: design tokens, typography, motion, and accessibility |
| [`CONVENTIONS.md`](CONVENTIONS.md) | Coding standards for building: naming, comments, structure, imports, quality bars |

## Quick facts

- **Stack**: Next.js 15 (App Router), React 19, TypeScript (strict), Tailwind CSS, Supabase, Stripe, GSAP + Lenis, Framer Motion, shadcn/ui + Radix.
- **Rendering**: almost the entire site is client-side. Components fetch data by calling the app's own API routes (fetch to `/api/*`) rather than talking to Supabase directly.
- **Auth**: two separate models: customer auth (Supabase Auth, via `contexts/auth-context.tsx`) and admin auth (password check against `ADMIN_PASSWORD` / `admin_credentials`, via `/api/products/verify-password`).
- **Payments**: Stripe Checkout session created by `/api/create-checkout-session`; the `/api/stripe-webhook` handler records orders.
- **Verification**: `npx tsc --noEmit` and `npm run build` must pass before you consider work done. `npm run lint` runs ESLint; Prettier is the formatter.