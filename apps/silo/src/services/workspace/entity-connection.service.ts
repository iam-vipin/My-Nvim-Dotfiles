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

import { logger } from "@plane/logger";
import type { TWorkspaceEntityConnection } from "@plane/types";
import { removeUndefinedFromObject } from "@/helpers/generic-helpers";
import { APIService } from "@/services/api.service";
// types
import type { ClientOptions } from "@/types";
export class WorkspaceEntityConnectionAPIService extends APIService {
  constructor(options: ClientOptions) {
    super(options);
  }

  async createWorkspaceEntityConnection(
    data: Partial<TWorkspaceEntityConnection>
  ): Promise<TWorkspaceEntityConnection> {
    data = removeUndefinedFromObject(data);
    return this.post(`/api/v1/workspace-entity-connections/`, data)
      .then((response) => response.data)
      .catch((error) => {
        logger.error(error);
        throw error?.response?.data;
      });
  }

  async updateWorkspaceEntityConnection(
    connectionId: string,
    data: Partial<TWorkspaceEntityConnection>
  ): Promise<TWorkspaceEntityConnection> {
    data = removeUndefinedFromObject(data);
    return this.patch(`/api/v1/workspace-entity-connections/${connectionId}/`, data)
      .then((response) => response.data)
      .catch((error) => {
        logger.error(error);
        throw error?.response?.data;
      });
  }

  async getWorkspaceEntityConnection(connectionId: string): Promise<TWorkspaceEntityConnection> {
    return this.get(`/api/v1/workspace-entity-connections/${connectionId}/`)
      .then((response) => response.data)
      .catch((error) => {
        logger.error(error);
        throw error?.response?.data;
      });
  }

  async listWorkspaceEntityConnections(
    params?: Partial<Record<keyof TWorkspaceEntityConnection, string>>
  ): Promise<TWorkspaceEntityConnection[]> {
    params = removeUndefinedFromObject(params);
    return this.get(`/api/v1/workspace-entity-connections/`, { params: params })
      .then((response) => response.data)
      .catch((error) => {
        logger.error(error);
        throw error?.response?.data;
      });
  }

  async deleteWorkspaceEntityConnection(connectionId: string): Promise<TWorkspaceEntityConnection> {
    return this.delete(`/api/v1/workspace-entity-connections/${connectionId}/`)
      .then((response) => response.data)
      .catch((error) => {
        logger.error(error);
        throw error?.response?.data;
      });
  }
}
