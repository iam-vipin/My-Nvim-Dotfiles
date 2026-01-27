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

import { EStartOfTheWeek } from "@plane/types";
// local imports
import { EXTENDED_PREFERENCE_OPTIONS } from "./profile-extended";

export const PROFILE_VIEWER_TAB = [
  {
    key: "summary",
    route: "",
    i18n_label: "profile.tabs.summary",
    selected: "/",
  },
];

export const PROFILE_ADMINS_TAB = [
  {
    key: "assigned",
    route: "assigned",
    i18n_label: "profile.tabs.assigned",
    selected: "/assigned/",
  },
  {
    key: "created",
    route: "created",
    i18n_label: "profile.tabs.created",
    selected: "/created/",
  },
  {
    key: "subscribed",
    route: "subscribed",
    i18n_label: "profile.tabs.subscribed",
    selected: "/subscribed/",
  },
  {
    key: "activity",
    route: "activity",
    i18n_label: "profile.tabs.activity",
    selected: "/activity/",
  },
];

export const PREFERENCE_OPTIONS: {
  id: string;
  title: string;
  description: string;
}[] = [
  {
    id: "theme",
    title: "theme",
    description: "select_or_customize_your_interface_color_scheme",
  },
  ...EXTENDED_PREFERENCE_OPTIONS,
];

/**
 * @description The options for the start of the week
 * @type {Array<{value: EStartOfTheWeek, label: string}>}
 * @constant
 */
export const START_OF_THE_WEEK_OPTIONS = [
  {
    value: EStartOfTheWeek.SUNDAY,
    label: "Sunday",
  },
  {
    value: EStartOfTheWeek.MONDAY,
    label: "Monday",
  },
  {
    value: EStartOfTheWeek.TUESDAY,
    label: "Tuesday",
  },
  {
    value: EStartOfTheWeek.WEDNESDAY,
    label: "Wednesday",
  },
  {
    value: EStartOfTheWeek.THURSDAY,
    label: "Thursday",
  },
  {
    value: EStartOfTheWeek.FRIDAY,
    label: "Friday",
  },
  {
    value: EStartOfTheWeek.SATURDAY,
    label: "Saturday",
  },
];
