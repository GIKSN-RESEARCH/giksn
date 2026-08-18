"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  CATEGORIES,
  paperRef,
  shortDate,
  type Category,
  type Paper,
  type Status,
} from "@/lib/papers";
import { StatusPill } from "@/components/StatusPill";
import { StatusSelect } from "@/components/StatusSelect";
import { KindBadge } from "@/components/KindBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { parseContact } from "@/lib/contact";
import { ProductsAdmin } from "./ProductsAdmin";
import { ProgramsAdmin } from "./ProgramsAdmin";
import { NewsAdmin } from "./NewsAdmin";

type SessionInfo = {
  authenticated: boolean;
  email?: string;
  expiresAt?: string;
};

export function AdminPanel() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [papers, setPapers] = useState<Paper[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [desk, setDesk] = useState<
    "writings" | "products" | "programs" | "news"
  >("writings");
  const [filter, setFilter] = useState<Category | "all">("all");
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Paper | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [purging, setPurging] = useState(false);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/session", { cache: "no-store" });
      const data: SessionInfo = await res.json();
      setSession(data);
      return data;
    } catch {
      setSession({ authenticated: false });
      return { authenticated: false } as SessionInfo;
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const loadPapers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/papers?sort=updated&includeHidden=1", {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load papers.");
        setPapers([]);
      } else {
        setPapers(data.papers);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error.");
      setPapers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.authenticated) loadPapers();
  }, [session?.authenticated, loadPapers]);

  async function purgeCache() {
    setPurging(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/revalidate", {
        method: "POST",
        cache: "no-store",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `Purge failed (HTTP ${res.status}).`);
        if (res.status === 401) await refreshSession();
        return;
      }
      setFlash("Public cache purged");
      setTimeout(() => setFlash(null), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error.");
    } finally {
      setPurging(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setSession({ authenticated: false });
    setPapers(null);
  }

  async function patchPaper(
    p: Paper,
    body: { status?: Status; hidden?: boolean; featured?: boolean },
    flashMessage: string
  ) {
    setPendingSlug(p.slug);
    setFlash(null);
    setError(null);
    try {
      const res = await fetch(
        `/api/papers/${p.category.toLowerCase()}/${encodeURIComponent(p.slug)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const raw = await res.text();
      let data: { error?: string; paper?: Paper } | null = null;
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {}
      }
      if (!res.ok) {
        const message =
          data?.error ??
          (raw && raw.length < 240 ? raw : null) ??
          `Update rejected (HTTP ${res.status} ${res.statusText || ""}).`.trim();
        setError(message);
        if (res.status === 401) await refreshSession();
        return;
      }
      if (!data?.paper) {
        setError("Server returned an empty response.");
        return;
      }
      // If we set featured, every other paper's featured has been cleared
      // in the same DB transaction — reflect that in local state too.
      const newlyFeatured =
        body.featured === true ? { category: p.category, slug: p.slug } : null;
      setPapers((curr) =>
        curr
          ? curr.map((x) => {
              const isTarget =
                x.category === p.category && x.slug === p.slug;
              if (isTarget) {
                return {
                  ...x,
                  status: data!.paper!.status,
                  hidden: data!.paper!.hidden,
                  featured: data!.paper!.featured,
                  updated: data!.paper!.updated,
                };
              }
              if (newlyFeatured && x.featured) {
                return { ...x, featured: false };
              }
              return x;
            })
          : curr
      );
      setFlash(flashMessage);
      setTimeout(() => setFlash(null), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error.");
    } finally {
      setPendingSlug(null);
    }
  }

  function deleteThis(p: Paper) {
    setDeleteTarget(p);
  }

  async function confirmDelete() {
    const p = deleteTarget;
    if (!p) return;
    setDeleteLoading(true);
    setPendingSlug(p.slug);
    setFlash(null);
    setError(null);
    try {
      const res = await fetch(
        `/api/papers/${p.category.toLowerCase()}/${encodeURIComponent(p.slug)}`,
        { method: "DELETE" }
      );
      const raw = await res.text();
      let data: { error?: string; ok?: boolean } | null = null;
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {}
      }
      if (!res.ok) {
        setError(data?.error ?? `Delete failed (HTTP ${res.status}).`);
        if (res.status === 401) await refreshSession();
        return;
      }
      setPapers((curr) =>
        curr
          ? curr.filter((x) => !(x.category === p.category && x.slug === p.slug))
          : curr
      );
      setFlash(`${paperRef(p)} deleted`);
      setTimeout(() => setFlash(null), 2500);
      setDeleteTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error.");
    } finally {
      setDeleteLoading(false);
      setPendingSlug(null);
    }
  }

  function cancelDelete() {
    if (deleteLoading) return;
    setDeleteTarget(null);
  }

  function changeStatus(p: Paper, status: Status) {
    return patchPaper(p, { status }, `${paperRef(p)} → ${status}`);
  }

  function toggleHidden(p: Paper) {
    const next = !p.hidden;
    return patchPaper(
      p,
      { hidden: next },
      `${paperRef(p)} ${next ? "hidden" : "unhidden"}`
    );
  }

  function toggleFeatured(p: Paper) {
    const next = !p.featured;
    return patchPaper(
      p,
      { featured: next },
      next
        ? `${paperRef(p)} is now the featured post`
        : `${paperRef(p)} unfeatured`
    );
  }

  const filtered = useMemo(() => {
    if (!papers) return null;
    return filter === "all"
      ? papers
      : papers.filter((p) => p.category === filter);
  }, [papers, filter]);

  if (!session) {
    return <p className="font-display italic text-ink-soft py-10">Loading…</p>;
  }

  if (!session.authenticated) {
    return <LoginForm onLoggedIn={refreshSession} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-rule">
        <div className="flex items-center gap-2 flex-wrap">
          {(
            [
              ["writings", "Writings"],
              ["products", "Products"],
              ["programs", "Programs"],
              ["news", "News"],
            ] as const
          ).map(([id, label]) => (
            <FilterButton
              key={id}
              active={desk === id}
              onClick={() => setDesk(id)}
            >
              {label}
            </FilterButton>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {flash && (
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
              ✓ {flash}
            </span>
          )}
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint hidden md:inline">
            Signed in as <span className="text-ink normal-case">{session.email}</span>
          </span>
          <button
            type="button"
            onClick={purgeCache}
            disabled={purging}
            className="border border-rule px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] hover:bg-tint hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
            title="Force the public cache to rebuild. Use after direct DB scripts or if pages look stale."
          >
            {purging ? "Purging…" : "Purge cache"}
          </button>
          {desk === "writings" && (
            <button
              type="button"
              onClick={loadPapers}
              disabled={loading}
              className="border border-rule px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] hover:bg-tint transition-colors disabled:opacity-50"
            >
              {loading ? "Loading…" : "Refresh"}
            </button>
          )}
          <button
            type="button"
            onClick={logout}
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint hover:text-accent transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {error && (
        <div className="border border-accent/60 bg-accent-wash p-4 text-[13px] text-ink">
          <span className="font-mono uppercase tracking-[0.14em] text-[11px] text-accent-deep mr-2">
            Error
          </span>
          {error}
        </div>
      )}

      {desk === "writings" && (
        <div className="flex items-center gap-2 flex-wrap">
          <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
            All
            <span className="ml-2 text-ink-faint tabular-nums">
              {papers?.length ?? 0}
            </span>
          </FilterButton>
          {CATEGORIES.map((c) => {
            const n = papers?.filter((p) => p.category === c.code).length ?? 0;
            return (
              <FilterButton
                key={c.code}
                active={filter === c.code}
                onClick={() => setFilter(c.code)}
              >
                {c.code}
                <span className="ml-2 text-ink-faint tabular-nums">{n}</span>
              </FilterButton>
            );
          })}
        </div>
      )}

      {desk === "writings" && !papers ? (
        <p className="font-display italic text-ink-soft py-10">Loading…</p>
      ) : desk === "writings" && filtered && filtered.length === 0 ? (
        <p className="font-display italic text-ink-soft py-10">
          No papers yet. {filter !== "all" ? `Filter: ${filter}.` : null}
        </p>
      ) : desk === "writings" ? (
        <div className="border border-rule overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-tint border-b border-rule">
              <tr className="text-left font-mono uppercase tracking-[0.14em] text-[11px] text-ink-faint">
                <th className="px-4 py-3">Ref</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {filtered!.map((p) => (
                <tr
                  key={`${p.category}-${p.slug}`}
                  className={`align-top ${p.hidden ? "bg-tint/40" : ""}`}
                >
                  <td className="px-4 py-3 font-mono text-[11px] tracking-[0.14em] text-accent whitespace-nowrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>{paperRef(p)}</span>
                      <KindBadge kind={p.kind} />
                      {p.featured && (
                        <span className="font-mono uppercase tracking-[0.14em] text-[10px] text-paper bg-accent px-1.5 py-px">
                          ★ Featured
                        </span>
                      )}
                      {p.hidden && (
                        <span className="font-mono uppercase tracking-[0.14em] text-[10px] text-ink-faint border border-rule px-1.5 py-px">
                          Hidden
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={`px-4 py-3 ${p.hidden ? "opacity-60" : ""}`}>
                    <Link
                      href={`/${p.category.toLowerCase()}/${p.slug}`}
                      className="font-display font-medium text-ink hover:text-accent-deep tracking-[-0.01em]"
                    >
                      {p.title}
                    </Link>
                    <div className="mt-1 text-[12px] text-ink-faint truncate max-w-[60ch]">
                      {p.abstract}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-ink-soft whitespace-nowrap">
                    {p.author}
                    <div className="text-ink-faint font-mono text-[11px] break-all">
                      {(() => {
                        const c = parseContact(p.authorHandle);
                        if (!c.handle) return "—";
                        const display =
                          c.platform === "twitter" || c.platform === "telegram"
                            ? `@${c.handle}`
                            : c.handle;
                        return c.url ? (
                          <a
                            href={c.url}
                            target={c.platform === "email" ? undefined : "_blank"}
                            rel={c.platform === "email" ? undefined : "noreferrer"}
                            className="hover:text-accent"
                          >
                            {display}
                          </a>
                        ) : (
                          display
                        );
                      })()}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-ink-faint whitespace-nowrap">
                    {shortDate(p.updated)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusPill status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      <StatusSelect
                        value={p.status}
                        disabled={pendingSlug === p.slug}
                        onChange={(next) => changeStatus(p, next)}
                      />
                      <button
                        type="button"
                        onClick={() => toggleFeatured(p)}
                        disabled={pendingSlug === p.slug || p.hidden}
                        className={[
                          "border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors disabled:opacity-50",
                          p.featured
                            ? "border-accent text-accent hover:bg-accent hover:text-paper"
                            : "border-rule text-ink-soft hover:text-ink hover:bg-tint hover:border-accent",
                        ].join(" ")}
                        aria-label={
                          p.featured ? "Unfeature paper" : "Feature paper"
                        }
                        title={
                          p.hidden
                            ? "Un-hide the paper first"
                            : p.featured
                              ? "Currently featured on the home page. Click to unfeature."
                              : "Feature this paper on the home page"
                        }
                      >
                        {p.featured ? "★ Featured" : "Feature"}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleHidden(p)}
                        disabled={pendingSlug === p.slug}
                        className="border border-rule px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft hover:text-ink hover:bg-tint hover:border-accent transition-colors disabled:opacity-50"
                        aria-label={p.hidden ? "Unhide paper" : "Hide paper"}
                      >
                        {p.hidden ? "Unhide" : "Hide"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteThis(p)}
                        disabled={pendingSlug === p.slug}
                        className="border border-rule px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint hover:text-paper hover:bg-accent-deep hover:border-accent-deep transition-colors disabled:opacity-50"
                        aria-label="Delete paper"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {desk === "products" && (
        <ProductsAdmin
          onFlash={(message) => {
            setFlash(message);
            setTimeout(() => setFlash(null), 2500);
          }}
          onError={setError}
          onUnauthorized={() => {
            refreshSession();
          }}
        />
      )}

      {desk === "programs" && (
        <ProgramsAdmin
          onFlash={(message) => {
            setFlash(message);
            setTimeout(() => setFlash(null), 2500);
          }}
          onError={setError}
          onUnauthorized={() => {
            refreshSession();
          }}
        />
      )}

      {desk === "news" && (
        <NewsAdmin
          onFlash={(message) => {
            setFlash(message);
            setTimeout(() => setFlash(null), 2500);
          }}
          onError={setError}
          onUnauthorized={() => {
            refreshSession();
          }}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        kicker="Delete paper"
        destructive
        confirmLabel="Delete permanently"
        cancelLabel="Cancel"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title={
          deleteTarget
            ? `Delete ${paperRef(deleteTarget)}: "${deleteTarget.title}"?`
            : ""
        }
        body={
          <>
            <p>
              This removes the paper and{" "}
              <span className="text-ink">every comment under it</span>. The
              archive entry, the URL, and the discussion thread all disappear.
            </p>
            <p className="mt-3 font-display italic">
              This cannot be undone. If you only want to take it off public
              surfaces, use <span className="text-ink not-italic">Hide</span>{" "}
              instead.
            </p>
          </>
        }
      />
    </div>
  );
}

function FilterButton({
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
      className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] border transition-colors ${
        active
          ? "border-accent bg-accent !text-white"
          : "border-rule text-ink hover:bg-tint"
      }`}
    >
      {children}
    </button>
  );
}

function LoginForm({ onLoggedIn }: { onLoggedIn: () => Promise<SessionInfo> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Login failed.");
        setSubmitting(false);
        return;
      }
      await onLoggedIn();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Network error.");
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-12 gap-10">
      <div className="col-span-12 md:col-span-7">
        <div className="kicker mb-3">Sign in</div>
        <h2 className="font-display font-semibold text-[1.8rem] leading-[1.05] tracking-[-0.02em] mb-3">
          Email and password.
        </h2>
        <p className="font-display italic text-ink-soft text-[15px] leading-[1.55] mb-6 max-w-[60ch]">
          Sign in once and stay signed in for 30 days. The session is held in
          an HttpOnly cookie. No token to copy, no token to leak.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-[480px]">
          <label className="block">
            <div className="kicker mb-2">Email</div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
              className="block w-full bg-paper border border-rule focus:border-accent outline-none p-3 text-[15px]"
            />
          </label>
          <label className="block">
            <div className="kicker mb-2">Password</div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="block w-full bg-paper border border-rule focus:border-accent outline-none p-3 font-mono text-[14px]"
            />
          </label>
          {err && (
            <div className="border border-accent/60 bg-accent-wash p-3 text-[13px] text-ink">
              {err}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="bg-accent !text-white px-6 py-3 font-mono text-[12px] uppercase tracking-[0.16em] hover:bg-accent-deep transition-colors disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Continue →"}
          </button>
        </form>
      </div>
      <aside className="col-span-12 md:col-span-5 md:border-l md:border-rule md:pl-8">
        <div className="kicker mb-3">What you can do here</div>
        <ul className="space-y-3 text-[14px] text-ink-soft leading-[1.6]">
          <li>
            <span className="text-ink font-medium">Edit products.</span>{" "}
            Version, license, status and the rest of the product card.
          </li>
          <li>
            <span className="text-ink font-medium">Filter by sector.</span>{" "}
            AI, DT, HW, DS, UP, or all of them.
          </li>
          <li>
            <span className="text-ink font-medium">Audit at a glance.</span> The
            list is sorted by last activity.
          </li>
        </ul>
        <div className="mt-8 divider-dashed" />
        <p className="mt-6 text-[13px] text-ink-faint leading-[1.65]">
          Admin accounts live in the database. Create one from the terminal:{" "}
          <code className="font-mono whitespace-nowrap">npm run admin -- create you@email.com password</code>.
          Reset with <code className="font-mono">reset</code>; list with{" "}
          <code className="font-mono">list</code>.
        </p>
      </aside>
    </div>
  );
}
