"use client";

import Link from "next/link";

import { DomainList } from "@/components/content/domain-badge";
import { Button } from "@/components/ui/button";
import { Reveal, RevealItem, RevealStagger } from "@/components/motion/reveal";
import { Section, SectionHeading } from "@/components/sections/section";
import type { HomepageContentItem } from "@/lib/queries/featured";

function itemHref(item: HomepageContentItem) {
  if (item.isPreview) {
    return item.kind === "publication" ? "/publications" : "/insights";
  }

  return item.kind === "publication"
    ? `/publications/${item.slug}`
    : `/insights/${item.slug}`;
}

function itemLabel(item: HomepageContentItem) {
  return item.kind === "publication" ? "Publication" : "Insight";
}

function BentoCard({
  item,
  size,
}: {
  item: HomepageContentItem;
  size: "featured" | "compact";
}) {
  const isFeatured = size === "featured";

  return (
    <Link
      href={itemHref(item)}
      className="group card-elevated relative flex h-full flex-col overflow-hidden rounded-xl transition-all"
    >
      <div className="h-px w-full bg-border" aria-hidden />

      <div
        className={`relative flex flex-1 flex-col ${isFeatured ? "p-8" : "p-6"}`}
      >
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {itemLabel(item)}
          {item.isPreview ? (
            <span className="ml-2 text-foreground/40">· Preview</span>
          ) : null}
        </p>
        <h3
          className={`font-semibold text-foreground transition-colors duration-300 group-hover:text-foreground/80 ${
            isFeatured ? "mt-3 text-2xl" : "mt-2 text-lg"
          }`}
        >
          {item.title}
        </h3>
        <p
          className={`mt-2 flex-1 leading-relaxed text-muted-foreground ${
            isFeatured ? "text-sm sm:text-base" : "text-sm"
          }`}
        >
          {item.excerpt}
        </p>
        <DomainList
          domains={item.domains}
          className={isFeatured ? "mt-5" : "mt-4"}
        />
      </div>
    </Link>
  );
}

export function LatestContentView({
  items,
  usingPreview = false,
}: {
  items: HomepageContentItem[];
  usingPreview?: boolean;
}) {
  const [featured, ...rest] = items;

  if (!featured) {
    return null;
  }

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

      {usingPreview ? (
        <Reveal className="mt-4">
          <p className="text-sm text-muted-foreground">
            Publish from the admin panel to replace these preview cards with live
            research.
          </p>
        </Reveal>
      ) : null}

      <RevealStagger className="mt-10 grid gap-6 md:grid-cols-3">
        <RevealItem className="md:col-span-2 md:row-span-2">
          <BentoCard item={featured} size="featured" />
        </RevealItem>

        <div className="flex flex-col gap-6">
          {rest.map((item) => (
            <RevealItem key={`${item.kind}-${item.slug || item.title}`}>
              <BentoCard item={item} size="compact" />
            </RevealItem>
          ))}
        </div>
      </RevealStagger>
    </Section>
  );
}