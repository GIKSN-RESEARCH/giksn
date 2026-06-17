import type { Metadata } from "next";

import { PageStub } from "@/components/sections/page-stub";

export const metadata: Metadata = {
  title: "Research",
};

export default function ResearchPage() {
  return (
    <PageStub
      title="Research"
      description="Pillars, methodology, and how standalone and correlated research happens at GIKSN."
      phase="Phase 1.7"
    />
  );
}