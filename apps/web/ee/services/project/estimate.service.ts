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

/* eslint-disable no-useless-catch */

// types
import type { IEstimate, IEstimateFormData, IEstimatePoint } from "@plane/types";
// ce services
import { EstimateService as CeEstimateService } from "@/ce/services/project/estimate.service";

export class EstimateService extends CeEstimateService {
  constructor() {
    super();
  }

  async updateEstimate(
    workspaceSlug: string,
    projectId: string,
    estimateId: string,
    payload: Partial<IEstimateFormData>
  ): Promise<IEstimate | undefined> {
    try {
      const { data } = await this.patch(
        `/api/workspaces/${workspaceSlug}/projects/${projectId}/estimates/${estimateId}/`,
        payload
      );
      return data || undefined;
    } catch (error) {
      throw error;
    }
  }

  async removeEstimatePoint(
    workspaceSlug: string,
    projectId: string,
    estimateId: string,
    estimatePointId: string,
    params?: { new_estimate_id: string | undefined }
  ): Promise<IEstimatePoint[] | undefined> {
    return this.delete(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/estimates/${estimateId}/estimate-points/${estimatePointId}/`,
      params
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

const estimateService = new EstimateService();

export default estimateService;
