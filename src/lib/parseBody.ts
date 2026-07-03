import type { PaperSection } from "./papers";

/**
 * Light Markdown-ish parser used by the submit form.
 *
 * - `## Heading` starts a new section (everything before the first heading
 *   becomes a leading section with no heading).
 * - Blocks are separated by blank lines.
 * - A block whose every non-empty line starts with `- ` is a `list`.
 * - A block starting with `> ` becomes a `pullquote`.
 * - Anything else is appended to `paragraphs`.
 */
export function parseBody(input: string): PaperSection[] {
  const text = input.replace(/\r\n/g, "\n").trim();
  if (!text) return [];

  const chunks: { heading?: string; body: string }[] = [];
  const lines = text.split("\n");
  let buffer: string[] = [];
  let currentHeading: string | undefined;

  const flush = () => {
    const body = buffer.join("\n").trim();
    if (body || currentHeading) {
      chunks.push({ heading: currentHeading, body });
    }
    buffer = [];
  };

  for (const raw of lines) {
    const m = raw.match(/^##\s+(.+?)\s*$/);
    if (m) {
      flush();
      currentHeading = m[1];
      continue;
    }
    buffer.push(raw);
  }
  flush();

  return chunks
    .map(({ heading, body }) => {
      const section: PaperSection = {};
      if (heading) section.heading = heading;
      if (!body) return section;

      const blocks = body
        .split(/\n{2,}/)
        .map((b) => b.trim())
        .filter(Boolean);

      const paragraphs: string[] = [];
      const listItems: string[] = [];
      let pullquote: string | undefined;

      for (const block of blocks) {
        const blockLines = block.split("\n").map((l) => l.trim());
        const allList =
          blockLines.length > 0 && blockLines.every((l) => /^[-*]\s+/.test(l));
        if (allList) {
          listItems.push(...blockLines.map((l) => l.replace(/^[-*]\s+/, "")));
          continue;
        }
        if (blockLines[0].startsWith("> ") && !pullquote) {
          pullquote = blockLines
            .map((l) => l.replace(/^>\s?/, ""))
            .join(" ")
            .trim();
          continue;
        }
        paragraphs.push(blockLines.join(" "));
      }

      if (paragraphs.length) section.paragraphs = paragraphs;
      if (listItems.length) section.list = listItems;
      if (pullquote) section.pullquote = pullquote;
      return section;
    })
    .filter(
      (s) =>
        s.heading ||
        (s.paragraphs && s.paragraphs.length) ||
        (s.list && s.list.length) ||
        s.pullquote
    );
}
