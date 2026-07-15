"use client";

import { useMemo, useState } from "react";
import {
  CATEGORIES,
  KINDS,
  PAPER_CATEGORIES,
  STATUSES,
  isUpdate,
  type Category,
  type Kind,
  type Paper,
  type Status,
} from "@/lib/papers";
import { PaperRow } from "@/components/PaperRow";

type SortKey = "recent" | "oldest" | "most-replies" | "reference";

type Props = {
  papers: Paper[];
  // Number of items per page in the result list
  pageSize?: number;
  // When this filter bar is embedded inside a single-category page,
  // hide the Category chips since they're redundant.
  hideCategoryFilter?: boolean;
  // Pre-populate state from URL when arriving from the hero search.
  initialQuery?: string;
  initialCategories?: Category[];
  initialStatuses?: Status[];
  initialKind?: Kind | "all";
  initialSort?: SortKey;
};

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Recent edit" },
  { value: "oldest", label: "Oldest first" },
  { value: "most-replies", label: "Most replies" },
  { value: "reference", label: "Reference (A→Z)" },
];

const paperCategoryList = CATEGORIES.filter((c) =>
  (PAPER_CATEGORIES as readonly string[]).includes(c.code)
);

function categoryFilterList(papers: Paper[]) {
  const hasUpdates = papers.some((p) => isUpdate(p.category));
  if (!hasUpdates) return paperCategoryList;
  const updatesCat = CATEGORIES.find((c) => c.code === "UP");
  return updatesCat ? [...paperCategoryList, updatesCat] : paperCategoryList;
}

function countReplies(p: Paper): number {
  return p.discussion.reduce(
    (n, c) => n + 1 + (c.replies?.length ?? 0),
    0
  );
}

export function FilteredPapersList({
  papers,
  pageSize = 12,
  hideCategoryFilter = false,
  initialQuery = "",
  initialCategories,
  initialStatuses,
  initialKind = "all",
  initialSort = "recent",
}: Props) {
  const hasInitialFilters =
    Boolean(initialQuery) ||
    (initialCategories && initialCategories.length > 0) ||
    (initialStatuses && initialStatuses.length > 0) ||
    initialKind !== "all" ||
    initialSort !== "recent";

  const [query, setQuery] = useState(initialQuery);
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(
    new Set(initialCategories ?? [])
  );
  const [activeStatuses, setActiveStatuses] = useState<Set<Status>>(
    new Set(initialStatuses ?? [])
  );
  const [kindFilter, setKindFilter] = useState<Kind | "all">(initialKind);
  const [sort, setSort] = useState<SortKey>(initialSort);
  const [page, setPage] = useState(1);
  // When the page loads with filters already applied (from hero search),
  // open the filter panel so users can see what's active.
  const [mobileOpen, setMobileOpen] = useState(hasInitialFilters);
  const categories = categoryFilterList(papers);

  const activeFilterCount =
    (query.trim() ? 1 : 0) +
    activeCategories.size +
    activeStatuses.size +
    (kindFilter === "all" ? 0 : 1) +
    (sort === "recent" ? 0 : 1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = papers.filter((p) => {
      if (activeCategories.size > 0 && !activeCategories.has(p.category as Category)) {
        return false;
      }
      if (activeStatuses.size > 0 && !activeStatuses.has(p.status)) {
        return false;
      }
      if (kindFilter !== "all" && p.kind !== kindFilter) return false;
      if (q) {
        const hay = `${p.title} ${p.abstract} ${p.author} ${p.authorHandle}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return new Date(a.updated).getTime() - new Date(b.updated).getTime();
        case "most-replies":
          return countReplies(b) - countReplies(a);
        case "reference":
          return (
            a.category.localeCompare(b.category) || a.number - b.number
          );
        case "recent":
        default:
          return new Date(b.updated).getTime() - new Date(a.updated).getTime();
      }
    });

    return list;
  }, [papers, query, activeCategories, activeStatuses, kindFilter, sort]);

  // Reset to page 1 whenever filters change
  const filterSignature = `${query}|${[...activeCategories].join(",")}|${[
    ...activeStatuses,
  ].join(",")}|${kindFilter}|${sort}`;
  useMemo(() => {
    setPage(1);
  }, [filterSignature]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(totalPages, page);
  const pageStartIndex = (currentPage - 1) * pageSize;
  const paged = filtered.slice(pageStartIndex, currentPage * pageSize);

  function toggle<T>(set: Set<T>, value: T, setter: (s: Set<T>) => void) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  }

  function clearAll() {
    setQuery("");
    setActiveCategories(new Set());
    setActiveStatuses(new Set());
    setKindFilter("all");
    setSort("recent");
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="border border-rule bg-paper mb-6 sm:mb-8">
        {/* Search input + mobile toggle */}
        <div className="flex items-stretch border-b border-rule">
          <div className="flex-1 flex items-center gap-3 px-4 py-3">
            <svg
              width="16"
              height="16"
              className="w-4 h-4 text-ink-faint flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                hideCategoryFilter
                  ? "Search this sector"
                  : "Search papers and updates by title, abstract, or author"
              }
              className="flex-1 bg-transparent outline-none text-[14px] sm:text-[15px] placeholder:text-ink-faint"
              aria-label="Search"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint hover:text-accent transition-colors"
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden border-l border-rule px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink hover:bg-tint transition-colors flex items-center gap-2"
            aria-expanded={mobileOpen}
            aria-controls="filter-options"
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-accent !text-white px-1.5 py-0.5 text-[10px] tabular-nums">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter options (collapsible on mobile) */}
        <div
          id="filter-options"
          className={`${mobileOpen ? "block" : "hidden"} md:block`}
        >
          {!hideCategoryFilter && (
            <FilterRow label="Sector">
              {categories.map((c) => (
                <FilterChip
                  key={c.code}
                  active={activeCategories.has(c.code as Category)}
                  onClick={() =>
                    toggle(
                      activeCategories,
                      c.code as Category,
                      setActiveCategories
                    )
                  }
                >
                  {c.label}
                </FilterChip>
              ))}
            </FilterRow>
          )}
          <FilterRow label="Status">
            {STATUSES.map((s) => (
              <FilterChip
                key={s}
                active={activeStatuses.has(s)}
                onClick={() => toggle(activeStatuses, s, setActiveStatuses)}
              >
                {s}
              </FilterChip>
            ))}
          </FilterRow>
          <FilterRow label="Kind">
            <FilterChip
              active={kindFilter === "all"}
              onClick={() => setKindFilter("all")}
            >
              All
            </FilterChip>
            {KINDS.map((k) => (
              <FilterChip
                key={k.code}
                active={kindFilter === k.code}
                onClick={() => setKindFilter(k.code)}
              >
                {k.label}
              </FilterChip>
            ))}
          </FilterRow>
          <div className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                Sort by
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="bg-paper border border-rule px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.12em] text-ink focus:border-accent focus:outline-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent hover:text-accent-deep transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Result summary */}
      <div className="flex items-baseline justify-between gap-3 flex-wrap mb-4 sm:mb-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
          {filtered.length === 0 ? (
            <>
              Showing{" "}
              <span className="text-ink tabular-nums">0</span> papers
            </>
          ) : totalPages > 1 ? (
            <>
              Showing{" "}
              <span className="text-ink tabular-nums">
                {pageStartIndex + 1}–{Math.min(currentPage * pageSize, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="text-ink tabular-nums">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "paper" : "papers"}
            </>
          ) : (
            <>
              Showing{" "}
              <span className="text-ink tabular-nums">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "paper" : "papers"}
              {filtered.length !== papers.length && (
                <>
                  {" "}
                  of{" "}
                  <span className="text-ink-soft tabular-nums">
                    {papers.length}
                  </span>
                </>
              )}
            </>
          )}
        </p>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-display italic text-ink-soft text-[15px]">
            No papers match these filters.
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-4 inline-block font-mono text-[11px] uppercase tracking-[0.14em] text-accent hover:text-accent-deep transition-colors"
          >
            Clear all filters →
          </button>
        </div>
      ) : (
        <>
          <div>
            {paged.map((p, i) => (
              <PaperRow
                key={`${p.category}-${p.number}`}
                paper={p}
                index={pageStartIndex + i}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <FilterPagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filtered.length}
              onPage={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-rule-soft px-4 py-3 flex items-center gap-3 flex-wrap">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint w-16 sm:w-20 flex-shrink-0">
        {label}
      </span>
      <div className="flex items-center gap-1.5 flex-wrap">{children}</div>
    </div>
  );
}

function FilterChip({
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
      className={[
        "px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] border transition-colors",
        active
          ? "bg-accent !text-white border-accent"
          : "border-rule text-ink-soft hover:border-accent hover:text-accent",
      ].join(" ")}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

function FilterPagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPage,
}: {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPage: (p: number) => void;
}) {
  const firstItem = (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, totalItems);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav
      aria-label="Result pages"
      className="mt-8 pt-6 border-t border-rule flex items-center justify-between gap-4 flex-wrap"
    >
      <PagerIconButton
        direction="prev"
        disabled={!hasPrev}
        onClick={() => onPage(currentPage - 1)}
        label="Previous page"
      />
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint tabular-nums">
        {firstItem}–{lastItem} of {totalItems} · Page {currentPage} of{" "}
        {totalPages}
      </span>
      <PagerIconButton
        direction="next"
        disabled={!hasNext}
        onClick={() => onPage(currentPage + 1)}
        label="Next page"
      />
    </nav>
  );
}

function PagerIconButton({
  direction,
  disabled,
  onClick,
  label,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={[
        "inline-flex h-10 w-10 items-center justify-center border transition-colors",
        disabled
          ? "border-rule-soft text-ink-faint cursor-not-allowed"
          : "border-rule text-ink cursor-pointer hover:border-accent hover:text-accent",
      ].join(" ")}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="block"
      >
        {direction === "prev" ? (
          <path d="M15 6 9 12l6 6" />
        ) : (
          <path d="m9 6 6 6-6 6" />
        )}
      </svg>
    </button>
  );
}
