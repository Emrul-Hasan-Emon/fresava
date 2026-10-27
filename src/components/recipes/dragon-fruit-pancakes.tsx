"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import { MoreRecipes } from "@/components/more-recipes";

const INGREDIENTS = [
  "1 cup all-purpose flour",
  "1 tablespoon baking powder",
  "1 tablespoon honey",
  "1 egg",
  "3/4 cup milk",
  "1 tablespoon melted butter",
  "1 banana, sliced",
  "3 tablespoons FRESAVA Dragon Fruit Spread",
  "Granola, for finishing",
];

const STEPS = [
  {
    title: "Make the batter",
    text: "Add the flour and baking powder to a bowl. In a separate bowl, whisk the egg, milk, honey and melted butter. Pour the wet mixture into the dry ingredients and gently mix until just combined.",
  },
  {
    title: "Cook the pancakes",
    text: "Warm a lightly greased pan over medium heat. Spoon in the batter and cook until small bubbles appear on the surface. Flip and cook the other side until golden.",
  },
  {
    title: "Build the stack",
    text: "Stack the warm pancakes on a serving plate and layer with fresh banana slices.",
  },
  {
    title: "Finish with FRESAVA",
    text: "Spoon FRESAVA Dragon Fruit Spread over the pancakes and finish with a little granola. Serve while the pancakes are still warm.",
  },
];

export function DragonFruitPancakesClient() {
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
            <div className="flex min-h-[380px] flex-col justify-between bg-[#710d0c] px-8 py-9 text-white sm:min-h-[450px] sm:px-12 sm:py-11 lg:min-h-[500px]">
              <div>
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-white/60">
                  FRESAVA Recipes · Breakfast
                </p>
                <h1 className="headline mt-6 max-w-[480px] text-[3.7rem] leading-[0.9] tracking-[-0.025em] sm:text-[4.8rem] lg:text-[5.4rem]">
                  Dragon Fruit
                  <br />
                  Pancakes
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

            <div className="relative min-h-[360px] sm:min-h-[450px] lg:min-h-[500px]">
              <img
                src="/images/dragon-fruit-spread-pancakes.png"
                alt="Dragon Fruit Pancakes with FRESAVA Dragon Fruit Spread"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="grid border-b border-[#17201d]/20 sm:grid-cols-2">
            <div className="flex min-h-[50px] items-center justify-center border-b border-[#17201d]/15 px-5 sm:border-b-0 sm:border-r">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-[#17201d]/55">
                Dragon Fruit Pancakes
              </p>
            </div>

            <div className="grid grid-cols-3">
              <div className="flex items-center justify-center border-r border-[#17201d]/15 px-3 py-3">
                <div>
                  <p className="text-[0.5rem] uppercase tracking-[0.14em] text-[#17201d]/35">
                    Prep
                  </p>
                  <p className="mt-1 text-[0.68rem] font-semibold">10 min</p>
                </div>
              </div>
              <div className="flex items-center justify-center border-r border-[#17201d]/15 px-3 py-3">
                <div>
                  <p className="text-[0.5rem] uppercase tracking-[0.14em] text-[#17201d]/35">
                    Cook
                  </p>
                  <p className="mt-1 text-[0.68rem] font-semibold">15 min</p>
                </div>
              </div>
              <div className="flex items-center justify-center px-3 py-3">
                <div>
                  <p className="text-[0.5rem] uppercase tracking-[0.14em] text-[#17201d]/35">
                    Serves
                  </p>
                  <p className="mt-1 text-[0.68rem] font-semibold">2</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-16 lg:px-10 xl:px-12">
        <div className="mx-auto w-full max-w-[1540px]">
          <div className="grid gap-16 lg:grid-cols-[320px_1fr] lg:gap-24">
            <aside>
              <h2 className="headline text-[2.15rem] leading-none">
                Ingredients
              </h2>

              <div className="mt-7 flex items-center gap-4">
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-[#17201d]/45">
                  Serves
                </span>
                <span className="flex h-8 min-w-8 items-center justify-center border border-[#17201d]/25 px-2 text-[0.82rem] font-semibold">
                  2
                </span>
              </div>

              <div className="mt-9 space-y-5">
                {INGREDIENTS.map((ingredient) => (
                  <div key={ingredient} className="flex items-start gap-4">
                    <span className="mt-[5px] h-[13px] w-[13px] shrink-0 rounded-full border border-[#17201d]/35" />
                    <p className="text-[0.9rem] leading-[1.55] text-[#17201d]/75">
                      {ingredient}
                    </p>
                  </div>
                ))}
              </div>
            </aside>

            <div>
              <p className="max-w-[760px] text-[1.08rem] leading-8 text-[#17201d]/65">
                Warm pancakes layered with fresh banana and finished with
                FRESAVA Dragon Fruit Spread and granola for a bright,
                fruit-forward breakfast.
              </p>

              <div className="mt-10">
                <p className="border-b border-[#17201d] pb-5 text-[0.82rem] font-semibold">
                  Instructions: Dragon Fruit Pancakes
                </p>

                {STEPS.map((step, index) => {
                  const isComplete = completed.includes(index);
                  return (
                    <article
                      key={step.title}
                      className="border-b border-[#17201d] py-9"
                    >
                      <div className="flex items-start justify-between gap-10">
                        <div className="max-w-[720px]">
                          <p className="text-[0.74rem] font-semibold">
                            Step {index + 1}
                          </p>
                          <h3 className="headline mt-4 text-[1.9rem] leading-tight sm:text-[2rem]">
                            {step.title}
                          </h3>
                          <p className="mt-4 max-w-[680px] text-[0.92rem] leading-[1.7] text-[#17201d]/68">
                            {step.text}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleStep(index)}
                          className="group mt-3 flex w-[88px] shrink-0 flex-col items-center text-center"
                          aria-label={
                            isComplete
                              ? `Mark ${step.title} as incomplete`
                              : `Mark ${step.title} as complete`
                          }
                        >
                          <span
                            className={`flex h-11 w-11 items-center justify-center rounded-full transition-all ${
                              isComplete
                                ? "bg-[#910b0a] text-white"
                                : "bg-[#e7e9e1] text-[#17201d]/40 group-hover:bg-[#dddcd3]"
                            }`}
                          >
                            {isComplete ? (
                              <span className="text-base">✓</span>
                            ) : (
                              <span className="text-sm">●</span>
                            )}
                          </span>
                          <span
                            className={`mt-2 text-[0.58rem] font-semibold leading-tight ${
                              isComplete
                                ? "text-[#910b0a]"
                                : "text-[#17201d]/55"
                            }`}
                          >
                            {isComplete ? "Completed" : "Mark as Complete"}
                          </span>
                        </button>
                      </div>
                    </article>
                  );
                })}
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
                      Wait until small bubbles appear across the pancake
                      surface before flipping.
                    </p>
                    <p className="mt-4 text-[1.02rem] font-normal leading-[1.65] text-white/78 sm:text-[1.08rem] lg:text-[1.12rem]">
                      Add the Dragon Fruit Spread after cooking so its
                      bright fruit character remains the finishing flavour.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
      <MoreRecipes currentRecipe="pancakes" />
    </main>
  );
}
