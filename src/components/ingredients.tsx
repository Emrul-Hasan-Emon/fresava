import { Leaf, Droplet, Citrus, Sparkles } from "lucide-react";
import { Container } from "./container";
import { Reveal } from "./reveal";

const INGREDIENTS = [
  {
    icon: Leaf,
    name: "Dragon fruit",
    detail:
      "Organically grown red-fleshed pitaya, hand-picked at full ripeness for natural sweetness and colour.",
  },
  {
    icon: Droplet,
    name: "Raw honey",
    detail:
      "Unheated, unfiltered honey. Our only sweetener — there is no added white sugar anywhere in the jar.",
  },
  {
    icon: Citrus,
    name: "Lemon juice",
    detail:
      "A few drops to balance sweetness and help the fruit set naturally, the way jelly was made before shortcuts.",
  },
  {
    icon: Sparkles,
    name: "Fruit pectin",
    detail:
      "Plant-derived from citrus peel, halal, and doing the one job it needs to: holding the jelly together.",
  },
];

export function Ingredients() {
  return (
    <section id="ingredients" className="py-24 md:py-32">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium tracking-[0.35em] text-maroon">
            WHAT&rsquo;S ACTUALLY INSIDE
          </p>
          <h2 className="mt-4 font-display text-4xl leading-tight text-ink md:text-5xl">
            Four ingredients.
            <br />
            Read the whole list in one breath.
          </h2>
          <p className="mt-5 text-ink/60">
            Most jelly labels run a dozen lines deep. Ours doesn&rsquo;t need
            to. Here is everything in a Fresava jar — no asterisks, no
            footnotes.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {INGREDIENTS.map((item, i) => (
            <Reveal key={item.name} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-maroon/10 p-6">
                <item.icon size={22} strokeWidth={1.5} className="text-maroon" />
                <h3 className="mt-4 font-display text-xl text-ink">
                  {item.name}
                </h3>
                <p className="mt-2 text-sm text-ink/60">{item.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
