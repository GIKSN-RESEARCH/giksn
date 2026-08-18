"use client";

import { useEffect, useState } from "react";

import { type NewsItem } from "@/lib/news";

type Props = {
  onFlash: (message: string) => void;
  onError: (message: string | null) => void;
  onUnauthorized: () => void;
};

type OpenId = string | "new" | null;

export function NewsAdmin({ onFlash, onError, onUnauthorized }: Props) {
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState<OpenId>(null);

  async function load() {
    setLoading(true);
    onError(null);
    try {
      const res = await fetch("/api/news?includeDelisted=1", {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Failed to load news.");
        setItems([]);
        return;
      }
      setItems(data.news);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Network error.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle(id: OpenId) {
    setOpenId((curr) => (curr === id ? null : id));
  }

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="kicker mb-2">The wire</div>
          <h2 className="font-display font-semibold text-[1.4rem] tracking-[-0.02em]">
            News
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="border border-rule px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] hover:bg-tint transition-colors disabled:opacity-50"
          >
            {loading ? "Loading…" : "Refresh"}
          </button>
          <button
            type="button"
            onClick={() => toggle("new")}
            className="bg-accent !text-white px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] hover:bg-accent-deep transition-colors"
          >
            {openId === "new" ? "Cancel" : "Add news"}
          </button>
        </div>
      </div>

      {openId === "new" && (
        <div className="border border-rule bg-paper px-4 py-5 sm:px-5">
          <NewsEditor
            mode="create"
            onCancel={() => setOpenId(null)}
            onSaved={(next) => {
              setItems((curr) => (curr ? [next, ...curr] : [next]));
              setOpenId(next.slug);
              onFlash(`${next.title} added`);
            }}
            onError={onError}
            onUnauthorized={onUnauthorized}
          />
        </div>
      )}

      {!items ? (
        <p className="font-display italic text-ink-soft py-6">Loading…</p>
      ) : items.length === 0 && openId !== "new" ? (
        <p className="font-display italic text-ink-soft py-6">
          No news yet. Add the first item.
        </p>
      ) : (
        <ul className="border border-rule divide-y divide-rule">
          {items.map((item) => {
            const expanded = openId === item.slug;
            return (
              <li key={item.slug}>
                <button
                  type="button"
                  onClick={() => toggle(item.slug)}
                  aria-expanded={expanded}
                  className={`w-full cursor-pointer flex items-center gap-3 px-4 py-3 text-left hover:bg-tint/60 transition-colors ${
                    item.listed ? "" : "bg-tint/40"
                  }`}
                >
                  <span
                    aria-hidden
                    className="font-mono text-[12px] text-ink-faint w-4 shrink-0"
                  >
                    {expanded ? "−" : "+"}
                  </span>
                  <span
                    className={`font-display font-medium text-[15px] min-w-0 truncate ${
                      item.listed ? "text-ink" : "text-ink-soft"
                    }`}
                  >
                    {item.title}
                  </span>
                  {!item.listed && (
                    <span className="font-mono uppercase tracking-[0.14em] text-[10px] text-ink-faint border border-rule px-1.5 py-px">
                      Delisted
                    </span>
                  )}
                  {item.href && (
                    <span className="ml-auto hidden sm:inline font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint truncate max-w-[28ch]">
                      {item.href}
                    </span>
                  )}
                </button>
                {expanded && (
                  <div className="border-t border-rule-soft px-4 pb-5 pt-4 bg-paper">
                    <NewsEditor
                      mode="edit"
                      item={item}
                      onCancel={() => setOpenId(null)}
                      onSaved={(next) => {
                        setItems((curr) =>
                          curr
                            ? curr.map((x) => (x.slug === next.slug ? next : x))
                            : curr
                        );
                        onFlash(`${next.title} updated`);
                      }}
                      onDeleted={(slug) => {
                        setItems((curr) =>
                          curr ? curr.filter((x) => x.slug !== slug) : curr
                        );
                        setOpenId(null);
                        onFlash(`${item.title} deleted`);
                      }}
                      onError={onError}
                      onUnauthorized={onUnauthorized}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function NewsEditor({
  mode,
  item,
  onSaved,
  onDeleted,
  onCancel,
  onError,
  onUnauthorized,
}: {
  mode: "create" | "edit";
  item?: NewsItem;
  onSaved: (n: NewsItem) => void;
  onDeleted?: (slug: string) => void;
  onCancel: () => void;
  onError: (message: string | null) => void;
  onUnauthorized: () => void;
}) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [href, setHref] = useState(item?.href ?? "");
  const [listed, setListed] = useState(item?.listed ?? true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!item) return;
    setTitle(item.title);
    setHref(item.href ?? "");
    setListed(item.listed);
  }, [item]);

  function slugifyTitle(value: string) {
    const base = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
    return base.length >= 3 ? base : `${base || "news"}-01`;
  }

  function normalizeHref(raw: string): string | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    onError(null);
    const payload = {
      title: title.trim(),
      href: normalizeHref(href),
      listed,
    };
    try {
      const res =
        mode === "create"
          ? await fetch("/api/news", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...payload,
                slug: slugifyTitle(title),
              }),
            })
          : await fetch(`/api/news/${encodeURIComponent(item!.slug)}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onError(data.error ?? `Save rejected (HTTP ${res.status}).`);
        if (res.status === 401) onUnauthorized();
        return;
      }
      if (!data.news) {
        onError("Server returned an empty response.");
        return;
      }
      onSaved(data.news);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!item || !onDeleted) return;
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) {
      return;
    }
    setDeleting(true);
    onError(null);
    try {
      const res = await fetch(`/api/news/${encodeURIComponent(item.slug)}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onError(data.error ?? `Delete failed (HTTP ${res.status}).`);
        if (res.status === 401) onUnauthorized();
        return;
      }
      onDeleted(item.slug);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        <label className="col-span-12">
          <div className="kicker mb-2">Headline</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={4}
            className={fieldClass}
          />
        </label>
        <label className="col-span-12 sm:col-span-8">
          <div className="kicker mb-2">Link (optional)</div>
          <input
            type="text"
            inputMode="url"
            value={href}
            onChange={(e) => setHref(e.target.value)}
            placeholder="https://giksn.com/products"
            className={fieldClass}
          />
        </label>
        <label className="col-span-12 sm:col-span-4">
          <div className="kicker mb-2">Listing</div>
          <select
            value={listed ? "listed" : "delisted"}
            onChange={(e) => setListed(e.target.value === "listed")}
            className={fieldClass}
          >
            <option value="listed">Listed</option>
            <option value="delisted">Delisted</option>
          </select>
        </label>
      </div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="border border-rule px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft hover:text-ink hover:bg-tint transition-colors"
          >
            Close
          </button>
          {mode === "edit" && onDeleted && (
            <button
              type="button"
              onClick={remove}
              disabled={deleting || saving}
              className="border border-rule px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint hover:text-paper hover:bg-accent-deep hover:border-accent-deep transition-colors disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={saving || deleting}
          className="bg-accent !text-white px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] hover:bg-accent-deep transition-colors disabled:opacity-50"
        >
          {saving
            ? "Saving…"
            : mode === "create"
              ? "Create news"
              : "Save news"}
        </button>
      </div>
    </form>
  );
}

const fieldClass =
  "block w-full bg-paper border border-rule focus:border-accent outline-none p-3 text-[14px]";
