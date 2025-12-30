import { calculateTimeAgoShort, cn } from "@plane/utils";

type TimeDisplayProps = {
  timestamp: string;
  className?: string;
  showResolved?: boolean;
};

export function PageCommentTimestampDisplay({ timestamp, className = "", showResolved = false }: TimeDisplayProps) {
  return (
    <div className={cn("text-tertiary text-10 leading-3.5 overflow-hidden text-ellipsis whitespace-nowrap", className)}>
      {calculateTimeAgoShort(timestamp)}
      {showResolved && <span className="ml-2 text-success-primary">Resolved</span>}
    </div>
  );
}
