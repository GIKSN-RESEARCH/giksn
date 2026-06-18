import type { Metadata } from "next";
import Link from "next/link";

import { ProjectCard } from "@/components/content/project-card";
import { Section, SectionHeading } from "@/components/sections/section";
import { isActiveContributor, getSession } from "@/lib/auth-guard";
import { getVisibleProjects } from "@/lib/queries/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Active research programs, open calls for contributors, and completed work.",
};

export default async function ProjectsPage() {
  const session = await getSession();
  const isContributor = session ? isActiveContributor(session) : false;
  const items = await getVisibleProjects(isContributor);

  return (
    <Section>
      <SectionHeading
        title="Projects"
        description="Active research programs, open calls for contributors, and completed work."
      />

      {isContributor ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Signed in as contributor — including contributor-only projects.
        </p>
      ) : null}

      {items.length === 0 ? (
        <p className="mt-8 text-muted-foreground">
          No public projects listed yet.{" "}
          <Link href="/contribute/apply" className="underline">
            Apply to contribute
          </Link>
          .
        </p>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {items.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </Section>
  );
}