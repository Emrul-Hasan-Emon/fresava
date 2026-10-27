/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

type RecipeId =
  | "banana-toast"
  | "faluda"
  | "smoothie"
  | "granola-bowl"
  | "pancakes"
  | "crostini";

const RECIPES = [
  {
    id: "banana-toast",
    category: "Quick breakfast",
    title: "FRESAVA Banana Toast",
    image: "/images/dragon-fruit-spread-breakfast.png",
    to: "/recipes/fresava-banana-toast",
  },
  {
    id: "faluda",
    category: "Dessert · Drink",
    title: "Dragon Fruit Faluda",
    image: "/images/dragon-fruit-faluda.png",
    to: "/recipes/dragon-fruit-faluda",
  },
  {
    id: "smoothie",
    category: "Easy blend",
    title: "Dragon Fruit Smoothie",
    image: "/images/dragon-fruit-spread-smoothie.png",
    to: "/recipes/dragon-fruit-smoothie",
  },
  {
    id: "granola-bowl",
    category: "Little in-between",
    title: "Yogurt & Granola Bowl",
    image: "/images/dragon-fruit-spread-granola-bowl.png",
    to: "/recipes/yogurt-granola-bowl",
  },
  {
    id: "pancakes",
    category: "Slow morning",
    title: "Dragon Fruit Pancakes",
    image: "/images/dragon-fruit-spread-pancakes.png",
    to: "/recipes/dragon-fruit-pancakes",
  },
  {
    id: "crostini",
    category: "Shared table",
    title: "Cream Cheese & Dragon Fruit Crostini",
    image: "/images/dragon-fruit-crostini.png",
    to: "/recipes/dragon-fruit-crostini",
  },
] as const;

export function MoreRecipes({ currentRecipe }: { currentRecipe: RecipeId }) {
  const otherRecipes = RECIPES.filter((recipe) => recipe.id !== currentRecipe);

  return (
    <section className="bg-[#fffdf8] px-5 pb-20 pt-6 sm:px-8 sm:pt-8 lg:px-12 lg:pb-24 lg:pt-10">
      <div className="mx-auto w-full max-w-[1540px]">
        <div className="flex flex-col gap-6 border-b border-[#17201d]/15 pb-9 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[#910b0a]">
              Keep exploring
            </p>
            <h2 className="headline mt-4 text-[2.7rem] leading-[0.95] tracking-[-0.02em] sm:text-[3.4rem]">
              More FRESAVA Recipes
            </h2>
            <p className="mt-4 max-w-[560px] text-[0.9rem] leading-7 text-[#17201d]/60">
              More ways to enjoy FRESAVA Dragon Fruit Spread, from quick
              everyday bites to something worth sharing.
            </p>
          </div>

          <Link
            href="/recipes"
            className="inline-block self-start border-b border-[#910b0a] pb-1 text-[0.65rem] font-semibold uppercase tracking-[0.17em] text-[#910b0a] transition-opacity hover:opacity-60 sm:self-auto"
          >
            View all recipes →
          </Link>
        </div>

        <div className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
          {otherRecipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={recipe.to}
              className="group flex h-full flex-col"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[#f1eee7]">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                />
              </div>

              <div className="flex flex-1 flex-col pt-5">
                <p className="text-[0.56rem] font-semibold uppercase tracking-[0.22em] text-[#910b0a]">
                  {recipe.category}
                </p>

                <h3 className="headline mt-3 text-[1.55rem] leading-[1.05] tracking-[-0.015em] transition-colors group-hover:text-[#910b0a]">
                  {recipe.title}
                </h3>

                <span className="mt-auto pt-5">
                  <span className="inline-block border-b border-[#17201d]/35 pb-1 text-[0.58rem] font-semibold uppercase tracking-[0.16em] transition-colors group-hover:border-[#910b0a] group-hover:text-[#910b0a]">
                    View recipe →
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
