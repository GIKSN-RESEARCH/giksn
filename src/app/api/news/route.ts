import { revalidateTag } from "next/cache";

import { error, json, parseJson, requireAdmin } from "@/lib/api";
import { ADMIN_COOKIE, readCookie, verifySession } from "@/lib/session";
import { createNewsSchema } from "@/lib/validators";
import { createNews, listNews, NEWS_TAG } from "@/db/queries";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wantDelisted = searchParams.get("includeDelisted") === "1";
  const isAdmin = !!verifySession(readCookie(req, ADMIN_COOKIE));
  const list = await listNews({
    listedOnly: !(wantDelisted && isAdmin),
  });
  return json({ news: list });
}

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const parsed = await parseJson(req, createNewsSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const href =
      parsed.data.href && parsed.data.href.length > 0 ? parsed.data.href : null;
    const item = await createNews({
      ...parsed.data,
      href,
    });
    revalidateTag(NEWS_TAG, "default");
    return json({ news: item }, 201);
  } catch (e) {
    const msg =
      e instanceof Error && /duplicate|unique/i.test(e.message)
        ? "A news item with that slug already exists."
        : e instanceof Error
          ? e.message
          : "Failed to create news.";
    const status = msg.startsWith("A news") ? 409 : 500;
    return error(msg, status);
  }
}
