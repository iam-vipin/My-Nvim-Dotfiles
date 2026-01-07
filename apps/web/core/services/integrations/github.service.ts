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
import type { IGithubRepoInfo, IGithubServiceImportFormData } from "@plane/types";
import { APIService } from "@/services/api.service";
// helpers
// types

const integrationServiceType: string = "github";

export class GithubIntegrationService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async listAllRepositories(workspaceSlug: string, integrationSlug: string): Promise<any> {
    return this.get(`/api/workspaces/${workspaceSlug}/workspace-integrations/${integrationSlug}/github-repositories`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getGithubRepoInfo(workspaceSlug: string, params: { owner: string; repo: string }): Promise<IGithubRepoInfo> {
    return this.get(`/api/workspaces/${workspaceSlug}/importers/${integrationServiceType}/`, {
      params,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createGithubServiceImport(workspaceSlug: string, data: IGithubServiceImportFormData): Promise<any> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/importers/${integrationServiceType}/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
