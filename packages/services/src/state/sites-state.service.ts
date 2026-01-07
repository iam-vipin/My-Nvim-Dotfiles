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
import type { IState } from "@plane/types";
// api service
import { APIService } from "../api.service";

/**
 * Service class for managing states within plane sites application.
 * Extends APIService to handle HTTP requests to the state-related endpoints.
 * @extends {APIService}
 * @remarks This service is only available for plane sites
 */
export class SitesStateService extends APIService {
  constructor(BASE_URL?: string) {
    super(BASE_URL || API_BASE_URL);
  }

  /**
   * Retrieves a list of states for a specific anchor.
   * @param {string} anchor - The anchor identifier
   * @returns {Promise<IState[]>} The list of states
   * @throws {Error} If the API request fails
   */
  async list(anchor: string): Promise<IState[]> {
    return this.get(`/api/public/anchor/${anchor}/states/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
