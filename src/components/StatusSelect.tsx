"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { STATUSES, statusTone, type Status } from "@/lib/papers";

const dotByTone = {
  live: "bg-accent",
  neutral: "bg-ink-soft/50",
  settled: "bg-ink",
} as const;

const POP_MIN_WIDTH = 176;
const POP_GAP = 4;
// Approximate height: 5 rows × 32px each + 2px borders.
const POP_ESTIMATED_HEIGHT = 5 * 32 + 4;

export function StatusSelect({
  value,
  onChange,
  disabled,
}: {
  value: Status;
  onChange: (next: Status) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    right: number;
    flipUp: boolean;
  } | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  function reposition() {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const flipUp =
      spaceBelow < POP_ESTIMATED_HEIGHT + POP_GAP + 8 &&
      rect.top > POP_ESTIMATED_HEIGHT + POP_GAP + 8;
    setCoords({
      top: flipUp
        ? rect.top - POP_GAP - POP_ESTIMATED_HEIGHT
        : rect.bottom + POP_GAP,
      right: Math.max(8, window.innerWidth - rect.right),
      flipUp,
    });
  }

  useLayoutEffect(() => {
    if (!open) return;
    reposition();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => reposition();
    const onResize = () => reposition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (
        triggerRef.current?.contains(t) ||
        popRef.current?.contains(t)
      ) {
        return;
      }
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(next: Status) {
    setOpen(false);
    if (next !== value) onChange(next);
  }

  const popover =
    open && coords && mounted
      ? createPortal(
          <ul
            ref={popRef}
            role="listbox"
            style={{
              position: "fixed",
              top: coords.top,
              right: coords.right,
              minWidth: POP_MIN_WIDTH,
              zIndex: 50,
            }}
            className="bg-paper border border-rule shadow-[0_8px_24px_-12px_rgba(40,30,50,0.18)]"
          >
            {STATUSES.map((s, i) => {
              const active = s === value;
              return (
                <li
                  key={s}
                  role="option"
                  aria-selected={active}
                  className={
                    i < STATUSES.length - 1 ? "border-b border-rule-soft" : ""
                  }
                >
                  <button
                    type="button"
                    onClick={() => pick(s)}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-left font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                      active
                        ? "bg-accent-wash text-accent-deep"
                        : "text-ink hover:bg-tint"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`inline-block h-[6px] w-[6px] rounded-full ${
                        dotByTone[statusTone(s)]
                      }`}
                    />
                    <span>{s}</span>
                    {active && (
                      <span
                        aria-hidden
                        className="ml-auto font-mono text-[10px] tracking-[0.16em] text-accent"
                      >
                        ✓
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`group flex items-center justify-between gap-3 min-w-[148px] bg-paper border border-rule px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink hover:border-accent focus:border-accent outline-none transition-colors disabled:opacity-50 ${
          open ? "border-accent" : ""
        }`}
      >
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className={`inline-block h-[6px] w-[6px] rounded-full ${
              dotByTone[statusTone(value)]
            }`}
          />
          {value}
        </span>
        <svg
          aria-hidden
          viewBox="0 0 10 6"
          className={`h-[6px] w-[10px] text-ink-faint group-hover:text-accent transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="square"
        >
          <path d="M1 1l4 4 4-4" />
        </svg>
      </button>
      {popover}
    </>
  );
}
