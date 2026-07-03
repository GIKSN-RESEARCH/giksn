import { categoryByCode } from "@/lib/papers";
import { error, json, parseJson } from "@/lib/api";
import { createCommentSchema } from "@/lib/validators";
import { addComment, getPaperIdBySlug } from "@/db/queries";

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
    return json({ comment }, 201);
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Failed to add comment.";
    const status = /not found|do not match|one level/i.test(msg) ? 400 : 500;
    return error(msg, status);
  }
}
