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
import type { IJiraMetadata, IJiraResponse, IJiraImporterForm } from "@plane/types";
import { APIService } from "@/services/api.service";
// types

export class JiraImporterService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async getJiraProjectInfo(workspaceSlug: string, params: IJiraMetadata): Promise<IJiraResponse> {
    return this.get(`/api/workspaces/${workspaceSlug}/importers/jira`, {
      params,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createJiraImporter(workspaceSlug: string, data: IJiraImporterForm): Promise<IJiraResponse> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/importers/jira/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
