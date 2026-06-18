import { serialize } from "next-mdx-remote/serialize";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import rehypePrettyCode from "rehype-pretty-code";

import { requireAdminApi } from "@/lib/admin/api-auth";

export async function POST(request: Request) {
  const session = await requireAdminApi();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const source = typeof body?.source === "string" ? body.source : "";

  if (!source.trim()) {
    return Response.json({ compiledSource: "", scope: {} });
  }

  try {
    const serialized = await serialize(source, {
      mdxOptions: {
        remarkPlugins: [remarkMath],
        rehypePlugins: [
          [rehypeKatex, { strict: false, throwOnError: false }],
          [
            rehypePrettyCode,
            {
              theme: "github-dark",
              keepBackground: false,
              defaultLang: "plaintext",
            },
          ],
        ],
      },
    });

    return Response.json(serialized);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to compile MDX";
    return Response.json({ error: message }, { status: 400 });
  }
}