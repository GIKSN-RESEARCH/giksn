"use client";

import { useState } from "react";
import Link from "next/link";
import { CONSENT_EVENT, CONSENT_STORAGE_KEY, useAnalyticsConsent, type ConsentState } from "@/lib/consent";

export { CONSENT_EVENT, CONSENT_STORAGE_KEY, type ConsentState } from "@/lib/consent";

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
  const consent = useAnalyticsConsent();
  const [dismissed, setDismissed] = useState(false);
  const mounted = consent !== undefined;
  const visible = consent === null && !dismissed;

  function accept() {
    persist("granted");
    setDismissed(true);
  }

  function decline() {
    persist("denied");
    setDismissed(true);
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
