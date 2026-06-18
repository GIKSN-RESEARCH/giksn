import type { Metadata } from "next";

import { ContactForm } from "@/components/forms/contact-form";
import { SocialLinks } from "@/components/layout/social-links";
import { Reveal, RevealBlur } from "@/components/motion/reveal";
import { Section, SectionHeading } from "@/components/sections/section";
import { socialLinks } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with GIKSN Research — collaboration, press, or general inquiries.",
};

export default function ContactPage() {
  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <RevealBlur>
            <SectionHeading
              eyebrow="Contact"
              title="Get in touch"
              description="Collaboration proposals, press inquiries, or questions about the lab. For contributor access, use the application flow instead."
              gradient
            />
          </RevealBlur>

          <Reveal className="mt-10">
            <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Elsewhere
            </h2>
            <SocialLinks className="mt-4" variant="text" />
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="underline decoration-muted-foreground/40 hover:decoration-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Reveal>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </Section>
  );
}