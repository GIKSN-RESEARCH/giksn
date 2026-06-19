"use server";

import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { applications, invitations, profiles, user } from "@/db/schema";
import { actionError, slugFromTitle, type ActionResult } from "@/lib/admin/utils";
import { logAdminAction } from "@/lib/audit";
import { getSession, requireContributor } from "@/lib/auth-guard";

export async function getInvitationByToken(token: string) {
  const [invite] = await db
    .select()
    .from(invitations)
    .where(eq(invitations.token, token))
    .limit(1);

  return invite ?? null;
}

export async function redeemInvitation(
  token: string
): Promise<ActionResult<{ redirectTo: string }>> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Sign in first to redeem your invitation." };
    }

    const [invite] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.token, token),
          isNull(invitations.acceptedAt),
          gt(invitations.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!invite) {
      return { success: false, error: "Invitation is invalid or expired." };
    }

    if (session.user.email.toLowerCase() !== invite.email.toLowerCase()) {
      return {
        success: false,
        error: `Sign in with ${invite.email} to redeem this invitation.`,
      };
    }

    const [existingProfile] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.userId, session.user.id))
      .limit(1);

    if (existingProfile) {
      return { success: false, error: "Your contributor account is already active." };
    }

    let application:
      | {
          name: string;
          domains: string[];
          links: Record<string, string> | null;
        }
      | undefined;

    if (invite.applicationId) {
      const [app] = await db
        .select({
          name: applications.name,
          domains: applications.domains,
          links: applications.links,
        })
        .from(applications)
        .where(eq(applications.id, invite.applicationId))
        .limit(1);
      application = app;
    }

    let handle = slugFromTitle(application?.name ?? session.user.name ?? "member");
    let suffix = 2;
    while (true) {
      const [collision] = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.handle, handle))
        .limit(1);
      if (!collision) break;
      handle = `${slugFromTitle(application?.name ?? "member")}-${suffix++}`;
    }

    await db
      .update(user)
      .set({
        role: "contributor",
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id));

    await db.insert(profiles).values({
      userId: session.user.id,
      handle,
      displayName: application?.name ?? session.user.name,
      bio: null,
      domains: application?.domains ?? [],
      links: application?.links ?? {},
      joinedAt: new Date(),
    });

    await db
      .update(invitations)
      .set({ acceptedAt: new Date() })
      .where(eq(invitations.id, invite.id));

    if (invite.applicationId) {
      await db
        .update(applications)
        .set({ status: "accepted" })
        .where(eq(applications.id, invite.applicationId));
    }

    await logAdminAction({
      actorId: session.user.id,
      action: "invitation.redeem",
      entityType: "invitation",
      entityId: invite.id,
    });

    return { success: true, data: { redirectTo: "/onboarding" } };
  } catch (error) {
    return actionError(error);
  }
}

export async function getOnboardingDetails() {
  const session = await requireContributor();

  const [invite] = await db
    .select()
    .from(invitations)
    .where(
      and(
        eq(invitations.email, session.user.email),
        gt(invitations.acceptedAt, new Date(0))
      )
    )
    .orderBy(desc(invitations.acceptedAt))
    .limit(1);

  const { isDiscordConfigured, getPublicDiscordUrl } = await import("@/lib/discord");

  return {
    discordAccessToken: invite?.discordAccessToken ?? null,
    discordRedeemed: Boolean(invite?.discordTokenRedeemedAt),
    discordConfigured: isDiscordConfigured(),
    publicDiscordUrl: getPublicDiscordUrl(),
  };
}

export async function requireOnboardingOrRedirect() {
  const session = await requireContributor();
  const [profile] = await db
    .select({ handle: profiles.handle })
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1);

  if (!profile) {
    redirect("/sign-in");
  }

  return { session, profile };
}