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
import { APIService } from "../api.service";

export class CycleOperationsService extends APIService {
  constructor(BASE_URL?: string) {
    super(BASE_URL || API_BASE_URL);
  }

  /**
   * Adds a cycle to user favorites.
   * @param {string} workspaceSlug - The workspace identifier
   * @param {string} projectId - The project identifier
   * @param {{cycle: string}} data - The favorite cycle data
   * @returns {Promise<any>} The response data
   * @throws {Error} If the request fails
   */
  async addToFavorites(
    workspaceSlug: string,
    projectId: string,
    data: {
      cycle: string;
    }
  ): Promise<any> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/user-favorite-cycles/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Removes a cycle from user favorites.
   * @param {string} workspaceSlug - The workspace identifier
   * @param {string} projectId - The project identifier
   * @param {string} cycleId - The cycle identifier
   * @returns {Promise<any>} The removal response
   * @throws {Error} If the request fails
   */
  async removeFromFavorites(workspaceSlug: string, projectId: string, cycleId: string): Promise<any> {
    return this.delete(`/api/workspaces/${workspaceSlug}/projects/${projectId}/user-favorite-cycles/${cycleId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Transfers issues between cycles.
   * @param {string} workspaceSlug - The workspace identifier
   * @param {string} projectId - The project identifier
   * @param {string} cycleId - The source cycle identifier
   * @param {{new_cycle_id: string}} data - The target cycle data
   * @returns {Promise<any>} The transfer response
   * @throws {Error} If the request fails
   */
  async transferIssues(
    workspaceSlug: string,
    projectId: string,
    cycleId: string,
    data: {
      new_cycle_id: string;
    }
  ): Promise<any> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/transfer-issues/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
