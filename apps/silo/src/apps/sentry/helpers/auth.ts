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

import { integrationConnectionHelper } from "@/helpers/integration-connection-helper";

export const getRefreshTokenCallback =
  (credential_id: string) => async (access_token: string, refresh_token: string) => {
    await integrationConnectionHelper.updateWorkspaceCredential({
      credential_id,
      source_access_token: access_token,
      source_refresh_token: refresh_token,
    });
  };
