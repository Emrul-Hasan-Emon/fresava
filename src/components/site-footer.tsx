/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

const EXPLORE_LINKS = [
  { to: "/", label: "Home" },
  { to: "/spread", label: "Shop" },
  { to: "/recipes", label: "Recipes" },
  { to: "/ingredients", label: "Ingredients" },
  { to: "/story", label: "Our Story" },
  { to: "/purity", label: "Purity" },
  { to: "/contact", label: "Contact" },
];

const SOCIALS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/myfresava",
    path: "M13.5 22v-9h3l.45-3.5H13.5V7.25c0-1.01.28-1.7 1.74-1.7H17.1V2.42c-.32-.04-1.42-.14-2.7-.14-2.67 0-4.5 1.63-4.5 4.63V9.5H6.88V13H9.9v9h3.6Z",
    fill: true,
  },
  { label: "Instagram", href: "https://www.instagram.com/myfresava/", instagram: true },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/myfresava",
    path: "M5.34 3.5A2.34 2.34 0 1 1 5.34 8.18 2.34 2.34 0 0 1 5.34 3.5ZM3.32 9.88h4.04V21H3.32V9.88Zm6.56 0h3.87v1.52h.05c.54-1.02 1.86-2.1 3.83-2.1 4.1 0 4.85 2.7 4.85 6.2V21h-4.03v-4.87c0-1.16-.02-2.65-1.62-2.65-1.62 0-1.87 1.26-1.87 2.57V21H9.88V9.88Z",
    fill: true,
  },
  {
    label: "Pinterest",
    href: "https://www.pinterest.com/myfresava",
    path: "M12 2C6.48 2 3 5.95 3 10.24c0 3.17 1.77 5.98 4.42 7.03-.06-.54-.11-1.38.02-1.97l1.15-4.87s-.29-.58-.29-1.44c0-1.35.78-2.36 1.76-2.36.83 0 1.23.62 1.23 1.37 0 .84-.53 2.08-.8 3.23-.23.97.49 1.76 1.45 1.76 1.74 0 3.08-1.84 3.08-4.49 0-2.35-1.69-3.99-4.1-3.99-2.79 0-4.43 2.09-4.43 4.26 0 .84.32 1.75.73 2.24.08.1.09.18.07.29l-.27 1.1c-.04.18-.14.22-.33.13-1.23-.57-2-2.37-2-3.81 0-3.1 2.25-5.95 6.49-5.95 3.41 0 6.06 2.43 6.06 5.67 0 3.39-2.14 6.12-5.1 6.12-1 0-1.93-.52-2.25-1.13l-.61 2.33c-.22.85-.82 1.92-1.22 2.57.92.28 1.89.43 2.9.43 5.52 0 9-4 9-8.58C21 5.95 17.52 2 12 2Z",
    fill: true,
  },
  {
    label: "X",
    href: "https://x.com/myfresava",
    path: "M18.244 2H21.552L14.325 10.26L22.827 22H16.17L10.956 15.183L4.99 22H1.68L9.416 13.163L1.254 2H8.08L12.793 8.231L18.244 2ZM17.083 19.932H18.916L7.084 3.96H5.117L17.083 19.932Z",
    fill: true,
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-crimson text-cream">
      <div className="mx-auto max-w-[1280px] px-6 pb-8 pt-0 sm:px-8">
        <div className="border-b border-cream/15">
          <div className="flex h-[110px] items-center justify-center overflow-hidden sm:h-[190px]">
            <img
              src="/images/fresava-white-logo.png"
              alt="FRESAVA"
              className="w-[280px] max-w-[85vw] object-contain opacity-90 sm:w-[650px] sm:max-w-[90vw]"
            />
          </div>
        </div>

        <div className="border-t border-cream/20" />

        <div className="grid gap-8 pt-6 pb-6 sm:gap-12 sm:pt-9 sm:pb-8 md:grid-cols-[0.8fr_1.2fr_1fr] md:gap-20">
          <div>
            <h4 className="eyebrow mb-5 text-cream/55">Explore</h4>
            <ul className="grid grid-cols-2 gap-x-5 gap-y-3 text-sm sm:block sm:space-y-2.5">
              {EXPLORE_LINKS.map((l) => (
                <li key={l.to}>
                  <Link href={l.to} className="text-cream/80 transition-colors hover:text-cream">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="eyebrow mb-5 text-cream/55">Company</h4>
            <div className="space-y-4 text-sm leading-6 text-cream/80">
              <p>Fresava Foods</p>
              <p>
                Block-F, Sector-2, House-6,
                <br />
                Avenue-9, Aftabnagar,
                <br />
                Dhaka 1212
              </p>
              <div className="space-y-1.5">
                <a href="mailto:help@fresava.com" className="block transition-colors hover:text-cream">
                  help@fresava.com
                </a>
                <a href="tel:+8809658517906" className="block transition-colors hover:text-cream">
                  +8809658517906
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="eyebrow mb-5 text-cream/55">Our Promise</h4>
            <p className="max-w-[320px] text-sm leading-6 text-cream/80">
              One fruit. One jar. Nothing hidden. We make healthy eating simple, accessible and
              trustworthy for families, for children, for you.
            </p>
          </div>
        </div>

        <div className="pb-6 pt-4 text-center sm:pb-8 sm:pt-2">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-cream/55">
            Follow Fresava
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-5 sm:mt-5 sm:gap-7">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="text-cream/80 transition-all duration-300 hover:-translate-y-1 hover:text-cream"
              >
                {"instagram" in s ? (
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    className={s.label === "X" ? "h-[22px] w-[22px]" : "h-6 w-6"}
                    fill="currentColor"
                  >
                    <path d={s.path} />
                  </svg>
                )}
              </a>
            ))}
          </div>
        </div>

        <div className="grid gap-3 border-t border-cream/20 pt-5 text-center text-[0.67rem] leading-relaxed text-cream/60 sm:gap-4 sm:pt-6 md:grid-cols-3 md:text-left">
          <p>&copy; {new Date().getFullYear()} Fresava Foods. All rights reserved.</p>
          <p className="whitespace-nowrap text-[10px] uppercase tracking-[0.06em] sm:text-inherit sm:tracking-[0.18em] md:text-center">
            Made Halal &middot; Made Clean &middot; Made Fresava
          </p>
          <p className="md:text-right">Premium organic food &middot; Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}
