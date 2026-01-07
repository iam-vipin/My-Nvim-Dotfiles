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
import type { TIssueComment } from "@plane/types";
import { APIService } from "../../api.service";

/**
 * Service class for managing comment replies
 * Extends the APIService class to handle HTTP requests to the comment replies endpoints
 * @extends {APIService}
 */
export class RepliesService extends APIService {
  constructor(BASE_URL?: string) {
    super(BASE_URL || API_BASE_URL);
  }

  /**
   * Lists all replies for a specific comment
   * @param {string} workspaceSlug - The workspace slug
   * @param {string} projectId - The project ID
   * @param {string} issueId - The issue ID
   * @param {string} commentId - The comment ID to get replies for
   * @returns {Promise<TIssueComment[]>} Promise resolving to an array of comment replies
   * @throws {Error} If the API request fails
   */
  async list(workspaceSlug: string, projectId: string, issueId: string, commentId: string): Promise<TIssueComment[]> {
    return this.get(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/comments/${commentId}/replies/`
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
