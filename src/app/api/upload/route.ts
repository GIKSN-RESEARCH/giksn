import { put } from "@vercel/blob";

import { db } from "@/db";
import { media } from "@/db/schema";
import { requireAdminApi } from "@/lib/admin/api-auth";

export async function POST(request: Request) {
  const session = await requireAdminApi();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return Response.json(
      { error: "BLOB_READ_WRITE_TOKEN is not configured" },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const key = `uploads/${Date.now()}-${safeName}`;

  const blob = await put(key, file, {
    access: "public",
    token,
  });

  const now = new Date();
  const [row] = await db
    .insert(media)
    .values({
      url: blob.url,
      key: blob.pathname,
      mimeType: file.type || null,
      size: String(file.size),
      uploadedBy: session.user.id,
      createdAt: now,
    })
    .returning();

  return Response.json({
    id: row.id,
    url: row.url,
    key: row.key,
    mimeType: row.mimeType,
  });
}