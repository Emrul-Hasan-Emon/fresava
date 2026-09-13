export function DragonFruitIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 240"
      className={className}
      role="img"
      aria-label="Illustration of a halved dragon fruit"
    >
      <defs>
        <radialGradient id="pitaya-flesh" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#fdf1f4" />
          <stop offset="70%" stopColor="#f6d9e2" />
          <stop offset="100%" stopColor="#e8b6c8" />
        </radialGradient>
      </defs>

      {/* skin */}
      <path
        d="M120 18c46 0 78 40 78 92s-32 112-78 112-78-60-78-112 32-92 78-92z"
        fill="#c81f3f"
      />
      {/* leathery scale flicks around the rind */}
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * Math.PI * 2;
        const cx = 120 + Math.cos(angle) * 96;
        const cy = 132 + Math.sin(angle) * 108;
        return (
          <path
            key={i}
            d={`M${cx} ${cy} l6 -10 l6 10 z`}
            fill="#2f7a4f"
            transform={`rotate(${(angle * 180) / Math.PI + 90} ${cx} ${cy})`}
          />
        );
      })}

      {/* flesh */}
      <ellipse cx="120" cy="132" rx="66" ry="88" fill="url(#pitaya-flesh)" />

      {/* seeds */}
      {Array.from({ length: 60 }).map((_, i) => {
        const seed = i * 137.5;
        const r = 60 * Math.sqrt((i * 0.0167) % 1);
        const theta = seed * (Math.PI / 180);
        const x = 120 + r * Math.cos(theta);
        const y = 132 + r * Math.sin(theta) * 1.2;
        return <circle key={i} cx={x} cy={y} r="1.8" fill="#241512" />;
      })}
    </svg>
  );
}
