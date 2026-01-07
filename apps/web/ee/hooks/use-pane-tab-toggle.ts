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
import { useRouter, useSearchParams } from "next/navigation";
import { PAGE_NAVIGATION_PANE_TABS_QUERY_PARAM } from "@/components/pages/navigation-pane";
import { useQueryParams } from "@/hooks/use-query-params";
import type { TPageNavigationPaneTab } from "../components/pages/navigation-pane";

export const usePaneTabToggle = (targetTab: TPageNavigationPaneTab) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateQueryParams } = useQueryParams();

  const currentTab = searchParams.get(PAGE_NAVIGATION_PANE_TABS_QUERY_PARAM) as TPageNavigationPaneTab | null;
  const isActive = currentTab === targetTab;

  const toggle = useCallback(() => {
    const newRoute = updateQueryParams({
      ...(isActive
        ? { paramsToRemove: [PAGE_NAVIGATION_PANE_TABS_QUERY_PARAM] }
        : { paramsToAdd: { [PAGE_NAVIGATION_PANE_TABS_QUERY_PARAM]: targetTab } }),
    });
    router.push(newRoute);
  }, [isActive, targetTab, updateQueryParams, router]);

  return useMemo(() => ({ isActive, toggle }), [isActive, toggle]);
};
