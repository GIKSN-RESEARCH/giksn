import Link from "next/link";
import { Paper, shortDate } from "@/lib/papers";

type Props = {
  update: Paper;
  index?: number;
};

export function UpdateRow({ update, index }: Props) {
  const href = `/${update.category.toLowerCase()}/${update.slug}`;

  return (
    <article className="group border-b border-rule last:border-b-0 -mx-3 sm:-mx-5">
      <Link
        href={href}
        className="block py-5 sm:py-6 px-3 sm:px-5 grid grid-cols-12 gap-3 sm:gap-5 transition-colors hover:bg-accent-wash/40"
      >
        <div className="col-span-12 md:col-span-2 flex md:block items-baseline gap-3">
          <span className="font-mono text-[12px] text-ink-faint tabular-nums">
            {typeof index === "number"
              ? String(index + 1).padStart(2, "0")
              : `UP-${String(update.number).padStart(3, "0")}`}
          </span>
          <div className="md:mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink">
            {shortDate(update.updated)}
          </div>
        </div>
        <div className="col-span-12 md:col-span-7 min-w-0">
          {update.source && (
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent mb-2">
              {update.source}
            </div>
          )}
          <h2 className="font-display font-semibold text-ink leading-[1.18] tracking-[-0.015em] text-[1.15rem] sm:text-[1.35rem] md:text-[1.5rem] group-hover:text-accent-deep transition-colors wrap-anywhere hyphens-auto">
            {update.title}
          </h2>
          <p className="mt-2 max-w-[60ch] text-[14px] sm:text-[15px] leading-[1.55] text-ink-soft wrap-anywhere">
            {update.abstract}
          </p>
        </div>
        <div className="col-span-12 md:col-span-3 md:text-right flex md:block flex-wrap items-baseline gap-x-3 gap-y-1">
          <div className="text-[13px] text-ink-soft">By {update.author}</div>
          <div className="md:mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
            {update.readingMinutes} min read
          </div>
        </div>
      </Link>
    </article>
  );
}
