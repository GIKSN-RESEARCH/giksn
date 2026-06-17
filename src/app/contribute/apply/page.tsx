import type { Metadata } from "next";

import { PageStub } from "@/components/sections/page-stub";

export const metadata: Metadata = {
  title: "Apply",
};

export default function ApplyPage() {
  return (
    <PageStub
      title="Apply to Contribute"
      description="The access wall starts here — expertise, evidence of understanding, and motivation."
      phase="Phase 1.8"
    />
  );
}