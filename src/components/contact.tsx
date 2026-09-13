"use client";

import { useState, type FormEvent } from "react";
import { Container } from "./container";
import { Reveal } from "./reveal";
import { JarIllustration } from "./jar-illustration";

export function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="contact" className="bg-maroon py-24 text-cream-soft md:py-32">
      <Container className="grid items-center gap-16 md:grid-cols-2">
        <Reveal className="flex justify-center md:order-2">
          <JarIllustration className="h-72 w-auto opacity-90" />
        </Reveal>

        <Reveal className="md:order-1">
          <p className="text-xs font-medium tracking-[0.35em] text-cream-soft/70">
            CONTACT &amp; PRE-ORDER
          </p>
          <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
            Let&rsquo;s get a jar
            <br />
            into your kitchen.
          </h2>
          <p className="mt-5 max-w-md text-cream-soft/80">
            Seasonal batches are limited. Leave your details and we will
            confirm availability, delivery and pricing personally.
          </p>

          {submitted ? (
            <div className="mt-8 rounded-2xl border border-cream-soft/25 bg-cream-soft/10 p-6">
              <p className="font-display text-xl">Thank you.</p>
              <p className="mt-1 text-sm text-cream-soft/75">
                We&rsquo;ve got your details — expect a reply within one
                business day.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  required
                  type="text"
                  placeholder="Full name"
                  className="rounded-lg border border-cream-soft/25 bg-transparent px-4 py-3 text-sm placeholder:text-cream-soft/50 focus:border-cream-soft focus:outline-none"
                />
                <input
                  required
                  type="tel"
                  placeholder="Phone number"
                  className="rounded-lg border border-cream-soft/25 bg-transparent px-4 py-3 text-sm placeholder:text-cream-soft/50 focus:border-cream-soft focus:outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="Delivery area (e.g. Gulshan, Dhaka)"
                className="w-full rounded-lg border border-cream-soft/25 bg-transparent px-4 py-3 text-sm placeholder:text-cream-soft/50 focus:border-cream-soft focus:outline-none"
              />
              <button
                type="submit"
                className="w-full rounded-full bg-cream-soft py-3 text-sm font-medium text-maroon-deep transition-opacity hover:opacity-90 sm:w-auto sm:px-8"
              >
                Reserve my jar
              </button>
            </form>
          )}
        </Reveal>
      </Container>
    </section>
  );
}
