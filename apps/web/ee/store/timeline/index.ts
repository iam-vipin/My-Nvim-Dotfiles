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

import type { RootStore } from "@/plane-web/store/root.store";
import type { IBaseTimelineStore } from "@/plane-web/store/timeline/base-timeline.store";
import type { IIssuesTimeLineStore } from "@/store/timeline/issues-timeline.store";
import { IssuesTimeLineStore } from "@/store/timeline/issues-timeline.store";
import type { IModulesTimeLineStore } from "@/store/timeline/modules-timeline.store";
import { ModulesTimeLineStore } from "@/store/timeline/modules-timeline.store";
import { GroupedTimeLineStore } from "./grouped-timeline.store";
import type { IInitiativesTimeLineStore } from "./initiatives-timeline.store";
import { InitiativesTimeLineStore } from "./initiatives-timeline.store";
import type { IProjectsTimeLineStore } from "./project-timeline.store";
import { ProjectsTimeLineStore } from "./project-timeline.store";

export interface ITimelineStore {
  issuesTimeLineStore: IIssuesTimeLineStore;
  modulesTimeLineStore: IModulesTimeLineStore;
  projectTimeLineStore: IProjectsTimeLineStore;
  groupedTimeLineStore: IBaseTimelineStore;
  initiativesTimeLineStore: IInitiativesTimeLineStore;
}

export class TimeLineStore implements ITimelineStore {
  issuesTimeLineStore: IIssuesTimeLineStore;
  modulesTimeLineStore: IModulesTimeLineStore;
  projectTimeLineStore: IProjectsTimeLineStore;
  groupedTimeLineStore: IBaseTimelineStore;
  initiativesTimeLineStore: IInitiativesTimeLineStore;

  constructor(rootStore: RootStore) {
    this.issuesTimeLineStore = new IssuesTimeLineStore(rootStore);
    this.modulesTimeLineStore = new ModulesTimeLineStore(rootStore);
    this.projectTimeLineStore = new ProjectsTimeLineStore(rootStore);
    this.groupedTimeLineStore = new GroupedTimeLineStore(rootStore);
    this.initiativesTimeLineStore = new InitiativesTimeLineStore(rootStore);
  }
}
