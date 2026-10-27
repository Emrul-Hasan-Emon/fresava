"use client";
import { useState } from "react";
import { useResource } from "@/features/use-resource";
import { type Customer, money } from "@shared/contracts";
import { Card, Message, PageTitle, Pager, button, secondary } from "@/features/ui";

export function AdminCustomers() {
  const [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [query, setQuery] = useState("");
  const { data, error, loading, reload } = useResource<{
    customers: Customer[];
    total: number;
  }>(`admin/customers?page=${page}&search=${encodeURIComponent(query)}`, "admin");

  return (
    <>
      <PageTitle
        title="Customers"
        eyebrow="Customer directory"
        sub="Every customer, grouped from their orders — no separate account required to appear here."
      >
        <button className={secondary} onClick={reload}>
          Refresh
        </button>
      </PageTitle>
      <Card>
        <form
          className="mb-6 grid gap-3 lg:grid-cols-[1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setQuery(search);
          }}
        >
          <input
            aria-label="Search customers"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, phone, email or city"
            className="min-w-0 rounded-2xl border border-ink/10 bg-white/85 p-3.5 text-sm outline-none focus:border-crimson/50 focus:ring-4 focus:ring-crimson/10"
          />
          <button className={button}>Search</button>
        </form>
        <Message error>{error}</Message>
        {loading ? (
          <p role="status" className="text-sm text-ink/60">
            Loading customers…
          </p>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-3xl border border-ink/8 bg-white/55 lg:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-ink/8 text-xs uppercase tracking-[0.16em] text-ink/38">
                    {["Customer", "Contact", "Orders", "Spent", "Last order"].map(
                      (s) => (
                        <th key={s} className="p-4">
                          {s}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data?.customers.map((c) => (
                    <tr
                      key={c.key}
                      className="border-b border-ink/6 last:border-0 hover:bg-cream/50"
                    >
                      <td className="p-4">
                        <span className="font-semibold text-ink">{c.name}</span>
                        <small className="mt-1 block text-ink/48">{c.city}</small>
                      </td>
                      <td className="p-4 text-ink/70">
                        {c.phone}
                        {c.email && <small className="mt-1 block text-ink/48">{c.email}</small>}
                      </td>
                      <td className="p-4 font-medium text-ink">{c.orders}</td>
                      <td className="p-4 font-semibold text-ink">{money(c.spent)}</td>
                      <td className="p-4 text-ink/58">
                        {new Date(c.last_order_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid gap-4 lg:hidden">
              {data?.customers.map((c) => (
                <div
                  key={c.key}
                  className="rounded-3xl border border-ink/8 bg-white/58 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{c.name}</p>
                      <p className="mt-1 text-xs text-ink/48">
                        {c.phone}
                        {c.email ? ` · ${c.email}` : ""}
                      </p>
                      <p className="mt-1 text-xs text-ink/48">{c.city}</p>
                    </div>
                    <span className="rounded-full bg-crimson/8 px-3 py-1 text-xs font-semibold text-crimson">
                      {c.orders} order{c.orders > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="mt-4 flex justify-between rounded-2xl bg-cream/70 p-3 text-sm">
                    <span>{money(c.spent)}</span>
                    <span>{new Date(c.last_order_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
            {!data?.customers.length && (
              <p className="py-12 text-center text-sm text-ink/55">
                No matching customers.
              </p>
            )}
            <Pager page={page} more={page * 20 < (data?.total ?? 0)} onPage={setPage} />
          </>
        )}
      </Card>
    </>
  );
}
