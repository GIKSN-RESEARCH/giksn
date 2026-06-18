import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Send, Shield } from "lucide-react";

import { SocialLinks } from "@/components/layout/social-links";
import { Reveal, RevealBlur, RevealItem, RevealStagger } from "@/components/motion/reveal";
import { Section, SectionHeading } from "@/components/sections/section";
import { Button } from "@/components/ui/button";
import {
  codeOfConductPoints,
  communityEvents,
  communityGuidelines,
  contributionProcess,
  memberSpotlights,
} from "@/lib/marketing";
import { socialLinks, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Community guidelines, contribution process, public Telegram channel, and how private contributor access works.",
};

export default function CommunityPage() {
  const telegram = socialLinks.find((l) => l.label === "Telegram");

  return (
    <>
      <Section>
        <RevealBlur>
          <SectionHeading
            eyebrow="Community"
            title="Public by default, vetted where it matters"
            description={`${site.name} grows through open research and a disciplined contributor path. Public channels are open to everyone; private working groups require vetting and platform-issued access tokens.`}
            align="center"
            gradient
          />
        </RevealBlur>

        <Reveal className="mt-10 flex flex-wrap justify-center gap-3">
          {telegram ? (
            <Button
              render={
                <a
                  href={telegram.href}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              size="lg"
            >
              <Send className="size-4" aria-hidden />
              Join public Telegram
            </Button>
          ) : null}
          <Button render={<Link href="/contribute/apply" />} variant="outline" size="lg">
            Apply to contribute
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </Reveal>
      </Section>

      <Section className="pt-0">
        <Reveal>
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Guidelines
          </h2>
        </Reveal>
        <RevealStagger className="mt-6 grid gap-6 md:grid-cols-2">
          {communityGuidelines.map((item) => (
            <RevealItem key={item.title}>
              <article className="card-elevated h-full rounded-xl p-6">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </article>
            </RevealItem>
          ))}
        </RevealStagger>
      </Section>

      <Section className="pt-0">
        <RevealBlur>
          <SectionHeading
            eyebrow="Contribution"
            title="How to become a vetted contributor"
            description="Private Telegram channels and contributor-only platform content are not open signup. The path is apply → review → invitation → token redemption."
          />
        </RevealBlur>

        <RevealStagger className="mt-8 grid gap-4 sm:grid-cols-2">
          {contributionProcess.map((step) => (
            <RevealItem key={step.step}>
              <div className="glass border-gradient-top h-full rounded-xl p-6">
                <span className="font-mono text-xs text-muted-foreground">
                  {step.step}
                </span>
                <h3 className="mt-2 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealStagger>

        <Reveal className="mt-8">
          <div className="glass-subtle flex flex-col gap-4 rounded-xl p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
              <p className="text-sm leading-relaxed text-muted-foreground">
                Telegram private-channel access uses single-use tokens redeemed through the lab
                bot — not public invite links. Full provisioning ships in Phase 2.
              </p>
            </div>
            <Button render={<Link href="/join" />} variant="outline" size="sm" className="shrink-0">
              Join page
            </Button>
          </div>
        </Reveal>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <Reveal>
              <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Member spotlights
              </h2>
            </Reveal>
            <RevealStagger className="mt-6 space-y-4">
              {memberSpotlights.map((member) => (
                <RevealItem key={member.name}>
                  <article className="card-elevated rounded-xl p-6">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      {member.role}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold">{member.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {member.note}
                    </p>
                  </article>
                </RevealItem>
              ))}
            </RevealStagger>
          </div>

          <div>
            <Reveal>
              <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Events & cadence
              </h2>
            </Reveal>
            <RevealStagger className="mt-6 space-y-4">
              {communityEvents.map((event) => (
                <RevealItem key={event.title}>
                  <article className="glass border-gradient-top rounded-xl p-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-base font-semibold">{event.title}</h3>
                      <span className="text-xs text-muted-foreground">{event.cadence}</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {event.description}
                    </p>
                  </article>
                </RevealItem>
              ))}
            </RevealStagger>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <Reveal>
          <div className="card-elevated mx-auto max-w-3xl rounded-xl p-8">
            <h2 className="text-lg font-semibold">Code of conduct</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {codeOfConductPoints.map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="text-foreground/40" aria-hidden>
                    —
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-border pt-6">
              <SocialLinks />
              <Button render={<Link href="/contact" />} variant="ghost" size="sm">
                Contact the lab
              </Button>
            </div>
          </div>
        </Reveal>
      </Section>

      <Section className="pt-0 pb-24">
        <Reveal className="text-center">
          <Button render={<Link href="/contribute/apply" />} size="lg">
            Start your application
          </Button>
        </Reveal>
      </Section>
    </>
  );
}