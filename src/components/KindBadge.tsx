import type { Kind } from "@/lib/papers";

type Props = {
  kind: Kind;
  size?: "sm" | "md";
  variant?: "outline" | "subtle";
};

export function KindBadge({ kind, size = "sm", variant = "outline" }: Props) {
  const isOriginal = kind === "Original";
  const text = size === "md" ? "text-[12px]" : "text-[10px]";
  const padding = size === "md" ? "px-2 py-0.5" : "px-1.5 py-px";

  const tone = isOriginal
    ? variant === "subtle"
      ? "text-accent-deep bg-accent-wash"
      : "text-accent border border-accent/50"
    : variant === "subtle"
      ? "text-ink bg-tint"
      : "text-ink border border-rule";

  return (
    <span
      className={`inline-flex items-center font-mono uppercase tracking-[0.14em] ${text} ${padding} ${tone}`}
      aria-label={`Kind: ${kind}`}
    >
      {kind}
    </span>
  );
}
