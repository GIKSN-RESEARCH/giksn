"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { SearchForm } from "@/components/content/search-form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navLinks } from "@/lib/site";
import { cn } from "@/lib/utils";

import { AuthStatus } from "./auth-status";
import { SocialLinks } from "./social-links";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  function handleSearch(query: string) {
    setOpen(false);
    if (!query) {
      router.push("/publications");
      return;
    }
    router.push(`/publications?q=${encodeURIComponent(query)}`);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="size-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        }
      />
      <SheetContent side="right" className="w-full max-w-sm border-border bg-card">
        <SheetHeader>
          <SheetTitle className="text-left text-foreground">GIKSN Research</SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Search
          </p>
          <SearchForm
            compact
            placeholder="Search publications…"
            onSearch={handleSearch}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Full search also on{" "}
            <Link
              href="/publications"
              onClick={() => setOpen(false)}
              className="underline hover:text-foreground"
            >
              Publications
            </Link>{" "}
            and{" "}
            <Link
              href="/insights"
              onClick={() => setOpen(false)}
              className="underline hover:text-foreground"
            >
              Insights
            </Link>
            .
          </p>
        </div>

        <nav aria-label="Mobile" className="mt-8 flex flex-col gap-1">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-3 text-base font-medium transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/join"
            onClick={() => setOpen(false)}
            className="mt-4 rounded-lg bg-primary px-3 py-3 text-center text-base font-medium text-primary-foreground"
          >
            Join the Community
          </Link>
          <AuthStatus variant="mobile" onAction={() => setOpen(false)} />
        </nav>
        <div className="mt-8 border-t border-border pt-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Follow
          </p>
          <SocialLinks />
        </div>
      </SheetContent>
    </Sheet>
  );
}