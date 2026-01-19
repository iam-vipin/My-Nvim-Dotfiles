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

import type { TIssueActivity } from "@plane/types";

export const getRelationActivityContent = (activity: TIssueActivity | undefined): string | undefined => {
  if (!activity) return;

  switch (activity.field) {
    case "blocking":
      return activity.old_value === ""
        ? `marked this work item is blocking work item `
        : `removed the blocking work item `;
    case "blocked_by":
      return activity.old_value === ""
        ? `marked this work item is being blocked by `
        : `removed this work item being blocked by work item `;
    case "duplicate":
      return activity.old_value === ""
        ? `marked this work item as duplicate of `
        : `removed this work item as a duplicate of `;
    case "relates_to":
      return activity.old_value === "" ? `marked that this work item relates to ` : `removed the relation from `;
  }

  return;
};
