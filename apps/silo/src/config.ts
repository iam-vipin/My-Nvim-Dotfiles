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

import type { TIntegrationConfig } from "@plane/types";

// A singleton class that holds the configuration for the app
export class Config {
  private static integrationConfig: TIntegrationConfig = {};

  // Loads the configuration from the server
  static async loadConfig() {
    // Load the integration config from the server
  }
}
