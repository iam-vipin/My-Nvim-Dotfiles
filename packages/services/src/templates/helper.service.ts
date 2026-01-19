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
import type { TTemplateCategory } from "@plane/types";
// local imports
import { APIService } from "../api.service";

/**
 * Service class for managing template helper functions that are common across all template types
 * @extends {APIService}
 */
export class TemplateHelperService extends APIService {
  constructor(BASE_URL?: string) {
    super(BASE_URL || API_BASE_URL);
  }

  /**
   * @description List all template categories
   * @returns List of template categories
   */
  async listCategories(): Promise<TTemplateCategory[]> {
    return this.get("/api/template-categories/")
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
