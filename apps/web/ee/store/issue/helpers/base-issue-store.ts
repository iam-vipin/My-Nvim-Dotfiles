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

import { orderBy } from "lodash-es";
import type { TIssue } from "@plane/types";
import { getIssueIds } from "@/store/issue/helpers/base-issues-utils";

export const workItemSortWithOrderByExtended = (array: TIssue[], key?: string) => {
  switch (key) {
    case "customer_count":
      return getIssueIds(orderBy(array, (issue) => issue.customer_ids?.length));
    case "-customer_count":
      return getIssueIds(orderBy(array, (issue) => issue.customer_ids?.length, ["desc"]));

    case "customer_request_count":
      return getIssueIds(orderBy(array, (issue) => issue.customer_request_ids?.length));
    case "-customer_request_count":
      return getIssueIds(orderBy(array, (issue) => issue.customer_request_ids?.length, ["desc"]));
    default:
      return getIssueIds(array);
  }
};
