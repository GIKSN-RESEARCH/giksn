"use client";

import { useMemo, useState } from "react";
import type { Paper } from "@/lib/papers";
import { UpdateRow } from "@/components/UpdateRow";

type SortKey = "recent" | "oldest" | "a-z";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Recent edit" },
  { value: "oldest", label: "Oldest first" },
  { value: "a-z", label: "Title (A→Z)" },
];

type Props = {
  updates: Paper[];
  pageSize?: number;
};

export function FilteredUpdatesList({ updates, pageSize = 12 }: Props) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<string>("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [page, setPage] = useState(1);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sources = useMemo(() => {
    const set = new Set<string>();
    updates.forEach((u) => {
      if (u.source) set.add(u.source);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [updates]);

  const activeFilterCount =
    (query.trim() ? 1 : 0) +
    (source ? 1 : 0) +
    (sort === "recent" ? 0 : 1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = updates.filter((u) => {
      if (source && u.source !== source) return false;
      if (q) {
        const hay = `${u.title} ${u.abstract} ${u.author} ${u.source ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return new Date(a.updated).getTime() - new Date(b.updated).getTime();
        case "a-z":
          return a.title.localeCompare(b.title);
        case "recent":
        default:
          return new Date(b.updated).getTime() - new Date(a.updated).getTime();
      }
    });

    return list;
  }, [updates, query, source, sort]);

  // Reset page when filters change
  const sig = `${query}|${source}|${sort}`;
  useMemo(() => {
    setPage(1);
  }, [sig]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(totalPages, page);
  const pageStartIndex = (currentPage - 1) * pageSize;
  const paged = filtered.slice(pageStartIndex, currentPage * pageSize);

  function clearAll() {
    setQuery("");
    setSource("");
    setSort("recent");
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="border border-rule bg-paper mb-6 sm:mb-8">
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
              placeholder="Search updates by title, source, or author"
              className="flex-1 bg-transparent outline-none text-[14px] sm:text-[15px] placeholder:text-ink-faint"
              aria-label="Search updates"
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
            aria-controls="updates-filter-options"
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-accent !text-white px-1.5 py-0.5 text-[10px] tabular-nums">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div
          id="updates-filter-options"
          className={`${mobileOpen ? "block" : "hidden"} md:block`}
        >
          {sources.length > 0 && (
            <div className="border-b border-rule-soft px-4 py-3 flex items-center gap-3 flex-wrap">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint w-16 sm:w-20 flex-shrink-0">
                Source
              </span>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="bg-paper border border-rule px-3 py-1.5 font-mono text-[12px] tracking-[0.04em] text-ink focus:border-accent focus:outline-none min-w-[200px]"
              >
                <option value="">All sources</option>
                {sources.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}
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
          Showing{" "}
          <span className="text-ink tabular-nums">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "update" : "updates"}
          {filtered.length !== updates.length && (
            <>
              {" "}
              of{" "}
              <span className="text-ink-soft tabular-nums">{updates.length}</span>
            </>
          )}
        </p>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-display italic text-ink-soft text-[15px]">
            No updates match these filters.
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
            {paged.map((u, i) => (
              <UpdateRow
                key={`${u.category}-${u.number}`}
                update={u}
                index={pageStartIndex + i}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <UpdatesPager
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

function UpdatesPager({
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
      aria-label="Updates pages"
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
