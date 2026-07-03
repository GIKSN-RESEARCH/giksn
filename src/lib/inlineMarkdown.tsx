import type { ReactNode } from "react";

// A tiny, intentionally restricted inline-Markdown renderer used in body
// paragraphs, list items, pullquotes, abstracts, and comment bodies.
//
// Supported, in priority order:
//   `code`               → <code>
//   [label](url)         → <a> (only http(s)://, mailto:, /relative, #anchor)
//   **bold**             → <strong>
//   *italic*             → <em>
//
// Anything else is left as plain text. No HTML, no images, no headings,
// no nested block syntax. React escapes everything by default — we never
// use dangerouslySetInnerHTML.

const TOKEN = /(`[^`\n]+`)|(\[[^\]\n]+\]\([^\s)]+\))|(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*)/;

function isSafeUrl(url: string): boolean {
  return (
    url.startsWith("/") ||
    url.startsWith("#") ||
    /^https?:\/\//i.test(url) ||
    /^mailto:/i.test(url)
  );
}

export function renderInline(text: string): ReactNode {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  while (cursor < text.length) {
    const remainder = text.slice(cursor);
    const m = remainder.match(TOKEN);
    if (!m || m.index === undefined) {
      nodes.push(text.slice(cursor));
      break;
    }
    if (m.index > 0) nodes.push(text.slice(cursor, cursor + m.index));
    const matched = m[0];
    const k = key++;

    if (matched.startsWith("`")) {
      nodes.push(
        <code
          key={k}
          className="font-mono text-[0.92em] bg-tint px-1 py-px rounded-sm"
        >
          {matched.slice(1, -1)}
        </code>
      );
    } else if (matched.startsWith("[")) {
      const inner = matched.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (inner) {
        const [, label, url] = inner;
        if (isSafeUrl(url)) {
          const isExternal = /^https?:\/\//i.test(url);
          nodes.push(
            <a
              key={k}
              href={url}
              className="link-underline text-accent hover:text-accent-deep transition-colors"
              {...(isExternal
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {renderInline(label)}
            </a>
          );
        } else {
          nodes.push(matched);
        }
      } else {
        nodes.push(matched);
      }
    } else if (matched.startsWith("**")) {
      nodes.push(
        <strong key={k}>{renderInline(matched.slice(2, -2))}</strong>
      );
    } else if (matched.startsWith("*")) {
      nodes.push(<em key={k}>{renderInline(matched.slice(1, -1))}</em>);
    } else {
      nodes.push(matched);
    }

    cursor += m.index + matched.length;
  }

  return nodes;
}
