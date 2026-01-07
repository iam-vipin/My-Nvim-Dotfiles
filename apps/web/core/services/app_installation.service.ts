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

// services
import { API_BASE_URL } from "@plane/constants";
import { APIService } from "@/services/api.service";
// helpers

export class AppInstallationService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async addInstallationApp(workspaceSlug: string, provider: string, data: any): Promise<any> {
    return this.post(`/api/workspaces/${workspaceSlug}/workspace-integrations/${provider}/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  async addSlackChannel(
    workspaceSlug: string,
    projectId: string,
    integrationId: string | null | undefined,
    data: any
  ): Promise<any> {
    return this.post(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/workspace-integrations/${integrationId}/project-slack-sync/`,
      data
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  async getSlackChannelDetail(
    workspaceSlug: string,
    projectId: string,
    integrationId: string | null | undefined
  ): Promise<any> {
    return this.get(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/workspace-integrations/${integrationId}/project-slack-sync/`
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  async removeSlackChannel(
    workspaceSlug: string,
    projectId: string,
    integrationId: string | null | undefined,
    slackSyncId: string | undefined
  ): Promise<any> {
    return this.delete(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/workspace-integrations/${integrationId}/project-slack-sync/${slackSyncId}`
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }
}
