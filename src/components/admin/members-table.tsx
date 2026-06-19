"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { revokeDiscordAccess, setMemberStatus } from "@/actions/members";
import { Button } from "@/components/ui/button";

type MemberRow = {
  userId: string;
  email: string;
  name: string;
  status: string;
  handle: string | null;
  displayName: string | null;
  invitation?: {
    id: string;
    discordUserId: string | null;
    discordTokenRedeemedAt: Date | null;
  } | null;
};

export function MembersTable({ members }: { members: MemberRow[] }) {
  const [isPending, startTransition] = useTransition();

  function toggleStatus(userId: string, current: string) {
    const next = current === "active" ? "suspended" : "active";
    startTransition(async () => {
      const result = await setMemberStatus(userId, next);
      if (!result.success) toast.error(result.error);
      else toast.success(`Member ${next}.`);
    });
  }

  function revokeDiscord(invitationId: string) {
    if (!window.confirm("Revoke Discord role and rotate token?")) return;
    startTransition(async () => {
      const result = await revokeDiscordAccess(invitationId);
      if (!result.success) toast.error(result.error);
      else toast.success("Discord access revoked.");
    });
  }

  if (members.length === 0) {
    return <p className="text-muted-foreground">No contributors provisioned yet.</p>;
  }

  return (
    <div className="space-y-4">
      {members.map((member) => (
        <article key={member.userId} className="rounded-xl border border-border p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">
                {member.displayName ?? member.name}
              </h2>
              <p className="text-sm text-muted-foreground">{member.email}</p>
              {member.handle ? (
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  @{member.handle}
                </p>
              ) : null}
            </div>
            <span className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
              {member.status}
            </span>
          </div>

          {member.invitation ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Discord:{" "}
              {member.invitation.discordTokenRedeemedAt
                ? `connected (${member.invitation.discordUserId})`
                : "not connected"}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => toggleStatus(member.userId, member.status)}
            >
              {member.status === "active" ? "Suspend" : "Restore"}
            </Button>
            {member.invitation ? (
              <Button
                size="sm"
                variant="destructive"
                disabled={isPending}
                onClick={() => revokeDiscord(member.invitation!.id)}
              >
                Revoke Discord
              </Button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}