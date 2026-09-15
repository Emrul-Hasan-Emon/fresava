"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero } from "@/components/page-hero";
import { USPSection } from "@/components/usp-section";
import { Reveal } from "@/components/reveal";
import { useCart } from "@/lib/cart-context";
import { SHOP_PRODUCTS, formatBDT } from "@/lib/products";
import { cn } from "@/lib/cn";

const SPECS: [string, string][] = [
  ["Net weight", "240 g"],
  ["Format", "Recyclable glass jar, crimson twist lid"],
  ["Texture", "Soft-set spread with visible fruit and seeds"],
  ["Setting agent", "Natural fruit pectin"],
  ["Sweetened with", "Pure honey"],
  ["Shelf life", "9 months sealed · 3 weeks refrigerated after opening"],
  ["Batch size", "Max 400 jars"],
  ["Certification", "Halal process · BSTI compliant facility"],
];

const NUTRITION: [string, string][] = [
  ["Energy", "128 kcal"],
  ["Total sugars (fruit)", "14 g"],
  ["Added sugar", "0 g"],
  ["Dietary fibre", "2.6 g"],
  ["Fat", "0.2 g"],
  ["Sodium", "3 mg"],
];

const USES = [
  { t: "On warm toast", d: "Sourdough, brioche or a simple paratha. The spread melts slowly." },
  { t: "Folded into yoghurt", d: "One spoon turns plain curd into a magenta breakfast bowl." },
  { t: "With cheese", d: "Sharp white cheese and dragon fruit is an unexpectedly perfect pair." },
  { t: "For the children", d: "Safe for little ones — no colour, no preservative, no guilt." },
];

export function SpreadClient() {
  const [tab, setTab] = useState<"specs" | "nutrition">("specs");
  const [variantId, setVariantId] = useState("duo");
  const [qty, setQty] = useState(1);
  const { add } = useCart();
  const router = useRouter();

  const rows = tab === "specs" ? SPECS : NUTRITION;
  const variant = SHOP_PRODUCTS.find((p) => p.id === variantId) ?? SHOP_PRODUCTS[0];

  const scrollToBuy = () => {
    document.getElementById("buy")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const buyNow = () => {
    add(variant.id, qty, { openDrawer: false });
    router.push("/checkout");
  };

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="The Signature Jar"
          title={
            <>
              The whole fruit,
              <br />
              held in glass.
            </>
          }
          sub="Fresava Dragon Fruit Spread. Premium organic fruit, pure honey sweetness, and a clean label you can read in one breath."
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/jar-hero.png"
            alt="Fresava Dragon Fruit Spread jar"
            className="blend-multiply mt-12 h-[38vh] w-auto object-contain sm:h-[46vh]"
          />
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => add("single", 1)}
              className="rounded-full bg-crimson px-7 py-2.5 text-[0.8rem] font-medium text-cream transition-transform hover:scale-105"
            >
              Add a Jar &middot; {formatBDT(495)}
            </button>
            <button
              onClick={scrollToBuy}
              className="rounded-full border border-ink/15 px-7 py-2.5 text-[0.8rem] text-ink transition-colors hover:border-crimson hover:text-crimson"
            >
              Choose a pack
            </button>
          </div>
        </PageHero>

        {/* ---------------- BUY ---------------- */}
        <section id="buy" className="scroll-mt-20 bg-white py-24 sm:py-32">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 sm:px-8 lg:grid-cols-2">
            <Reveal>
              <div className="relative overflow-hidden rounded-[28px] bg-cream p-10 text-center">
                {variant.badge && (
                  <span className="absolute top-6 left-6 rounded-full bg-crimson px-3 py-1 text-[0.62rem] font-medium tracking-[0.14em] text-cream uppercase">
                    {variant.badge}
                  </span>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/jar-hero.png"
                  alt="Fresava Dragon Fruit Spread"
                  className="blend-multiply mx-auto h-[38vh] w-auto object-contain sm:h-[44vh]"
                />
                <p className="mt-4 text-[0.72rem] tracking-[0.22em] text-ink/45 uppercase">
                  {variant.size} &middot; Small batch &#8470; 091
                </p>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <p className="eyebrow text-crimson/70">Shop the Signature</p>
              <h2 className="headline mt-4 text-4xl text-ink sm:text-5xl">
                Dragon Fruit Spread &middot; 240 g
              </h2>
              <p className="mt-3 text-[0.82rem] text-ink/50">
                <span className="font-medium text-ink">4.9 / 5</span> from 212 breakfasts &middot;
                No added sugar &middot; Pure honey &middot; Halal
              </p>

              <div className="mt-8 grid gap-2.5">
                {SHOP_PRODUCTS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setVariantId(p.id)}
                    className={cn(
                      "flex items-center gap-4 rounded-2xl border p-4 text-left transition-all",
                      variantId === p.id
                        ? "border-crimson bg-cream shadow-[0_8px_30px_rgba(142,15,19,0.08)]"
                        : "border-ink/10 bg-transparent hover:border-ink/25"
                    )}
                  >
                    <span className="flex-1">
                      <span className="block text-[0.9rem] font-medium text-ink">
                        {p.name} <span className="font-normal text-ink/45">&middot; {p.size}</span>
                      </span>
                      <span className="block text-[0.74rem] text-ink/50">{p.blurb}</span>
                    </span>
                    <span className="text-right">
                      <span className="block text-[0.95rem] font-medium text-ink">
                        {formatBDT(p.price)}
                      </span>
                      {p.compareAt && (
                        <span className="block text-[0.72rem] text-ink/35 line-through">
                          {formatBDT(p.compareAt)}
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-3">
                <div className="flex items-center gap-1 rounded-full bg-ink/5 p-1.5">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="Fewer packs"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition-colors hover:bg-white"
                  >
                    &minus;
                  </button>
                  <span className="w-8 text-center text-[0.95rem] font-medium">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(9, q + 1))}
                    aria-label="More packs"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition-colors hover:bg-white"
                  >
                    +
                  </button>
                </div>
                <p className="headline text-3xl text-ink">{formatBDT(variant.price * qty)}</p>
                {variant.compareAt && (
                  <p className="text-sm text-ink/35 line-through">
                    {formatBDT(variant.compareAt * qty)}
                  </p>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                <button
                  onClick={() => add(variant.id, qty)}
                  className="flex-1 rounded-full bg-crimson py-3.5 text-[0.84rem] font-medium text-cream transition-transform hover:scale-[1.02]"
                >
                  Add to Bag
                </button>
                <button
                  onClick={buyNow}
                  className="flex-1 rounded-full bg-ink py-3.5 text-[0.84rem] font-medium text-cream transition-transform hover:scale-[1.02]"
                >
                  Buy Now
                </button>
              </div>

              <ul className="mt-7 space-y-2.5 border-t border-ink/8 pt-6 text-[0.8rem] text-ink/55">
                <li>Free delivery over &#2547;1,500 &middot; Cash on delivery available</li>
                <li>
                  bKash &middot; Nagad &middot; Rocket &middot; Cards &mdash;{" "}
                  <Link href="/checkout" className="text-crimson underline-offset-4 hover:underline">
                    secure checkout
                  </Link>
                </li>
                <li>3-day full-refund satisfaction guarantee on every order</li>
              </ul>
            </Reveal>
          </div>
        </section>

        {/* Ingredient list */}
        <section className="bg-cream py-24 sm:py-32">
          <div className="mx-auto max-w-5xl px-6 text-center sm:px-8">
            <Reveal>
              <p className="eyebrow text-crimson/70">The full ingredient list</p>
              <h2 className="headline mt-6 text-3xl leading-tight text-ink sm:text-5xl">
                Organic red dragon fruit &middot; pure honey &middot; lemon juice &middot; natural
                fruit pectin.
              </h2>
              <p className="mt-8 text-sm text-ink/50">That is the entire list. There is no line five.</p>
            </Reveal>
          </div>
        </section>

        {/* Texture split */}
        <section className="grid lg:grid-cols-2">
          <div className="relative min-h-[60vh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/texture.jpg"
              alt="Dragon fruit spread texture"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="flex items-center bg-white px-8 py-20 sm:px-16">
            <Reveal>
              <p className="eyebrow text-crimson/70">The set</p>
              <h2 className="headline mt-5 text-4xl text-ink sm:text-5xl">
                Soft enough to spread. Whole enough to taste.
              </h2>
              <p className="mt-6 max-w-md text-[0.92rem] leading-relaxed text-ink/60">
                We cook low and slow, below the temperature that dulls dragon fruit&rsquo;s
                colour, then set the spread with fruit pectin. Pure honey rounds the fruit without
                burying its floral fragrance, while the seeds stay intact and the colour stays
                exactly as nature printed it.
              </p>
              <ul className="mt-8 space-y-3">
                {["Low-temperature kettle", "Pure honey sweetness", "Seeds left whole", "Sealed same day"].map(
                  (x) => (
                    <li key={x} className="flex items-center gap-3 text-sm text-ink/70">
                      <span className="h-1.5 w-1.5 rounded-full bg-crimson" />
                      {x}
                    </li>
                  )
                )}
              </ul>
            </Reveal>
          </div>
        </section>

        <USPSection compact />

        {/* Specs tabs */}
        <section className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-4xl px-6 sm:px-8">
            <Reveal>
              <div className="flex items-center justify-center gap-2">
                {(["specs", "nutrition"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "rounded-full px-5 py-2 text-[0.78rem] tracking-wide transition-colors",
                      tab === t ? "bg-crimson text-cream" : "bg-black/5 text-ink/60 hover:bg-black/10"
                    )}
                  >
                    {t === "specs" ? "Specification" : "Per 100 g"}
                  </button>
                ))}
              </div>
              <dl className="mt-12 divide-y divide-black/8 border-y border-black/8">
                {rows.map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-6 py-5">
                    <dt className="text-sm text-ink/50">{k}</dt>
                    <dd className="text-right text-[0.95rem] text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        {/* Ways to use */}
        <section className="bg-cream py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <Reveal>
              <h2 className="headline max-w-2xl text-4xl text-ink sm:text-5xl">
                Four honest ways to finish a jar.
              </h2>
            </Reveal>
            <div className="mt-14 grid gap-6 sm:grid-cols-2">
              {USES.map((u, i) => (
                <Reveal key={u.t} delay={i * 80}>
                  <div className="h-full rounded-3xl bg-white p-9">
                    <p className="headline text-2xl text-crimson">{u.t}</p>
                    <p className="mt-3 text-[0.88rem] leading-relaxed text-ink/60">{u.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal>
              <div className="mt-10 overflow-hidden rounded-[28px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/toast.jpg"
                  alt="Spread on toast"
                  className="h-[52vh] w-full object-cover"
                />
              </div>
            </Reveal>
          </div>
        </section>

        <section className="bg-crimson px-6 py-24 text-center text-cream">
          <h2 className="headline mx-auto max-w-2xl text-4xl sm:text-6xl">Breakfast is waiting.</h2>
          <p className="mx-auto mt-6 max-w-md text-[0.92rem] text-cream/70">
            Small batches sell out. Take yours home today, backed by our 3-day full-refund
            guarantee.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => add("family", 1)}
              className="rounded-full bg-cream px-8 py-3 text-[0.8rem] font-medium tracking-wide text-crimson transition-transform hover:scale-105"
            >
              Add Family Box &middot; {formatBDT(1790)}
            </button>
            <Link
              href="/purity"
              className="rounded-full border border-cream/30 px-8 py-3 text-[0.8rem] text-cream transition-colors hover:border-cream/70"
            >
              Read the purity standard
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
