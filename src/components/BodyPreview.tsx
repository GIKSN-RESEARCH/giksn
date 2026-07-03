"use client";

import { parseBody } from "@/lib/parseBody";
import { renderInline } from "@/lib/inlineMarkdown";

export function BodyPreview({ body }: { body: string }) {
  const sections = parseBody(body);

  if (sections.length === 0) {
    return (
      <div className="border border-rule p-8 min-h-[280px] flex items-center justify-center text-center">
        <p className="font-display italic text-ink-faint text-[14px] max-w-[40ch]">
          Nothing to preview yet. Write something on the Write tab.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-rule p-6 md:p-8 bg-paper">
      <div className="prose-body">
        {sections.map((section, i) => (
          <section key={i} className="mb-2">
            {section.heading && <h2>{section.heading}</h2>}
            {section.paragraphs?.map((p, j) => {
              const isFirst = i === 0 && j === 0;
              return (
                <p key={j} className={isFirst ? "dropcap" : undefined}>
                  {renderInline(p)}
                </p>
              );
            })}
            {section.list && (
              <ul>
                {section.list.map((li, j) => (
                  <li key={j}>{renderInline(li)}</li>
                ))}
              </ul>
            )}
            {section.pullquote && (
              <blockquote>{renderInline(section.pullquote)}</blockquote>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

export function InlinePreview({ body }: { body: string }) {
  if (!body.trim()) {
    return (
      <div className="border border-rule p-4 min-h-[120px] flex items-center text-center justify-center">
        <p className="font-display italic text-ink-faint text-[13px]">
          Nothing to preview yet.
        </p>
      </div>
    );
  }
  return (
    <div className="border border-rule p-4 bg-paper">
      <p className="text-[15.5px] leading-[1.7] text-ink">
        {renderInline(body)}
      </p>
    </div>
  );
}

export function PreviewTabs({
  mode,
  onChange,
}: {
  mode: "write" | "preview";
  onChange: (m: "write" | "preview") => void;
}) {
  return (
    <div className="flex gap-0 border-b border-rule mb-3 -mt-1">
      <TabBtn active={mode === "write"} onClick={() => onChange("write")}>
        Write
      </TabBtn>
      <TabBtn active={mode === "preview"} onClick={() => onChange("preview")}>
        Preview
      </TabBtn>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${
        active
          ? "text-accent"
          : "text-ink-faint hover:text-ink"
      }`}
    >
      {children}
      {active && (
        <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-accent" />
      )}
    </button>
  );
}
