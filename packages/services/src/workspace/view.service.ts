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
import type { IWorkspaceView, TIssuesResponse } from "@plane/types";
import { APIService } from "../api.service";

export class WorkspaceViewService extends APIService {
  /**
   * Creates an instance of WorkspaceViewService
   * @param {string} baseUrl - The base URL for API requests
   */
  constructor(BASE_URL?: string) {
    super(BASE_URL || API_BASE_URL);
  }

  async create(workspaceSlug: string, data: Partial<IWorkspaceView>): Promise<IWorkspaceView> {
    return this.post(`/api/workspaces/${workspaceSlug}/views/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async update(workspaceSlug: string, viewId: string, data: Partial<IWorkspaceView>): Promise<IWorkspaceView> {
    return this.patch(`/api/workspaces/${workspaceSlug}/views/${viewId}/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async destroy(workspaceSlug: string, viewId: string): Promise<any> {
    return this.delete(`/api/workspaces/${workspaceSlug}/views/${viewId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async list(workspaceSlug: string): Promise<IWorkspaceView[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/views/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async retrieve(workspaceSlug: string, viewId: string): Promise<IWorkspaceView> {
    return this.get(`/api/workspaces/${workspaceSlug}/views/${viewId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getViewIssues(workspaceSlug: string, params: any, config = {}): Promise<TIssuesResponse> {
    return this.get(
      `/api/workspaces/${workspaceSlug}/issues/`,
      {
        params,
      },
      config
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
