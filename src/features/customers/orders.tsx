"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import { useResource } from "@/features/use-resource";
import { type Order, money, statusLabel } from "@shared/contracts";
import { Card, PageTitle, Message, Pager, button, secondary } from "@/features/ui";

function statusTone(status: string) {
  if (status === "delivered") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "cancelled") return "bg-red-50 text-red-700 border-red-200";
  return "bg-crimson/8 text-crimson border-crimson/15";
}

const FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "history", label: "History" },
] as const;

export function CustomerOrders() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [copied, setCopied] = useState<string | null>(null);
  const { data, error, loading, reload } = useResource<{
    orders: Order[];
    hasMore: boolean;
  }>(`customers/orders?page=${page}`, "customer");
  const visibleOrders = (data?.orders ?? []).filter((o) => {
    if (filter === "active") return o.status !== "delivered" && o.status !== "cancelled";
    if (filter === "history") return o.status === "delivered" || o.status === "cancelled";
    return true;
  });
  function copyReference(code: string) {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(null), 1500);
    });
  }
  return (
    <>
      <PageTitle
        title="Your orders"
        eyebrow="Order lounge"
        sub="Every confirmed jar appears here with its delivery status, tracking code, and final cash-on-delivery amount."
      >
        <button className={secondary} onClick={reload}>
          Refresh
        </button>
        <Link href="/account" className={secondary}>
          My account
        </Link>
      </PageTitle>
      <div className="mb-7 overflow-hidden rounded-[2rem] border border-white/60 bg-crimson-dark shadow-[0_24px_80px_rgba(47,20,13,0.16)]">
        <div className="grid items-center gap-6 p-6 text-cream sm:p-8 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <p className="eyebrow text-cream/50">Freshness in motion</p>
            <h2 className="headline mt-4 text-4xl sm:text-5xl">Track the journey from kitchen to table.</h2>
            <p className="mt-5 max-w-xl text-sm leading-6 text-cream/68">
              We keep the important details visible: order number, status, tracking code, value, and delivery date updates.
            </p>
          </div>
          <img
            src="/images/order-banner.jpg"
            alt="Fresava — Good food takes time"
            className="h-48 w-full rounded-[1.5rem] object-cover shadow-2xl lg:h-64"
          />
        </div>
      </div>
      <div className="mb-5 inline-flex rounded-full border border-ink/10 bg-white/60 p-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-4 py-1.5 text-[0.78rem] font-medium transition-colors ${
              filter === f.id ? "bg-crimson text-cream" : "text-ink/55 hover:text-ink"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <Message error>{error}</Message>
      {loading ? (
        <Card>
          <p role="status" className="text-sm text-ink/60">
            Loading your order history…
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2">
            {visibleOrders.map((o) => (
              <Card key={o.id} className="group transition hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(47,20,13,0.14)]">
                <div className="flex items-start gap-4">
                  <img
                    src="/images/jar-hero.png"
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-2xl bg-cream object-contain p-1"
                  />
                  <div className="flex flex-1 items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow text-crimson/60">{o.order_number}</p>
                      <h2 className="headline mt-3 text-3xl text-ink">{statusLabel(o.status)}</h2>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(o.status)}`}>
                      {statusLabel(o.status)}
                    </span>
                  </div>
                </div>
                <div className="mt-6 grid gap-3 rounded-3xl bg-cream/70 p-4 text-sm text-ink/68 sm:grid-cols-2">
                  <div>
                    <span className="block text-xs uppercase tracking-[0.18em] text-ink/35">Total</span>
                    <strong className="mt-1 block text-base text-ink">{money(o.total)}</strong>
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-[0.18em] text-ink/35">Created</span>
                    <strong className="mt-1 block text-base text-ink">{new Date(o.created_at).toLocaleDateString()}</strong>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-2 rounded-2xl border border-ink/8 bg-white/60 px-4 py-3">
                  <p className="flex-1 break-all font-mono text-xs text-ink/55">{o.tracking_code}</p>
                  <button
                    type="button"
                    onClick={() => copyReference(o.tracking_code)}
                    className="shrink-0 text-xs font-semibold text-crimson underline-offset-2 hover:underline"
                  >
                    {copied === o.tracking_code ? "Copied" : "Copy"}
                  </button>
                </div>
                <Link className={`${button} mt-5 w-full sm:w-auto`} href={`/orders/${o.id}`}>
                  Track order
                </Link>
              </Card>
            ))}
          </div>
          {!visibleOrders.length && (data?.orders.length ?? 0) > 0 && (
            <Card className="text-center">
              <p className="text-sm text-ink/55">No orders match this filter.</p>
            </Card>
          )}
          {!data?.orders.length && (
            <Card className="text-center">
              <p className="eyebrow text-crimson/70">Nothing here yet</p>
              <h2 className="headline mx-auto mt-4 max-w-2xl text-4xl text-ink">
                Your first Fresava order will live here.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-ink/58">
                Guest orders are available on the device used at checkout. Sign in before ordering to keep your history across devices.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link className={button} href="/spread">
                  Shop the Signature
                </Link>
                <Link className={secondary} href="/auth">
                  Sign in
                </Link>
              </div>
            </Card>
          )}
          <Pager page={page} more={data?.hasMore ?? false} onPage={setPage} />
        </>
      )}
    </>
  );
}
