"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { SearchForm } from "@/components/content/search-form";

type ContentSearchProps = {
  basePath: string;
  placeholder?: string;
};

function ContentSearchInner({
  basePath,
  placeholder,
}: ContentSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSearch(query: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }

    const next = params.toString();
    router.push(next ? `${basePath}?${next}` : basePath);
  }

  return (
    <SearchForm
      defaultQuery={searchParams.get("q") ?? ""}
      placeholder={placeholder}
      onSearch={handleSearch}
    />
  );
}

export function ContentSearch(props: ContentSearchProps) {
  return (
    <Suspense fallback={null}>
      <ContentSearchInner {...props} />
    </Suspense>
  );
}