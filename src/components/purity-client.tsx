"use client";
import {SiteHeader} from "@/components/site-header";
import {SiteFooter} from "@/components/site-footer";
import { IMG } from "@/lib/assets";
import {Reveal} from "@/components/reveal";
import {PageHero} from "@/components/page-hero";
import { mapRange, useScrollProgress } from "@/lib/hooks";

const NOTS = [
  "Refined cane sugar",
  "Glucose & corn syrup",
  "Artificial colour",
  "Artificial flavour",
  "Chemical preservatives",
  "Thickeners & fillers",
  "Anything non-halal",
  "Anything we cannot pronounce",
];

const COMPARE = [
  ["Fruit content", "78%", "30 - 45%"],
  ["Refined sugar", "None", "Often over 50%"],
  ["Preservatives", "None", "Sodium benzoate / sorbate"],
  ["Colour", "From the fruit", "Added colourants"],
  ["Batch size", "Max 100 jars", "Industrial"],
  ["Traceability", "Named farm", "Rarely disclosed"],
];

export function PurityClient() {
  const { ref, progress: p } = useScrollProgress<HTMLDivElement>();
  const cross = mapRange(p, 0.1, 0.85, 0, NOTS.length);

  return (
    <><SiteHeader/><main> 
      <PageHero
        eyebrow="The Purity Standard"
        title={
          <>
            What we leave out
            <br />
            matters most.
          </>
        }
        sub="Fresava is defined by subtraction. Every ingredient must earn its place in the jar - most never do."
        image={IMG.texture}
      />

      {/* Scroll strike-through list */}
      <div ref={ref} className="relative h-[280vh] bg-white">
        <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 sm:px-8 lg:grid-cols-2">
            <div>
              <p className="eyebrow text-crimson/70">Never in a Fresava jar</p>
              <h2 className="headline mt-5 text-3xl text-ink sm:text-5xl">
                Keep scrolling.
                <br />
                Watch the list disappear.
              </h2>
              <p className="mt-6 max-w-sm text-[0.85rem] leading-relaxed text-ink/55">
                Ordinary fruit spreads are built from a long list of shortcuts. We removed every one
                of them and kept the fruit.
              </p>
            </div>
            <ul className="space-y-3 sm:space-y-4">
              {NOTS.map((n, i) => {
                const on = cross > i;
                return (
                  <li key={n}>
                    <span className="relative inline-block">
                      <span
                        className={
                          "headline text-2xl transition-colors duration-500 sm:text-4xl " +
                          (on ? "text-ink/25" : "text-ink")
                        }
                      >
                        {n}
                      </span>
                      <span
                        className="absolute top-1/2 left-0 h-[2px] w-full origin-left bg-crimson transition-transform duration-500"
                        style={{ transform: `scaleX(${on ? 1 : 0})` }}
                      />
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Four pillars */}
      <section className="bg-cream py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <Reveal>
            <h2 className="headline max-w-4xl text-4xl text-ink sm:text-6xl">
              Four promises printed on every lid.
            </h2>
          </Reveal>
          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {[
              {
                t: "Original fruit, always",
                d: "We buy whole dragon fruit never purée, never concentrate reconstituted in a factory. Fruit arrives, is washed, cut and cooked within 24 hours.",
              },
              {
                t: "No added sugar",
                d: "We do not add refined cane sugar or syrup. Pure black cumin honey gives the fruit a rounded sweetness while keeping the label simple.",
              },
              {
                t: "Made halal, made clean",
                d: "Every input, every surface, every hand in the process follows a documented halal and hygiene protocol.",
              },
              {
                t: "Nothing hidden",
                d: "Batch number, harvest week and farm name on each jar. Scan it, ask us, we will answer.",
              },
            ].map((c, i) => (
              <Reveal key={c.t} delay={i * 90}>
                <div className="h-full rounded-3xl bg-white p-10">
                  <span className="headline text-4xl text-crimson/25">0{i + 1}</span>
                  <h3 className="headline mt-5 text-2xl text-ink sm:text-3xl">{c.t}</h3>
                  <p className="mt-4 text-[0.88rem] leading-relaxed text-ink/60">{c.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6 sm:px-8">
          <Reveal>
            <p className="eyebrow text-crimson/70">Side by side</p>
            <h2 className="headline mt-5 text-4xl text-ink sm:text-5xl">
              Fresava vs. an ordinary jam.
            </h2>
            <div className="mt-12 overflow-hidden rounded-3xl border border-black/8">
              <div className="grid grid-cols-3 bg-crimson text-[0.7rem] tracking-[0.2em] text-cream uppercase">
                <div className="p-4">Measure</div>
                <div className="p-4">Fresava</div>
                <div className="p-4">Typical jam</div>
              </div>
              {COMPARE.map(([a, b, c], i) => (
                <div
                  key={a}
                  className={
                    "grid grid-cols-3 text-[0.85rem] " + (i % 2 ? "bg-cream/60" : "bg-white")
                  }
                >
                  <div className="p-4 text-ink/50">{a}</div>
                  <div className="p-4 font-medium text-crimson">{b}</div>
                  <div className="p-4 text-ink/50">{c}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </main><SiteFooter/></>
  );
}
