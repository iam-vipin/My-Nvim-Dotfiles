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
// api service
import type { TPublicModule } from "@plane/types";
import { APIService } from "../api.service";

/**
 * Service class for managing modules within plane sites application.
 * Extends APIService to handle HTTP requests to the module-related endpoints.
 * @extends {APIService}
 * @remarks This service is only available for plane sites
 */
export class SitesModuleService extends APIService {
  constructor(BASE_URL?: string) {
    super(BASE_URL || API_BASE_URL);
  }

  /**
   * Retrieves a list of modules for a specific anchor.
   * @param {string} anchor - The anchor identifier
   * @returns {Promise<TPublicModule[]>} The list of modules
   * @throws {Error} If the API request fails
   */
  async list(anchor: string): Promise<TPublicModule[]> {
    return this.get(`/api/public/anchor/${anchor}/modules/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
