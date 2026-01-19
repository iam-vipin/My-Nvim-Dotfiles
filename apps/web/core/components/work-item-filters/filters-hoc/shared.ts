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
import type { TSaveViewOptions, TUpdateViewOptions } from "@plane/constants";
import type { IWorkItemFilterInstance } from "@plane/shared-state";
import type { EIssuesStoreType, IIssueFilters, TWorkItemFilterExpression, TWorkItemFilterProperty } from "@plane/types";

export type TSharedWorkItemFiltersProps = {
  entityType: EIssuesStoreType; // entity type (project, cycle, workspace, teamspace, etc)
  filtersToShowByLayout: TWorkItemFilterProperty[];
  updateFilters: (updatedFilters: TWorkItemFilterExpression) => void;
  isTemporary?: boolean;
  showOnMount?: boolean;
} & ({ isTemporary: true; entityId?: string } | { isTemporary?: false; entityId: string }); // entity id (project_id, cycle_id, workspace_id, etc)

export type TSharedWorkItemFiltersHOCProps = TSharedWorkItemFiltersProps & {
  children: React.ReactNode | ((props: { filter: IWorkItemFilterInstance | undefined }) => React.ReactNode);
  initialWorkItemFilters: IIssueFilters | undefined;
};

export type TEnableSaveViewProps = {
  enableSaveView?: boolean;
  saveViewOptions?: Omit<TSaveViewOptions<TWorkItemFilterExpression>, "onViewSave">;
};

export type TEnableUpdateViewProps = {
  enableUpdateView?: boolean;
  updateViewOptions?: Omit<TUpdateViewOptions<TWorkItemFilterExpression>, "onViewUpdate">;
};
