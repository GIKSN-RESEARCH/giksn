"use client";

import { useState } from "react";

import {
  CONSENT_EVENT,
  CONSENT_STORAGE_KEY,
  useAnalyticsConsent,
} from "@/lib/consent";

export function AnalyticsControls() {
  const consent = useAnalyticsConsent();
  const state = consent ?? "pending";
  const mounted = consent !== undefined;
  const [flash, setFlash] = useState<string | null>(null);

  function set(next: "granted" | "denied") {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, next);
      window.dispatchEvent(
        new CustomEvent(CONSENT_EVENT, { detail: next })
      );
      setFlash(
        next === "granted"
          ? "Analytics turned on."
          : "Analytics turned off."
      );
      setTimeout(() => setFlash(null), 2500);
    } catch {
      setFlash("Could not save your preference.");
    }
  }

  function reset() {
    try {
      window.localStorage.removeItem(CONSENT_STORAGE_KEY);
      window.dispatchEvent(
        new CustomEvent(CONSENT_EVENT, { detail: null })
      );
      setFlash("Preference cleared. Banner will reappear on next load.");
      setTimeout(() => setFlash(null), 2500);
    } catch {
      setFlash("Could not clear your preference.");
    }
  }

  if (!mounted) {
    return (
      <p className="text-[13px] text-ink-faint italic">Loading preference…</p>
    );
  }

  const label =
    state === "granted"
      ? "Analytics on"
      : state === "denied"
        ? "Analytics off"
        : "Not decided yet";

  return (
    <div>
      <p className="text-[13px] text-ink-soft leading-[1.55]">
        Current preference:{" "}
        <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink">
          {label}
        </span>
      </p>
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => set("granted")}
          className="border border-rule px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink hover:border-accent hover:text-accent transition-colors"
        >
          Turn on
        </button>
        <button
          type="button"
          onClick={() => set("denied")}
          className="border border-rule px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink hover:border-accent hover:text-accent transition-colors"
        >
          Turn off
        </button>
        <button
          type="button"
          onClick={reset}
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint hover:text-accent transition-colors"
        >
          Reset
        </button>
      </div>
      {flash && (
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
          ✓ {flash}
        </p>
      )}
    </div>
  );
}
