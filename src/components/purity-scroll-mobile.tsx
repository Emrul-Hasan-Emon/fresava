"use client";

import { useEffect, useRef, useState } from "react";

const EXCLUSIONS = [
  "Preservatives.",
  "Artificial colours.",
  "Artificial flavours.",
  "Refined sugar.",
];

export function PurityScrollMobile() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => {
      setReduceMotion(media.matches);
    };
    updateMotion();
    media.addEventListener("change", updateMotion);

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const viewport = window.innerHeight;
        const start = viewport * 0.85;
        const end = viewport * 0.15;
        const next = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
        setProgress(next);
      });
    };
    update();

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      media.removeEventListener("change", updateMotion);
    };
  }, []);

  const reveal = (start: number, duration = 0.15) => {
    if (reduceMotion) return 1;
    return Math.min(1, Math.max(0, (progress - start) / duration));
  };

  const finalAmount = reveal(0.68, 0.18);

  return (
    <section
      ref={sectionRef}
      className="bg-[#910b0a] px-6 py-14 text-white sm:py-20 lg:px-12 lg:py-28"
    >
      <div className="mx-auto w-full max-w-[420px] text-center lg:max-w-4xl">
        <p className="text-[0.62rem] font-medium uppercase tracking-[0.18em] text-white/65">
          FRESAVA / THE PURITY EDIT
        </p>

        <h2 className="headline mx-auto mt-4 max-w-[340px] text-[clamp(2rem,8vw,2.7rem)] leading-[1.12] lg:mt-6 lg:max-w-none lg:text-6xl">
          The beauty of what isn&apos;t there.
        </h2>

        <div className="my-7 h-px w-full bg-white/25" />

        <p className="text-[0.65rem] uppercase tracking-[0.17em] text-white/60">
          WE LEFT OUT
        </p>

        <div className="mt-5 space-y-3">
          {EXCLUSIONS.map((item, index) => {
            const amount = reveal(0.08 + index * 0.14, 0.14);
            return (
              <p
                key={item}
                className="text-[1.2rem] font-semibold leading-[1.4] lg:text-2xl"
                style={{
                  opacity: amount,
                  transform: `translateY(${(1 - amount) * 14}px)`,
                }}
              >
                {item}
              </p>
            );
          })}
        </div>

        <div className="my-7 h-px w-full bg-white/25" />

        <div
          style={{
            opacity: finalAmount,
            transform: `translateY(${(1 - finalAmount) * 14}px)`,
          }}
        >
          <p className="text-[0.65rem] uppercase tracking-[0.17em] text-white/60">
            WHAT REMAINS
          </p>
          <h3 className="headline mt-4 text-[clamp(1.9rem,7vw,2.5rem)] leading-tight lg:mt-6 lg:text-5xl">
            Fruit. Honey. Purpose.
          </h3>
        </div>
      </div>
    </section>
  );
}
