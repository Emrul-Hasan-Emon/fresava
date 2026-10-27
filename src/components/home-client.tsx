"use client";
/* eslint-disable @next/next/no-img-element */
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import Link from "next/link";
import { IMG } from "@/lib/assets";
import { useScrollProgress } from "@/lib/hooks";
import { Reveal } from "@/components/reveal";
import { ShopStrip } from "@/components/shop-strip";
import { USPSection } from "@/components/usp-section";

function ease(start: number, end: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

const STATEMENTS = [
  {
    line: "It starts with fruit.",
    sub: "Ripe red dragon fruit, carefully selected for every jar.",
    start: 0.05,
    end: 0.24,
  },
  {
    line: "Sweetened by nature.",
    sub: "Pure black cumin honey brings gentle sweetness to every spoonful.",
    start: 0.27,
    end: 0.46,
  },
  {
    line: "Nothing unnecessary.",
    sub: "No artificial colours, flavours, or added preservatives.",
    start: 0.49,
    end: 0.68,
  },
  {
    line: "Fruit, thoughtfully made.",
    sub: "Carefully prepared, from fresh fruit to the finished jar.",
    start: 0.69,
    end: 0.92,
  },
];

function scrollToStory() {
  const el = document.getElementById("story-stage");
  if (el) window.scrollTo({ top: el.offsetTop + 12, behavior: "smooth" });
}

export function HomeClient() {
  const { ref, progress: p } = useScrollProgress<HTMLDivElement>();

  const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
  const smoothstep = (from: number, to: number, value: number) => {
    const t = clamp01((value - from) / (to - from));
    return t * t * (3 - 2 * t);
  };
  const backgroundOpacity = smoothstep(0, 0.16, p);
  const finaleOpacity = smoothstep(0.84, 0.94, p);

  return (
    <>
      <SiteHeader />
      <main>
        {/* ---------------- CINEMATIC HERO ---------------- */}
        <section className="relative min-h-[100svh] overflow-hidden bg-[#160706]">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src="/images/fresava-hero.mp4" type="video/mp4" />
          </video>

          <div className="pointer-events-none absolute inset-0 bg-black/25" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#260504]/20 via-transparent to-[#160706]/65" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(20,4,3,0.35)_100%)]" />

          <div className="relative z-10 flex min-h-[100svh] translate-y-20 flex-col items-center justify-center px-6 pt-24 pb-12 text-center">
            <p className="eyebrow relative -translate-y-4 text-white/75 sm:translate-y-0">
              FRESAVA &middot; FROM THE FARM
            </p>

            <h1 className="headline relative -translate-y-4 mt-5 max-w-none text-[3.1rem] text-white sm:translate-y-0 sm:text-7xl lg:whitespace-nowrap lg:text-[5.6rem]">
              <span className="block sm:inline">Where every</span>
              <span className="block sm:inline"> jar begins.</span>
            </h1>

            <p className="relative mt-6 max-w-xl translate-y-4 text-[0.95rem] leading-relaxed text-white/80 sm:translate-y-0">
              Dragon fruit sourced from carefully selected organic farms,
              picked with care and made into something naturally better.
            </p>

            <div className="mt-9 flex flex-col items-center gap-4">
              <button
                onClick={scrollToStory}
                className="rounded-full border border-white/45 bg-white/10 px-7 py-3 text-[0.75rem] tracking-wide text-white backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-[#910b0a]"
              >
                Look inside the jar
              </button>
              <button
                onClick={scrollToStory}
                aria-label="Scroll to product story"
                className="mt-2 text-white/60 transition hover:text-white"
              >
                <span className="block text-xs tracking-[0.3em]">↓</span>
              </button>
            </div>
          </div>
        </section>

        {/* ---------------- PINNED SCROLL STORY ---------------- */}
        <div id="story-stage" ref={ref} className="relative h-[430svh] sm:h-[500svh]">
          <section
            className="sticky top-0 isolate h-[100svh] w-full overflow-hidden bg-[#f7e9d9]"
            aria-label="Fresava dragon fruit spread story"
          >
            <div className="absolute inset-0 bg-[#f7e9d9]" />

            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-[66%] overflow-hidden sm:inset-0 sm:h-full"
              aria-hidden="true"
              style={{ opacity: backgroundOpacity }}
            >
              <img
                src="/images/fresava-motion/nature-scene.png"
                alt=""
                draggable={false}
                className="h-full w-full object-cover object-[40%_center] sm:object-center"
                style={{
                  transform: `scale(${1 + Math.min(p / 0.8, 1) * 0.3})`,
                  transformOrigin: "center center",
                  willChange: "transform",
                }}
              />
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[44%] bg-gradient-to-t from-[#f8e8d7] via-[#f8e8d7] to-transparent sm:hidden" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-[51%] bg-gradient-to-r from-transparent via-[#f8e8d7]/50 to-[#f8e8d7]/70 sm:block" />

            {STATEMENTS.map((statement) => {
              const fadeIn = ease(statement.start, statement.start + 0.035, p);
              const fadeOut = 1 - ease(statement.end - 0.035, statement.end, p);
              const opacity = Math.max(0, Math.min(fadeIn, fadeOut));
              return (
                <div
                  key={statement.line}
                  className="pointer-events-none absolute inset-x-5 bottom-[8%] z-20 mx-auto flex min-h-[205px] max-w-[420px] flex-col items-center justify-center text-center sm:inset-x-auto sm:bottom-auto sm:right-[4%] sm:top-1/2 sm:min-h-0 sm:w-[35%] sm:max-w-[580px] sm:-translate-y-1/2 sm:items-start sm:text-left lg:right-[5%] lg:w-[30%]"
                  style={{ opacity }}
                >
                  <p className="mb-4 text-[0.58rem] font-semibold uppercase tracking-[0.25em] text-[#910b0a] sm:mb-6 sm:text-[0.68rem]">
                    IT BEGINS WITH ONE FRUIT
                  </p>
                  <h2 className="headline mx-auto max-w-[380px] text-[clamp(1.85rem,7.8vw,2.25rem)] leading-[1.12] tracking-[-0.035em] text-[#3c2018] sm:mx-0 sm:max-w-none sm:text-[clamp(2.6rem,3.8vw,4.5rem)] sm:leading-[1.1]">
                    {statement.line}
                  </h2>
                  <p className="mx-auto mt-5 max-w-[320px] text-[0.85rem] leading-[1.65] text-[#422b25] sm:mx-0 sm:mt-6 sm:max-w-[380px] sm:text-[1.1rem] sm:leading-[1.65]">
                    {statement.sub}
                  </p>
                </div>
              );
            })}

            {/* Purity finale */}
            <div
              className="absolute inset-0 z-40 overflow-hidden bg-[#240a10] text-center"
              style={{ opacity: finaleOpacity, pointerEvents: finaleOpacity > 0.98 ? "auto" : "none" }}
              aria-hidden={finaleOpacity < 0.98}
            >
              <img
                src="/images/fresava-motion/purity-scene.png"
                alt=""
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover object-[53%_center] sm:object-center"
                style={{ transform: "scale(0.9)" }}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#24050b]/65 via-transparent to-[#24050b]/70" />

              <div className="pointer-events-none absolute inset-0 z-10">
                <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 flex-col items-center sm:hidden">
                  <p className="eyebrow text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-cream">
                    The whole recipe
                  </p>
                  <h2 className="headline mt-4 text-[clamp(2.3rem,9vw,3.2rem)] leading-[1.08] text-cream [text-shadow:0_2px_10px_rgba(30,0,5,0.6)]">
                    Just fruit.
                    <span className="block italic">That is all.</span>
                  </h2>
                </div>

                <div className="hidden sm:block">
                  <p className="eyebrow absolute inset-x-0 top-[35%] px-4 text-[0.8rem] font-semibold uppercase tracking-[0.34em] text-cream">
                    The whole recipe
                  </p>
                  <h2 className="headline absolute inset-x-0 top-[43%] px-5 text-[clamp(3rem,5vw,5.5rem)] leading-[1.1] text-cream [text-shadow:0_2px_10px_rgba(30,0,5,0.6)]">
                    Just fruit. That is all.
                  </h2>
                </div>

                <div className="pointer-events-auto absolute inset-x-0 bottom-[9%] flex justify-center px-4 sm:bottom-[12%]">
                  <Link
                    href="/purity"
                    className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-cream px-7 py-3 text-[0.82rem] font-semibold tracking-wide text-crimson shadow-[0_8px_24px_rgba(30,0,5,0.18)] transition-transform hover:scale-105 sm:px-9 sm:py-4 sm:text-base"
                  >
                    Read the purity standard
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ---------------- FRESAVA STANDARD ---------------- */}
        <section className="relative bg-[#faf7f2] pt-12 pb-6 sm:pt-20 sm:pb-8">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <p className="eyebrow text-crimson/75">THE FRESAVA STANDARD</p>
                <h2 className="headline mt-4 text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.08] text-ink">
                  Goodness in every jar.
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-ink/60 sm:text-base">
                  Thoughtfully selected ingredients. Nothing unnecessary.
                </p>
              </div>
            </Reveal>

            <div className="mt-9 grid grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-4 sm:gap-4">
              {[
                { n: "78%", l: "Dragon fruit", d: "A fruit-forward recipe." },
                { n: "100%", l: "Black cumin honey", d: "Our natural sweetener." },
                { n: "0 g", l: "Refined sugar", d: "No refined sugar added." },
                { n: "0", l: "Added preservatives", d: "Made without added preservatives." },
              ].map((f, i) => (
                <Reveal key={f.l} delay={i * 90} className="h-full">
                  <div className="flex h-full min-h-[165px] flex-col rounded-2xl border border-[#e9dfd6] bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(60,32,24,0.06)] sm:min-h-[205px] sm:p-7">
                    <p className="headline text-[clamp(2.4rem,4vw,4rem)] leading-none text-crimson">{f.n}</p>
                    <p className="mt-5 text-[0.82rem] font-semibold leading-snug text-ink sm:text-base">{f.l}</p>
                    <p className="mt-2 text-[0.73rem] leading-relaxed text-ink/55 sm:text-sm">{f.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={200}>
              <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-2xl border border-[#e8dbce] bg-[#f1e7db] px-5 py-5 text-center sm:mt-5 sm:py-6">
                <p className="text-sm font-semibold tracking-wide text-crimson sm:text-base">
                  Halal-conscious preparation
                </p>
                <p className="max-w-xl text-xs leading-relaxed text-ink/65 sm:text-sm">
                  Carefully selected ingredients, thoughtful preparation, and a commitment to
                  transparency.
                </p>
              </div>
            </Reveal>
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
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                  <img
                    src={IMG.jarHero}
                    alt=""
                    className="blend-multiply mx-auto h-64 w-auto object-contain transition-transform duration-700 group-hover:scale-105 sm:h-80"
                  />
                </div>
              </Link>
            </Reveal>

            {[
              {
                to: "/origin",
                img: IMG.farm,
                eyebrow: "Origin",
                title: "From hill farms to your table",
                body: "Locally sourced, traceable fruit from organic growers in Bangladesh.",
              },
              {
                to: "/story",
                img: IMG.toast,
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
