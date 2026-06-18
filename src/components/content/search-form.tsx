"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SearchFormProps = {
  defaultQuery?: string;
  placeholder?: string;
  onSearch: (query: string) => void;
  autoFocus?: boolean;
  compact?: boolean;
};

export function SearchForm({
  defaultQuery = "",
  placeholder = "Search titles and content…",
  onSearch,
  autoFocus = false,
  compact = false,
}: SearchFormProps) {
  const [value, setValue] = useState(defaultQuery);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          name="q"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={compact ? "h-9 pl-9 text-sm" : "pl-9"}
          aria-label="Search content"
        />
      </div>
      <Button type="submit" size={compact ? "sm" : "default"} variant="outline">
        Search
      </Button>
    </form>
  );
}