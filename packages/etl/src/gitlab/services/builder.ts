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

import { GitLabService } from "./api.service";
import { GitLabAuthService } from "./auth.service";

export const createGitLabAuth = (props: {
  baseUrl?: string;
  clientId: string | undefined;
  clientSecret: string | undefined;
  redirectUri: string;
}): GitLabAuthService => {
  const { baseUrl, clientId, clientSecret, redirectUri } = props;
  if (!clientId || !clientSecret) {
    console.error("[GITLAB] Client ID and client secret are required");
  }
  return new GitLabAuthService({
    baseUrl,
    clientId: clientId ?? "",
    clientSecret: clientSecret ?? "",
    redirectUri,
  });
};

export const createGitLabService = (
  access_token: string,
  refresh_token: string,
  refresh_callback: (access_token: string, refresh_token: string) => Promise<void>,
  baseUrl: string = "https://gitlab.com",
  clientId?: string,
  clientSecret?: string
): GitLabService => new GitLabService(access_token, refresh_token, refresh_callback, baseUrl, clientId, clientSecret);
