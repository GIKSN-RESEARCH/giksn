"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { invitations, profiles, user } from "@/db/schema";
import { actionError, type ActionResult } from "@/lib/admin/utils";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth-guard";
import { removeUserFromPrivateChannels } from "@/lib/telegram";
import { generateSecureToken } from "@/lib/tokens";

export async function setMemberStatus(
  userId: string,
  status: "active" | "suspended"
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();

    await db
      .update(user)
      .set({ status, updatedAt: new Date() })
      .where(eq(user.id, userId));

    await logAdminAction({
      actorId: session.user.id,
      action: `member.${status}`,
      entityType: "user",
      entityId: userId,
    });

    revalidatePath("/admin/members");
    return { success: true, data: undefined };
  } catch (error) {
    return actionError(error);
  }
}

export async function revokeTelegramAccess(
  invitationId: string
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();

    const [invite] = await db
      .select()
      .from(invitations)
      .where(eq(invitations.id, invitationId))
      .limit(1);

    if (!invite) {
      return { success: false, error: "Invitation not found." };
    }

    if (invite.telegramUserId) {
      await removeUserFromPrivateChannels(invite.telegramUserId);
    }

    const newToken = generateSecureToken(24);

    await db
      .update(invitations)
      .set({
        telegramAccessToken: newToken,
        telegramUserId: null,
        telegramTokenRedeemedAt: null,
      })
      .where(eq(invitations.id, invitationId));

    await logAdminAction({
      actorId: session.user.id,
      action: "telegram.revoke",
      entityType: "invitation",
      entityId: invitationId,
      metadata: { previousTelegramUserId: invite.telegramUserId },
    });

    revalidatePath("/admin/members");
    return { success: true, data: undefined };
  } catch (error) {
    return actionError(error);
  }
}

export async function listMembersForAdmin() {
  await requireAdmin();

  const rows = await db
    .select({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      handle: profiles.handle,
      displayName: profiles.displayName,
      domains: profiles.domains,
      joinedAt: profiles.joinedAt,
    })
    .from(user)
    .leftJoin(profiles, eq(profiles.userId, user.id))
    .where(eq(user.role, "contributor"));

  const inviteRows = await db.select().from(invitations);

  return rows.map((row) => ({
    ...row,
    invitation: inviteRows.find(
      (inv) => inv.email.toLowerCase() === row.email.toLowerCase()
    ),
  }));
}