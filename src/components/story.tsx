import { Container } from "./container";
import { Reveal } from "./reveal";

export function Story() {
  return (
    <section id="story" className="py-24 text-center md:py-32">
      <Container>
        <Reveal className="mx-auto max-w-2xl">
          <p className="text-xs font-medium tracking-[0.35em] text-maroon">
            OUR STORY
          </p>
          <h2 className="mt-4 font-display text-4xl leading-tight text-ink md:text-6xl">
            Made Halal.
            <br />
            Made Clean.
            <br />
            Made Fresava.
          </h2>
          <p className="mt-6 text-ink/60">
            Fresava is a premium organic food brand from Bangladesh, built on
            one belief: healthy eating should be simple, accessible and
            completely trustworthy. Our Dragon Fruit &amp; Honey Jelly is the
            first proof of that — a jar that swaps refined sugar for raw
            honey and never adds anything else to make up the difference.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
