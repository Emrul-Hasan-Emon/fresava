"use client";
import { useResource } from "@/features/use-resource";
import type { InventoryLot } from "@shared/contracts";
import { Card, Message, PageTitle, secondary } from "@/features/ui";

export function AdminInventory() {
  const { data, error, loading, reload } = useResource<{ lots: InventoryLot[] }>(
    "admin/inventory",
    "admin",
  );

  const lots = data?.lots ?? [];
  const byProduct = new Map<string, { product_name: string; lots: InventoryLot[] }>();
  for (const lot of lots) {
    const entry = byProduct.get(lot.product_id) ?? { product_name: lot.product_name, lots: [] };
    entry.lots.push(lot);
    byProduct.set(lot.product_id, entry);
  }

  return (
    <>
      <PageTitle
        title="Inventory"
        eyebrow="Products"
        sub="Finished-goods stock levels by warehouse location, built from QC-approved stock receipts."
      >
        <button className={secondary} onClick={reload}>
          Refresh
        </button>
      </PageTitle>

      <Card>
        <Message error>{error}</Message>
        {loading ? (
          <p role="status" className="text-sm text-ink/60">
            Loading inventory…
          </p>
        ) : (
          <div className="space-y-8">
            {[...byProduct.entries()].map(([productId, group]) => {
              const totals = group.lots.reduce(
                (acc, l) => ({
                  available: acc.available + l.available_quantity,
                  reserved: acc.reserved + l.reserved_quantity,
                  received: acc.received + l.received_quantity,
                }),
                { available: 0, reserved: 0, received: 0 },
              );
              return (
                <div key={productId}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="headline text-2xl text-ink">{group.product_name}</h2>
                    <div className="flex gap-4 text-sm text-ink/60">
                      <span>
                        <strong className="text-ink">{totals.available}</strong> available
                      </span>
                      <span>
                        <strong className="text-ink">{totals.reserved}</strong> reserved
                      </span>
                      <span>
                        <strong className="text-ink">{totals.received}</strong> received
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 overflow-hidden rounded-3xl border border-ink/8 bg-white/55">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-ink/8 text-xs uppercase tracking-[0.16em] text-ink/38">
                          {["Batch", "Location", "Available", "Reserved", "Received", "Updated"].map((h) => (
                            <th key={h} className="p-4">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {group.lots.map((lot) => (
                          <tr key={lot.id} className="border-b border-ink/6 last:border-0">
                            <td className="p-4 font-medium text-ink">{lot.batch_number}</td>
                            <td className="p-4 text-ink/70">{lot.warehouse_location}</td>
                            <td className="p-4 font-semibold text-ink">{lot.available_quantity}</td>
                            <td className="p-4 text-ink/70">{lot.reserved_quantity}</td>
                            <td className="p-4 text-ink/70">{lot.received_quantity}</td>
                            <td className="p-4 text-ink/58">
                              {new Date(lot.updated_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
            {!lots.length && (
              <p className="py-12 text-center text-sm text-ink/55">
                No stock has been received yet.
              </p>
            )}
          </div>
        )}
      </Card>
    </>
  );
}
