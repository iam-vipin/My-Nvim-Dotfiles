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

// api services
import { API_BASE_URL } from "@plane/constants";
import type { IWebhook } from "@plane/types";
import { APIService } from "@/services/api.service";
// helpers
// types

export class WebhookService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async fetchWebhooksList(workspaceSlug: string): Promise<IWebhook[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/webhooks/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async fetchWebhookDetails(workspaceSlug: string, webhookId: string): Promise<IWebhook> {
    return this.get(`/api/workspaces/${workspaceSlug}/webhooks/${webhookId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createWebhook(workspaceSlug: string, data = {}): Promise<IWebhook> {
    return this.post(`/api/workspaces/${workspaceSlug}/webhooks/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async updateWebhook(workspaceSlug: string, webhookId: string, data = {}): Promise<IWebhook> {
    return this.patch(`/api/workspaces/${workspaceSlug}/webhooks/${webhookId}/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteWebhook(workspaceSlug: string, webhookId: string): Promise<void> {
    return this.delete(`/api/workspaces/${workspaceSlug}/webhooks/${webhookId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async regenerateSecretKey(workspaceSlug: string, webhookId: string): Promise<IWebhook> {
    return this.post(`/api/workspaces/${workspaceSlug}/webhooks/${webhookId}/regenerate/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
