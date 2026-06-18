import { randomBytes, timingSafeEqual } from "crypto";

export function generateSecureToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}