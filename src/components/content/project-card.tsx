import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

import { DomainList } from "@/components/content/domain-badge";
import type { Project } from "@/lib/queries/projects";
import { projectStatusStyles } from "@/lib/project-status";
import { cn } from "@/lib/utils";

export function ProjectCard({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) {
  const status = projectStatusStyles[project.status] ?? {
    label: project.status,
    className: "border-border text-muted-foreground",
  };

  return (
    <article
      className={cn(
        "group card-elevated flex h-full flex-col rounded-xl transition-all",
        className
      )}
    >
      <div className="h-px w-full bg-border" aria-hidden />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={cn(
              "rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-widest",
              status.className
            )}
          >
            {status.label}
          </span>
          {project.visibility === "contributor" ? (
            <span className="text-xs text-muted-foreground">Contributor</span>
          ) : null}
        </div>

        <Link href={`/projects/${project.slug}`} className="mt-4 block flex-1">
          <h3 className="text-xl font-semibold text-foreground transition-colors duration-300 group-hover:text-foreground/80">
            {project.title}
          </h3>

          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {project.description}
          </p>
        </Link>

        <DomainList domains={project.domains} className="mt-4" />

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
          {project.repo ? (
            <a
              href={project.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground underline hover:text-foreground"
            >
              <ExternalLink className="size-3.5" aria-hidden />
              Repository
            </a>
          ) : null}
          {project.status === "Open for Contributors" ? (
            <Link
              href="/contribute/apply"
              className="inline-flex items-center gap-1 text-xs font-medium text-foreground"
            >
              Contribute
              <ArrowRight className="size-3" aria-hidden />
            </Link>
          ) : (
            <Link
              href={`/projects/${project.slug}`}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              View project
              <ArrowRight className="size-3" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}