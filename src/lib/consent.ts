"use client";

import { useSyncExternalStore } from "react";

export const CONSENT_STORAGE_KEY = "giksn_analytics_consent";
export const CONSENT_EVENT = "giksn:consent-change";
export type ConsentState = "granted" | "denied";

function readConsent(): ConsentState | null {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CONSENT_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function serverSnapshot(): undefined {
  return undefined;
}

export function useAnalyticsConsent() {
  return useSyncExternalStore(subscribe, readConsent, serverSnapshot);
}
