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

// services
import { API_BASE_URL } from "@plane/constants";
import { APIService } from "@/services/api.service";
// helper
// types
// FIXME:
// import { TAppConfig } from "@plane/types";

export class AppConfigService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async envConfig(): Promise<any> {
    return this.get("/api/configs/", {
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
