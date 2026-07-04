"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  title: string;
  body?: React.ReactNode;
  kicker?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export function ConfirmDialog({
  open,
  title,
  body,
  kicker = "Confirm",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
  loading,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onCancel();
    }
    document.addEventListener("keydown", onKey);

    // Lock background scroll while open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Defer focus a tick so the portal has mounted
    const t = setTimeout(() => confirmRef.current?.focus(), 0);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      clearTimeout(t);
      previouslyFocused?.focus?.();
    };
  }, [open, loading, onCancel]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-[60] flex items-center justify-center px-4 sm:px-6"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Dismiss"
        disabled={loading}
        onClick={onCancel}
        className="absolute inset-0 bg-ink/60 cursor-default disabled:cursor-not-allowed"
      />

      {/* Panel — flat, hairline-bordered, no rounding, accent rule on top */}
      <div className="relative w-full max-w-[520px] bg-paper border border-rule">
        <div className="border-t-[3px] border-accent" />
        <div className="px-5 sm:px-7 pt-6 sm:pt-7 pb-5 sm:pb-6">
          <div className="kicker mb-3">{kicker}</div>
          <h2
            id="confirm-dialog-title"
            className="font-display font-semibold text-ink leading-[1.1] tracking-[-0.02em] text-[1.35rem] sm:text-[1.55rem] wrap-anywhere"
          >
            {title}
          </h2>
          {body && (
            <div className="mt-4 text-[14px] sm:text-[15px] leading-[1.65] text-ink-soft">
              {body}
            </div>
          )}
        </div>

        <div className="px-5 sm:px-7 py-4 border-t border-rule flex items-center justify-end gap-3 flex-wrap">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="border border-rule px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink hover:bg-tint hover:border-accent transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={
              destructive
                ? "border border-accent-deep bg-accent-deep text-paper px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] hover:bg-accent hover:border-accent transition-colors disabled:opacity-50"
                : "border border-accent bg-accent !text-white px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] hover:bg-accent-deep hover:border-accent-deep transition-colors disabled:opacity-50"
            }
          >
            {loading ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
