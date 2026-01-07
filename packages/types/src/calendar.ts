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

export interface ICalendarRange {
  startDate: Date;
  endDate: Date;
}

export interface ICalendarDate {
  date: Date;
  year: number;
  month: number;
  day: number;
  week: number; // week number wrt year, eg- 51, 52
  is_current_month: boolean;
  is_current_week: boolean;
  is_today: boolean;
}

export interface ICalendarWeek {
  [date: string]: ICalendarDate;
}

export interface ICalendarMonth {
  [monthIndex: string]: {
    [weekNumber: string]: ICalendarWeek;
  };
}

export interface ICalendarPayload {
  [year: string]: ICalendarMonth;
}
