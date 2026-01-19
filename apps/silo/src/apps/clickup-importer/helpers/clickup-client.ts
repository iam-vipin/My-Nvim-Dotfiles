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

import { ClickupAPIService } from "@plane/etl/clickup";
import type { TWorkspaceCredential } from "@plane/types";

export const getClickUpClient = (credentials: TWorkspaceCredential): ClickupAPIService => {
  if (!credentials.source_access_token) {
    throw new Error("No access token found");
  }
  return new ClickupAPIService(credentials.source_access_token);
};
