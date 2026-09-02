# Routes and Pages

Every route the app serves, what each page renders, and the feature components in `app/components/`. API routes are documented separately in `API.md`. All pages are client components unless noted.

## Navigation

`app/components/navigation.tsx` is the fixed top bar rendered on every page (from the root layout and the admin layout):

- Protara logo (link home), cart icon with item count from `useCart()`.
- User menu: Sign in / Account / Sign out, driven by `useAuth()`.
- Mobile hamburger → full-screen slide-in drawer.
- Auto-hides on scroll-down, reappears on scroll-up: always shown on the home and catalogue pages.

## Public pages

### `/`: Home (`app/page.tsx`)
Fetches approved testimonials on mount, then renders, in order:
1. `HomeFilm`: scroll-pinned hero with animated intro + CTA
2. `FunnelStrip`: marketing funnel strip
3. `StatsBeat`: key statistics
4. `ProductShowcase`: pinned horizontal product streak
5. `CustomPrintBeat`: custom-printing CTA
6. `TestimonialCarousel`: rotating testimonials
7. `ContactSection`: contact cards + footer

The home page uses native CSS `scroll-snap` (the `home-snap` class); `SmoothScroll` intentionally skips Lenis here.

### `/catalogue` (`app/catalogue/page.tsx`)
Product grid from `useProducts()` with text search, category filter buttons, and a sort dropdown. Product cards navigate to `/product/[id]`. Catalogue cards also show `ReviewStats`.

### `/product/[id]` (`app/product/[id]/page.tsx`)
Single product detail: `ImageCarousel` gallery, name/price/category/description, customization options with price deltas, `ReviewStats`, `ReviewsList`, and `ReviewForm`.

### `/cart` (`app/cart/page.tsx`)
Line items from `useCart()` with quantity adjusters (+/−), remove, and "proceed to checkout".

### `/checkout` (`app/checkout/page.tsx`)
Calls `/api/create-checkout-session` and redirects to the Stripe-hosted payment page. Supports signed-in and guest (email) checkout. Public: the route protection only applies to `/account`.

### `/checkout-success` (`app/checkout-success/page.tsx`)
Post-payment confirmation; clears the cart on mount.

### `/checkout-cancelled` (`app/checkout-cancelled/page.tsx`)
Shown when checkout is abandoned or fails.

### Auth pages (`app/signin`, `app/signup`, `app/forgot-password`, `app/reset-password`)
All wrapped in `AuthShell` (two-column branded layout) and driven by methods on `useAuth()`:
- `/signin`: reads `useSearchParams()`; wrapped in `<Suspense>`; honors `?redirect=` for post-login redirect.
- `/signup`: `signUp(email, password, name)`.
- `/forgot-password`: `resetPassword(email)`.
- `/reset-password`: listens for Supabase `PASSWORD_RECOVERY` events and calls `updatePassword`.

### `/account` (`app/account/page.tsx`)
Protected by middleware (redirects to `/signin` when signed out). Two tabs:
- **Profile**: edit name, phone, age, city, state, country via PUT `/api/account`.
- **Order History**: from GET `/api/orders`.

### `/blog` (`app/blog/page.tsx`) and `/blog/[slug]` (`app/blog/[slug]/page.tsx`)
Blog index (featured post + grid) and post detail. Post bodies support YouTube/Vimeo embeds via URL detection + iframe.

### `/submit-testimonial` (`app/submit-testimonial/page.tsx`)
Testimonial form: star rating, customer name, text, optional product via `ProductSelect`. POSTs to `/api/testimonials`.

### `/custom-print-request` (`app/custom-print-request/page.tsx`)
Two modes: text request or 3D-model file upload. POSTs to `/api/custom-print-request`.

### `/cadathon` (`app/cadathon/page.tsx`)
Cadathon event page: countdown to event date, event details, signup form (POST `/api/cadathon/signups`, requires sign-in), announcements (GET `/api/cadathon/announcements`), and the participant map.

### `/outreach` (`app/outreach/page.tsx`)
Outreach landing: hero, fundraiser product cards (hardcoded product IDs `[4, 5]`, i.e. the Food Lounge items), STEM Boxes section linking to `/outreach/stem-boxes`, educator info.

### `/outreach/stem-boxes` (`app/outreach/stem-boxes/page.tsx`)
Gets STEM Box products from `/api/stem-boxes` and renders add-to-cart kit cards.

### `/team` (`app/team/page.tsx`)
Team page by department (Leadership, Marketing, Outreach, R&D). All data is hardcoded.

### `/contact` (`app/contact/page.tsx`)
**Server component.** Static cards with email (mailto), phone (tel), Instagram link.

### `/fundraiser` (`app/fundraiser/page.tsx`)
Fetches fundraiser products (hardcoded IDs `[4, 5]`) and renders product cards with add-to-cart.

## Admin pages (`app/admin/`)

`app/admin/layout.tsx` wraps admin pages with `Navigation`. **There is no layout-level auth guard**: each admin page performs its own password check against `/api/products/verify-password`.

| Route | Page | Purpose |
|-------|------|---------|
| `/admin` | `app/admin/page.tsx` | Password gate → dashboard with links to every section |
| `/admin/products` | `app/admin/products/page.tsx` | Full product CRUD: create/edit/delete, drag-and-drop image reorder, image upload |
| `/admin/reviews` | `app/admin/reviews/page.tsx` | View/delete reviews per product (product selector dropdown) |
| `/admin/testimonials` | `app/admin/testimonials/page.tsx` | Approve / reject / delete testimonials, grouped by status |
| `/admin/custom-requests` | `app/admin/custom-requests/page.tsx` | List, view, and delete custom print requests (search/filter) |
| `/admin/blogs` | `app/admin/blogs/page.tsx` | Blog CRUD with image upload |
| `/admin/cadathon` | `app/admin/cadathon/page.tsx` | Cadathon settings, announcements CRUD, signups list |
| `/admin/editLog` | `app/admin/editLog/page.tsx` | Filterable table of product/testimonial change history |
| `/admin/stem-boxes` | `app/admin/stem-boxes/page.tsx` | Toggle products in/out of the STEM Box collection |

## Page-level components (`app/components/`)

| File | Purpose |
|------|---------|
| `navigation.tsx` | Fixed nav + cart badge + user menu + mobile drawer |
| `auth-shell.tsx` | Two-column branded auth layout (`title`, `subtitle`, `icon`, `children` props) |
| `hackathon-banner.tsx` | Fixed cadathon countdown banner; collapses on scroll on home |
| `home-film.tsx` | Exports `HomeFilm`, `FunnelStrip`, `StatsBeat`, `CustomPrintBeat`: Framer Motion scroll animations |
| `product-showcase.tsx` | Pinned horizontal product streak; uses `usePinProgress` |
| `testimonial-carousel.tsx` | Auto-advancing 3-column carousel (arrows, dots, pause/play, hover-pause, 4s interval) |
| `contact-section.tsx` | Contact cards + footer ("PROTARA" branding, Terms link, copyright) |
| `reviews-list.tsx` | Fetches + renders product reviews; `refreshTrigger` prop to refetch; uses `ReviewCard` |
| `review-card.tsx` | Single review card (stars, title, name, text, item bought, date; molten hover border) |
| `review-stats.tsx` | Inline average + count from the reviews API; used in product page + catalogue cards |
| `review-form.tsx` | Star rating + fields form; POSTs to `/api/reviews` |
| `product-select.tsx` | Searchable popover product picker (`useProducts()`), used by testimonial form |
| `cadathon-participant-map.tsx` | Server component: static world map image (`/cadathon_world_map.png`) |
| `ui/image-carousel.tsx` | Win, memoized sliding carousel (dots, arrows, optional autoplay, translateX-based) |