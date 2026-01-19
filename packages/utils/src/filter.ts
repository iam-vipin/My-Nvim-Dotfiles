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

import { differenceInCalendarDays } from "date-fns/differenceInCalendarDays";
// local imports
import { getDate } from "./datetime";

/**
 * @description calculates the total number of filters applied
 * @param {T} filters
 * @returns {number}
 */
export const calculateTotalFilters = <T>(filters: T): number =>
  filters && Object.keys(filters).length > 0
    ? Object.keys(filters)
        .map((key) => {
          const value = filters[key as keyof T];
          if (value === null) return 0;
          if (Array.isArray(value)) return value.length;
          if (typeof value === "boolean") return value ? 1 : 0;
          return 0;
        })
        .reduce((curr, prev) => curr + prev, 0)
    : 0;

/**
 * @description checks if the date satisfies the filter
 * @param {Date} date
 * @param {string} filter
 * @returns {boolean}
 */
export const satisfiesDateFilter = (date: Date, filter: string): boolean => {
  const [value, operator, from] = filter.split(";");

  const dateValue = getDate(value);
  const differenceInDays = differenceInCalendarDays(date, new Date());

  if (operator === "custom" && from === "custom") {
    if (value === "today") return differenceInDays === 0;
    if (value === "yesterday") return differenceInDays === -1;
    if (value === "last_7_days") return differenceInDays >= -7;
    if (value === "last_30_days") return differenceInDays >= -30;
  }

  if (!from && dateValue) {
    if (operator === "after") return date >= dateValue;
    if (operator === "before") return date <= dateValue;
  }

  if (from === "fromnow") {
    if (operator === "before") {
      if (value === "1_weeks") return differenceInDays <= -7;
      if (value === "2_weeks") return differenceInDays <= -14;
      if (value === "1_months") return differenceInDays <= -30;
    }

    if (operator === "after") {
      if (value === "1_weeks") return differenceInDays >= 7;
      if (value === "2_weeks") return differenceInDays >= 14;
      if (value === "1_months") return differenceInDays >= 30;
      if (value === "2_months") return differenceInDays >= 60;
    }
  }

  return false;
};
