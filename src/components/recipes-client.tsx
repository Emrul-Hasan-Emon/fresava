"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

const FEELINGS = [
  {
    id: "quick",
    anchor: "morning-rush",
    label: "Quick",
    sub: "I need something easy.",
    path: "M27 4 11 27h11l-2 17 17-25H26l1-15Z",
  },
  {
    id: "sweet",
    anchor: "afternoon-faluda",
    label: "Sweet",
    sub: "I deserve a little treat.",
    path: "M24 40S8 30.5 8 18.5C8 12.7 12.2 9 17 9c3.2 0 5.7 1.6 7 4 1.3-2.4 3.8-4 7-4 4.8 0 9 3.7 9 9.5C40 30.5 24 40 24 40Z",
  },
  {
    id: "fresh",
    anchor: "easy-smoothie",
    label: "Fresh",
    sub: "I want something bright.",
    paths: [
      "M9 36c2-16 11-26 29-27-1 18-10 27-25 27",
      "M12 36c6-9 13-15 23-21",
    ],
  },
  {
    id: "slow",
    anchor: "slow-morning",
    label: "Slow",
    sub: "I have time to enjoy.",
    paths: [
      "M8 33h32",
      "M14 33a10 10 0 0 1 20 0",
      "M24 9v6M11 20l5 3M37 20l-5 3",
    ],
  },
  {
    id: "light",
    anchor: "little-in-between",
    label: "Light",
    sub: "Just a little something.",
    paths: ["M10 39c7-4 13-10 18-18", "M12 35C8 22 18 10 38 8c-1 17-10 27-26 27Z", "M17 28h8M21 22h8"],
  },
  {
    id: "share",
    anchor: "shared-table",
    label: "Share",
    sub: "Something for everyone.",
    circles: [
      { cx: 17, cy: 18, r: 6 },
      { cx: 31, cy: 18, r: 6 },
    ],
    path: "M6 39c0-7 4-11 11-11s11 4 11 11M20 39c0-7 4-11 11-11s11 4 11 11",
  },
] as const;

function scrollToAnchor(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function RecipesClient() {
  return (
    <div className="bg-[#fffdf8] text-[#17201d]">
      {/* HERO — FIND YOUR FRESAVA MOOD */}
      <section className="relative overflow-hidden bg-[#fffdf8] px-5 pb-20 pt-20 sm:px-8 sm:pb-24 sm:pt-24 lg:px-12 lg:pb-28 lg:pt-28">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="mx-auto max-w-[900px] text-center">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.34em] text-[#910b0a]">
              Recipes · Everyday FRESAVA
            </p>

            <h1 className="headline mt-7 text-[3.8rem] leading-[0.9] tracking-[-0.035em] text-[#17201d] sm:text-[5rem] lg:text-[6.2rem]">
              What are you
              <br />
              craving today?
            </h1>

            <p className="mx-auto mt-7 max-w-[620px] text-[0.98rem] leading-7 text-[#17201d]/58">
              Choose the feeling that fits your moment. We&apos;ll take you
              straight to a FRESAVA recipe made for it.
            </p>
          </div>

          <div className="mx-auto mb-16 mt-10 max-w-[1240px] sm:mb-20 sm:mt-12 lg:mb-24">
            <div className="text-center">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.34em] text-[#910b0a]">
                Follow your feeling
              </p>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:mt-8 lg:grid-cols-3">
              {FEELINGS.map((feeling) => (
                <button
                  key={feeling.id}
                  type="button"
                  onClick={() => scrollToAnchor(feeling.anchor)}
                  className="group relative min-h-[190px] overflow-hidden rounded-[22px] border border-[#910b0a]/10 bg-white/45 px-6 py-6 text-left transition-all duration-500 hover:-translate-y-1 hover:border-[#910b0a] hover:bg-[#910b0a] hover:shadow-[0_18px_45px_rgba(145,11,10,0.12)] focus:outline-none sm:px-7"
                >
                  <div className="flex h-full items-center gap-6">
                    <div className="flex h-[82px] w-[82px] shrink-0 items-center justify-center rounded-full bg-[#910b0a]/[0.035] text-[#910b0a] transition-all duration-500 group-hover:bg-white/10 group-hover:text-white">
                      <svg
                        viewBox="0 0 48 48"
                        fill="none"
                        aria-hidden="true"
                        className="h-11 w-11"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {"circles" in feeling &&
                          feeling.circles.map((c, i) => (
                            <circle key={i} cx={c.cx} cy={c.cy} r={c.r} />
                          ))}
                        {"path" in feeling && <path d={feeling.path} />}
                        {"paths" in feeling &&
                          feeling.paths.map((d, i) => <path key={i} d={d} />)}
                      </svg>
                    </div>

                    <div>
                      <h3 className="headline text-[2.35rem] leading-none text-[#17201d] transition-colors duration-500 group-hover:text-white">
                        {feeling.label}
                      </h3>
                      <p className="mt-4 max-w-[180px] text-[0.72rem] font-medium leading-5 tracking-[0.12em] text-[#17201d]/50 transition-colors duration-500 group-hover:text-white/75">
                        {feeling.sub}
                      </p>
                    </div>
                  </div>

                  <span className="absolute bottom-6 right-6 flex h-9 w-9 items-center justify-center rounded-full border border-[#910b0a]/25 text-lg text-[#910b0a] transition-all duration-500 group-hover:border-white/40 group-hover:text-white">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* INTRODUCTION */}
        <section
          id="recipe-stories"
          className="border-t border-[#17201d]/10 bg-white px-6 py-16 sm:px-8 sm:py-16 lg:px-12 lg:py-20"
        >
          <div className="mx-auto max-w-[1320px]">
            <div className="grid items-start gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
              <div className="lg:pt-3">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[#910b0a]">
                  Not just recipes
                </p>
                <div className="mt-6 h-px w-16 bg-[#910b0a]/35" />
              </div>

              <div>
                <h2 className="headline max-w-4xl text-[3.2rem] leading-[0.98] text-[#17201d] sm:text-[4rem] lg:text-[4.5rem]">
                  A jar that belongs
                  <br />
                  in more than one moment.
                </h2>
                <p className="mt-7 max-w-2xl text-[0.98rem] leading-7 text-[#17201d]/60">
                  FRESAVA isn&apos;t only something to spread on bread. Swirl
                  it, spoon it, blend it or serve it alongside the foods
                  already part of your day.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* STORY 01 — MORNING */}
        <section
          id="morning-rush"
          className="mx-auto grid w-full max-w-[1440px] border-t border-[#17201d]/10 lg:grid-cols-[46%_54%]"
        >
          <div className="relative h-[420px] overflow-hidden bg-[#eadbd5] sm:h-[500px] lg:h-[560px]">
            <img
              src="/images/dragon-fruit-spread-breakfast.png"
              alt="Breakfast toast with FRESAVA Dragon Fruit Spread and banana"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="flex items-center bg-[#fffdf8] px-8 py-14 sm:px-14 lg:px-20">
            <div className="max-w-xl">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#910b0a]">
                01 · The morning rush
              </p>
              <h2 className="headline mt-8 text-5xl leading-[0.98] sm:text-6xl">
                Five minutes.
                <br />
                Still worth enjoying.
              </h2>
              <p className="mt-8 max-w-lg text-[0.95rem] leading-7 text-[#17201d]/60">
                Some mornings don&apos;t leave time for much. Toast something
                good, add fresh banana and finish it with FRESAVA Dragon
                Fruit Spread. A simple breakfast becomes a little more
                colourful without making the morning complicated.
              </p>
              <Link
                href="/recipes/fresava-banana-toast"
                className="mt-9 inline-block border-b border-[#910b0a] pb-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#910b0a] transition-opacity hover:opacity-60"
              >
                Make the breakfast →
              </Link>
            </div>
          </div>
        </section>

        {/* STORY 02 — FALUDA */}
        <section
          id="afternoon-faluda"
          className="mx-auto mt-8 grid w-full max-w-[1440px] border-t border-[#17201d]/10 lg:mt-12 lg:grid-cols-[54%_46%]"
        >
          <div className="order-2 flex items-center bg-[#910b0a] px-8 py-20 text-[#fffdf8] sm:px-14 lg:order-1 lg:px-24">
            <div className="max-w-xl">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-white/60">
                02 · The afternoon pause
              </p>
              <h2 className="headline mt-8 text-5xl leading-[0.98] sm:text-6xl">
                A familiar favourite,
                <br />
                with a little FRESAVA.
              </h2>
              <p className="mt-8 max-w-lg text-[0.95rem] leading-7 text-white/70">
                Some afternoons call for something cold, creamy and
                familiar. Add FRESAVA Dragon Fruit Spread to your faluda for
                a bright fruit layer that brings a different character to
                every spoonful.
              </p>
              <Link
                href="/recipes/dragon-fruit-faluda"
                className="mt-9 inline-block border-b border-white/70 pb-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-60"
              >
                Make the faluda →
              </Link>
            </div>
          </div>

          <div className="relative order-1 min-h-[520px] overflow-hidden bg-[#eadbd5] lg:order-2 lg:min-h-full">
            <img
              src="/images/dragon-fruit-faluda.png"
              alt="Dragon fruit faluda made with FRESAVA Dragon Fruit Spread"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </section>

        {/* STORY 03 — EVENING SMOOTHIE */}
        <section
          id="easy-smoothie"
          className="mx-auto mt-8 grid w-full max-w-[1440px] border-t border-[#17201d]/10 lg:mt-12 lg:grid-cols-[46%_54%]"
        >
          <div className="relative min-h-[430px] overflow-hidden bg-[#eadbd5] lg:min-h-[560px]">
            <img
              src="/images/dragon-fruit-spread-smoothie.png"
              alt="Smoothie made with FRESAVA Dragon Fruit Spread"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          <div className="flex items-center bg-[#fffdf8] px-8 py-16 sm:px-14 lg:px-20 lg:py-20">
            <div className="max-w-xl">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#910b0a]">
                03 · THE EASY BLEND
              </p>
              <h2 className="headline mt-8 text-5xl leading-[0.98] text-[#17201d] sm:text-6xl">
                A little better,
                <br />
                blended into the day.
              </h2>
              <p className="mt-8 max-w-lg text-[0.95rem] leading-7 text-[#17201d]/60">
                Some days call for something quick, fresh and easy. Blend
                banana, milk or yogurt with a spoonful of FRESAVA Dragon
                Fruit Spread for a smooth, fruit-forward drink made in
                minutes.
              </p>
              <Link
                href="/recipes/dragon-fruit-smoothie"
                className="mt-8 inline-block border-b border-[#910b0a] pb-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#910b0a] transition-opacity hover:opacity-60"
              >
                Make the smoothie →
              </Link>
            </div>
          </div>
        </section>

        {/* STORY 04 — THE LITTLE IN-BETWEEN */}
        <section
          id="little-in-between"
          className="mx-auto mt-8 grid w-full max-w-[1440px] border-t border-[#17201d]/10 lg:mt-12 lg:grid-cols-[54%_46%]"
        >
          <div className="flex min-h-[560px] items-center bg-[#910b0a] px-8 py-16 text-[#fffdf8] sm:px-14 lg:px-16">
            <div className="max-w-xl">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-white/65">
                04 · The little in-between
              </p>
              <h2 className="headline mt-8 text-5xl leading-[0.98] sm:text-6xl">
                Something small.
                <br />
                Made worth stopping for.
              </h2>
              <p className="mt-8 max-w-lg text-[0.95rem] leading-7 text-white/70">
                Not every moment needs a full meal. Spoon some yogurt into a
                bowl, add a little granola, then finish it with FRESAVA
                Dragon Fruit Spread for a simple, fruit-forward bite between
                the bigger parts of your day.
              </p>
              <Link
                href="/recipes/yogurt-granola-bowl"
                className="mt-9 inline-block border-b border-white/70 pb-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-60"
              >
                Make the bowl →
              </Link>
            </div>
          </div>

          <div className="relative min-h-[500px] overflow-hidden bg-[#eadbd5] lg:min-h-[560px]">
            <img
              src="/images/dragon-fruit-spread-granola-bowl.png"
              alt="Yogurt and granola bowl finished with FRESAVA Dragon Fruit Spread"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </section>

        {/* STORY 05 — THE SLOW MORNING */}
        <section
          id="slow-morning"
          className="mx-auto mt-8 grid w-full max-w-[1440px] border-t border-[#17201d]/10 lg:mt-12 lg:grid-cols-[46%_54%]"
        >
          <div className="relative min-h-[500px] overflow-hidden bg-[#eadbd5] lg:min-h-[560px]">
            <img
              src="/images/dragon-fruit-spread-pancakes.png"
              alt="Warm pancakes topped with FRESAVA Dragon Fruit Spread"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          <div className="flex min-h-[560px] items-center bg-[#fffdf8] px-8 py-16 sm:px-14 lg:px-20">
            <div className="max-w-xl">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#910b0a]">
                05 · The slow morning
              </p>
              <h2 className="headline mt-8 text-5xl leading-[0.98] text-[#17201d] sm:text-6xl">
                Some mornings
                <br />
                deserve a little longer.
              </h2>
              <p className="mt-8 max-w-lg text-[0.95rem] leading-7 text-[#17201d]/60">
                When there is nowhere to rush, make breakfast worth sitting
                down for. Stack warm pancakes, add banana, then spoon over
                FRESAVA Dragon Fruit Spread for a bright, fruit-forward
                finish made for slower mornings.
              </p>
              <Link
                href="/recipes/dragon-fruit-pancakes"
                className="mt-8 inline-block border-b border-[#910b0a] pb-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#910b0a] transition-opacity hover:opacity-60"
              >
                Make the pancakes →
              </Link>
            </div>
          </div>
        </section>

        {/* STORY 06 — SHARED TABLE */}
        <section
          id="shared-table"
          className="mx-auto mt-8 mb-20 grid w-full max-w-[1440px] border-t border-[#17201d]/10 lg:mt-12 lg:mb-24 lg:grid-cols-[54%_46%]"
        >
          <div className="flex items-center bg-[#910b0a] px-8 py-16 text-[#fffdf8] sm:px-14 lg:px-16 lg:py-20">
            <div className="max-w-xl">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-white/65">
                06 · The shared table
              </p>
              <h2 className="headline mt-8 text-5xl leading-[0.98] sm:text-6xl">
                Creamy, fruity,
                <br />
                made for sharing.
              </h2>
              <p className="mt-8 max-w-lg text-[0.95rem] leading-7 text-white/70">
                Crisp crostini layered with cream cheese and FRESAVA Dragon
                Fruit Spread, finished with fresh fruit and nuts. An easy
                sharing plate made for passing around the table.
              </p>
              <Link
                href="/recipes/dragon-fruit-crostini"
                className="mt-8 inline-block border-b border-white/70 pb-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-65"
              >
                Make the crostini →
              </Link>
            </div>
          </div>

          <div className="relative min-h-[430px] overflow-hidden bg-[#eadbd5] lg:min-h-[540px]">
            <img
              src="/images/dragon-fruit-crostini.png"
              alt="Cream cheese crostini topped with FRESAVA Dragon Fruit Spread, fresh fruit and nuts"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </section>
      </section>
    </div>
  );
}
