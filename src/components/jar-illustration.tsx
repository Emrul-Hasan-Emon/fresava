"use client";

import { motion } from "framer-motion";

/**
 * Original SVG illustration of the Fresava jar — no photography involved.
 * `open` swaps in a tilted lid + denser seed texture for the "look inside" state.
 */
export function JarIllustration({
  open = false,
  className = "",
}: {
  open?: boolean;
  className?: string;
}) {
  const seeds = Array.from({ length: open ? 46 : 26 }).map((_, i) => {
    const seed = i * 137.5; // golden-angle scatter, deterministic
    const x = 40 + ((seed * 1.618) % 140);
    const y = 150 + ((seed * 2.236) % 130);
    const r = 1 + ((i * 7) % 3) * 0.6;
    return { x, y, r, key: i };
  });

  return (
    <svg
      viewBox="0 0 240 340"
      className={className}
      role="img"
      aria-label="Illustration of a Fresava dragon fruit spread jar"
    >
      <defs>
        <linearGradient id="jam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8f1a2c" />
          <stop offset="100%" stopColor="#4a0a17" />
        </linearGradient>
        <linearGradient id="glass-shine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <clipPath id="jar-body-clip">
          <rect x="46" y="140" width="148" height="164" rx="14" />
        </clipPath>
      </defs>

      {/* jar body outline */}
      <rect
        x="46"
        y="140"
        width="148"
        height="164"
        rx="14"
        fill="#fbf5ee"
        fillOpacity="0.5"
        stroke="#b08a58"
        strokeWidth="1.5"
      />

      {/* jam fill */}
      <g clipPath="url(#jar-body-clip)">
        <rect x="46" y="176" width="148" height="128" fill="url(#jam)" />
        {seeds.map((s) => (
          <circle key={s.key} cx={s.x} cy={s.y} r={s.r} fill="#1a0d0a" opacity={0.7} />
        ))}
      </g>

      {/* glass shine */}
      <rect x="46" y="140" width="148" height="164" rx="14" fill="url(#glass-shine)" />

      {/* label */}
      <rect
        x="58"
        y="206"
        width="124"
        height="56"
        rx="3"
        fill="#f8efe4"
        stroke="#b08a58"
        strokeWidth="1"
      />
      <text
        x="120"
        y="228"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="12.5"
        fill="#4a0a17"
        letterSpacing="1"
      >
        DRAGON FRUIT
      </text>
      <text
        x="120"
        y="242"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="12.5"
        fill="#4a0a17"
        letterSpacing="2"
      >
        &amp; HONEY JELLY
      </text>
      <line x1="96" y1="249" x2="144" y2="249" stroke="#b08a58" strokeWidth="1" />
      <text
        x="120"
        y="257"
        textAnchor="middle"
        fontFamily="var(--font-body)"
        fontSize="5"
        fill="#8a746a"
        letterSpacing="1.5"
      >
        PITAYA · RAW HONEY
      </text>

      {/* neck */}
      <rect x="86" y="118" width="68" height="26" rx="4" fill="#efe1d0" stroke="#b08a58" strokeWidth="1.5" />

      {/* lid */}
      <motion.g
        initial={false}
        animate={
          open
            ? { rotate: -18, x: 58, y: -14 }
            : { rotate: 0, x: 0, y: 0 }
        }
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        style={{ transformOrigin: "120px 108px" }}
      >
        <rect x="78" y="86" width="84" height="30" rx="8" fill="#4a0a17" />
        <rect x="78" y="86" width="84" height="8" rx="4" fill="#6d1023" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line
            key={i}
            x1={86 + i * 13}
            y1="100"
            x2={86 + i * 13}
            y2="112"
            stroke="#2b0710"
            strokeWidth="1.5"
            opacity="0.6"
          />
        ))}
      </motion.g>
    </svg>
  );
}
