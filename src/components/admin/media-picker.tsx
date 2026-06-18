"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { deleteMedia, listMedia } from "@/actions/media";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MediaPicker({
  onInsert,
  compact = false,
}: {
  onInsert?: (url: string, alt?: string) => void;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin", "media"],
    queryFn: async () => {
      const result = await listMedia();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMedia,
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
      toast.success("Media deleted");
    },
  });

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
      toast.success("Uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card/30 p-4",
        compact ? "space-y-3" : "space-y-4"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">Media library</h3>
          <p className="text-xs text-muted-foreground">
            Upload to Vercel Blob and insert into MDX.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleUpload(file);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Uploading…" : "Upload file"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading media…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No uploads yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => {
            const isImage = item.mimeType?.startsWith("image/");

            return (
              <div
                key={item.id}
                className="group overflow-hidden rounded-lg border border-border"
              >
                <div className="flex aspect-video items-center justify-center bg-muted/40 p-2">
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt=""
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="px-2 text-center text-xs text-muted-foreground">
                      {item.mimeType ?? "file"}
                    </span>
                  )}
                </div>
                <div className="space-y-2 p-2">
                  <p className="truncate text-[10px] text-muted-foreground">
                    {item.key}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {onInsert ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={() => onInsert(item.url, item.key.split("/").pop())}
                      >
                        Insert
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        void navigator.clipboard.writeText(item.url);
                        toast.success("URL copied");
                      }}
                    >
                      Copy URL
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="h-7 px-2 text-xs"
                      onClick={() => deleteMutation.mutate(item.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}