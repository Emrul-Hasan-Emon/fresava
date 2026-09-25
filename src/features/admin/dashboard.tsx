"use client";
import { useResource } from "@/features/use-resource";
import { type Dashboard, money } from "@shared/contracts";
import { Card, Message, PageTitle, secondary } from "@/features/ui";

export function AdminDashboard() {
  const { data, error, loading, reload } = useResource<Dashboard>("admin/dashboard", "admin");
  const maxMonth = Math.max(1, ...(data?.months.map((x) => x.value) ?? [1]));
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
          </>
        )
      )}
    </>
  );
}
