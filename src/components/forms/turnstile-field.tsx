"use client";

import { Turnstile } from "@marsidev/react-turnstile";
import { useState } from "react";

export function TurnstileField() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [token, setToken] = useState("");

  if (!siteKey) {
    return null;
  }

  return (
    <>
      <input type="hidden" name="cf-turnstile-response" value={token} />
      <Turnstile
        siteKey={siteKey}
        onSuccess={setToken}
        onExpire={() => setToken("")}
        onError={() => setToken("")}
        options={{ theme: "dark", size: "normal" }}
      />
    </>
  );
}