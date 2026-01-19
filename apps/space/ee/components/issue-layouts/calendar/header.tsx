/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

import { observer } from "mobx-react";
import { ChevronLeftIcon, ChevronRightIcon } from "@plane/propel/icons";

// components
// icons
import { useCalendarView } from "@/plane-web/hooks/store/use-calendar-view";
import { CalendarMonthsDropdown } from "./dropdowns";

interface ICalendarHeader {
  calendarLayout: "month" | "week" | undefined;
  setSelectedDate: (date: Date) => void;
}

export const CalendarHeader = observer(function CalendarHeader(props: ICalendarHeader) {
  const { setSelectedDate, calendarLayout } = props;

  const issueCalendarView = useCalendarView();

  const { activeMonthDate, activeWeekDate } = issueCalendarView.calendarFilters;

  const handlePrevious = () => {
    if (calendarLayout === "month") {
      const previousMonthYear =
        activeMonthDate.getMonth() === 0 ? activeMonthDate.getFullYear() - 1 : activeMonthDate.getFullYear();
      const previousMonthMonth = activeMonthDate.getMonth() === 0 ? 11 : activeMonthDate.getMonth() - 1;

      const previousMonthFirstDate = new Date(previousMonthYear, previousMonthMonth, 1);

      issueCalendarView.updateCalendarFilters({
        activeMonthDate: previousMonthFirstDate,
      });
    } else {
      const previousWeekDate = new Date(
        activeWeekDate.getFullYear(),
        activeWeekDate.getMonth(),
        activeWeekDate.getDate() - 7
      );

      issueCalendarView.updateCalendarFilters({
        activeWeekDate: previousWeekDate,
      });
    }
  };

  const handleNext = () => {
    if (calendarLayout === "month") {
      const nextMonthYear =
        activeMonthDate.getMonth() === 11 ? activeMonthDate.getFullYear() + 1 : activeMonthDate.getFullYear();
      const nextMonthMonth = (activeMonthDate.getMonth() + 1) % 12;

      const nextMonthFirstDate = new Date(nextMonthYear, nextMonthMonth, 1);

      issueCalendarView.updateCalendarFilters({
        activeMonthDate: nextMonthFirstDate,
      });
    } else {
      const nextWeekDate = new Date(
        activeWeekDate.getFullYear(),
        activeWeekDate.getMonth(),
        activeWeekDate.getDate() + 7
      );

      issueCalendarView.updateCalendarFilters({
        activeWeekDate: nextWeekDate,
      });
    }
  };

  const handleToday = () => {
    const today = new Date();
    const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    issueCalendarView.updateCalendarFilters({
      activeMonthDate: firstDayOfCurrentMonth,
      activeWeekDate: today,
    });
    setSelectedDate(today);
  };

  return (
    <div className="mb-4 flex items-center justify-between gap-2 px-3">
      <div className="flex items-center gap-1.5">
        <button type="button" className="grid place-items-center" onClick={handlePrevious}>
          <ChevronLeftIcon height={16} width={16} strokeWidth={2} />
        </button>
        <button type="button" className="grid place-items-center" onClick={handleNext}>
          <ChevronRightIcon height={16} width={16} strokeWidth={2} />
        </button>
        <CalendarMonthsDropdown calendarLayout={calendarLayout} />
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className="rounded-sm bg-layer-2 hover:bg-layer-2-hover px-2.5 py-1 text-11 font-medium text-secondary hover:text-primary"
          onClick={handleToday}
        >
          Today
        </button>
      </div>
    </div>
  );
});
