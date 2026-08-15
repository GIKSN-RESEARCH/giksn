import { revalidateTag } from "next/cache";

import { error, json, parseJson, requireAdmin } from "@/lib/api";
import { updateProductSchema } from "@/lib/validators";
import {
  deleteProduct,
  getProductBySlug,
  PRODUCTS_TAG,
  updateProduct,
} from "@/db/queries";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const product = await getProductBySlug(slug);
  if (!product) return error("Product not found.", 404);
  return json({ product });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { slug } = await ctx.params;
  const parsed = await parseJson(req, updateProductSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const updated = await updateProduct(slug, parsed.data);
    if (!updated) return error("Product not found.", 404);
    revalidateTag(PRODUCTS_TAG, "default");
    return json({ product: updated });
  } catch (e) {
    console.error("[PATCH /api/products/:slug] failed:", e);
    const msg = e instanceof Error ? e.message : "Failed to update product.";
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
    const ok = await deleteProduct(slug);
    if (!ok) return error("Product not found.", 404);
    revalidateTag(PRODUCTS_TAG, "default");
    return json({ ok: true });
  } catch (e) {
    console.error("[DELETE /api/products/:slug] failed:", e);
    const msg = e instanceof Error ? e.message : "Failed to delete product.";
    return error(msg, 500);
  }
}
