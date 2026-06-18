const API_BASE = "https://api.telegram.org/bot";

function botToken(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN ?? null;
}

export function getPrivateChannelIds(): string[] {
  return (process.env.TELEGRAM_PRIVATE_CHANNEL_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function getTelegramBotUsername(): string | null {
  return process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? null;
}

async function telegramRequest<T>(
  method: string,
  body: Record<string, unknown>
): Promise<{ ok: boolean; result?: T; description?: string }> {
  const token = botToken();
  if (!token) {
    return { ok: false, description: "Telegram bot not configured" };
  }

  const response = await fetch(`${API_BASE}${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return response.json() as Promise<{
    ok: boolean;
    result?: T;
    description?: string;
  }>;
}

export async function addUserToPrivateChannels(telegramUserId: string) {
  const channelIds = getPrivateChannelIds();
  const results: Array<{ channelId: string; ok: boolean; error?: string }> = [];

  for (const channelId of channelIds) {
    const response = await telegramRequest<boolean>("unbanChatMember", {
      chat_id: channelId,
      user_id: Number(telegramUserId),
      only_if_banned: false,
    });

    results.push({
      channelId,
      ok: response.ok,
      error: response.description,
    });
  }

  return results;
}

export async function removeUserFromPrivateChannels(telegramUserId: string) {
  const channelIds = getPrivateChannelIds();
  const results: Array<{ channelId: string; ok: boolean; error?: string }> = [];

  for (const channelId of channelIds) {
    const response = await telegramRequest<boolean>("banChatMember", {
      chat_id: channelId,
      user_id: Number(telegramUserId),
    });

    results.push({
      channelId,
      ok: response.ok,
      error: response.description,
    });
  }

  return results;
}

export async function sendTelegramMessage(
  chatId: number | string,
  text: string
): Promise<boolean> {
  const response = await telegramRequest("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
  });
  return response.ok;
}