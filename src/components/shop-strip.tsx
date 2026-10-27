"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatBDT } from "@/lib/products";
import { Reveal } from "./reveal";

export function ShopStrip() {
  const { add, products: SHOP_PRODUCTS } = useCart();

  return (
    <section className="bg-white pt-6 pb-12 sm:pt-8 sm:pb-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-crimson/70">Shop</p>
              <h2 className="headline mt-4 max-w-xl text-4xl text-ink sm:text-6xl">
                Take a jar home.
              </h2>
            </div>
            <Link href="/spread" className="text-sm text-crimson">
              Full product story &rarr;
            </Link>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {SHOP_PRODUCTS.map((p, i) => (
            <Reveal key={p.id} delay={i * 100}>
              <div className="group flex h-full flex-col rounded-[24px] bg-cream p-5 sm:rounded-[28px] sm:p-8">
                {p.badge && (
                  <span className="self-start rounded-full bg-crimson px-3 py-1 text-[0.65rem] font-medium tracking-[0.14em] text-cream uppercase">
                    {p.badge}
                  </span>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/jar-hero.png"
                  alt={p.name}
                  className="blend-multiply mx-auto mt-4 h-36 w-auto object-contain transition-transform duration-700 group-hover:scale-105 sm:h-44"
                />
                <div className="flex flex-1 flex-col items-center justify-center text-center sm:items-start sm:text-left">
                  <h3 className="headline mt-6 text-2xl text-ink">{p.name}</h3>
                  <p className="mt-1 text-[0.72rem] tracking-[0.18em] text-ink/45 uppercase">
                    {p.size}
                  </p>
                  <p className="mt-3 text-[0.85rem] leading-relaxed text-ink/60">{p.blurb}</p>
                </div>
                <div className="mt-5 flex items-baseline justify-center gap-2 sm:justify-start">
                  <span className="headline text-3xl text-ink">{formatBDT(p.price)}</span>
                  {p.compareAt && (
                    <span className="text-sm text-ink/35 line-through">
                      {formatBDT(p.compareAt)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => add(p.id, 1)}
                  className="mt-6 min-h-[44px] w-full rounded-full bg-ink py-2.5 text-[0.78rem] font-medium tracking-wide text-cream transition-colors hover:bg-crimson sm:min-h-0"
                >
                  Add to Bag
                </button>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mt-8 text-center text-[0.8rem] text-ink/50">
            Free delivery over &#2547;1,500 &middot; Cash on delivery
          </p>
        </Reveal>
      </div>
    </section>
  );
}
