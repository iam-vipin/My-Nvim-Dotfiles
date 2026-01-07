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

import type { SlackTokenRefreshResponse } from "../types";
import { SlackService } from "./api.service";
import { SlackAuthService } from "./auth.service";

export const createSlackAuth = (
  clientId: string = "",
  clientSecret: string = "",
  userRedirectUri: string = "",
  teamRedirectUri: string = ""
): SlackAuthService => {
  if (!clientId || !clientSecret || !userRedirectUri || !teamRedirectUri) {
    console.error("[SLACK] Client Id, Client Secret, User Redirect URI and Team Redirect URI are required");
  }
  return new SlackAuthService({
    clientId,
    clientSecret,
    user_redirect_uri: userRedirectUri,
    team_redirect_uri: teamRedirectUri,
  });
};

export const createSlackService = (
  accessToken: string | undefined,
  refreshToken: string | undefined,
  authService: SlackAuthService | undefined,
  authCallback: (tokenResponse: SlackTokenRefreshResponse) => Promise<void>
): SlackService => {
  if (!accessToken || !refreshToken || !authService || !authCallback) {
    throw new Error("Access token, refreshToken, authService and authCallback are required");
  }
  return new SlackService(accessToken, refreshToken, authService, authCallback);
};
