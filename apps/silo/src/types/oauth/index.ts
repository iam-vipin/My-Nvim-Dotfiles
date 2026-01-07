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

export enum EOAuthGrantType {
  AUTHORIZATION_CODE = "authorization_code",
  CLIENT_CREDENTIALS = "client_credentials",
  REFRESH_TOKEN = "refresh_token",
}

export type PlaneOAuthTokenOptions = {
  client_id: string;
  client_secret: string;
  redirect_uri?: string;
  code?: string;
  code_verifier?: string;
  grant_type?: EOAuthGrantType;
  app_installation_id?: string;
  user_id?: string;
};

export type PlaneOAuthTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token: string;
};

export enum ESourceAuthorizationType {
  TOKEN = "token",
  OAUTH = "oauth",
}

export type PlaneOAuthAppInstallation = {
  id: string;
  workspace_detail: {
    name: string;
    slug: string;
    id: string;
    logo_url: string | null;
  };
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  status: string;
  created_by: string | null;
  updated_by: string | null;
  workspace: string;
  application: string;
  installed_by: string;
  app_bot: string;
};
