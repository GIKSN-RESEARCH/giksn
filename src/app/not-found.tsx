import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/sections/section";

export default function NotFound() {
  return (
    <Section>
      <SectionHeading
        title="Page not found"
        description="The page you're looking for doesn't exist or has moved."
      />
      <Button render={<Link href="/" />} className="mt-8">
        Return home
      </Button>
    </Section>
  );
}