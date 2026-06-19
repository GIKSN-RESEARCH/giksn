import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth-guard";
import {
  exchangeDiscordOAuthCode,
  verifyDiscordOAuthState,
} from "@/lib/discord";
import { redeemDiscordForContributor } from "@/lib/discord-redeem";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  if (oauthError) {
    redirect(`/onboarding?error=discord-denied`);
  }

  if (!code || !state) {
    redirect("/onboarding?error=discord-invalid");
  }

  const userId = verifyDiscordOAuthState(state);
  if (!userId) {
    redirect("/onboarding?error=discord-state");
  }

  const session = await getSession();
  if (!session || session.user.id !== userId || session.user.status !== "active") {
    redirect("/sign-in?error=unauthorized");
  }

  const tokenResponse = await exchangeDiscordOAuthCode(code);
  if (!tokenResponse?.access_token) {
    redirect("/onboarding?error=discord-exchange");
  }

  const result = await redeemDiscordForContributor({
    userId: session.user.id,
    email: session.user.email,
    oauthAccessToken: tokenResponse.access_token,
  });

  if (!result.ok) {
    redirect(`/onboarding?error=${encodeURIComponent(result.error)}`);
  }

  redirect("/onboarding?discord=connected");
}