import type { Metadata } from "next";

import { PageStub } from "@/components/sections/page-stub";

export const metadata: Metadata = {
  title: "Insights",
};

export default function InsightsPage() {
  return (
    <PageStub
      title="Insights"
      description="Tooling explainers, frontier analysis, cross-domain thinking and community spotlights."
      phase="Phase 1.6"
    />
  );
}