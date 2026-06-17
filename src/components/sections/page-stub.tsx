import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/sections/section";

export function PageStub({
  title,
  description,
  phase,
}: {
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <Section>
      <SectionHeading title={title} description={description} />
      <p className="mt-8 font-mono text-sm text-muted-foreground">
        Full page ships in {phase}.
      </p>
      <Button render={<Link href="/" />} variant="outline" className="mt-6">
        Back to home
      </Button>
    </Section>
  );
}