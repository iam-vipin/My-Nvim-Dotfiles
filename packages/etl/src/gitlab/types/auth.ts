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

export type GitLabAuthConfig = {
  baseUrl?: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export type GitLabAuthorizeState = {
  user_id: string;
  workspace_slug: string;
  workspace_id: string;
  plane_api_token?: string;
  gitlab_hostname?: string;
  source_hostname?: string; // generic field for oauth controller migration
  target_host: string;
  plane_app_installation_id?: string;
  config_key?: string;
};

export type GitLabAuthPayload = {
  code: string;
  state: string;
};

export type GitlabPlaneOAuthState = {
  gitlab_code: string;
  encoded_gitlab_state: string;
};

export type GitLabTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  created_at: number;
};
