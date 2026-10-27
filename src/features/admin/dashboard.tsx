"use client";
import Link from "next/link";
import { useResource } from "@/features/use-resource";
import { type Dashboard, type Order, money, statusLabel } from "@shared/contracts";
import { Card, Message, PageTitle, secondary, button } from "@/features/ui";

export function AdminDashboard() {
  const { data, error, loading, reload } = useResource<Dashboard>("admin/dashboard", "admin");
  const { data: recent } = useResource<{ orders: Order[] }>("admin/orders?page=1", "admin");
  const maxMonth = Math.max(1, ...(data?.months.map((x) => x.value) ?? [1]));
  const inProgress = data
    ? Math.max(0, data.order_count - data.pending - data.delivered)
    : 0;
  const donutTotal = data ? Math.max(1, data.order_count) : 1;
  const pendingPct = data ? (data.pending / donutTotal) * 100 : 0;
  const progressPct = data ? (inProgress / donutTotal) * 100 : 0;
  return (
    <>
      <PageTitle
        title="Store command center"
        eyebrow="Admin dashboard"
        sub="A quick read on demand, collection, customers, delivery progress, and top-selling bundles."
      >
        <button className={secondary} onClick={reload}>Refresh</button>
      </PageTitle>
      <Message error>{error}</Message>
      {loading ? (
        <Card><p role="status" className="text-sm text-ink/60">Loading overview…</p></Card>
      ) : (
        data && (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Orders", data.order_count, "Confirmed demand"],
                ["Placed value", money(data.placed_value), "Gross order value"],
                ["Collected COD", money(data.collected_revenue), "Cash received"],
                ["Customers", data.customers, "Unique phones"],
                ["Awaiting delivery", data.pending, "Needs movement"],
                ["Delivered", data.delivered, "Completed orders"],
              ].map(([label, value, hint]) => (
                <Card key={label} className="relative overflow-hidden">
                  <div className="absolute right-[-22px] top-[-22px] h-24 w-24 rounded-full bg-crimson/8" />
                  <p className="text-sm font-medium text-ink/48">{label}</p>
                  <p className="headline mt-5 text-4xl text-ink">{value}</p>
                  <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-crimson/55">{hint}</p>
                </Card>
              ))}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <Card>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="eyebrow text-crimson/70">Revenue rhythm</p>
                    <h2 className="headline mt-3 text-3xl text-ink">Order value · last six months</h2>
                  </div>
                </div>
                <div className="mt-8 space-y-5">
                  {data.months.map((m) => (
                    <div key={m.month}>
                      <div className="mb-2 flex justify-between gap-4 text-sm">
                        <span className="font-medium text-ink">{m.month}</span>
                        <span className="text-ink/58">{money(m.value)}</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-cream">
                        <div className="h-3 rounded-full bg-crimson transition-all" style={{ width: `${(m.value / maxMonth) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <p className="eyebrow text-crimson/70">Fulfillment mix</p>
                <h2 className="headline mt-3 text-3xl text-ink">Order status</h2>
                <div className="mt-8 flex items-center justify-center">
                  <div
                    className="relative flex h-40 w-40 items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(var(--color-crimson) 0% ${pendingPct}%, #e8a33d ${pendingPct}% ${pendingPct + progressPct}%, #2f9e5c ${pendingPct + progressPct}% 100%)`,
                    }}
                  >
                    <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
                      <p className="headline text-2xl text-ink">{data.order_count}</p>
                      <p className="text-[0.65rem] uppercase tracking-[0.14em] text-ink/45">Total</p>
                    </div>
                  </div>
                </div>
                <ul className="mt-6 space-y-2 text-sm">
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-ink/65">
                      <span className="h-2.5 w-2.5 rounded-full bg-crimson" /> Pending
                    </span>
                    <strong className="text-ink">{data.pending}</strong>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-ink/65">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#e8a33d]" /> In progress
                    </span>
                    <strong className="text-ink">{inProgress}</strong>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-ink/65">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#2f9e5c]" /> Delivered
                    </span>
                    <strong className="text-ink">{data.delivered}</strong>
                  </li>
                </ul>
              </Card>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <Card>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="eyebrow text-crimson/70">Latest activity</p>
                    <h2 className="headline mt-3 text-3xl text-ink">Recent orders</h2>
                  </div>
                  <Link href="/admin/orders" className="text-sm font-semibold text-crimson">
                    View all orders →
                  </Link>
                </div>
                <div className="mt-6 overflow-hidden rounded-3xl border border-ink/8">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-ink/8 text-xs uppercase tracking-[0.14em] text-ink/38">
                        {["Order", "Customer", "Status", "Total"].map((h) => (
                          <th key={h} className="p-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recent?.orders.slice(0, 5).map((o) => (
                        <tr key={o.id} className="border-b border-ink/6 last:border-0">
                          <td className="p-3">
                            <Link href={`/admin/orders/${o.id}`} className="font-semibold text-crimson underline underline-offset-4">
                              {o.order_number}
                            </Link>
                          </td>
                          <td className="p-3 text-ink/70">{o.customer_name}</td>
                          <td className="p-3">
                            <span className="rounded-full bg-crimson/8 px-2.5 py-1 text-xs font-semibold text-crimson">
                              {statusLabel(o.status)}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-ink">{money(o.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!recent?.orders.length && (
                    <p className="p-5 text-center text-sm text-ink/55">No orders yet.</p>
                  )}
                </div>
              </Card>

              <Card>
                <p className="eyebrow text-crimson/70">Product pull</p>
                <h2 className="headline mt-3 text-3xl text-ink">Top products</h2>
                <ul className="mt-6 divide-y divide-ink/8">
                  {data.top_products.map((p) => (
                    <li key={p.name} className="flex justify-between gap-4 py-4 text-sm">
                      <span>
                        <strong className="text-ink">{p.name}</strong>
                        <small className="mt-1 block text-ink/48">{p.quantity} bundles sold</small>
                      </span>
                      <span className="font-semibold text-ink">{money(p.sales)}</span>
                    </li>
                  ))}
                </ul>
                {!data.top_products.length && <p className="mt-6 text-sm text-ink/55">No orders yet.</p>}
              </Card>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[0.6fr_1.4fr]">
              <Card className="relative overflow-hidden bg-crimson-dark text-cream">
                <p className="eyebrow text-cream/55">Customer base</p>
                <p className="headline mt-4 text-5xl">{data.customers}</p>
                <p className="mt-2 text-sm text-cream/68">Unique customers served</p>
                <Link href="/admin/customers" className="mt-6 inline-block text-sm font-semibold text-cream underline underline-offset-4">
                  View customers →
                </Link>
              </Card>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["Orders", "Review and fulfill every order.", "/admin/orders"],
                  ["Feedback", "Read what customers are saying.", "/admin/feedback"],
                  ["Staff", "Manage operational staff.", "/admin/staff"],
                ].map(([title, body, href]) => (
                  <Link key={title} href={href} className="group">
                    <Card className="h-full transition hover:-translate-y-1">
                      <h3 className="headline text-2xl text-ink">{title}</h3>
                      <p className="mt-2 text-sm text-ink/55">{body}</p>
                      <span className="mt-4 inline-block text-sm font-semibold text-crimson">Open →</span>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            <Card className="mt-6 bg-crimson text-cream">
              <p className="eyebrow text-cream/55">Quick actions</p>
              <h2 className="headline mt-3 text-3xl">Jump straight to the task.</h2>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link className={`${button} bg-cream text-crimson hover:bg-white`} href="/admin/orders">
                  Manage orders
                </Link>
                <Link className={`${button} bg-cream text-crimson hover:bg-white`} href="/admin/products">
                  Manage products
                </Link>
                <Link className={`${button} bg-cream text-crimson hover:bg-white`} href="/admin/customers">
                  Customers
                </Link>
                <Link className={`${button} bg-cream text-crimson hover:bg-white`} href="/admin/settings">
                  Admin settings
                </Link>
              </div>
            </Card>
          </>
        )
      )}
    </>
  );
}
