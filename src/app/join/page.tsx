import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Send, Shield, Users } from "lucide-react";

import { SocialLinks } from "@/components/layout/social-links";
import { Reveal, RevealBlur, RevealItem, RevealStagger } from "@/components/motion/reveal";
import { Section, SectionHeading } from "@/components/sections/section";
import { Button } from "@/components/ui/button";
import { socialLinks } from "@/lib/site";

export const metadata: Metadata = {
  title: "Join & Contribute",
  description:
    "Join public channels, follow GIKSN Research on social, or apply to contribute as a vetted member.",
};

const contributorSteps = [
  "Submit the application with background, domains, and evidence of deep work",
  "Manual review by the lab — we optimize for people who can continue the research",
  "On acceptance: platform account + Telegram access token for private channels",
] as const;

export default function JoinPage() {
  const telegram = socialLinks.find((l) => l.label === "Telegram");

  return (
    <>
      <Section>
        <RevealBlur>
          <SectionHeading
            eyebrow="Join"
            title="Multiple paths, one standard"
            description="Public channels are open to everyone. Vetted contributor access — private Telegram channels, internal projects — happens only through the application process."
            align="center"
            gradient
          />
        </RevealBlur>
      </Section>

      <Section className="pt-0">
        <RevealStagger className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          <RevealItem>
            <div className="glass border-gradient-top h-full rounded-xl p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <Users className="size-6" aria-hidden />
              </div>
              <h2 className="mt-5 text-xl font-semibold">Public community</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Open discussion, announcements, and links back to publications. No token
                required — start here if you want to follow the work and join the conversation.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {telegram ? (
                  <Button
                    render={
                      <a
                        href={telegram.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                    size="sm"
                  >
                    <Send className="size-4" aria-hidden />
                    Join Telegram
                  </Button>
                ) : null}
                <Button
                  render={<Link href="/community" />}
                  variant="outline"
                  size="sm"
                >
                  Community page
                </Button>
              </div>
              <div className="mt-8 border-t border-border pt-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Follow elsewhere
                </p>
                <SocialLinks className="mt-3" />
              </div>
            </div>
          </RevealItem>

          <RevealItem>
            <div className="card-elevated h-full rounded-xl p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <Shield className="size-6" aria-hidden />
              </div>
              <h2 className="mt-5 text-xl font-semibold">Vetted contributor path</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Propose a project, co-author an explainer, or join a working group after
                review. Approved contributors receive platform accounts and Telegram private
                channel access tokens.
              </p>
              <ol className="mt-6 space-y-3 text-sm text-muted-foreground">
                {contributorSteps.map((step, i) => (
                  <li key={step} className="flex gap-3">
                    <span className="font-mono text-xs text-foreground/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button render={<Link href="/contribute/apply" />} size="sm">
                  Apply to contribute
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
                <Button
                  render={<Link href="/sign-in" />}
                  variant="ghost"
                  size="sm"
                >
                  Sign in
                </Button>
              </div>
            </div>
          </RevealItem>
        </RevealStagger>
      </Section>

      <Section className="pt-0 pb-24">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm text-muted-foreground">
              Newsletter signup and contact live on{" "}
              <Link href="/contact" className="underline hover:text-foreground">
                Contact
              </Link>
              . Spam protection and rate limiting ship in Phase 2.
            </p>
          </div>
        </Reveal>
      </Section>
    </>
  );
}