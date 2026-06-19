import { and, eq, isNotNull, isNull } from "drizzle-orm";

import { db } from "@/db";
import { invitations } from "@/db/schema";
import { logAdminAction } from "@/lib/audit";
import { assignContributorRole } from "@/lib/discord";
import { constantTimeEqual } from "@/lib/tokens";

export async function redeemDiscordAccess({
  discordUserId,
  token,
  oauthAccessToken,
  actorId = "discord-bot",
}: {
  discordUserId: string;
  token?: string;
  oauthAccessToken?: string;
  actorId?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const rows = await db
    .select()
    .from(invitations)
    .where(
      and(
        isNotNull(invitations.acceptedAt),
        isNull(invitations.discordTokenRedeemedAt)
      )
    );

  const invite = token
    ? rows.find((row) =>
        row.discordAccessToken
          ? constantTimeEqual(row.discordAccessToken, token)
          : false
      )
    : null;

  if (token && !invite) {
    return { ok: false, error: "Invalid or already-used Discord token." };
  }

  if (!token && !oauthAccessToken) {
    return { ok: false, error: "Discord access token required." };
  }

  const targetInvite = invite;
  if (!targetInvite) {
    return { ok: false, error: "No matching invitation found." };
  }

  if (targetInvite.expiresAt < new Date()) {
    return { ok: false, error: "Invitation expired." };
  }

  const roleResult = await assignContributorRole(discordUserId, oauthAccessToken);
  if (!roleResult.ok) {
    return { ok: false, error: roleResult.error ?? "Discord role assignment failed." };
  }

  await db
    .update(invitations)
    .set({
      discordUserId,
      discordTokenRedeemedAt: new Date(),
    })
    .where(eq(invitations.id, targetInvite.id));

  await logAdminAction({
    actorId,
    action: "discord.redeem",
    entityType: "invitation",
    entityId: targetInvite.id,
    metadata: { discordUserId },
  });

  return { ok: true };
}

export async function redeemDiscordForContributor({
  userId,
  email,
  oauthAccessToken,
}: {
  userId: string;
  email: string;
  oauthAccessToken: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { fetchDiscordUser } = await import("@/lib/discord");
  const discordUser = await fetchDiscordUser(oauthAccessToken);
  if (!discordUser) {
    return { ok: false, error: "Could not read Discord profile." };
  }

  const [invite] = await db
    .select()
    .from(invitations)
    .where(
      and(
        eq(invitations.email, email),
        isNotNull(invitations.acceptedAt),
        isNull(invitations.discordTokenRedeemedAt)
      )
    )
    .limit(1);

  if (!invite?.discordAccessToken) {
    return { ok: false, error: "No Discord access pending for this account." };
  }

  return redeemDiscordAccess({
    discordUserId: discordUser.id,
    token: invite.discordAccessToken,
    oauthAccessToken,
    actorId: userId,
  });
}