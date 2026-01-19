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

import { subDays } from "date-fns";
// plane imports
import { EPastDurationFilters } from "@plane/constants";
// local imports
import { renderFormattedPayloadDate } from "./datetime";

export const getCustomDates = (duration: EPastDurationFilters): string => {
  const today = new Date();
  let firstDay, lastDay;

  switch (duration) {
    case EPastDurationFilters.TODAY: {
      firstDay = renderFormattedPayloadDate(today);
      lastDay = renderFormattedPayloadDate(today);
      return `${firstDay};after,${lastDay};before`;
    }
    case EPastDurationFilters.YESTERDAY: {
      const yesterday = subDays(today, 1);
      firstDay = renderFormattedPayloadDate(yesterday);
      lastDay = renderFormattedPayloadDate(yesterday);
      return `${firstDay};after,${lastDay};before`;
    }
    case EPastDurationFilters.LAST_7_DAYS: {
      firstDay = renderFormattedPayloadDate(subDays(today, 7));
      lastDay = renderFormattedPayloadDate(today);
      return `${firstDay};after,${lastDay};before`;
    }
    case EPastDurationFilters.LAST_30_DAYS: {
      firstDay = renderFormattedPayloadDate(subDays(today, 30));
      lastDay = renderFormattedPayloadDate(today);
      return `${firstDay};after,${lastDay};before`;
    }
  }
};
