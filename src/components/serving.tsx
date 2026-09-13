import { Sandwich, Coffee, UtensilsCrossed, Cookie } from "lucide-react";
import { Container } from "./container";
import { Reveal } from "./reveal";

const IDEAS = [
  {
    icon: Sandwich,
    title: "On warm paratha or toast",
    detail: "A spoonful over breakfast — sweet enough without tipping over.",
  },
  {
    icon: Cookie,
    title: "Swirled into yogurt",
    detail: "Stir through plain yogurt or oats in place of a sugar spoon.",
  },
  {
    icon: UtensilsCrossed,
    title: "On a cheese board",
    detail: "Pairs with soft cheese and crackers for a fruit-and-honey note.",
  },
  {
    icon: Coffee,
    title: "Alongside evening tea",
    detail: "A small spoon on the side — the way honey was always meant to be had.",
  },
];

export function Serving() {
  return (
    <section className="bg-cream-deep/60 py-24 md:py-32">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium tracking-[0.35em] text-maroon">
            HOW TO ENJOY IT
          </p>
          <h2 className="mt-4 font-display text-4xl leading-tight text-ink md:text-5xl">
            One jar, many mornings.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {IDEAS.map((idea, i) => (
            <Reveal key={idea.title} delay={i * 0.08} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-maroon/10 text-maroon">
                <idea.icon size={22} strokeWidth={1.5} />
              </div>
              <h3 className="mt-4 font-display text-lg text-ink">
                {idea.title}
              </h3>
              <p className="mt-2 text-sm text-ink/60">{idea.detail}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
