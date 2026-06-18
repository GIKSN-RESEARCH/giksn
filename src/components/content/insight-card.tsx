import Link from "next/link";

import { DomainList } from "@/components/content/domain-badge";
import type { Insight } from "@/lib/queries/insights";
import { cn } from "@/lib/utils";

export function InsightCard({
  insight,
  className,
}: {
  insight: Insight;
  className?: string;
}) {
  return (
    <Link
      href={`/insights/${insight.slug}`}
      className={cn(
        "group card-elevated block rounded-xl transition-all",
        className
      )}
    >
      <div className="h-px w-full bg-border" aria-hidden />
      <div className="p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {insight.category}
        </p>

        <h3 className="mt-3 text-xl font-semibold text-foreground transition-colors duration-300 group-hover:text-foreground/80">
          {insight.title}
        </h3>

        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {insight.excerpt}
        </p>

        <DomainList domains={insight.domains} className="mt-4" />
      </div>
    </Link>
  );
}