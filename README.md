# Protara Front-End

The front-end for Protara Printing, a custom 3D printing service that sells decorative, functional, and community-designed printed products. A Next.js app backed by Supabase (auth, database, storage) and Stripe (checkout).

## Contribution

See [CONTRIBUTING](CONTRIBUTING.md) for how to contribute. Please read the [code of conduct](CODE_OF_CONDUCT.md) first.

## Tech Stack

- **Next.js 15** (App Router): framework and server-side rendering
- **React 19**: component model
- **TypeScript**: typed JavaScript
- **Tailwind CSS**: styling, with a custom dark "Cinematic Industrial" theme
- **Supabase**: auth, Postgres database, and file storage
- **Stripe**: payments
- **GSAP + Lenis**: scroll animation and smooth scrolling
- **shadcn/ui + Radix**: accessible UI primitives

## Setup

The repository uses `npm` as the package manager.

```bash
git clone <your-repo-url> protara-front-end
cd protara-front-end
npm install
```

You will need `node` installed locally (see the [Node.js website](https://nodejs.org/)).

### Environment Variables

Create a `.env.local` file in the repository root. The following variables are required for the app to run:

```env
NEXT_PUBLIC_SUPABASE_URL="[Supabase project URL]"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[Supabase anon/public key]"
SUPABASE_SERVICE_ROLE_KEY="[Supabase service role key - server only]"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="[Stripe publishable key]"
STRIPE_SECRET_KEY="[Stripe secret key - server only]"
STRIPE_WEBHOOK_SECRET="[Stripe webhook signing secret - server only]"
ADMIN_PASSWORD="[Password for the admin dashboard]"
```

Do not commit real values for these. The `.gitignore` already excludes `.env*` files.

### Database

The database schema, migration, and Row Level Security (RLS) files live in `supabase/`. See the [database README](supabase/README.md) for how the schema is organized and how to apply it to your Supabase project.

## Running the App

```bash
npm run dev    # Start the development server
npm run build  # Create a production build
npm run start  # Start the production server
npm run lint   # Run the linter (ESLint used by Next.js)
```

## Project Structure

```
app/          - Next.js App Router pages, API routes, and app-specific components
agents/       - Reference docs for AI agents (also a quick on-ramp for new devs)
components/   - Shared and reusable components
    | ui      - shadcn/ui primitives
contexts/     - React context providers (auth, cart)
hooks/        - Custom React hooks
lib/          - Utilities, Supabase clients, and TypeScript types
public/       - Static assets
supabase/     - Database schema, RLS policies, and migrations
```

## Documentation

Additional documentation:

- **agents/**: reference docs for AI agents (architecture, routes, API, components, database, design system, and coding conventions). Kept small, it also works as a quick reference for new developers.

## AI-Assisted Development

AI coding assistants are used occasionally. The rules:

- **Humans make the decisions.** An assistant never decides what lands in the repo.
- **Humans read everything.** Every AI-assisted pull request is reviewed by a person before it merges.

Assistant output gets included only when it is needed for the change at hand. Output that no one understands, or that is not required, gets dropped. The `agents/` folder gives an assistant the context to do useful work, and doubles as a quick reference for new developers.

## Learn More

- [Next.js documentation](https://nextjs.org/docs)
- [Supabase documentation](https://supabase.com/docs)
- [Stripe payments documentation](https://stripe.com/docs/payments)