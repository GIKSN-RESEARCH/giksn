import { revalidateTag } from "next/cache";

import { categoryByCode } from "@/lib/papers";
import { error, json, parseJson } from "@/lib/api";
import { createPaperSchema } from "@/lib/validators";
import {
  createPaper,
  listPapers,
  listPapersSortedByUpdated,
  PAPERS_TAG,
} from "@/db/queries";
import { ADMIN_COOKIE, readCookie, verifySession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categoryParam = searchParams.get("category");
  const sort = searchParams.get("sort");
  const includeHiddenParam = searchParams.get("includeHidden") === "1";

  // Only honour includeHidden when the request comes from an authed admin.
  const isAdmin = !!verifySession(readCookie(req, ADMIN_COOKIE));
  const includeHidden = includeHiddenParam && isAdmin;

  if (categoryParam) {
    const cat = categoryByCode(categoryParam);
    if (!cat) return error("Unknown sector.", 404);
    const list = await listPapers({ category: cat.code, includeHidden });
    return json({ papers: list });
  }

  if (sort === "updated") {
    const list = await listPapersSortedByUpdated({ includeHidden });
    return json({ papers: list });
  }

  const list = await listPapers({ includeHidden });
  return json({ papers: list });
}

export async function POST(req: Request) {
  const parsed = await parseJson(req, createPaperSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const paper = await createPaper(parsed.data);
    // New paper published — bust the public read cache so it appears on
    // list pages and the featured slot without waiting for the TTL.
    revalidateTag(PAPERS_TAG, "default");
    return json({ paper }, 201);
  } catch (e) {
    const msg =
      e instanceof Error && /duplicate|unique/i.test(e.message)
        ? "A paper with that slug already exists in this sector."
        : "Failed to create paper.";
    const status = msg.startsWith("A paper") ? 409 : 500;
    return error(msg, status);
  }
}
