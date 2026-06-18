import type { Metadata } from "next";

import { ContentFilters } from "@/components/content/content-filters";
import { ResourceCard } from "@/components/content/resource-card";
import { Section, SectionHeading } from "@/components/sections/section";
import {
  contentDomains,
  filterByDomain,
  filterByResourceCategory,
  uniqueCategories,
} from "@/lib/content";
import { getPublishedResources } from "@/lib/queries/resources";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Curated tooling landscape, reading lists, and explainers — maintained from admin.",
};

type SearchParams = Promise<{
  category?: string;
  domain?: string;
}>;

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const all = await getPublishedResources();
  const items = filterByResourceCategory(
    filterByDomain(all, params.domain),
    params.category
  );
  const categories = uniqueCategories(all);

  return (
    <Section>
      <SectionHeading
        title="Resources"
        description="Curated tooling landscape, reading lists, and explainers — updated from the admin panel without redeploys."
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <ContentFilters
          basePath="/resources"
          active={{ category: params.category, domain: params.domain }}
          filters={[
            {
              param: "category",
              label: "Category",
              options: categories.map((category) => ({
                label: category,
                value: category,
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
          {items.length === 0 ? (
            <p className="text-muted-foreground">
              {all.length === 0
                ? "No resources published yet."
                : "No resources match these filters."}
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {items.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}