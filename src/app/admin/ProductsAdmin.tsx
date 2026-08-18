"use client";

import { useEffect, useState } from "react";

import { PAPER_CATEGORIES } from "@/lib/papers";
import {
  PRODUCT_STATUSES,
  type Product,
  type ProductStatus,
} from "@/lib/products";

type Props = {
  onFlash: (message: string) => void;
  onError: (message: string | null) => void;
  onUnauthorized: () => void;
};

type OpenId = string | "new" | null;

export function ProductsAdmin({ onFlash, onError, onUnauthorized }: Props) {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState<OpenId>(null);

  async function load() {
    setLoading(true);
    onError(null);
    try {
      const res = await fetch("/api/products?includeDelisted=1", {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Failed to load products.");
        setProducts([]);
        return;
      }
      setProducts(data.products);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Network error.");
      setProducts([]);
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
          <div className="kicker mb-2">On the bench</div>
          <h2 className="font-display font-semibold text-[1.4rem] tracking-[-0.02em]">
            Products
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
            {openId === "new" ? "Cancel" : "Add product"}
          </button>
        </div>
      </div>

      {openId === "new" && (
        <div className="border border-rule bg-paper px-4 py-5 sm:px-5">
          <ProductEditor
            mode="create"
            onCancel={() => setOpenId(null)}
            onSaved={(next) => {
              setProducts((curr) => (curr ? [...curr, next] : [next]));
              setOpenId(next.slug);
              onFlash(`${next.name} added`);
            }}
            onError={onError}
            onUnauthorized={onUnauthorized}
          />
        </div>
      )}

      {!products ? (
        <p className="font-display italic text-ink-soft py-6">Loading…</p>
      ) : products.length === 0 && openId !== "new" ? (
        <p className="font-display italic text-ink-soft py-6">
          No products yet. Add the first one.
        </p>
      ) : (
        <ul className="border border-rule divide-y divide-rule">
          {products.map((p) => {
            const expanded = openId === p.slug;
            return (
              <li key={p.slug}>
                <button
                  type="button"
                  onClick={() => toggle(p.slug)}
                  aria-expanded={expanded}
                  className={`w-full cursor-pointer flex items-center gap-3 px-4 py-3 text-left hover:bg-tint/60 transition-colors ${
                    p.listed ? "" : "bg-tint/40"
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
                      p.listed ? "text-ink" : "text-ink-soft"
                    }`}
                  >
                    {p.name}
                  </span>
                  {!p.listed && (
                    <span className="font-mono uppercase tracking-[0.14em] text-[10px] text-ink-faint border border-rule px-1.5 py-px">
                      Delisted
                    </span>
                  )}
                  <span className="ml-auto flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint shrink-0">
                    {p.version ? <span>v{p.version}</span> : null}
                    <span className="hidden sm:inline">{p.license}</span>
                    <span className="text-accent">{p.status}</span>
                    <span className="hidden md:inline">{p.category}</span>
                  </span>
                </button>
                {expanded && (
                  <div className="border-t border-rule-soft px-4 pb-5 pt-4 bg-paper">
                    <ProductEditor
                      mode="edit"
                      product={p}
                      onCancel={() => setOpenId(null)}
                      onSaved={(next) => {
                        setProducts((curr) =>
                          curr
                            ? curr.map((x) => (x.slug === next.slug ? next : x))
                            : curr
                        );
                        onFlash(`${next.name} updated`);
                      }}
                      onDeleted={(slug) => {
                        setProducts((curr) =>
                          curr ? curr.filter((x) => x.slug !== slug) : curr
                        );
                        setOpenId(null);
                        onFlash(`${p.name} deleted`);
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

function ProductEditor({
  mode,
  product,
  onSaved,
  onDeleted,
  onCancel,
  onError,
  onUnauthorized,
}: {
  mode: "create" | "edit";
  product?: Product;
  onSaved: (p: Product) => void;
  onDeleted?: (slug: string) => void;
  onCancel: () => void;
  onError: (message: string | null) => void;
  onUnauthorized: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [tagline, setTagline] = useState(product?.tagline ?? "");
  const [version, setVersion] = useState(product?.version ?? "");
  const [license, setLicense] = useState(product?.license ?? "");
  const [status, setStatus] = useState<ProductStatus>(
    product?.status ?? "Alpha"
  );
  const [category, setCategory] = useState<Product["category"]>(
    product?.category ?? "AI"
  );
  const [description, setDescription] = useState(product?.description ?? "");
  const [installLabel, setInstallLabel] = useState(
    product?.install?.label ?? ""
  );
  const [installCommand, setInstallCommand] = useState(
    product?.install?.command ?? ""
  );
  const [highlightsText, setHighlightsText] = useState(
    product?.highlights.join("\n") ?? ""
  );
  const [listed, setListed] = useState(product?.listed ?? true);
  const [website, setWebsite] = useState(product?.website ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!product) return;
    setName(product.name);
    setTagline(product.tagline);
    setVersion(product.version ?? "");
    setLicense(product.license);
    setStatus(product.status);
    setCategory(product.category);
    setDescription(product.description);
    setInstallLabel(product.install?.label ?? "");
    setInstallCommand(product.install?.command ?? "");
    setHighlightsText(product.highlights.join("\n"));
    setListed(product.listed);
    setWebsite(product.website ?? "");
  }, [product]);

  function normalizeUrl(raw: string): string | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  function slugifyName(value: string) {
    const base = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
    return base.length >= 3 ? base : `${base || "item"}-01`;
  }

  function buildPayload() {
    const highlights = highlightsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const install =
      installLabel.trim() && installCommand.trim()
        ? { label: installLabel.trim(), command: installCommand.trim() }
        : null;
    return {
      name: name.trim(),
      tagline: tagline.trim(),
      version: version.trim() || null,
      license: license.trim(),
      status,
      category,
      description: description.trim(),
      highlights,
      install,
      listed,
      website: normalizeUrl(website),
    };
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    onError(null);
    try {
      const payload = buildPayload();
      const res =
        mode === "create"
          ? await fetch("/api/products", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...payload,
                slug: slugifyName(name),
              }),
            })
          : await fetch(
              `/api/products/${encodeURIComponent(product!.slug)}`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              }
            );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onError(data.error ?? `Save rejected (HTTP ${res.status}).`);
        if (res.status === 401) onUnauthorized();
        return;
      }
      if (!data.product) {
        onError("Server returned an empty response.");
        return;
      }
      onSaved(data.product);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!product || !onDeleted) return;
    if (!window.confirm(`Delete ${product.name}? This cannot be undone.`)) {
      return;
    }
    setDeleting(true);
    onError(null);
    try {
      const res = await fetch(
        `/api/products/${encodeURIComponent(product.slug)}`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onError(data.error ?? `Delete failed (HTTP ${res.status}).`);
        if (res.status === 401) onUnauthorized();
        return;
      }
      onDeleted(product.slug);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        <Field label="Name" className="col-span-12 sm:col-span-6">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={fieldClass}
          />
        </Field>
        <Field label="Version" className="col-span-6 sm:col-span-3">
          <input
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="0.1.0"
            className={fieldClass}
          />
        </Field>
        <Field label="Status" className="col-span-6 sm:col-span-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProductStatus)}
            className={fieldClass}
          >
            {PRODUCT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="License" className="col-span-12 sm:col-span-6">
          <input
            value={license}
            onChange={(e) => setLicense(e.target.value)}
            required
            placeholder="MIT OR Apache-2.0"
            className={fieldClass}
          />
        </Field>
        <Field label="Website or app" className="col-span-12 sm:col-span-6">
          <input
            type="text"
            inputMode="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://rinne.giksn.com"
            className={fieldClass}
          />
        </Field>
        <Field label="Listing" className="col-span-6 sm:col-span-3">
          <select
            value={listed ? "listed" : "delisted"}
            onChange={(e) => setListed(e.target.value === "listed")}
            className={fieldClass}
          >
            <option value="listed">Listed</option>
            <option value="delisted">Delisted</option>
          </select>
        </Field>
        <Field label="Sector" className="col-span-6 sm:col-span-3">
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as Product["category"])
            }
            className={fieldClass}
          >
            {PAPER_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Install label" className="col-span-12 sm:col-span-6">
          <input
            value={installLabel}
            onChange={(e) => setInstallLabel(e.target.value)}
            placeholder="Install (macOS or Linux)"
            className={fieldClass}
          />
        </Field>
        <Field label="Tagline" className="col-span-12">
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            required
            minLength={8}
            className={fieldClass}
          />
        </Field>
        <Field label="Description" className="col-span-12">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            minLength={20}
            rows={4}
            className={`${fieldClass} leading-relaxed resize-y min-h-[6rem]`}
          />
        </Field>
        <Field label="Install command" className="col-span-12">
          <input
            value={installCommand}
            onChange={(e) => setInstallCommand(e.target.value)}
            placeholder="curl … | sh"
            className={`${fieldClass} font-mono text-[13px]`}
          />
        </Field>
        <Field label="Highlights (one per line)" className="col-span-12">
          <textarea
            value={highlightsText}
            onChange={(e) => setHighlightsText(e.target.value)}
            rows={4}
            className={`${fieldClass} leading-relaxed resize-y min-h-[6rem]`}
          />
        </Field>
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
              ? "Create product"
              : "Save product"}
        </button>
      </div>
    </form>
  );
}

const fieldClass =
  "block w-full bg-paper border border-rule focus:border-accent outline-none p-3 text-[14px]";

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={className}>
      <div className="kicker mb-2">{label}</div>
      {children}
    </label>
  );
}
