import type { Metadata } from "next";

import { ContentFilters } from "@/components/content/content-filters";
import { ContentSearch } from "@/components/content/content-search";
import { InsightCard } from "@/components/content/insight-card";
import { Section, SectionHeading } from "@/components/sections/section";
import {
  contentDomains,
  filterByCategory,
  filterByDomain,
  insightCategories,
} from "@/lib/content";
import { getPublishedInsights } from "@/lib/queries/insights";
import { rankAndFilterBySlugs, searchInsights } from "@/lib/search";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Tooling explainers, frontier analysis, cross-domain thinking and community spotlights.",
};

type SearchParams = Promise<{
  category?: string;
  domain?: string;
  q?: string;
}>;

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const all = await getPublishedInsights();
  let items = filterByCategory(
    filterByDomain(all, params.domain),
    params.category
  );

  if (params.q?.trim()) {
    const hits = await searchInsights(params.q);
    items = rankAndFilterBySlugs(items, hits);
  }

  return (
    <Section>
      <SectionHeading
        title="Insights"
        description="Tooling explainers, frontier analysis, cross-domain thinking and community spotlights."
      />

      <div className="mt-6 max-w-2xl">
        <ContentSearch basePath="/insights" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <ContentFilters
          basePath="/insights"
          active={{ category: params.category, domain: params.domain, q: params.q }}
          filters={[
            {
              param: "category",
              label: "Category",
              options: insightCategories.map((category) => ({
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
                ? "No insights published yet."
                : params.q
                  ? `No insights match "${params.q}".`
                  : "No insights match these filters."}
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {items.map((item) => (
                <InsightCard key={item.id} insight={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}