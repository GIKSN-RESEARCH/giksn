import type { Metadata } from "next";
import Link from "next/link";

import { getOnboardingDetails } from "@/actions/invitations";
import { Section } from "@/components/sections/section";
import { requireContributor } from "@/lib/auth-guard";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contributor onboarding",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage() {
  await requireContributor();
  const details = await getOnboardingDetails();

  return (
    <Section className="max-w-2xl">
      <h1 className="text-3xl font-bold">Welcome to {site.name}</h1>
      <p className="mt-2 text-muted-foreground">
        Your contributor account is active. Complete Telegram setup to join private
        channels.
      </p>

      <ol className="mt-8 space-y-6 text-sm">
        <li className="rounded-xl border border-border p-5">
          <span className="font-mono text-xs text-muted-foreground">01</span>
          <h2 className="mt-1 text-base font-semibold">Join the public channel</h2>
          <p className="mt-2 text-muted-foreground">
            Open discussion and announcements — no token required.
          </p>
          {details.publicChannelUrl ? (
            <Link
              href={details.publicChannelUrl}
              target="_blank"
              className="mt-3 inline-block underline"
            >
              Open public Telegram ↗
            </Link>
          ) : null}
        </li>

        <li className="rounded-xl border border-border p-5">
          <span className="font-mono text-xs text-muted-foreground">02</span>
          <h2 className="mt-1 text-base font-semibold">Redeem your Telegram access token</h2>
          <p className="mt-2 text-muted-foreground">
            Message{" "}
            {details.botUsername ? (
              <a
                href={`https://t.me/${details.botUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                @{details.botUsername}
              </a>
            ) : (
              "the lab Telegram bot"
            )}{" "}
            and send this token once. It binds to your Telegram user ID and adds you to
            private channels.
          </p>
          {details.telegramAccessToken ? (
            <code className="mt-4 block break-all rounded-lg bg-muted px-4 py-3 font-mono text-sm text-cyan-300">
              {details.telegramAccessToken}
            </code>
          ) : (
            <p className="mt-4 text-muted-foreground">No active token found.</p>
          )}
          {details.telegramRedeemed ? (
            <p className="mt-3 text-green-500">Telegram token already redeemed.</p>
          ) : null}
        </li>

        <li className="rounded-xl border border-border p-5">
          <span className="font-mono text-xs text-muted-foreground">03</span>
          <h2 className="mt-1 text-base font-semibold">Explore contributor content</h2>
          <p className="mt-2 text-muted-foreground">
            Contributor-only projects and working-group coordination unlock on the
            platform and in private Telegram channels.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/projects" className="underline">
              Projects
            </Link>
            <Link href="/community" className="underline">
              Community
            </Link>
          </div>
        </li>
      </ol>
    </Section>
  );
}