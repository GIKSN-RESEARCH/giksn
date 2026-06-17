export function DomainArt({ id }: { id: string }) {
  switch (id) {
    case "agi":
      return (
        <div className="relative flex items-center justify-center" aria-hidden>
          <div className="absolute size-20 rounded-full border border-foreground/15" />
          <div className="absolute size-14 rounded-full border border-foreground/25" />
          <div className="absolute size-8 rounded-full border border-foreground/40" />
        </div>
      );

    case "deeptech":
      return (
        <div className="relative flex items-center justify-center" aria-hidden>
          <div className="size-12 rotate-45 rounded-sm border border-foreground/50" />
        </div>
      );

    case "hardware":
      return (
        <div className="grid grid-cols-3 gap-1.5" aria-hidden>
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="size-3 rounded-[2px] bg-foreground"
              style={{ opacity: 0.2 + (i % 3) * 0.15 }}
            />
          ))}
        </div>
      );

    case "distributed":
      return (
        <div className="relative size-16" aria-hidden>
          <svg
            className="absolute inset-0"
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.3"
          >
            <line x1="32" y1="8" x2="8" y2="32" />
            <line x1="32" y1="8" x2="56" y2="32" />
            <line x1="8" y1="32" x2="32" y2="56" />
            <line x1="56" y1="32" x2="32" y2="56" />
          </svg>
          {[
            [32, 8],
            [8, 32],
            [56, 32],
            [32, 56],
          ].map(([cx, cy], i) => (
            <div
              key={i}
              className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/70"
              style={{ left: cx, top: cy }}
            />
          ))}
        </div>
      );

    default:
      return null;
  }
}
