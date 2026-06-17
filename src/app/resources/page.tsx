import type { Metadata } from "next";

import { PageStub } from "@/components/sections/page-stub";

export const metadata: Metadata = {
  title: "Resources",
};

export default function ResourcesPage() {
  return (
    <PageStub
      title="Resources"
      description="Curated tooling landscape, reading lists, and explainers — DB-backed from admin."
      phase="Phase 1.6"
    />
  );
}