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

import { runInAction } from "mobx";
import type { TIssue, IBlockUpdateDependencyData } from "@plane/types";
import type { IIssueRootStore } from "@/store/issue/root.store";
import type { IWorkspaceIssuesFilter } from "@/store/issue/workspace/filter.store";
import type { IWorkspaceIssues as ICoreWorkspaceIssues } from "@/store/issue/workspace/issue.store";
import { WorkspaceIssues as CoreWorkspaceIssues } from "@/store/issue/workspace/issue.store";

export interface IWorkspaceIssues extends ICoreWorkspaceIssues {
  updateIssueDates: (workspaceSlug: string, updates: IBlockUpdateDependencyData[]) => Promise<void>;
}

export class WorkspaceIssues extends CoreWorkspaceIssues implements IWorkspaceIssues {
  constructor(_rootStore: IIssueRootStore, issueFilterStore: IWorkspaceIssuesFilter) {
    super(_rootStore, issueFilterStore);
  }

  /**
   * @description Update the issue dates in the workspace
   * @param { string } workspaceSlug
   * @param { IBlockUpdateDependencyData[] } updates
   */
  updateIssueDates = async (workspaceSlug: string, updates: IBlockUpdateDependencyData[]) => {
    const issueDatesBeforeChange: IBlockUpdateDependencyData[] = [];
    try {
      const getIssueById = this.rootIssueStore.issues.getIssueById;
      runInAction(() => {
        for (const update of updates) {
          const dates: Partial<TIssue> = {};
          if (update.start_date) dates.start_date = update.start_date;
          if (update.target_date) dates.target_date = update.target_date;

          const currIssue = getIssueById(update.id);

          if (currIssue) {
            issueDatesBeforeChange.push({
              id: update.id,
              start_date: currIssue.start_date ?? undefined,
              target_date: currIssue.target_date ?? undefined,
              meta: update.meta ?? undefined,
            });
          }

          if (update.meta?.project_id) {
            this.issueUpdate(workspaceSlug, update.meta.project_id, update.id, dates, false);
          }
        }
      });

      const updatesPayload = updates.map((update) => ({
        id: update.id,
        start_date: update.start_date,
        target_date: update.target_date,
        project_id: update.meta?.project_id,
      }));

      await this.workspaceService.updateWorkItemDates(workspaceSlug, updatesPayload);
    } catch (e) {
      runInAction(() => {
        for (const update of issueDatesBeforeChange) {
          const dates: Partial<TIssue> = {};
          if (update.start_date) dates.start_date = update.start_date;
          if (update.target_date) dates.target_date = update.target_date;

          if (update.meta?.project_id) {
            this.issueUpdate(workspaceSlug, update.meta.project_id, update.id, dates, false);
          }
        }
      });
      console.error("error while updating Timeline dependencies");
      throw e;
    }
  };
}
