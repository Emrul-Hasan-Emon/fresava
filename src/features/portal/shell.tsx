"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api/client";

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
  const links =
    kind === "admin"
      ? [
          ["/admin/dashboard", "Overview"],
          ["/admin/orders", "Orders"],
          ["/admin/feedback", "Feedback"],
        ]
      : [["/staff/scan", "Scan shipment"]];
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_0%,rgba(214,33,110,0.13),transparent_30%),linear-gradient(135deg,#fffaf2_0%,#f5eee2_55%,#fbe7ef_100%)] text-ink">
      <header className="sticky top-0 z-40 border-b border-white/55 bg-white/72 px-5 py-4 shadow-sm backdrop-blur-2xl sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <Link href={`/${kind}`} className="wordmark text-lg text-crimson sm:text-xl">
            FRESAVA
            <span className="ml-3 rounded-full border border-crimson/15 bg-crimson/8 px-2.5 py-1 font-sans text-[9px] tracking-[.22em] text-crimson/75">
              {kind.toUpperCase()}
            </span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden rounded-full bg-ink/5 px-4 py-2 font-medium text-ink/68 sm:inline-flex">{name}</span>
            <button
              className="rounded-full border border-ink/10 bg-white/75 px-4 py-2 font-semibold text-ink/68 transition hover:border-crimson/25 hover:text-crimson"
              onClick={async () => {
                try {
                  await api(`${kind}/auth/logout`, { method: "POST" });
                  router.replace(`/${kind}/login`);
                  router.refresh();
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[240px_1fr] lg:py-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[2rem] border border-white/65 bg-white/68 p-3 shadow-[0_18px_60px_rgba(47,20,13,0.08)] backdrop-blur-xl">
            <p className="px-4 pt-3 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-crimson/55">
              {kind === "admin" ? "Command" : "Fulfillment"}
            </p>
            <nav className="mt-3 flex gap-2 overflow-x-auto lg:flex-col" aria-label={`${kind} navigation`}>
              {links.map(([href, label]) => {
                const active = path.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`shrink-0 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-crimson text-cream shadow-[0_14px_32px_rgba(142,15,19,0.22)]"
                        : "text-ink/58 hover:bg-white hover:text-crimson"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
          {kind === "staff" && (
            <div className="mt-4 hidden rounded-[2rem] border border-white/65 bg-crimson-dark p-5 text-cream shadow-[0_18px_60px_rgba(47,20,13,0.12)] lg:block">
              <p className="eyebrow text-cream/45">Shift focus</p>
              <p className="mt-3 text-sm leading-6 text-cream/70">Scan one shipment, confirm the next safe status, then move to the next order.</p>
            </div>
          )}
        </aside>
        <main className="min-w-0">
          {error && <p role="alert" className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
          {children}
        </main>
      </div>
    </div>
  );
}
