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

import { createGithubService, createGithubUserService } from "@plane/etl/github";
import type { TGithubWorkspaceConnection } from "@plane/types";
import { env } from "@/env";

/**
 * Get the Github service based on if it's an enterprise workspace or not
 * @param workspaceConnection - The workspace connection
 * @param installationId - The installation id
 * @param isEnterprise - Whether the workspace is an enterprise workspace
 * @returns The Github service
 */
export const getGithubService = (
  workspaceConnection: TGithubWorkspaceConnection,
  installationId: string,
  isEnterprise: boolean
) => {
  if (isEnterprise) {
    const appConfig = workspaceConnection.connection_data?.appConfig;
    if (!appConfig) {
      throw new Error("GitHub Enterprise app config not found");
    }
    return createGithubService(appConfig.appId, appConfig.privateKey, installationId, appConfig.baseUrl);
  }
  return createGithubService(env.GITHUB_APP_ID, env.GITHUB_PRIVATE_KEY, installationId);
};

/**
 * Get the Github user service based on if it's an enterprise workspace or not
 * @param workspaceConnection - The workspace connection
 * @param installationId - The installation id
 * @param isEnterprise - Whether the workspace is an enterprise workspace
 * @returns The Github user service
 */
export const getGithubUserService = (
  workspaceConnection: TGithubWorkspaceConnection,
  installationId: string,
  isEnterprise: boolean
) => {
  if (isEnterprise) {
    const appConfig = workspaceConnection.connection_data?.appConfig;
    if (!appConfig) {
      throw new Error("GitHub Enterprise app config not found");
    }
    return createGithubUserService(installationId, appConfig.baseUrl);
  }
  return createGithubUserService(installationId);
};
