"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import { MobileNav } from "./mobile-nav";
import { Nav } from "./nav";
import { SocialLinks } from "./social-links";

/** Legacy header — superseded by SiteNavbar. Kept for reference with monochrome tokens. */
export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 text-foreground backdrop-blur-md">
      <div className="site-gutter-x flex h-16 w-full items-center justify-between">
        <Link
          href="/"
          className="shrink-0 text-xl font-bold uppercase tracking-[0.15em] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          GIKSN<span className="text-muted-foreground">.</span>
        </Link>

        <Nav className="hidden md:flex" />

        <div className="flex items-center gap-2">
          <SocialLinks className="hidden lg:flex" />
          <Button
            render={<Link href="/join" />}
            size="sm"
            className="hidden sm:inline-flex"
          >
            Join
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}