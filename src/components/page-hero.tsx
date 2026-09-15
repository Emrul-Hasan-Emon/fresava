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
        "relative flex min-h-[78svh] flex-col items-center justify-center overflow-hidden px-6 pt-28 pb-20 text-center",
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
        <h1 className="headline mt-6 max-w-4xl text-[2.8rem] sm:text-7xl">{title}</h1>
        {sub && (
          <p
            className={cn(
              "mt-7 max-w-xl text-[0.95rem] leading-relaxed",
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
