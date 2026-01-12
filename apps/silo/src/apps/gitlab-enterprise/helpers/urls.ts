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

import type { E_INTEGRATION_KEYS } from "@plane/types";
import { env } from "@/env";
import { convertIntegrationKeyToProvider } from "@/services/oauth/helpers";

export const getGitlabEntityWebhookURL = (workspaceId: string, glIntegrationKey: E_INTEGRATION_KEYS) => {
  const provider = convertIntegrationKeyToProvider(glIntegrationKey);
  return `${env.SILO_API_BASE_URL}${env.SILO_BASE_PATH}/api/${provider}/webhook/${workspaceId}`;
};

export const getGitlabAuthCallbackURL = (glIntegrationKey: E_INTEGRATION_KEYS) => {
  const provider = convertIntegrationKeyToProvider(glIntegrationKey);
  return encodeURI(env.SILO_API_BASE_URL + env.SILO_BASE_PATH + `/api/oauth/${provider}/auth/callback`);
};

export const getGitlabIssueSyncWebhookURL = (workspaceId: string, glIntegrationKey: E_INTEGRATION_KEYS) => {
  const provider = convertIntegrationKeyToProvider(glIntegrationKey);
  return `${env.SILO_API_BASE_URL}${env.SILO_BASE_PATH}/api/${provider}/webhook/issue-sync/${workspaceId}`;
};
