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

export type SentryAuthConfig = {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  integrationSlug: string;
};

export type SentryAuthState = {
  userId: string;
  workspaceId: string;
  workspaceSlug: string;
  planeAppInstallationId: string;
};

export type SentryAuthTokenResponse = {
  id: string;
  token: string;
  refreshToken: string;
  dateCreated: string;
  expiresAt: string;
  state: null;
  application: null;
};
