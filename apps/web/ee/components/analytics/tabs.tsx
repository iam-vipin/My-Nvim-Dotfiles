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

import { getAnalyticsTabs as getBaseAnalyticsTabs } from "@/ce/components/analytics/tabs";
import { Cycles } from "./cycles";
import { Intake } from "./intake";
import LockedTabLabel from "./locked-tab-label";
import { Modules } from "./modules";
import { Projects } from "./projects";
import { Users } from "./users";

export const getAnalyticsTabs = (
  t: (key: string, params?: Record<string, any>) => string,
  isAnalyticsTabsEnabled: boolean
) => {
  const baseAnalyticsTabs = getBaseAnalyticsTabs(t);
  const tabs = [
    baseAnalyticsTabs[0],
    {
      key: "projects",
      label: isAnalyticsTabsEnabled ? t("common.projects") : <LockedTabLabel label={t("common.projects")} t={t} />,
      content: Projects,
      isDisabled: !isAnalyticsTabsEnabled,
    },
    {
      key: "users",
      label: isAnalyticsTabsEnabled ? t("common.users") : <LockedTabLabel label={t("common.users")} t={t} />,
      content: Users,
      isDisabled: !isAnalyticsTabsEnabled,
    },
    baseAnalyticsTabs[1],
    {
      key: "cycles",
      label: isAnalyticsTabsEnabled ? t("common.cycles") : <LockedTabLabel label={t("common.cycles")} t={t} />,
      content: Cycles,
      isDisabled: !isAnalyticsTabsEnabled,
    },
    {
      key: "modules",
      label: isAnalyticsTabsEnabled ? t("common.modules") : <LockedTabLabel label={t("common.modules")} t={t} />,
      content: Modules,
      isDisabled: !isAnalyticsTabsEnabled,
    },
    {
      key: "intake",
      label: isAnalyticsTabsEnabled ? t("intake") : <LockedTabLabel label={t("intake")} t={t} />,
      content: Intake,
      isDisabled: !isAnalyticsTabsEnabled,
    },
  ];
  return tabs;
};
