import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { invitations } from "@/db/schema";
import { logAdminAction } from "@/lib/audit";
import {
  addUserToPrivateChannels,
  sendTelegramMessage,
} from "@/lib/telegram";
import { constantTimeEqual } from "@/lib/tokens";
import { enforceRateLimit, clientIpFromHeaders } from "@/lib/ratelimit";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const telegramLimiter =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(10, "1 m"),
        prefix: "giksn-telegram",
      })
    : null;

type TelegramUpdate = {
  message?: {
    message_id: number;
    text?: string;
    chat: { id: number };
    from?: { id: number; username?: string };
  };
};

function extractToken(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(/\s+/);
  return parts[parts.length - 1] ?? null;
}

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_BOT_WEBHOOK_SECRET;
  if (secret) {
    const header = request.headers.get("x-telegram-bot-api-secret-token");
    if (!header || !constantTimeEqual(header, secret)) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  const ip = clientIpFromHeaders(request.headers);
  const rate = await enforceRateLimit(telegramLimiter, `telegram-webhook:${ip}`);
  if (!rate.success) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const update = (await request.json()) as TelegramUpdate;
  const message = update.message;
  if (!message?.text || !message.from) {
    return NextResponse.json({ ok: true });
  }

  const token = extractToken(message.text);
  if (!token) {
    await sendTelegramMessage(
      message.chat.id,
      "Send your GIKSN Telegram access token to join private channels."
    );
    return NextResponse.json({ ok: true });
  }

  const rows = await db
    .select()
    .from(invitations)
    .where(
      and(
        isNotNull(invitations.acceptedAt),
        isNull(invitations.telegramTokenRedeemedAt)
      )
    );

  const invite = rows.find((row) =>
    constantTimeEqual(row.telegramAccessToken, token)
  );

  if (!invite) {
    await sendTelegramMessage(
      message.chat.id,
      "Invalid or already-used token. Contact the lab if you need help."
    );
    return NextResponse.json({ ok: true });
  }

  if (invite.expiresAt < new Date()) {
    await sendTelegramMessage(message.chat.id, "This token has expired.");
    return NextResponse.json({ ok: true });
  }

  const telegramUserId = String(message.from.id);
  const channelResults = await addUserToPrivateChannels(telegramUserId);

  await db
    .update(invitations)
    .set({
      telegramUserId,
      telegramTokenRedeemedAt: new Date(),
    })
    .where(eq(invitations.id, invite.id));

  await logAdminAction({
    actorId: "telegram-bot",
    action: "telegram.redeem",
    entityType: "invitation",
    entityId: invite.id,
    metadata: { telegramUserId, channelResults },
  });

  const failures = channelResults.filter((r) => !r.ok);
  if (failures.length > 0) {
    await sendTelegramMessage(
      message.chat.id,
      "Token accepted, but some channels could not be joined. The lab will follow up."
    );
  } else {
    await sendTelegramMessage(
      message.chat.id,
      "Access granted. Welcome to the private GIKSN channels."
    );
  }

  return NextResponse.json({ ok: true });
}