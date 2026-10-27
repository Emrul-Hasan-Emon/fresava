"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useMarket } from "@/lib/market-context";
import { api } from "@/lib/api/client";
import { type Quote, type OrderDetail, money } from "@shared/contracts";
import { COUNTRIES } from "@/lib/countries";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import {
  Card,
  Field,
  PageTitle,
  Message,
  button,
  secondary,
  PortalBackdrop,
  SelectField,
  TextArea,
} from "@/features/ui";
import { OrderContent } from "@/features/orders/detail";

export function CheckoutClient() {
  const { lines, hydrated, clear, promo, applyPromo, promoError } = useCart();
  const { market } = useMarket();
  const [dialCode, setDialCode] = useState("+880"),
    [phoneNumber, setPhoneNumber] = useState(""),
    [zone, setZone] = useState("dhaka"),
    [quoteResult, setQuoteResult] = useState<{ key: string; quote: Quote | null; error: string } | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [order, setOrder] = useState<OrderDetail | null>(null),
    [promoInput, setPromoInput] = useState(promo),
    [retry, setRetry] = useState(0);
  const pending = useRef<{ key: string; payload: string } | null>(null);
  const quoteKey = JSON.stringify({ lines, zone, promo, retry });
  const quote = quoteResult?.key === quoteKey ? quoteResult.quote : null;
  const quoteError = quoteResult?.key === quoteKey ? quoteResult.error : "";
  useEffect(() => {
    if (!hydrated || !lines.length) return;
    const controller = new AbortController();
    api<Quote>("checkout/quote", {
      method: "POST",
      body: { lines: lines.map((l) => ({ sku: l.id, quantity: l.qty })), zone, promo },
      signal: controller.signal,
    })
      .then((quote) => {
        if (!controller.signal.aborted) setQuoteResult({ key: quoteKey, quote, error: "" });
      })
      .catch((e) => {
        if (!controller.signal.aborted) setQuoteResult({ key: quoteKey, quote: null, error: e.message });
      });
    return () => controller.abort();
  }, [lines, zone, promo, hydrated, quoteKey]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || !quote) return;
    setBusy(true);
    setError("");
    const values = new FormData(e.currentTarget);
    const customer = Object.fromEntries(["name", "email", "address", "city", "notes"].map((k) => [k, String(values.get(k) ?? "")]));
    customer.phone = `${dialCode} ${phoneNumber}`.trim();
    const payload = { quote: { lines: lines.map((l) => ({ sku: l.id, quantity: l.qty })), zone, promo }, customer };
    const encoded = JSON.stringify(payload);
    if (!pending.current || pending.current.payload !== encoded) pending.current = { key: crypto.randomUUID(), payload: encoded };
    try {
      await api("customers/guest-session", { method: "POST", kind: "customer" });
      const result = await api<OrderDetail>("orders", { method: "POST", kind: "customer", body: { ...payload, idempotency_key: pending.current.key } });
      setOrder(result);
      clear();
      window.scrollTo(0, 0);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <SiteHeader />
      <PortalBackdrop>
        {order ? (
          <>
            <PageTitle title="Your order is confirmed." eyebrow={order.order.order_number} sub="We have received your order and prepared the tracking page for this delivery.">
              <Link className={button} href={`/orders/${order.order.id}`}>Track this order</Link>
            </PageTitle>
            <OrderContent data={order} />
          </>
        ) : market !== "BD" ? (
          <Card className="text-center">
            <p className="eyebrow text-crimson/70">Bangladesh only</p>
            <h1 className="headline mx-auto mt-4 max-w-2xl text-4xl text-ink">
              We currently accept orders within Bangladesh only.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm text-ink/60">
              USD pricing on the Spread page is shown for reference. Switch
              back to BDT to check out and arrange Cash on Delivery.
            </p>
          </Card>
        ) : !hydrated ? (
          <Card><p role="status" className="text-sm text-ink/60">Loading your bag…</p></Card>
        ) : !lines.length ? (
          <Card className="text-center">
            <p className="eyebrow text-crimson/70">Empty bag</p>
            <h1 className="headline mx-auto mt-4 max-w-2xl text-5xl text-ink">Your jar is still waiting on the shelf.</h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-ink/58">Choose your Fresava bundle, then return here for a smooth cash-on-delivery checkout.</p>
            <Link href="/spread" className={`${button} mt-7`}>Shop the Signature</Link>
          </Card>
        ) : (
          <>
            <PageTitle
              title="A calm checkout for a clean jar."
              eyebrow="Secure checkout"
              sub={<>Cash on delivery is available. <Link href="/auth" className="font-semibold text-crimson underline underline-offset-4">Sign in</Link> to keep orders across devices, or continue as a guest.</>}
            />
            <Message error>{error || quoteError}</Message>
            <form onSubmit={submit} className="grid items-start gap-7 lg:grid-cols-[1.25fr_0.85fr]">
              <Card>
                <div className="mb-7 flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow text-crimson/70">Step 1</p>
                    <h2 className="headline mt-3 text-4xl text-ink">Where should we send it?</h2>
                  </div>
                  <span className="hidden rounded-full bg-crimson/8 px-4 py-2 text-xs font-semibold text-crimson sm:inline-flex">COD</span>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field name="name" label="Full name" autoComplete="name" required maxLength={120} />
                  <label className="block text-[0.78rem] font-semibold tracking-wide text-ink/70">
                    Phone
                    <div className="mt-2 flex gap-2">
                      <select
                        aria-label="Country code"
                        value={dialCode}
                        onChange={(e) => setDialCode(e.target.value)}
                        className="w-[6.5rem] shrink-0 rounded-2xl border border-ink/10 bg-white/85 px-2 py-3.5 text-sm text-ink outline-none focus:border-crimson/50 focus:ring-4 focus:ring-crimson/10"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={`${c.name}-${c.code}`} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        aria-label="Phone number"
                        autoComplete="tel"
                        required
                        maxLength={20}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full min-w-0 rounded-2xl border border-ink/10 bg-white/85 px-4 py-3.5 text-sm text-ink shadow-inner shadow-black/[0.02] outline-none transition focus:border-crimson/50 focus:bg-white focus:ring-4 focus:ring-crimson/10"
                      />
                    </div>
                  </label>
                  <Field name="email" label="Email (optional)" type="email" autoComplete="email" maxLength={254} />
                  <Field name="city" label="City" defaultValue="Dhaka" autoComplete="address-level2" required maxLength={100} />
                </div>
                <div className="mt-5">
                  <Field name="address" label="Street address" autoComplete="street-address" required maxLength={400} />
                </div>
                <div className="mt-5">
                  <SelectField label="Delivery zone" value={zone} onChange={(e) => setZone(e.target.value)}>
                    <option value="dhaka">Inside Dhaka</option>
                    <option value="outside">Outside Dhaka</option>
                  </SelectField>
                </div>
                <div className="mt-5">
                  <TextArea name="notes" maxLength={1000} rows={3} label="Delivery note (optional)" />
                </div>
                <div className="mt-7 grid gap-4 rounded-3xl border border-emerald-200 bg-emerald-50/80 p-5 text-sm text-emerald-900 sm:grid-cols-[auto_1fr]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">✓</span>
                  <div>
                    <h3 className="font-semibold">Cash on delivery</h3>
                    <p className="mt-1 text-emerald-800/75">Pay the rider when your order arrives. Your tracking page is created immediately after confirmation.</p>
                  </div>
                </div>
              </Card>
              <Card className="lg:sticky lg:top-24">
                <p className="eyebrow text-crimson/70">Step 2</p>
                <h2 className="headline mt-3 text-4xl text-ink">Order summary</h2>
                {quote ? (
                  <>
                    <ul className="mt-6 divide-y divide-ink/8">
                      {quote.lines.map((l) => (
                        <li key={l.sku} className="flex justify-between gap-4 py-4 text-sm">
                          <span className="text-ink">
                            <strong>{l.name}</strong>
                            <small className="mt-1 block text-ink/48">{l.jars} × {l.jar_weight_g} g · Qty {l.quantity}</small>
                          </span>
                          <span className="font-semibold text-ink">{money(l.subtotal)}</span>
                        </li>
                      ))}
                    </ul>
                    <dl className="mt-4 space-y-3 rounded-3xl bg-cream/70 p-5 text-sm">
                      {[
                        ["Subtotal", quote.subtotal],
                        ["Discount", -quote.discount],
                        ["Delivery", quote.shipping],
                        ["Amount due", quote.total],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4">
                          <dt className="text-ink/56">{k}</dt>
                          <dd className="font-semibold text-ink">{money(Number(v))}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-4 rounded-full bg-crimson/8 px-4 py-2 text-center text-sm font-medium text-crimson">Estimated delivery: {quote.eta}</p>
                  </>
                ) : (
                  <p className="my-6 text-sm text-ink/58">{quoteError ? "Unable to calculate your order." : "Calculating your order…"}</p>
                )}
                <div className="mt-6 flex gap-2">
                  <input aria-label="Promo code" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} placeholder="Promo code" className="min-w-0 flex-1 rounded-2xl border border-ink/10 bg-white/85 p-3 text-sm outline-none focus:border-crimson/50 focus:ring-4 focus:ring-crimson/10" />
                  <button type="button" className={secondary} onClick={() => applyPromo(promoInput)}>Apply</button>
                </div>
                <Message error>{promoError}</Message>
                {quoteError && <button type="button" className={`${secondary} mt-5`} onClick={() => setRetry((v) => v + 1)}>Retry</button>}
                <button className={`${button} mt-6 w-full`} disabled={busy || !quote}>{busy ? "Placing order…" : "Confirm COD order"}</button>
              </Card>
            </form>
          </>
        )}
      </PortalBackdrop>
      <SiteFooter />
    </>
  );
}
