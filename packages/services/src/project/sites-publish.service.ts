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

// plane imports
import { API_BASE_URL } from "@plane/constants";
import type { TProjectPublishSettings } from "@plane/types";
// api service
import { APIService } from "../api.service";

/**
 * Service class for managing project publish operations within plane sites application.
 * Extends APIService to handle HTTP requests to the project publish-related endpoints.
 * @extends {APIService}
 * @remarks This service is only available for plane sites
 */
export class SitesProjectPublishService extends APIService {
  constructor(BASE_URL?: string) {
    super(BASE_URL || API_BASE_URL);
  }

  /**
   * Retrieves publish settings for a specific anchor.
   * @param {string} anchor - The anchor identifier
   * @returns {Promise<TProjectPublishSettings>} The publish settings
   * @throws {Error} If the API request fails
   */
  async retrieveSettingsByAnchor(anchor: string): Promise<TProjectPublishSettings> {
    return this.get(`/api/public/anchor/${anchor}/settings/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  /**
   * Retrieves publish settings for a specific project.
   * @param {string} workspaceSlug - The workspace slug
   * @param {string} projectID - The project identifier
   * @returns {Promise<TProjectPublishSettings>} The publish settings
   * @throws {Error} If the API request fails
   */
  async retrieveSettingsByProjectId(workspaceSlug: string, projectID: string): Promise<TProjectPublishSettings> {
    return this.get(`/api/public/workspaces/${workspaceSlug}/projects/${projectID}/anchor/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }
}
