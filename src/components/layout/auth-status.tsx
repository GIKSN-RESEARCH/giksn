"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

interface AuthStatusProps {
  variant?: "desktop" | "mobile";
  onAction?: () => void;
}

export function AuthStatus({ variant = "desktop", onAction }: AuthStatusProps) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    onAction?.();
    await authClient.signOut();
    router.refresh();
    router.push("/");
  };

  const user = session?.user;
  const role = (user as any)?.role;
  const isAdmin = role === "admin";

  // While loading session (or no user), optimistically render the public "Sign in" UI.
  // For the tiny % of admin/contributor visitors, it will swap to account controls after the background check.
  // This keeps initial HTML correct (Sign in link present for static prerender of public pages) and avoids skeleton for visitors.
  if (isPending || !user) {
    if (variant === "desktop") {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
          render={<Link href="/sign-in" />}
        >
          Sign in
        </Button>
      );
    }

    // mobile: bordered sign in after Join
    return (
      <Link
        href="/sign-in"
        onClick={onAction}
        className="mt-2 rounded-lg border border-border px-3 py-3 text-center text-base font-medium text-muted-foreground hover:text-foreground"
      >
        Sign in
      </Link>
    );
  }

  // Logged in (after session resolved with a user)
  if (variant === "desktop") {
    return (
      <div className="flex items-center gap-2">
        {isAdmin && (
          <Link
            href="/admin"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Sign out
        </Button>
      </div>
    );
  }

  // mobile logged-in actions (appear after Join in the sheet)
  return (
    <>
      {isAdmin && (
        <Link
          href="/admin"
          onClick={onAction}
          className="rounded-lg px-3 py-3 text-base font-medium text-muted-foreground hover:text-foreground"
        >
          Dashboard
        </Link>
      )}
      <button
        onClick={handleSignOut}
        className="rounded-lg px-3 py-3 text-left text-base font-medium text-muted-foreground hover:text-foreground"
      >
        Sign out
      </button>
    </>
  );
}
