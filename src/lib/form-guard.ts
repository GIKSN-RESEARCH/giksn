import { headers } from "next/headers";

import type { Ratelimit } from "@upstash/ratelimit";

import { clientIpFromHeaders, enforceRateLimit } from "@/lib/ratelimit";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function guardPublicForm({
  limiter,
  scope,
  formData,
}: {
  limiter: Ratelimit | null;
  scope: string;
  formData: FormData;
}): Promise<{ success: true; ip: string } | { success: false; error: string }> {
  const headerList = await headers();
  const ip = clientIpFromHeaders(headerList);

  const rate = await enforceRateLimit(limiter, `${scope}:${ip}`);
  if (!rate.success) {
    return rate;
  }

  const turnstile = await verifyTurnstileToken(
    String(formData.get("cf-turnstile-response") ?? ""),
    ip
  );
  if (!turnstile.success) {
    return turnstile;
  }

  return { success: true, ip };
}