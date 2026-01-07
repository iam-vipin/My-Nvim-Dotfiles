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

import type { AnalyticsTab } from "@plane/types";
import { Overview } from "@/components/analytics/overview";
import { WorkItems } from "@/components/analytics/work-items";

export const getAnalyticsTabs = (t: (key: string, params?: Record<string, any>) => string): AnalyticsTab[] => [
  { key: "overview", label: t("common.overview"), content: Overview, isDisabled: false },
  { key: "work-items", label: t("sidebar.work_items"), content: WorkItems, isDisabled: false },
];
