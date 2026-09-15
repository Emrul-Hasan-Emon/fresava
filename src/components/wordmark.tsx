import { cn } from "@/lib/cn";

export function Wordmark({
  className,
  tagline = false,
  size = "md",
}: {
  className?: string;
  tagline?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-5xl sm:text-7xl",
  } as const;
  return (
    <div className={cn("flex flex-col items-center leading-none", className)}>
      <span className={cn("wordmark", sizes[size])}>FRESAVA</span>
      {tagline && (
        <span className="mt-3 text-[0.55rem] tracking-[0.38em] uppercase opacity-70 sm:text-[0.68rem]">
          Made Halal &middot; Made Clean &middot; Made Fresava
        </span>
      )}
    </div>
  );
}
