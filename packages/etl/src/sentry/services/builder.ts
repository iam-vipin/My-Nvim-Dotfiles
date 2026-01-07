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

import type { SentryAuthConfig } from "../types";
import { SentryApiService } from "./api.service";
import { SentryAuthService } from "./auth.service";

export type SentryServiceConfig = {
  access_token: string;
  refresh_token: string;
  installation_id: string;
  base_url: string;
  auth_service: SentryAuthService;
  refresh_callback: (access_token: string, refresh_token: string) => Promise<void>;
};

/**
 * Creates a SentryAuthService instance with config validation.
 *
 * @param config - Partial Sentry auth configuration
 * @returns SentryAuthService instance or undefined if config is invalid
 */
export const createSentryAuth = (config: Partial<SentryAuthConfig>): SentryAuthService | undefined => {
  if (!config.clientId || !config.clientSecret || !config.integrationSlug || !config.baseUrl) {
    console.error("[SENTRY] Client Id, Client Secret, and integration slug are required");
    return;
  }
  return new SentryAuthService(config as SentryAuthConfig);
};

/**
 * Creates a SentryApiService instance with config validation.
 *
 * @param config - Partial Sentry service configuration
 * @returns SentryApiService instance or undefined if config is invalid
 */
export const createSentryService = (config: Partial<SentryServiceConfig>): SentryApiService | undefined => {
  if (
    !config.access_token ||
    !config.refresh_token ||
    !config.installation_id ||
    !config.auth_service ||
    !config.refresh_callback
  ) {
    console.error("[SENTRY] Cannot create service, config invalid");
    return;
  }

  return new SentryApiService(config as SentryServiceConfig);
};
