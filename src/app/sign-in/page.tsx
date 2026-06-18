import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { isActiveContributor } from "@/lib/auth-guard";
import { headers } from "next/headers";

import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    if (session.user.role === "admin") {
      redirect("/admin");
    }
    if (isActiveContributor(session)) {
      redirect("/onboarding");
    }
    redirect("/?error=pending-invitation");
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full space-y-6 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign in to GIKSN</h1>
          <p className="text-muted-foreground mt-2">Admin and contributor access</p>
        </div>

        <SignInForm initialError={error} />

        <p className="text-center text-xs text-muted-foreground">
          Only approved admins and contributors can access protected areas.
          Public content is available without signing in.
        </p>

        <div className="text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
