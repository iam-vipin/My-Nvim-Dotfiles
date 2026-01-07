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
import type { TImportReport } from "@plane/types";
import { APIService } from "../api.service";
// types

export class ImportReportService extends APIService {
  constructor(BASE_URL?: string) {
    super(BASE_URL || API_BASE_URL);
  }

  async updateImportReport(workspaceSlug: string, id: string, data: Partial<TImportReport>): Promise<TImportReport> {
    return this.patch(`/api/workspaces/${workspaceSlug}/import-reports/${id}`, data)
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
        throw error?.response?.data;
      });
  }

  async getImportReport(workspaceSlug: string, id: string): Promise<TImportReport> {
    return this.get(`/api/workspaces/${workspaceSlug}/import-reports/${id}`)
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
        throw error?.response?.data;
      });
  }

  async listImportReports(
    workspaceSlug: string,
    params?: Partial<Record<keyof TImportReport, string | boolean | number>>
  ): Promise<TImportReport[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/import-reports/`, { params })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
        throw error?.response?.data;
      });
  }
}
