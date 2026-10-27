"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useResource } from "@/features/use-resource";
import { api } from "@/lib/api/client";
import { type Order, type OrderDetail, statuses, statusLabel, money } from "@shared/contracts";
import { Card, Message, PageTitle, Pager, button, secondary } from "@/features/ui";
import { Scanner } from "@/features/fulfillment/scanner";

export function AdminOrders() {
  const router = useRouter();
  const [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState(""),
    [scan, setScan] = useState(false),
    [lookupError, setLookupError] = useState("");
  const { data, error, loading, reload } = useResource<{ orders: Order[]; total: number }>(
    `admin/orders?page=${page}&search=${encodeURIComponent(query)}&status=${status}`,
    "admin",
  );
  async function lookup(code: string) {
    try {
      setLookupError("");
      const detail = await api<OrderDetail>("admin/orders/lookup", { method: "POST", body: { tracking_code: code }, kind: "admin" });
      router.push(`/admin/orders/${detail.order.id}`);
    } catch (e) {
      setLookupError((e as Error).message);
    }
  }
  return (
    <>
      <PageTitle title="Orders" eyebrow="Order control" sub="Search, filter, scan, and review every customer order from one responsive workspace.">
        <button className={secondary} onClick={reload}>Refresh</button>
        <button className={button} onClick={() => setScan(!scan)}>{scan ? "Hide scanner" : "Find barcode"}</button>
      </PageTitle>
      {scan && (
        <Card className="mb-6">
          <div className="mb-5">
            <p className="eyebrow text-crimson/70">Barcode lookup</p>
            <h2 className="headline mt-3 text-3xl text-ink">Scan any shipment label</h2>
          </div>
          <Scanner onScan={lookup} />
          <Message error>{lookupError}</Message>
        </Card>
      )}
      <Card>
        <form
          className="mb-6 grid gap-3 lg:grid-cols-[1fr_220px_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setQuery(search);
          }}
        >
          <input
            aria-label="Search orders"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Order, customer, city, phone or tracking"
            className="min-w-0 rounded-2xl border border-ink/10 bg-white/85 p-3.5 text-sm outline-none focus:border-crimson/50 focus:ring-4 focus:ring-crimson/10"
          />
          <select
            aria-label="Order status"
            className="rounded-2xl border border-ink/10 bg-white/85 p-3.5 text-sm outline-none focus:border-crimson/50 focus:ring-4 focus:ring-crimson/10"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option value="">All statuses</option>
            {[...statuses, "cancelled"].map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
          </select>
          <button className={button}>Search</button>
        </form>
        <Message error>{error}</Message>
        {loading ? (
          <p role="status" className="text-sm text-ink/60">Loading orders…</p>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-3xl border border-ink/8 bg-white/55 lg:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-ink/8 text-xs uppercase tracking-[0.16em] text-ink/38">
                    {["Order", "Customer", "Status", "Total", "Created"].map((s) => <th key={s} className="p-4">{s}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {data?.orders.map((o) => (
                    <tr key={o.id} className="border-b border-ink/6 last:border-0 hover:bg-cream/50">
                      <td className="p-4">
                        <Link href={`/admin/orders/${o.id}`} className="font-semibold text-crimson underline underline-offset-4">{o.order_number}</Link>
                        <small className="mt-1 block font-mono text-ink/42">{o.tracking_code}</small>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-ink">{o.customer_name}</span>
                        <small className="mt-1 block text-ink/48">{o.phone} · {o.city}</small>
                      </td>
                      <td className="p-4"><span className="rounded-full bg-crimson/8 px-3 py-1 text-xs font-semibold text-crimson">{statusLabel(o.status)}</span></td>
                      <td className="p-4 font-semibold text-ink">{money(o.total)}</td>
                      <td className="p-4 text-ink/58">{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid gap-4 lg:hidden">
              {data?.orders.map((o) => (
                <div key={o.id} className="rounded-3xl border border-ink/8 bg-white/58 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/admin/orders/${o.id}`} className="font-semibold text-crimson underline underline-offset-4">{o.order_number}</Link>
                      <p className="mt-2 text-sm font-medium text-ink">{o.customer_name}</p>
                      <p className="text-xs text-ink/48">{o.phone} · {o.city}</p>
                    </div>
                    <span className="rounded-full bg-crimson/8 px-3 py-1 text-xs font-semibold text-crimson">{statusLabel(o.status)}</span>
                  </div>
                  <div className="mt-4 flex justify-between rounded-2xl bg-cream/70 p-3 text-sm">
                    <span>{money(o.total)}</span>
                    <span>{new Date(o.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
            {!data?.orders.length && <p className="py-12 text-center text-sm text-ink/55">No matching orders.</p>}
            <Pager page={page} more={page * 20 < (data?.total ?? 0)} onPage={setPage} />
          </>
        )}
      </Card>
    </>
  );
}
