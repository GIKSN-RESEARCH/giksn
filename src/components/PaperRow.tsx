import Link from "next/link";
import { Paper, paperRef, shortDate } from "@/lib/papers";
import { StatusPill } from "./StatusPill";
import { KindBadge } from "./KindBadge";

type Props = {
  paper: Paper;
  index?: number;
  showCategory?: boolean;
};

export function PaperRow({ paper, index, showCategory = true }: Props) {
  const href = `/${paper.category.toLowerCase()}/${paper.slug}`;
  const replyCount = countComments(paper.discussion);

  return (
    <article className="group border-b border-rule last:border-b-0 -mx-3 sm:-mx-5">
      <Link
        href={href}
        className="block py-5 sm:py-7 px-3 sm:px-5 grid grid-cols-12 gap-3 sm:gap-4 transition-colors hover:bg-tint/60"
      >
        <div className="col-span-12 md:col-span-1 flex md:block items-center gap-3">
          <span className="font-mono text-[12px] text-ink-faint tabular-nums">
            {typeof index === "number"
              ? String(index + 1).padStart(2, "0")
              : paperRef(paper)}
          </span>
        </div>
        <div className="col-span-12 md:col-span-8 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
            {showCategory && (
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
                {paperRef(paper)}
              </span>
            )}
            <KindBadge kind={paper.kind} />
            <StatusPill status={paper.status} />
          </div>
          <h2 className="font-display font-semibold text-ink leading-[1.12] tracking-[-0.02em] text-[1.25rem] sm:text-[1.55rem] md:text-[1.7rem] group-hover:text-accent-deep transition-colors wrap-anywhere hyphens-auto">
            {paper.title}
          </h2>
          <p className="mt-2 sm:mt-3 max-w-[58ch] text-[14px] sm:text-[15px] leading-[1.6] text-ink-soft wrap-anywhere">
            {paper.abstract}
          </p>
        </div>
        <div className="col-span-12 md:col-span-3 md:text-right flex md:block flex-wrap items-baseline gap-x-3 gap-y-1">
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
            {shortDate(paper.updated)}
          </div>
          <div className="text-[14px] text-ink md:mt-1">{paper.author}</div>
          <div className="md:mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
            {replyCount === 0
              ? "No replies"
              : replyCount === 1
                ? "1 reply"
                : `${replyCount} replies`}{" "}
            · {paper.readingMinutes} min read
          </div>
        </div>
      </Link>
    </article>
  );
}

function countComments(comments: Paper["discussion"]): number {
  return comments.reduce(
    (total, c) => total + 1 + (c.replies?.length ?? 0),
    0
  );
}
