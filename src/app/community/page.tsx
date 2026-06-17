import type { Metadata } from "next";

import { PageStub } from "@/components/sections/page-stub";

export const metadata: Metadata = {
  title: "Community",
};

export default function CommunityPage() {
  return (
    <PageStub
      title="Community"
      description="Guidelines, contribution process, public Telegram channel, and how private access works."
      phase="Phase 1.7"
    />
  );
}