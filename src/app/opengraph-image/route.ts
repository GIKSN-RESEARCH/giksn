import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const dynamic = "force-static";

// Preserve the existing image URL while sharing the supplied static asset.
export async function GET() {
  const image = await readFile(join(process.cwd(), "public/og-image.png"));
  return new Response(image, { headers: { "Content-Type": "image/png" } });
}
