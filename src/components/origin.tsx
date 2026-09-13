import { Container } from "./container";
import { Reveal } from "./reveal";
import { FieldIllustration } from "./field-illustration";

const STATS = [
  { value: "12 hrs", label: "Field to lid" },
  { value: "100%", label: "Organic smallholdings" },
  { value: "Raw", label: "Unheated, unfiltered honey" },
  { value: "Named", label: "Farmers & beekeepers we can name" },
];

export function Origin() {
  return (
    <section id="origin" className="relative overflow-hidden py-24 text-cream-soft md:py-32">
      <FieldIllustration className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-maroon-deep/30" aria-hidden />

      <Container className="relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium tracking-[0.35em] text-cream-soft/70">
            ORIGIN
          </p>
          <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
            Twelve hours from field to lid.
          </h2>
          <p className="mt-5 text-cream-soft/80">
            Our dragon fruit is grown on organic smallholdings in Bangladesh.
            We buy the whole harvest, at a fair price, from farmers we can
            name. The honey comes the same way — raw and unheated, sourced
            directly from small apiaries rather than blended at a factory.
          </p>
        </Reveal>

        <Reveal
          delay={0.15}
          className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4"
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
