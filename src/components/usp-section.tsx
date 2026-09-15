import Link from "next/link";
import { Reveal } from "./reveal";

const USPS = [
  {
    number: "01",
    title: "Premium Dragon Fruit Spread",
    body: "A vivid, soft-set spread made to make an ordinary breakfast feel like a small occasion.",
  },
  {
    number: "02",
    title: "No Added Sugar",
    body: "No refined cane sugar, glucose syrup or hidden sweeteners in the recipe.",
  },
  {
    number: "03",
    title: "Pure Honey Sweetened",
    body: "A measured touch of pure honey rounds out the fruit without taking over its natural character.",
  },
  {
    number: "04",
    title: "Organic & Farm-Sourced Dragon Fruit",
    body: "We work with growers we can name and source organic dragon fruit at full ripeness.",
  },
  {
    number: "05",
    title: "Clean-Label & No Artificial Ingredients",
    body: "No artificial colours, flavours or preservatives. What belongs in the jar belongs on the label.",
  },
  {
    number: "06",
    title: "Customer-Driven Product Development",
    body: "Your feedback shapes the taste, texture, pack sizes and the next Fresava product we make.",
  },
  {
    number: "07",
    title: "3-Day Full-Refund Satisfaction Guarantee",
    body: "Try your jar. If you are not satisfied within 3 days of delivery, tell us for a full refund. No awkward questions.",
  },
];

export function USPSection({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "bg-cream py-20 sm:py-28" : "bg-ink py-24 text-cream sm:py-32"}>
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24">
          <Reveal>
            <p className={compact ? "eyebrow text-crimson/70" : "eyebrow text-cream/50"}>
              The Fresava standard
            </p>
            <h2
              className={
                compact
                  ? "headline mt-5 text-4xl text-ink sm:text-6xl"
                  : "headline mt-5 text-4xl text-cream sm:text-6xl"
              }
            >
              Seven reasons to trust the jar.
            </h2>
            <p
              className={
                compact
                  ? "mt-6 max-w-sm text-[0.92rem] leading-relaxed text-ink/60"
                  : "mt-6 max-w-sm text-[0.92rem] leading-relaxed text-cream/60"
              }
            >
              Fresava is more than a fruit spread. It is a promise to make better food with better
              ingredients, and to stand behind every jar we sell.
            </p>
            <Link
              href="/purity"
              className={compact ? "mt-8 inline-block text-sm text-crimson" : "mt-8 inline-block text-sm text-cream"}
            >
              Read our purity standard &rarr;
            </Link>
          </Reveal>

          <div
            className={
              compact
                ? "divide-y divide-ink/10 border-y border-ink/10"
                : "divide-y divide-cream/15 border-y border-cream/15"
            }
          >
            {USPS.map((usp, i) => (
              <Reveal key={usp.number} delay={i * 55}>
                <div className="group grid gap-3 py-6 sm:grid-cols-[3.25rem_1fr] sm:gap-5">
                  <span
                    className={
                      compact
                        ? "text-[0.72rem] tracking-[0.2em] text-crimson"
                        : "text-[0.72rem] tracking-[0.2em] text-crimson-soft"
                    }
                  >
                    {usp.number}
                  </span>
                  <div>
                    <h3
                      className={
                        compact
                          ? "headline text-2xl text-ink transition-colors group-hover:text-crimson"
                          : "headline text-2xl text-cream transition-colors group-hover:text-crimson-soft"
                      }
                    >
                      {usp.title}
                    </h3>
                    <p
                      className={
                        compact
                          ? "mt-2 max-w-xl text-[0.84rem] leading-relaxed text-ink/55"
                          : "mt-2 max-w-xl text-[0.84rem] leading-relaxed text-cream/55"
                      }
                    >
                      {usp.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal>
          <div
            className={
              compact
                ? "mt-12 flex flex-col gap-4 border-t border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-between"
                : "mt-12 flex flex-col gap-4 border-t border-cream/15 pt-6 sm:flex-row sm:items-center sm:justify-between"
            }
          >
            <p className={compact ? "text-[0.8rem] text-ink/55" : "text-[0.8rem] text-cream/55"}>
              Not satisfied within 3 days of delivery? We will make it right with a full refund.
            </p>
            <Link
              href="/contact"
              className={compact ? "text-[0.8rem] font-medium text-crimson" : "text-[0.8rem] font-medium text-cream"}
            >
              Talk to the Fresava team &rarr;
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
