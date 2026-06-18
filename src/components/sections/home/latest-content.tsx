import Link from "next/link";

import { LatestContentView } from "@/components/sections/home/latest-content-view";
import { Section, SectionHeading } from "@/components/sections/section";
import { Button } from "@/components/ui/button";
import { getHomepageContent } from "@/lib/queries/featured";

export async function LatestContent() {
  const items = await getHomepageContent();

  if (items.length === 0) {
    return (
      <Section id="latest" className="pt-0">
        <SectionHeading
          eyebrow="Latest"
          title="Publications & Insights"
          description="Deep-dive research and practitioner-focused explainers from the frontier."
        />
        <p className="mt-8 text-muted-foreground">
          Published content will appear here once you add publications or insights from the admin panel.
        </p>
        <div className="mt-6 flex gap-2">
          <Button render={<Link href="/publications" />} variant="outline" size="sm">
            Publications
          </Button>
          <Button render={<Link href="/insights" />} variant="outline" size="sm">
            Insights
          </Button>
        </div>
      </Section>
    );
  }

  return <LatestContentView items={items} />;
}