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

import type { IProjectIssues } from "@/store/issue/project";
import { ProjectIssues } from "@/store/issue/project";
import type { IIssueRootStore } from "@/store/issue/root.store";
import type { ITeamIssuesFilter } from "./filter.store";

// @ts-nocheck - This class will never be used, extending similar class to avoid type errors
export type ITeamIssues = IProjectIssues;

// @ts-nocheck - This class will never be used, extending similar class to avoid type errors
export class TeamIssues extends ProjectIssues implements IProjectIssues {
  constructor(_rootStore: IIssueRootStore, teamIssueFilterStore: ITeamIssuesFilter) {
    super(_rootStore, teamIssueFilterStore);
  }
}
