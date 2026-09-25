"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api/client";
export function AccountLink() {
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
  return (
    <Link
      href={loggedIn ? "/account" : "/auth"}
      className="rounded-full border border-ink/10 px-3 py-2 text-xs"
      aria-label="Customer account"
    >
      Account
    </Link>
  );
}
