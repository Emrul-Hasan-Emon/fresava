"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ShopStrip } from "@/components/shop-strip";
import { USPSection } from "@/components/usp-section";
import { Reveal } from "@/components/reveal";
import { mapRange, useScrollProgress } from "@/lib/hooks";

const STATEMENTS: { line: string; sub: string; start: number; end: number }[] = [
  {
    line: "It begins with one fruit.",
    sub: "Red-fleshed dragon fruit, grown organically and picked at full ripeness.",
    start: 0.06,
    end: 0.27,
  },
  {
    line: "No added sugar.",
    sub: "There is no added cane sugar. A little pure honey rounds out the fruit without covering it.",
    start: 0.29,
    end: 0.49,
  },
  {
    line: "No preservatives.",
    sub: "No artificial colours. No artificial flavours. Nothing that needs a warning label.",
    start: 0.51,
    end: 0.7,
  },
];

function scrollToStory() {
  const el = document.getElementById("story-stage");
  if (el) window.scrollTo({ top: el.offsetTop + 12, behavior: "smooth" });
}

export function HomeClient() {
  const { ref, progress: p } = useScrollProgress<HTMLDivElement>();

  const jarScale = mapRange(p, 0, 0.7, 0.9, 1.18);
  const jarY = mapRange(p, 0, 0.7, 30, -70);
  const jarOpacity = 1 - mapRange(p, 0.7, 0.8, 0, 1);
  const blush = mapRange(p, 0, 0.62, 0, 1);
  const finale = mapRange(p, 0.74, 0.86, 0, 1);
  const fruitL = mapRange(p, 0.02, 0.45, 0, 1);
  const fruitR = mapRange(p, 0.1, 0.55, 0, 1);

  return (
    <>
      <SiteHeader />
      <main>
        {/* ---------------- HERO ---------------- */}
        <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-cream px-6 pt-24 pb-16 text-center">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 55% at 50% 28%, rgba(214,33,110,0.13), transparent 70%)",
            }}
          />
          <p className="eyebrow relative z-10 text-crimson/70">Fresava Signature &middot; 240g</p>
          <h1 className="headline relative z-10 mt-5 max-w-4xl text-[3.1rem] text-ink sm:text-7xl lg:text-[5.6rem]">
            Dragon Fruit,
            <br />
            told honestly.
          </h1>
          <p className="relative z-10 mt-6 max-w-lg text-[0.95rem] leading-relaxed text-ink/60">
            One jar. Organic dragon fruit, pure honey and nothing artificial behind the label.
          </p>

          <button
            onClick={scrollToStory}
            className="group relative z-10 mt-10 cursor-pointer"
            aria-label="See what's inside the jar"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/jar-hero.png"
              alt="Fresava Dragon Fruit Spread jar"
              className="floaty blend-multiply h-[42vh] w-auto object-contain transition-transform duration-700 group-hover:scale-[1.04] sm:h-[50vh]"
            />
          </button>

          <div className="relative z-10 mt-6 flex flex-col items-center gap-4">
            <button
              onClick={scrollToStory}
              className="rounded-full border border-crimson/25 px-6 py-2 text-[0.75rem] tracking-wide text-crimson transition-colors hover:bg-crimson hover:text-cream"
            >
              Look inside the jar
            </button>
            <div className="scroll-hint h-6 text-ink/35">
              <span className="block text-xs tracking-[0.3em]">&darr;</span>
            </div>
          </div>
        </section>

        {/* ---------------- PINNED SCROLL STORY ---------------- */}
        <div id="story-stage" ref={ref} className="relative h-[600vh]">
          <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-white" />
            <div
              className="absolute inset-0"
              style={{
                opacity: blush,
                background:
                  "radial-gradient(75% 65% at 50% 45%, #fce4ef 0%, #f9edf2 45%, #f6f1ea 100%)",
              }}
            />

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/dragonfruit-cut.png"
              alt=""
              className="blend-multiply pointer-events-none absolute left-[-6%] w-[38vw] max-w-[420px] sm:left-[2%] sm:w-[26vw]"
              style={{
                opacity: fruitL * (1 - finale),
                transform: `translate3d(0, ${mapRange(fruitL, 0, 1, 90, -20)}px, 0) rotate(${mapRange(fruitL, 0, 1, -22, -6)}deg) scale(${mapRange(fruitL, 0, 1, 0.8, 1)})`,
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/texture.jpg"
              alt=""
              className="pointer-events-none absolute right-[-8%] w-[34vw] max-w-[380px] rounded-full sm:right-[3%] sm:w-[22vw]"
              style={{
                opacity: fruitR * 0.9 * (1 - finale),
                transform: `translate3d(0, ${mapRange(fruitR, 0, 1, -80, 30)}px, 0) rotate(${mapRange(fruitR, 0, 1, 14, 3)}deg)`,
              }}
            />

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/jar-hero.png"
              alt="Fresava Dragon Fruit Spread"
              className="blend-multiply absolute h-[42vh] w-auto object-contain sm:h-[54vh]"
              style={{
                opacity: jarOpacity,
                transform: `translate3d(0, ${jarY}px, 0) scale(${jarScale})`,
              }}
            />

            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[46vh]"
              style={{
                opacity: 1 - finale,
                background:
                  "linear-gradient(to top, rgba(255,255,255,0.96) 18%, rgba(255,255,255,0.75) 45%, rgba(255,255,255,0) 100%)",
              }}
            />

            {STATEMENTS.map((s) => {
              const fadeIn = mapRange(p, s.start, s.start + 0.05, 0, 1);
              const fadeOut = 1 - mapRange(p, s.end - 0.04, s.end, 0, 1);
              const o = Math.min(fadeIn, fadeOut);
              return (
                <div
                  key={s.line}
                  className="pointer-events-none absolute inset-x-0 bottom-[9vh] px-6 text-center sm:bottom-[12vh]"
                  style={{
                    opacity: o,
                    transform: `translate3d(0, ${(1 - o) * 26}px, 0)`,
                  }}
                >
                  <h2 className="headline mx-auto max-w-3xl text-[2.1rem] text-crimson sm:text-6xl">
                    {s.line}
                  </h2>
                  <p className="mx-auto mt-4 max-w-md text-[0.85rem] leading-relaxed text-ink/60 sm:text-[0.95rem]">
                    {s.sub}
                  </p>
                </div>
              );
            })}

            <div className="absolute inset-0" style={{ opacity: finale }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/jar-dark.jpg" alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-crimson-dark/45" />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                <p className="eyebrow text-cream/60">The whole recipe</p>
                <h2 className="headline mt-5 max-w-3xl text-[2.6rem] text-cream sm:text-7xl">
                  Just fruit.
                  <br />
                  That is all.
                </h2>
                <Link
                  href="/purity"
                  className="mt-9 rounded-full bg-cream px-7 py-2.5 text-[0.78rem] font-medium tracking-wide text-crimson transition-transform hover:scale-105"
                >
                  Read the purity standard
                </Link>
              </div>
            </div>

            <div className="absolute right-5 bottom-8 hidden h-28 w-px bg-black/10 sm:block">
              <div className="w-px bg-crimson transition-none" style={{ height: `${p * 100}%` }} />
            </div>
          </div>
        </div>

        {/* ---------------- FACTS ---------------- */}
        <section className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <Reveal>
              <p className="eyebrow text-crimson/70">Inside every jar</p>
              <h2 className="headline mt-5 max-w-3xl text-4xl text-ink sm:text-6xl">
                Four numbers we are proud of.
              </h2>
            </Reveal>
            <div className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-black/8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { n: "68%", l: "Real dragon fruit", d: "Fruit-first formulation, never watered down." },
                { n: "0g", l: "Added sugar", d: "No refined cane sugar, glucose syrup or hidden sweeteners." },
                { n: "0", l: "Preservatives", d: "Heat-sealed freshness instead of chemistry." },
                { n: "100%", l: "Halal & natural", d: "Clean process, audited every single batch." },
              ].map((f, i) => (
                <Reveal key={f.l} delay={i * 90}>
                  <div className="h-full bg-white p-8">
                    <p className="headline text-5xl text-crimson">{f.n}</p>
                    <p className="mt-4 text-sm font-medium text-ink">{f.l}</p>
                    <p className="mt-2 text-[0.82rem] leading-relaxed text-ink/55">{f.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <ShopStrip />
        <USPSection />

        {/* ---------------- TILES ---------------- */}
        <section className="bg-cream py-20 sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-5 px-6 sm:px-8 lg:grid-cols-2">
            <Reveal className="lg:col-span-2">
              <Link
                href="/spread"
                className="group relative block overflow-hidden rounded-[28px] bg-white"
              >
                <div className="grid items-center gap-8 p-10 sm:p-14 lg:grid-cols-2">
                  <div>
                    <p className="eyebrow text-crimson/70">The Signature</p>
                    <h3 className="headline mt-4 text-4xl text-ink sm:text-5xl">
                      Fresava Dragon Fruit Spread
                    </h3>
                    <p className="mt-5 max-w-md text-[0.92rem] leading-relaxed text-ink/60">
                      Slow-cooked in small batches, set with fruit pectin, and sealed the same day
                      it is picked. Explore the jar in detail.
                    </p>
                    <span className="mt-7 inline-flex items-center gap-2 text-sm text-crimson">
                      Explore the jar
                      <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                    </span>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/jar-hero.png"
                    alt=""
                    className="blend-multiply mx-auto h-64 w-auto object-contain transition-transform duration-700 group-hover:scale-105 sm:h-80"
                  />
                </div>
              </Link>
            </Reveal>

            {[
              {
                to: "/origin",
                img: "/images/farm.jpg",
                eyebrow: "Origin",
                title: "From hill farms to your table",
                body: "Locally sourced, traceable fruit from organic growers in Bangladesh.",
              },
              {
                to: "/story",
                img: "/images/toast.jpg",
                eyebrow: "Story",
                title: "Why Fresava exists",
                body: "A brand built for parents who read the label twice.",
              },
            ].map((t, i) => (
              <Reveal key={t.to} delay={i * 120}>
                <Link
                  href={t.to}
                  className="group relative block h-[420px] overflow-hidden rounded-[28px]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.img}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-9 text-cream">
                    <p className="eyebrow text-cream/60">{t.eyebrow}</p>
                    <h3 className="headline mt-3 text-3xl sm:text-4xl">{t.title}</h3>
                    <p className="mt-3 max-w-sm text-[0.85rem] text-cream/75">{t.body}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
