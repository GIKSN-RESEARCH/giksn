import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Section({
  id,
  children,
  className,
  containerClassName,
  fullBleed,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  fullBleed?: boolean;
}) {
  return (
    <section id={id} className={cn("relative py-24 sm:py-32", className)}>
      {fullBleed ? (
        <div className="relative z-10">{children}</div>
      ) : (
        <div
          className={cn(
            "relative z-10 w-full site-gutter-x",
            containerClassName,
          )}
        >
          {children}
        </div>
      )}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  gradient,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  gradient?: boolean;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
      )}
    >
      {eyebrow ? (
        <p className="accent-line text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "mt-4 pb-2 text-3xl font-semibold tracking-tight leading-tight sm:text-4xl lg:text-5xl",
          gradient ? "text-gradient-subtle" : "text-foreground",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p className="pt-12 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}