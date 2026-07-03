import { revalidateTag } from "next/cache";

import { categoryByCode } from "@/lib/papers";
import { error, json, parseJson } from "@/lib/api";
import { createCommentSchema } from "@/lib/validators";
import { addComment, getPaperIdBySlug, PAPERS_TAG } from "@/db/queries";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ category: string; slug: string }> }
) {
  const { category, slug } = await ctx.params;
  const cat = categoryByCode(category);
  if (!cat) return error("Unknown sector.", 404);

  const parsed = await parseJson(req, createCommentSchema);
  if (!parsed.ok) return parsed.response;

  const paperId = await getPaperIdBySlug(cat.code, slug);
  if (!paperId) return error("Paper not found.", 404);

  try {
    const comment = await addComment(paperId, parsed.data);
    // A new reply changes the paper's updated timestamp and the sort order
    // on list pages, so the public cache has to be dropped.
    revalidateTag(PAPERS_TAG, "default");
    return json({ comment }, 201);
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Failed to add comment.";
    const status = /not found|do not match|one level/i.test(msg) ? 400 : 500;
    return error(msg, status);
  }
}
