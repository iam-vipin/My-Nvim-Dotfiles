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

import { useCallback, useMemo } from "react";
import type { TIssue } from "@plane/types";
import type { TNavigationItem } from "@/components/navigation/tab-navigation-root";

type UseActiveTabProps = {
  navigationItems: TNavigationItem[];
  pathname: string;
  workItemId?: string;
  workItem?: TIssue;
  projectId: string;
};

export const useActiveTab = ({ navigationItems, pathname, workItemId, workItem, projectId }: UseActiveTabProps) => {
  // Check if a navigation item is active
  const isActive = useCallback(
    (item: TNavigationItem) => {
      // Work item condition
      const workItemCondition = workItemId && workItem && !workItem?.is_epic && workItem?.project_id === projectId;
      // Epic condition
      const epicCondition = workItemId && workItem && workItem?.is_epic && workItem?.project_id === projectId;
      // Is active
      const isWorkItemActive = item.key === "work_items" && workItemCondition;
      const isEpicActive = item.key === "epics" && epicCondition;
      // Pathname condition - use exact match or startsWith for better accuracy
      const isPathnameActive = pathname === item.href || pathname.startsWith(item.href + "/");
      // Return
      return isWorkItemActive || isEpicActive || isPathnameActive;
    },
    [pathname, workItem, workItemId, projectId]
  );

  // Find active item
  const activeItem = useMemo(() => navigationItems.find((item) => isActive(item)), [navigationItems, isActive]);

  return { isActive, activeItem };
};
