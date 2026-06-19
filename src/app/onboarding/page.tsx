import type { Metadata } from "next";
import Link from "next/link";

import { getOnboardingDetails } from "@/actions/invitations";
import { DiscordOnboarding } from "@/components/onboarding/discord-onboarding";
import { Section } from "@/components/sections/section";
import { community } from "@/lib/community";
import { requireContributor } from "@/lib/auth-guard";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contributor onboarding",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{
    discord?: string;
    error?: string;
  }>;
}) {
  await requireContributor();
  const details = await getOnboardingDetails();
  const params = await searchParams;

  const discordError = params.error
    ? decodeURIComponent(params.error).replace(/-/g, " ")
    : null;

  return (
    <Section className="max-w-2xl">
      <h1 className="text-3xl font-bold">Welcome to {site.name}</h1>
      <p className="mt-2 text-muted-foreground">
        Your contributor account is active. Connect Discord to join private channels.
      </p>

      <div className="mt-8 space-y-6 text-sm">
        <div className="rounded-xl border border-border p-5">
          <span className="font-mono text-xs text-muted-foreground">01</span>
          <h2 className="mt-1 text-base font-semibold">Join the public community</h2>
          <p className="mt-2 text-muted-foreground">
            Open discussion and announcements — no token required.
          </p>
          {details.publicDiscordUrl ? (
            <Link
              href={details.publicDiscordUrl}
              target="_blank"
              className="mt-3 inline-block underline"
            >
              Open Discord ↗
            </Link>
          ) : null}
        </div>

        <DiscordOnboarding
          configured={details.discordConfigured}
          redeemed={details.discordRedeemed}
          accessToken={details.discordAccessToken}
          publicUrl={details.publicDiscordUrl}
          guildName={community.discordGuildName}
          connected={params.discord === "connected"}
          error={discordError}
        />

        <div className="rounded-xl border border-border p-5">
          <span className="font-mono text-xs text-muted-foreground">03</span>
          <h2 className="mt-1 text-base font-semibold">Explore contributor content</h2>
          <p className="mt-2 text-muted-foreground">
            Contributor-only projects and working-group coordination live on the platform
            and in private Discord channels.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/projects" className="underline">
              Projects
            </Link>
            <Link href="/community" className="underline">
              Community
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}