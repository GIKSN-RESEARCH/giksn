"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navLinks } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Nav({
  className,
  listClassName,
  linkClassName,
}: {
  className?: string;
  listClassName?: string;
  linkClassName?: string;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className={className}>
      <ul className={cn("flex items-center gap-1", listClassName)}>
        {navLinks.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  linkClassName,
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}