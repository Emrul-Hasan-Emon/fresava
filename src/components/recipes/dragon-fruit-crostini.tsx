"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import { MoreRecipes } from "@/components/more-recipes";

const INGREDIENTS = [
  "8 slices baguette or sourdough bread",
  "120 g cream cheese, softened",
  "8 tbsp FRESAVA Dragon Fruit Spread",
  "4–5 fresh strawberries, thinly sliced",
  "½ banana, thinly sliced",
  "2 tbsp chopped pistachios or walnuts — optional",
  "Fresh mint leaves — optional",
];

const STEPS = [
  {
    title: "Toast the bread",
    text: "Lightly toast the bread until the edges are golden and the surface is crisp while the centre remains slightly soft.",
  },
  {
    title: "Add the cream cheese",
    text: "Allow the toast to cool slightly, then spread a generous layer of softened cream cheese over each piece.",
  },
  {
    title: "Add FRESAVA",
    text: "Spoon FRESAVA Dragon Fruit Spread over the cream cheese. Keep the layers visible rather than mixing them together.",
  },
  {
    title: "Add the fruit",
    text: "Top the crostini with sliced strawberries or banana. Use a mixture across the board for variety.",
  },
  {
    title: "Finish & share",
    text: "Add chopped pistachios, walnuts or fresh mint if desired. Arrange everything on a serving board and serve immediately.",
  },
];

export function DragonFruitCrostiniClient() {
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
                  FRESAVA Recipes · The Shared Table
                </p>
                <h1 className="headline mt-6 max-w-[600px] text-[3rem] leading-[0.94] tracking-[-0.025em] sm:text-[3.6rem] lg:text-[4rem] xl:text-[4.25rem]">
                  Cream Cheese &amp;
                  <br />
                  Dragon Fruit Crostini
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
                src="/images/dragon-fruit-crostini.png"
                alt="Cream cheese crostini topped with FRESAVA Dragon Fruit Spread and fresh fruit"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="grid border-b border-[#17201d]/15 bg-[#fffdf8] sm:grid-cols-4">
            <div className="flex min-h-[64px] items-center px-8 sm:px-10">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#17201d]/55">
                Dragon Fruit Crostini
              </p>
            </div>
            <div className="flex min-h-[64px] flex-col justify-center border-t border-[#17201d]/15 px-8 sm:border-l sm:border-t-0 sm:px-10">
              <span className="text-[0.5rem] uppercase tracking-[0.2em] text-[#17201d]/35">
                Prep
              </span>
              <span className="mt-1 text-[0.68rem] font-semibold">10 min</span>
            </div>
            <div className="flex min-h-[64px] flex-col justify-center border-t border-[#17201d]/15 px-8 sm:border-l sm:border-t-0 sm:px-10">
              <span className="text-[0.5rem] uppercase tracking-[0.2em] text-[#17201d]/35">
                Cook
              </span>
              <span className="mt-1 text-[0.68rem] font-semibold">5 min</span>
            </div>
            <div className="flex min-h-[64px] flex-col justify-center border-t border-[#17201d]/15 px-8 sm:border-l sm:border-t-0 sm:px-10">
              <span className="text-[0.5rem] uppercase tracking-[0.2em] text-[#17201d]/35">
                Serves
              </span>
              <span className="mt-1 text-[0.68rem] font-semibold">4</span>
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
                  4
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
                Crisp crostini, creamy cheese and FRESAVA Dragon Fruit
                Spread come together in a colourful sharing plate made for
                passing around the table.
              </p>

              <div className="mt-10">
                <p className="text-[0.82rem] font-semibold">
                  Instructions: Cream Cheese &amp; Dragon Fruit Crostini
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
                      Let the toasted bread cool slightly before adding the
                      cream cheese so it keeps its texture.
                    </p>
                    <p className="mt-4 text-[1.02rem] font-normal leading-[1.65] text-white/78 sm:text-[1.08rem] lg:text-[1.12rem]">
                      Add FRESAVA Dragon Fruit Spread after the cream cheese
                      and keep the layers visible for a brighter, more
                      distinctive finish.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
      <MoreRecipes currentRecipe="crostini" />
    </main>
  );
}
