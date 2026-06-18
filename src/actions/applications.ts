"use server";

import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { applications, invitations } from "@/db/schema";
import { ApplicationReceivedEmail } from "@/emails/application-received";
import { ApplicationRejectedEmail } from "@/emails/application-rejected";
import { ApplicationWaitlistedEmail } from "@/emails/application-waitlisted";
import { ContributorInvitationEmail } from "@/emails/contributor-invitation";
import { NewApplicationAdminEmail } from "@/emails/new-application-admin";
import { actionError, type ActionResult } from "@/lib/admin/utils";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth-guard";
import { getAdminEmails, sendTransactionalEmail } from "@/lib/email";
import { generateSecureToken } from "@/lib/tokens";
import { getTelegramBotUsername } from "@/lib/telegram";
import { guardPublicForm } from "@/lib/form-guard";
import { applicationLimiter } from "@/lib/ratelimit";
import { researchDomains, site } from "@/lib/site";

const ALLOWED_DOMAIN_TITLES: string[] = researchDomains.map((d) => d.title);

const optionalUrl = z
  .string()
  .optional()
  .transform((v) => (v?.trim() ? v.trim() : undefined))
  .pipe(z.union([z.string().url(), z.undefined()]));

const applySchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(256),
  domains: z
    .array(z.string())
    .min(1, "Select at least one domain")
    .refine(
      (domains) => domains.every((d) => ALLOWED_DOMAIN_TITLES.includes(d)),
      "Invalid domain selection"
    ),
  background: z.string().min(50).max(5000),
  motivation: z.string().min(50).max(5000),
  evidence: z.string().min(30).max(5000),
  github: optionalUrl,
  scholar: optionalUrl,
  x: optionalUrl,
  portfolio: optionalUrl,
  referral: z.string().max(200).optional(),
});

const MAX_CV_BYTES = 5 * 1024 * 1024;
const ALLOWED_CV_TYPES = new Set(["application/pdf"]);

async function uploadCv(file: File): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "CV upload is not configured. Submit without a CV or contact us directly."
    );
  }

  if (!ALLOWED_CV_TYPES.has(file.type)) {
    throw new Error("CV must be a PDF file.");
  }

  if (file.size > MAX_CV_BYTES) {
    throw new Error("CV must be 5 MB or smaller.");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const key = `applications/cv/${Date.now()}-${safeName}`;

  const blob = await put(key, file, {
    access: "public",
    token,
  });

  return blob.url;
}

async function notifyApplicationEmails({
  name,
  email,
  domains,
}: {
  name: string;
  email: string;
  domains: string[];
}) {
  const adminUrl = `${site.url}/admin/applications`;

  await Promise.allSettled([
    sendTransactionalEmail({
      to: email,
      subject: `Application received — ${site.name}`,
      react: ApplicationReceivedEmail({ name }),
    }),
    ...getAdminEmails().map((adminEmail) =>
      sendTransactionalEmail({
        to: adminEmail,
        subject: `New application: ${name}`,
        react: NewApplicationAdminEmail({
          applicantName: name,
          applicantEmail: email,
          domains,
          adminUrl,
        }),
      })
    ),
  ]);
}

export async function submitApplication(
  formData: FormData
): Promise<ActionResult> {
  try {
    if (formData.get("_gotcha")) {
      return { success: true, data: undefined };
    }

    const guard = await guardPublicForm({
      limiter: applicationLimiter,
      scope: "application",
      formData,
    });
    if (!guard.success) {
      return guard;
    }

    const domains = formData
      .getAll("domains")
      .map((value) => String(value).trim())
      .filter(Boolean);

    const parsed = applySchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      domains,
      background: formData.get("background"),
      motivation: formData.get("motivation"),
      evidence: formData.get("evidence"),
      github: formData.get("github") || undefined,
      scholar: formData.get("scholar") || undefined,
      x: formData.get("x") || undefined,
      portfolio: formData.get("portfolio") || undefined,
      referral: formData.get("referral") || undefined,
    });

    const cvFile = formData.get("cv");
    let cvUrl: string | null = null;

    if (cvFile instanceof File && cvFile.size > 0) {
      cvUrl = await uploadCv(cvFile);
    }

    const links = {
      ...(parsed.github ? { github: parsed.github } : {}),
      ...(parsed.scholar ? { scholar: parsed.scholar } : {}),
      ...(parsed.x ? { x: parsed.x } : {}),
      ...(parsed.portfolio ? { portfolio: parsed.portfolio } : {}),
    };

    await db.insert(applications).values({
      name: parsed.name,
      email: parsed.email,
      domains: parsed.domains,
      background: parsed.background,
      cvUrl,
      links,
      motivation: parsed.motivation,
      evidence: parsed.evidence,
      referral: parsed.referral?.trim() || null,
      status: "pending",
      reviewerNotes: null,
      reviewedBy: null,
      reviewedAt: null,
      createdAt: new Date(),
    });

    revalidatePath("/admin/applications");

    void notifyApplicationEmails({
      name: parsed.name,
      email: parsed.email,
      domains: parsed.domains,
    });

    return { success: true, data: undefined };
  } catch (error) {
    return actionError(error);
  }
}

const INVITE_TTL_DAYS = 7;

export async function reviewApplication({
  id,
  decision,
  reviewerNotes,
}: {
  id: string;
  decision: "accept" | "reject" | "waitlist";
  reviewerNotes?: string;
}): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const actorId = session.user.id;

    const [app] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, id))
      .limit(1);

    if (!app) {
      return { success: false, error: "Application not found." };
    }

    if (["accepted", "under_review", "rejected", "waitlisted"].includes(app.status)) {
      return { success: false, error: `Application already reviewed (${app.status}).` };
    }

    const now = new Date();
    const notes = reviewerNotes?.trim() || null;

    if (decision === "accept") {
      const platformToken = generateSecureToken();
      const telegramToken = generateSecureToken(24);
      const expiresAt = new Date(now.getTime() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);
      const inviteUrl = `${site.url}/invite/${platformToken}`;

      await db.insert(invitations).values({
        email: app.email,
        token: platformToken,
        telegramAccessToken: telegramToken,
        role: "contributor",
        applicationId: app.id,
        expiresAt,
        createdAt: now,
      });

      await db
        .update(applications)
        .set({
          status: "under_review",
          reviewerNotes: notes,
          reviewedBy: actorId,
          reviewedAt: now,
        })
        .where(eq(applications.id, id));

      await sendTransactionalEmail({
        to: app.email,
        subject: `Contributor invitation — ${site.name}`,
        react: ContributorInvitationEmail({
          name: app.name,
          inviteUrl,
          telegramToken,
          botUsername: getTelegramBotUsername() ?? undefined,
          expiresAt: expiresAt.toLocaleDateString(),
        }),
      });

      await logAdminAction({
        actorId,
        action: "application.accept",
        entityType: "application",
        entityId: id,
      });
    } else {
      const status = decision === "reject" ? "rejected" : "waitlisted";

      await db
        .update(applications)
        .set({
          status,
          reviewerNotes: notes,
          reviewedBy: actorId,
          reviewedAt: now,
        })
        .where(eq(applications.id, id));

      await sendTransactionalEmail({
        to: app.email,
        subject:
          decision === "reject"
            ? `Application update — ${site.name}`
            : `Application waitlisted — ${site.name}`,
        react:
          decision === "reject"
            ? ApplicationRejectedEmail({ name: app.name })
            : ApplicationWaitlistedEmail({ name: app.name }),
      });

      await logAdminAction({
        actorId,
        action: `application.${decision}`,
        entityType: "application",
        entityId: id,
      });
    }

    revalidatePath("/admin/applications");
    revalidatePath("/admin/members");

    return { success: true, data: undefined };
  } catch (error) {
    return actionError(error);
  }
}