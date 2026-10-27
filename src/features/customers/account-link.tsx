"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api/client";
export function AccountLink({
  variant = "default",
  onNavigate,
}: {
  variant?: "default" | "icon" | "mobile";
  onNavigate?: () => void;
}) {
  const [loggedIn, setLoggedIn] = useState(false);
  const path = usePathname();
  useEffect(() => {
    let active = true;
    api("customers/auth/session")
      .then(() => {
        if (active) setLoggedIn(true);
      })
      .catch(() => {
        if (active) setLoggedIn(false);
      });
    return () => {
      active = false;
    };
  }, [path]);
  const href = loggedIn ? "/account" : "/auth";
  if (variant === "icon")
    return (
      <Link
        href={href}
        aria-label={loggedIn ? "My account" : "Log in"}
        className="flex h-9 w-9 items-center justify-center rounded-full text-[#20312c]/75 transition-all duration-300 hover:bg-[#910b0a]/[0.06] hover:text-[#910b0a]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 21c.8-4 3.1-6 7-6s6.2 2 7 6" />
        </svg>
      </Link>
    );
  if (variant === "mobile")
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className="flex items-center justify-between py-[17px] text-[#20312c] transition-colors hover:text-[#910b0a]"
      >
        <span className="headline text-[1.75rem]">{loggedIn ? "My Account" : "Log In"}</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 21c.8-4 3.1-6 7-6s6.2 2 7 6" />
        </svg>
      </Link>
    );
  return (
    <Link
      href={href}
      className="rounded-full border border-ink/10 px-3 py-2 text-xs"
      aria-label="Customer account"
    >
      Account
    </Link>
  );
}
