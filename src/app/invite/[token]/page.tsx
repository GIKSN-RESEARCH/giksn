import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getInvitationByToken } from "@/actions/invitations";
import { InviteRedeemForm } from "@/components/forms/invite-redeem-form";
import { SignInForm } from "@/app/sign-in/sign-in-form";
import { Section } from "@/components/sections/section";
import { getSession } from "@/lib/auth-guard";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Redeem invitation",
  robots: { index: false, follow: false },
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await getInvitationByToken(token);

  if (!invite) notFound();

  const expired = invite.expiresAt < new Date();
  const redeemed = Boolean(invite.acceptedAt);
  const session = await getSession();
  const emailMatches =
    session?.user.email.toLowerCase() === invite.email.toLowerCase();

  return (
    <Section className="max-w-lg">
      <h1 className="text-3xl font-bold">Contributor invitation</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {site.name} — redeem with <strong>{invite.email}</strong>
      </p>

      {expired ? (
        <p className="mt-8 text-destructive">
          This invitation expired on {invite.expiresAt.toLocaleDateString()}. Contact
          the lab if you need a new one.
        </p>
      ) : redeemed ? (
        <div className="mt-8 space-y-4">
          <p className="text-muted-foreground">This invitation was already redeemed.</p>
          <Link href="/onboarding" className="underline">
            Go to onboarding →
          </Link>
        </div>
      ) : session && emailMatches ? (
        <div className="mt-8">
          <p className="mb-4 text-sm text-muted-foreground">
            Signed in as {session.user.email}. Complete setup to activate your
            contributor account.
          </p>
          <InviteRedeemForm token={token} />
        </div>
      ) : session && !emailMatches ? (
        <p className="mt-8 text-destructive">
          You are signed in as {session.user.email}, but this invitation is for{" "}
          {invite.email}. Sign out and try again with the correct email.
        </p>
      ) : (
        <div className="mt-8 space-y-6">
          <p className="text-sm text-muted-foreground">
            Sign in with GitHub or a magic link using the invited email address.
          </p>
          <SignInForm callbackURL={`/invite/${token}`} presetEmail={invite.email} />
        </div>
      )}
    </Section>
  );
}