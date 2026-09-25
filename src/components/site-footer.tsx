import Link from "next/link";
import { NAV_LINKS } from "@/lib/nav-links";
import { Wordmark } from "./wordmark";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-crimson text-cream">
      <div className="mx-auto max-w-6xl px-6 pt-20 pb-12 sm:px-8">
        <div className="flex flex-col items-center border-b border-cream/15 pb-14 text-center">
          <Wordmark size="lg" tagline />
        </div>

        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h4 className="eyebrow mb-5 text-cream/55">Explore</h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.to}>
                  <Link
                    href={l.to}
                    className="text-sm text-cream/80 transition-colors hover:text-cream"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="eyebrow mb-5 text-cream/55">The Jar</h4>
            <ul className="space-y-2.5 text-sm text-cream/80">
              <li>Dragon Fruit Spread &middot; 340g</li>
              <li>Cold-set, small batch</li>
              <li>No added sugar &middot; pure Black Cumin honey</li>
              <li>No artificial ingredients</li>
              <li>3-day full-refund promise</li>
              <li>Halal certified process</li>
            </ul>
          </div>
          <div>
            <h4 className="eyebrow mb-5 text-cream/55">Company</h4>
            <ul className="space-y-2.5 text-sm text-cream/80">
              <li>Fresava Foods</li>
              <li>Block-F, Sector-2, House-6, Avenue-9, Aftabnagar, Dhaka 1212</li>
              <li>hello@fresava.com</li>
              <li>+880 1700 000 000</li>
            </ul>
          </div>
          <div>
            <h4 className="eyebrow mb-5 text-cream/55">Promise</h4>
            <p className="text-sm leading-relaxed text-cream/80">
              One fruit. One jar. Nothing hidden. We make healthy eating simple, accessible and
              trustworthy &mdash; for families, for children, for you.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-5 border-t border-cream/15 pt-8">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="mr-1 text-[0.68rem] tracking-[0.2em] text-cream/45 uppercase">
              We accept
            </span>
            {["Cash on delivery"].map((p) => (
              <span
                key={p}
                className="rounded-full border border-cream/20 px-3 py-1 text-[0.68rem] font-medium tracking-wide text-cream/75"
              >
                {p}
              </span>
            ))}
          </div>
          <div className="flex w-full flex-col items-center justify-between gap-4 text-[0.7rem] tracking-wide text-cream/55 sm:flex-row">
            <p>&copy; {new Date().getFullYear()} Fresava Foods. All rights reserved.</p>
            <p>Premium organic food &middot; Bangladesh</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
