import type { Metadata } from "next";

import { PageStub } from "@/components/sections/page-stub";

export const metadata: Metadata = {
  title: "Publications",
};

export default function PublicationsPage() {
  return (
    <PageStub
      title="Publications"
      description="Filterable, searchable research output — papers, reports, preprints and explainers."
      phase="Phase 1.6"
    />
  );
}