import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

/**
 * Determine the base URL for auth API calls.
 *
 * In the browser we *always* use the current window.location.origin.
 * This guarantees that client-side calls (useSession, signIn.social, signOut, etc.)
 * target the same origin that served the page.
 *
 * This prevents "Failed to fetch" errors when NEXT_PUBLIC_SITE_URL (or BETTER_AUTH_URL)
 * is set to a production URL while running local dev / previews / IP access etc.
 *
 * Server-side baseURL (used for generating OAuth redirect_uri, magic link URLs, etc.)
 * still respects BETTER_AUTH_URL / NEXT_PUBLIC_SITE_URL so that callbacks are correct.
 */
function getBaseURL() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return (
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"
  );
}

const baseURL = getBaseURL();

export const authClient = createAuthClient({
  baseURL: baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL,
  plugins: [magicLinkClient()],
});
