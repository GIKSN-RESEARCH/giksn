import type { Metadata } from "next";

import { PageStub } from "@/components/sections/page-stub";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <PageStub
      title="Contact"
      description="Get in touch with GIKSN Research."
      phase="Phase 1.7"
    />
  );
}