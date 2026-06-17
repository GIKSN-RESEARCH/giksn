"use client";

import Image from "next/image";
import Link from "next/link";

import navLogo from "@/../public/1.png";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Nav } from "@/components/layout/nav";
import { SocialLinks } from "@/components/layout/social-links";
import { spaceGrotesk } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const navbarLinkClass = cn(
  spaceGrotesk.className,
  "px-2 py-2 text-md font-medium",
);

export function SiteNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/90 text-foreground backdrop-blur-md">
      <div className="site-gutter-x relative mx-auto flex h-16 w-full items-center justify-between">
        <Link
          href="/"
          className="relative z-10 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="GIKSN Research home"
        >
          <Image
            src={navLogo}
            alt=""
            width={navLogo.width}
            height={navLogo.height}
            priority
            className="size-10 object-contain brightness-0 invert sm:size-11"
          />
        </Link>

        <div
          className={cn(
            "absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2",
            spaceGrotesk.className,
          )}
        >
          <Nav
            className="hidden md:block"
            listClassName="justify-center gap-6"
            linkClassName={navbarLinkClass}
          />
          <MobileNav />
        </div>

        <SocialLinks
          variant="icon"
          className="relative z-10 shrink-0 gap-0.5 sm:gap-1"
        />
      </div>
    </header>
  );
}