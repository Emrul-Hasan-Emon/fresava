import { Container } from "./container";
import { Reveal } from "./reveal";
import { JarIllustration } from "./jar-illustration";
import { DragonFruitIllustration } from "./dragon-fruit-illustration";

const SPECS = [
  { label: "Weight", value: "240g" },
  { label: "Sweetener", value: "Raw honey" },
  { label: "Texture", value: "Soft set" },
];

export function SignatureJar() {
  return (
    <section id="jelly" className="py-24 md:py-32">
      <Container>
        <div className="grid items-center gap-16 md:grid-cols-2">
          <Reveal>
            <p className="text-xs font-medium tracking-[0.35em] text-maroon">
              THE SIGNATURE JAR
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-ink md:text-5xl">
              The whole fruit,
              <br />
              held in glass.
            </h2>
            <p className="mt-5 max-w-md text-ink/60">
              Fresava Dragon Fruit &amp; Honey Jelly is set the old way: real
              fruit, real honey, and time — no refined sugar and nothing
              synthetic standing in for either.
            </p>

            <dl className="mt-10 flex gap-10">
              {SPECS.map((spec) => (
                <div key={spec.label}>
                  <dt className="text-xs tracking-widest text-ink/40 uppercase">
                    {spec.label}
                  </dt>
                  <dd className="mt-1 font-display text-xl text-maroon">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.15} className="flex justify-center">
            <JarIllustration className="h-80 w-auto" />
          </Reveal>
        </div>
      </Container>

      <Container className="mt-28 md:mt-36">
        <div className="grid items-center gap-16 md:grid-cols-2">
          <Reveal className="order-2 flex justify-center md:order-1">
            <DragonFruitIllustration className="h-72 w-72" />
          </Reveal>
          <Reveal delay={0.1} className="order-1 md:order-2">
            <p className="text-xs font-medium tracking-[0.35em] text-maroon">
              WHERE IT STARTS
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-ink md:text-5xl">
              Two ingredients.
              <br />
              One honest jar.
            </h2>
            <p className="mt-5 max-w-md text-ink/60">
              Red-fleshed dragon fruit, grown organically and picked at full
              ripeness, set with raw honey instead of white sugar — nothing
              added to make up for fruit picked too early, and nothing added
              to make cheaper sweetener taste like honey.
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
