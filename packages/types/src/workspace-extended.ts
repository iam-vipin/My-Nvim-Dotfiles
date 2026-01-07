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

export interface IWorkspaceEpicSearchResult {
  id: string;
  name: string;
  project__identifier: string;
  project_id: string;
  sequence_id: number;
  workspace__slug: string;
  type_id: string;
}

export interface IWorkspaceTeamspaceSearchResult {
  id: string;
  name: string;
  workspace__slug: string;
}

export interface IWorkspaceInitiativeSearchResult {
  id: string;
  name: string;
  workspace__slug: string;
}

export type TWorkspaceExtendedResultEntities = {
  epic: IWorkspaceEpicSearchResult[];
  team: IWorkspaceTeamspaceSearchResult[];
  initiative: IWorkspaceInitiativeSearchResult[];
};
