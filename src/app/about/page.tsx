import type { Metadata } from "next";
import Link from "next/link";

import { Reveal, RevealBlur, RevealItem, RevealStagger } from "@/components/motion/reveal";
import { Section, SectionHeading } from "@/components/sections/section";
import { Button } from "@/components/ui/button";
import {
  foundingPrinciples,
  roadmapPhases,
  values,
} from "@/lib/marketing";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Founding principles, cross-domain vision, and the long-term roadmap for GIKSN Research.",
};

export default function AboutPage() {
  return (
    <>
      <Section>
        <RevealBlur>
          <SectionHeading
            eyebrow="About"
            title="Independent. Open. Ambitious."
            description={`${site.name} is a community-first frontier research lab. We pursue open research across AGI, Deeptech, Hardware and Distributed Systems — standalone and at their intersections — while making the existing tooling landscape legible to builders.`}
            gradient
          />
        </RevealBlur>
      </Section>

      <Section className="pt-0">
        <Reveal>
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Founding principles
          </h2>
        </Reveal>
        <RevealStagger className="mt-6 grid gap-6 md:grid-cols-2">
          {foundingPrinciples.map((principle) => (
            <RevealItem key={principle.title}>
              <article className="card-elevated h-full rounded-xl p-6">
                <div className="h-px w-full bg-border" aria-hidden />
                <h3 className="mt-4 text-lg font-semibold">{principle.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {principle.description}
                </p>
              </article>
            </RevealItem>
          ))}
        </RevealStagger>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <RevealBlur>
            <SectionHeading
              eyebrow="Vision"
              title="Why cross-domain correlations matter"
              description="Most labs pick one lane. GIKSN is built for the seams: where reasoning models meet silicon economics, where deeptech substrates change what AGI can run at the edge, where distributed coordination becomes research infrastructure rather than an afterthought."
            />
          </RevealBlur>

          <Reveal>
            <div className="glass-subtle rounded-xl p-6 sm:p-8">
              <p className="text-sm leading-relaxed text-muted-foreground">
                We tag and link work across domains so readers can follow a thread from
                explainer to publication to active project. Correlated research is not a
                marketing phrase — it is how we choose problems, staff working groups, and
                publish.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {values.map((value, i) => (
                  <span key={value} className="flex items-center gap-3">
                    <span className="text-sm font-medium tracking-wide text-muted-foreground">
                      {value}
                    </span>
                    {i < values.length - 1 ? (
                      <span className="text-muted-foreground/40" aria-hidden>
                        ·
                      </span>
                    ) : null}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section className="pt-0">
        <Reveal>
          <SectionHeading
            eyebrow="Roadmap"
            title="Where we are headed"
            description="A transparent path from bootstrap lab to operational research hub — without pretending we are further along than we are."
          />
        </Reveal>

        <RevealStagger className="mt-8 grid gap-6 lg:grid-cols-3">
          {roadmapPhases.map((phase) => (
            <RevealItem key={phase.phase}>
              <article className="glass h-full rounded-xl p-6">
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {phase.phase}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{phase.title}</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {phase.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-foreground/50" aria-hidden>
                        —
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </RevealItem>
          ))}
        </RevealStagger>
      </Section>

      <Section className="pt-0 pb-24">
        <Reveal>
          <div className="card-elevated flex flex-col items-start justify-between gap-6 rounded-2xl p-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-semibold">Explore the work</h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Read publications and insights, browse active projects, or apply to contribute
                if you can continue the research.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button render={<Link href="/research" />} variant="outline">
                Research pillars
              </Button>
              <Button render={<Link href="/contribute/apply" />}>
                Apply to contribute
              </Button>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}