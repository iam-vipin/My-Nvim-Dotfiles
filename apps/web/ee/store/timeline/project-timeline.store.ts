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

import { autorun } from "mobx";
import type { RootStore } from "@/plane-web/store/root.store";
import type { IBaseTimelineStore } from "ce/store/timeline/base-timeline.store";
import { BaseTimeLineStore } from "ce/store/timeline/base-timeline.store";
// Store

export interface IProjectsTimeLineStore extends IBaseTimelineStore {
  isDependencyEnabled: boolean;
}

export class ProjectsTimeLineStore extends BaseTimeLineStore implements IProjectsTimeLineStore {
  constructor(_rootStore: RootStore) {
    super(_rootStore);

    autorun((reaction) => {
      reaction.trace();
      const getProjectById = this.rootStore.projectRoot.project.getProjectById;
      this.updateBlocks(getProjectById);
    });
  }
}
