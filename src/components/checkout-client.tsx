"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";
import { useCart } from "@/lib/cart-context";
import { formatBDT, getProduct, shippingFee } from "@/lib/products";
import type { ShipZone } from "@/lib/products";
import { cn } from "@/lib/cn";

type Method = "bkash" | "nagad" | "rocket" | "card" | "cod";

const METHODS: { id: Method; name: string; hint: string; badge: string; badgeClass: string }[] = [
  { id: "bkash", name: "bKash", hint: "Pay with your bKash wallet", badge: "bKash", badgeClass: "bg-[#E2136E] text-white" },
  { id: "nagad", name: "Nagad", hint: "Pay with your Nagad wallet", badge: "Nagad", badgeClass: "bg-[#F6921E] text-white" },
  { id: "rocket", name: "Rocket", hint: "DBBL mobile banking", badge: "Rocket", badgeClass: "bg-[#8C3494] text-white" },
  { id: "card", name: "Card", hint: "Visa · Mastercard · Amex", badge: "VISA", badgeClass: "bg-ink text-cream" },
  { id: "cod", name: "Cash on Delivery", hint: "Pay at your door", badge: "COD", badgeClass: "bg-[#1a7f37] text-white" },
];

const MERCHANT = "01XXX-XXXXXX";

interface PlacedOrder {
  id: string;
  total: number;
  method: string;
  name: string;
  phone: string;
  address: string;
  zone: ShipZone;
  eta: string;
  jars: number;
}

export function CheckoutClient() {
  const {
    lines,
    count,
    subtotal,
    savings,
    discount,
    promo,
    promoError,
    applyPromo,
    clearPromo,
    clear,
    setOpen,
  } = useCart();
  const [zone, setZone] = useState<ShipZone>("dhaka");
  const [method, setMethod] = useState<Method>("bkash");
  const [promoInput, setPromoInput] = useState("");
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState<PlacedOrder | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "Dhaka",
    note: "",
    wallet: "",
    trx: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardName: "",
  });

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => {
    let v = e.target.value;
    if (k === "cardNumber") {
      v = v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
    }
    if (k === "cardExpiry") {
      v = v.replace(/\D/g, "").slice(0, 4);
      if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2)}`;
    }
    if (k === "cardCvc") v = v.replace(/\D/g, "").slice(0, 4);
    if (k === "wallet" || k === "phone") v = v.replace(/[^\d+\- ]/g, "").slice(0, 14);
    setForm((f) => ({ ...f, [k]: v }));
  };

  const ship = useMemo(() => shippingFee(subtotal - discount, zone), [subtotal, discount, zone]);
  const total = Math.max(0, subtotal - discount + ship);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (lines.length === 0 || placing) return;
    setPlacing(true);
    const methodLabel = METHODS.find((m) => m.id === method)?.name ?? method;
    const snapshot: PlacedOrder = {
      id: `FRV-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      total,
      method: methodLabel,
      name: form.name,
      phone: form.phone,
      address: `${form.address}, ${form.city}`,
      zone,
      eta: zone === "dhaka" ? "24–48 hours" : "3–5 working days",
      jars: count,
    };
    window.setTimeout(() => {
      setOrder(snapshot);
      setPlacing(false);
      clear();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1900);
  };

  /* ---------------- SUCCESS ---------------- */
  if (order) {
    return (
      <>
        <SiteHeader />
        <div className="bg-cream pt-28 pb-24">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <div className="pop mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-crimson text-3xl text-cream">
              &#10003;
            </div>
            <p className="eyebrow mt-8 text-crimson/70">Order {order.id} confirmed</p>
            <h1 className="headline mt-4 text-4xl text-ink sm:text-6xl">
              Thank you, {order.name.split(" ")[0] || "friend"}.
            </h1>
            <p className="mx-auto mt-5 max-w-md text-[0.92rem] leading-relaxed text-ink/60">
              Your {order.jars} jar{order.jars > 1 ? "s" : ""} will reach {order.address} within{" "}
              {order.eta}. We will call {order.phone} to confirm, and you will pay{" "}
              <span className="font-medium text-ink">{formatBDT(order.total)}</span> via{" "}
              {order.method}.
            </p>
            <div className="mx-auto mt-10 max-w-md rounded-[24px] bg-white p-7 text-left">
              <div className="flex justify-between border-b border-ink/8 pb-4 text-sm">
                <span className="text-ink/50">Payment</span>
                <span className="font-medium text-ink">{order.method}</span>
              </div>
              <div className="flex justify-between border-b border-ink/8 py-4 text-sm">
                <span className="text-ink/50">Delivery</span>
                <span className="font-medium text-ink">{order.eta}</span>
              </div>
              <div className="flex justify-between pt-4 text-sm">
                <span className="text-ink/50">Charged</span>
                <span className="headline text-xl text-crimson">{formatBDT(order.total)}</span>
              </div>
            </div>
            <div className="mx-auto mt-8 max-w-md rounded-[24px] bg-crimson p-7 text-left text-cream">
              <p className="eyebrow text-cream/60">Our satisfaction promise</p>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-cream/85">
                Try your jar. If you are not satisfied within 3 days of delivery, we will give you
                a full refund. No awkward questions.
              </p>
              <Link
                href="/contact"
                className="mt-5 inline-block rounded-full bg-cream px-6 py-2 text-[0.78rem] font-medium text-crimson transition-transform hover:scale-105"
              >
                Contact Fresava
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/spread"
                className="rounded-full border border-ink/15 px-6 py-2.5 text-[0.78rem] text-ink transition-colors hover:border-crimson hover:text-crimson"
              >
                Shop more
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-ink/15 px-6 py-2.5 text-[0.78rem] text-ink transition-colors hover:border-crimson hover:text-crimson"
              >
                Talk to us
              </Link>
            </div>
          </div>
        </div>
        <SiteFooter />
      </>
    );
  }

  /* ---------------- EMPTY ---------------- */
  if (lines.length === 0) {
    return (
      <>
        <SiteHeader />
        <div className="flex min-h-[85svh] flex-col items-center justify-center bg-cream px-6 pt-20 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/jar-hero.png"
            alt=""
            className="blend-multiply h-48 w-auto object-contain"
          />
          <h1 className="headline mt-8 text-4xl text-ink sm:text-6xl">Nothing to pay for yet.</h1>
          <p className="mt-4 max-w-sm text-[0.9rem] text-ink/55">
            Your bag is empty. Add a jar or two, then come back to checkout.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/spread"
              className="rounded-full bg-crimson px-7 py-2.5 text-[0.8rem] font-medium text-cream transition-transform hover:scale-105"
            >
              Shop the Signature
            </Link>
            <Link
              href="/purity"
              className="rounded-full border border-ink/15 px-7 py-2.5 text-[0.8rem] text-ink transition-colors hover:border-crimson hover:text-crimson"
            >
              Our purity standard
            </Link>
          </div>
        </div>
        <SiteFooter />
      </>
    );
  }

  /* ---------------- FORM ---------------- */
  return (
    <>
      <SiteHeader />
      <div className="bg-white pt-24 pb-24 sm:pt-28">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <Reveal>
            <p className="eyebrow text-crimson/70">Bag &rarr; Details &rarr; Payment</p>
            <h1 className="headline mt-4 text-4xl text-ink sm:text-6xl">Checkout.</h1>
          </Reveal>

          <form onSubmit={submit} className="mt-12 grid items-start gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            {/* LEFT */}
            <div className="space-y-10">
              {/* Delivery */}
              <section className="rounded-[28px] bg-cream p-7 sm:p-10">
                <h2 className="headline text-2xl text-ink sm:text-3xl">Where is it going?</h2>
                <div className="mt-7 grid gap-6 sm:grid-cols-2">
                  <CheckoutField label="Full name" value={form.name} onChange={set("name")} required placeholder="Ayesha Rahman" />
                  <CheckoutField label="Phone" value={form.phone} onChange={set("phone")} required placeholder="01XXXXXXXXX" />
                </div>
                <div className="mt-6">
                  <CheckoutField label="Email (for receipt)" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
                </div>
                <div className="mt-6">
                  <CheckoutField label="Street address" value={form.address} onChange={set("address")} required placeholder="House, road, area" />
                </div>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <CheckoutField label="City" value={form.city} onChange={set("city")} required />
                  <div>
                    <span className="text-[0.72rem] tracking-[0.2em] text-ink/45 uppercase">Zone</span>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {(["dhaka", "outside"] as ShipZone[]).map((z) => (
                        <button
                          key={z}
                          type="button"
                          onClick={() => setZone(z)}
                          className={cn(
                            "rounded-2xl border px-4 py-3 text-left text-[0.8rem] transition-colors",
                            zone === z
                              ? "border-crimson bg-white text-ink"
                              : "border-ink/10 bg-transparent text-ink/55 hover:border-ink/25"
                          )}
                        >
                          <span className="block font-medium">
                            {z === "dhaka" ? "Inside Dhaka" : "Outside Dhaka"}
                          </span>
                          <span className="mt-0.5 block text-[0.72rem] opacity-70">
                            {subtotal - discount >= 1500 ? "Free" : z === "dhaka" ? "৳70" : "৳130"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <label className="text-[0.72rem] tracking-[0.2em] text-ink/45 uppercase">
                    Delivery note (optional)
                  </label>
                  <input
                    value={form.note}
                    onChange={set("note")}
                    placeholder="Gate code, preferred time&hellip;"
                    className="mt-3 w-full border-b border-ink/15 bg-transparent pb-3 text-[0.95rem] outline-none placeholder:text-ink/25 focus:border-crimson"
                  />
                </div>
              </section>

              {/* Payment */}
              <section className="rounded-[28px] bg-cream p-7 sm:p-10">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="headline text-2xl text-ink sm:text-3xl">How will you pay?</h2>
                  <span className="text-[0.7rem] tracking-wide text-ink/40">256-bit secured</span>
                </div>

                <div className="mt-7 grid gap-2.5">
                  {METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={cn(
                        "flex items-center gap-4 rounded-2xl border p-4 text-left transition-all",
                        method === m.id
                          ? "border-crimson bg-white shadow-[0_8px_30px_rgba(142,15,19,0.08)]"
                          : "border-ink/10 bg-transparent hover:border-ink/25"
                      )}
                    >
                      <span className={cn("rounded-lg px-2.5 py-1 text-[0.65rem] font-bold tracking-wide", m.badgeClass)}>
                        {m.badge}
                      </span>
                      <span className="flex-1">
                        <span className="block text-[0.88rem] font-medium text-ink">{m.name}</span>
                        <span className="block text-[0.74rem] text-ink/50">{m.hint}</span>
                      </span>
                      <span
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
                          method === m.id ? "border-crimson bg-crimson text-cream" : "border-ink/20 text-transparent"
                        )}
                      >
                        <span className="text-[0.6rem]">&#10003;</span>
                      </span>
                    </button>
                  ))}
                </div>

                {(method === "bkash" || method === "nagad" || method === "rocket") && (
                  <div className="mt-6 rounded-2xl bg-white p-6">
                    <p className="text-[0.82rem] leading-relaxed text-ink/60">
                      Send <span className="font-medium text-ink">{formatBDT(total)}</span> to our{" "}
                      {METHODS.find((m) => m.id === method)?.name} merchant{" "}
                      <span className="font-medium text-crimson">{MERCHANT}</span>, then enter
                      your wallet number and transaction ID below.
                    </p>
                    <div className="mt-5 grid gap-6 sm:grid-cols-2">
                      <CheckoutField label="Your wallet number" value={form.wallet} onChange={set("wallet")} required placeholder="01XXXXXXXXX" />
                      <CheckoutField label="Transaction ID" value={form.trx} onChange={set("trx")} required placeholder="e.g. 9HXK2M4P" />
                    </div>
                  </div>
                )}

                {method === "card" && (
                  <div className="mt-6 rounded-2xl bg-white p-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <CheckoutField label="Card number" value={form.cardNumber} onChange={set("cardNumber")} required placeholder="4242 4242 4242 4242" />
                      </div>
                      <CheckoutField label="Name on card" value={form.cardName} onChange={set("cardName")} required placeholder="AYESHA RAHMAN" />
                      <div className="grid grid-cols-2 gap-4">
                        <CheckoutField label="Expiry" value={form.cardExpiry} onChange={set("cardExpiry")} required placeholder="MM/YY" />
                        <CheckoutField label="CVC" value={form.cardCvc} onChange={set("cardCvc")} required placeholder="123" />
                      </div>
                    </div>
                    <p className="mt-4 text-[0.7rem] text-ink/40">
                      Cards are processed over an encrypted connection. We never store card
                      numbers.
                    </p>
                  </div>
                )}

                {method === "cod" && (
                  <div className="mt-6 rounded-2xl bg-white p-6">
                    <p className="text-[0.82rem] leading-relaxed text-ink/60">
                      Keep <span className="font-medium text-ink">{formatBDT(total)}</span> ready
                      &mdash; our rider collects it at your door. Please keep small change handy.
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* RIGHT — summary */}
            <aside className="rounded-[28px] bg-ink p-7 text-cream sm:p-9 lg:sticky lg:top-24">
              <div className="flex items-center justify-between">
                <h2 className="headline text-2xl">Summary</h2>
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="text-[0.74rem] text-cream/60 underline-offset-4 hover:underline"
                >
                  Edit bag
                </button>
              </div>

              <ul className="mt-6 space-y-4 border-b border-cream/12 pb-6">
                {lines.map((l) => {
                  const p = getProduct(l.id);
                  return (
                    <li key={l.id} className="flex items-center gap-3">
                      <div className="flex h-12 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-cream">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/images/jar-hero.png"
                          alt=""
                          className="blend-multiply h-10 w-auto object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-[0.82rem] font-medium">{p.name}</p>
                        <p className="text-[0.7rem] text-cream/50">
                          {p.size} &middot; Qty {l.qty}
                        </p>
                      </div>
                      <p className="text-[0.82rem]">{formatBDT(p.price * l.qty)}</p>
                    </li>
                  );
                })}
              </ul>

              {/* promo */}
              <div className="mt-6">
                {promo ? (
                  <div className="flex items-center justify-between rounded-2xl bg-cream/10 px-4 py-3 text-[0.8rem]">
                    <span>
                      Code <span className="font-semibold">{promo}</span> &middot; &minus;
                      {formatBDT(discount)}
                    </span>
                    <button type="button" onClick={clearPromo} className="text-cream/60 hover:text-cream">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Promo code — try FRESAVA10"
                        className="w-full rounded-2xl border border-cream/15 bg-transparent px-4 py-2.5 text-[0.8rem] outline-none placeholder:text-cream/30 focus:border-cream/40"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (applyPromo(promoInput)) setPromoInput("");
                        }}
                        className="shrink-0 rounded-2xl bg-cream/12 px-4 text-[0.78rem] font-medium transition-colors hover:bg-cream/20"
                      >
                        Apply
                      </button>
                    </div>
                    {promoError && <p className="mt-2 text-[0.72rem] text-[#ffb3c1]">{promoError}</p>}
                  </div>
                )}
              </div>

              <dl className="mt-6 space-y-2.5 text-[0.85rem]">
                <div className="flex justify-between text-cream/70">
                  <dt>Subtotal</dt>
                  <dd>{formatBDT(subtotal)}</dd>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-cream/70">
                    <dt>Bundle savings</dt>
                    <dd>&minus; {formatBDT(savings)}</dd>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-cream/70">
                    <dt>Promo {promo}</dt>
                    <dd>&minus; {formatBDT(discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between text-cream/70">
                  <dt>Delivery ({zone === "dhaka" ? "Dhaka" : "Outside Dhaka"})</dt>
                  <dd>{ship === 0 ? "FREE" : formatBDT(ship)}</dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-cream/12 pt-4">
                  <dt className="text-cream/70">Total</dt>
                  <dd className="headline text-3xl">{formatBDT(total)}</dd>
                </div>
              </dl>

              <button
                type="submit"
                disabled={placing}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-cream py-3.5 text-[0.85rem] font-semibold text-crimson transition-transform hover:scale-[1.02] disabled:opacity-70"
              >
                {placing ? (
                  <>
                    <span className="spinner" /> Processing payment&hellip;
                  </>
                ) : (
                  <>
                    Pay {formatBDT(total)} &middot; {METHODS.find((m) => m.id === method)?.name}
                  </>
                )}
              </button>
              <p className="mt-4 text-center text-[0.68rem] leading-relaxed text-cream/45">
                Try Fresava for 3 days. If you are not satisfied, contact us for a full refund. No
                awkward questions.
              </p>
            </aside>
          </form>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}

function CheckoutField({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[0.72rem] tracking-[0.2em] text-ink/45 uppercase">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="mt-3 w-full border-b border-ink/15 bg-transparent pb-3 text-[0.95rem] text-ink outline-none transition-colors placeholder:text-ink/25 focus:border-crimson"
      />
    </div>
  );
}
