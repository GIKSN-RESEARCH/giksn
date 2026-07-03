import { revalidateTag } from "next/cache";

import { error, json, requireAdmin } from "@/lib/api";
import { PAPERS_TAG } from "@/db/queries";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/revalidate
 *
 * Purges the `papers` cache tag. Any list or detail page that reads through
 * the cached DB helpers rebuilds on its next request. Useful when content is
 * inserted or updated outside the app (seed scripts, direct SQL) and the
 * usual mutation endpoints did not fire revalidateTag.
 *
 * Admin session required.
 */
export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    revalidateTag(PAPERS_TAG, "default");
    return json({ ok: true, tag: PAPERS_TAG });
  } catch (e) {
    console.error("[POST /api/admin/revalidate] failed:", e);
    const msg = e instanceof Error ? e.message : "Failed to revalidate.";
    return error(msg, 500);
  }
}
