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

  // No public sign-in entry point — staff use /sign-in directly; contributors sign in via /invite/[token].
  if (isPending || !user) {
    return null;
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
