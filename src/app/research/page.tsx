import type { Metadata } from "next";
import Link from "next/link";

import { DomainArt } from "@/components/sections/home/domain-art";
import { Reveal, RevealBlur, RevealItem, RevealStagger } from "@/components/motion/reveal";
import { Section, SectionHeading } from "@/components/sections/section";
import { Button } from "@/components/ui/button";
import {
  openQuestions,
  researchDomains,
  researchMethodology,
} from "@/lib/marketing";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Research pillars, methodology, and how standalone and correlated research happens at GIKSN.",
};

export default function ResearchPage() {
  return (
    <>
      <Section>
        <RevealBlur>
          <SectionHeading
            eyebrow="Research"
            title="Four domains. One lab. Explicit correlations."
            description="We study AGI, Deeptech, Hardware and Distributed Systems as first-class fields — and we publish work at their intersections when that is where the insight lives."
            gradient
          />
        </RevealBlur>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-6 lg:grid-cols-2">
          {[researchMethodology.standalone, researchMethodology.correlated].map(
            (block) => (
              <Reveal key={block.title}>
                <article className="glass-subtle h-full rounded-xl p-6 sm:p-8">
                  <h2 className="text-lg font-semibold">{block.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {block.description}
                  </p>
                </article>
              </Reveal>
            )
          )}
        </div>
      </Section>

      <Section className="pt-0">
        <Reveal>
          <SectionHeading
            eyebrow="Pillars"
            title="Domain depth"
            description="Each pillar has its own focus area, publication stream, and — where relevant — active projects."
          />
        </Reveal>

        <RevealStagger className="mt-8 grid gap-6 md:grid-cols-2">
          {researchDomains.map((domain) => (
            <RevealItem key={domain.id}>
              <article className="card-elevated overflow-hidden rounded-xl">
                <div className="relative flex h-40 items-center justify-center border-b border-border bg-black">
                  <DomainArt id={domain.id} />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold">{domain.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {domain.description}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">Current focus: </span>
                    {domain.focus}
                  </p>
                </div>
              </article>
            </RevealItem>
          ))}
        </RevealStagger>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <RevealBlur>
              <SectionHeading
                eyebrow="Open questions"
                title="What we are actively probing"
                description="Founding-stage honesty: these are live questions, not solved marketing claims. Publications and insights document progress as it happens."
              />
            </RevealBlur>
          </div>

          <div className="lg:col-span-7">
            <RevealStagger className="space-y-4">
              {openQuestions.map((question) => (
                <RevealItem key={question}>
                  <div className="glass-subtle rounded-xl p-5 text-sm leading-relaxed text-muted-foreground">
                    {question}
                  </div>
                </RevealItem>
              ))}
            </RevealStagger>
          </div>
        </div>
      </Section>

      <Section className="pt-0 pb-24">
        <Reveal>
          <div className="card-elevated rounded-2xl p-8">
            <h2 className="text-2xl font-semibold">Read the output</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              All long-form content is DB-backed — publish from admin, read on the public site
              without redeploys.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button render={<Link href="/publications" />} variant="outline">
                Publications
              </Button>
              <Button render={<Link href="/insights" />} variant="outline">
                Insights
              </Button>
              <Button render={<Link href="/projects" />}>Projects</Button>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}