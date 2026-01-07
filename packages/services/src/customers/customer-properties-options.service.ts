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

// helpers
import { API_BASE_URL } from "@plane/constants";
// types
import type {
  IIssuePropertyOptionsService,
  TCreateIssuePropertyOptionPayload,
  TDeleteIssuePropertyOptionPayload,
  TFetchIssuePropertyOptionsPayload,
  TIssuePropertyOption,
  TIssuePropertyOptionsPayload,
} from "@plane/types";
// services
import { APIService } from "../api.service";

export class CustomerPropertiesOptionsService extends APIService implements IIssuePropertyOptionsService {
  constructor() {
    super(API_BASE_URL);
  }

  /**
   * Fetch customer properties dropdown options
   * @param workspaceSlug
   * @returns
   */
  async fetchAll({ workspaceSlug }: TFetchIssuePropertyOptionsPayload): Promise<TIssuePropertyOptionsPayload> {
    return this.get(`/api/workspaces/${workspaceSlug}/customer-property-options/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Create customer property options
   * @param workspaceSlug
   * @param customPropertyId
   * @param data
   * @returns IssuePropertyOption
   */
  async create({
    workspaceSlug,
    customPropertyId,
    data,
  }: TCreateIssuePropertyOptionPayload): Promise<TIssuePropertyOption> {
    return this.post(`/api/workspaces/${workspaceSlug}/customer-properties/${customPropertyId}/options/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Delete customer property options
   * @param workspaceSlug
   * @param customPropertyId
   * @param issuePropertyOptionId
   */
  async deleteOption({
    workspaceSlug,
    customPropertyId,
    issuePropertyOptionId,
  }: TDeleteIssuePropertyOptionPayload): Promise<void> {
    return this.delete(
      `/api/workspaces/${workspaceSlug}/customer-properties/${customPropertyId}/options/${issuePropertyOptionId}/`
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
