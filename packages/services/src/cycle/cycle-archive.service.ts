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
import type { ICycle } from "@plane/types";
import { APIService } from "../api.service";

/**
 * Service class for managing archived cycles in a project
 * Provides methods for retrieving, archiving, and restoring project cycles
 * @extends {APIService}
 */
export class CycleArchiveService extends APIService {
  constructor(BASE_URL?: string) {
    super(BASE_URL || API_BASE_URL);
  }

  /**
   * Retrieves all archived cycles for a specific project
   * @param {string} workspaceSlug - The unique identifier for the workspace
   * @param {string} projectId - The unique identifier for the project
   * @returns {Promise<ICycle[]>} Array of archived cycles
   * @throws {Error} Throws response data if the request fails
   */
  async list(workspaceSlug: string, projectId: string): Promise<ICycle[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/archived-cycles/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Retrieves details of a specific archived cycle
   * @param {string} workspaceSlug - The unique identifier for the workspace
   * @param {string} projectId - The unique identifier for the project
   * @param {string} cycleId - The unique identifier for the cycle
   * @returns {Promise<ICycle>} Details of the archived cycle
   * @throws {Error} Throws response data if the request fails
   */
  async retrieve(workspaceSlug: string, projectId: string, cycleId: string): Promise<ICycle> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/archived-cycles/${cycleId}/`)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  /**
   * Archives a specific cycle in a project
   * @param {string} workspaceSlug - The unique identifier for the workspace
   * @param {string} projectId - The unique identifier for the project
   * @param {string} cycleId - The unique identifier for the cycle to archive
   * @returns {Promise<{archived_at: string}>} Object containing the archive timestamp
   * @throws {Error} Throws response data if the request fails
   */
  async archive(
    workspaceSlug: string,
    projectId: string,
    cycleId: string
  ): Promise<{
    archived_at: string;
  }> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/archive/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Restores a previously archived cycle
   * @param {string} workspaceSlug - The unique identifier for the workspace
   * @param {string} projectId - The unique identifier for the project
   * @param {string} cycleId - The unique identifier for the cycle to restore
   * @returns {Promise<void>} Resolves when the cycle is successfully restored
   * @throws {Error} Throws response data if the request fails
   */
  async restore(workspaceSlug: string, projectId: string, cycleId: string): Promise<void> {
    return this.delete(`/api/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/archive/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
