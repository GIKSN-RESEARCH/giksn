import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth-guard";
import {
  buildDiscordOAuthUrl,
  isDiscordConfigured,
  signDiscordOAuthState,
} from "@/lib/discord";

export async function GET() {
  if (!isDiscordConfigured()) {
    redirect("/onboarding?error=discord-not-configured");
  }

  const session = await getSession();
  if (!session || session.user.status !== "active") {
    redirect("/sign-in?error=unauthorized");
  }

  const state = signDiscordOAuthState(session.user.id);
  redirect(buildDiscordOAuthUrl(state));
}