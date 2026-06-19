import { createHmac, timingSafeEqual } from "crypto";

import { site } from "@/lib/site";

const API_BASE = "https://discord.com/api/v10";

export function isDiscordConfigured(): boolean {
  return Boolean(
    process.env.DISCORD_BOT_TOKEN &&
      process.env.DISCORD_CLIENT_ID &&
      process.env.DISCORD_CLIENT_SECRET &&
      process.env.DISCORD_GUILD_ID &&
      process.env.DISCORD_CONTRIBUTOR_ROLE_ID
  );
}

export function getPublicDiscordUrl(): string | null {
  return process.env.NEXT_PUBLIC_DISCORD_URL ?? null;
}

function botToken(): string | null {
  return process.env.DISCORD_BOT_TOKEN ?? null;
}

function redirectUri(): string {
  return `${site.url}/api/discord/callback`;
}

export function signDiscordOAuthState(userId: string): string {
  const secret = process.env.BETTER_AUTH_SECRET ?? "dev-discord-state";
  const issuedAt = Date.now().toString();
  const payload = `${userId}.${issuedAt}`;
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyDiscordOAuthState(state: string): string | null {
  const secret = process.env.BETTER_AUTH_SECRET ?? "dev-discord-state";
  const parts = state.split(".");
  if (parts.length !== 3) return null;

  const [userId, issuedAt, signature] = parts;
  const payload = `${userId}.${issuedAt}`;
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");

  try {
    if (
      signature.length !== expected.length ||
      !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    ) {
      return null;
    }
  } catch {
    return null;
  }

  const ageMs = Date.now() - Number(issuedAt);
  if (Number.isNaN(ageMs) || ageMs > 15 * 60 * 1000) {
    return null;
  }

  return userId;
}

export function buildDiscordOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: "identify guilds.join",
    state,
    prompt: "consent",
  });

  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

export async function exchangeDiscordOAuthCode(code: string): Promise<{
  access_token: string;
  token_type: string;
} | null> {
  const response = await fetch(`${API_BASE}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(),
    }),
  });

  if (!response.ok) return null;
  return response.json();
}

export async function fetchDiscordUser(accessToken: string): Promise<{
  id: string;
  username: string;
} | null> {
  const response = await fetch(`${API_BASE}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) return null;
  return response.json();
}

async function discordBotRequest(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const token = botToken();
  if (!token) {
    throw new Error("Discord bot not configured");
  }

  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

export async function addMemberToGuild(
  discordUserId: string,
  userOAuthToken: string
): Promise<boolean> {
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!guildId) return false;

  const response = await discordBotRequest(`/guilds/${guildId}/members/${discordUserId}`, {
    method: "PUT",
    body: JSON.stringify({ access_token: userOAuthToken }),
  });

  return response.status === 201 || response.status === 204;
}

export async function assignContributorRole(
  discordUserId: string,
  userOAuthToken?: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isDiscordConfigured()) {
    return { ok: false, error: "Discord not configured" };
  }

  if (userOAuthToken) {
    const joined = await addMemberToGuild(discordUserId, userOAuthToken);
    if (!joined) {
      return { ok: false, error: "Could not add member to Discord server" };
    }
  }

  const guildId = process.env.DISCORD_GUILD_ID!;
  const roleId = process.env.DISCORD_CONTRIBUTOR_ROLE_ID!;

  const response = await discordBotRequest(
    `/guilds/${guildId}/members/${discordUserId}/roles/${roleId}`,
    { method: "PUT" }
  );

  if (response.status === 204) {
    return { ok: true };
  }

  const body = await response.text();
  return { ok: false, error: body || `Discord role assign failed (${response.status})` };
}

export async function removeContributorRole(
  discordUserId: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isDiscordConfigured()) {
    return { ok: false, error: "Discord not configured" };
  }

  const guildId = process.env.DISCORD_GUILD_ID!;
  const roleId = process.env.DISCORD_CONTRIBUTOR_ROLE_ID!;

  const response = await discordBotRequest(
    `/guilds/${guildId}/members/${discordUserId}/roles/${roleId}`,
    { method: "DELETE" }
  );

  if (response.status === 204) {
    return { ok: true };
  }

  return { ok: false, error: `Discord role remove failed (${response.status})` };
}