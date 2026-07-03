import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";

export function json<T>(data: T, init?: number | ResponseInit) {
  return NextResponse.json(data, typeof init === "number" ? { status: init } : init);
}

export function error(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export async function parseJson<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<{ ok: true; data: T } | { ok: false; response: ReturnType<typeof error> }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { ok: false, response: error("Body must be valid JSON.", 400) };
  }
  try {
    const data = schema.parse(raw);
    return { ok: true, data };
  } catch (e) {
    if (e instanceof ZodError) {
      return {
        ok: false,
        response: error("Validation failed.", 422, { issues: e.issues }),
      };
    }
    return { ok: false, response: error("Invalid input.", 400) };
  }
}

import { ADMIN_COOKIE, readCookie, verifySession } from "./session";

export function requireAdmin(req: Request): Response | null {
  const session = verifySession(readCookie(req, ADMIN_COOKIE));
  if (!session) return error("Unauthorized. Sign in at /admin.", 401);
  return null;
}
