import { db } from "@/db";
import { auditLog } from "@/db/schema";

export async function logAdminAction({
  actorId,
  action,
  entityType,
  entityId,
  metadata = {},
}: {
  actorId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await db.insert(auditLog).values({
      actorId,
      action,
      entityType,
      entityId: entityId ?? null,
      metadata,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("[audit] failed to write entry:", error);
  }
}