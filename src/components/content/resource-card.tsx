import { DomainList } from "@/components/content/domain-badge";
import type { Resource } from "@/lib/queries/resources";
import { cn } from "@/lib/utils";

export function ResourceCard({
  resource,
  className,
}: {
  resource: Resource;
  className?: string;
}) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group card-elevated block rounded-xl transition-all",
        className
      )}
    >
      <div className="h-px w-full bg-border" aria-hidden />
      <div className="p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {resource.category}
        </p>

        <h3 className="mt-3 text-xl font-semibold text-foreground transition-colors duration-300 group-hover:text-foreground/80">
          {resource.title}
          <span className="ml-1 text-muted-foreground" aria-hidden>
            ↗
          </span>
        </h3>

        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {resource.summary}
        </p>

        <DomainList domains={resource.domains} className="mt-4" />
      </div>
    </a>
  );
}