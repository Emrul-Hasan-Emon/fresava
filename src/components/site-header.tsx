"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useScrolled } from "@/lib/hooks";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/cn";
import { NAV_LINKS } from "@/lib/nav-links";

export function SiteHeader() {
  const pathname = usePathname();
  const scrolled = useScrolled(20);
  const [open, setOpen] = useState(false);
  const { count, setOpen: setCartOpen } = useCart();

  useEffect(() => {
    // Close the mobile menu on route change — there's no derived-state
    // equivalent since `open` is toggled independently by the menu button.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled || open
            ? "border-b border-black/5 bg-white/72 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <nav className="mx-auto flex h-12 max-w-6xl items-center justify-between px-5 sm:h-14 sm:px-8">
          <Link href="/" className="wordmark text-[1.05rem] text-ink sm:text-xl">
            FRESAVA
          </Link>

          <ul className="hidden items-center gap-6 lg:flex xl:gap-8">
            {NAV_LINKS.slice(1).map((l) => (
              <li key={l.to}>
                <Link
                  href={l.to}
                  className={cn(
                    "relative text-[0.76rem] font-normal tracking-wide text-ink/70 transition-colors hover:text-ink",
                    pathname === l.to && "text-ink"
                  )}
                >
                  {l.label}
                  <span
                    className={cn(
                      "absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-crimson transition-transform duration-300",
                      pathname === l.to && "scale-x-100"
                    )}
                  />
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2.5">
            <Link
              href="/spread"
              className="hidden rounded-full bg-crimson px-4 py-1.5 text-[0.72rem] font-medium tracking-wide text-cream transition-colors hover:bg-crimson-dark sm:inline-block"
            >
              Shop &middot; &#2547;495
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              aria-label="Open shopping bag"
              className="relative flex h-9 items-center gap-1.5 rounded-full border border-ink/10 bg-white/60 px-3.5 text-[0.75rem] font-medium text-ink backdrop-blur transition-colors hover:border-crimson/30 hover:text-crimson"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 7h15l-1.5 9h-12z" />
                <path d="M6 7l-1-4H2" />
                <circle cx="9" cy="20" r="1.4" />
                <circle cx="17" cy="20" r="1.4" />
              </svg>
              Bag
              {count > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-crimson px-1 text-[0.6rem] font-semibold text-cream">
                  {count}
                </span>
              )}
            </button>
            <button
              aria-label="Menu"
              onClick={() => setOpen((o) => !o)}
              className="flex h-8 w-8 flex-col items-center justify-center gap-[5px] lg:hidden"
            >
              <span
                className={cn(
                  "h-px w-5 bg-ink transition-transform duration-300",
                  open && "translate-y-[3px] rotate-45"
                )}
              />
              <span
                className={cn(
                  "h-px w-5 bg-ink transition-transform duration-300",
                  open && "-translate-y-[3px] -rotate-45"
                )}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile sheet */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-white/95 backdrop-blur-xl transition-all duration-500 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <ul className="flex h-full flex-col justify-center gap-2 overflow-y-auto px-8 py-20">
          {NAV_LINKS.map((l, i) => (
            <li
              key={l.to}
              style={{ transitionDelay: `${i * 40}ms` }}
              className={cn(
                "border-b border-black/5 transition-all duration-500",
                open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              )}
            >
              <Link
                href={l.to}
                className="headline flex items-baseline gap-3 py-4 text-3xl text-ink"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li
            style={{ transitionDelay: "300ms" }}
            className={cn(
              "pt-6 transition-all duration-500",
              open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            )}
          >
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className="block rounded-full bg-crimson py-3 text-center text-[0.82rem] font-medium text-cream"
            >
              Checkout{count > 0 ? ` · ${count} jar${count > 1 ? "s" : ""}` : ""}
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
