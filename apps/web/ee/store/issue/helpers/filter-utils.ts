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

import type { IIssueDisplayFilterOptions, TIssueGroupByOptions } from "@plane/types";
import { store } from "@/lib/store-context";

export const getEnabledDisplayFilters = (displayFilters: IIssueDisplayFilterOptions) => {
  const enabledDisplayFilters: IIssueDisplayFilterOptions = {
    ...displayFilters,
    group_by: getGroupBy(displayFilters.group_by),
    sub_group_by: getGroupBy(displayFilters.sub_group_by),
  };

  return enabledDisplayFilters;
};

export const getGroupBy = (groupBy: TIssueGroupByOptions | undefined) => {
  const { projectId, workspaceSlug } = store.router;

  if (!workspaceSlug || !groupBy) return groupBy;

  const { isMilestonesEnabled } = store.milestone;

  const isMilestonesFeatureEnabled = projectId
    ? isMilestonesEnabled(workspaceSlug.toString(), projectId.toString())
    : false;

  const FEATURES_STATUS_MAP: Record<string, boolean> = {
    milestone: isMilestonesFeatureEnabled,
  };

  if (Object.keys(FEATURES_STATUS_MAP).includes(groupBy)) {
    return FEATURES_STATUS_MAP[groupBy] ? groupBy : null;
  }

  return groupBy;
};
