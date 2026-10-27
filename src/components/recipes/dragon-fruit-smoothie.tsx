"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import { MoreRecipes } from "@/components/more-recipes";

const INGREDIENTS = [
  "4 tbsp FRESAVA Dragon Fruit Spread",
  "1 ripe banana",
  "1½ cups chilled milk",
  "½ cup ice cubes",
  "1 tbsp FRESAVA Dragon Fruit Spread for finishing - optional",
];

const STEPS = [
  {
    title: "Add the base",
    text: "Add the banana, chilled milk and FRESAVA Dragon Fruit Spread to a blender.",
  },
  {
    title: "Blend until smooth",
    text: "Blend until the banana and Dragon Fruit Spread are completely combined and the smoothie becomes creamy.",
  },
  {
    title: "Add the ice",
    text: "Add the ice cubes and blend briefly again until smooth. For a thinner smoothie, add a little more chilled milk.",
  },
  {
    title: "Finish and serve",
    text: "Pour into two chilled glasses. Finish with a small swirl of FRESAVA Dragon Fruit Spread if desired and serve immediately.",
  },
];

export function DragonFruitSmoothieClient() {
  const [completed, setCompleted] = useState<number[]>([]);

  const toggleStep = (index: number) => {
    setCompleted((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index],
    );
  };

  return (
    <main className="bg-[#fffdf8] text-[#17201d]">
      <section className="pb-0 pt-0">
        <div className="w-full">
          <Link
            href="/recipes"
            className="mb-5 inline-flex text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[#17201d]/45 transition-colors hover:text-[#910b0a]"
          >
            ← Back to recipes
          </Link>

          <div className="grid overflow-hidden lg:grid-cols-2">
            <div className="flex min-h-[350px] flex-col justify-between bg-[#710d0c] px-8 py-9 text-white sm:min-h-[400px] sm:px-12 sm:py-11 lg:min-h-[440px]">
              <div>
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-white/60">
                  FRESAVA Recipes · Easy Blend
                </p>
                <h1 className="headline mt-6 max-w-[540px] text-[3rem] leading-[0.94] tracking-[-0.025em] sm:text-[3.6rem] lg:text-[4rem] xl:text-[4.25rem]">
                  Dragon Fruit
                  <br />
                  Smoothie
                </h1>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/recipes"
                  className="border border-white/50 bg-white px-4 py-2 text-[0.58rem] font-semibold uppercase tracking-[0.13em] text-[#710d0c] transition-colors hover:bg-transparent hover:text-white"
                >
                  All recipes
                </Link>
                <Link
                  href="/spread"
                  className="border border-white/50 px-4 py-2 text-[0.58rem] font-semibold uppercase tracking-[0.13em] text-white transition-colors hover:bg-white hover:text-[#710d0c]"
                >
                  Dragon Fruit Spread
                </Link>
              </div>
            </div>

            <div className="relative min-h-[350px] sm:min-h-[400px] lg:min-h-[440px]">
              <img
                src="/images/dragon-fruit-spread-smoothie.png"
                alt="Smoothie made with FRESAVA Dragon Fruit Spread"
                className="absolute inset-0 h-full w-full object-cover object-[center_15%]"
              />
            </div>
          </div>

          <div className="grid border-b border-[#17201d]/15 bg-[#fffdf8] sm:grid-cols-4">
            <div className="flex min-h-[64px] items-center px-8 sm:px-10">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#17201d]/55">
                Dragon Fruit Smoothie
              </p>
            </div>
            <div className="flex min-h-[64px] flex-col justify-center border-t border-[#17201d]/15 px-8 sm:border-l sm:border-t-0 sm:px-10">
              <span className="text-[0.5rem] uppercase tracking-[0.2em] text-[#17201d]/35">
                Prep
              </span>
              <span className="mt-1 text-[0.68rem] font-semibold">5 min</span>
            </div>
            <div className="flex min-h-[64px] flex-col justify-center border-t border-[#17201d]/15 px-8 sm:border-l sm:border-t-0 sm:px-10">
              <span className="text-[0.5rem] uppercase tracking-[0.2em] text-[#17201d]/35">
                Cook
              </span>
              <span className="mt-1 text-[0.68rem] font-semibold">0 min</span>
            </div>
            <div className="flex min-h-[64px] flex-col justify-center border-t border-[#17201d]/15 px-8 sm:border-l sm:border-t-0 sm:px-10">
              <span className="text-[0.5rem] uppercase tracking-[0.2em] text-[#17201d]/35">
                Serves
              </span>
              <span className="mt-1 text-[0.68rem] font-semibold">2</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
        <div className="mx-auto w-full max-w-[1540px]">
          <div className="grid gap-16 lg:grid-cols-[320px_1fr] lg:gap-24">
            <aside>
              <h2 className="headline text-[2.15rem]">Ingredients</h2>
              <div className="mt-7 flex items-center gap-5">
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#17201d]/50">
                  Serves
                </span>
                <span className="flex h-10 w-10 items-center justify-center border border-[#17201d]/20 text-[0.82rem] font-semibold">
                  2
                </span>
              </div>
              <div className="mt-9 space-y-6">
                {INGREDIENTS.map((ingredient) => (
                  <div key={ingredient} className="flex items-start gap-4">
                    <span className="mt-[0.35rem] h-4 w-4 shrink-0 rounded-full border border-[#17201d]/25" />
                    <p className="text-[0.9rem] leading-[1.55] text-[#17201d]/75">
                      {ingredient}
                    </p>
                  </div>
                ))}
              </div>
            </aside>

            <div>
              <p className="max-w-[760px] text-[1.08rem] leading-8 text-[#17201d]/65">
                A quick, creamy blend of banana, chilled milk and FRESAVA
                Dragon Fruit Spread for an easy fruit-forward drink made in
                minutes.
              </p>

              <div className="mt-10">
                <p className="text-[0.82rem] font-semibold">
                  Instructions: Dragon Fruit Smoothie
                </p>

                <div className="mt-5 border-t border-[#17201d]">
                  {STEPS.map((step, index) => {
                    const isCompleted = completed.includes(index);
                    return (
                      <article
                        key={step.title}
                        className="grid gap-7 border-b border-[#17201d] py-9 sm:grid-cols-[1fr_100px] sm:gap-10"
                      >
                        <div>
                          <p className="text-[0.74rem] font-semibold">
                            Step {index + 1}
                          </p>
                          <h3 className="headline mt-4 text-[1.9rem] leading-tight sm:text-[2rem]">
                            {step.title}
                          </h3>
                          <p className="mt-4 max-w-[800px] text-[0.92rem] leading-[1.7] text-[#17201d]/70">
                            {step.text}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleStep(index)}
                          aria-pressed={isCompleted}
                          className="flex w-[88px] flex-col items-center justify-center justify-self-start sm:justify-self-end"
                        >
                          <span
                            className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                              isCompleted ? "bg-[#910b0a]" : "bg-[#e6e8e2]"
                            }`}
                          >
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                isCompleted ? "bg-white" : "bg-[#87908c]"
                              }`}
                            />
                          </span>
                          <span className="mt-2 whitespace-nowrap text-[0.58rem] text-[#17201d]/60">
                            {isCompleted ? "Completed" : "Mark as Complete"}
                          </span>
                        </button>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <section className="mt-14 bg-[#910b0a] px-8 py-10 text-white lg:mt-16 lg:px-12 lg:py-11">
            <div className="grid items-center gap-10 lg:grid-cols-[430px_1fr] lg:gap-12">
              <div>
                <p className="text-[0.64rem] font-semibold uppercase tracking-[0.3em] text-white/65">
                  Good to know
                </p>
                <div className="mt-5 h-px w-12 bg-[#e4c58d]/75" />
                <h2 className="headline mt-5 whitespace-nowrap text-[3rem] leading-none tracking-[-0.025em] text-white sm:text-[3.4rem] lg:text-[3.65rem]">
                  FRESAVA Tips
                </h2>
              </div>

              <div className="rounded-[34px] border border-[#e4c58d]/80 px-7 py-7 sm:px-9 lg:px-10">
                <div className="grid gap-7 sm:grid-cols-[105px_1fr] sm:items-center lg:gap-9">
                  <div className="flex items-center justify-center sm:border-r sm:border-[#e4c58d]/45 sm:pr-8">
                    <svg
                      viewBox="0 0 80 80"
                      aria-hidden="true"
                      className="h-[72px] w-[72px] fill-none stroke-[#e4c58d]"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M27 48h27" />
                      <path d="M29 48v9h23v-9" />
                      <path d="M32 57v5h17v-5" />
                      <path d="M27 47 C20 46 16 41 16 35 C16 29 21 24 27 24 C29 16 35 12 42 12 C49 12 55 16 57 23 C64 23 69 28 69 35 C69 42 64 47 57 47" />
                      <path d="M24 68 C35 72 48 72 59 68" />
                    </svg>
                  </div>

                  <div>
                    <p className="text-[1.35rem] font-semibold leading-[1.4] tracking-[-0.015em] text-white sm:text-[1.45rem] lg:text-[1.55rem]">
                      Use a ripe banana for natural sweetness and keep the
                      milk well chilled before blending.
                    </p>
                    <p className="mt-4 text-[1.02rem] font-normal leading-[1.65] text-white/78 sm:text-[1.08rem] lg:text-[1.12rem]">
                      Start with less ice if you prefer a creamier smoothie,
                      then add more only if needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
      <MoreRecipes currentRecipe="smoothie" />
    </main>
  );
}
