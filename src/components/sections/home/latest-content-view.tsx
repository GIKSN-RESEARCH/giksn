"use client";

import Link from "next/link";

import { DomainList } from "@/components/content/domain-badge";
import { Button } from "@/components/ui/button";
import { Reveal, RevealItem, RevealStagger } from "@/components/motion/reveal";
import { Section, SectionHeading } from "@/components/sections/section";
import type { HomepageContentItem } from "@/lib/queries/featured";

function itemHref(item: HomepageContentItem) {
  return item.kind === "publication"
    ? `/publications/${item.slug}`
    : `/insights/${item.slug}`;
}

function itemLabel(item: HomepageContentItem) {
  return item.kind === "publication" ? "Publication" : "Insight";
}

export function LatestContentView({ items }: { items: HomepageContentItem[] }) {
  const [featured, ...rest] = items;

  return (
    <Section id="latest" className="pt-0">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <Reveal>
          <SectionHeading
            eyebrow="Latest"
            title="Publications & Insights"
            description="Deep-dive research and practitioner-focused explainers from the frontier."
          />
        </Reveal>
        <Reveal className="flex shrink-0 gap-2">
          <Button
            render={<Link href="/publications" />}
            variant="outline"
            size="sm"
          >
            All publications
          </Button>
          <Button
            render={<Link href="/insights" />}
            variant="outline"
            size="sm"
          >
            All insights
          </Button>
        </Reveal>
      </div>

      <RevealStagger className="mt-4 grid gap-6 md:grid-cols-3">
        <RevealItem className="md:col-span-2">
          <Link
            href={itemHref(featured)}
            className="group card-elevated relative flex h-full flex-col overflow-hidden rounded-xl transition-all"
          >
            <div className="h-px w-full bg-border" aria-hidden />

            <div className="relative flex flex-1 flex-col p-8">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {itemLabel(featured)}
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-foreground transition-colors duration-300 group-hover:text-foreground/80">
                {featured.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {featured.excerpt}
              </p>
              <DomainList domains={featured.domains} className="mt-5" />
            </div>
          </Link>
        </RevealItem>

        <div className="flex flex-col gap-6">
          {rest.map((item) => (
            <RevealItem key={`${item.kind}-${item.slug}`}>
              <Link
                href={itemHref(item)}
                className="group card-elevated relative flex h-full flex-col overflow-hidden rounded-xl transition-all"
              >
                <div className="h-px w-full bg-border" aria-hidden />

                <div className="relative flex flex-1 flex-col p-6">
                  <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    {itemLabel(item)}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground transition-colors duration-300 group-hover:text-foreground/80">
                    {item.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {item.excerpt}
                  </p>
                  <DomainList domains={item.domains} className="mt-4" />
                </div>
              </Link>
            </RevealItem>
          ))}
        </div>
      </RevealStagger>
    </Section>
  );
}