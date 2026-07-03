"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

import {
  CONSENT_EVENT,
  CONSENT_STORAGE_KEY,
} from "@/components/ConsentBanner";

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function readConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY) === "granted";
  } catch {
    return false;
  }
}

export function Analytics() {
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    setGranted(readConsent());

    function onChange(e: Event) {
      const detail = (e as CustomEvent<string | null>).detail;
      setGranted(detail === "granted");
    }

    window.addEventListener(CONSENT_EVENT, onChange as EventListener);
    return () =>
      window.removeEventListener(CONSENT_EVENT, onChange as EventListener);
  }, []);

  // Nothing rendered when consent is missing or the measurement ID is not
  // configured, so no network calls are made and no cookies are set.
  if (!MEASUREMENT_ID || !granted) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('consent', 'default', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'analytics_storage': 'granted'
          });
          gtag('config', '${MEASUREMENT_ID}', {
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
            send_page_view: true
          });
        `}
      </Script>
    </>
  );
}
