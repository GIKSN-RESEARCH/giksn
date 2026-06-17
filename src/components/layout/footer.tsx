import Link from "next/link";

import { navLinks, site } from "@/lib/site";

import { SocialLinks } from "./social-links";

const footerLinks = [
  { href: "/join", label: "Contribute" },
  { href: "/contribute/apply", label: "Apply" },
  { href: "/contact", label: "Contact" },
  { href: "/resources", label: "Resources" },
] as const;

export function Footer() {
  return (
    <footer className="relative z-10 overflow-hidden">
      <div className="h-px w-full bg-border" />

      <div className="relative z-10 w-full site-gutter-x py-16 sm:py-20">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="text-2xl font-bold uppercase tracking-[0.15em] text-foreground">
              {site.name}
              <span className="text-muted-foreground">.</span>
            </p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              {site.tagline}
            </p>
            <SocialLinks className="mt-6 gap-2" />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Explore
            </p>
            <ul className="mt-3 space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Get involved
            </p>
            <ul className="mt-3 space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-6 mt-12 h-px bg-border" />

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {site.name}. Community-first frontier
          research.
        </p>
      </div>
    </footer>
  );
}