/** User-facing community is Discord-only. Telegram integration remains in server code only. */
export const community = {
  primary: "discord" as const,
  discordUrl: process.env.NEXT_PUBLIC_DISCORD_URL ?? null,
  discordGuildName: process.env.NEXT_PUBLIC_DISCORD_GUILD_NAME ?? "GIKSN Research",
} as const;

export function getPublicCommunityUrl(): string | null {
  return community.discordUrl;
}

export function getPublicCommunityLabel(): string {
  return "Discord";
}