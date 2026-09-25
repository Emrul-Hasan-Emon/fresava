"use client";
import { useEffect, useRef, useState } from "react";
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (preference.matches) ref.current?.pause();
      else void ref.current?.play().catch(() => {});
    };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  return (
    <div className="relative z-10 mt-10">
      <video
        ref={ref}
        src="/images/dragonfruit-honesty.mp4"
        poster="/images/jar-hero.png"
        muted
        loop
        playsInline
        preload="metadata"
        className="h-[42vh] w-auto object-contain sm:h-[50vh]"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        aria-label="Fresava dragon fruit spread"
      />
      <button
        type="button"
        className="mt-3 rounded-full border border-crimson/20 px-4 py-2 text-xs text-crimson"
        onClick={() => {
          if (playing) ref.current?.pause();
          else void ref.current?.play().catch(() => {});
        }}
      >
        {playing ? "Pause animation" : "Play animation"}
      </button>
    </div>
  );
}
