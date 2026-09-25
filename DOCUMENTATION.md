# Fresava — Project Documentation

This document explains what the Fresava website is, how it was built, and why it's
structured the way it is. It's meant to let anyone (including future-you, or a future
Claude session) pick the project back up without re-deriving decisions from scratch.

---

## 1. What this project is

Fresava is a marketing + e‑commerce-style landing site for a Bangladeshi dragon-fruit
spread brand. It's a **Next.js 16 (App Router) static site**, deployed to **Netlify** as
a fully static export (no server, no API routes).

The design, copy, and product data are a **faithful port** of a separate reference
codebase the brand owner supplied — a Vite + React app at `D:\Github\fre-sava` (note:
different folder name, one letter off from this repo, `fresava`). That reference app was
itself a snapshot of a live prototype the brand had built. Nothing in this repo's design
was invented independently once the reference existed — colors, fonts, copy, images,
animation math, and page structure all trace back to it.

## 2. Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16, App Router, TypeScript |
| Styling | Tailwind CSS v4 (`@theme` token syntax in `globals.css`, not a `tailwind.config`) |
| Animation | Vanilla scroll-position hooks (`useScrollProgress`, `useReveal`) — **not** Framer Motion for most of the site, even though `framer-motion` is still a dependency |
| State | React Context (`CartProvider`) + `localStorage`, no external state library |
| Icons | `lucide-react` |
| Hosting | Netlify, static export (`output: "export"` in `next.config.ts`) |
| Deploy trigger | GitHub push to `main` → Netlify auto-deploy |

There is no backend. "Checkout" is a simulated flow (see §7) — there's no payment
gateway integration.

## 3. Site structure (routes)

The reference app was a true multi-page app (React Router), not a single scrolling page.
This repo mirrors that with real Next.js routes:

| Route | Purpose |
|---|---|
| `/` | Home — hero, pinned-scroll brand story, shop strip, USPs |
| `/spread` | Product detail page (the actual jar): specs, nutrition, variants, buy flow |
| `/purity` | "What we leave out" — scroll strike-through list, four pillars, comparison table |
| `/origin` | Farm/sourcing story, sustainability |
| `/story` | Brand story, mission/vision, values, roadmap |
| `/contact` | Contact form + pre-order info |
| `/checkout` | Simulated checkout (delivery details, payment method, promo code, order confirmation) |

Every route lives under `src/app/<route>/page.tsx`.

## 4. Why every page is split into `page.tsx` + `*-client.tsx`

Next.js rule: a page needs `"use client"` if it uses hooks/interactivity, but a
**Client Component cannot export `metadata`** (that's a Server Component-only export).
Since almost every page here needs client-side scroll hooks or interactivity, but also
needs a real `<title>`/meta description for SEO, each interactive route is split in two:

- `src/app/<route>/page.tsx` — a thin **Server Component**. Exports `metadata` only,
  renders the client component.
- `src/components/<route>-client.tsx` — a **Client Component** (`"use client"`) holding
  all the actual JSX, hooks, and logic.

Example (`src/app/purity/page.tsx`):
```tsx
import type { Metadata } from "next";
import { PurityClient } from "@/components/purity-client";

export const metadata: Metadata = {
  title: "The Purity Standard — Fresava",
  description: "...",
};

export default function PurityPage() {
  return <PurityClient />;
}
```

This pattern is used for `/`, `/spread`, `/purity`, `/contact`, `/checkout`.
`/origin` and `/story` didn't need it — they have no client-only interactivity, so
they're plain Server Components with `metadata` exported directly.

## 5. Design system (`src/app/globals.css`)

Tailwind v4 uses CSS-native theme tokens instead of `tailwind.config.js`. All tokens live
in an `@theme` block, ported 1:1 from the reference app's `index.css`:

```css
@theme {
  --color-crimson: #8e0f13;
  --color-crimson-dark: #5d090c;
  --color-crimson-soft: #b4232a;
  --color-cream: #faf5ec;
  --color-cream-dark: #efe6d6;
  --color-ink: #0f0f10;
  --color-fuchsia-flesh: #d6216e;
  --font-display: var(--font-cormorant), serif;
  --font-sans: var(--font-inter), sans-serif;
}
```

Fonts are loaded via `next/font` in `src/app/layout.tsx`:
- **Cormorant Garamond** (weights 300–700) → `--font-cormorant` → used for headlines
  (`.headline`, `.wordmark` classes)
- **Inter** (weights 300–600) → `--font-inter` → body text

Custom utility classes carried over from the reference (also in `globals.css`):
`.headline`, `.wordmark`, `.eyebrow`, `.reveal` / `.is-visible` (scroll-reveal fade-in),
`.jar-shadow`, `.grain::after` (film-grain overlay), `@keyframes floaty`,
`.scroll-hint span`, `.blend-multiply`, `@keyframes pop`, `@keyframes marquee`,
`.spinner`.

**Footer color note:** the footer (`site-footer.tsx`) is a flat, solid `bg-crimson` —
deliberately *not* a gradient. This was an explicit correction from the brand owner after
an earlier gradient/vignette attempt; don't reintroduce a gradient there.

## 6. Scroll-driven animation, without Framer Motion

The reference app drives most of its "story" animations off raw scroll position, not a
library. This repo replicates that with two hooks in `src/lib/hooks.ts`:

- **`useScrollProgress<T>()`** — attaches a ref to a tall container (e.g. `h-[600vh]`),
  and on scroll (via `requestAnimationFrame`) computes a `progress` value from 0 to 1
  representing how far the viewport has scrolled through that container. Returns
  `{ ref, progress }`.
- **`mapRange(value, inMin, inMax, outMin, outMax)`** — linear interpolation helper, used
  everywhere to turn `progress` into concrete values (opacity, translateY, scale, an
  index into an array, etc).
- **`useReveal()`** — IntersectionObserver-based; adds `.is-visible` to an element once
  it scrolls into view, powering the `.reveal` fade/slide-in class used by the `Reveal`
  component.
- **`useScrolled(threshold)`** — boolean, true once `window.scrollY` passes `threshold`;
  used by the header to switch from transparent to a "glass" background.

**Where this shows up:**
- **Home** (`home-client.tsx`): a `600vh` pinned section drives the jar's scale/position/
  opacity, a "blush" fruit-flesh color wash, three fade-in `STATEMENTS`, and a dark
  "finale" panel, all as functions of one `progress` value.
- **Purity** (`purity-client.tsx`): a `280vh` pinned section strikes through a list of
  banned ingredients (`NOTS`) one at a time as the user scrolls, via
  `cross = mapRange(p, 0.1, 0.85, 0, NOTS.length)` and `cross > i` per list item.

This math (thresholds, easing ranges) was ported number-for-number from the reference
app's `Home.tsx` / `Purity.tsx` — if animations ever look "off," compare against those
files in `D:\Github\fre-sava` rather than re-deriving values from scratch.

## 7. Cart & checkout

`src/lib/cart-context.tsx` provides `CartProvider` / `useCart()`, wrapping the whole app
(added in `layout.tsx`). It's `localStorage`-backed under the key `"fresava-cart-v1"`.

State shape:
```ts
CartLine { id: string; qty: number }
// context exposes:
{ lines, count, subtotal, savings, discount, promo, promoError,
  isOpen, setOpen, openCart,
  add, remove, setQty, clear, applyPromo, clearPromo }
```

Product/pricing data lives in `src/lib/products.ts`, ported from the reference's
`products.ts`:
- `PRODUCTS` — single jar / duo bundle / family bundle, with bundle savings baked in
- `formatBDT` — currency formatter (Bangladeshi Taka)
- `FREE_SHIP_THRESHOLD = 1500`
- `shippingFee(zone)` / `ShipZone` — delivery zone → fee lookup
- `PROMOS = { FRESAVA10: { rate: 0.1, cap: 250 } }` + `promoDiscount()`

**Hydration gotcha:** cart state is read from `localStorage` in a `useEffect` (not during
render), because `localStorage` doesn't exist during SSR/static generation. A `hydrated`
flag guards against rendering stale/empty state before that effect runs:
```tsx
useEffect(() => {
  const { lines: l, promo: p } = load();
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setLines(l);
  setPromo(p);
  setHydrated(true);
}, []);
```
The `eslint-disable` is necessary and intentional — there's no derived-state alternative
when the initial value has to come from a browser-only API after mount.

**Checkout (`checkout-client.tsx`)** is fully simulated — there is no payment processor:
- `METHODS`: bKash, Nagad, Rocket, Card, Cash on Delivery (COD) — UI only, no real
  integration with any of these providers.
- Delivery zone selector reuses `ShipZone` / `shippingFee` from `products.ts`.
- Promo code field validates against the `PROMOS` map client-side.
- "Placing order" is a fake network delay: `window.setTimeout(..., 1900)`, after which a
  generated order ID and a success screen are shown. **If real payments are ever wanted,
  this entire flow needs a real backend/payment gateway — nothing here should be mistaken
  for production-ready payment handling.**

## 8. Navigation gotchas (Next.js `<Link>` specifics)

Two related bugs came up because Next.js's `<Link>` client-side navigation does **not**
fire a native `hashchange` event the way a full page navigation would:

1. **Anchor-link scrolling broke** when `scroll-behavior: smooth` was set globally on
   `html` in `globals.css`, in combination with scroll-linked animation sections. Fixed by
   removing `scroll-behavior: smooth` entirely — don't re-add it without testing anchor
   nav against the pinned-scroll sections on Home and Purity.
2. **Active nav-link highlighting** (underline under the current page's link in the
   header) can't rely on listening for `hashchange`. `site-header.tsx` instead uses
   `usePathname()` for route-level active state, and syncs any hash-based state directly
   inside the relevant link's `onClick` handler rather than via a `hashchange` listener.

`NAV_LINKS` (the array of `{ to, label }` used by both the header and footer) lives in
`src/lib/nav-links.ts` — a plain module with **no** `"use client"` directive. This was
deliberate: `site-footer.tsx` is used from Server Components (e.g. `/origin`, `/story`),
and importing a constant from a `"use client"` file into a Server Component broke under
Turbopack bundling (`NAV_LINKS.map is not a function` at build time). Keep shared data
constants like this in plain, non-client modules — never import them from a client
component into server-rendered pages.

## 9. Images

All product/lifestyle photography lives in `public/images/`, copied directly from the
reference app (`D:\Github\fre-sava\public\images\`):

| File | Used for |
|---|---|
| `jar-hero.png` | Home hero jar |
| `jar-dark.jpg` | Contact page hero background |
| `dragonfruit-cut.png` | Product texture/ingredient shots |
| `farm.jpg` | Origin page |
| `texture.jpg` | Purity page hero background, Story "who it's for" |
| `toast.jpg` | Story page background |

Images use plain `<img>` tags, **not** `next/image` — required because `next/image`'s
optimization pipeline needs a server and doesn't work with static export
(`output: "export"`) without extra config. Each usage has an eslint-disable comment:
```tsx
{/* eslint-disable-next-line @next/next/no-img-element */}
<img src="/images/jar-hero.png" ... />
```

## 10. Static export & Netlify deployment

`next.config.ts`:
```ts
const nextConfig: NextConfig = {
  output: "export",
};
```
This makes `next build` emit a fully static site into `out/` — no Node server needed at
runtime.

`netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "out"
```

**Deploy flow:** the Netlify site is connected to this GitHub repo. Every push to `main`
triggers an automatic build + deploy (Netlify runs `npm run build`, then publishes the
`out/` directory). To deploy an update:

1. Commit and `git push origin main`.
2. Netlify picks up the push automatically — check the **Deploys** tab on the Netlify
   dashboard to watch/confirm the build.
3. If it doesn't start automatically, use **Trigger deploy → Deploy site** manually.

No Netlify environment variables or serverless functions are required — the whole app is
static HTML/CSS/JS.

## 11. Local development

```bash
npm install
npm run dev      # starts Next.js dev server
npm run build    # production build (also what Netlify runs) — outputs to out/
npm run lint     # eslint
npx tsc --noEmit # type-check without emitting
```

Before committing, it's good practice to run `tsc --noEmit`, `eslint`, and `next build`
— all three were run clean as the final check on the last major rebuild.

## 12. File map

```
src/
  app/
    layout.tsx              root layout: fonts, CartProvider, <body>
    globals.css              design tokens + custom utility classes
    page.tsx                 Home (server wrapper) → home-client.tsx
    spread/page.tsx          → spread-client.tsx
    purity/page.tsx          → purity-client.tsx
    origin/page.tsx          plain server component
    story/page.tsx           plain server component
    contact/page.tsx         → contact-client.tsx
    checkout/page.tsx        → checkout-client.tsx
  components/
    site-header.tsx          fixed nav, mobile sheet, active-link state
    site-footer.tsx          flat crimson footer, imports NAV_LINKS
    cart-drawer.tsx           slide-out cart, free-ship meter, qty stepper
    page-hero.tsx             shared hero banner (image + eyebrow + title)
    reveal.tsx                 scroll-reveal wrapper (uses useReveal)
    wordmark.tsx                "Fresava" logo/wordmark treatment
    shop-strip.tsx              marquee/strip of shop highlights
    usp-section.tsx             unique-selling-points grid (supports `compact`)
    order-now.tsx                WhatsApp order CTA (not in reference app; kept per brand request)
    home-client.tsx | spread-client.tsx | purity-client.tsx |
    contact-client.tsx | checkout-client.tsx   — the actual page content/logic
  lib/
    products.ts               PRODUCTS, pricing, shipping, promos
    cart-context.tsx          CartProvider / useCart
    hooks.ts                  useScrollProgress, mapRange, useReveal, useScrolled
    nav-links.ts               NAV_LINKS (plain module, no "use client")
    cn.ts                       clsx + tailwind-merge helper
public/images/               6 photos ported from the reference app
next.config.ts                output: "export"
netlify.toml                  build command + publish dir
```

## 13. Reference material

The original source of truth for design/copy/behavior is:
```
D:\Github\fre-sava\   (Vite + React, NOT this repo)
```
If something in this site looks or behaves wrong, the fastest way to check is to diff
against the corresponding file there (e.g. `src/pages/Purity.tsx` for `/purity`,
`src/lib/products.ts` for pricing, `src/index.css` for design tokens) rather than
guessing. This repo intentionally reproduces that app's behavior exactly, including its
animation math and copy — deviations should be deliberate, not accidental.

`src/components/order-now.tsx` is the one notable exception: a WhatsApp "Order Now" CTA
that doesn't exist in the reference app, added at the brand owner's explicit request and
re-themed to match this site's palette.
