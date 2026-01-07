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

import { createContext, useContext } from "react";
import { useParams } from "next/navigation";
import { EIssuesStoreType } from "@plane/types";
import { useIssues } from "./store/use-issues";

export const IssuesStoreContext = createContext<EIssuesStoreType | undefined>(undefined);

export const useIssueStoreType = () => {
  const storeType = useContext(IssuesStoreContext);
  const { globalViewId, viewId, projectId, cycleId, moduleId, userId, epicId, teamspaceId } = useParams();

  // If store type exists in context, use that store type
  if (storeType) return storeType;

  // else check the router params to determine the issue store
  if (globalViewId) return EIssuesStoreType.GLOBAL;

  if (userId) return EIssuesStoreType.PROFILE;

  if (teamspaceId && viewId) return EIssuesStoreType.TEAM_VIEW;

  if (teamspaceId && projectId) return EIssuesStoreType.TEAM_PROJECT_WORK_ITEMS;

  if (viewId) return EIssuesStoreType.PROJECT_VIEW;

  if (cycleId) return EIssuesStoreType.CYCLE;

  if (moduleId) return EIssuesStoreType.MODULE;

  if (epicId) return EIssuesStoreType.EPIC;

  if (projectId) return EIssuesStoreType.PROJECT;

  if (teamspaceId) return EIssuesStoreType.TEAM;

  return EIssuesStoreType.PROJECT;
};

export const useIssuesStore = () => {
  const storeType = useIssueStoreType();

  return useIssues(storeType);
};
