const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function isTurnstileEnabled(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY &&
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  );
}

export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string
): Promise<{ success: true } | { success: false; error: string }> {
  if (!isTurnstileEnabled()) {
    if (process.env.NODE_ENV === "production") {
      console.warn("[turnstile] Not configured in production — allowing request");
    }
    return { success: true };
  }

  if (!token) {
    return { success: false, error: "Complete the security check and try again." };
  }

  const body = new URLSearchParams({
    secret: process.env.TURNSTILE_SECRET_KEY!,
    response: token,
  });

  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  const response = await fetch(VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const result = (await response.json()) as { success?: boolean };

  if (!result.success) {
    return { success: false, error: "Security check failed. Please try again." };
  }

  return { success: true };
}