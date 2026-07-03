"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { Category } from "@/lib/papers";
import { InlinePreview, PreviewTabs } from "@/components/BodyPreview";

type Props = {
  category: Category;
  slug: string;
  parentId?: string;
  onPosted?: () => void;
  compact?: boolean;
};

export function CommentForm({ category, slug, parentId, onPosted, compact }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [author, setAuthor] = useState("");
  const [handle, setHandle] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"write" | "preview">("write");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPosting(true);

    try {
      const res = await fetch(
        `/api/papers/${category.toLowerCase()}/${encodeURIComponent(slug)}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            author: author.trim(),
            handle: handle.trim().replace(/^@/, ""),
            body: body.trim(),
            parentId,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to post.");
        setPosting(false);
        return;
      }
      setAuthor("");
      setHandle("");
      setBody("");
      setPosting(false);
      onPosted?.();
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error.");
      setPosting(false);
    }
  }

  return (
    <div
      className={
        compact
          ? "mt-4 border border-rule p-4 bg-tint/40"
          : "mt-10 border border-rule p-6 md:p-8"
      }
    >
      <div className="kicker mb-3">
        {parentId ? "Reply to comment" : "Add to the record"}
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
              Your name
            </span>
            <input
              type="text"
              required
              minLength={2}
              maxLength={120}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. John Doe"
              className="mt-1 block w-full bg-paper border-b border-rule focus:border-accent outline-none py-2 text-[15px]"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
              Handle
            </span>
            <div className="relative mt-1">
              <input
                type="text"
                required
                minLength={2}
                maxLength={80}
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="e.g. https://x.com/johndoe"
                className="block w-full bg-paper border-b border-rule focus:border-accent outline-none py-2 pr-24 text-[15px]"
              />
              <div
                className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2.5 text-ink-faint"
                aria-hidden
              >
                <XIcon className="h-3.5 w-3.5" />
                <LinkedInIcon className="h-3.5 w-3.5" />
                <SubstackIcon className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="mt-1.5 text-[11px] text-ink-faint italic">
              X, LinkedIn or Substack profile link.
            </p>
          </label>
        </div>
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
            {parentId ? "Your reply" : "Reply"}
          </span>
          <div className="mt-1">
            <PreviewTabs mode={mode} onChange={setMode} />
            {mode === "write" ? (
              <textarea
                rows={parentId ? 4 : 6}
                required
                minLength={2}
                maxLength={5000}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="State your position. Cite specifics. Don't argue with the headline."
                className="block w-full bg-paper border border-rule focus:border-accent outline-none p-3 text-[15px] leading-[1.6] resize-y"
              />
            ) : (
              <InlinePreview body={body} />
            )}
          </div>
          <p className="mt-1 text-[11px] text-ink-faint italic">
            Inline: <code className="font-mono not-italic">**bold**</code>{" "}
            <code className="font-mono not-italic">*italic*</code>{" "}
            <code className="font-mono not-italic">`code`</code>{" "}
            <code className="font-mono not-italic">[label](url)</code>
          </p>
        </div>
        {error && (
          <div className="border border-accent/60 bg-accent-wash p-3 text-[13px] text-ink">
            {error}
          </div>
        )}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
            Replies are public and kept permanently.
          </p>
          <button
            type="submit"
            disabled={posting}
            className="bg-accent text-paper px-6 py-3 font-mono text-[12px] uppercase tracking-[0.16em] hover:bg-accent-deep transition-colors disabled:opacity-50"
          >
            {posting ? "Posting…" : parentId ? "Post reply →" : "Post reply →"}
          </button>
        </div>
      </form>
    </div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      role="img"
      aria-label="X"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      role="img"
      aria-label="LinkedIn"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function SubstackIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      role="img"
      aria-label="Substack"
    >
      <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24l10.54-5.888L22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
    </svg>
  );
}
