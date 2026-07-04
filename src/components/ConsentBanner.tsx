"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export const CONSENT_STORAGE_KEY = "giksn_analytics_consent";
export const CONSENT_EVENT = "giksn:consent-change";

export type ConsentState = "granted" | "denied";

function readStored(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (raw === "granted" || raw === "denied") return raw;
    return null;
  } catch {
    return null;
  }
}

function persist(state: ConsentState) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, state);
    window.dispatchEvent(
      new CustomEvent<ConsentState>(CONSENT_EVENT, { detail: state })
    );
  } catch {
    // localStorage may be blocked (private mode, opt-out). Fail silently.
  }
}

export function ConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    setVisible(readStored() === null);
  }, []);

  function accept() {
    persist("granted");
    setVisible(false);
  }

  function decline() {
    persist("denied");
    setVisible(false);
  }

  if (!mounted || !visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-labelledby="consent-banner-title"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-paper shadow-[0_-8px_24px_-16px_rgba(40,30,50,0.16)]"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-4 sm:py-5">
        <div className="grid grid-cols-12 gap-4 items-start md:items-center">
          <div className="col-span-12 md:col-span-8 min-w-0">
            <div
              id="consent-banner-title"
              className="kicker mb-1.5"
            >
              Analytics
            </div>
            <p className="text-[13px] sm:text-[14px] leading-[1.55] text-ink-soft max-w-[70ch]">
              We use Google Analytics to understand which papers are read
              and where readers arrive from. Nothing is loaded until you
              accept. IP addresses are anonymised and advertising signals are
              disabled. Read the{" "}
              <Link href="/privacy" className="link-underline text-ink">
                Privacy Policy
              </Link>{" "}
              for details.
            </p>
          </div>
          <div className="col-span-12 md:col-span-4 flex items-center justify-start md:justify-end gap-2 sm:gap-3 flex-wrap">
            <button
              type="button"
              onClick={decline}
              className="border border-rule px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink hover:border-accent hover:text-accent transition-colors"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={accept}
              className="bg-accent !text-white px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] hover:bg-accent-deep transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function revokeConsent() {
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent<null>(CONSENT_EVENT, { detail: null })
    );
  } catch {
    // ignore
  }
}
