import { Resend } from "resend";
import type { ReactElement } from "react";

import { site } from "@/lib/site";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const from = process.env.EMAIL_FROM ?? `hello@${new URL(site.url).hostname}`;

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

export async function sendTransactionalEmail({
  to,
  subject,
  react,
}: {
  to: string | string[];
  subject: string;
  react: ReactElement;
}): Promise<{ sent: boolean }> {
  if (!resend) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[email:dev]", { to, subject });
    }
    return { sent: false };
  }

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    react,
  });

  if (error) {
    console.error("[email] send failed:", error.message);
    return { sent: false };
  }

  return { sent: true };
}