"use client";
/* eslint-disable @next/next/no-img-element */
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

const ZONE_LABEL: Record<string, string> = {
  dhaka: "Inside Dhaka",
  outside: "Outside Dhaka",
};

export function OrderContent({ data }: { data: OrderDetail }) {
  const { order, items, history } = data;
  const [copied, setCopied] = useState(false);
  const cancelled = order.status === "cancelled";
  const indexOfStatus = (s: string) =>
    (statuses as readonly string[]).indexOf(s);
  const activeIndex = cancelled
    ? history.reduce((max, h) => Math.max(max, indexOfStatus(h.to_status)), -1)
    : indexOfStatus(order.status);
  return (
    <>
      <div className="mb-6 overflow-hidden rounded-[2rem] bg-crimson-dark p-6 text-cream shadow-[0_24px_80px_rgba(47,20,13,0.18)] sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="eyebrow text-cream/45">Tracking number</p>
            <div className="mt-4 flex items-center gap-3">
              <p className="break-all font-mono text-lg text-cream sm:text-2xl">{order.tracking_code}</p>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(order.tracking_code).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  });
                }}
                className="shrink-0 rounded-full border border-cream/20 px-3 py-1 text-xs font-semibold text-cream/80 transition hover:bg-cream/10"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
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
              <li key={i.id} className="flex items-center justify-between gap-4 py-4 text-sm">
                <div className="flex items-center gap-4">
                  <img
                    src="/images/jar-hero.png"
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-xl bg-cream object-contain p-1"
                  />
                  <div>
                    <p className="font-semibold text-ink">{i.product_name}</p>
                    <small className="mt-1 block text-ink/48">{i.jars} × {i.jar_weight_g} g · quantity {i.quantity}</small>
                  </div>
                </div>
                <span className="font-semibold text-ink">{money(i.subtotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-3 rounded-2xl bg-white/60 p-5 text-sm">
            {[
              ["Order date", new Date(order.created_at).toLocaleDateString()],
              ["Payment method", "Cash on delivery"],
              ["Items", `${items.length} ${items.length === 1 ? "product" : "products"}`],
              ["Delivery zone", ZONE_LABEL[order.zone] ?? order.zone],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="text-ink/56">{k}</dt>
                <dd className="font-semibold text-ink">{v}</dd>
              </div>
            ))}
          </dl>
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
        {cancelled && (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-800">
            This order was cancelled
            {history.find((h) => h.to_status === "cancelled")?.created_at
              ? ` on ${new Date(
                  history.find((h) => h.to_status === "cancelled")!.created_at,
                ).toLocaleString()}`
              : ""}
            .
          </p>
        )}
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
    [busy, setBusy] = useState(false),
    [cancelling, setCancelling] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  async function cancelOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!data) return;
    const reason = new FormData(e.currentTarget).get("reason");
    setBusy(true);
    setActionError("");
    try {
      await api(
        kind === "admin"
          ? `admin/orders/${id}/cancel`
          : `customers/orders/${id}/cancel`,
        {
          method: "POST",
          kind,
          body: { expected_version: data.order.version, reason },
        },
      );
      setCancelling(false);
      reload();
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const CANCELLABLE_BY_CUSTOMER = ["order_confirmed", "ready_for_packing"];
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
            {kind !== "staff" &&
              (kind === "admin"
                ? data.order.status !== "delivered" &&
                  data.order.status !== "cancelled"
                : CANCELLABLE_BY_CUSTOMER.includes(data.order.status)) &&
              (cancelling ? (
                <Card className="mt-6">
                  <p className="eyebrow text-crimson/70">Cancel order</p>
                  <h2 className="headline mt-3 text-3xl text-ink">Why is this order being cancelled?</h2>
                  <form onSubmit={cancelOrder} className="mt-6 space-y-5">
                    <TextArea name="reason" required maxLength={500} rows={3} label="Reason" />
                    <div className="flex flex-wrap gap-3">
                      <button className={button} disabled={busy}>{busy ? "Cancelling…" : "Confirm cancellation"}</button>
                      <button type="button" className={secondary} disabled={busy} onClick={() => setCancelling(false)}>Keep order</button>
                    </div>
                  </form>
                </Card>
              ) : (
                <button className={`${secondary} mt-6`} onClick={() => setCancelling(true)}>
                  Cancel order
                </button>
              ))}
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
