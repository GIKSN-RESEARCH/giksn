import { NextResponse } from "next/server";
import { z } from "zod";

import { error, parseJson } from "@/lib/api";
import { ADMIN_COOKIE, SESSION_DAYS, createSession } from "@/lib/session";
import { findAdminByEmail } from "@/db/queries";
import { verifyPassword } from "@/lib/password";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(500),
});

export async function POST(req: Request) {
  const parsed = await parseJson(req, loginSchema);
  if (!parsed.ok) return parsed.response;
  const { email, password } = parsed.data;

  const admin = await findAdminByEmail(email);
  if (!admin) {
    return error("Invalid email or password.", 401);
  }

  const ok = await verifyPassword(password, admin.passwordHash);
  if (!ok) {
    return error("Invalid email or password.", 401);
  }

  const token = createSession(admin.email);
  const res = NextResponse.json({ email: admin.email }, { status: 200 });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return res;
}
