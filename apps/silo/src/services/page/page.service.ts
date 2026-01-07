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

import type { ExcludedProps, ExPage } from "@plane/sdk";
import type { ClientOptions } from "@/types";
import { APIService } from "../api.service";

export class PageAPIService extends APIService {
  constructor(options: ClientOptions) {
    super(options);
  }

  async bulkCreatePages(workspaceSlug: string, payload: Omit<Partial<ExPage>, ExcludedProps>[]) {
    return this.post(`/api/v1/workspaces/${workspaceSlug}/pages/bulk-operation/`, payload)
      .then((response) => response.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async bulkUpdatePages(workspaceSlug: string, payload: Omit<Partial<ExPage>, ExcludedProps>[]) {
    return this.patch(`/api/v1/workspaces/${workspaceSlug}/pages/bulk-operation/`, payload)
      .then((response) => response.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
  // Project pages bulk operations
  async bulkCreateProjectPages(
    workspaceSlug: string,
    projectId: string,
    payload: Omit<Partial<ExPage>, ExcludedProps>[]
  ) {
    return this.post(`/api/v1/workspaces/${workspaceSlug}/projects/${projectId}/pages/bulk-operation/`, payload)
      .then((response) => response.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async bulkUpdateProjectPages(
    workspaceSlug: string,
    projectId: string,
    payload: Omit<Partial<ExPage>, ExcludedProps>[]
  ) {
    return this.patch(`/api/v1/workspaces/${workspaceSlug}/projects/${projectId}/pages/bulk-operation/`, payload)
      .then((response) => response.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  // Teamspace pages bulk operations
  async bulkCreateTeamspacePages(
    workspaceSlug: string,
    teamspaceId: string,
    payload: Omit<Partial<ExPage>, ExcludedProps>[]
  ) {
    return this.post(`/api/v1/workspaces/${workspaceSlug}/teamspaces/${teamspaceId}/pages/bulk-operation/`, payload)
      .then((response) => response.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async bulkUpdateTeamspacePages(
    workspaceSlug: string,
    teamspaceId: string,
    payload: Omit<Partial<ExPage>, ExcludedProps>[]
  ) {
    return this.patch(`/api/v1/workspaces/${workspaceSlug}/teamspaces/${teamspaceId}/pages/bulk-operation/`, payload)
      .then((response) => response.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
