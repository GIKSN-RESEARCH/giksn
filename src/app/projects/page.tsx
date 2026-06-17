import type { Metadata } from "next";

import { PageStub } from "@/components/sections/page-stub";

export const metadata: Metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
  return (
    <PageStub
      title="Projects"
      description="Active initiatives, open contributor slots, goals and outputs."
      phase="Phase 1.6"
    />
  );
}