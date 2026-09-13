# Fresava

Landing page for **Fresava** — a premium, halal, organic dragon fruit spread
from Bangladesh. Built with [Next.js](https://nextjs.org) (App Router),
TypeScript, Tailwind CSS, and Framer Motion.

This recreates, as original code, the single-page marketing site previously
prototyped in Arena — the hero, product detail, "Purity" ingredient list,
farm origin story, jar-return loyalty program ("Circle"), brand story, and a
pre-order contact form. All product/fruit/field visuals are original SVG
illustrations rather than photography.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint the project

## Structure

- `src/app` — root layout, global styles, and the single page route
- `src/components` — one component per landing-page section (header, hero,
  signature jar, purity, origin, circle, story, contact, footer) plus shared
  SVG illustrations and a scroll-reveal wrapper
