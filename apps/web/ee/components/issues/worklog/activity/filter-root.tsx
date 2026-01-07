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

import type { FC } from "react";
import { observer } from "mobx-react";
// plane constants
import type { TActivityFilters, TActivityFilterOption } from "@plane/constants";
import { ACTIVITY_FILTER_TYPE_OPTIONS, EActivityFilterTypeEE } from "@plane/constants";
// ce components
import type { TActivityFilterRoot } from "@/ce/components/issues/worklog/activity/filter-root";
// components
import { ActivityFilter } from "@/components/issues/issue-detail/issue-activity";
// hooks
import { useWorkspace } from "@/hooks/store/use-workspace";
// plane web hooks
import { useWorkspaceWorklogs } from "@/plane-web/hooks/store";

export const ActivityFilterRoot = observer(function ActivityFilterRoot(props: TActivityFilterRoot) {
  const { selectedFilters, toggleFilter, isIntakeIssue = false, projectId } = props;
  // hooks
  const { currentWorkspace } = useWorkspace();
  const { isWorklogsEnabledByProjectId } = useWorkspaceWorklogs();

  // derived values
  const workspaceId = currentWorkspace?.id || undefined;
  const isFeatureFlagged = (projectId && isWorklogsEnabledByProjectId(projectId)) || false;
  const filterOptions = { ...ACTIVITY_FILTER_TYPE_OPTIONS };

  if (!workspaceId || !projectId) return <></>;
  if ((!isFeatureFlagged || isIntakeIssue) && filterOptions?.[EActivityFilterTypeEE.WORKLOG]) {
    delete filterOptions?.[EActivityFilterTypeEE.WORKLOG as keyof typeof filterOptions];
  }

  const filters: TActivityFilterOption[] = Object.entries(filterOptions).map(([key, value]) => {
    const filterKey = key as TActivityFilters;
    return {
      key: filterKey,
      labelTranslationKey: value.labelTranslationKey,
      isSelected: selectedFilters.includes(filterKey),
      onClick: () => toggleFilter(filterKey),
    };
  });

  const filteredSelectedFilters = selectedFilters.filter((filter) => {
    if (!isFeatureFlagged && filter === EActivityFilterTypeEE.WORKLOG) return false;
    return true;
  });

  return <ActivityFilter selectedFilters={filteredSelectedFilters} filterOptions={filters} />;
});
