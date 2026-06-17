import Link from "next/link";

import { SocialBrandIcon } from "@/components/layout/social-icons";
import { socialLinks } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SocialLinks({
  className,
  iconClassName,
  labelClassName,
  linkClassName,
  variant = "icon",
}: {
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
  linkClassName?: string;
  variant?: "icon" | "text";
}) {
  return (
    <ul className={cn("flex items-center gap-1", className)}>
      {socialLinks.map((link) => (
        <li key={link.label}>
          <Link
            href={link.href}
            target={link.href.startsWith("http") ? "_blank" : undefined}
            rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className={cn(
              variant === "icon"
                ? "inline-flex size-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                : "rounded-lg px-2 py-2 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              linkClassName,
              variant === "icon"
                ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                : "text-muted-foreground hover:text-foreground",
              variant === "icon" ? iconClassName : undefined,
            )}
            aria-label={variant === "icon" ? link.label : undefined}
          >
            {variant === "text" ? (
              link.label
            ) : (
              <SocialBrandIcon icon={link.icon} className={labelClassName} />
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}