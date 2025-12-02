import { ArrowRight } from "lucide-react";
import { CalendarLayoutIcon } from "@plane/propel/icons";
import { cn, renderFormattedDate } from "@plane/utils";

export const DisplayDates = (props: {
  startDate: string | null | undefined;
  endDate: string | null | undefined;
  className?: string;
}) => {
  const { startDate, endDate, className } = props;
  return (
    <div className={cn("flex items-center gap-1 text-custom-text-300 flex-wrap", className)}>
      <CalendarLayoutIcon className="size-4 flex-shrink-0" />
      <div className="text-sm flex-shrink-0"> {renderFormattedDate(startDate)}</div>
      {startDate && endDate && <ArrowRight className="h-3 w-3 flex-shrink-0" />}
      <div className="text-sm flex-shrink-0"> {renderFormattedDate(endDate)}</div>
    </div>
  );
};
