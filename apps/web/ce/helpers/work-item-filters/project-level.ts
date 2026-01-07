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

// plane imports
import type { EIssuesStoreType } from "@plane/types";
// plane web imports
import type { TWorkItemFiltersEntityProps } from "@/plane-web/hooks/work-item-filters/use-work-item-filters-config";

export type TGetAdditionalPropsForProjectLevelFiltersHOCParams = {
  entityType: EIssuesStoreType;
  workspaceSlug: string;
  projectId: string;
};

export type TGetAdditionalPropsForProjectLevelFiltersHOC = (
  params: TGetAdditionalPropsForProjectLevelFiltersHOCParams
) => TWorkItemFiltersEntityProps;

export const getAdditionalProjectLevelFiltersHOCProps: TGetAdditionalPropsForProjectLevelFiltersHOC = ({
  workspaceSlug,
}) => ({
  workspaceSlug,
});
