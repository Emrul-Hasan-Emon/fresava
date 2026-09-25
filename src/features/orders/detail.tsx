"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useResource } from "@/features/use-resource";
import { api } from "@/lib/api/client";
import {
  type OrderDetail,
  type AccountType,
  statuses,
  statusLabel,
  money,
} from "@shared/contracts";
import {
  Card,
  Message,
  PageTitle,
  Back,
  button,
  secondary,
  SelectField,
  TextArea,
} from "@/features/ui";

export function OrderContent({ data }: { data: OrderDetail }) {
  const { order, items, history } = data;
  const activeIndex = statuses.indexOf(order.status);
  return (
    <>
      <div className="mb-6 overflow-hidden rounded-[2rem] bg-crimson-dark p-6 text-cream shadow-[0_24px_80px_rgba(47,20,13,0.18)] sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="eyebrow text-cream/45">Tracking number</p>
            <p className="mt-4 break-all font-mono text-lg text-cream sm:text-2xl">{order.tracking_code}</p>
            <div className="mt-6 inline-flex rounded-full border border-cream/15 bg-cream/10 px-4 py-2 text-sm font-semibold text-cream">
              {statusLabel(order.status)}
            </div>
          </div>
          <div className="rounded-3xl border border-cream/12 bg-cream/8 p-5">
            <p className="text-sm text-cream/55">Estimated delivery</p>
            <p className="headline mt-2 text-3xl">{order.eta}</p>
            <p className="mt-3 text-sm text-cream/60">Cash on delivery · {order.payment_status}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <p className="eyebrow text-crimson/70">Destination</p>
          <h2 className="headline mt-3 text-3xl text-ink">Delivery details</h2>
          <div className="mt-6 space-y-3 rounded-3xl bg-cream/65 p-5 text-sm leading-6 text-ink/70">
            <p className="text-base font-semibold text-ink">{order.customer_name}</p>
            <p>{order.phone}</p>
            <p>{order.address}, {order.city}</p>
            {order.email && <p>{order.email}</p>}
            {order.notes && <p className="border-t border-ink/8 pt-3">Note: {order.notes}</p>}
          </div>
        </Card>
        <Card>
          <p className="eyebrow text-crimson/70">Order basket</p>
          <h2 className="headline mt-3 text-3xl text-ink">Your items</h2>
          <ul className="mt-5 divide-y divide-ink/8">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4 py-4 text-sm">
                <div>
                  <p className="font-semibold text-ink">{i.product_name}</p>
                  <small className="mt-1 block text-ink/48">{i.jars} × {i.jar_weight_g} g · quantity {i.quantity}</small>
                </div>
                <span className="font-semibold text-ink">{money(i.subtotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-3 rounded-3xl bg-cream/65 p-5 text-sm">
            {[
              ["Subtotal", order.subtotal],
              ["Discount", -order.discount],
              ["Delivery", order.shipping],
              [order.payment_status === "collected" ? "Collected" : "Amount due", order.total],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="text-ink/56">{k}</dt>
                <dd className="font-semibold text-ink">{money(Number(v))}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
      <Card className="mt-6">
        <p className="eyebrow text-crimson/70">Fulfillment journey</p>
        <h2 className="headline mt-3 text-3xl text-ink">From confirmation to delivery</h2>
        <ol className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statuses.map((s, i) => {
            const event = history.find((h) => h.to_status === s);
            const done = i <= activeIndex;
            return (
              <li
                key={s}
                className={`relative rounded-3xl border p-5 ${done ? "border-crimson/18 bg-crimson/7 text-ink" : "border-ink/8 bg-white/55 text-ink/40"}`}
              >
                <span className={`mb-4 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${done ? "bg-crimson text-cream" : "bg-ink/8 text-ink/35"}`}>
                  {i + 1}
                </span>
                <p className="text-sm font-semibold">{statusLabel(s)}</p>
                <p className="mt-2 text-xs leading-5">
                  {event ? new Date(event.created_at).toLocaleString() : "Awaiting update"}
                </p>
              </li>
            );
          })}
        </ol>
      </Card>
    </>
  );
}

export function OrderDetailPage({ id, kind }: { id: string; kind: AccountType }) {
  const prefix = kind === "customer" ? "customers" : kind;
  const { data, error, loading, reload } = useResource<OrderDetail>(`${prefix}/orders/${id}`, kind);
  const [actionError, setActionError] = useState(""),
    [busy, setBusy] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  async function feedback(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = new FormData(e.currentTarget);
    setBusy(true);
    setActionError("");
    try {
      await api(`customers/orders/${id}/feedback`, {
        method: "POST",
        kind: "customer",
        body: { rating: Number(values.get("rating")), feedback: values.get("feedback") },
      });
      reload();
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Back href={kind === "customer" ? "/orders" : kind === "admin" ? "/admin/orders" : "/staff/scan"}>Back</Back>
      <PageTitle
        title={data?.order.order_number ?? "Order details"}
        eyebrow={kind === "customer" ? "Order tracking" : "Order operations"}
        sub={kind === "customer" ? "A clear view of your delivery, payment status, and fulfillment progress." : undefined}
      >
        <button className={secondary} onClick={reload}>Refresh status</button>
        {kind === "admin" && <Link className={button} href={`/admin/orders/${id}/label`}>Print label</Link>}
      </PageTitle>
      <Message error>{error || actionError}</Message>
      {loading ? (
        <Card><p role="status" className="text-sm text-ink/60">Loading order details…</p></Card>
      ) : (
        data && (
          <>
            <OrderContent data={data} />
            {kind === "admin" && data.order.payment_status === "unpaid" && (
              <button
                className={`${button} mt-6`}
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await api(`admin/orders/${id}/payment-collected`, { method: "POST", kind: "admin" });
                    reload();
                  } catch (e) {
                    setActionError((e as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Record COD collected
              </button>
            )}
            {kind === "customer" && data.order.status === "delivered" && (
              <Card className="mt-6">
                <p className="eyebrow text-crimson/70">Aftertaste</p>
                <h2 className="headline mt-3 text-3xl text-ink">How was your Fresava experience?</h2>
                {data.feedback ? (
                  <p className="mt-5 rounded-3xl bg-cream/65 p-5 text-sm text-ink/70">
                    {data.feedback.rating}/5 — {data.feedback.feedback}
                  </p>
                ) : (
                  <form ref={form} onSubmit={feedback} className="mt-6 space-y-5">
                    <SelectField name="rating" required label="Rating">
                      <option value="">Choose</option>
                      {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
                    </SelectField>
                    <TextArea name="feedback" required maxLength={500} rows={4} label="Your feedback" />
                    <button className={button} disabled={busy}>{busy ? "Sending…" : "Submit feedback"}</button>
                  </form>
                )}
              </Card>
            )}
          </>
        )
      )}
    </>
  );
}
