"use client";

import { slugFromTitle } from "@/lib/admin/utils";
import { Input } from "@/components/ui/input";

export function SlugFields({
  title,
  slug,
  slugTouched,
  onTitleChange,
  onSlugChange,
  onSlugTouched,
  titleError,
  slugError,
}: {
  title: string;
  slug: string;
  slugTouched: boolean;
  onTitleChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onSlugTouched: (touched: boolean) => void;
  titleError?: string;
  slugError?: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label className="text-sm text-muted-foreground">Title</label>
        <Input
          value={title}
          onChange={(e) => {
            const nextTitle = e.target.value;
            onTitleChange(nextTitle);
            if (!slugTouched) {
              onSlugChange(slugFromTitle(nextTitle));
            }
          }}
          className="mt-1"
        />
        {titleError ? (
          <p className="text-xs text-destructive">{titleError}</p>
        ) : null}
      </div>
      <div>
        <label className="text-sm text-muted-foreground">Slug (kebab-case)</label>
        <Input
          value={slug}
          onChange={(e) => {
            onSlugTouched(true);
            onSlugChange(e.target.value);
          }}
          className="mt-1"
        />
        {slugError ? (
          <p className="text-xs text-destructive">{slugError}</p>
        ) : null}
      </div>
    </div>
  );
}