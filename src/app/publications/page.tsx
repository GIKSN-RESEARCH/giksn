import type { Metadata } from "next";

import { ContentFilters } from "@/components/content/content-filters";
import { ContentSearch } from "@/components/content/content-search";
import { PublicationCard } from "@/components/content/publication-card";
import { Section, SectionHeading } from "@/components/sections/section";
import {
  contentDomains,
  filterByDomain,
  filterByType,
  publicationTypes,
} from "@/lib/content";
import { getPublishedPublications } from "@/lib/queries/publications";
import { rankAndFilterBySlugs, searchPublications } from "@/lib/search";

export const metadata: Metadata = {
  title: "Publications",
  description:
    "Filterable research output — papers, reports, preprints and explainers.",
};

type SearchParams = Promise<{
  type?: string;
  domain?: string;
  q?: string;
}>;

export default async function PublicationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const all = await getPublishedPublications();
  let pubs = filterByType(
    filterByDomain(all, params.domain),
    params.type
  );

  if (params.q?.trim()) {
    const hits = await searchPublications(params.q);
    pubs = rankAndFilterBySlugs(pubs, hits);
  }

  return (
    <Section>
      <SectionHeading
        title="Publications"
        description="Research output: papers, reports, preprints and clear explainers."
      />

      <div className="mt-6 max-w-2xl">
        <ContentSearch basePath="/publications" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <ContentFilters
          basePath="/publications"
          active={{ type: params.type, domain: params.domain, q: params.q }}
          filters={[
            {
              param: "type",
              label: "Type",
              options: publicationTypes.map((type) => ({
                label: type,
                value: type,
              })),
            },
            {
              param: "domain",
              label: "Domain",
              options: contentDomains.map((domain) => ({
                label: domain,
                value: domain,
              })),
            },
          ]}
        />

        <div>
          {pubs.length === 0 ? (
            <p className="text-muted-foreground">
              {all.length === 0
                ? "No publications published yet. Check back soon."
                : params.q
                  ? `No publications match "${params.q}".`
                  : "No publications match these filters."}
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {pubs.map((pub) => (
                <PublicationCard key={pub.id} publication={pub} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}