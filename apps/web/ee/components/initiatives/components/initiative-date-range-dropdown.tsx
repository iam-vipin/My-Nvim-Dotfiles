import type { FC } from "react";
import { differenceInCalendarDays } from "date-fns";
import { observer } from "mobx-react";
// plane imports
import type { DateRange } from "@plane/propel/calendar";
import { getDate, renderFormattedPayloadDate } from "@plane/utils";
// core components
import { DateRangeDropdown } from "@/components/dropdowns/date-range";
// plane Web
import { useInitiatives } from "@/plane-web/hooks/store/use-initiatives";
import type { TInitiative } from "@/plane-web/types/initiative";

type TInitiativeDateRangeDropdownProps = {
  initiative: TInitiative;
  workspaceSlug: string;
};

export const InitiativeDateRangeDropdown = observer(function InitiativeDateRangeDropdown(
  props: TInitiativeDateRangeDropdownProps
) {
  const { initiative, workspaceSlug } = props;
  const {
    initiative: { updateInitiative },
  } = useInitiatives();

  const handleDateChange = (range: DateRange | undefined) => {
    updateInitiative?.(workspaceSlug, initiative.id, {
      start_date: range?.from ? renderFormattedPayloadDate(range.from) : null,
      end_date: range?.to ? renderFormattedPayloadDate(range.to) : null,
    });
  };

  const endDate = getDate(initiative.end_date);
  const shouldHighlightEndDate = endDate && differenceInCalendarDays(endDate, new Date()) <= 0;

  return (
    <DateRangeDropdown
      value={{
        from: getDate(initiative.start_date) || undefined,
        to: endDate || undefined,
      }}
      onSelect={handleDateChange}
      hideIcon={{
        from: false,
      }}
      isClearable
      mergeDates
      buttonVariant={initiative.start_date || initiative.end_date ? "border-with-text" : "border-without-text"}
      buttonClassName={shouldHighlightEndDate ? "text-red-500" : ""}
      showTooltip
      renderPlaceholder={false}
      renderInPortal
    />
  );
});
