import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitResult = { success: true } | { success: false; error: string };

function createRedis() {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null;
  }

  return Redis.fromEnv();
}

const redis = createRedis();

function createLimiter(requests: number, window: `${number} ${"s" | "m" | "h" | "d"}`) {
  if (!redis) return null;

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: "giksn",
    analytics: true,
  });
}

export const applicationLimiter = createLimiter(3, "1 h");
export const contactLimiter = createLimiter(5, "1 h");
export const authLimiter = createLimiter(20, "10 m");

export async function enforceRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<RateLimitResult> {
  if (!limiter) {
    if (process.env.NODE_ENV === "production") {
      console.warn("[ratelimit] Upstash not configured — allowing request");
    }
    return { success: true };
  }

  const { success } = await limiter.limit(identifier);
  if (!success) {
    return {
      success: false,
      error: "Too many requests. Please wait and try again.",
    };
  }

  return { success: true };
}

export function clientIpFromHeaders(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}