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
import type { TImportReport } from "@plane/types";
import { removeUndefinedFromObject } from "@/helpers/generic-helpers";
import { APIService } from "@/services/api.service";
// types
import type { ClientOptions } from "@/types";

export class ImportReportAPIService extends APIService {
  constructor(options: ClientOptions) {
    super(options);
  }

  async updateImportReport(id: string, data: Partial<TImportReport>): Promise<TImportReport> {
    data = removeUndefinedFromObject(data);
    return this.patch(`/api/v1/import-reports/${id}/`, data)
      .then((response) => response.data)
      .catch((error) => {
        logger.error(error);
        throw error?.response?.data;
      });
  }

  async getImportReport(id: string): Promise<TImportReport> {
    return this.get(`/api/v1/import-reports/${id}/`)
      .then((response) => response.data)
      .catch((error) => {
        logger.error(error);
        throw error?.response?.data;
      });
  }

  async listImportReports(
    params?: Partial<Record<keyof TImportReport, string | boolean | number>>
  ): Promise<TImportReport[]> {
    params = removeUndefinedFromObject(params);
    return this.get(`/api/v1/import-reports/`, { params: params })
      .then((response) => response.data)
      .catch((error) => {
        logger.error(error);
        throw error?.response?.data;
      });
  }

  /**
   * Update the import report count
   * @param id - The id of the import report
   * @param data - The data to increment/decrement the import report count with
   * @returns The updated import report count
   */
  async incrementImportReportCount(id: string, data: Partial<TImportReport>): Promise<TImportReport> {
    return this.post(`/api/v1/import-reports/${id}/count-increment/`, data)
      .then((response) => response.data)
      .catch((error) => {
        logger.error(error);
        throw error?.response?.data;
      });
  }
}
