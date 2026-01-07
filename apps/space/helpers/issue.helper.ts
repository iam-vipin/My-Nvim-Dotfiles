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
// plane internal
import { STATE_GROUPS } from "@plane/constants";
import type { TStateGroups } from "@plane/types";
// helpers
import { getDate } from "@/helpers/date-time.helper";

/**
 * @description check if the issue due date should be highlighted
 * @param date
 * @param stateGroup
 * @returns boolean
 */
export const shouldHighlightIssueDueDate = (
  date: string | Date | null,
  stateGroup: TStateGroups | undefined
): boolean => {
  if (!date || !stateGroup) return false;
  // if the issue is completed or cancelled, don't highlight the due date
  if ([STATE_GROUPS.completed.key, STATE_GROUPS.cancelled.key].includes(stateGroup)) return false;

  const parsedDate = getDate(date);
  if (!parsedDate) return false;

  const targetDateDistance = differenceInCalendarDays(parsedDate, new Date());

  // if the issue is overdue, highlight the due date
  return targetDateDistance <= 0;
};
