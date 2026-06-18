import Link from "next/link";

import { cn } from "@/lib/utils";

type FilterOption = {
  label: string;
  value: string;
};

type ContentFiltersProps = {
  basePath: string;
  filters: Array<{
    param: string;
    label: string;
    options: FilterOption[];
  }>;
  active: Record<string, string | undefined>;
};

const PRESERVED_PARAMS = ["q"] as const;

function buildHref(
  basePath: string,
  active: Record<string, string | undefined>,
  param: string,
  value?: string
) {
  const params = new URLSearchParams();

  for (const [key, val] of Object.entries(active)) {
    if (key === param) continue;
    if (val) params.set(key, val);
  }

  for (const preserved of PRESERVED_PARAMS) {
    if (preserved === param) continue;
    const val = active[preserved];
    if (val) params.set(preserved, val);
  }

  if (value) params.set(param, value);

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function ContentFilters({ basePath, filters, active }: ContentFiltersProps) {
  const hasActive = Object.values(active).some(Boolean);

  return (
    <div className="space-y-4">
      {filters.map((group) => (
        <div key={group.param}>
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {group.label}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildHref(basePath, active, group.param)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition",
                !active[group.param]
                  ? "border-foreground/40 bg-foreground/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              )}
            >
              All
            </Link>
            {group.options.map((option) => (
              <Link
                key={option.value}
                href={buildHref(basePath, active, group.param, option.value)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition",
                  active[group.param] === option.value
                    ? "border-foreground/40 bg-foreground/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                )}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>
      ))}

      {hasActive || active.q ? (
        <Link
          href={active.q ? `${basePath}?q=${encodeURIComponent(active.q)}` : basePath}
          className="inline-block text-xs text-muted-foreground underline hover:text-foreground"
        >
          Clear filters
        </Link>
      ) : null}
    </div>
  );
}