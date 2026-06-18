import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function DomainBadge({
  domain,
  className,
}: {
  domain: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("border-border text-muted-foreground", className)}
    >
      <span
        className="mr-1 inline-block size-1.5 rounded-full bg-foreground/50"
        aria-hidden
      />
      {domain}
    </Badge>
  );
}

export function DomainList({
  domains,
  limit = 3,
  className,
}: {
  domains: string[];
  limit?: number;
  className?: string;
}) {
  if (!domains?.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {domains.slice(0, limit).map((domain) => (
        <DomainBadge key={domain} domain={domain} />
      ))}
    </div>
  );
}