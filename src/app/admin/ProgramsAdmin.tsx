"use client";

import { useEffect, useState } from "react";

import {
  PROGRAM_PRESET_SECTORS,
  PROGRAM_STATUSES,
  type Program,
  type ProgramStatus,
} from "@/lib/programs";

type Props = {
  onFlash: (message: string) => void;
  onError: (message: string | null) => void;
  onUnauthorized: () => void;
};

type OpenId = string | "new" | null;

export function ProgramsAdmin({ onFlash, onError, onUnauthorized }: Props) {
  const [programs, setPrograms] = useState<Program[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState<OpenId>(null);

  async function load() {
    setLoading(true);
    onError(null);
    try {
      const res = await fetch("/api/programs?includeDelisted=1", {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Failed to load programs.");
        setPrograms([]);
        return;
      }
      setPrograms(data.programs);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Network error.");
      setPrograms([]);
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
          <div className="kicker mb-2">The room</div>
          <h2 className="font-display font-semibold text-[1.4rem] tracking-[-0.02em]">
            Programs
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
            {openId === "new" ? "Cancel" : "Add program"}
          </button>
        </div>
      </div>

      {openId === "new" && (
        <div className="border border-rule bg-paper px-4 py-5 sm:px-5">
          <ProgramEditor
            mode="create"
            onCancel={() => setOpenId(null)}
            onSaved={(next) => {
              setPrograms((curr) => (curr ? [...curr, next] : [next]));
              setOpenId(next.slug);
              onFlash(`${next.name} added`);
            }}
            onError={onError}
            onUnauthorized={onUnauthorized}
          />
        </div>
      )}

      {!programs ? (
        <p className="font-display italic text-ink-soft py-6">Loading…</p>
      ) : programs.length === 0 && openId !== "new" ? (
        <p className="font-display italic text-ink-soft py-6">
          No programs yet. Add the first one.
        </p>
      ) : (
        <ul className="border border-rule divide-y divide-rule">
          {programs.map((p) => {
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
                    <span className="text-accent">
                      {p.startsOn
                        ? p.endsOn
                          ? `${p.startsOn} to ${p.endsOn}`
                          : p.startsOn
                        : p.tentativeStart
                          ? p.tentativeStart
                          : "Upcoming"}
                    </span>
                    <span className="hidden md:inline">
                      {(p.sectors ?? [p.category]).join(" · ")}
                    </span>
                  </span>
                </button>
                {expanded && (
                  <div className="border-t border-rule-soft px-4 pb-5 pt-4 bg-paper">
                    <ProgramEditor
                      mode="edit"
                      program={p}
                      onCancel={() => setOpenId(null)}
                      onSaved={(next) => {
                        setPrograms((curr) =>
                          curr
                            ? curr.map((x) => (x.slug === next.slug ? next : x))
                            : curr
                        );
                        onFlash(`${next.name} updated`);
                      }}
                      onDeleted={(slug) => {
                        setPrograms((curr) =>
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

function ProgramEditor({
  mode,
  program,
  onSaved,
  onDeleted,
  onCancel,
  onError,
  onUnauthorized,
}: {
  mode: "create" | "edit";
  program?: Program;
  onSaved: (p: Program) => void;
  onDeleted?: (slug: string) => void;
  onCancel: () => void;
  onError: (message: string | null) => void;
  onUnauthorized: () => void;
}) {
  const [name, setName] = useState(program?.name ?? "");
  const [tagline, setTagline] = useState(program?.tagline ?? "");
  const [status, setStatus] = useState<ProgramStatus>(
    program?.status ?? "Upcoming"
  );
  const [sectors, setSectors] = useState<string[]>(
    program?.sectors?.length ? program.sectors : program?.category ? [program.category] : []
  );
  const [customSector, setCustomSector] = useState("");
  const [description, setDescription] = useState(program?.description ?? "");
  const [website, setWebsite] = useState(program?.website ?? "");
  const [highlightsText, setHighlightsText] = useState(
    program?.highlights.join("\n") ?? ""
  );
  const [listed, setListed] = useState(program?.listed ?? true);
  const [hasDate, setHasDate] = useState(
    Boolean(program?.startsOn || program?.endsOn)
  );
  const [startsOn, setStartsOn] = useState(program?.startsOn ?? "");
  const [endsOn, setEndsOn] = useState(program?.endsOn ?? "");
  const [tentativeStart, setTentativeStart] = useState(
    program?.tentativeStart ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!program) return;
    setName(program.name);
    setTagline(program.tagline);
    setStatus(program.status);
    setSectors(
      program.sectors?.length
        ? program.sectors
        : program.category
          ? [program.category]
          : []
    );
    setCustomSector("");
    setDescription(program.description);
    setWebsite(program.website ?? "");
    setHighlightsText(program.highlights.join("\n"));
    setListed(program.listed);
    setHasDate(Boolean(program.startsOn || program.endsOn));
    setStartsOn(program.startsOn ?? "");
    setEndsOn(program.endsOn ?? "");
    setTentativeStart(program.tentativeStart ?? "");
  }, [program]);

  function toggleSector(code: string) {
    setSectors((curr) =>
      curr.includes(code) ? curr.filter((s) => s !== code) : [...curr, code]
    );
  }

  function addCustomSector() {
    const next = customSector.trim();
    if (!next) return;
    const exists = sectors.some(
      (s) => s.toLowerCase() === next.toLowerCase()
    );
    if (!exists) setSectors((curr) => [...curr, next]);
    setCustomSector("");
  }

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
    return {
      name: name.trim(),
      tagline: tagline.trim(),
      status,
      sectors,
      description: description.trim(),
      website: normalizeUrl(website),
      highlights: highlightsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      listed,
      startsOn: hasDate && startsOn ? startsOn : null,
      endsOn: hasDate && endsOn ? endsOn : null,
      tentativeStart: tentativeStart.trim() || null,
    };
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    onError(null);
    if (sectors.length === 0) {
      onError("Pick at least one sector.");
      return;
    }
    if (hasDate && startsOn && endsOn && endsOn < startsOn) {
      onError("End date cannot be before the start date.");
      return;
    }
    try {
      const payload = buildPayload();
      const res =
        mode === "create"
          ? await fetch("/api/programs", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...payload,
                slug: slugifyName(name),
              }),
            })
          : await fetch(
              `/api/programs/${encodeURIComponent(program!.slug)}`,
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
      if (!data.program) {
        onError("Server returned an empty response.");
        return;
      }
      onSaved(data.program);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!program || !onDeleted) return;
    if (!window.confirm(`Delete ${program.name}? This cannot be undone.`)) {
      return;
    }
    setDeleting(true);
    onError(null);
    try {
      const res = await fetch(
        `/api/programs/${encodeURIComponent(program.slug)}`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onError(data.error ?? `Delete failed (HTTP ${res.status}).`);
        if (res.status === 401) onUnauthorized();
        return;
      }
      onDeleted(program.slug);
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
        <Field label="Status" className="col-span-6 sm:col-span-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProgramStatus)}
            className={fieldClass}
          >
            {PROGRAM_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
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
        <Field label="Website or apply link" className="col-span-12 sm:col-span-6">
          <input
            type="text"
            inputMode="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://giksn.com/apply"
            className={fieldClass}
          />
        </Field>
        <Field label="Tentative start" className="col-span-12 sm:col-span-6">
          <input
            type="text"
            value={tentativeStart}
            onChange={(e) => setTentativeStart(e.target.value)}
            disabled={hasDate}
            placeholder="e.g. Fall 2026"
            className={`${fieldClass} ${hasDate ? "opacity-50 cursor-not-allowed" : ""}`}
          />
        </Field>
        <div className="col-span-6 sm:col-span-3">
          <div className="flex items-center justify-between gap-2 mb-2 min-h-[1rem]">
            <span className="kicker mb-0">Start</span>
            <label className="inline-flex items-center gap-1.5 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={hasDate}
                onChange={(e) => {
                  setHasDate(e.target.checked);
                  if (!e.target.checked) {
                    setStartsOn("");
                    setEndsOn("");
                  }
                }}
                className="h-3.5 w-3.5 accent-[var(--accent)] cursor-pointer"
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                {hasDate ? "On" : "Off"}
              </span>
            </label>
          </div>
          <input
            type="date"
            value={startsOn}
            onChange={(e) => setStartsOn(e.target.value)}
            disabled={!hasDate}
            required={hasDate}
            className={`${fieldClass} ${hasDate ? "" : "opacity-50 cursor-not-allowed"}`}
          />
        </div>
        <Field label="End" className="col-span-6 sm:col-span-3">
          <input
            type="date"
            value={endsOn}
            onChange={(e) => setEndsOn(e.target.value)}
            disabled={!hasDate}
            required={hasDate}
            min={startsOn || undefined}
            className={`${fieldClass} ${hasDate ? "" : "opacity-50 cursor-not-allowed"}`}
          />
        </Field>
        <div className="col-span-12">
          <div className="kicker mb-2">Sectors</div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {PROGRAM_PRESET_SECTORS.map((code) => {
              const on = sectors.includes(code);
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => toggleSector(code)}
                  className={[
                    "px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] border cursor-pointer transition-colors",
                    on
                      ? "bg-accent !text-white border-accent"
                      : "border-rule text-ink-soft hover:border-accent hover:text-accent",
                  ].join(" ")}
                  aria-pressed={on}
                >
                  {code}
                </button>
              );
            })}
            {sectors
              .filter(
                (s) =>
                  !(PROGRAM_PRESET_SECTORS as readonly string[]).includes(s)
              )
              .map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSector(s)}
                  className="px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] border border-accent bg-accent !text-white cursor-pointer"
                  aria-pressed
                  title="Click to remove"
                >
                  {s} ×
                </button>
              ))}
          </div>
          <div className="flex gap-2">
            <input
              value={customSector}
              onChange={(e) => setCustomSector(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomSector();
                }
              }}
              placeholder="Add a custom sector"
              className={fieldClass}
            />
            <button
              type="button"
              onClick={addCustomSector}
              className="shrink-0 border border-rule px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink hover:border-accent hover:text-accent transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>
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
              ? "Create program"
              : "Save program"}
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
