import type { Metadata } from "next";

import { PageStub } from "@/components/sections/page-stub";

export const metadata: Metadata = {
  title: "Join",
};

export default function JoinPage() {
  return (
    <PageStub
      title="Join & Contribute"
      description="Public Telegram, social channels, newsletter, and the path to vetted contribution."
      phase="Phase 1.7"
    />
  );
}