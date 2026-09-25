/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
export const metadata: Metadata = {
  title: "Origin — Fresava",
  description:
    "Twelve hours from field to lid: how Fresava sources dragon fruit from named growers in Bangladesh and makes a batch in a single day.",
};
import { IMG } from "@/lib/assets";
import { Reveal } from "@/components/reveal";
import { PageHero } from "@/components/page-hero";

const JOURNEY = [
  {
    h: "05:40",
    t: "Harvest",
    d: "Fruit is cut by hand at first light, when the flesh is coolest and the sugars are at their peak.",
  },
  {
    h: "09:15",
    t: "Sorting",
    d: "Every fruit is graded. Anything bruised, under-ripe or over-ripe leaves the line.",
  },
  {
    h: "11:00",
    t: "Wash & cut",
    d: "Triple-washed in filtered water, hand-scooped, seeds kept whole.",
  },
  {
    h: "13:30",
    t: "Slow kettle",
    d: "Cooked low with pure black cumin honey, fruit pectin and citric acid, stirred by hand, never boiled hard.",
  },
  {
    h: "16:20",
    t: "Fill & seal",
    d: "Hot-filled into sterilised glass, vacuum sealed, batch stamped.",
  },
  {
    h: "18:00",
    t: "Rest",
    d: "Jars cool overnight and set naturally before the batch is released.",
  },
];

export default function Origin() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Origin"
          title={
            <>
              Twelve hours
              <br />
              from field to lid.
            </>
          }
          sub="Our dragon fruit is grown on organic smallholdings in Bangladesh. We buy the whole harvest, at a fair price, from farmers we can name."
          image={IMG.farm}
          dark
        />

        <section className="bg-white py-24 sm:py-32">
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 sm:px-8 lg:grid-cols-2">
            <Reveal>
              <div className="overflow-hidden rounded-[28px]">
                <img
                  src={IMG.farm}
                  alt="Dragon fruit farm"
                  className="h-[60vh] w-full object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <p className="eyebrow text-crimson/70">The growers</p>
              <h2 className="headline mt-7 text-7xl text-ink sm:text-5xl">
                Locally sourced is not a slogan. It is a supply chain.
              </h2>
              <p className="mt-7 text-[0.92rem] leading-relaxed text-ink/60">
                Dragon fruit thrives in Bangladesh&apos;s warm, fertile soil, yet
                most of it is sold raw and undervalued. We partner directly with
                organic growers in Madhupur, and the Tangail hill tracts paying
                above market rate for fruit that meets our grade, and committing
                to the full season rather than one convenient week.
              </p>
              <div className="mt-10 grid grid-cols-3 gap-6 border-t border-black/8 pt-8">
                {[
                  ["3", "Grower families"],
                  ["0", "Chemical sprays"],
                  ["24h", "Field to kettle"],
                ].map(([n, l]) => (
                  <div key={l}>
                    <p className="headline text-3xl text-crimson sm:text-4xl">
                      {n}
                    </p>
                    <p className="mt-2 text-[0.75rem] tracking-wide text-ink/50">
                      {l}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Journey timeline */}
        <section className="bg-cream py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <Reveal>
              <p className="eyebrow text-crimson/70">One day in a batch</p>
              <h2 className="headline mt-5 max-w-3xl text-4xl text-ink sm:text-6xl">
                The jar is made in a single day.
              </h2>
            </Reveal>
            <div className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-black/8 sm:grid-cols-2 lg:grid-cols-3">
              {JOURNEY.map((j, i) => (
                <Reveal key={j.t} delay={i * 70}>
                  <div className="h-full bg-cream p-9">
                    <p className="text-[0.72rem] tracking-[0.25em] text-crimson">
                      {j.h}
                    </p>
                    <h3 className="headline mt-4 text-2xl text-ink">{j.t}</h3>
                    <p className="mt-3 text-[0.85rem] leading-relaxed text-ink/55">
                      {j.d}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Sustainability */}
        <section className="relative overflow-hidden bg-crimson-dark py-28 text-cream">
          <img
            src={IMG.texture}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-20"
          />
          <div className="relative mx-auto max-w-5xl px-6 text-center sm:px-8">
            <Reveal>
              <p className="eyebrow text-cream/55">Sustainability</p>
              <h2 className="headline mt-6 text-4xl sm:text-6xl">
                Glass, not plastic. Season, not shortcut.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-[1rem] leading-relaxed text-cream/80">
                Our jars are fully recyclable and made to live a second life in
                your home. And because we only produce when the fruit is in
                season, a short harvest means fewer jars on the shelf never a
                compromise on the recipe.
              </p>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
