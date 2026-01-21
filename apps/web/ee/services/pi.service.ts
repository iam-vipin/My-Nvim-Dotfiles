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
import { PI_URL } from "@plane/constants";
import type { TDuplicateIssuePayload, TDuplicateIssueResponse } from "@plane/types";
// services
import { APIService } from "@/services/api.service";
import type { TFeatureFlagsResponse } from "./feature-flag.service";

export class PIService extends APIService {
  constructor() {
    super(PI_URL);
  }

  async getDuplicateIssues(data: Partial<TDuplicateIssuePayload>): Promise<TDuplicateIssueResponse> {
    return this.post(`/api/v1/dupes/issues/`, data)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async getPiFeatureFlag(workspaceSlug: string): Promise<TFeatureFlagsResponse> {
    return this.get(`/api/v1/flags/`, { params: { workspace_slug: workspaceSlug } })
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }
}
