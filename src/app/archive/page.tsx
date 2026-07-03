import Link from "next/link";

import { Masthead } from "@/components/Masthead";
import { CategoryNav } from "@/components/CategoryNav";
import { Footer } from "@/components/Footer";
import { FilteredPapersList } from "@/components/FilteredPapersList";
import {
  PAPER_CATEGORIES,
  STATUSES,
  type Category,
  type Kind,
  type Status,
} from "@/lib/papers";
import { listPapersSortedByUpdated } from "@/db/queries";

export const dynamic = "force-dynamic";

type SortKey = "recent" | "oldest" | "most-replies" | "reference";
const VALID_SORTS: readonly SortKey[] = [
  "recent",
  "oldest",
  "most-replies",
  "reference",
];

function parseList<T extends string>(
  raw: string | undefined,
  allowed: readonly T[]
): T[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is T => (allowed as readonly string[]).includes(s));
}

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    status?: string;
    kind?: string;
    sort?: string;
  }>;
}) {
  const all = await listPapersSortedByUpdated({ onlyPapers: true });
  const params = await searchParams;
  const initialQuery = (params.q ?? "").trim();
  const initialCategories = parseList<Category>(
    params.category,
    PAPER_CATEGORIES
  );
  const initialStatuses = parseList<Status>(params.status, STATUSES);
  const kindParam = (params.kind ?? "").trim();
  const initialKind: Kind | "all" =
    kindParam === "Original" || kindParam === "Survey" ? kindParam : "all";
  const sortParam = (params.sort ?? "").trim() as SortKey;
  const initialSort: SortKey = (VALID_SORTS as readonly string[]).includes(
    sortParam
  )
    ? sortParam
    : "recent";

  return (
    <>
      <Masthead />
      <CategoryNav active="ARCHIVE" />
      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 pt-8 sm:pt-12 pb-12 sm:pb-16">
        <header className="pb-8 sm:pb-10 border-b border-rule">
          <div className="kicker mb-3">The archive</div>
          <h1
            className="font-display font-semibold text-ink leading-[1] sm:leading-[0.98] tracking-[-0.03em] sm:tracking-[-0.035em] max-w-[20ch]"
            style={{ fontSize: "clamp(2rem, 5.4vw, 4rem)" }}
          >
            Every <span className="text-accent">paper</span>, sorted by recent
            edit.
          </h1>
          <p className="mt-5 sm:mt-7 max-w-[60ch] text-[15px] sm:text-[18px] leading-[1.55] text-ink-soft font-display italic">
            <span className="tabular-nums">{all.length}</span> paper
            {all.length === 1 ? "" : "s"} across {PAPER_CATEGORIES.length}{" "}
            sectors. The whole record, oldest edits at the bottom.
          </p>
        </header>

        <section className="pt-6 sm:pt-10">
          <div className="flex items-end justify-between gap-3 flex-wrap mb-4 sm:mb-6">
            <div className="kicker">Search the archive</div>
            <Link
              href="/submit"
              className="font-mono text-[11px] uppercase tracking-[0.14em] link-underline"
            >
              Submit a paper →
            </Link>
          </div>
          {all.length === 0 ? (
            <p className="py-12 font-display italic text-ink-soft">
              The archive is empty. Submit the first paper.
            </p>
          ) : (
            <FilteredPapersList
              papers={all}
              pageSize={15}
              initialQuery={initialQuery}
              initialCategories={initialCategories}
              initialStatuses={initialStatuses}
              initialKind={initialKind}
              initialSort={initialSort}
            />
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
