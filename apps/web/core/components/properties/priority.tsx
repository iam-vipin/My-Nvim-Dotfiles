import { PriorityIcon } from "@plane/propel/icons";
import { cn } from "@plane/propel/utils";
import type { TIssuePriorities } from "@plane/types";

export function DisplayPriority(props: { priority: TIssuePriorities; className?: string }) {
  const { priority, className } = props;
  return (
    <div className={cn("flex items-center gap-1 text-13 text-tertiary", className)}>
      <PriorityIcon priority={priority} containerClassName={`size-4`} withContainer />
      <div className="capitalize truncate">{priority}</div>
    </div>
  );
}
