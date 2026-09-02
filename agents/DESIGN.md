# Design System

The "Cinematic Industrial" visual language. Dark, technical, curated motion. Read this before building any UI so new work matches the brand.

## Core principles

- **Dark-first**: near-black surfaces over deep backgrounds, with light gray text: never pure white-on-black feels.
- **Accent discipline**: orange `molten` is the single primary call-to-action color; blue `resonance` is reserved for the secondary/system accent (cadathon banner, secondary interactive states). Use sparingly.
- **Technical HUD flavor**: hairline borders, bracket/leader annotations, uppercase micro-labels, tabular numbers, subtle grid overlays.
- **Motion with intent**: scroll-pinned sequences on the home page, restrained in-page motion via Framer Motion; everything degrades cleanly with `prefers-reduced-motion`.
- **Glow, used surgically**: molten/resonance box-shadows on hero/marquee/major CTAs and product-card hover: not everywhere.

## Color tokens

Defined in `app/globals.css` (`:root`) and mirrored in `tailwind.config.ts` (extend.colors). Use the **Tailwind utilities** (`bg-molten`, `text-chrome`, etc.) in components; the CSS custom properties are for tokens that Tailwind maps.

| Token | Hex | Usage |
|-------|-----|-------|
| `void` | `#050507` | Deepest background (page background) |
| `obsidian` | `#0a0a0f` | Dark surface (cards, secondary surfaces) |
| `slate-dark` | `#12121a` | Intermediate dark variant |
| `molten` | `#FF4500` | **Primary accent**: CTAs, focus ring, selection, key highlights |
| `molten-ember` | `#FF6B2C` | Lighter orange (hover state of molten) |
| `resonance` | `#0052FF` | **Secondary accent**: cadathon/banner, secondary interactive elements |
| `steel` | `#8a8a9a` | Muted text, secondary labels |
| `chrome` | `#c8c8d4` | Primary text on dark |
| `--white` | `#f0f0f5` | Brightest token (near-white) |
| `--radius` | `0.25rem` | Base border radius (`rounded` = 4px; cards/buttons use this or `lg`) |

The shadcn layer also maps `primary` → molten, `ring` → molten (focus rings), `muted-foreground` → steel, and a full gray `slate-*`-independent dark palette. Backgrounds/cards/inputs are near-black; foregrounds near-white.

## Typography

- **Headings / display**: **Space Grotesk** (`--font-heading`): the distinctive characterful heading face.
- **Body / UI**: **Inter** (`--font-body`): applied on `body` via the root layout.
- Loaded with `next/font/google` in `app/layout.tsx` (CSS variables on `<html>`); no `@font-face` in the stylesheet.
- **Micro-labels / HUD captions**: uppercase, tight tracking (`7px` + `tracking` per `.hud-label`), monospace-feel numbers via `.hud-num` (tabular-nums).
- Line-clamp utilities for product copy: `.line-clamp-2..5`, `.product-text-container`, `.product-title-clamp-1/2`, `.product-description-flex(-4)`, `.title-2-lines(-lg)`.

## Motion & animation

Two engines, one rule (respect reduced motion):

- **Lenis** (via `components/smooth-scroll.tsx`): smooth wheel scrolling app-wide. Disabled on the home page (native snap) and for reduced-motion users.
- **GSAP ScrollTrigger**: driven by Lenis scroll events; used for pinned scenes/scroll-linked timelines (home page chapters, product showcase).
- **Framer Motion**: in-page animations: entrances, HUD count-ups, show/hide (nav), the testimonial/carousel and stage transitions.

Keyframe/utility classes (defined in `globals.css` + tailwind config):

| Class / animation | Effect |
|-------------------|--------|
| `.glow-molten(-sm)` | molten orange box-shadow glow |
| `.glow-resonance(-sm)` | blue box-shadow glow |
| `.glow-molten-border` | glow + orange border |
| `.resonant-pulse` | expanding-then-fading ring pulse |
| `.float` | gentle ±10px y oscillation (3s loop) |
| `.laser-glow` | pulsing orange box-shadow |
| `.particle-field` | drifting radial-gradient particle field (20s) |
| `.image-rotate-hover` | 360° Y-rotation on group hover |
| `.card-ignite` | product card hover: orange border + glow |
| `.pulse-molten` / `.animate-pulse-molten` | loading pulse |

Scroll behavior: `html { scroll-behavior: smooth }`, and the **home page** enables `scroll-snap` via `html:has(.home-snap)` with `[data-major-section]` snap points. Add `data-lenis-prevent` to any scrollable region (e.g. the `Table` wrapper) so Lenis doesn't hijack it.

## Surfaces, borders, and spatial rhythm

- Cards: `bg-obsidian` / `bg-card`, `border` hairline (`--border` ~ slate-900), `rounded-lg`, subtle `shadow-sm`; hover = molten border + glow (`.card-ignite`).
- Buttons: `buttonVariants` in `components/ui/button.tsx`: `default` (molten, near-white text), `outline`, `secondary` (dark surface), `ghost`, `link`, `destructive`. Sizes `default`/`sm`/`lg`/`icon`.
- Forms (`Input`, `Textarea`, `Select`): dark `bg-obsidian`, hairline border, molten focus ring (`--ring`). Mobile-friendly type size (`text-base` on mobile, `text-sm` from `md:`).
- Focus rings are molten orange on everything interactive. Never rely on color alone for state: pair color with borders/icons/labels.

## Backgrounds and texture

- Page: `var(--void)`; `body` uses `--void` fill with `--chrome` text.
- Optional texture utilities: `.slicer-grid` (1px grid at 4% white), `gradient-radial`, `glass` gradient.
- `:selection` is molten-tinted; the custom scrollbar is 6px with a molten thumb.
- `.corner-bracket` draws measurement-style corner brackets; `.leader-line` is a 1px hairline annotation rule (HUD flavor).

## Accessibility and motion health

Non-negotiable (also in `CONTRIBUTING.md`):

- **`prefers-reduced-motion: reduce`** globally short-circuits animation: `animation-duration: 0.001ms`, scroll-snap and particle/rotate-hover effects disabled, Lenis and custom cursor off. `hooks/use-reduced-motion.ts` exposes this signal for JS-driven motion.
- Decorative/pointer layers (`CursorView`) are `aria-hidden` and `pointer-events-none`.
- Keyboard accessibility + visible focus for all interactive elements; color never the sole signal.
- Coarse pointers: custom cursor hidden; touch targets respected.
- Text contrast: `chrome`/`steel` on void/obsidian maintain ~AA; keep it that way when picking new grays.

## Reference

- Components referenced here: root layout (`app/layout.tsx`), `components/smooth-scroll.tsx`, `components/interactions/cursor-view.tsx`, `components/ui/*`.
- Tokens live in `app/globals.css` and `tailwind.config.ts` (colors, fonts, radius, keyframes, background-image utilities, `backdropBlur.xs`).