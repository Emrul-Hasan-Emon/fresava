"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Container } from "./container";
import { JarIllustration } from "./jar-illustration";

export function Hero() {
  const [open, setOpen] = useState(false);

  return (
    <section id="top" className="relative overflow-hidden pt-20 pb-24 md:pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(109,16,35,0.10),transparent)]"
      />
      <Container className="relative flex flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs font-medium tracking-[0.35em] text-maroon"
        >
          FRESAVA SIGNATURE &middot; 240G
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-5 font-display text-5xl leading-[1.05] text-ink sm:text-6xl md:text-7xl"
        >
          Dragon Fruit,
          <br />
          sweetened by honey.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 max-w-xl text-balance text-base text-ink/60 md:text-lg"
        >
          One jar. Two ingredients. Our signature jelly is set from real
          dragon fruit and sweetened only with raw honey — no refined sugar,
          no preservatives, nothing hidden behind a label.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10"
        >
          <JarIllustration open={open} className="h-72 w-auto md:h-80" />
        </motion.div>

        <motion.button
          type="button"
          onClick={() => setOpen((v) => !v)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 rounded-full border border-maroon/30 px-6 py-2.5 text-sm text-maroon transition-colors hover:bg-maroon hover:text-cream-soft"
        >
          {open ? "Close the jar" : "Look inside the jar"}
        </motion.button>

        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-maroon/10 pt-8 text-xs tracking-[0.15em] text-ink/50 uppercase"
        >
          <li>Halal</li>
          <li>Two ingredients</li>
          <li>No refined sugar</li>
          <li>Small batch</li>
          <li>Made in Bangladesh</li>
        </motion.ul>
      </Container>
    </section>
  );
}
