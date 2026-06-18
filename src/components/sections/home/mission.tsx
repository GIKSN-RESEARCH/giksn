import Link from "next/link";

import { RevealBlur, RevealItem, RevealStagger } from "@/components/motion/reveal";
import { DomainArt } from "@/components/sections/home/domain-art";
import { Section, SectionHeading } from "@/components/sections/section";
import { researchDomains, values } from "@/lib/site";

export function Mission() {
  return (
    <Section id="mission" className="overflow-hidden">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Left: only text */}
        <div className="lg:col-span-5 flex flex-col">
          <RevealBlur className="shrink-0">
            <SectionHeading
              eyebrow="Mission, Vision & Pillars"
              title="Frontier research, explained clearly"
              description="GIKSN Research is a frontier tech research lab. We work across AGI, Deeptech, Hardware and Distributed Systems, both as distinct fields and at the points where they overlap, because the hardest and most useful problems usually live in between.
              
              We do two things in parallel. We pursue open research that we build and publish in full. We also write clear explanations of the tools, systems and ideas that already exist, so the frontier is legible to the people building on it.
              
              We are community-first execution based lab. We grow as the work earns it and stay transparent about being early."
              gradient
            />
          </RevealBlur>

          <RevealBlur className="mt-27 flex-1 rounded-xl border border-border bg-black p-6 sm:p-8">
            <p className="text-md leading-relaxed text-muted-foreground">
              We are transparent about our bootstrap stage: the lab grows through a
              community of people who can actually understand and continue the
              research. Funding follows demonstrated maturity and tangible output —
              not the other way around.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {values.map((value, i) => (
                <span key={value} className="flex items-center gap-3">
                  <span className="text-sm font-medium tracking-wide text-muted-foreground">
                    {value}
                  </span>
                  {i < values.length - 1 && (
                    <span className="text-muted-foreground/40" aria-hidden>
                      ·
                    </span>
                  )}
                </span>
              ))}
            </div>
          </RevealBlur>
        </div>

        {/* Right: 4 boxes using the kept Pillars design exactly */}
        <div className="lg:col-span-7">
          <RevealStagger className="grid gap-6 lg:grid-cols-2">
            {researchDomains.map((domain, i) => {
              const isLarge = i < 2;

              return (
                <RevealItem key={domain.id}>
                  <Link
                    href="/research"
                    className="group card-elevated flex h-full flex-col overflow-hidden rounded-xl"
                  >
                    <div
                      className={`relative flex items-center justify-center overflow-hidden border-b border-border text-foreground bg-black ${
                        isLarge ? "h-44 min-h-70" : "h-36"
                      }`}
                    >
                      <div className="relative">
                        <DomainArt id={domain.id} />
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="text-xl font-semibold text-foreground">
                        {domain.title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {domain.focus}
                      </p>
                      <span className="mt-4 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                        Learn more →
                      </span>
                    </div>
                  </Link>
                </RevealItem>
              );
            })}
          </RevealStagger>
        </div>
      </div>
    </Section>
  );
}