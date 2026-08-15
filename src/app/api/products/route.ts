import { revalidateTag } from "next/cache";

import { error, json, parseJson, requireAdmin } from "@/lib/api";
import { ADMIN_COOKIE, readCookie, verifySession } from "@/lib/session";
import { createProductSchema } from "@/lib/validators";
import { createProduct, listProducts, PRODUCTS_TAG } from "@/db/queries";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wantDelisted = searchParams.get("includeDelisted") === "1";
  const isAdmin = !!verifySession(readCookie(req, ADMIN_COOKIE));
  const list = await listProducts({
    listedOnly: !(wantDelisted && isAdmin),
  });
  return json({ products: list });
}

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const parsed = await parseJson(req, createProductSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const version =
      parsed.data.version && parsed.data.version.length > 0
        ? parsed.data.version
        : null;
    const product = await createProduct({
      ...parsed.data,
      version,
    });
    revalidateTag(PRODUCTS_TAG, "default");
    return json({ product }, 201);
  } catch (e) {
    const msg =
      e instanceof Error && /duplicate|unique/i.test(e.message)
        ? "A product with that slug already exists."
        : e instanceof Error
          ? e.message
          : "Failed to create product.";
    const status = msg.startsWith("A product") ? 409 : 500;
    return error(msg, status);
  }
}
