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

export enum E_SORT_ORDER {
  ASC = "asc",
  DESC = "desc",
}
export const DATE_AFTER_FILTER_OPTIONS = [
  {
    name: "1 week from now",
    value: "1_weeks;after;fromnow",
  },
  {
    name: "2 weeks from now",
    value: "2_weeks;after;fromnow",
  },
  {
    name: "1 month from now",
    value: "1_months;after;fromnow",
  },
  {
    name: "2 months from now",
    value: "2_months;after;fromnow",
  },
];

export const DATE_BEFORE_FILTER_OPTIONS = [
  {
    name: "1 week ago",
    value: "1_weeks;before;fromnow",
  },
  {
    name: "2 weeks ago",
    value: "2_weeks;before;fromnow",
  },
  {
    name: "1 month ago",
    i18n_name: "date_filters.1_month_ago",
    value: "1_months;before;fromnow",
  },
];

export const PROJECT_CREATED_AT_FILTER_OPTIONS = [
  {
    name: "Today",
    value: "today;custom;custom",
  },
  {
    name: "Yesterday",
    value: "yesterday;custom;custom",
  },
  {
    name: "Last 7 days",
    value: "last_7_days;custom;custom",
  },
  {
    name: "Last 30 days",
    value: "last_30_days;custom;custom",
  },
];
