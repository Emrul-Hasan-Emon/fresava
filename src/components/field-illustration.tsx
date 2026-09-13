export function FieldIllustration({ className = "" }: { className?: string }) {
  const posts = Array.from({ length: 7 }).map((_, i) => 40 + i * 55);

  return (
    <svg
      viewBox="0 0 480 260"
      className={className}
      preserveAspectRatio="xMidYMax slice"
      role="img"
      aria-label="Illustration of a dragon fruit trellis field at dusk"
    >
      <defs>
        <linearGradient id="dusk-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a0a17" />
          <stop offset="55%" stopColor="#8f1a2c" />
          <stop offset="100%" stopColor="#c9713a" />
        </linearGradient>
        <linearGradient id="dusk-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a0a12" />
          <stop offset="100%" stopColor="#210509" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="480" height="260" fill="url(#dusk-sky)" />
      <circle cx="240" cy="120" r="46" fill="#f4c98f" opacity="0.85" />
      <rect x="0" y="190" width="480" height="70" fill="url(#dusk-ground)" />

      {posts.map((x, i) => (
        <g key={i} opacity={0.9}>
          <rect x={x - 3} y="120" width="6" height="90" fill="#1c0508" />
          <rect x={x - 26} y="112" width="52" height="8" rx="3" fill="#1c0508" />
          {[0, 1, 2].map((j) => (
            <path
              key={j}
              d={`M${x} ${128 + j * 16} q ${14 + i} ${10} 0 22 q -${14 + i} -10 0 -22`}
              fill="#2f7a4f"
              opacity={0.85}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}
