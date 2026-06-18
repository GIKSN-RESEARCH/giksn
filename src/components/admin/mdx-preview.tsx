"use client";

import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { useEffect, useState } from "react";

import { mdxComponents } from "@/lib/mdx-components";
import { cn } from "@/lib/utils";

export function MdxPreview({
  source,
  className,
}: {
  source: string;
  className?: string;
}) {
  const [serialized, setSerialized] = useState<MDXRemoteSerializeResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!source.trim()) {
      setSerialized(null);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/admin/mdx-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source }),
          signal: controller.signal,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Preview failed");
        }

        setSerialized(data);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Preview failed");
        setSerialized(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 400);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [source]);

  return (
    <div
      className={cn(
        "h-full overflow-auto rounded-lg border border-border bg-card/40 p-4",
        className
      )}
    >
      <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Live preview
      </p>

      {!source.trim() ? (
        <p className="text-sm text-muted-foreground">
          Start writing MDX to see a preview.
        </p>
      ) : loading && !serialized ? (
        <p className="text-sm text-muted-foreground">Rendering preview…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : serialized ? (
        <div className="prose prose-invert max-w-none text-sm">
          <MDXRemote {...serialized} components={mdxComponents} />
        </div>
      ) : null}
    </div>
  );
}