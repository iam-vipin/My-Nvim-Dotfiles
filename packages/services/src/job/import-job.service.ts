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
// types
import type { TImportJob } from "@plane/types";
import { APIService } from "../api.service";

export class ImportJobService<TJobConfig = object> extends APIService {
  constructor(BASE_URL?: string) {
    super(BASE_URL || API_BASE_URL);
  }

  async createImportJob(workspaceSlug: string, data: Partial<TImportJob<TJobConfig>>): Promise<TImportJob<TJobConfig>> {
    return this.post(`/api/workspaces/${workspaceSlug}/import-jobs/`, data)
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
        throw error?.response?.data;
      });
  }

  async updateImportJob(
    workspaceSlug: string,
    id: string,
    data: Partial<TImportJob<TJobConfig>>
  ): Promise<TImportJob<TJobConfig>> {
    return this.patch(`/api/workspaces/${workspaceSlug}/import-jobs/${id}`, data)
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
        throw error?.response?.data;
      });
  }

  async getImportJob(workspaceSlug: string, id: string): Promise<TImportJob<TJobConfig>> {
    return this.get(`/api/workspaces/${workspaceSlug}/import-jobs/${id}`)
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
        throw error?.response?.data;
      });
  }

  async listImportJobs(
    workspaceSlug: string,
    params?: { [K in keyof TImportJob<TJobConfig>]?: string | boolean | number }
  ): Promise<TImportJob<TJobConfig>[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/import-jobs/`, { params })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
        throw error?.response?.data;
      });
  }
}
