# Fresava

Landing page for **Fresava** — a premium, halal Dragon Fruit & Honey Jelly
from Bangladesh. Built with [Next.js](https://nextjs.org) (App Router),
TypeScript, Tailwind CSS, and Framer Motion.

This recreates, as original code, the single-page marketing site previously
prototyped in Arena — hero, ingredients, "Purity" list, serving ideas, farm
origin story, jar-return loyalty program ("Circle"), FAQ, brand story, and a
pre-order contact form, plus a persistent "Order Now" button linking out to
WhatsApp/Facebook. All product/fruit/field visuals are original SVG
illustrations rather than photography.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build (static export, output in `out/`)
- `npm run start` — run the production build
- `npm run lint` — lint the project

## Structure

- `src/app` — root layout, global styles, and the single page route
- `src/components` — one component per landing-page section (header, hero,
  signature jar, ingredients, purity, serving, origin, circle, FAQ, story,
  contact, footer, order-now) plus shared SVG illustrations and a
  scroll-reveal wrapper

## Deployment (Netlify, free tier)

The site has no server-only features (no API routes, no server actions), so
`next.config.ts` builds it as a fully static export (`output: "export"`) —
it deploys as plain static files, with no serverless functions and no
Netlify usage-quota concerns.

1. Push this repo to GitHub (already done).
2. In Netlify: **Add new site → Import an existing project → GitHub**, and
   pick this repo.
3. Build settings are picked up automatically from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `out`
4. Deploy. Every push to `main` will redeploy automatically.

To preview the exact static output locally before deploying:

```bash
npm run build
npx serve out
```
