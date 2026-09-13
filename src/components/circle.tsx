import { Container } from "./container";
import { Reveal } from "./reveal";

const STATS = [
  { value: "10 : 1", label: "Empty jars to a free jar" },
  { value: "৳495", label: "Reward value, every cycle" },
  { value: "100%", label: "Returned jars reused or recycled" },
];

export function Circle() {
  return (
    <section
      id="circle"
      className="bg-maroon-deep py-24 text-cream-soft md:py-32"
    >
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium tracking-[0.35em] text-cream-soft/70">
            FRESAVA CIRCLE &middot; RETURN &amp; REWARD
          </p>
          <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
            Bring back 10 jars.
            <br />
            Take 1 home free.
          </h2>
          <p className="mt-5 text-cream-soft/80">
            The jar never dies. Rinse your empties, hand them back, and every
            ten jars becomes a free Signature jelly — our thank-you for
            keeping glass in the loop.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <a
              href="#contact"
              className="rounded-full bg-cream-soft px-6 py-2.5 text-sm font-medium text-maroon-deep transition-opacity hover:opacity-90"
            >
              Track my jars
            </a>
            <a
              href="#contact"
              className="rounded-full border border-cream-soft/40 px-6 py-2.5 text-sm text-cream-soft transition-colors hover:border-cream-soft"
            >
              Book free pickup
            </a>
          </div>
        </Reveal>

        <Reveal
          delay={0.15}
          className="mt-16 grid grid-cols-1 gap-8 border-t border-cream-soft/15 pt-12 sm:grid-cols-3"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-3xl md:text-4xl">{stat.value}</p>
              <p className="mt-2 text-xs tracking-widest text-cream-soft/70 uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
