# Components, Contexts, and Hooks

The shared building blocks outside `app/`. Page-level components live in `app/components/` and are documented in `ROUTES.md`.

## Global UX components (`components/`)

### `components/smooth-scroll.tsx`: `SmoothScroll`
Wraps children in **Lenis** smooth scrolling and drives **GSAP ScrollTrigger** from Lenis events.
- Props: `{ children: ReactNode }`. Renders `<>{children}</>`.
- Skips initialization on the home page (`pathname === "/"`, which uses native scroll-snap) and when `prefers-reduced-motion` is active.
- `lerp: 0.1`, `smoothWheel: true`; gsap `ticker` drives Lenis.

### `components/interactions/cursor-view.tsx`: `CursorView`
Custom cursor: 6px dot + trailing 24px ring. Over interactive elements (`a`, `button`, `[role="button"]`, `[data-cursor="view"]`, `.product-card`) the ring shows a "View" label.
- Hides on coarse pointers and reduced motion; `pointer-events-none`, `aria-hidden`, `z-[100]`.
- Dot color `bg-molten`; ring `border-white/40 mix-blend-difference`.

## UI primitives (`components/ui/`)

shadcn/ui components on Radix primitives, all styled with the dark "Cinematic Industrial" tokens. Only **13** exist: the rest were pruned. **Do not add new files here** for one-off needs; add a Radix wrapper only if a true repeated primitive is required, and keep the shadcn conventions.

| File | Exports | Base |
|------|---------|------|
| `alert.tsx` | `Alert`, `AlertTitle`, `AlertDescription` | `<div role="alert">`; variant `default \| destructive` |
| `alert-dialog.tsx` | `AlertDialog*`, `AlertDialogAction`, `AlertDialogCancel` | `@radix-ui/react-alert-dialog`; animation classes; `Action` uses `buttonVariants()` |
| `badge.tsx` | `Badge`, `badgeVariants` | pill; variants `default \| secondary \| destructive \| outline` |
| `button.tsx` | `Button`, `buttonVariants`, `ButtonProps` | `@radix-ui/react-slot` (`asChild`); variants `default \| destructive \| outline \| secondary \| ghost \| link`; sizes `default \| sm \| lg \| icon` |
| `card.tsx` | `Card`, `CardHeader`, `CardFooter`, `CardTitle`, `CardDescription`, `CardContent` | plain `<div>` wrappers, `rounded-lg border bg-card shadow-sm` |
| `collapsible.tsx` | `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` | direct re-exports of `@radix-ui/react-collapsible` |
| `input.tsx` | `Input` | styled `<input>`; `text-base md:text-sm` |
| `label.tsx` | `Label` | `@radix-ui/react-label` |
| `popover.tsx` | `Popover`, `PopoverTrigger`, `PopoverContent` | `@radix-ui/react-popover`; portal + animations |
| `select.tsx` | `Select*`, `SelectItem`, `SelectTrigger`, `SelectContent`, scrollers | `@radix-ui/react-select`; `position="popper"`; lucide chevrons/check |
| `switch.tsx` | `Switch` | `@radix-ui/react-switch` |
| `table.tsx` | `Table*`, `TableRow`, `TableCell`, ... | HTML wrappers; wrapper has `data-lenis-prevent` (keeps Lenis off horizontal scroll) |
| `textarea.tsx` | `Textarea` | styled `<textarea>`; `min-h-[80px]`, same ring style as `Input` |

All use `cn()` from `@/lib/utils` (from `class-variance-authority` + `tailwind-merge`).

## Contexts (`contexts/`)

### `auth-context.tsx`: `AuthProvider`, `useAuth()`
Customer auth built on Supabase Auth.
- State: `user` (`User \| null`), `session`, `profile` (`Profile \| null` from the `profiles` table), `isLoading`.
- Methods: `signUp(email, password, name)`, `signIn(email, password)`, `signOut()`, `resetPassword(email)`, `updatePassword(password)`, `refreshProfile()`: each returns `{ error? }` where relevant.
- Hydrates from `getSession()` on mount; subscribes to `onAuthStateChange`; fetches the profile whenever the user changes.
- Depends on `@/lib/supabase/client`.

### `cart-context.tsx`: `CartProvider`, `useCart()`, `CartItem`
Client cart state.
- `CartItem`: `{ id, name, price, material, category, image, description, quantity, color }`.
- State: `items`, `total` (sum price×qty), `itemCount`.
- Actions (dispatch): `ADD_ITEM` (merges by `id` + `color`), `REMOVE_ITEM`, `UPDATE_QUANTITY` (0 removes), `CLEAR_CART`, `LOAD_CART`.
- Persists to `localStorage` under key `"protara-cart"`; loads on mount, saves on items change.

## Hooks (`hooks/`)

| Hook | File | Signature → Return | Used by |
|------|------|--------------------|---------|
| `useProducts` | `hooks/use-products.ts` | `() => { products: Product[]; loading: boolean; error: Error \| null }` | Catalogue, product page, product-select, admin pages |
| `usePinProgress` | `hooks/use-pin-progress.ts` | `() => { ref: RefObject<HTMLElement>; progress: number }` | `home-film.tsx`, `product-showcase.tsx` |
| `useReducedMotion` | `hooks/use-reduced-motion.ts` | `() => boolean` | `smooth-scroll.tsx`, `cursor-view.tsx` |

**Important**: `use-products.ts` is the one client component that talks to Supabase directly (three tables: `products`, `product_images`, `product_customizations` + nested options). It exports its own `Product`/`Customization` types and builds a flat array ordered by `id` (mirrors the shape `/api/products` returns). Don't break this contract: components depend on `images: string[]` and `customizations` with `options[]` + `priceDelta`.

## Shared types (`lib/types/product.ts`)

`Product { id, name, price, material, category, images: string[], description, detailedDescription?, specifications?, customizations?, community_designed? }` and `Customization { type, label, options: string[], priceDelta: { [k: string]: number } }`. Used by the API routes and admin pages. (`hooks/use-products.ts` re-declares equivalent types for its own Supabase query.)

## When to add code here vs in `app/components/`

- **`components/`** = shared across routes (nav-agnostic primitives, global UX, contexts, hooks, types).
- **`app/components/`** = page/feature-specific components tied to a route or a business feature (home sections, review UI, cadathon UI).

If a page would be the only consumer of a new component, put it in `app/components/` next to the page.