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

import type { IIssue } from "@/types/issue";
import type { IGanttBlock } from "../types";
import { getDate } from "./date-time.helper";

export const getIssueBlocksStructure = (block: IIssue): IGanttBlock => ({
  data: block,
  id: block?.id,
  sort_order: block?.sort_order,
  start_date: getDate(block?.start_date),
  target_date: getDate(block?.target_date),
});
