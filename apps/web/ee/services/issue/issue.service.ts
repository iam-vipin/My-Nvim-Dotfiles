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

import type { TIssue, TIssueServiceType } from "@plane/types";
import { EIssueServiceType } from "@plane/types";
import { IssueService as CoreIssueService } from "@/services/issue/issue.service";

export class IssueService extends CoreIssueService {
  constructor(serviceType: TIssueServiceType = EIssueServiceType.ISSUES) {
    super(serviceType);
  }

  /**
   * Duplicate work item across the project
   * @param workspaceSlug - Workspace slug
   * @param workItemId - Work item ID
   * @param targetProjectId - Target project ID
   */
  async duplicateWorkItem(workspaceSlug: string, workItemId: string, targetProjectId: string): Promise<TIssue> {
    const response = await this.post(`/api/workspaces/${workspaceSlug}/issues/${workItemId}/duplicate/`, {
      project_id: targetProjectId,
    });
    return response.data;
  }

  /**
   * Create a sub work item
   * @param workspaceSlug - Workspace slug
   * @param projectId - Project ID
   * @param parentId - Parent work item ID
   * @param templateId - Template ID
   */
  async createSubWorkItemUsingTemplate(
    workspaceSlug: string,
    projectId: string,
    parentId: string,
    templateId: string
  ): Promise<TIssue> {
    const response = await this.post(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/work-items/${parentId}/sub-workitem-template/`,
      {
        template_id: templateId,
      }
    );
    return response.data;
  }
}
