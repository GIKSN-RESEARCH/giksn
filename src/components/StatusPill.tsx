import type { Status } from "@/lib/papers";
import { statusTone } from "@/lib/papers";

type Props = {
  status: Status;
  size?: "sm" | "md";
};

export function StatusPill({ status, size = "sm" }: Props) {
  const tone = statusTone(status);

  const colorByTone = {
    live: "text-accent",
    neutral: "text-ink-soft",
    settled: "text-ink",
  } as const;

  const dotByTone = {
    live: "bg-accent",
    neutral: "bg-ink-soft/50",
    settled: "bg-ink",
  } as const;

  const textSize = size === "md" ? "text-[12px]" : "text-[11px]";

  return (
    <span
      className={`inline-flex items-center gap-2 font-mono uppercase tracking-[0.14em] ${textSize} ${colorByTone[tone]}`}
    >
      <span
        aria-hidden
        className={`inline-block h-[7px] w-[7px] rounded-full ${dotByTone[tone]}`}
      />
      {status}
    </span>
  );
}
