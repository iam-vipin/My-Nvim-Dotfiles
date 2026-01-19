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

import { APIService } from "@/services/api.service";
// types
import type { ClientOptions, ExcludedProps, ExIssueComment, ExIssueLabel, Optional, Paginated } from "@/types/types";

export class IssueCommentService extends APIService {
  constructor(options: ClientOptions) {
    super(options);
  }

  async list(slug: string, projectId: string, issueId: string): Promise<Paginated<ExIssueLabel>> {
    return this.get(`/api/v1/workspaces/${slug}/projects/${projectId}/issues/${issueId}/comments/`)
      .then((response) => response.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async create(
    slug: string,
    projectId: string,
    issueId: string,
    payload: Omit<Optional<ExIssueComment>, ExcludedProps>
  ) {
    return this.post(`/api/v1/workspaces/${slug}/projects/${projectId}/issues/${issueId}/comments/`, payload)
      .then((response) => response.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getComment(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    commentId: string
  ): Promise<ExIssueComment> {
    return this.get(
      `/api/v1/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/comments/${commentId}/`
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getIssueCommentWithExternalId(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    externalId: string,
    externalSource: string
  ): Promise<ExIssueComment> {
    return this.get(
      `/api/v1/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/comments/?external_id=${externalId}&external_source=${externalSource}`
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async update(
    slug: string,
    projectId: string,
    issueId: string,
    commentId: string,
    payload: Omit<Optional<ExIssueComment>, ExcludedProps>
  ) {
    return this.patch(
      `/api/v1/workspaces/${slug}/projects/${projectId}/issues/${issueId}/comments/${commentId}/`,
      payload
    )
      .then((response) => response.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async destroy(slug: string, projectId: string, issueId: string, commentId: string) {
    return this.delete(`/api/v1/workspaces/${slug}/projects/${projectId}/issues/${issueId}/comments/${commentId}/`)
      .then((response) => response.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
