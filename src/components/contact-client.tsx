"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/cn";
import { COUNTRIES } from "@/lib/countries";

const INTENTS = ["Pre-order a jar", "Stock Fresava", "Partnership", "Something else"];

export function ContactClient() {
  const [intent, setIntent] = useState(INTENTS[0]);
  const [sent, setSent] = useState(false);
  const [dialCode, setDialCode] = useState("+880");
  const [form, setForm] = useState({
    name: "",
    email: "",
    country: "Bangladesh",
    city: "",
    phone: "",
    message: "",
  });

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const fullPhone = `${dialCode} ${form.phone}`.trim();
    window.location.href = `mailto:help@fresava.com?subject=${encodeURIComponent(intent)}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nCountry: ${form.country}\nCity: ${form.city}\nPhone: ${fullPhone}\n\n${form.message}`)}`;
  };

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Contact & Pre-order"
          title={
            <>
              Let&rsquo;s get a jar
              <br />
              into your kitchen.
            </>
          }
          sub="Seasonal batches are limited. Complete the form to prepare an email in your email app, or order through WhatsApp."
          image="/images/jar-dark.jpg"
          dark
        />

        <section className="bg-white py-24 sm:py-32">
          <div className="mx-auto grid max-w-6xl gap-16 px-6 sm:px-8 lg:grid-cols-[1.15fr_0.85fr]">
            <Reveal>
              {sent ? (
                <div className="rounded-[28px] bg-cream p-12 text-center">
                  <p className="headline text-4xl text-crimson">
                    Thank you, {form.name || "friend"}.
                  </p>
                  <p className="mt-5 text-[0.92rem] leading-relaxed text-ink/60">
                    Your request has been noted. A member of the Fresava team will reply within
                    one working day with batch availability and delivery details.
                  </p>
                  <button
                    onClick={() => {
                      setSent(false);
                      setForm({
                        name: "",
                        email: "",
                        country: "Bangladesh",
                        city: "",
                        phone: "",
                        message: "",
                      });
                    }}
                    className="mt-8 rounded-full border border-crimson/25 px-6 py-2 text-[0.78rem] text-crimson transition-colors hover:bg-crimson hover:text-cream"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-8">
                  <div>
                    <p className="eyebrow text-crimson/70">I would like to</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {INTENTS.map((i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setIntent(i)}
                          className={cn(
                            "rounded-full px-4 py-2 text-[0.76rem] tracking-wide transition-colors",
                            intent === i
                              ? "bg-crimson text-cream"
                              : "bg-black/5 text-ink/60 hover:bg-black/10"
                          )}
                        >
                          {i}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field label="Name" value={form.name} onChange={set("name")} required />
                    <Field
                      label="Email"
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      required
                    />
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="text-[0.72rem] tracking-[0.2em] text-ink/45 uppercase">
                        Country
                      </label>
                      <select
                        value={form.country}
                        onChange={set("country")}
                        className="mt-3 w-full border-b border-black/15 bg-transparent pb-3 text-[0.95rem] text-ink outline-none transition-colors focus:border-crimson"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.flag} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Field label="City" value={form.city} onChange={set("city")} />
                  </div>
                  <div>
                    <label className="text-[0.72rem] tracking-[0.2em] text-ink/45 uppercase">
                      Phone
                    </label>
                    <div className="mt-3 flex items-end gap-3 border-b border-black/15 pb-3 focus-within:border-crimson">
                      <select
                        aria-label="Country code"
                        value={dialCode}
                        onChange={(e) => setDialCode(e.target.value)}
                        className="shrink-0 bg-transparent text-[0.95rem] text-ink outline-none"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={`${c.name}-${c.code}`} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={set("phone")}
                        className="w-full min-w-0 bg-transparent text-[0.95rem] text-ink outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[0.72rem] tracking-[0.2em] text-ink/45 uppercase">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      value={form.message}
                      onChange={set("message")}
                      placeholder="How many jars, and where should they go?"
                      className="mt-3 w-full resize-none border-b border-black/15 bg-transparent pb-3 text-[0.95rem] text-ink outline-none transition-colors placeholder:text-ink/25 focus:border-crimson"
                    />
                  </div>

                  <button
                    type="submit"
                    className="rounded-full bg-crimson px-8 py-3 text-[0.8rem] font-medium tracking-wide text-cream transition-transform hover:scale-105"
                  >
                    Open email to send
                  </button>
                </form>
              )}
            </Reveal>

            <Reveal delay={120}>
              <div className="space-y-10">
                <div>
                  <p className="eyebrow text-crimson/70">Fresava Foods</p>
                  <p className="mt-4 text-[0.92rem] leading-relaxed text-ink/60">
                    Block-F, Sector-2, House-6,
                    <br />
                    Avenue-9, Aftabnagar,
                    <br />
                    Dhaka 1212, Bangladesh
                  </p>
                </div>
                <div className="space-y-3 border-t border-black/8 pt-8 text-[0.92rem]">
                  <p className="text-ink">help@fresava.com</p>
                  <p className="text-ink">+8809658517906</p>
                  <p className="text-ink/50">Sat &ndash; Thu &middot; 10:00 &ndash; 16:00</p>
                </div>
                <div className="border-t border-black/8 pt-8">
                  <p className="eyebrow text-crimson/70">Where to find us</p>
                  <ul className="mt-4 space-y-2.5 text-[0.9rem] text-ink/60">
                    <li>Premium supermarkets &middot; Dhaka</li>
                    <li>Speciality caf&eacute;s &amp; hotels</li>
                    <li>Online grocery platforms</li>
                    <li>Direct delivery inside Dhaka</li>
                  </ul>
                </div>
                <div className="border-t border-black/8 pt-8">
                  <p className="eyebrow text-crimson/70">Satisfaction guarantee</p>
                  <p className="mt-4 text-[0.9rem] leading-relaxed text-ink/60">
                    Try your Fresava jar for 3 days after delivery. If you are not satisfied,
                    contact us for a full refund. We want the first spoonful to feel right.
                  </p>
                </div>
                <div className="overflow-hidden rounded-3xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/jar-hero.png"
                    alt=""
                    className="blend-multiply w-full object-contain"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-[0.72rem] tracking-[0.2em] text-ink/45 uppercase">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-3 w-full border-b border-black/15 bg-transparent pb-3 text-[0.95rem] text-ink outline-none transition-colors focus:border-crimson"
      />
    </div>
  );
}
