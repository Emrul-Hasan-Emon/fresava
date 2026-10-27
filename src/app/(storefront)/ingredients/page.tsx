/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";
import { PurityScrollMobile } from "@/components/purity-scroll-mobile";

export const metadata: Metadata = {
  title: "Our Ingredients — Fresava",
  description:
    "Fruit at the centre, thoughtfully paired with black cumin honey — nothing unnecessary.",
};

const INGREDIENT_LIST = [
  {
    number: "01",
    name: "Red Dragon Fruit",
    role: "THE FRUIT",
    note: "The fruit",
    description:
      "Carefully selected red-fleshed dragon fruit, bringing natural colour and flavour.",
    icon: "fruit",
  },
  {
    number: "02",
    name: "Pure Black Cumin Honey",
    role: "THE SWEETNESS",
    note: "The sweetness",
    description: "Pure black cumin honey adds a gentle, natural sweetness.",
    icon: "honey",
  },
  {
    number: "03",
    name: "Food-Grade Citric Acid",
    role: "THE BALANCE",
    note: "The balance",
    description: "Carefully measured to balance the fruit's acidity.",
    icon: "acid",
  },
  {
    number: "04",
    name: "Natural Fruit Pectin",
    role: "THE TEXTURE",
    note: "The texture",
    description: "Helps create the smooth, spreadable consistency.",
    icon: "pectin",
  },
] as const;

const JOURNEY = [
  {
    number: "01",
    title: "Fruit",
    text: "Carefully selected dragon fruit begins the process.",
  },
  {
    number: "02",
    title: "Preparation",
    text: "The fruit is prepared for a consistent batch.",
  },
  {
    number: "03",
    title: "Cooking",
    text: "Gently concentrated to develop the spread.",
  },
  {
    number: "04",
    title: "Honey",
    text: "Black cumin honey is incorporated into the recipe.",
  },
  {
    number: "05",
    title: "Jar",
    text: "Finished, checked and filled into every FRESAVA jar.",
  },
] as const;

function IngredientIcon({ icon }: { icon: (typeof INGREDIENT_LIST)[number]["icon"] }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="#ffffff"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[58px] w-[58px] sm:h-[95px] sm:w-[95px]"
      aria-hidden="true"
    >
      {icon === "fruit" && (
        <>
          <path d="M49 20 C35 20 24 33 23 50 C22 68 33 81 49 83 C66 85 79 70 78 52 C77 34 64 20 49 20 Z" />
          <path d="M34 25 L25 12 L41 20" />
          <path d="M52 20 L57 7 L63 24" />
          <path d="M70 30 L86 21 L77 43" />
          <path d="M77 56 L90 65 L73 68" />
          <path d="M60 79 L57 93 L47 82" />
          <path d="M28 67 L13 72 L24 53" />
          <ellipse cx="49" cy="52" rx="20" ry="26" />
          {[
            [42, 37],
            [52, 35],
            [60, 43],
            [37, 48],
            [48, 47],
            [58, 53],
            [40, 59],
            [51, 60],
            [58, 68],
            [46, 72],
          ].map(([x, y], index) => (
            <ellipse key={index} cx={x} cy={y} rx="1" ry="2" fill="#ffffff" stroke="none" />
          ))}
        </>
      )}
      {icon === "honey" && (
        <>
          <path d="M29 44 Q50 37 71 44 L68 78 Q50 87 32 78 Z" />
          <ellipse cx="50" cy="44" rx="21" ry="7" />
          <path d="M36 55 Q50 61 64 55 M38 68 Q50 74 62 68" />
          <path d="M55 38 L76 14" />
          <path d="M69 17 Q79 13 84 22 L72 35 Q64 32 65 25 Z" />
          <path d="M69 21 L78 28 M65 26 L73 33" />
          <path d="M49 45 V53" />
          <path d="M46 53 Q49 60 52 53 Q52 49 49 47" />
        </>
      )}
      {icon === "acid" && (
        <>
          <circle cx="50" cy="50" r="32" />
          <circle cx="50" cy="50" r="25" />
          <circle cx="50" cy="50" r="4" />
          <path d="M50 46 V25" />
          <path d="M53 47 L68 32" />
          <path d="M54 50 H75" />
          <path d="M53 53 L68 68" />
          <path d="M50 54 V75" />
          <path d="M47 53 L32 68" />
          <path d="M46 50 H25" />
          <path d="M47 47 L32 32" />
        </>
      )}
      {icon === "pectin" && (
        <>
          <path d="M20 65 Q50 79 80 65 L72 83 Q50 93 28 83 Z" />
          <path d="M20 65 Q50 53 80 65" />
          <path d="M27 63 Q50 35 73 63" />
          <path d="M39 55 l1 2 M48 49 l1 2 M57 55 l1 2 M46 60 l1 2 M61 62 l1 2" />
          <path d="M65 45 Q62 26 78 18 Q86 35 69 48" />
          <path d="M69 43 L78 27" />
          <path d="M74 59 Q85 47 94 54 Q90 66 76 65" />
          <path d="M78 61 L89 56" />
        </>
      )}
    </svg>
  );
}

export default function Ingredients() {
  return (
    <>
      <SiteHeader />
      <main className="overflow-hidden bg-[#fffdf8] text-[#17201d]">
        {/* HERO */}
        <section className="flex items-center justify-center px-6 pb-14 pt-24 text-center sm:min-h-[72vh] sm:pb-20 sm:pt-32">
          <div className="mx-auto w-full max-w-5xl">
            <p className="mb-4 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[#910b0a] sm:mb-6 sm:text-[0.7rem] sm:tracking-[0.24em]">
              Our Ingredients
            </p>

            <h1 className="headline mx-auto max-w-[340px] text-[clamp(2.65rem,10vw,3.2rem)] leading-[1.03] tracking-[-0.035em] sm:max-w-none sm:text-6xl sm:leading-[0.95] lg:text-[6.3rem]">
              Nothing unnecessary.
            </h1>

            <p className="headline mx-auto mt-5 max-w-[310px] text-[1.45rem] leading-[1.2] text-[#17201d]/55 sm:mt-4 sm:max-w-none sm:text-4xl sm:leading-tight lg:text-[3.2rem]">
              Just ingredients with a reason.
            </p>

            <p className="mx-auto mt-6 max-w-[310px] text-[0.875rem] leading-[1.7] text-[#17201d]/65 sm:mt-8 sm:max-w-xl sm:text-[0.95rem] sm:leading-7">
              We keep our ingredient list intentional: fruit at the centre,
              thoughtfully paired with black cumin honey.
            </p>
          </div>
        </section>

        {/* DRAGON FRUIT */}
        <section className="border-t border-black/[0.07]">
          <div className="grid lg:min-h-[720px] lg:grid-cols-2">
            <div className="flex items-center px-6 py-12 sm:px-14 sm:py-20 lg:px-20 xl:px-28">
              <div className="max-w-xl">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#910b0a] sm:text-[0.68rem]">
                  01 · Dragon Fruit
                </p>
                <h2 className="headline mt-5 text-[2.65rem] leading-[1.05] sm:mt-7 sm:text-6xl sm:leading-[0.98] lg:text-7xl">
                  Fruit first.
                </h2>
                <p className="mt-5 max-w-md text-[0.9rem] leading-[1.7] text-[#17201d]/65 sm:mt-8 sm:text-[1rem] sm:leading-8">
                  Dragon fruit is at the heart of our spread. Carefully
                  selected fruit brings its distinctive colour, character and
                  fruit-forward taste to every jar.
                </p>
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden bg-[#f4e8e4] sm:aspect-auto sm:min-h-[500px]">
              <img
                src="/images/dragon-fruit.png"
                alt="Fresh red-fleshed dragon fruit"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            </div>
          </div>
        </section>

        {/* INGREDIENT LIST */}
        <section className="bg-[#910b0a] py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <Reveal>
              <div className="text-center">
                <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-white sm:text-[0.8rem]">
                  FRESAVA · THE SIGNATURE SPREAD
                </p>
                <h2 className="headline mt-4 text-[clamp(2.5rem,9vw,3.5rem)] leading-[1.08] text-white sm:text-[clamp(3.5rem,5vw,5rem)]">
                  Nothing to hide.
                </h2>
                <p className="mt-4 text-[0.95rem] text-white/75 sm:text-xl">
                  Every ingredient, in plain sight.
                </p>
              </div>
            </Reveal>

            <div className="mt-5 sm:mt-8">
              {INGREDIENT_LIST.map((ingredient, i) => (
                <Reveal key={ingredient.number} delay={i * 70}>
                  <div className="grid grid-cols-[32px_76px_minmax(0,1fr)] items-center gap-x-3 border-b border-white/25 py-6 sm:grid-cols-[60px_145px_minmax(0,1fr)_145px] sm:gap-x-7 sm:py-8">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/40 text-[0.9rem] text-white sm:h-12 sm:w-12 sm:text-xl">
                      {ingredient.number}
                    </div>

                    <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-white/10 sm:h-[130px] sm:w-[130px]">
                      <IngredientIcon icon={ingredient.icon} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="headline text-[clamp(1.15rem,4.2vw,1.5rem)] leading-[1.15] text-white sm:text-[clamp(1.65rem,2.2vw,2.3rem)]">
                        {ingredient.name}
                      </h3>
                      <p className="mt-2 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-white sm:text-[0.68rem]">
                        {ingredient.role}
                      </p>
                      <p className="mt-2 text-[0.72rem] leading-[1.5] text-white/75 sm:mt-3 sm:max-w-md sm:text-[0.92rem] sm:leading-relaxed">
                        {ingredient.description}
                      </p>
                    </div>

                    <div className="hidden border-l border-white/25 pl-6 sm:block">
                      <p className="headline text-lg italic text-white/75">
                        {ingredient.note}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <div className="mt-9 flex items-center justify-center gap-3 text-center sm:mt-12">
                <span className="text-xl text-white" aria-hidden="true">
                  ❧
                </span>
                <p className="text-[0.65rem] font-medium uppercase tracking-[0.15em] text-white sm:text-xs">
                  Four ingredients. Nothing unnecessary.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* BLACK CUMIN HONEY */}
        <section className="grid lg:min-h-[720px] lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden bg-[#e5c48f] lg:aspect-auto lg:min-h-[500px]">
            <img
              src="/images/black-cumin-honey.png"
              alt="Black cumin honey"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </div>

          <div className="flex items-center px-6 py-12 sm:px-14 sm:py-20 lg:px-20 xl:px-28">
            <div className="max-w-xl">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#910b0a] sm:text-[0.68rem]">
                02 · Black Cumin Honey
              </p>
              <h2 className="headline mt-5 text-[2.65rem] leading-[1.08] sm:mt-7 sm:text-6xl sm:leading-[0.98] lg:text-7xl">
                Sweetness,
                <br />
                chosen differently.
              </h2>
              <p className="mt-5 max-w-md text-[0.9rem] leading-[1.7] text-[#17201d]/65 sm:mt-8 sm:text-[1rem] sm:leading-8">
                Instead of relying on refined sugar for sweetness, FRESAVA
                pairs the fruit with black cumin honey chosen deliberately as
                part of the character of the recipe.
              </p>
            </div>
          </div>
        </section>

        <PurityScrollMobile />

        {/* FARM TO JAR */}
        <section className="px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#910b0a]">
                The journey
              </p>
              <h2 className="headline mt-6 text-5xl sm:text-6xl">
                From fruit to jar.
              </h2>
              <p className="mx-auto mt-6 max-w-xl leading-7 text-[#17201d]/60">
                A simple ingredient list deserves a considered process.
              </p>
            </div>

            <div className="relative mt-20">
              {/* MOBILE TIMELINE */}
              <div className="relative md:hidden">
                <div className="space-y-0">
                  {JOURNEY.map((step, index) => (
                    <div
                      key={step.number}
                      className="relative grid grid-cols-[18px_minmax(0,1fr)] gap-x-5"
                    >
                      <div className="relative flex flex-col items-center">
                        <span className="relative z-10 mt-1 block h-[14px] w-[14px] shrink-0 rounded-full border-2 border-[#910b0a] bg-[#fffdf8]" />
                        {index < JOURNEY.length - 1 && (
                          <span className="w-px flex-1 bg-[#910b0a]/25" />
                        )}
                      </div>

                      <div className={index < JOURNEY.length - 1 ? "pb-7" : "pb-0"}>
                        <span className="text-[0.65rem] font-semibold tracking-[0.18em] text-[#910b0a]">
                          {step.number} / 05
                        </span>
                        <h3 className="headline mt-1.5 text-[1.65rem] leading-tight text-[#17201d]">
                          {step.title}
                        </h3>
                        <p className="mt-2 max-w-[270px] text-[0.86rem] leading-[1.65] text-[#17201d]/60">
                          {step.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DESKTOP TIMELINE */}
              <div className="relative hidden md:block">
                <div className="absolute left-0 right-0 top-[7px] h-px bg-[#17201d]/20" />
                <div className="relative grid gap-12 md:grid-cols-5 md:gap-5">
                  {JOURNEY.map((step) => (
                    <div key={step.number} className="relative">
                      <div className="mb-8 flex items-center">
                        <span className="relative z-10 block h-[15px] w-[15px] rounded-full border-2 border-[#910b0a] bg-[#fffdf8]" />
                      </div>
                      <span className="text-[0.65rem] font-semibold tracking-[0.18em] text-white">
                        {step.number}
                      </span>
                      <h3 className="headline mt-4 text-2xl">{step.title}</h3>
                      <p className="mt-4 max-w-[220px] text-[0.82rem] leading-6 text-[#17201d]/55">
                        {step.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative overflow-hidden bg-[#f4e8e4] px-6 py-14 sm:py-32 lg:py-28">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#910b0a] lg:text-white">
              FRESAVA
            </p>
            <h2 className="headline mx-auto mt-5 max-w-4xl text-[clamp(2.35rem,10vw,3rem)] leading-[1.06] text-[#17201d] sm:mt-7 sm:text-6xl sm:leading-[0.98] lg:text-7xl">
              Simple ingredients.
              <br />
              Made with purpose.
            </h2>
            <p className="mx-auto mt-5 max-w-[320px] text-[0.9rem] leading-[1.7] text-[#17201d]/65 sm:mt-7 sm:max-w-xl sm:text-[0.95rem] sm:leading-7 lg:text-[#17201d]/60">
              Fruit at the centre, thoughtfully chosen ingredients, and
              nothing added without a reason.
            </p>
            <Link
              href="/spread"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-[#910b0a] px-8 py-3.5 text-[0.78rem] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#760908] sm:mt-10"
            >
              Explore the Spread
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
