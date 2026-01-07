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

export enum EApplicationAuthorizationGrantType {
  AUTHORIZATION_CODE = "authorization-code",
  CLIENT_CREDENTIALS = "client-credentials",
}

export const AUTHORIZATION_GRANT_TYPES_MAP = {
  [EApplicationAuthorizationGrantType.AUTHORIZATION_CODE]: "User-Level Connection",
  [EApplicationAuthorizationGrantType.CLIENT_CREDENTIALS]: "Workspace-Level Connection",
};
