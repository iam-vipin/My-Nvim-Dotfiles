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
import type { E_FEATURE_FLAGS } from "@plane/constants";
import { API_BASE_URL } from "@plane/constants";
// local imports
import { APIService } from "../api.service";

export class SitesFeatureFlagService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async retrieve(anchor: string, flag: keyof typeof E_FEATURE_FLAGS): Promise<{ value: boolean }> {
    return this.get(`/api/public/anchor/${anchor}/flags/`, {
      params: {
        flag_key: flag,
      },
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
