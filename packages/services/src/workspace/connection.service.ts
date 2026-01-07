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

// types
import { API_BASE_URL } from "@plane/constants";
import type { TWorkspaceConnection, TWorkspaceUserConnection } from "@plane/types";
import { APIService } from "../api.service";

export class WorkspaceConnectionService extends APIService {
  constructor(BASE_URL?: string) {
    super(BASE_URL || API_BASE_URL);
  }

  async updateWorkspaceConnection(
    workspaceSlug: string,
    connectionId: string,
    data: Partial<TWorkspaceConnection>
  ): Promise<TWorkspaceConnection> {
    return this.patch(`/api/workspaces/${workspaceSlug}/connections/${connectionId}`, data)
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
        throw error?.response?.data;
      });
  }

  async getWorkspaceConnection(workspaceSlug: string, connectionId: string): Promise<TWorkspaceConnection> {
    return this.get(`/api/workspaces/${workspaceSlug}/connections/${connectionId}`)
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
        throw error?.response?.data;
      });
  }

  async getWorkspaceUserConnections(workspaceSlug: string, userId: string): Promise<TWorkspaceUserConnection[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/user-connections/${userId}/`)
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
        throw error?.response?.data;
      });
  }

  async listWorkspaceConnections(
    workspaceSlug: string,
    params?: Partial<Record<keyof TWorkspaceConnection, string | boolean | number>>
  ): Promise<TWorkspaceConnection[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/connections/`, { params: params })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
        throw error?.response?.data;
      });
  }

  async deleteWorkspaceConnection(workspaceSlug: string, connectionId: string): Promise<TWorkspaceConnection> {
    return this.delete(`/api/workspaces/${workspaceSlug}/connections/${connectionId}`)
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
        throw error?.response?.data;
      });
  }
}
