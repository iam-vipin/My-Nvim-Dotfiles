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

import { GithubService } from "./api.service";
import { GithubAuthService, GithubEnterpriseAuthService } from "./auth.service";

export const createGithubAuth = (
  appName: string = "",
  clientId: string = "",
  clientSecret: string = "",
  callbackUrl: string,
  baseGithubUrl?: string,
  isEnterprise?: boolean
): GithubAuthService => {
  if (!appName || !clientId || !clientSecret) {
    console.error("[GITHUB] App name, client ID and client secret are required");
  }

  if (isEnterprise) {
    if (!baseGithubUrl) {
      throw new Error("Base GitHub URL is required for enterprise");
    }
    return new GithubEnterpriseAuthService({
      appName,
      clientId,
      clientSecret,
      callbackUrl,
      baseGithubUrl,
    });
  }
  return new GithubAuthService({
    appName,
    clientId,
    clientSecret,
    callbackUrl,
  });
};

export const createGithubService = (
  GithubAppId: string | undefined,
  GithubPrivateKey: string | undefined,
  installationId: string,
  baseGithubUrl?: string
): GithubService => {
  if (!GithubAppId || !GithubPrivateKey) {
    throw new Error("GithubAppId and GithubPrivateKey are required");
  }
  return new GithubService({
    appId: GithubAppId,
    privateKey: GithubPrivateKey,
    installationId,
    forUser: false,
    baseGithubUrl,
  });
};

export const createGithubUserService = (accessToken: string, baseGithubUrl?: string): GithubService => {
  if (!accessToken) {
    throw new Error("Access token is required");
  }
  return new GithubService({
    accessToken,
    forUser: true,
    baseGithubUrl,
  });
};
