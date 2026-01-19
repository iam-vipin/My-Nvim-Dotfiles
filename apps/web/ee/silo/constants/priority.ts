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

import type { TPlanePriorityData } from "@/plane-web/silo/types/common";
import { E_PLANE_PRIORITY } from "@/plane-web/silo/types/common";

export const PLANE_PRIORITIES: TPlanePriorityData[] = [
  {
    key: E_PLANE_PRIORITY.URGENT,
    label: "Urgent",
  },
  {
    key: E_PLANE_PRIORITY.HIGH,
    label: "High",
  },
  {
    key: E_PLANE_PRIORITY.MEDIUM,
    label: "Medium",
  },
  {
    key: E_PLANE_PRIORITY.LOW,
    label: "Low",
  },
  {
    key: E_PLANE_PRIORITY.NONE,
    label: "None",
  },
];
