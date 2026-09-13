"use client";

import { motion } from "framer-motion";
import { Container } from "./container";
import { Reveal } from "./reveal";

const EXCLUDED = [
  "Refined cane sugar",
  "Glucose & corn syrup",
  "Artificial sweeteners",
  "Artificial colour",
  "Artificial flavour",
  "Chemical preservatives",
  "Gelatin & animal-derived fillers",
  "Anything non-halal",
  "Anything we cannot pronounce",
];

export function Purity() {
  return (
    <section id="purity" className="bg-cream-deep/60 py-24 md:py-32">
      <Container className="grid gap-14 md:grid-cols-2 md:gap-20">
        <Reveal>
          <p className="text-xs font-medium tracking-[0.35em] text-maroon">
            NEVER IN A FRESAVA JAR
          </p>
          <h2 className="mt-4 font-display text-4xl leading-tight text-ink md:text-5xl">
            Keep scrolling.
            <br />
            Watch the list disappear.
          </h2>
          <p className="mt-5 max-w-md text-ink/60">
            Ordinary jellies are built from a long list of shortcuts —
            starting with the white sugar most brands lean on. We swapped it
            for raw honey and removed everything else a shortcut usually
            hides behind.
          </p>
        </Reveal>

        <ul className="space-y-4">
          {EXCLUDED.map((item, i) => (
            <motion.li
              key={item}
              initial={{ opacity: 1 }}
              whileInView={{ opacity: [1, 1, 0.35] }}
              viewport={{ once: true, margin: "-40% 0px -40% 0px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="font-display text-xl text-ink md:text-2xl"
            >
              <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: "-40% 0px -40% 0px" }}
                transition={{ duration: 0.5, delay: i * 0.08 + 0.1 }}
                className="relative inline-block origin-left"
              >
                {item}
                <motion.span
                  aria-hidden
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, margin: "-40% 0px -40% 0px" }}
                  transition={{ duration: 0.4, delay: i * 0.08 + 0.25 }}
                  className="absolute top-1/2 left-0 h-px w-full origin-left bg-maroon"
                />
              </motion.span>
            </motion.li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
