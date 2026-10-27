import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function PageHero({
  eyebrow,
  title,
  sub,
  image,
  dark = false,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: string;
  image?: string;
  dark?: boolean;
  children?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "relative flex min-h-[78svh] flex-col items-center justify-center overflow-hidden px-5 pt-24 pb-10 text-center sm:px-6 sm:pt-28 sm:pb-20",
        dark ? "bg-crimson-dark text-cream" : "bg-cream text-ink"
      )}
    >
      {image && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className={cn("absolute inset-0", dark ? "bg-crimson-dark/62" : "bg-cream/72")}
          />
        </>
      )}
      <div className="relative z-10 flex flex-col items-center">
        <p className={cn("eyebrow", dark ? "text-cream/60" : "text-crimson/70")}>{eyebrow}</p>
        <h1 className="headline mt-6 max-w-4xl text-[clamp(1.85rem,7.5vw,2.2rem)] leading-[1.12] sm:text-7xl sm:leading-normal">{title}</h1>
        {sub && (
          <p
            className={cn(
              "mt-4 max-w-[330px] text-[0.95rem] leading-relaxed sm:mt-7 sm:max-w-xl",
              dark ? "text-cream/70" : "text-ink/60"
            )}
          >
            {sub}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
