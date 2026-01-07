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

import { createSentryService } from "@plane/etl/sentry";
import { E_INTEGRATION_KEYS } from "@plane/types";
import { env } from "@/env";
import { getConnectionDetails } from "@/helpers/connection-details";
import { getPlaneAPIClient } from "@/helpers/plane-api-client";
import { sentryAuth } from "../auth/auth";
import { getRefreshTokenCallback } from "./auth";

export const getSentryConnectionDetails = async (installationId: string) => {
  const details = await getConnectionDetails(E_INTEGRATION_KEYS.SENTRY, installationId);

  const { credential, workspaceConnection } = details;

  const planeClient = await getPlaneAPIClient(credential, E_INTEGRATION_KEYS.SENTRY);

  const sentryService = createSentryService({
    access_token: credential.source_access_token as string,
    refresh_token: credential.source_refresh_token as string,
    installation_id: installationId,
    refresh_callback: getRefreshTokenCallback(credential.id),
    auth_service: sentryAuth,
    base_url: env.SENTRY_BASE_URL,
  });

  return { planeClient, credential, workspaceConnection, sentryService };
};
