import { revalidateTag } from "next/cache";

import { error, json, parseJson, requireAdmin } from "@/lib/api";
import { updateNewsSchema } from "@/lib/validators";
import { deleteNews, NEWS_TAG, updateNews } from "@/db/queries";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { slug } = await ctx.params;
  const parsed = await parseJson(req, updateNewsSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const updated = await updateNews(slug, parsed.data);
    if (!updated) return error("News item not found.", 404);
    revalidateTag(NEWS_TAG, "default");
    return json({ news: updated });
  } catch (e) {
    console.error("[PATCH /api/news/:slug] failed:", e);
    const msg = e instanceof Error ? e.message : "Failed to update news.";
    return error(msg, 500);
  }
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { slug } = await ctx.params;
  try {
    const ok = await deleteNews(slug);
    if (!ok) return error("News item not found.", 404);
    revalidateTag(NEWS_TAG, "default");
    return json({ ok: true });
  } catch (e) {
    console.error("[DELETE /api/news/:slug] failed:", e);
    const msg = e instanceof Error ? e.message : "Failed to delete news.";
    return error(msg, 500);
  }
}
