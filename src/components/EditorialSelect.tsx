"use client";

import { useEffect, useRef, useState } from "react";

export type EditorialSelectOption<T extends string> = {
  value: T;
  label: string;
  hint?: string;
};

type Props<T extends string> = {
  value: T;
  options: EditorialSelectOption<T>[];
  onChange: (next: T) => void;
  disabled?: boolean;
  width?: "auto" | "full";
  ariaLabel?: string;
};

export function EditorialSelect<T extends string>({
  value,
  options,
  onChange,
  disabled,
  width = "full",
  ariaLabel,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
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

  const current = options.find((o) => o.value === value) ?? options[0];

  return (
    <div
      ref={ref}
      className={`relative inline-block ${width === "full" ? "w-full" : ""}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={`group flex items-center justify-between gap-3 ${
          width === "full" ? "w-full" : "min-w-[180px]"
        } bg-paper border border-rule px-4 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-ink hover:border-accent focus:border-accent outline-none transition-colors disabled:opacity-50 ${
          open ? "border-accent" : ""
        }`}
      >
        <span className="text-left">{current.label}</span>
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

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 z-30 mt-1 bg-paper border border-rule shadow-[0_8px_24px_-12px_rgba(40,30,50,0.18)]"
        >
          {options.map((opt, i) => {
            const active = opt.value === value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={active}
                className={
                  i < options.length - 1 ? "border-b border-rule-soft" : ""
                }
              >
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    if (opt.value !== value) onChange(opt.value);
                  }}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                    active
                      ? "bg-accent-wash text-accent-deep"
                      : "text-ink hover:bg-tint"
                  }`}
                >
                  <span className="flex-1 min-w-0">
                    <span className="block font-mono text-[12px] uppercase tracking-[0.14em]">
                      {opt.label}
                    </span>
                    {opt.hint && (
                      <span className="block mt-1 font-display italic text-[12px] text-ink-soft leading-[1.45] normal-case tracking-normal">
                        {opt.hint}
                      </span>
                    )}
                  </span>
                  {active && (
                    <span
                      aria-hidden
                      className="font-mono text-[10px] tracking-[0.16em] text-accent shrink-0 mt-0.5"
                    >
                      ✓
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
