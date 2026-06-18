"use client";

import { Button } from "@/components/ui/button";

export type ContentListItemData = {
  id: string;
  title: string;
  meta: string;
  isPublished: boolean;
  isFeatured?: boolean;
};

export function ContentList({
  items,
  emptyMessage,
  onEdit,
  onTogglePublish,
  onToggleFeature,
  onDelete,
  publishLabel = { on: "Publish", off: "Unpublish" },
}: {
  items: ContentListItemData[];
  emptyMessage: string;
  onEdit: (id: string) => void;
  onTogglePublish: (id: string, publish: boolean) => void;
  onToggleFeature?: (id: string, featured: boolean) => void;
  onDelete: (id: string, title: string) => void;
  publishLabel?: { on: string; off: string };
}) {
  if (items.length === 0) {
    return <p className="text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex flex-col justify-between gap-3 rounded-lg border border-border p-4 md:flex-row md:items-center"
        >
          <div>
            <div className="font-medium">
              {item.title}
              {item.isFeatured ? (
                <span className="ml-2 text-xs text-muted-foreground">★ featured</span>
              ) : null}
            </div>
            <div className="text-xs text-muted-foreground">{item.meta}</div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(item.id)}>
              Edit
            </Button>

            {onToggleFeature ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onToggleFeature(item.id, !item.isFeatured)}
              >
                {item.isFeatured ? "Unfeature" : "Feature"}
              </Button>
            ) : null}

            <Button
              size="sm"
              variant={item.isPublished ? "outline" : "default"}
              onClick={() => onTogglePublish(item.id, !item.isPublished)}
            >
              {item.isPublished ? publishLabel.off : publishLabel.on}
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(item.id, item.title)}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}