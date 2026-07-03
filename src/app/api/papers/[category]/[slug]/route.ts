import { categoryByCode } from "@/lib/papers";
import { error, json, parseJson, requireAdmin } from "@/lib/api";
import { updatePaperSchema } from "@/lib/validators";
import {
  deletePaper,
  getPaperBySlug,
  setPaperFeatured,
  setPaperHidden,
  updatePaperStatus,
} from "@/db/queries";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ category: string; slug: string }> }
) {
  const { category, slug } = await ctx.params;
  const cat = categoryByCode(category);
  if (!cat) return error("Unknown sector.", 404);

  const paper = await getPaperBySlug(cat.code, slug);
  if (!paper) return error("Paper not found.", 404);
  return json({ paper });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ category: string; slug: string }> }
) {
  try {
    const denied = requireAdmin(req);
    if (denied) return denied;

    const { category, slug } = await ctx.params;
    const cat = categoryByCode(category);
    if (!cat) return error("Unknown sector.", 404);

    const parsed = await parseJson(req, updatePaperSchema);
    if (!parsed.ok) return parsed.response;

    let updated = null;

    if (parsed.data.hidden !== undefined) {
      updated = await setPaperHidden(cat.code, slug, parsed.data.hidden);
      if (!updated) return error("Paper not found.", 404);
    }

    if (parsed.data.featured !== undefined) {
      updated = await setPaperFeatured(cat.code, slug, parsed.data.featured);
      if (!updated) return error("Paper not found.", 404);
    }

    if (parsed.data.status !== undefined) {
      updated = await updatePaperStatus(
        cat.code,
        slug,
        parsed.data.status
      );
      if (!updated) return error("Paper not found.", 404);
    }

    if (!updated) return error("No changes.", 400);
    return json({ paper: updated });
  } catch (e) {
    console.error("[PATCH /api/papers/.../...] failed:", e);

    const wrapper = e instanceof Error ? e.message : "";
    const cause = (e as { cause?: unknown })?.cause;
    const causeMessage =
      cause instanceof Error
        ? cause.message
        : cause && typeof cause === "object" && "message" in cause
          ? String((cause as { message: unknown }).message)
          : "";
    const combined = `${causeMessage} ${wrapper}`;

    if (/invalid input value for enum/i.test(combined)) {
      return error(
        "Database is out of sync with the app. Apply the pending migration and retry.",
        500
      );
    }

    return error(causeMessage || wrapper || "Failed to update paper.", 500);
  }
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ category: string; slug: string }> }
) {
  try {
    const denied = requireAdmin(req);
    if (denied) return denied;

    const { category, slug } = await ctx.params;
    const cat = categoryByCode(category);
    if (!cat) return error("Unknown sector.", 404);

    const ok = await deletePaper(cat.code, slug);
    if (!ok) return error("Paper not found.", 404);
    return json({ ok: true });
  } catch (e) {
    console.error("[DELETE /api/papers/.../...] failed:", e);
    const wrapper = e instanceof Error ? e.message : "";
    const cause = (e as { cause?: unknown })?.cause;
    const causeMessage =
      cause instanceof Error ? cause.message : "";
    return error(causeMessage || wrapper || "Failed to delete paper.", 500);
  }
}
