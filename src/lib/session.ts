import crypto from "node:crypto";

export const ADMIN_COOKIE = "giksn_admin";
export const SESSION_DAYS = 30;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET is not set (or is too short). Generate one with `openssl rand -base64 32` and put it in .env."
    );
  }
  return secret;
}

function sign(payload: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

// Use "|" as the separator — it can't appear in an email address (RFC 5321)
// and isn't part of base64url, so the three pieces are always recoverable.
const SEP = "|";

export function createSession(email: string, days = SESSION_DAYS): string {
  const exp = Math.floor(Date.now() / 1000) + days * 86400;
  const payload = `${email.toLowerCase()}${SEP}${exp}`;
  return `${payload}${SEP}${sign(payload)}`;
}

export function verifySession(
  cookieValue: string | undefined | null
): { email: string; exp: number } | null {
  if (!cookieValue) return null;
  const parts = cookieValue.split(SEP);
  if (parts.length !== 3) return null;
  const [email, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return null;
  let expected: string;
  try {
    expected = sign(`${email}${SEP}${expStr}`);
  } catch {
    return null;
  }
  if (!safeEqual(sig, expected)) return null;
  return { email, exp };
}

export function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}
