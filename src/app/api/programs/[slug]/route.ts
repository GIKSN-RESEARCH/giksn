import { revalidateTag } from "next/cache";

import { error, json, parseJson, requireAdmin } from "@/lib/api";
import { updateProgramSchema } from "@/lib/validators";
import {
  deleteProgram,
  getProgramBySlug,
  PROGRAMS_TAG,
  updateProgram,
} from "@/db/queries";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const program = await getProgramBySlug(slug);
  if (!program) return error("Program not found.", 404);
  return json({ program });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { slug } = await ctx.params;
  const parsed = await parseJson(req, updateProgramSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const updated = await updateProgram(slug, parsed.data);
    if (!updated) return error("Program not found.", 404);
    revalidateTag(PROGRAMS_TAG, "default");
    return json({ program: updated });
  } catch (e) {
    console.error("[PATCH /api/programs/:slug] failed:", e);
    const msg = e instanceof Error ? e.message : "Failed to update program.";
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
    const ok = await deleteProgram(slug);
    if (!ok) return error("Program not found.", 404);
    revalidateTag(PROGRAMS_TAG, "default");
    return json({ ok: true });
  } catch (e) {
    console.error("[DELETE /api/programs/:slug] failed:", e);
    const msg = e instanceof Error ? e.message : "Failed to delete program.";
    return error(msg, 500);
  }
}
