import type { BodyBlock, PaperSection } from "@/lib/papers";
import { normalizeSection } from "@/lib/parseBody";
import { renderInline } from "@/lib/inlineMarkdown";

export function ProseBody({ sections }: { sections: PaperSection[] }) {
  let firstParagraph = true;

  return (
    <>
      {sections.map((section, i) => {
        const blocks = normalizeSection(section);
        return (
          <section key={i} className="mb-2">
            {section.heading && <h2>{renderInline(section.heading)}</h2>}
            {blocks.map((block, j) => {
              const dropcap = firstParagraph && block.type === "paragraph";
              if (block.type === "paragraph") firstParagraph = false;
              return (
                <BodyBlockView key={j} block={block} dropcap={dropcap} />
              );
            })}
          </section>
        );
      })}
    </>
  );
}

function BodyBlockView({
  block,
  dropcap,
}: {
  block: BodyBlock;
  dropcap?: boolean;
}) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className={dropcap ? "dropcap" : undefined}>
          {renderInline(block.text)}
        </p>
      );
    case "list":
      return (
        <ul>
          {block.items.map((li, j) => (
            <li key={j}>{renderInline(li)}</li>
          ))}
        </ul>
      );
    case "pullquote":
      return <blockquote>{renderInline(block.text)}</blockquote>;
    case "heading":
      if (block.level === 4) {
        return <h4>{renderInline(block.text)}</h4>;
      }
      if (block.level === 3) {
        return <h3>{renderInline(block.text)}</h3>;
      }
      return <h2 className="!mt-[1.4em]">{renderInline(block.text)}</h2>;
    case "code":
      return (
        <div className="code-block">
          {block.lang && (
            <div className="code-block-lang">{block.lang}</div>
          )}
          <pre>
            <code>{block.code}</code>
          </pre>
        </div>
      );
    case "table":
      return (
        <div className="table-wrap">
          <table className="prose-table">
            <thead>
              <tr>
                {block.headers.map((cell, j) => (
                  <th
                    key={j}
                    style={{ textAlign: block.align?.[j] ?? "left" }}
                  >
                    {renderInline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      style={{ textAlign: block.align?.[ci] ?? "left" }}
                    >
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}