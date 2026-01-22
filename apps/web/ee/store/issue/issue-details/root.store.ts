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

import { action, makeObservable } from "mobx";
import type { TIssue, TIssueServiceType } from "@plane/types";
import { IssueService } from "@/services/issue/issue.service";
import type { IIssueDetail as IIssueDetailCore } from "@/store/issue/issue-details/root.store";
import { IssueDetail as IssueDetailCore } from "@/store/issue/issue-details/root.store";
import type { IIssueRootStore } from "@/store/issue/root.store";
import { IssueCommentStoreExtended } from "./comments/comment.store";
import { WorkItemPagesStore } from "./page.store";

export interface IIssueDetail extends IIssueDetailCore {
  // stores
  duplicateWorkItem: (
    workspaceSlug: string,
    workItemId: string,
    targetProjectId: string
  ) => Promise<TIssue | undefined>;
  // stores
  pages: WorkItemPagesStore;
}

export class IssueDetail extends IssueDetailCore implements IIssueDetail {
  // services
  workItemService: IssueService;
  rootStore: IIssueRootStore;
  // store
  pages: WorkItemPagesStore;

  constructor(rootStore: IIssueRootStore, serviceType: TIssueServiceType) {
    super(rootStore, serviceType);
    makeObservable(this, {
      // observables
      duplicateWorkItem: action,
    });
    this.workItemService = new IssueService(serviceType);
    this.rootStore = rootStore;
    this.pages = new WorkItemPagesStore(rootStore);

    // Override comment store with extended version that includes replies
    this.comment = new IssueCommentStoreExtended(this, serviceType);
  }

  // actions
  /**
   * Duplicate a work item to a target project
   * @param workspaceSlug - The slug of the workspace
   * @param workItemId - The id of the work item / epic to duplicate
   * @param targetProjectId - The id of the target project
   * @returns The duplicated work item
   */
  duplicateWorkItem = async (workspaceSlug: string, workItemId: string, targetProjectId: string) => {
    const response = await this.workItemService.duplicateWorkItem(workspaceSlug, workItemId, targetProjectId);
    // Add work item to the target project
    this.rootStore.issues.addIssue([response]);
    return response;
  };
}
