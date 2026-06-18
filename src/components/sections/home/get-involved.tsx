import { ArrowRight, Mail, Send } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Reveal, RevealBlur, RevealItem, RevealStagger } from "@/components/motion/reveal";
import { Section, SectionHeading } from "@/components/sections/section";
import { socialLinks } from "@/lib/site";

const paths = [
  {
    icon: Send,
    title: "Join public Telegram",
    description:
      "Open discussion, announcements and links back to publications. No token required.",
    href: socialLinks[0].href,
    external: true,
  },
  {
    icon: Mail,
    title: "Subscribe for insights",
    description:
      "Stay updated with research drops, explainers and frontier analysis.",
    href: "/contact",
    external: false,
  },
  {
    icon: ArrowRight,
    title: "Apply to contribute",
    description:
      "Propose a project, co-author an explainer, or join a working group — after vetting.",
    href: "/contribute/apply",
    external: false,
  },
] as const;

export function GetInvolved() {
  return (
    <Section id="get-involved" className="overflow-hidden pt-0" fullBleed>
      <div className="relative w-full site-gutter-x">
        <RevealBlur>
          <SectionHeading
            eyebrow="Get Involved"
            title="Multiple paths, one standard"
            description="Follow the work, discuss in public channels, or apply to contribute. Execution-focused contribution is vetted — we optimize for people who can do the research."
            align="center"
            gradient
          />
        </RevealBlur>

        <RevealStagger className="mx-auto mt-4 grid max-w-4xl gap-6 sm:grid-cols-3">
          {paths.map((path) => {
            const Icon = path.icon;
            return (
              <RevealItem key={path.title}>
                <Link
                  href={path.href}
                  target={path.external ? "_blank" : undefined}
                  rel={path.external ? "noopener noreferrer" : undefined}
                  className="glass border-gradient-top group flex h-full flex-col rounded-xl p-8 transition-all duration-300 hover:border-foreground/20"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-foreground">
                    <Icon className="size-6" aria-hidden />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-foreground">
                    {path.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {path.description}
                  </p>

                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Learn more
                    <ArrowRight className="size-3" />
                  </span>
                </Link>
              </RevealItem>
            );
          })}
        </RevealStagger>

        <Reveal className="mt-14 text-center">
          <Button render={<Link href="/contribute/apply" />} size="lg">
            Start Contributing
          </Button>
        </Reveal>
      </div>
    </Section>
  );
}