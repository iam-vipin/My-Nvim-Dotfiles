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
import type { IProjectEpicsFilter } from "./filter.store";

// @ts-nocheck - This class will never be used, extending similar class to avoid type errors

export type IProjectEpics = IProjectIssues;

// @ts-nocheck - This class will never be used, extending similar class to avoid type errors
export class ProjectEpics extends ProjectIssues implements IProjectEpics {
  constructor(_rootStore: IIssueRootStore, issueFilterStore: IProjectEpicsFilter) {
    super(_rootStore, issueFilterStore);
  }
}
