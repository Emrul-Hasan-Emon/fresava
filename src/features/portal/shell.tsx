"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api/client";

function Icon({ path }: { path: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  overview: "M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-4H3zM13 9h8V3h-8z",
  orders: "M4 7h16l-1.5 11h-13zM4 7l-1-4h-2M9 11v4M15 11v4",
  customers: "M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M11 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  products: "M21 8l-9-5-9 5 9 5 9-5ZM3 8v8l9 5 9-5V8M12 13v8",
  manufacturing: "M3 21h18M5 21V9l5 4V9l5 4V9l5 4v8M5 9l2-5M19 9l-2-5",
  feedback: "M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z",
  staff: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.36.38.66.69.88a1.65 1.65 0 0 0 .82.22H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z",
  scan: "M3 7V4a1 1 0 0 1 1-1h3M3 17v3a1 1 0 0 0 1 1h3M21 7V4a1 1 0 0 0-1-1h-3M21 17v3a1 1 0 0 1-1 1h-3M7 12h10",
} as const;

export function PortalShell({
  kind,
  name,
  children,
}: {
  kind: "admin" | "staff";
  name: string;
  children: React.ReactNode;
}) {
  const path = usePathname(),
    router = useRouter();
  const [error, setError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [search, setSearch] = useState("");
  const links: [string, string, keyof typeof ICONS][] =
    kind === "admin"
      ? [
          ["/admin/dashboard", "Overview", "overview"],
          ["/admin/orders", "Orders", "orders"],
          ["/admin/customers", "Customers", "customers"],
          ["/admin/products", "Products", "products"],
          ["/admin/manufacturing", "Manufacturing", "manufacturing"],
          ["/admin/pricing", "Pricing & Bundles", "products"],
          ["/admin/quality-control", "Quality Control", "manufacturing"],
          ["/admin/inventory", "Inventory", "products"],
          ["/admin/receiving", "Stock Receiving", "products"],
          ["/admin/availability", "Availability", "products"],
          ["/admin/feedback", "Feedback", "feedback"],
          ["/admin/staff", "Staff", "staff"],
          ["/admin/settings", "Settings", "settings"],
        ]
      : [["/staff/scan", "Scan shipment", "scan"]];
  const initial = name.trim()[0]?.toUpperCase() || "F";

  async function signOut() {
    try {
      await api(`${kind}/auth/logout`, { method: "POST" });
      router.replace(`/${kind}/login`);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-crimson-dark text-cream">
      <div className="p-6">
        <Link href={`/${kind}`} className="wordmark text-lg text-cream">
          FRESAVA
        </Link>
        <p className="mt-1 text-[0.68rem] uppercase tracking-[0.2em] text-cream/45">
          {kind === "admin" ? "Admin Portal" : "Fulfillment Portal"}
        </p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label={`${kind} navigation`}>
        {links.map(([href, label, icon]) => {
          const active = path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-cream text-crimson-dark" : "text-cream/75 hover:bg-cream/10 hover:text-cream"
              }`}
            >
              <Icon path={ICONS[icon]} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3">
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-cream/75 transition hover:bg-cream/10 hover:text-cream"
        >
          <Icon path="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_0%,rgba(214,33,110,0.13),transparent_30%),linear-gradient(135deg,#fffaf2_0%,#f5eee2_55%,#fbe7ef_100%)] text-ink lg:grid lg:grid-cols-[270px_1fr]">
      <aside className="hidden lg:block">{sidebar}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-[270px]">{sidebar}</div>
        </div>
      )}
      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-white/55 bg-white/72 px-4 py-3 shadow-sm backdrop-blur-2xl sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                aria-label="Open menu"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink/10 lg:hidden"
                onClick={() => setMobileOpen(true)}
              >
                <Icon path="M4 7h16M4 12h16M4 17h16" />
              </button>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (kind === "admin")
                    router.push(`/admin/orders?search=${encodeURIComponent(search)}`);
                }}
                className="hidden items-center gap-2 rounded-full border border-ink/10 bg-white/85 px-4 py-2 sm:flex"
              >
                <Icon path="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.35-4.35" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search orders, customers, tracking…"
                  className="w-56 bg-transparent text-sm outline-none placeholder:text-ink/35"
                />
              </form>
            </div>
            <div className="flex items-center gap-2">
              <button
                aria-label="Refresh"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 bg-white/75 text-ink/60 transition hover:text-crimson"
                onClick={() => router.refresh()}
              >
                <Icon path="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
              </button>
              <div className="relative">
                <button
                  aria-label="Notifications"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 bg-white/75 text-ink/60 transition hover:text-crimson"
                  onClick={() => {
                    setNotifOpen((v) => !v);
                    setProfileOpen(false);
                  }}
                >
                  <Icon path="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9ZM13.73 21a2 2 0 0 1-3.46 0" />
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-ink/10 bg-white p-4 text-sm text-ink/55 shadow-xl">
                    No new notifications.
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  className="flex items-center gap-2 rounded-full border border-ink/10 bg-white/75 py-1.5 pl-1.5 pr-3 text-sm font-medium text-ink/75"
                  onClick={() => {
                    setProfileOpen((v) => !v);
                    setNotifOpen(false);
                  }}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-crimson text-xs font-semibold text-cream">
                    {initial}
                  </span>
                  <span className="hidden sm:inline">{name}</span>
                  <Icon path="M6 9l6 6 6-6" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-ink/10 bg-white text-sm shadow-xl">
                    <p className="border-b border-ink/8 px-4 py-3 text-ink/40">
                      {kind === "admin" ? "Administrator" : "Staff"}
                    </p>
                    {kind === "admin" && (
                      <Link
                        href="/admin/settings"
                        className="block px-4 py-3 text-ink/75 hover:bg-cream/70"
                        onClick={() => setProfileOpen(false)}
                      >
                        Admin Settings
                      </Link>
                    )}
                    <button
                      onClick={signOut}
                      className="block w-full px-4 py-3 text-left text-ink/75 hover:bg-cream/70"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:py-8">
          <p className="mb-4 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-crimson/55">
            FRESAVA / {kind.toUpperCase()}
          </p>
          {error && <p role="alert" className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
          {children}
        </main>
      </div>
    </div>
  );
}
