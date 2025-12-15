import { useRef } from "react";
import { observer } from "mobx-react";
// types
import type { TGroupedIssues, TPaginationData, ICalendarDate } from "@plane/types";
// plane imports
import { cn } from "@plane/utils";
// plane web
import { MONTHS_LIST } from "@/plane-web/constants/calendar";
import { renderFormattedPayloadDate } from "@/plane-web/helpers/date-time.helper";
import type { IIssue } from "@/types/issue";
//
import { CalendarIssueBlocks } from "./issue-blocks";

type Props = {
  date: ICalendarDate;
  getIssueById: (issueId: string) => IIssue | undefined;
  calendarLayout: "month" | "week" | undefined;
  groupedIssueIds: TGroupedIssues;
  loadMoreIssues: (dateString: string) => void;
  getPaginationData: (groupId: string | undefined) => TPaginationData | undefined;
  getGroupIssueCount: (groupId: string | undefined) => number | undefined;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
};

export const CalendarDayTile = observer(function CalendarDayTile(props: Props) {
  const {
    date,
    getIssueById,
    calendarLayout,
    groupedIssueIds,
    loadMoreIssues,
    getPaginationData,
    getGroupIssueCount,
    selectedDate,
    setSelectedDate,
  } = props;

  const formattedDatePayload = renderFormattedPayloadDate(date.date);

  const dayTileRef = useRef<HTMLDivElement | null>(null);

  if (!formattedDatePayload) return null;
  const issueIds = groupedIssueIds?.[formattedDatePayload];

  const isToday = date.date.toDateString() === new Date().toDateString();
  const isSelectedDate = date.date.toDateString() == selectedDate.toDateString();

  const isWeekend = [0, 6].includes(date.date.getDay());
  const isMonthLayout = calendarLayout === "month";

  const backgroundClasses = isWeekend ? "bg-layer-1" : "bg-surface-1";

  return (
    <>
      <div ref={dayTileRef} className="group relative flex h-full w-full flex-col bg-layer-1">
        {/* header */}
        <div
          className={`hidden flex-shrink-0 items-center justify-end px-2 py-1.5 text-right text-11 md:flex ${
            isMonthLayout // if month layout, highlight current month days
              ? date.is_current_month
                ? "font-medium"
                : "text-tertiary"
              : "font-medium" // if week layout, highlight all days
          } ${isWeekend ? "bg-layer-1" : "bg-surface-1"} `}
        >
          {date.date.getDate() === 1 && MONTHS_LIST[date.date.getMonth() + 1].shortTitle + " "}
          {isToday ? (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-primary text-on-color">
              {date.date.getDate()}
            </span>
          ) : (
            <>{date.date.getDate()}</>
          )}
        </div>

        {/* content */}
        <div className="h-full w-full hidden md:block">
          <div
            className={cn(`h-full w-full select-none ${backgroundClasses}`, {
              "min-h-[5rem]": isMonthLayout,
            })}
          >
            <CalendarIssueBlocks
              date={date.date}
              getIssueById={getIssueById}
              issueIdList={issueIds}
              loadMoreIssues={loadMoreIssues}
              getPaginationData={getPaginationData}
              getGroupIssueCount={getGroupIssueCount}
            />
          </div>
        </div>

        {/* Mobile view content */}
        <div
          onClick={() => setSelectedDate(date.date)}
          className={cn(
            "text-13 py-2.5 h-full w-full font-medium mx-auto flex flex-col justify-start items-center md:hidden cursor-pointer opacity-80",
            {
              "bg-surface-1": !isWeekend,
            }
          )}
        >
          <div
            className={cn("size-6 flex items-center justify-center rounded-full", {
              "bg-accent-primary text-on-color": isSelectedDate,
              "bg-accent-primary/10 text-accent-primary ": isToday && !isSelectedDate,
            })}
          >
            {date.date.getDate()}
          </div>
        </div>
      </div>
    </>
  );
});
