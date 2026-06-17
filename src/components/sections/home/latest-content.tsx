import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal, RevealItem, RevealStagger } from "@/components/motion/reveal";
import { Section, SectionHeading } from "@/components/sections/section";

const featuredItems = [
  {
    type: "Insight" as const,
    title: "Mapping the AGI tooling landscape",
    excerpt:
      "A practitioner's guide to what exists today, what is hype, and what actually ships.",
    domains: ["AGI", "Tooling"],
    href: "/insights",
  },
  {
    type: "Publication" as const,
    title: "Hardware–software co-design for edge inference",
    excerpt:
      "How substrate choices reshape what models can run where — and why it matters for AGI paths.",
    domains: ["Hardware", "AGI"],
    href: "/publications",
  },
  {
    type: "Insight" as const,
    title: "Distributed systems as research infrastructure",
    excerpt:
      "Why open, fault-tolerant coordination layers are prerequisites for community-scale research.",
    domains: ["Distributed Systems"],
    href: "/insights",
  },
] as const;

export function LatestContent() {
  const [featured, ...rest] = featuredItems;

  return (
    <Section id="latest">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <Reveal>
          <SectionHeading
            eyebrow="Latest"
            title="Publications & Insights"
            description="Deep-dive research and practitioner-focused explainers from the frontier."
          />
        </Reveal>
        <Reveal className="flex shrink-0 gap-2">
          <Button render={<Link href="/publications" />} variant="outline" size="sm">
            All publications
          </Button>
          <Button render={<Link href="/insights" />} variant="outline" size="sm">
            All insights
          </Button>
        </Reveal>
      </div>

      <RevealStagger className="mt-10 grid gap-6 md:grid-cols-3">
        <RevealItem className="md:col-span-2">
          <Link
            href={featured.href}
            className="group card-elevated relative flex h-full flex-col overflow-hidden rounded-xl transition-all"
          >
            <div className="h-px w-full bg-border" aria-hidden />

            <div className="relative flex flex-1 flex-col p-8">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {featured.type}
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-foreground transition-colors duration-300 group-hover:text-foreground/80">
                {featured.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {featured.excerpt}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {featured.domains.map((d) => (
                  <Badge
                    key={d}
                    variant="outline"
                    className="border-border text-muted-foreground"
                  >
                    <span
                      className="mr-1 inline-block size-1.5 rounded-full bg-foreground/50"
                      aria-hidden
                    />
                    {d}
                  </Badge>
                ))}
              </div>
            </div>
          </Link>
        </RevealItem>

        <div className="flex flex-col gap-6">
          {rest.map((item) => (
            <RevealItem key={item.title}>
              <Link
                href={item.href}
                className="group card-elevated relative flex h-full flex-col overflow-hidden rounded-xl transition-all"
              >
                <div className="h-px w-full bg-border" aria-hidden />

                <div className="relative flex flex-1 flex-col p-6">
                  <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    {item.type}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground transition-colors duration-300 group-hover:text-foreground/80">
                    {item.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {item.excerpt}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {item.domains.map((d) => (
                      <Badge
                        key={d}
                        variant="outline"
                        className="border-border text-muted-foreground"
                      >
                        <span
                          className="mr-1 inline-block size-1.5 rounded-full bg-foreground/50"
                          aria-hidden
                        />
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Link>
            </RevealItem>
          ))}
        </div>
      </RevealStagger>
    </Section>
  );
}