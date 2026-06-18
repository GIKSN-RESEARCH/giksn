import type { Metadata } from "next";
import Link from "next/link";

import { ApplyForm } from "@/components/forms/apply-form";
import { Reveal, RevealBlur } from "@/components/motion/reveal";
import { Section, SectionHeading } from "@/components/sections/section";

export const metadata: Metadata = {
  title: "Apply to Contribute",
  description:
    "Apply to contribute to GIKSN Research. Vetted contributors only — show evidence of deep work across our research domains.",
};

export default function ApplyPage() {
  return (
    <Section>
      <div className="mx-auto max-w-2xl">
        <RevealBlur>
          <SectionHeading
            eyebrow="Contribute"
            title="Apply to contribute"
            description="Vetted contributors only. Tell us about your background, domain interests, and evidence that you understand the kind of research this lab does."
          />
        </RevealBlur>

        <p className="mt-6 text-sm text-muted-foreground">
          Not ready to apply?{" "}
          <Link href="/join" className="underline hover:text-foreground">
            Join public channels
          </Link>{" "}
          first — no account required.
        </p>

        <Reveal className="mt-8">
          <ApplyForm />
        </Reveal>
      </div>
    </Section>
  );
}