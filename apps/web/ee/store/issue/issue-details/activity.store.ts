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

import { makeObservable } from "mobx";
import { computedFn } from "mobx-utils";
// plane package imports
import type { E_SORT_ORDER } from "@plane/constants";
import { EActivityFilterTypeEE } from "@plane/constants";
import type { IIssuePropertiesActivityStore, TIssueActivityComment, TIssueServiceType } from "@plane/types";
import { EIssueServiceType, EWorkItemTypeEntity } from "@plane/types";
// ce store
import type {
  IIssueActivityStoreActions as IIssueActivityStoreActionsCe,
  IIssueActivityStore as IIssueActivityStoreCe,
} from "@/ce/store/issue/issue-details/activity.store";
import { IssueActivityStore as IssueActivityStoreCe } from "@/ce/store/issue/issue-details/activity.store";
// plane web store types
import type { RootStore } from "@/plane-web/store/root.store";
// services
import { IssueActivityService } from "@/services/issue";
import { IssuePropertiesActivityStore } from "../../issue-types";

export type TActivityLoader = "fetch" | "mutate" | undefined;

export type IIssueActivityStoreActions = IIssueActivityStoreActionsCe;

export type IIssueActivityStore = IIssueActivityStoreCe & {
  issuePropertiesActivity: IIssuePropertiesActivityStore;
};

export class IssueActivityStore extends IssueActivityStoreCe implements IIssueActivityStore {
  // services
  issueActivityService;
  issuePropertiesActivity: IssuePropertiesActivityStore;

  constructor(
    protected store: RootStore,
    serviceType: TIssueServiceType = EIssueServiceType.ISSUES
  ) {
    super(store);
    makeObservable(this, {
      // actions
    });
    // services
    this.serviceType = serviceType;
    this.issueActivityService = new IssueActivityService(this.serviceType);
    this.issuePropertiesActivity = new IssuePropertiesActivityStore(this.store);
  }

  getActivityAndCommentsByIssueId = computedFn((issueId: string, sortOrder: E_SORT_ORDER) => {
    const workspace = this.store.workspaceRoot.currentWorkspace;
    if (!workspace?.id || !issueId) return undefined;

    const worklogs = this.store.workspaceWorklogs.worklogIdsByIssueId(workspace?.id, issueId);
    const additionalPropertiesActivities = this.issuePropertiesActivity.getPropertyActivityIdsByIssueId(issueId);

    const baseItems = this.buildActivityAndCommentItems(issueId);
    if (!baseItems || !worklogs || !additionalPropertiesActivities) return undefined;

    const activityComments: TIssueActivityComment[] = [...baseItems];

    worklogs.forEach((worklogId) => {
      const worklog = this.store.workspaceWorklogs.worklogById(worklogId);
      if (!worklog || !worklog.id) return;
      activityComments.push({
        id: worklog.id,
        activity_type: EActivityFilterTypeEE.WORKLOG,
        created_at: worklog.created_at,
      });
    });

    additionalPropertiesActivities.forEach((activityId) => {
      const activity = this.issuePropertiesActivity.getPropertyActivityById(activityId);
      if (!activity || !activity.id) return;
      activityComments.push({
        id: activity.id,
        activity_type: EActivityFilterTypeEE.ISSUE_ADDITIONAL_PROPERTIES_ACTIVITY,
        created_at: activity.created_at,
      });
    });

    return this.sortActivityComments(activityComments, sortOrder);
  });

  // actions
  fetchActivities = async (
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    loaderType: TActivityLoader = "fetch"
  ) => {
    try {
      this.loader = loaderType;
      // check if worklogs are enabled for the project
      const isWorklogsEnabled = this.store.workspaceWorklogs.isWorklogsEnabledByProjectId(projectId);
      // check if work item types are enabled for the project
      const isWorkItemTypeEnabled = this.store.issueTypes.isWorkItemTypeEntityEnabledForProject(
        workspaceSlug,
        projectId,
        this.serviceType === EIssueServiceType.EPICS ? EWorkItemTypeEntity.EPIC : EWorkItemTypeEntity.WORK_ITEM
      );

      await Promise.all([
        // fetching the worklogs for the issue if worklogs are enabled
        isWorkItemTypeEnabled &&
          this.issuePropertiesActivity.fetchPropertyActivities(
            workspaceSlug,
            projectId,
            issueId,
            "init-loader",
            this.serviceType
          ),
        // fetching the activities for issue custom properties if issue types are enabled
        isWorklogsEnabled && this.store.workspaceWorklogs.getWorklogsByIssueId(workspaceSlug, projectId, issueId),
      ]).catch((error) => {
        throw error;
      });
      // fetching the activities for the issue
      const activities = await super.fetchActivities(workspaceSlug, projectId, issueId, loaderType);
      return activities;
    } catch (error) {
      this.loader = undefined;
      throw error;
    }
  };
}
