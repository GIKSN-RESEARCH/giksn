import Link from "next/link";

import { categoryByCode, formatDate } from "@/lib/papers";
import { renderInline } from "@/lib/inlineMarkdown";
import { type Program } from "@/lib/programs";

export function ProgramBlock({
  program,
  index,
  collapsed = false,
}: {
  program: Program;
  index: number;
  collapsed?: boolean;
}) {
  const sectorLabels = (program.sectors?.length
    ? program.sectors
    : [program.category]
  ).map((code) => categoryByCode(code)?.full ?? code);
  const siteHref = program.website || null;
  const href = `/programs/${program.slug}`;
  const paragraphs = program.description
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <article
      className={
        collapsed
          ? "grid grid-cols-1 md:grid-cols-[minmax(0,4fr)_1px_minmax(0,8fr)] md:gap-x-8 gap-y-6 border border-rule bg-paper p-5 sm:p-8"
          : "grid grid-cols-12 gap-6 md:gap-10 border border-rule bg-paper p-5 sm:p-8"
      }
    >
      <div
        className={
          collapsed
            ? "min-w-0 flex flex-col"
            : "col-span-12 md:col-span-4 min-w-0 flex flex-col"
        }
      >
        <div className="flex items-baseline gap-3 mb-3 flex-wrap">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            Program {String(index + 1).padStart(2, "0")}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint border border-rule px-2 py-0.5">
            {program.startsOn
              ? program.endsOn
                ? `${formatDate(program.startsOn)} to ${formatDate(program.endsOn)}`
                : formatDate(program.startsOn)
              : program.tentativeStart
                ? program.tentativeStart
                : "Upcoming"}
          </span>
        </div>
        <h2
          className="font-display font-semibold text-ink leading-[1.02] tracking-[-0.03em]"
          style={{ fontSize: "clamp(1.8rem, 3.6vw, 2.8rem)" }}
        >
          <Link href={href} className="hover:text-accent transition-colors">
            {program.name}
          </Link>
        </h2>
        <p className="mt-3 font-display italic text-ink-soft text-[15px] sm:text-[17px] leading-[1.5] max-w-[36ch]">
          {renderInline(program.tagline)}
        </p>
        <dl className="mt-6 space-y-2.5 font-mono text-[11px] uppercase tracking-[0.14em]">
          <MetaRow
            term={sectorLabels.length > 1 ? "Sectors" : "Sector"}
            value={sectorLabels.join(", ")}
          />
          {program.startsOn ? (
            <MetaRow
              term={program.endsOn ? "Dates" : "Date"}
              value={
                program.endsOn
                  ? `${formatDate(program.startsOn)} to ${formatDate(program.endsOn)}`
                  : formatDate(program.startsOn)
              }
            />
          ) : program.tentativeStart ? (
            <MetaRow term="Tentative start" value={program.tentativeStart} />
          ) : (
            <MetaRow term="Status" value="Upcoming" />
          )}
        </dl>
        {siteHref && (
          <div className={collapsed ? "mt-5 md:mt-auto pt-5" : "mt-5"}>
            <a
              href={siteHref}
              target="_blank"
              rel="noopener noreferrer"
              className={
                collapsed
                  ? "inline-flex items-center gap-2 bg-white !text-ink border border-rule px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] hover:border-accent hover:text-accent transition-colors cursor-pointer"
                  : "inline-flex items-center gap-2 bg-accent !text-white px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] hover:bg-accent-deep transition-colors cursor-pointer"
              }
            >
              Apply →
            </a>
          </div>
        )}
      </div>

      {collapsed && (
        <div
          aria-hidden
          className="hidden md:block bg-rule self-stretch"
        />
      )}

      <div
        className={
          collapsed
            ? "min-w-0 overflow-hidden flex flex-col max-h-48 md:max-h-none md:h-0 md:min-h-full"
            : "col-span-12 md:col-span-8 min-w-0 md:border-l md:border-rule md:pl-8 flex flex-col"
        }
      >
        {collapsed ? (
          <>
            <div className="relative min-h-0 flex-1 overflow-hidden max-h-40 md:max-h-none">
              <ProgramDescription
                paragraphs={paragraphs}
                fallback={program.description}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-paper to-transparent"
              />
            </div>
            <p className="shrink-0 mt-1 text-[16px] leading-none text-ink-soft tracking-[0.16em]">
              ...
            </p>
            <div className="shrink-0 pt-5">
              <Link
                href={href}
                className="inline-flex items-center gap-2 bg-accent !text-white px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] hover:bg-accent-deep transition-colors cursor-pointer"
              >
                Learn more →
              </Link>
            </div>
          </>
        ) : (
          <>
            <ProgramDescription
              paragraphs={paragraphs}
              fallback={program.description}
            />

            {program.highlights.length > 0 && (
              <div className="mt-6">
                <div className="kicker mb-3">What it is</div>
                <ul className="space-y-2">
                  {program.highlights.map((h, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-[14px] sm:text-[15px] leading-[1.6] text-ink"
                    >
                      <span className="font-mono text-[11px] text-accent tracking-[0.16em] mt-1 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{renderInline(h)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </article>
  );
}

function ProgramDescription({
  paragraphs,
  fallback,
}: {
  paragraphs: string[];
  fallback: string;
}) {
  return (
    <div className="space-y-4 text-[15px] sm:text-[16px] leading-[1.65] text-ink-soft">
      {paragraphs.length > 0 ? (
        paragraphs.map((para, i) => (
          <p key={i} className="whitespace-pre-wrap">
            {renderInline(para)}
          </p>
        ))
      ) : (
        <p className="whitespace-pre-wrap">{renderInline(fallback)}</p>
      )}
    </div>
  );
}

function MetaRow({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-rule-soft pb-2">
      <dt className="text-ink-faint">{term}</dt>
      <dd className="text-ink text-right normal-case tracking-normal font-body text-[13px]">
        {value}
      </dd>
    </div>
  );
}
