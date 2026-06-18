import Link from "next/link";

import { DomainList } from "@/components/content/domain-badge";
import type { Publication } from "@/lib/queries/publications";
import { cn } from "@/lib/utils";

export function PublicationCard({
  publication,
  className,
}: {
  publication: Publication;
  className?: string;
}) {
  return (
    <Link
      href={`/publications/${publication.slug}`}
      className={cn(
        "group card-elevated block rounded-xl transition-all",
        className
      )}
    >
      <div className="h-px w-full bg-border" aria-hidden />
      <div className="p-6">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <span>{publication.type}</span>
          {publication.publishedAt ? (
            <span>• {new Date(publication.publishedAt).toLocaleDateString()}</span>
          ) : null}
        </div>

        <h3 className="mt-3 text-xl font-semibold text-foreground transition-colors duration-300 group-hover:text-foreground/80">
          {publication.title}
        </h3>

        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {publication.abstract}
        </p>

        <DomainList domains={publication.domains} className="mt-4" />
      </div>
    </Link>
  );
}