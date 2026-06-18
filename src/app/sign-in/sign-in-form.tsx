"use client";

import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

interface SignInFormProps {
  initialError?: string;
  callbackURL?: string;
  presetEmail?: string;
}

export function SignInForm({
  initialError,
  callbackURL = "/",
  presetEmail,
}: SignInFormProps) {
  const [email, setEmail] = useState(presetEmail ?? "");
  const [error, setError] = useState<string | null>(initialError || null);
  const [magicSuccess, setMagicSuccess] = useState(false);
  const [loading, setLoading] = useState<"github" | "magic" | null>(null);

  async function handleGitHub() {
    setError(null);
    setLoading("github");
    try {
      const { error: signInError } = await authClient.signIn.social({
        provider: "github",
        callbackURL,
      });
      if (signInError) {
        setError(signInError.message || "Failed to start GitHub sign in.");
        setLoading(null);
      }
      // Successful social sign-in will cause the library to redirect the browser
      // to the provider (GitHub). No further handling needed here.
    } catch (e: any) {
      const msg =
        e?.message === "Failed to fetch"
          ? "Network error reaching the auth server. Make sure you are viewing the site at the same origin as your local dev server (http://localhost:3000 by default) and that the server is running. If you have NEXT_PUBLIC_SITE_URL set to a production URL in .env.local, the client now auto-detects the current page origin (restart dev after .env changes)."
          : e?.message || "Failed to start GitHub sign in.";
      setError(msg);
      setLoading(null);
    }
  }

  async function handleMagicLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;

    setError(null);
    setMagicSuccess(false);
    setLoading("magic");

    try {
      const { error: signInError } = await authClient.signIn.magicLink({
        email: email.trim(),
        callbackURL,
      });

      if (signInError) {
        setError(signInError.message || "Failed to send magic link.");
      } else {
        setMagicSuccess(true);
        setEmail("");
      }
    } catch (e: any) {
      const msg =
        e?.message === "Failed to fetch"
          ? "Network error reaching the auth server. Check that the dev server is running and you are on the correct local URL."
          : e?.message || "Failed to send magic link.";
      setError(msg);
    }
    setLoading(null);
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleGitHub}
        disabled={!!loading}
        variant="outline"
        className="w-full flex items-center justify-center gap-2 py-6 text-base border-border hover:bg-muted"
      >
        {loading === "github" ? "Redirecting to GitHub..." : "Continue with GitHub"}
      </Button>

      <div className="text-center text-sm text-muted-foreground">or</div>

      <form onSubmit={handleMagicLink} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full border border-border bg-background rounded-lg px-4 py-3 disabled:opacity-60"
          required
          disabled={!!loading}
        />
        <Button
          type="submit"
          disabled={!!loading || !email.trim()}
          className="w-full py-6 text-base"
        >
          {loading === "magic" ? "Sending magic link..." : "Send magic link"}
        </Button>
      </form>

      {magicSuccess && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 px-4 py-3 text-center text-sm text-green-600">
          Magic link sent! Check your inbox. (In dev the link URL is logged to your server console.)
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-center text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
