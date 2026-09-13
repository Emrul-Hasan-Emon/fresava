"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Container } from "./container";
import { Reveal } from "./reveal";

const QUESTIONS = [
  {
    q: "Is Fresava halal?",
    a: "Yes. There is no gelatin, alcohol, or animal-derived additive in the jar — just fruit, raw honey, lemon juice, and citrus pectin.",
  },
  {
    q: "Is there any added sugar?",
    a: "No refined sugar, ever. Raw honey is the only sweetener, and it's honey we source and taste ourselves rather than blend from a bulk supplier.",
  },
  {
    q: "Is it vegan?",
    a: "It's vegetarian, not vegan — raw honey is the sweetener that makes the recipe work, so there's no plant-based swap in this batch.",
  },
  {
    q: "How should I store an open jar?",
    a: "Keep it refrigerated once opened and use a clean, dry spoon each time. Because there are no preservatives, we recommend finishing a jar within 3 weeks of opening.",
  },
  {
    q: "Where do you currently deliver?",
    a: "We're delivering across Dhaka directly, with select areas nationwide through courier partners. Tell us your area in the form below and we'll confirm availability.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 md:py-32">
      <Container className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <p className="text-xs font-medium tracking-[0.35em] text-maroon">
            QUESTIONS
          </p>
          <h2 className="mt-4 font-display text-4xl leading-tight text-ink md:text-5xl">
            Before you order.
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-12 divide-y divide-maroon/10 border-y border-maroon/10">
          {QUESTIONS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-lg text-ink md:text-xl">
                    {item.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-maroon transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="max-w-xl pb-5 text-sm text-ink/60">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </Reveal>
      </Container>
    </section>
  );
}
