import { revalidateTag } from "next/cache";

import { error, json, parseJson, requireAdmin } from "@/lib/api";
import { ADMIN_COOKIE, readCookie, verifySession } from "@/lib/session";
import { createProgramSchema } from "@/lib/validators";
import { createProgram, listPrograms, PROGRAMS_TAG } from "@/db/queries";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wantDelisted = searchParams.get("includeDelisted") === "1";
  const isAdmin = !!verifySession(readCookie(req, ADMIN_COOKIE));
  const list = await listPrograms({
    listedOnly: !(wantDelisted && isAdmin),
  });
  return json({ programs: list });
}

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const parsed = await parseJson(req, createProgramSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const website =
      parsed.data.website && parsed.data.website.length > 0
        ? parsed.data.website
        : null;
    const program = await createProgram({
      ...parsed.data,
      website,
    });
    revalidateTag(PROGRAMS_TAG, "default");
    return json({ program }, 201);
  } catch (e) {
    const msg =
      e instanceof Error && /duplicate|unique/i.test(e.message)
        ? "A program with that slug already exists."
        : e instanceof Error
          ? e.message
          : "Failed to create program.";
    const status = msg.startsWith("A program") ? 409 : 500;
    return error(msg, status);
  }
}
