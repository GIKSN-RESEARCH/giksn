"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CATEGORIES,
  KINDS,
  PAPER_CATEGORIES,
  STATUSES,
  type Category,
  type Kind,
  type Status,
} from "@/lib/papers";

type SortKey = "recent" | "oldest" | "most-replies" | "reference";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Recent edit" },
  { value: "oldest", label: "Oldest first" },
  { value: "most-replies", label: "Most replies" },
  { value: "reference", label: "Reference (A→Z)" },
];

const paperCategoryList = CATEGORIES.filter((c) =>
  (PAPER_CATEGORIES as readonly string[]).includes(c.code)
);

type Props = {
  paperCount: number;
};

export function HeroSearchBar({ paperCount }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(
    new Set()
  );
  const [activeStatuses, setActiveStatuses] = useState<Set<Status>>(new Set());
  const [kindFilter, setKindFilter] = useState<Kind | "all">("all");
  const [sort, setSort] = useState<SortKey>("recent");

  const activeFilterCount =
    activeCategories.size +
    activeStatuses.size +
    (kindFilter === "all" ? 0 : 1) +
    (sort === "recent" ? 0 : 1);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    const q = query.trim();
    if (q) params.set("q", q);
    if (activeCategories.size > 0)
      params.set("category", Array.from(activeCategories).join(","));
    if (activeStatuses.size > 0)
      params.set("status", Array.from(activeStatuses).join(","));
    if (kindFilter !== "all") params.set("kind", kindFilter);
    if (sort !== "recent") params.set("sort", sort);
    const qs = params.toString();
    router.push(qs ? `/archive?${qs}` : "/archive");
  }

  function toggle<T>(set: Set<T>, value: T, setter: (s: Set<T>) => void) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  }

  function clearFilters() {
    setActiveCategories(new Set());
    setActiveStatuses(new Set());
    setKindFilter("all");
    setSort("recent");
  }

  return (
    <form onSubmit={submit} role="search">
      {/* Search row */}
      <div className="border border-rule bg-paper flex items-stretch">
        <label
          htmlFor="hero-search"
          className="hidden sm:flex items-center pl-5 pr-3 text-ink-faint"
          aria-hidden
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
        </label>
        <input
          id="hero-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${paperCount} paper${paperCount === 1 ? "" : "s"} across four sectors`}
          className="flex-1 bg-transparent outline-none px-4 sm:px-2 py-3 sm:py-3 text-[14px] sm:text-[15px] placeholder:text-ink-faint min-w-0"
          aria-label="Search papers"
        />
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="border-l border-rule px-4 sm:px-5 font-mono text-[12px] sm:text-[13px] uppercase tracking-[0.14em] text-ink hover:bg-tint transition-colors flex items-center gap-2"
          aria-expanded={expanded}
          aria-controls="hero-filter-panel"
        >
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-accent text-paper px-1.5 py-0.5 text-[10px] tabular-nums">
              {activeFilterCount}
            </span>
          )}
          <svg
            className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="submit"
          className="bg-accent !text-white px-5 sm:px-8 font-mono text-[12px] sm:text-[13px] uppercase tracking-[0.16em] hover:bg-accent-deep transition-colors border-l border-accent"
        >
          Search
        </button>
      </div>

      {/* Filter panel — expands inline */}
      {expanded && (
        <div
          id="hero-filter-panel"
          className="border-x border-b border-rule bg-paper"
        >
          <FilterRow label="Sector">
            {paperCategoryList.map((c) => (
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
                onClick={clearFilters}
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent hover:text-accent-deep transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}
    </form>
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
          ? "bg-accent text-paper border-accent"
          : "border-rule text-ink-soft hover:border-accent hover:text-accent",
      ].join(" ")}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

export function HeroSearchHints() {
  return (
    <div className="mt-3 flex items-center gap-x-5 gap-y-2 flex-wrap font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
      <span>Or browse:</span>
      <Link href="/archive" className="link-underline hover:text-accent">
        All papers →
      </Link>
      <Link href="/products" className="link-underline hover:text-accent">
        Products →
      </Link>
      <Link href="/ai" className="link-underline hover:text-accent">
        AI research →
      </Link>
    </div>
  );
}
