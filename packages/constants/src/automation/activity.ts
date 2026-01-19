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

import type { TAutomationActivityType } from "@plane/types";

export const AUTOMATION_ACTIVITY_TYPE_OPTIONS: {
  key: TAutomationActivityType;
  i18n_label: string;
}[] = [
  {
    key: "all",
    i18n_label: "automations.activity.filters.all",
  },
  {
    key: "activity",
    i18n_label: "automations.activity.filters.only_activity",
  },
  {
    key: "run_history",
    i18n_label: "automations.activity.filters.only_run_history",
  },
];
