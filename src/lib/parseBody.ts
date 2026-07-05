import type { BodyBlock, PaperSection } from "./papers";

/**
 * Markdown parser for paper/update bodies and the submit-form preview.
 *
 * Top-level `## Heading` starts a new section. Within a section:
 *   - `###` / `####` headings
 *   - Fenced code blocks (``` or common `` typos)
 *   - GFM tables
 *   - `-` / `*` lists
 *   - `>` pullquotes
 *   - Paragraphs (blank-line separated)
 */
export function parseBody(input: string): PaperSection[] {
  const text = preprocessMarkdown(input);
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
      if (body) {
        const blocks = parseBlocks(body);
        if (blocks.length) section.blocks = blocks;
      }
      return section;
    })
    .filter(
      (s) =>
        s.heading ||
        (s.blocks && s.blocks.length > 0) ||
        (s.paragraphs && s.paragraphs.length) ||
        (s.list && s.list.length) ||
        s.pullquote
    );
}

function parseBlocks(body: string): BodyBlock[] {
  const lines = body.split("\n");
  const blocks: BodyBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    const inlineCode = parseInlineFence(line);
    if (inlineCode) {
      blocks.push(inlineCode);
      i++;
      continue;
    }

    const fence = parseFenceOpen(line);
    if (fence) {
      const codeLines: string[] = [];
      if (fence.firstLine) codeLines.push(fence.firstLine);
      i++;
      while (i < lines.length) {
        if (parseHeading(lines[i])) break;
        const close = parseFenceClose(lines[i]);
        if (close === "line") {
          i++;
          break;
        }
        if (close) {
          if (close.inlineRemainder) codeLines.push(close.inlineRemainder);
          i++;
          break;
        }
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({
        type: "code",
        lang: fence.lang,
        code: codeLines.join("\n").trimEnd(),
      });
      continue;
    }

    const heading = parseHeading(line);
    if (heading) {
      blocks.push(heading);
      i++;
      continue;
    }

    if (isTableStart(lines, i)) {
      const table = parseTable(lines, i);
      blocks.push(table.block);
      i = table.next;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({
        type: "pullquote",
        text: quoteLines.join(" ").trim(),
      });
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, "").trim());
        i++;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines, i)) {
      paraLines.push(lines[i].trim());
      i++;
    }
    if (paraLines.length) {
      blocks.push({ type: "paragraph", text: paraLines.join(" ") });
    }
  }

  return blocks;
}

function isBlockStart(lines: string[], i: number): boolean {
  const line = lines[i];
  if (!line.trim()) return false;
  if (parseFenceOpen(line)) return true;
  if (parseInlineFence(line)) return true;
  if (parseHeading(line)) return true;
  if (/^>\s?/.test(line)) return true;
  if (/^[-*]\s+/.test(line)) return true;
  if (isTableStart(lines, i)) return true;
  return false;
}

function parseHeading(line: string): BodyBlock | null {
  const h4 = line.match(/^####\s+(.+?)\s*$/);
  if (h4) return { type: "heading", level: 4, text: h4[1] };
  const h3 = line.match(/^###\s+(.+?)\s*$/);
  if (h3) return { type: "heading", level: 3, text: h3[1] };
  const h2 = line.match(/^##\s+(.+?)\s*$/);
  if (h2) return { type: "heading", level: 2, text: h2[1] };
  return null;
}

type FenceOpen = { lang?: string; firstLine?: string };

function parseFenceOpen(line: string): FenceOpen | null {
  const triple = line.match(/^```(\w*)(?:\s+(.*))?$/);
  if (triple) {
    const lang = triple[1] || undefined;
    const rest = triple[2];
    if (rest === undefined || rest === "") return { lang };
    return { lang, firstLine: rest };
  }

  const doubleOpen = line.match(/^``(\w+)?\s*$/);
  if (doubleOpen) {
    return { lang: doubleOpen[1] || undefined };
  }

  const doubleWithContent = line.match(/^``(\w+)\s+(.+)$/);
  if (doubleWithContent && !doubleWithContent[2].endsWith("``")) {
    return { lang: doubleWithContent[1], firstLine: doubleWithContent[2] };
  }

  return null;
}

function parseInlineFence(line: string): BodyBlock | null {
  const triple = line.match(/^```(\w*)\s*(.+?)\s*```$/);
  if (triple) {
    return {
      type: "code",
      lang: triple[1] || undefined,
      code: triple[2],
    };
  }

  const double = line.match(/^``(\w+)\s+(.+?)\s*``$/);
  if (double) {
    return {
      type: "code",
      lang: double[1],
      code: double[2],
    };
  }

  return null;
}

function parseFenceClose(
  line: string
): "line" | { inlineRemainder: string } | null {
  if (/^```\s*$/.test(line)) return "line";
  if (/^``\s*$/.test(line)) return "line";

  const tripleInline = line.match(/^(.+?)\s*```$/);
  if (tripleInline && !tripleInline[1].startsWith("```")) {
    return { inlineRemainder: tripleInline[1] };
  }

  const doubleInline = line.match(/^(.+?)\s*``$/);
  if (doubleInline && !doubleInline[1].startsWith("``")) {
    return { inlineRemainder: doubleInline[1] };
  }

  return null;
}

function isTableStart(lines: string[], i: number): boolean {
  const line = lines[i];
  if (!line.includes("|")) return false;
  const cells = splitTableRow(line);
  if (cells.length < 2) return false;
  if (i + 1 < lines.length && isTableSeparator(lines[i + 1])) return true;
  return cells.length >= 2 && line.trim().startsWith("|");
}

function isTableSeparator(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes("|") || !trimmed.includes("-")) return false;
  return trimmed
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .every((cell) => /^:?-{3,}:?$/.test(cell.trim()));
}

function splitTableRow(line: string): string[] {
  const trimmed = line.trim();
  const inner = trimmed.replace(/^\|/, "").replace(/\|$/, "");
  return inner.split("|").map((c) => c.trim());
}

function parseAlignments(separator: string): ("left" | "center" | "right")[] {
  return splitTableRow(separator).map((cell) => {
    const t = cell.trim();
    const left = t.startsWith(":");
    const right = t.endsWith(":");
    if (left && right) return "center";
    if (right) return "right";
    return "left";
  });
}

function parseTable(
  lines: string[],
  start: number
): { block: BodyBlock; next: number } {
  const tableLines: string[] = [];
  let i = start;
  while (i < lines.length && lines[i].includes("|") && lines[i].trim()) {
    tableLines.push(lines[i]);
    i++;
  }

  if (tableLines.length < 2 || !isTableSeparator(tableLines[1])) {
    return {
      block: { type: "paragraph", text: tableLines.join(" ") },
      next: i,
    };
  }

  const headers = splitTableRow(tableLines[0]);
  const align = parseAlignments(tableLines[1]);
  const rows = tableLines.slice(2).map(splitTableRow);

  return {
    block: { type: "table", headers, rows, align },
    next: i,
  };
}

/** Flatten legacy section fields into `blocks` for rendering. */
export function normalizeSection(section: PaperSection): BodyBlock[] {
  if (section.blocks && section.blocks.length > 0) {
    return section.blocks;
  }

  const blocks: BodyBlock[] = [];
  if (section.paragraphs) {
    for (const text of section.paragraphs) {
      blocks.push({ type: "paragraph", text });
    }
  }
  if (section.list?.length) {
    blocks.push({ type: "list", items: section.list });
  }
  if (section.pullquote) {
    blocks.push({ type: "pullquote", text: section.pullquote });
  }
  return blocks;
}

function preprocessMarkdown(input: string): string {
  return input
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map(expandCollapsedTableLine)
    .join("\n")
    .trim();
}

function expandCollapsedTableLine(line: string): string {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.includes("---")) return line;
  const pipeCount = (trimmed.match(/\|/g) || []).length;
  if (pipeCount < 6) return line;

  const rows = trimmed.split(/\s+\|\s+(?=\|)/).map((row, i, arr) => {
    let r = row.trim();
    if (!r.endsWith("|") && i < arr.length - 1) r += " |";
    if (!r.startsWith("|")) r = "| " + r;
    return r;
  });

  if (rows.length >= 2 && isTableSeparator(rows[1])) {
    return rows.join("\n");
  }
  return line;
}

export function sectionHasContent(section: PaperSection): boolean {
  return Boolean(
    section.heading ||
      (section.blocks && section.blocks.length > 0) ||
      (section.paragraphs && section.paragraphs.length > 0) ||
      (section.list && section.list.length > 0) ||
      section.pullquote
  );
}