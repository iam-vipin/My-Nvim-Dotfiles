import type { ReactNode } from "react";
import { cn } from "@plane/utils";

interface ProBadgeProps {
  className?: string;
}

export function ProBadge({ className }: ProBadgeProps): ReactNode {
  return (
    <div
      className={cn(
        "w-fit rounded text-center text-caption-md-medium px-2 py-0.5 shrink-0 bg-plans-brand-subtle text-plans-brand-primary",
        className
      )}
    >
      Pro
    </div>
  );
}
