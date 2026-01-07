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
// Plane-web
import type { RootStore } from "@/plane-web/store/root.store";
import type { IBaseTimelineStore } from "@/plane-web/store/timeline/base-timeline.store";
import { BaseTimeLineStore } from "@/plane-web/store/timeline/base-timeline.store";

export interface IIssuesTimeLineStore extends IBaseTimelineStore {
  isDependencyEnabled: boolean;
}

export class IssuesTimeLineStore extends BaseTimeLineStore implements IIssuesTimeLineStore {
  constructor(_rootStore: RootStore) {
    super(_rootStore);

    autorun(() => {
      const getIssueById = this.rootStore.issue.issues.getIssueById;
      this.updateBlocks(getIssueById);
    });
  }
}
