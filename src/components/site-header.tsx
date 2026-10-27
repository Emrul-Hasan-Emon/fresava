/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/cn";
import { AccountLink } from "@/features/customers/account-link";

const LEFT_LINKS = [
  { to: "/spread", label: "Shop" },
  { to: "/recipes", label: "Recipes" },
  { to: "/ingredients", label: "Ingredients" },
];
const RIGHT_LINKS = [
  { to: "/story", label: "Our Story" },
  { to: "/purity", label: "Purity" },
];
const MOBILE_LINKS = [...LEFT_LINKS, ...RIGHT_LINKS, { to: "/contact", label: "Contact" }];

function DesktopLink({
  to,
  label,
  outlined = false,
  active,
}: {
  to: string;
  label: string;
  outlined?: boolean;
  active: boolean;
}) {
  return (
    <Link
      href={to}
      className={cn(
        "relative flex items-center font-serif text-[1.08rem] font-semibold tracking-[-0.01em] text-[#17201d] transition-all duration-300 hover:text-[#910b0a]",
        outlined
          ? "h-[38px] rounded-[4px] border border-[#17201d]/40 px-4 hover:border-[#910b0a]"
          : "h-full",
        active && "text-[#910b0a]",
      )}
    >
      {label}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const { count, setOpen: setCartOpen } = useCart();

  useEffect(() => {
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

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 30) {
        setHeaderVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }
      if (open) {
        setHeaderVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }
      const difference = currentScrollY - lastScrollY.current;
      if (Math.abs(difference) < 6) return;
      setHeaderVisible(difference <= 0);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          headerVisible || open ? "translate-y-0" : "-translate-y-full",
        )}
      >
        <nav className="relative h-[70px] w-full border-b border-black/[0.04] bg-white">
          <div className="grid h-full w-full grid-cols-[40px_minmax(0,1fr)_40px] items-center px-3 sm:px-5 lg:grid-cols-[1fr_auto_1fr] lg:px-[58px] [&>a]:self-center [&>div]:self-center">
            <div className="hidden h-full items-center gap-7 lg:flex xl:gap-9">
              {LEFT_LINKS.map((link) => (
                <DesktopLink
                  key={link.to}
                  to={link.to}
                  label={link.label}
                  outlined={link.to === "/ingredients"}
                  active={pathname === link.to}
                />
              ))}
            </div>

            <Link
              href="/"
              aria-label="FRESAVA Home"
              className="relative col-start-2 row-start-1 z-10 justify-self-center transition-opacity duration-300 hover:opacity-75 lg:absolute lg:left-1/2 lg:top-1/2 lg:col-start-auto lg:row-start-auto lg:-translate-x-1/2 lg:-translate-y-1/2"
            >
              <img
                src="/images/fresava-logo.png"
                alt="FRESAVA"
                className="h-auto w-[160px] max-w-none object-contain sm:w-[170px] lg:w-[175px]"
              />
            </Link>

            <div className="col-start-3 hidden h-full items-center justify-end gap-7 lg:flex xl:gap-8">
              {RIGHT_LINKS.map((link) => (
                <DesktopLink key={link.to} to={link.to} label={link.label} active={pathname === link.to} />
              ))}

              <AccountLink variant="icon" />

              <button
                type="button"
                onClick={() => setCartOpen(true)}
                aria-label="Open shopping bag"
                className="group flex h-10 items-center gap-2 rounded-full px-1 text-[0.78rem] font-medium text-[#20312c]/80 transition-colors duration-300 hover:text-[#910b0a]"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 7h15l-1.5 9h-12z" />
                  <path d="M6 7l-1-4H2" />
                  <circle cx="9" cy="20" r="1.4" />
                  <circle cx="17" cy="20" r="1.4" />
                </svg>
                <span>Bag</span>
                {count > 0 && (
                  <span className="flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-[#910b0a] px-1 text-[0.6rem] font-bold text-white">
                    {count}
                  </span>
                )}
              </button>
            </div>

            <div className="col-span-3 col-start-1 row-start-1 flex w-full items-center justify-between lg:hidden">
              <button
                type="button"
                aria-label="Menu"
                onClick={() => setOpen((current) => !current)}
                className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-full text-[#20312c]"
              >
                <span className={cn("h-px w-[18px] bg-current transition-transform duration-300", open && "translate-y-[3px] rotate-45")} />
                <span className={cn("h-px w-[18px] bg-current transition-transform duration-300", open && "-translate-y-[3px] -rotate-45")} />
              </button>

              <button
                type="button"
                onClick={() => setCartOpen(true)}
                aria-label="Open shopping bag"
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#20312c]"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 7h15l-1.5 9h-12z" />
                  <path d="M6 7l-1-4H2" />
                  <circle cx="9" cy="20" r="1.4" />
                  <circle cx="17" cy="20" r="1.4" />
                </svg>
                {count > 0 && (
                  <span className="absolute right-0 top-0 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#910b0a] px-1 text-[0.55rem] font-bold text-white">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-[#fffdf8]/98 backdrop-blur-xl transition-all duration-500 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto px-3 pb-10 pt-[105px] sm:px-5">
          <p className="mb-4 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#910b0a]/60">
            Explore FRESAVA
          </p>
          <ul>
            {MOBILE_LINKS.map((link, index) => (
              <li
                key={link.to}
                style={{ transitionDelay: `${index * 40}ms` }}
                className={cn(
                  "border-b border-black/[0.07] transition-all duration-500",
                  open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                )}
              >
                <Link
                  href={link.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "headline flex items-center justify-between py-[17px] text-[1.75rem] text-[#20312c]",
                    pathname === link.to && "text-[#910b0a]",
                  )}
                >
                  {link.label}
                  <span className="text-lg font-normal">→</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-black/[0.07] pt-3">
            <AccountLink variant="mobile" onNavigate={() => setOpen(false)} />
          </div>

          <div className="mt-auto pt-8">
            <Link
              href="/spread"
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-center rounded-full bg-[#910b0a] py-4 text-[0.78rem] font-semibold tracking-[0.04em] text-white transition hover:bg-[#730807]"
            >
              Shop FRESAVA
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
