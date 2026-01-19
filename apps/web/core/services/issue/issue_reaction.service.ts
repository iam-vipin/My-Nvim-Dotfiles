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

import { API_BASE_URL } from "@plane/constants";
import { EIssueServiceType } from "@plane/types";
import type { TIssueCommentReaction, TIssueReaction, TIssueServiceType } from "@plane/types";
// services
import { APIService } from "@/services/api.service";
// types

export class IssueReactionService extends APIService {
  private serviceType: TIssueServiceType;

  constructor(serviceType: TIssueServiceType = EIssueServiceType.ISSUES) {
    super(API_BASE_URL);
    this.serviceType = serviceType;
  }

  async createIssueReaction(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    data: Partial<TIssueReaction>
  ): Promise<any> {
    return this.post(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/${issueId}/reactions/`,
      data
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async listIssueReactions(workspaceSlug: string, projectId: string, issueId: string): Promise<TIssueReaction[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/${issueId}/reactions/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteIssueReaction(workspaceSlug: string, projectId: string, issueId: string, reaction: string): Promise<any> {
    return this.delete(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/${issueId}/reactions/${reaction}/`
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createIssueCommentReaction(
    workspaceSlug: string,
    projectId: string,
    commentId: string,
    data: Partial<TIssueCommentReaction>
  ): Promise<any> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/comments/${commentId}/reactions/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async listIssueCommentReactions(
    workspaceSlug: string,
    projectId: string,
    commentId: string
  ): Promise<TIssueCommentReaction[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/comments/${commentId}/reactions/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteIssueCommentReaction(
    workspaceSlug: string,
    projectId: string,
    commentId: string,
    reaction: string
  ): Promise<any> {
    return this.delete(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/comments/${commentId}/reactions/${reaction}/`
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
