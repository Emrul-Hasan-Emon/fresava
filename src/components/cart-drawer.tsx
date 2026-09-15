"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { FREE_SHIP_THRESHOLD, formatBDT, getProduct } from "@/lib/products";
import { cn } from "@/lib/cn";

export function CartDrawer() {
  const { lines, count, subtotal, savings, discount, isOpen, setOpen, setQty, remove } =
    useCart();

  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);
  const shipProgress = Math.min(100, (subtotal / FREE_SHIP_THRESHOLD) * 100);

  return (
    <div className={cn("fixed inset-0 z-[70]", !isOpen && "pointer-events-none")} aria-hidden={!isOpen}>
      <div
        onClick={() => setOpen(false)}
        className={cn(
          "absolute inset-0 bg-ink/45 backdrop-blur-[2px] transition-opacity duration-400",
          isOpen ? "opacity-100" : "opacity-0"
        )}
      />
      <aside
        className={cn(
          "absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-label="Shopping bag"
      >
        <div className="flex items-center justify-between border-b border-ink/8 px-6 py-5">
          <p className="wordmark text-sm tracking-[0.2em] text-ink">
            YOUR BAG {count > 0 && <span className="text-crimson">&middot; {count}</span>}
          </p>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close bag"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/5 text-lg leading-none text-ink transition-colors hover:bg-ink/10"
          >
            &times;
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/jar-hero.png"
              alt=""
              className="blend-multiply h-40 w-auto object-contain opacity-90"
            />
            <p className="headline mt-8 text-3xl text-ink">Your bag is empty.</p>
            <p className="mt-3 max-w-[26ch] text-sm leading-relaxed text-ink/55">
              One jar is all it takes to start. Organic fruit, pure honey, nothing artificial.
            </p>
            <Link
              href="/spread"
              onClick={() => setOpen(false)}
              className="mt-8 rounded-full bg-crimson px-7 py-2.5 text-[0.8rem] font-medium text-cream transition-transform hover:scale-105"
            >
              Shop the Signature
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-ink/8 px-6 py-4">
              {remaining > 0 ? (
                <p className="text-[0.78rem] text-ink/60">
                  <span className="font-medium text-crimson">{formatBDT(remaining)}</span> away
                  from free delivery
                </p>
              ) : (
                <p className="text-[0.78rem] font-medium text-crimson">
                  You have unlocked FREE delivery
                </p>
              )}
              <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-ink/8">
                <div
                  className="h-full rounded-full bg-crimson transition-all duration-700"
                  style={{ width: `${shipProgress}%` }}
                />
              </div>
            </div>

            <ul className="flex-1 divide-y divide-ink/8 overflow-y-auto px-6">
              {lines.map((l) => {
                const p = getProduct(l.id);
                return (
                  <li key={l.id} className="flex gap-4 py-5">
                    <div className="flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/jar-hero.png"
                        alt=""
                        className="blend-multiply h-16 w-auto object-contain"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[0.9rem] font-medium text-ink">{p.name}</p>
                          <p className="mt-0.5 text-[0.72rem] tracking-wide text-ink/45">
                            {p.size}
                          </p>
                        </div>
                        <button
                          onClick={() => remove(l.id)}
                          aria-label={`Remove ${p.name}`}
                          className="text-[0.72rem] text-ink/40 underline-offset-2 hover:text-crimson hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-full bg-ink/5 p-1">
                          <button
                            onClick={() => setQty(l.id, l.qty - 1)}
                            aria-label="Decrease quantity"
                            className="flex h-6 w-6 items-center justify-center rounded-full text-sm text-ink transition-colors hover:bg-white"
                          >
                            &minus;
                          </button>
                          <span className="w-6 text-center text-[0.82rem] font-medium">
                            {l.qty}
                          </span>
                          <button
                            onClick={() => setQty(l.id, l.qty + 1)}
                            aria-label="Increase quantity"
                            className="flex h-6 w-6 items-center justify-center rounded-full text-sm text-ink transition-colors hover:bg-white"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-[0.9rem] font-medium text-ink">
                          {formatBDT(p.price * l.qty)}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-ink/8 bg-white/60 px-6 py-5">
              {savings > 0 && (
                <div className="mb-1.5 flex justify-between text-[0.78rem] text-ink/55">
                  <span>Bundle savings</span>
                  <span className="text-crimson">&minus; {formatBDT(savings)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="mb-1.5 flex justify-between text-[0.78rem] text-ink/55">
                  <span>Promo applied</span>
                  <span className="text-crimson">&minus; {formatBDT(discount)}</span>
                </div>
              )}
              <div className="flex items-baseline justify-between">
                <span className="text-[0.85rem] text-ink/60">Subtotal</span>
                <span className="headline text-2xl text-ink">
                  {formatBDT(subtotal - discount)}
                </span>
              </div>
              <p className="mt-1 text-[0.7rem] text-ink/40">
                Delivery calculated at checkout &middot; bKash, Nagad, cards &amp; COD
              </p>
              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className="mt-4 block rounded-full bg-crimson py-3 text-center text-[0.82rem] font-medium tracking-wide text-cream transition-colors hover:bg-crimson-dark"
              >
                Checkout &middot; Pay securely
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="mt-2 w-full py-2 text-center text-[0.76rem] text-ink/55 underline-offset-4 hover:underline"
              >
                Keep exploring
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
