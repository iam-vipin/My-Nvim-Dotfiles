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
import type { TWorkspaceCredential, TWorkspaceCredentialVerification } from "@plane/types";
import { removeUndefinedFromObject } from "@/helpers/generic-helpers";
import { APIService } from "@/services/api.service";
// types
import type { ClientOptions } from "@/types";
export class WorkspaceCredentialAPIService extends APIService {
  constructor(options: ClientOptions) {
    super(options);
  }

  async createWorkspaceCredential(data: Partial<TWorkspaceCredential>): Promise<TWorkspaceCredential> {
    data = removeUndefinedFromObject(data);
    return this.post(`/api/v1/workspace-credentials/`, data)
      .then((response) => response.data)
      .catch((error) => {
        logger.error(error);
        throw error?.response?.data;
      });
  }

  async updateWorkspaceCredential(
    credentialId: string,
    data: Partial<TWorkspaceCredential>
  ): Promise<TWorkspaceCredential> {
    data = removeUndefinedFromObject(data);
    return this.patch(`/api/v1/workspace-credentials/${credentialId}/`, data)
      .then((response) => response.data)
      .catch((error) => {
        logger.error(error);
        throw error?.response?.data;
      });
  }

  async getWorkspaceCredential(credentialId: string): Promise<TWorkspaceCredential> {
    return this.get(`/api/v1/workspace-credentials/${credentialId}/`)
      .then((response) => response.data)
      .catch((error) => {
        logger.error(error);
        throw error?.response?.data;
      });
  }

  async listWorkspaceCredentials(
    params?: Partial<Record<keyof TWorkspaceCredential, string>>
  ): Promise<TWorkspaceCredential[]> {
    params = removeUndefinedFromObject(params);
    return this.get(`/api/v1/workspace-credentials/`, { params: params })
      .then((response) => response.data)
      .catch((error) => {
        logger.error(error);
        throw error?.response?.data;
      });
  }

  async verifyWorkspaceCredentials(
    source: string,
    userId: string,
    workspaceId: string
  ): Promise<TWorkspaceCredentialVerification> {
    return this.get(`/api/v1/workspace-credentials/token-verify/`, {
      params: { source, user_id: userId, workspace_id: workspaceId },
    })
      .then((response) => response.data)
      .catch((error) => {
        logger.error(error);
        throw error?.response?.data;
      });
  }

  async deleteWorkspaceCredential(credentialId: string): Promise<TWorkspaceCredential> {
    return this.delete(`/api/v1/workspace-credentials/${credentialId}/`)
      .then((response) => response.data)
      .catch((error) => {
        logger.error(error);
        throw error?.response?.data;
      });
  }

  async verifyToken(credentialId: string, token: string): Promise<TWorkspaceCredential> {
    return this.post(`/api/v1/workspace-credentials/${credentialId}/token-verify/`, { token })
      .then((response) => response.data)
      .catch((error) => {
        logger.error(error);
        throw error?.response?.data;
      });
  }
}
