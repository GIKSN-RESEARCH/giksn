"use server";

import { desc, eq } from "drizzle-orm";
import { del } from "@vercel/blob";

import { db } from "@/db";
import { media } from "@/db/schema";
import { actionError, type ActionResult } from "@/lib/admin/utils";
import { requireAdmin } from "@/lib/auth-guard";

export async function listMedia(): Promise<ActionResult<typeof media.$inferSelect[]>> {
  try {
    await requireAdmin();
    const rows = await db.select().from(media).orderBy(desc(media.createdAt));
    return { success: true, data: rows };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteMedia(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    const [row] = await db.select().from(media).where(eq(media.id, id)).limit(1);
    if (!row) {
      return { success: false, error: "Media not found" };
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (token) {
      try {
        await del(row.url, { token });
      } catch {
        // Blob may already be gone; still remove DB row
      }
    }

    await db.delete(media).where(eq(media.id, id));
    return { success: true, data: undefined };
  } catch (error) {
    return actionError(error);
  }
}