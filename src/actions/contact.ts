"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { actionError, type ActionResult } from "@/lib/admin/utils";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth-guard";
import { guardPublicForm } from "@/lib/form-guard";
import { contactLimiter } from "@/lib/ratelimit";

const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(256),
  subject: z.string().max(200).optional(),
  message: z.string().min(10).max(5000),
});

export async function submitContactMessage(
  formData: FormData
): Promise<ActionResult> {
  try {
    if (formData.get("_gotcha")) {
      return { success: true, data: undefined };
    }

    const guard = await guardPublicForm({
      limiter: contactLimiter,
      scope: "contact",
      formData,
    });
    if (!guard.success) {
      return guard;
    }

    const raw = Object.fromEntries(formData);
    const data = contactSchema.parse({
      ...raw,
      subject: raw.subject || undefined,
    });

    await db.insert(contactMessages).values({
      name: data.name,
      email: data.email,
      subject: data.subject ?? null,
      message: data.message,
      handled: false,
      createdAt: new Date(),
    });

    revalidatePath("/admin/contact");

    return { success: true, data: undefined };
  } catch (error) {
    return actionError(error);
  }
}

export async function markContactHandled(
  id: string,
  handled: boolean
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();

    await db
      .update(contactMessages)
      .set({ handled })
      .where(eq(contactMessages.id, id));

    await logAdminAction({
      actorId: session.user.id,
      action: handled ? "contact.handled" : "contact.reopened",
      entityType: "contact_message",
      entityId: id,
    });

    revalidatePath("/admin/contact");

    return { success: true, data: undefined };
  } catch (error) {
    return actionError(error);
  }
}