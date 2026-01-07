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

export interface IGithubServiceImportFormData {
  metadata: {
    owner: string;
    name: string;
    repository_id: number;
    url: string;
  };
  data: {
    users: {
      username: string;
      import: boolean | "invite" | "map";
      email: string;
    }[];
  };
  config: {
    sync: boolean;
  };
  project_id: string;
}

export interface IGithubRepoCollaborator {
  avatar_url: string;
  html_url: string;
  id: number;
  login: string;
  url: string;
}

export interface IGithubRepoInfo {
  issue_count: number;
  labels: number;
  collaborators: IGithubRepoCollaborator[];
}
