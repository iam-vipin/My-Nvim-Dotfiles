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

export const GITLAB_ISSUE_CACHE_KEY = (projectId: string, issueId: string) => `silo:gl:issue:${projectId}:${issueId}`;
export const GITLAB_ISSUE_COMMENT_CACHE_KEY = (projectId: string, issueId: string, commentId: string) =>
  `silo:gl:issue:comment:${projectId}:${issueId}:${commentId}`;

export const PLANE_GITLAB_ISSUE_CACHE_KEY = (issueId: string) => `silo:plane:gl:issue:${issueId}`;
export const PLANE_GITLAB_ISSUE_COMMENT_CACHE_KEY = (commentId: string) => `silo:plane:gl:issue:comment:${commentId}`;

export const GITLAB_ISSUE_EXTERNAL_ID = (gitlabProjectId: string, gitlabIssueId: string) =>
  `gl_${gitlabProjectId}_${gitlabIssueId}`;
