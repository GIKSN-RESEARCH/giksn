import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from "discord-interactions";
import { NextResponse } from "next/server";

import { redeemDiscordAccess } from "@/lib/discord-redeem";
import { enforceRateLimit, clientIpFromHeaders } from "@/lib/ratelimit";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const discordLimiter =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(10, "1 m"),
        prefix: "giksn-discord",
      })
    : null;

export async function POST(request: Request) {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  const publicKey = process.env.DISCORD_PUBLIC_KEY;

  if (!signature || !timestamp || !publicKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.text();

  const isValid = verifyKey(body, signature, timestamp, publicKey);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const interaction = JSON.parse(body) as {
    type: number;
    data?: { name?: string; options?: Array<{ name: string; value: string }> };
    member?: { user?: { id: string } };
    user?: { id: string };
  };

  if (interaction.type === InteractionType.PING) {
    return NextResponse.json({ type: InteractionResponseType.PONG });
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const ip = clientIpFromHeaders(request.headers);
    const rate = await enforceRateLimit(discordLimiter, `discord-slash:${ip}`);
    if (!rate.success) {
      return NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: rate.error,
          flags: 64,
        },
      });
    }

    if (interaction.data?.name !== "redeem") {
      return NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: "Unknown command.", flags: 64 },
      });
    }

    const token = interaction.data.options?.find((opt) => opt.name === "token")?.value;
    const discordUserId =
      interaction.member?.user?.id ?? interaction.user?.id ?? null;

    if (!token || !discordUserId) {
      return NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "Usage: /redeem token:<your-access-token>",
          flags: 64,
        },
      });
    }

    const result = await redeemDiscordAccess({
      discordUserId,
      token,
      actorId: "discord-slash",
    });

    return NextResponse.json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: result.ok
          ? "Contributor role granted. Check your private channels."
          : result.error,
        flags: 64,
      },
    });
  }

  return NextResponse.json({ error: "Unhandled interaction" }, { status: 400 });
}