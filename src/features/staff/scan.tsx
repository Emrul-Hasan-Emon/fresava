"use client";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api/client";
import { Scanner } from "@/features/fulfillment/scanner";
import { type OrderDetail, statuses, statusLabel } from "@shared/contracts";
import { Card, PageTitle, Message, button, secondary } from "@/features/ui";

export function StaffScan() {
  const [data, setData] = useState<OrderDetail | null>(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [requestId, setRequestId] = useState("");
  async function lookup(code: string) {
    setBusy(true);
    setError("");
    setMessage("");
    setData(null);
    try {
      const d = await api<OrderDetail>("staff/fulfillment/lookup", {
        method: "POST",
        kind: "staff",
        body: { tracking_code: code },
      });
      setData(d);
      setRequestId(crypto.randomUUID());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function advance() {
    if (!data) return;
    setBusy(true);
    setError("");
    try {
      await api("staff/fulfillment/advance", {
        method: "POST",
        kind: "staff",
        body: { order_id: data.order.id, expected_version: data.order.version, request_id: requestId },
      });
      setData(null);
      setMessage("Shipment advanced successfully. Scan again for another action.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const nextStatus = data ? statuses[statuses.indexOf(data.order.status) + 1] : null;
  return (
    <div className="mx-auto max-w-4xl">
      <PageTitle
        title="Scan shipment"
        eyebrow="Staff fulfillment"
        sub="Use the camera or tracking code to verify the parcel before changing its delivery status."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr]">
        <Card className="overflow-hidden">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow text-crimson/70">Camera ready</p>
              <h2 className="headline mt-3 text-3xl text-ink">Find the barcode</h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Live scan</span>
          </div>
          <Scanner onScan={lookup} />
        </Card>
        <Card className="bg-crimson-dark text-cream">
          <p className="eyebrow text-cream/45">Fulfillment rule</p>
          <h2 className="headline mt-3 text-4xl">Scan. Check. Confirm.</h2>
          <p className="mt-5 text-sm leading-6 text-cream/68">
            The next action only appears after a valid shipment is found, reducing accidental updates during busy shifts.
          </p>
          <div className="mt-7 rounded-3xl border border-cream/12 bg-cream/8 p-4 text-sm text-cream/72">
            Keep the customer phone and address visible before handing off the parcel.
          </div>
        </Card>
      </div>
      <Message error>{error}</Message>
      <Message>{message}</Message>
      {busy && <p role="status" className="my-4 rounded-2xl bg-white/65 px-4 py-3 text-sm text-ink/60">Working…</p>}
      {data && (
        <Card className="mt-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow text-crimson/70">{data.order.order_number}</p>
              <h2 className="headline mt-3 text-4xl text-ink">{data.order.customer_name}</h2>
            </div>
            <span className="rounded-full border border-crimson/15 bg-crimson/8 px-4 py-2 text-sm font-semibold text-crimson">
              {statusLabel(data.order.status)}
            </span>
          </div>
          <div className="mt-6 grid gap-4 rounded-3xl bg-cream/65 p-5 text-sm text-ink/70 sm:grid-cols-2">
            <div>
              <span className="block text-xs uppercase tracking-[0.18em] text-ink/35">Phone</span>
              <strong className="mt-1 block text-base text-ink">{data.order.phone}</strong>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-[0.18em] text-ink/35">City</span>
              <strong className="mt-1 block text-base text-ink">{data.order.city}</strong>
            </div>
            <div className="sm:col-span-2">
              <span className="block text-xs uppercase tracking-[0.18em] text-ink/35">Address</span>
              <strong className="mt-1 block text-base text-ink">{data.order.address}</strong>
            </div>
          </div>
          <ul className="mt-5 divide-y divide-ink/8 rounded-3xl border border-ink/8 bg-white/55 px-5">
            {data.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4 py-4 text-sm">
                <span className="font-medium text-ink">{i.quantity} × {i.product_name}</span>
                <span className="text-ink/50">{i.jars} jars</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {data.order.status !== "delivered" && nextStatus && (
              <button className={`${button} w-full sm:w-auto`} disabled={busy} onClick={advance}>
                Confirm → {statusLabel(nextStatus)}
              </button>
            )}
            <Link className={`${secondary} w-full sm:w-auto`} href={`/staff/orders/${data.order.id}`}>
              Full shipment details
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
