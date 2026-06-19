"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

type DiscordOnboardingProps = {
  configured: boolean;
  redeemed: boolean;
  accessToken: string | null;
  publicUrl: string | null;
  guildName: string;
  connected?: boolean;
  error?: string | null;
};

export function DiscordOnboarding({
  configured,
  redeemed,
  accessToken,
  publicUrl,
  guildName,
  connected,
  error,
}: DiscordOnboardingProps) {
  return (
    <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-5">
      <span className="font-mono text-xs text-muted-foreground">02</span>
      <h2 className="mt-1 text-base font-semibold">Connect Discord for private channels</h2>
      <p className="mt-2 text-muted-foreground">
        Join the {guildName} server and get the contributor role. One-click OAuth is the
        fastest path; use <code className="text-foreground">/redeem</code> in the server if
        needed.
      </p>

      {connected ? (
        <p className="mt-4 text-sm text-green-500">Discord connected — contributor role granted.</p>
      ) : null}
      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

      {publicUrl ? (
        <Link
          href={publicUrl}
          target="_blank"
          className="mt-4 inline-block text-sm underline"
        >
          Open public Discord ↗
        </Link>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3">
        {configured && !redeemed ? (
          <Button render={<a href="/api/discord/connect" />} size="sm">
            Connect Discord
          </Button>
        ) : null}
        {redeemed ? (
          <span className="text-sm text-green-500">Discord access active</span>
        ) : null}
      </div>

      {!redeemed && accessToken ? (
        <div className="mt-4">
          <p className="text-xs text-muted-foreground">
            Or run <code>/redeem token:…</code> in Discord with:
          </p>
          <code className="mt-2 block break-all rounded-lg bg-muted px-4 py-3 font-mono text-sm text-cyan-300">
            {accessToken}
          </code>
        </div>
      ) : null}

      {!configured ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Discord bot not configured yet — set DISCORD_* env vars in production.
        </p>
      ) : null}
    </div>
  );
}