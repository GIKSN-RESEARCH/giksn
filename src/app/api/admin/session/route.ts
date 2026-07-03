import { json } from "@/lib/api";
import { ADMIN_COOKIE, readCookie, verifySession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = verifySession(readCookie(req, ADMIN_COOKIE));
  if (!session) return json({ authenticated: false }, 200);
  return json(
    {
      authenticated: true,
      email: session.email,
      expiresAt: new Date(session.exp * 1000).toISOString(),
    },
    200
  );
}
