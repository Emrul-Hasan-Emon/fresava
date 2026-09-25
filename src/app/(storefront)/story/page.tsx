/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
export const metadata: Metadata = {
  title: "Our Story — Fresava",
  description:
    "Why Fresava exists: a brand built for parents who read the label twice.",
};
import { IMG } from "@/lib/assets";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { PageHero } from "@/components/page-hero";

const CHAPTERS = [
  {
    n: "Chapter one",
    t: "A label read twice",
    d: "It started in a Dhaka supermarket aisle, reading the back of an imported jam jar. Sugar first. Glucose syrup second. A colour with a number third. The fruit came fourth. We wanted something we could hand a child without hesitation - it didn't exist here. So we made it.",
  },
  {
    n: "Chapter two",
    t: "The fruit nobody used",
    d: "Bangladesh grows a beautiful red dragon fruit. Most of it disappears into the market - sold fresh, sold cheap, forgotten by morning. Yet it's rich in antioxidants, naturally sweet, and almost impossibly colourful. The obvious fruit for a preservative-free spread. Nobody was making one. So we did.",
  },
  {
    n: "Chapter three",
    t: "One jar, done properly",
    d: "We could have launched a range. Instead, we chose to perfect a single product. Four test batches later, the Fresava Dragon Fruit Spread finally held its colour, its fragrance, and its set - no added sugar, nothing artificial, nothing to hide.",
  },
];

const VALUES = [
  ["Honesty", "If it is in the jar, it is on the label. In that order."],
  ["Quality", "Premium is a standard of care, not a price tag."],
  ["Safety", "Made to a standard we would feed our own children."],
  ["Sustainability", "Local fruit, fair prices, recyclable glass."],
];

export default function Story() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Our Story"
          title={
            <>
              Made Halal.
              <br />
              Made Clean.
              <br />
              Made Fresava.
            </>
          }
          sub="Fresava is a premium organic food brand from Bangladesh, built on one belief: healthy eating should be simple, accessible and completely trustworthy."
        />

        {/* Chapters */}
        <section className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-4xl space-y-24 px-6 sm:px-8">
            {CHAPTERS.map((c, i) => (
              <Reveal key={c.t} delay={i * 60}>
                <p className="eyebrow text-crimson/70">{c.n}</p>
                <h2 className="headline mt-5 text-4xl text-ink sm:text-6xl">
                  {c.t}
                </h2>
                <p className="mt-7 text-[1rem] leading-[1.85] text-ink/65">
                  {c.d}
                </p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Customer-led development */}
        <section className="bg-ink py-24 text-cream sm:py-32">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            <Reveal>
              <p className="eyebrow text-cream/50">Built with you</p>
              <h2 className="headline mt-5 text-4xl sm:text-6xl">
                The next jar starts with a conversation.
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="max-w-xl text-[1rem] leading-[1.8] text-cream/70">
                Fresava is customer-driven by design. We listen to what families
                want at breakfast, what children actually enjoy, and what makes
                a label feel trustworthy. Your feedback shapes our sweetness,
                texture, pack sizes and the clean-food products we develop next.
              </p>
              <div className="mt-9 grid grid-cols-3 gap-5 border-t border-cream/15 pt-7">
                {[
                  ["Taste", "Balanced with real feedback"],
                  ["Format", "Made for real kitchens"],
                  ["Future", "Shaped by your requests"],
                ].map(([t, d]) => (
                  <div key={t}>
                    <p className="headline text-xl text-cream">{t}</p>
                    <p className="mt-2 text-[0.75rem] leading-relaxed text-cream/50">
                      {d}
                    </p>
                  </div>
                ))}
              </div>
              <Link
                href="/contact"
                className="mt-8 inline-block text-sm text-cream"
              >
                Share your idea with Fresava →
              </Link>
            </Reveal>
          </div>
        </section>

        {/* Mission / Vision */}
        <section className="bg-cream py-24 sm:py-32">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 sm:px-8 lg:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-[28px] bg-crimson p-12 text-cream">
                <p className="eyebrow text-cream/55">Mission</p>

                <div className="headline mt-6 space-y-6 text-3xl leading-snug sm:text-4xl">
                  <p>
                    To make healthy eating simple, accessible, and trustworthy
                    preserving the authentic taste and nutrition of fresh fruit.
                  </p>
                  <p>
                    Every product we create is preservative free and non toxic,
                    made only with all natural ingredients. No food colour. No
                    artificial flavour. No perfume. Nothing that compromises
                    human health.
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="h-full rounded-[28px] bg-white p-12">
                <p className="eyebrow text-crimson/70">Vision</p>
                <p className="headline mt-6 text-3xl leading-snug text-ink sm:text-4xl">
                  We are deeply committed to the wellbeing of every person who
                  opens one of our jars. InshaAllah, we will continue to serve
                  better food products for everyone.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Values */}
        <section className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <Reveal>
              <h2 className="headline max-w-xl text-4xl text-ink sm:text-5xl">
                What we hold to.
              </h2>
            </Reveal>
            <div className="mt-14 grid gap-px overflow-hidden rounded-3xl bg-black/8 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map(([t, d], i) => (
                <Reveal key={t} delay={i * 80}>
                  <div className="h-full bg-white p-9">
                    <h3 className="headline text-2xl text-crimson">{t}</h3>
                    <p className="mt-3 text-[0.85rem] leading-relaxed text-ink/60">
                      {d}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section className="relative overflow-hidden py-28">
          <img
            src={IMG.toast}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative mx-auto max-w-5xl px-6 text-cream sm:px-8">
            <Reveal>
              <p className="eyebrow text-cream/60">Who we make it for</p>
              <h2 className="headline mt-6 max-w-2xl text-4xl sm:text-6xl">
                Families who read the label. Twice.
              </h2>
              <div className="mt-12 grid gap-x-10 gap-y-4 sm:grid-cols-2">
                {[
                  "Health-conscious households",
                  "Parents feeding young children",
                  "Young professionals eating better",
                  "Premium supermarkets & online grocers",
                  "Hotels, cafés and patisseries",
                  "Gifting and corporate hampers",
                ].map((x) => (
                  <p
                    key={x}
                    className="border-b border-cream/15 pb-3 text-[0.9rem] text-cream/80"
                  >
                    {x}
                  </p>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Roadmap */}
        <section className="bg-cream py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <Reveal>
              <p className="eyebrow text-crimson/70">What comes next</p>
              <h2 className="headline mt-5 max-w-4xl text-4xl text-ink sm:text-6xl">
                One jar today. A pantry tomorrow.
              </h2>
            </Reveal>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [
                  "Now",
                  "Dragon Fruit Spread",
                  "The signature jar, in limited seasonal batches.",
                ],
                [
                  "Next",
                  "Preserves, Jams, & marmalades",
                  "Raspberry, Apricot, Peach, Guava, mango and citrus.",
                ],
                [
                  "Later",
                  "Drinks & dried fruit",
                  "Cold-pressed fruit drinks and air-dried slices.",
                ],
                [
                  "Future",
                  "Healthy snacks & baby food",
                  "Clean nutrition for the youngest eaters.",
                ],
              ].map(([w, t, d], i) => (
                <Reveal key={t} delay={i * 80}>
                  <div className="h-full rounded-3xl bg-white p-8">
                    <p className="text-[0.7rem] tracking-[0.25em] text-crimson uppercase">
                      {w}
                    </p>
                    <h3 className="headline mt-4 text-2xl text-ink">{t}</h3>
                    <p className="mt-3 text-[0.84rem] leading-relaxed text-ink/55">
                      {d}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal>
              <div className="mt-14 text-center">
                <Link
                  href="/contact"
                  className="inline-block rounded-full bg-crimson px-8 py-3 text-[0.8rem] font-medium tracking-wide text-cream transition-transform hover:scale-105"
                >
                  Work with Fresava
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
