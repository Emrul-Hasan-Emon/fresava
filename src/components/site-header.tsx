"use client";

import { useState } from "react";
import { ShoppingBag, Menu, X } from "lucide-react";
import { Container } from "./container";

const NAV_LINKS = [
  { href: "#jelly", label: "The Jelly" },
  { href: "#ingredients", label: "Ingredients" },
  { href: "#purity", label: "Purity" },
  { href: "#origin", label: "Origin" },
  { href: "#circle", label: "Circle" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-maroon/10 bg-cream/85 backdrop-blur-md">
      <Container className="flex h-[68px] items-center justify-between">
        <a
          href="#top"
          className="font-display text-xl font-semibold tracking-[0.3em] text-ink"
        >
          FRESAVA
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm tracking-wide text-ink/70 transition-colors hover:text-maroon"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#contact"
            className="hidden items-center rounded-full bg-maroon px-5 py-2 text-sm font-medium text-cream-soft transition-colors hover:bg-maroon-deep sm:inline-flex"
          >
            Shop &middot; &#2547;495
          </a>
          <button
            type="button"
            aria-label="View bag"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-maroon/20 text-ink transition-colors hover:border-maroon hover:text-maroon"
          >
            <ShoppingBag size={17} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label="Toggle menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-maroon/20 text-ink md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </Container>

      {open && (
        <div className="border-t border-maroon/10 bg-cream md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm text-ink/80 hover:bg-maroon/5 hover:text-maroon"
              >
                {link.label}
              </a>
            ))}
          </Container>
        </div>
      )}
    </header>
  );
}
