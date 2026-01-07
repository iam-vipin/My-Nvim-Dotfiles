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

import { EAutomationSidebarTab } from "@plane/types";

/**
 * Get the title for the sidebar header based on the selected tab
 * @param tab - The selected tab
 * @returns The title for the sidebar header
 */
export const getSidebarHeaderI18nTitle = (tab: EAutomationSidebarTab) => {
  switch (tab) {
    case EAutomationSidebarTab.ACTION:
      return "automations.action.sidebar_header";
    case EAutomationSidebarTab.TRIGGER:
      return "automations.trigger.sidebar_header";
    case EAutomationSidebarTab.ACTIVITY:
      return "common.activity";
  }
};
