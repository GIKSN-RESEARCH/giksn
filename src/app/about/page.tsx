import type { Metadata } from "next";

import { PageStub } from "@/components/sections/page-stub";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <PageStub
      title="About"
      description="Founding principles, cross-domain vision, and the long-term roadmap."
      phase="Phase 1.7"
    />
  );
}